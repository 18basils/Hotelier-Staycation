import { z } from 'zod';

export const bookingSchema = z
  .object({
    guestName: z.string().trim().min(2, 'Guest name must be at least 2 characters'),
    guestEmail: z.string().trim().email('Please enter a valid email address'),
    guestPhone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number (at least 7 digits)'),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid check-in date'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid check-out date'),
    specialRequests: z.string().max(500, 'Special requests cannot exceed 500 characters').optional().or(z.literal(''))
  })
  .refine(
    (data) => {
      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOut']
    }
  );
