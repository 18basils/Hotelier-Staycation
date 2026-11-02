import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  reservationSchema,
  rescheduleSchema,
  profileUpdateSchema,
  reviewSchema,
  couponApplySchema,
  couponCreateSchema,
  hotelSchema
} from '../src/schemas/index.js';

describe('Server-Side Zod Validation Schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid user registration data', () => {
      const result = registerSchema.safeParse({
        username: 'basil_shaji',
        password: 'securepassword123',
        email: 'basil@example.com',
        fullName: 'Basil Shaji'
      });
      expect(result.success).toBe(true);
    });

    it('rejects short usernames and invalid characters', () => {
      const shortUser = registerSchema.safeParse({
        username: 'ab',
        password: 'securepassword123',
        email: 'valid@example.com',
        fullName: 'Valid Name'
      });
      expect(shortUser.success).toBe(false);

      const invalidChars = registerSchema.safeParse({
        username: 'user with spaces!',
        password: 'securepassword123',
        email: 'valid@example.com',
        fullName: 'Valid Name'
      });
      expect(invalidChars.success).toBe(false);
    });

    it('rejects passwords shorter than 6 characters', () => {
      const shortPass = registerSchema.safeParse({
        username: 'validuser',
        password: '123',
        email: 'valid@example.com',
        fullName: 'Valid Name'
      });
      expect(shortPass.success).toBe(false);
    });

    it('rejects malformed email addresses', () => {
      const badEmail = registerSchema.safeParse({
        username: 'validuser',
        password: 'password123',
        email: 'not-an-email',
        fullName: 'Valid Name'
      });
      expect(badEmail.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login credentials', () => {
      const result = loginSchema.safeParse({
        username: 'admin',
        password: 'adminpassword'
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty credentials', () => {
      const result = loginSchema.safeParse({
        username: '',
        password: ''
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reservationSchema', () => {
    it('accepts valid reservation data', () => {
      const result = reservationSchema.safeParse({
        roomId: 'room-101',
        checkIn: '2026-12-01',
        checkOut: '2026-12-05',
        guestName: 'Ananya Sharma',
        guestContact: '+91 98765 43210',
        specialRequests: 'Quiet high floor room please'
      });
      expect(result.success).toBe(true);
    });

    it('rejects reservations where checkOut is earlier than or equal to checkIn', () => {
      const reversed = reservationSchema.safeParse({
        roomId: 'room-101',
        checkIn: '2026-12-05',
        checkOut: '2026-12-01',
        guestName: 'Ananya Sharma',
        guestContact: '+91 98765 43210'
      });
      expect(reversed.success).toBe(false);

      const sameDay = reservationSchema.safeParse({
        roomId: 'room-101',
        checkIn: '2026-12-05',
        checkOut: '2026-12-05',
        guestName: 'Ananya Sharma',
        guestContact: '+91 98765 43210'
      });
      expect(sameDay.success).toBe(false);
    });

    it('rejects invalid contact phone numbers', () => {
      const badPhone = reservationSchema.safeParse({
        roomId: 'room-101',
        checkIn: '2026-12-01',
        checkOut: '2026-12-05',
        guestName: 'Ananya Sharma',
        guestContact: 'abc'
      });
      expect(badPhone.success).toBe(false);
    });

    it('accepts reservations with meal plan and add-on upgrades', () => {
      const result = reservationSchema.safeParse({
        roomId: 'room-101',
        checkIn: '2026-12-01',
        checkOut: '2026-12-05',
        guestName: 'Ananya Sharma',
        guestContact: '+91 98765 43210',
        mealPlan: {
          id: 'breakfast',
          name: 'Royal Breakfast Buffet',
          pricePerNight: 750
        },
        addOns: [
          { id: 'spa', name: 'Ayurvedic Rejuvenation Massage (60 min)', price: 2499 },
          { id: 'transfer', name: 'Chauffeured Airport Transfer', price: 1800 }
        ],
        addOnTotal: 7299
      });
      expect(result.success).toBe(true);
    });
  });

  describe('rescheduleSchema', () => {
    it('accepts valid check-in and check-out reschedule dates', () => {
      const result = rescheduleSchema.safeParse({
        checkIn: '2026-12-10',
        checkOut: '2026-12-15'
      });
      expect(result.success).toBe(true);
    });

    it('rejects reschedules where checkOut <= checkIn', () => {
      const reversed = rescheduleSchema.safeParse({
        checkIn: '2026-12-15',
        checkOut: '2026-12-10'
      });
      expect(reversed.success).toBe(false);

      const sameDate = rescheduleSchema.safeParse({
        checkIn: '2026-12-10',
        checkOut: '2026-12-10'
      });
      expect(sameDate.success).toBe(false);
    });

    it('rejects non-standard date formats', () => {
      const badFormat = rescheduleSchema.safeParse({
        checkIn: '10/12/2026',
        checkOut: '15/12/2026'
      });
      expect(badFormat.success).toBe(false);
    });
  });

  describe('profileUpdateSchema', () => {
    it('accepts valid profile updates', () => {
      const result = profileUpdateSchema.safeParse({
        fullName: 'Basil Shaji',
        phone: '+91 98765 00000',
        preferences: 'Prefers high floor quiet corner room with sea view'
      });
      expect(result.success).toBe(true);
    });

    it('rejects names that are too short', () => {
      const shortName = profileUpdateSchema.safeParse({
        fullName: 'B'
      });
      expect(shortName.success).toBe(false);
    });

    it('allows null and optional values for phone and preferences', () => {
      const result = profileUpdateSchema.safeParse({
        fullName: 'Basil Shaji',
        phone: null,
        preferences: null
      });
      expect(result.success).toBe(true);
    });
  });

  describe('reviewSchema', () => {
    it('accepts valid 1-5 star reviews with comments', () => {
      const result = reviewSchema.safeParse({
        hotelId: 'hotel-01',
        rating: 5,
        comment: 'Exceptional stay with scenic view and warm hospitality!'
      });
      expect(result.success).toBe(true);
    });

    it('rejects star ratings outside 1-5 range', () => {
      const zeroStar = reviewSchema.safeParse({
        hotelId: 'hotel-01',
        rating: 0,
        comment: 'Valid comment length'
      });
      expect(zeroStar.success).toBe(false);

      const sixStar = reviewSchema.safeParse({
        hotelId: 'hotel-01',
        rating: 6,
        comment: 'Valid comment length'
      });
      expect(sixStar.success).toBe(false);
    });
  });

  describe('couponApplySchema', () => {
    it('accepts coupon codes and converts to uppercase', () => {
      const result = couponApplySchema.safeParse({
        code: 'welcome20',
        bookingAmount: 5000
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('WELCOME20');
      }
    });

    it('rejects non-positive booking amounts', () => {
      const result = couponApplySchema.safeParse({
        code: 'WELCOME20',
        bookingAmount: -50
      });
      expect(result.success).toBe(false);
    });
  });

  describe('hotelSchema', () => {
    it('accepts valid hotel creation payload', () => {
      const result = hotelSchema.safeParse({
        placeId: 'place-01',
        name: 'The Grand Backwaters Resort',
        address: 'Vembanad Lake, Kumarakom, Kerala',
        starRating: 5,
        contactNo: '+91 481 252 6000',
        description: 'Luxury 5-star lakeside sanctuary with private pool villas.',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        minPrice: 6500,
        latitude: 9.6175,
        longitude: 76.4301
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid latitude and longitude ranges', () => {
      const badLat = hotelSchema.safeParse({
        placeId: 'place-01',
        name: 'Invalid Coordinates Resort',
        address: 'Nowhere',
        starRating: 4,
        contactNo: '9876543210',
        latitude: 100, // Invalid lat > 90
        longitude: 76.0
      });
      expect(badLat.success).toBe(false);
    });
  });

  describe('couponCreateSchema', () => {
    it('accepts valid percentage coupon creation payload', () => {
      const result = couponCreateSchema.safeParse({
        code: 'diwali30',
        discountType: 'PERCENTAGE',
        discountValue: 30,
        maxDiscount: 2500,
        minBookingValue: 2000,
        description: 'Diwali festive holiday offer',
        expiresAt: '2026-11-30',
        active: true
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('DIWALI30');
      }
    });

    it('accepts valid flat amount coupon creation payload', () => {
      const result = couponCreateSchema.safeParse({
        code: 'FLAT750',
        discountType: 'FLAT',
        discountValue: 750,
        description: 'Flat ₹750 discount on premium cottages'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minBookingValue).toBe(0);
        expect(result.data.active).toBe(true);
      }
    });

    it('rejects invalid discount types or negative discount values', () => {
      const badType = couponCreateSchema.safeParse({
        code: 'INVALIDTYPE',
        discountType: 'VARIABLE',
        discountValue: 10,
        description: 'Invalid type description'
      });
      expect(badType.success).toBe(false);

      const negativeValue = couponCreateSchema.safeParse({
        code: 'BADVAL',
        discountType: 'PERCENTAGE',
        discountValue: -15,
        description: 'Negative value description'
      });
      expect(negativeValue.success).toBe(false);
    });

    it('rejects invalid code characters', () => {
      const badCode = couponCreateSchema.safeParse({
        code: 'CODE WITH SPACES!',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        description: 'Code with spaces'
      });
      expect(badCode.success).toBe(false);
    });
  });
});
