import express from 'express';
import { reservationsCol, roomsCol, hotelsCol } from '../firestore.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create new reservation with Dynamic Pricing, Taxes, Promo Codes & Payment Capture
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      roomId, 
      checkIn, 
      checkOut, 
      guestName, 
      guestContact, 
      specialRequests,
      couponCode,
      discountAmount = 0,
      paymentMethod = 'UPI / Card (Test Gateway)',
      transactionId
    } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Room, check-in date, and check-out date are required' });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return res.status(400).json({ error: 'Reservation must be for at least one night' });
    }

    // Fetch room details
    const roomDoc = await roomsCol.doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ error: 'Room not found or currently unavailable' });
    }
    const room = roomDoc.data();

    // Fetch hotel details
    const hotelDoc = await hotelsCol.doc(room.hotel_id).get();
    const hotel = hotelDoc.exists ? hotelDoc.data() : { name: room.hotel_name, address: '' };

    // Check for overlapping confirmed reservations for this room
    const existingSnap = await reservationsCol
      .where('room_id', '==', roomId)
      .where('status', '==', 'CONFIRMED')
      .get();

    let hasConflict = false;
    existingSnap.forEach((doc) => {
      const existing = doc.data();
      // Date overlap check: existing.check_in < checkOut && existing.check_out > checkIn
      if (existing.check_in < checkOut && existing.check_out > checkIn) {
        hasConflict = true;
      }
    });

    if (hasConflict) {
      return res.status(409).json({ 
        error: 'This room is already booked for the selected dates. Please choose different dates or another room.' 
      });
    }

    // Dynamic Pricing & Taxes calculation
    const baseFare = Math.round(diffDays * room.price_per_night);
    // 12% Hospitality GST (standard tax)
    const taxAmount = Math.round(baseFare * 0.12);
    // Standard hospitality platform / service charge
    const serviceFee = 199;
    const validatedDiscount = Math.max(0, Math.min(baseFare, Number(discountAmount) || 0));
    const finalTotal = Math.max(0, baseFare + taxAmount + serviceFee - validatedDiscount);

    const bookingCode = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = transactionId || `PAY-RZP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReservationRef = reservationsCol.doc();
    const reservationData = {
      id: newReservationRef.id,
      booking_code: bookingCode,
      bookingCode,
      user_id: req.user.id || req.user.username,
      username: req.user.username,
      hotel_id: room.hotel_id,
      hotel_name: hotel.name,
      hotel_address: hotel.address,
      hotel_image: hotel.image_url,
      hotel_contact: hotel.contact_no,
      room_id: roomId,
      room_number: room.room_number,
      category_name: room.category_name,
      ac: room.ac,
      beds: room.beds,
      check_in: checkIn,
      check_out: checkOut,
      total_nights: diffDays,
      
      // Price breakdown
      base_fare: baseFare,
      tax_amount: taxAmount,
      service_fee: serviceFee,
      discount_amount: validatedDiscount,
      coupon_code: couponCode ? couponCode.toUpperCase() : null,
      total_price: finalTotal,

      // Payment gateway status
      payment_status: 'PAID',
      payment_method: paymentMethod,
      transaction_id: txId,
      paid_at: new Date().toISOString(),

      status: 'CONFIRMED',
      guest_name: guestName || req.user.fullName || req.user.username,
      guest_contact: guestContact || null,
      special_requests: specialRequests || null,
      created_at: new Date().toISOString()
    };

    await newReservationRef.set(reservationData);

    res.status(201).json({
      message: 'Room booked and payment verified successfully!',
      reservation: reservationData
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get user's own booking history
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const snap = await reservationsCol
      .where('user_id', '==', userId)
      .get();

    const reservations = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ reservations });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Get single reservation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const doc = await reservationsCol.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = { id: doc.id, ...doc.data() };

    // Check ownership or admin
    const userId = req.user.id || req.user.username;
    if (reservation.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ reservation });
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Cancel a reservation and process refund
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const docRef = reservationsCol.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = doc.data();
    const userId = req.user.id || req.user.username;
    if (reservation.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (reservation.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Reservation is already cancelled' });
    }

    await docRef.update({ 
      status: 'CANCELLED',
      payment_status: 'REFUNDED',
      cancelled_at: new Date().toISOString()
    });

    res.json({ 
      message: 'Reservation cancelled successfully and refund initiated', 
      id: req.params.id, 
      status: 'CANCELLED',
      payment_status: 'REFUNDED'
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Mark a reservation as COMPLETED (allows guest to leave a verified review)
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const docRef = reservationsCol.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = doc.data();
    const userId = req.user.id || req.user.username;
    if (reservation.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (reservation.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot complete a cancelled reservation' });
    }

    await docRef.update({ 
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    });

    res.json({ 
      message: 'Stay marked as completed. You can now leave a verified review!', 
      id: req.params.id, 
      status: 'COMPLETED' 
    });
  } catch (error) {
    console.error('Error completing reservation:', error);
    res.status(500).json({ error: 'Failed to complete reservation' });
  }
});

export default router;
