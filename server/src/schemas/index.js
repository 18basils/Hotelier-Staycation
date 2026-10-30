import { z } from 'zod';

// ==========================================
// Authentication Schemas
// ==========================================
export const registerSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  email: z.string()
    .trim()
    .email('Invalid email address format')
    .optional()
    .or(z.literal('')),
  fullName: z.string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional()
    .or(z.literal(''))
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// ==========================================
// Reservation / Booking Schemas
// ==========================================
export const reservationSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  guestName: z.string().trim().min(2, 'Guest name must be at least 2 characters').max(100),
  guestContact: z.string().trim().min(7, 'Contact number must be at least 7 digits').max(20, 'Contact number cannot exceed 20 characters')
    .regex(/^[\d\s+\-()]+$/, 'Contact number contains invalid characters'),
  specialRequests: z.string().max(500, 'Special requests cannot exceed 500 characters').optional().nullable(),
  couponCode: z.string().trim().max(30).optional().nullable(),
  paymentMethod: z.string().max(60).optional().nullable()
}).refine((data) => {
  const start = new Date(data.checkIn);
  const end = new Date(data.checkOut);
  return end > start;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut']
});

// ==========================================
// Review Schemas
// ==========================================
export const reviewSchema = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'),
  reservationId: z.string().optional().nullable(),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().trim().min(5, 'Review comment must be at least 5 characters').max(1000, 'Comment cannot exceed 1000 characters')
});

// ==========================================
// Hotel Admin Schemas
// ==========================================
export const hotelSchema = z.object({
  placeId: z.string().min(1, 'Destination place is required'),
  name: z.string().trim().min(2, 'Hotel name must be at least 2 characters').max(120),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(250),
  starRating: z.coerce.number().int().min(1).max(5),
  contactNo: z.string().trim().min(7).max(30),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  featured: z.boolean().optional()
});

// ==========================================
// Room Admin Schemas
// ==========================================
export const roomSchema = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  roomNumber: z.string().trim().min(1, 'Room number is required').max(30),
  pricePerNight: z.coerce.number().positive('Price per night must be greater than 0'),
  status: z.enum(['available', 'maintenance']).optional().default('available')
});

// ==========================================
// Coupon Schemas
// ==========================================
export const couponApplySchema = z.object({
  code: z.string().trim().min(2, 'Coupon code is required').max(30).transform((val) => val.toUpperCase()),
  bookingAmount: z.coerce.number().positive('Booking amount must be greater than 0')
});
