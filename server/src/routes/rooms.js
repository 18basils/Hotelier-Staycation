import express from 'express';
import { categoriesCol, roomsCol, reservationsCol } from '../firestore.js';

const router = express.Router();

// Get all room categories (for filtering / admin room creation)
router.get('/categories', async (req, res) => {
  try {
    const categoriesSnap = await categoriesCol.get();
    const categories = categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get rooms for a hotel with dynamic date-availability and AC/beds filtering
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, ac, beds } = req.query;

    let query = roomsCol.where('hotel_id', '==', hotelId).where('status', '==', 'available');

    if (ac && (ac === 'ac' || ac === 'nonac')) {
      query = query.where('ac', '==', ac);
    }

    if (beds && Number(beds) > 0) {
      query = query.where('beds', '==', Number(beds));
    }

    const roomsSnap = await query.get();
    let rooms = roomsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // If dates are provided, check booking overlap
    if (checkIn && checkOut) {
      // Find active reservations for this hotel
      const resSnap = await reservationsCol
        .where('hotel_id', '==', hotelId)
        .where('status', '==', 'CONFIRMED')
        .get();

      const bookedRoomIds = new Set();
      resSnap.forEach((doc) => {
        const res = doc.data();
        // Check date overlap: reservation check_in < checkOut && reservation check_out > checkIn
        if (res.check_in < checkOut && res.check_out > checkIn) {
          bookedRoomIds.add(res.room_id);
        }
      });

      rooms = rooms.map((room) => ({
        ...room,
        is_available: !bookedRoomIds.has(room.id)
      }));
    } else {
      rooms = rooms.map((room) => ({
        ...room,
        is_available: true
      }));
    }

    // Sort by price ascending, then room number
    rooms.sort((a, b) => {
      if (a.price_per_night !== b.price_per_night) {
        return a.price_per_night - b.price_per_night;
      }
      return a.room_number.localeCompare(b.room_number);
    });

    res.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

export default router;
