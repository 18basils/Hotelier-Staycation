import express from 'express';
import { hotelsCol, roomsCol, reservationsCol, placesCol } from '../firestore.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { sensitiveActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Require rate limiting, authentication, and admin role for all routes in this file
router.use(sensitiveActionLimiter, authenticateToken, requireAdmin);

// Dashboard overview statistics
router.get('/stats', async (req, res) => {
  try {
    const hotelsSnap = await hotelsCol.get();
    const roomsSnap = await roomsCol.get();
    const resSnap = await reservationsCol.get();

    const allBookings = resSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const confirmedBookings = allBookings.filter((b) => b.status === 'CONFIRMED');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    const recentBookings = allBookings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);

    res.json({
      stats: {
        totalHotels: hotelsSnap.size,
        totalRooms: roomsSnap.size,
        totalBookings: confirmedBookings.length,
        totalRevenue,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Add new hotel
router.post('/hotels', async (req, res) => {
  try {
    const { placeId, name, address, starRating, contactNo, description, imageUrl, featured } = req.body;

    if (!placeId || !name || !address || !starRating || !contactNo) {
      return res.status(400).json({ error: 'Place, name, address, star rating, and contact are required' });
    }

    const rating = Number(starRating);
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Star rating must be between 1 and 5' });
    }

    // Lookup place name
    const placeDoc = await placesCol.doc(placeId).get();
    const placeName = placeDoc.exists ? placeDoc.data().name : placeId;
    const placeState = placeDoc.exists ? placeDoc.data().state : 'Kerala';

    const hotelRef = hotelsCol.doc();
    const newHotel = {
      id: hotelRef.id,
      place_id: placeId,
      place_name: placeName,
      place_state: placeState,
      name: name.trim(),
      address: address.trim(),
      star_rating: rating,
      contact_no: contactNo.trim(),
      description: description ? description.trim() : null,
      image_url: imageUrl ? imageUrl.trim() : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      featured: !!featured,
      min_price: 2500,
      created_at: new Date().toISOString()
    };

    await hotelRef.set(newHotel);

    res.status(201).json({
      message: 'Hotel created successfully',
      hotelId: hotelRef.id
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
});

// Update existing hotel
router.put('/hotels/:id', async (req, res) => {
  try {
    const { placeId, name, address, starRating, contactNo, description, imageUrl, featured } = req.body;
    const hotelRef = hotelsCol.doc(req.params.id);

    const updatePayload = {
      name: name.trim(),
      address: address.trim(),
      star_rating: Number(starRating),
      contact_no: contactNo.trim(),
      featured: !!featured
    };

    if (placeId) updatePayload.place_id = placeId;
    if (description !== undefined) updatePayload.description = description;
    if (imageUrl !== undefined) updatePayload.image_url = imageUrl;

    await hotelRef.update(updatePayload);

    res.json({ message: 'Hotel updated successfully' });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

// Delete hotel
router.delete('/hotels/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;
    await hotelsCol.doc(hotelId).delete();

    // Delete associated rooms
    const roomsSnap = await roomsCol.where('hotel_id', '==', hotelId).get();
    const batch = roomsSnap.docs.map((doc) => doc.ref.delete());
    await Promise.all(batch);

    res.json({ message: 'Hotel and associated rooms deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

// Add room to hotel (implements missing admin2 feature)
router.post('/rooms', async (req, res) => {
  try {
    const { hotelId, categoryId, roomNumber, pricePerNight } = req.body;

    if (!hotelId || !categoryId || !roomNumber || !pricePerNight) {
      return res.status(400).json({ error: 'Hotel, category, room number, and price are required' });
    }

    const price = Number(pricePerNight);
    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than zero' });
    }

    // Check if room number already exists for this hotel
    const existsSnap = await roomsCol
      .where('hotel_id', '==', hotelId)
      .where('room_number', '==', roomNumber.trim())
      .limit(1)
      .get();

    if (!existsSnap.empty) {
      return res.status(409).json({ error: `Room ${roomNumber} already exists in this hotel` });
    }

    // Get hotel name
    const hotelDoc = await hotelsCol.doc(hotelId).get();
    const hotelName = hotelDoc.exists ? hotelDoc.data().name : '';

    const newRoomRef = roomsCol.doc(`${hotelId}-${roomNumber.trim()}`);
    const newRoom = {
      id: newRoomRef.id,
      hotel_id: hotelId,
      hotel_name: hotelName,
      category_id: categoryId,
      category_name: categoryId === 'deluxe-ac' ? 'Deluxe AC Room' : categoryId === 'exec-suite' ? 'Executive Suite AC' : 'Standard Room',
      room_number: roomNumber.trim(),
      price_per_night: price,
      status: 'available',
      created_at: new Date().toISOString()
    };

    await newRoomRef.set(newRoom);

    // Update min_price on hotel if this room is cheaper
    if (hotelDoc.exists) {
      const currentMin = hotelDoc.data().min_price || Infinity;
      if (price < currentMin) {
        await hotelsCol.doc(hotelId).update({ min_price: price });
      }
    }

    res.status(201).json({
      message: 'Room added successfully',
      roomId: newRoomRef.id
    });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ error: 'Failed to add room' });
  }
});

// View all reservations across the system
router.get('/reservations', async (req, res) => {
  try {
    const snap = await reservationsCol.get();
    const reservations = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ reservations });
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Update reservation status (Confirm, Complete, Cancel)
router.patch('/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid reservation status' });
    }

    await reservationsCol.doc(req.params.id).update({ status });

    res.json({ message: 'Reservation status updated successfully', status });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
});

export default router;
