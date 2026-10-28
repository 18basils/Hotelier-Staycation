import express from 'express';
import { placesCol, hotelsCol, roomsCol, categoriesCol } from '../firestore.js';

const router = express.Router();

// Get all places / destinations with hotel counts
router.get('/places', async (req, res) => {
  try {
    const placesSnap = await placesCol.get();
    const hotelsSnap = await hotelsCol.get();

    // Map hotel count per place
    const hotelCounts = {};
    hotelsSnap.forEach((doc) => {
      const data = doc.data();
      const pId = data.place_id;
      if (pId) {
        hotelCounts[pId] = (hotelCounts[pId] || 0) + 1;
      }
    });

    const places = placesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        hotel_count: hotelCounts[doc.id] || 0
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    res.json({ places });
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Get all hotels with search & filters
router.get('/', async (req, res) => {
  try {
    const { placeId, search, minRating, maxPrice } = req.query;

    let query = hotelsCol;

    if (placeId) {
      query = query.where('place_id', '==', placeId);
    }

    if (minRating) {
      query = query.where('star_rating', '>=', Number(minRating));
    }

    const hotelsSnap = await query.get();
    let hotels = hotelsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // In-memory keyword search across name, address, place_name
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      hotels = hotels.filter((h) => 
        (h.name && h.name.toLowerCase().includes(term)) ||
        (h.address && h.address.toLowerCase().includes(term)) ||
        (h.place_name && h.place_name.toLowerCase().includes(term))
      );
    }

    // In-memory max price filter
    if (maxPrice) {
      const max = Number(maxPrice);
      hotels = hotels.filter((h) => (h.min_price || 0) <= max);
    }

    // Sort: featured first, then star rating descending, then name
    hotels.sort((a, b) => {
      if (b.featured !== a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (b.star_rating !== a.star_rating) return b.star_rating - a.star_rating;
      return a.name.localeCompare(b.name);
    });

    res.json({ hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Get single hotel by ID with details and category previews
router.get('/:id', async (req, res) => {
  try {
    const hotelDoc = await hotelsCol.doc(req.params.id).get();

    if (!hotelDoc.exists) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotel = { id: hotelDoc.id, ...hotelDoc.data() };

    // Get categories available in this hotel
    const roomsSnap = await roomsCol
      .where('hotel_id', '==', req.params.id)
      .where('status', '==', 'available')
      .get();

    const categoryMap = {};
    roomsSnap.forEach((doc) => {
      const room = doc.data();
      const catId = room.category_id;
      if (!categoryMap[catId] || room.price_per_night < categoryMap[catId].price) {
        categoryMap[catId] = {
          id: catId,
          name: room.category_name,
          ac: room.ac,
          beds: room.beds,
          price: room.price_per_night
        };
      }
    });

    const categories = Object.values(categoryMap).sort((a, b) => a.price - b.price);

    res.json({ hotel, categories });
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
});

export default router;
