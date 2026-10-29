import express from 'express';
import { placesCol, hotelsCol, roomsCol, categoriesCol, reviewsCol, reservationsCol } from '../firestore.js';

const router = express.Router();

// Standard amenities library for defaults
const DEFAULT_HOTEL_AMENITIES = ['wifi', 'pool', 'spa', 'breakfast', 'parking', 'restaurant'];

// Coordinates for interactive Leaflet Map pins
const HOTEL_COORDINATES = {
  'grand-hyatt-kochi': { lat: 9.9885, lng: 76.2657 },
  'old-harbour-hotel': { lat: 9.9657, lng: 76.2415 },
  'fragrant-nature-munnar': { lat: 10.0381, lng: 77.0125 },
  'tea-county-munnar': { lat: 10.0889, lng: 77.0595 },
  'mountain-shadows-wayanad': { lat: 11.5833, lng: 76.0167 },
  'leela-kovalam-beach': { lat: 8.3842, lng: 76.9782 }
};

const PLACE_COORDINATES = {
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'wayanad': { lat: 11.6854, lng: 76.1320 },
  'kovalam': { lat: 8.4004, lng: 76.9787 }
};

// Rich multi-image photo galleries for Bento grid and Lightbox
const HOTEL_GALLERIES = {
  'grand-hyatt-kochi': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  ],
  'old-harbour-hotel': [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
  ],
  'fragrant-nature-munnar': [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
  ],
  'tea-county-munnar': [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ],
  'mountain-shadows-wayanad': [
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
  ],
  'leela-kovalam-beach': [
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  ]
};

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

// Get all hotels with search, ratings, price range, amenities & live date availability filters
router.get('/', async (req, res) => {
  try {
    const { placeId, search, minRating, minPrice, maxPrice, amenities, checkIn, checkOut, guests } = req.query;

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
      const coords = {
        lat: Number(data.latitude) || (HOTEL_COORDINATES[doc.id]?.lat) || (data.place_id ? PLACE_COORDINATES[data.place_id]?.lat : 9.9885),
        lng: Number(data.longitude) || (HOTEL_COORDINATES[doc.id]?.lng) || (data.place_id ? PLACE_COORDINATES[data.place_id]?.lng : 76.2657)
      };
      const images = (data.images && Array.isArray(data.images) && data.images.length > 0)
        ? data.images
        : (HOTEL_GALLERIES[doc.id] || (data.image_url ? [data.image_url] : []));

      return {
        id: doc.id,
        ...data,
        latitude: coords.lat,
        longitude: coords.lng,
        images,
        amenities: data.amenities || DEFAULT_HOTEL_AMENITIES,
        average_rating: data.average_rating || data.star_rating || 4.5,
        review_count: data.review_count || 12,
        available_rooms_count: null
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

    // Amenities filtering
    if (amenities && amenities.trim()) {
      const requiredList = amenities.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (requiredList.length > 0) {
        hotels = hotels.filter((h) => {
          const hotelAmenities = (h.amenities || []).map((a) => a.toLowerCase());
          return requiredList.every((reqAmenity) => hotelAmenities.includes(reqAmenity));
        });
      }
    }

    // Live Date Availability & Guest Capacity Filtering (Phase 2 Upgrade)
    if (checkIn && checkOut) {
      try {
        // Find all confirmed reservations overlapping with requested dates
        const resSnap = await reservationsCol.where('status', '==', 'CONFIRMED').get();
        const bookedRoomIds = new Set();
        resSnap.forEach((doc) => {
          const r = doc.data();
          if (r.check_in < checkOut && r.check_out > checkIn) {
            bookedRoomIds.add(r.room_id);
          }
        });

        // Query all available rooms across hotels
        const allRoomsSnap = await roomsCol.where('status', '==', 'available').get();
        const hotelAvailableRooms = {};

        allRoomsSnap.forEach((doc) => {
          const room = doc.data();
          const hotelId = room.hotel_id;
          if (!hotelAvailableRooms[hotelId]) {
            hotelAvailableRooms[hotelId] = [];
          }

          if (!bookedRoomIds.has(doc.id)) {
            // If guests specified, filter by capacity
            if (guests) {
              const reqGuests = Number(guests);
              const roomCapacity = Number(room.capacity || (room.beds ? room.beds * 2 : 2));
              if (roomCapacity >= reqGuests) {
                hotelAvailableRooms[hotelId].push(doc.id);
              }
            } else {
              hotelAvailableRooms[hotelId].push(doc.id);
            }
          }
        });

        // Attach availability counts and filter hotels that have at least 1 open room
        hotels = hotels.map((h) => ({
          ...h,
          available_rooms_count: hotelAvailableRooms[h.id] ? hotelAvailableRooms[h.id].length : 0
        })).filter((h) => h.available_rooms_count > 0);
      } catch (dateErr) {
        console.error('Error calculating date availability:', dateErr);
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

// Get single hotel by ID with details, multi-image gallery, category previews, and reviews
router.get('/:id', async (req, res) => {
  try {
    const hotelDoc = await hotelsCol.doc(req.params.id).get();

    if (!hotelDoc.exists) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotelData = hotelDoc.data();
    const coords = {
      lat: Number(hotelData.latitude) || (HOTEL_COORDINATES[hotelDoc.id]?.lat) || (hotelData.place_id ? PLACE_COORDINATES[hotelData.place_id]?.lat : 9.9885),
      lng: Number(hotelData.longitude) || (HOTEL_COORDINATES[hotelDoc.id]?.lng) || (hotelData.place_id ? PLACE_COORDINATES[hotelData.place_id]?.lng : 76.2657)
    };
    const images = (hotelData.images && Array.isArray(hotelData.images) && hotelData.images.length > 0)
      ? hotelData.images
      : (HOTEL_GALLERIES[hotelDoc.id] || (hotelData.image_url ? [hotelData.image_url] : []));

    const hotel = { 
      id: hotelDoc.id, 
      ...hotelData,
      latitude: coords.lat,
      longitude: coords.lng,
      images,
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
          price: room.price_per_night,
          image_url: room.image_url
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
