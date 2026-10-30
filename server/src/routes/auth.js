import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersCol } from '../firestore.js';
import { 
  authenticateToken, 
  generateAccessToken, 
  generateRefreshToken, 
  setAuthCookies, 
  clearAuthCookies,
  JWT_REFRESH_SECRET 
} from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validator.js';
import { registerSchema, loginSchema } from '../schemas/index.js';

const router = express.Router();

// Apply auth rate limiter across authentication and authorization endpoints
router.use(authLimiter);

// ==========================================
// 1. Register User (with Zod validation & HttpOnly cookies)
// ==========================================
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;
    const cleanUsername = username.trim().toLowerCase();

    // Check if username is already taken
    const existingSnap = await usersCol.where('username', '==', cleanUsername).limit(1).get();
    if (!existingSnap.empty) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userDocRef = usersCol.doc(cleanUsername);

    const newUser = {
      id: cleanUsername,
      username: cleanUsername,
      email: email ? email.trim() : null,
      fullName: fullName ? fullName.trim() : cleanUsername,
      password_hash: passwordHash,
      role: 'USER',
      created_at: new Date().toISOString()
    };

    await userDocRef.set(newUser);

    const userPayload = {
      id: cleanUsername,
      username: cleanUsername,
      email: newUser.email,
      fullName: newUser.fullName,
      role: 'USER'
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Set HttpOnly secure cookies
    setAuthCookies(res, accessToken, refreshToken, req);

    res.status(201).json({
      message: 'Account registered successfully',
      user: userPayload,
      token: accessToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// ==========================================
// 2. Login User / Admin (with Zod validation & HttpOnly cookies)
// ==========================================
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username.trim().toLowerCase();

    const userSnap = await usersCol.where('username', '==', cleanUsername).limit(1).get();
    if (userSnap.empty) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userData = userSnap.docs[0].data();
    const passwordMatch = bcrypt.compareSync(password, userData.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userPayload = {
      id: cleanUsername,
      username: userData.username,
      email: userData.email || null,
      fullName: userData.full_name || userData.fullName || userData.username,
      role: userData.role || 'USER'
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Set HttpOnly secure cookies
    setAuthCookies(res, accessToken, refreshToken, req);

    res.json({
      message: 'Login successful',
      user: userPayload,
      token: accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ==========================================
// 3. Refresh Token Rotation (HttpOnly cookie)
// ==========================================
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.hotelier_refresh_token || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        clearAuthCookies(res, req);
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      // Verify user still exists in database
      const userDoc = await usersCol.doc(decoded.id || decoded.username).get();
      if (!userDoc.exists) {
        clearAuthCookies(res, req);
        return res.status(404).json({ error: 'User no longer exists' });
      }

      const userData = userDoc.data();
      const userPayload = {
        id: userDoc.id,
        username: userData.username,
        email: userData.email || null,
        fullName: userData.full_name || userData.fullName || userData.username,
        role: userData.role || 'USER'
      };

      // Rotate both access token and refresh token
      const newAccessToken = generateAccessToken(userPayload);
      const newRefreshToken = generateRefreshToken(userPayload);

      setAuthCookies(res, newAccessToken, newRefreshToken, req);

      res.json({
        message: 'Token refreshed successfully',
        user: userPayload,
        token: newAccessToken
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// ==========================================
// 4. Logout (Clears HttpOnly cookies)
// ==========================================
router.post('/logout', (req, res) => {
  clearAuthCookies(res, req);
  res.json({ message: 'Logged out successfully' });
});

// ==========================================
// 5. Current User Profile
// ==========================================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userDoc = await usersCol.doc(req.user.id || req.user.username).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = userDoc.data();
    res.json({
      user: {
        id: userDoc.id,
        username: data.username,
        email: data.email,
        fullName: data.full_name || data.fullName || data.username,
        role: data.role,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
