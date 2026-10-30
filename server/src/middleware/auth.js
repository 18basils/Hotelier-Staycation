import jwt from 'jsonwebtoken';

// Enforce mandatory environment variable in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is strictly required in production.');
}

export const JWT_SECRET = process.env.JWT_SECRET || 'hotelier-super-secret-key-2026-production';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hotelier-super-refresh-key-2026-production';

/**
 * Generates an Access Token (15-minute validity for high security)
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generates a Refresh Token (7-day validity for refresh token rotation)
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Sets HttpOnly, Secure authentication cookies on the Express response
 */
export function setAuthCookies(res, accessToken, refreshToken, req) {
  const isHttps = process.env.NODE_ENV === 'production' || 
    req?.secure || 
    req?.headers?.['x-forwarded-proto'] === 'https';

  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/'
  };

  res.cookie('hotelier_access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  if (refreshToken) {
    res.cookie('hotelier_refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
}

/**
 * Clears HttpOnly authentication cookies on logout
 */
export function clearAuthCookies(res, req) {
  const isHttps = process.env.NODE_ENV === 'production' || 
    req?.secure || 
    req?.headers?.['x-forwarded-proto'] === 'https';

  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/'
  };

  res.clearCookie('hotelier_access_token', cookieOptions);
  res.clearCookie('hotelier_refresh_token', cookieOptions);
}

/**
 * Middleware: Verifies JWT from either HttpOnly cookie or Authorization Bearer header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.hotelier_access_token;

  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware: Enforces Administrator role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}
