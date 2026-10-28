import express from 'express';
import { placesCol, hotelsCol, roomsCol, categoriesCol, reviewsCol } from '../firestore.js';

const router = express.Router();

// Standard amenities library for defaults
const DEFAULT_HOTEL_AMENITIES = ['wifi', 'pool', 'spa', 'breakfast', 'parking', 'restaurant'];

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

// Get all hotels with search, ratings, price range & amenities filters
router.get('/', async (req, res) => {
  try {
    const { placeId, search, minRating, minPrice, maxPrice, amenities } = req.query;

    let query = hotelsCol;

    if (placeId) {
      query = query.where('place_id', '==', placeId);
    }

    if (minRating) {
      query = query.where('star_rating', '>=', Number(minRating));
    }

    const hotelsSnap = await query.get();
    let hotels = hotelsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        amenities: data.amenities || DEFAULT_HOTEL_AMENITIES,
        average_rating: data.average_rating || data.star_rating || 4.5,
        review_count: data.review_count || 12
      };
    });

    // In-memory keyword search across name, address, place_name
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      hotels = hotels.filter((h) => 
        (h.name && h.name.toLowerCase().includes(term)) ||
        (h.address && h.address.toLowerCase().includes(term)) ||
        (h.place_name && h.place_name.toLowerCase().includes(term))
      );
    }

    // In-memory price range filters
    if (minPrice) {
      const min = Number(minPrice);
      hotels = hotels.filter((h) => (h.min_price || 0) >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      hotels = hotels.filter((h) => (h.min_price || 0) <= max);
    }

    // Amenities filtering (comma-separated list of required amenities, e.g. "wifi,pool,breakfast")
    if (amenities && amenities.trim()) {
      const requiredList = amenities.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (requiredList.length > 0) {
        hotels = hotels.filter((h) => {
          const hotelAmenities = (h.amenities || []).map((a) => a.toLowerCase());
          return requiredList.every((reqAmenity) => hotelAmenities.includes(reqAmenity));
        });
      }
    }

    // Sort: featured first, then star rating descending, then name
    hotels.sort((a, b) => {
      if (b.featured !== a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      const ratingDiff = (b.average_rating || b.star_rating) - (a.average_rating || a.star_rating);
      if (ratingDiff !== 0) return ratingDiff;
      return a.name.localeCompare(b.name);
    });

    res.json({ hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Get single hotel by ID with details, category previews, and reviews
router.get('/:id', async (req, res) => {
  try {
    const hotelDoc = await hotelsCol.doc(req.params.id).get();

    if (!hotelDoc.exists) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotelData = hotelDoc.data();
    const hotel = { 
      id: hotelDoc.id, 
      ...hotelData,
      amenities: hotelData.amenities || DEFAULT_HOTEL_AMENITIES,
      average_rating: hotelData.average_rating || hotelData.star_rating || 4.5,
      review_count: hotelData.review_count || 12
    };

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

    // Fetch verified reviews for this hotel
    const reviewsSnap = await reviewsCol
      .where('hotel_id', '==', req.params.id)
      .get();

    const reviews = reviewsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ hotel, categories, reviews });
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
});

export default router;
