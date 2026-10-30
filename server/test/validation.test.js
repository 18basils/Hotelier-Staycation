import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  reservationSchema,
  reviewSchema,
  couponApplySchema,
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
});
