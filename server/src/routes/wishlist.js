import express from 'express';
import { usersCol, hotelsCol } from '../firestore.js';
import { authenticateToken } from '../middleware/auth.js';
import { sensitiveActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(sensitiveActionLimiter);

// 1. Get user's cloud-synced wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const wishlistSnap = await usersCol.doc(userId).collection('wishlist').get();

    const wishlist = wishlistSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.saved_at || 0) - new Date(a.saved_at || 0));

    res.json({ wishlist });
  } catch (error) {
    console.error('Error fetching cloud wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// 2. Add property to cloud wishlist
router.post('/:hotelId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const { hotelId } = req.params;

    // Fetch hotel data
    const hotelDoc = await hotelsCol.doc(hotelId).get();
    if (!hotelDoc.exists) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotelData = hotelDoc.data();
    const wishlistItem = {
      id: hotelId,
      name: hotelData.name,
      place_name: hotelData.place_name,
      place_state: hotelData.place_state,
      address: hotelData.address,
      image_url: hotelData.image_url,
      images: hotelData.images || [hotelData.image_url],
      star_rating: hotelData.star_rating,
      average_rating: hotelData.average_rating || hotelData.star_rating,
      min_price: hotelData.min_price || 2500,
      amenities: hotelData.amenities || [],
      saved_at: new Date().toISOString()
    };

    await usersCol.doc(userId).collection('wishlist').doc(hotelId).set(wishlistItem);

    res.status(201).json({
      message: 'Hotel added to saved stays in cloud',
      wishlistItem
    });
  } catch (error) {
    console.error('Error adding to cloud wishlist:', error);
    res.status(500).json({ error: 'Failed to add hotel to wishlist' });
  }
});

// 3. Remove property from cloud wishlist
router.delete('/:hotelId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const { hotelId } = req.params;

    await usersCol.doc(userId).collection('wishlist').doc(hotelId).delete();

    res.json({
      message: 'Hotel removed from cloud wishlist',
      hotelId
    });
  } catch (error) {
    console.error('Error deleting from cloud wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// 4. Batch sync offline local wishlist with cloud
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const { localItems = [] } = req.body;
    const wishlistRef = usersCol.doc(userId).collection('wishlist');

    // Existing cloud items
    const existingSnap = await wishlistRef.get();
    const existingMap = new Map();
    existingSnap.docs.forEach(doc => {
      existingMap.set(doc.id, doc.data());
    });

    // Merge missing local items
    const writePromises = [];
    if (Array.isArray(localItems)) {
      for (const item of localItems) {
        if (item && item.id && !existingMap.has(item.id)) {
          const newItem = {
            id: item.id,
            name: item.name,
            place_name: item.place_name || '',
            place_state: item.place_state || '',
            address: item.address || '',
            image_url: item.image_url || '',
            images: item.images || [item.image_url],
            star_rating: item.star_rating || 4,
            average_rating: item.average_rating || item.star_rating || 4.5,
            min_price: item.min_price || 2500,
            amenities: item.amenities || [],
            saved_at: new Date().toISOString()
          };
          existingMap.set(item.id, newItem);
          writePromises.push(wishlistRef.doc(item.id).set(newItem));
        }
      }
    }

    if (writePromises.length > 0) {
      await Promise.all(writePromises);
    }

    const merged = Array.from(existingMap.values()).sort(
      (a, b) => new Date(b.saved_at || 0) - new Date(a.saved_at || 0)
    );

    res.json({
      message: `Synchronized ${writePromises.length} local stays to cloud wishlist`,
      wishlist: merged
    });
  } catch (error) {
    console.error('Error syncing wishlist:', error);
    res.status(500).json({ error: 'Failed to sync wishlist' });
  }
});

export default router;
