import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter for standard browsing and read requests.
 * Allows 300 requests per 15 minutes per IP address.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * Strict rate limiter for authentication routes (login, register, token verification)
 * to prevent brute-force credential stuffing and password guessing.
 * Allows 25 attempts per 15 minutes per IP address.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Action rate limiter for sensitive state-changing endpoints
 * (booking reservations, cancellations, submitting reviews, admin operations).
 * Allows 60 operations per 15 minutes per IP address.
 */
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests for this action from this IP. Please slow down and try again later.'
  }
});
