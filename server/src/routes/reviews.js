import express from 'express';
import { reviewsCol, reservationsCol, hotelsCol } from '../firestore.js';
import { authenticateToken } from '../middleware/auth.js';
import { sensitiveActionLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validator.js';
import { reviewSchema } from '../schemas/index.js';

const router = express.Router();

// Apply rate limiting across review endpoints
router.use(sensitiveActionLimiter);

// Get reviews for a specific hotel with aggregated rating stats
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;

    const snap = await reviewsCol
      .where('hotel_id', '==', hotelId)
      .get();

    const reviews = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const totalReviews = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
      ratingSum += Number(r.rating) || 5;
    });

    const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : null;

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: averageRating ? parseFloat(averageRating) : null,
        distribution
      }
    });
  } catch (error) {
    console.error('Error fetching hotel reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Check if current user is eligible to review a hotel
router.get('/check-eligible/:hotelId', authenticateToken, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const userId = req.user.id || req.user.username;

    // Find user's reservations for this hotel (CONFIRMED or COMPLETED)
    const resSnap = await reservationsCol
      .where('user_id', '==', userId)
      .where('hotel_id', '==', hotelId)
      .get();

    if (resSnap.empty) {
      return res.json({ eligible: false, reason: 'No bookings found for this hotel.' });
    }

    const validBookings = resSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');

    if (validBookings.length === 0) {
      return res.json({ eligible: false, reason: 'Only completed or confirmed stays can be reviewed.' });
    }

    // Check which bookings haven't been reviewed yet
    const reviewedSnap = await reviewsCol
      .where('user_id', '==', userId)
      .where('hotel_id', '==', hotelId)
      .get();

    const reviewedReservationIds = new Set(reviewedSnap.docs.map((d) => d.data().reservation_id));

    const unreviewedBooking = validBookings.find((b) => !reviewedReservationIds.has(b.id));

    if (!unreviewedBooking) {
      return res.json({ 
        eligible: false, 
        reason: 'You have already reviewed all your stays at this hotel. Thank you!' 
      });
    }

    res.json({
      eligible: true,
      reservationId: unreviewedBooking.id,
      bookingCode: unreviewedBooking.booking_code
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ error: 'Failed to check review eligibility' });
  }
});

// Submit a new verified review
router.post('/', authenticateToken, validateBody(reviewSchema), async (req, res) => {
  try {
    const { hotelId, reservationId, rating, comment } = req.body;
    const userId = req.user.id || req.user.username;

    if (!hotelId || !rating || !comment) {
      return res.status(400).json({ error: 'Hotel ID, rating (1-5), and review comment are required' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    if (comment.trim().length < 5) {
      return res.status(400).json({ error: 'Review comment must be at least 5 characters long' });
    }

    // Verify hotel exists
    const hotelDoc = await hotelsCol.doc(hotelId).get();
    if (!hotelDoc.exists) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Verify reservation belongs to user
    let verifiedReservationId = reservationId;
    if (!verifiedReservationId) {
      // Find an eligible reservation automatically
      const resSnap = await reservationsCol
        .where('user_id', '==', userId)
        .where('hotel_id', '==', hotelId)
        .get();

      const candidate = resSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .find((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');

      if (!candidate) {
        return res.status(403).json({ error: 'Verified stay required to leave a review' });
      }
      verifiedReservationId = candidate.id;
    } else {
      const resDoc = await reservationsCol.doc(verifiedReservationId).get();
      if (!resDoc.exists || resDoc.data().user_id !== userId) {
        return res.status(403).json({ error: 'Reservation does not match your account' });
      }
    }

    // Check if already reviewed for this reservation
    const duplicateSnap = await reviewsCol
      .where('reservation_id', '==', verifiedReservationId)
      .limit(1)
      .get();

    if (!duplicateSnap.empty) {
      return res.status(409).json({ error: 'You have already submitted a review for this stay' });
    }

    const newReviewRef = reviewsCol.doc();
    const reviewData = {
      id: newReviewRef.id,
      hotel_id: hotelId,
      reservation_id: verifiedReservationId,
      user_id: userId,
      username: req.user.username,
      user_full_name: req.user.fullName || req.user.username,
      rating: Math.round(numRating),
      comment: comment.trim(),
      verified: true,
      created_at: new Date().toISOString()
    };

    await newReviewRef.set(reviewData);

    // Recalculate and update hotel aggregate rating
    const allReviewsSnap = await reviewsCol.where('hotel_id', '==', hotelId).get();
    const count = allReviewsSnap.size;
    let sum = 0;
    allReviewsSnap.forEach((d) => {
      sum += Number(d.data().rating) || 5;
    });
    const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : numRating;

    await hotelsCol.doc(hotelId).update({
      average_rating: avg,
      review_count: count
    });

    res.status(201).json({
      message: 'Verified review submitted successfully!',
      review: reviewData,
      newAverageRating: avg,
      newReviewCount: count
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
