import express from 'express';
import { couponsCol } from '../firestore.js';
import { validateBody } from '../middleware/validator.js';
import { couponApplySchema } from '../schemas/index.js';

const router = express.Router();

// Fallback in-memory coupons list for instantaneous seeding & availability
const DEFAULT_COUPONS = [
  {
    code: 'WELCOME20',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    max_discount: 2000,
    min_booking_value: 1000,
    description: '20% off on your staycation (up to ₹2,000)'
  },
  {
    code: 'MONSOON15',
    discount_type: 'PERCENTAGE',
    discount_value: 15,
    max_discount: 1500,
    min_booking_value: 2000,
    description: '15% off seasonal discount (up to ₹1,500)'
  },
  {
    code: 'FLAT500',
    discount_type: 'FLAT',
    discount_value: 500,
    max_discount: 500,
    min_booking_value: 3000,
    description: 'Flat ₹500 discount on bookings above ₹3,000'
  },
  {
    code: 'STAYCATION10',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    max_discount: 1000,
    min_booking_value: 1500,
    description: '10% instant discount on all room categories'
  }
];

// Get active public coupons
router.get('/active', async (req, res) => {
  try {
    const snap = await couponsCol.where('active', '==', true).get();
    let coupons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (coupons.length === 0) {
      coupons = DEFAULT_COUPONS;
    }

    res.json({ coupons });
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    res.json({ coupons: DEFAULT_COUPONS });
  }
});

// Apply promo code and calculate discount
router.post('/apply', validateBody(couponApplySchema), async (req, res) => {
  try {
    const { code, bookingAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(bookingAmount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid booking amount is required' });
    }

    // Try fetching from Firestore first
    let coupon = null;
    try {
      const snap = await couponsCol.doc(cleanCode).get();
      if (snap.exists && snap.data().active !== false) {
        coupon = snap.data();
      }
    } catch {
      // Fallback to defaults
    }

    if (!coupon) {
      coupon = DEFAULT_COUPONS.find((c) => c.code === cleanCode);
    }

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid promo code. Please check and try again.' });
    }

    if (coupon.min_booking_value && amount < coupon.min_booking_value) {
      return res.status(400).json({
        error: `Minimum booking value of ₹${coupon.min_booking_value.toLocaleString('en-IN')} required for ${cleanCode}`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discountAmount = Math.round((amount * coupon.discount_value) / 100);
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount);
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, amount);
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    res.json({
      valid: true,
      code: cleanCode,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
      finalAmount,
      description: coupon.description
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

export default router;
