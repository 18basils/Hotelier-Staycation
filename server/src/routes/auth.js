import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersCol, reservationsCol } from '../firestore.js';
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
import { registerSchema, loginSchema, profileUpdateSchema } from '../schemas/index.js';

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
        phone: data.phone || data.contact_no || null,
        preferences: data.preferences || null,
        role: data.role,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 6. Guest Loyalty Tier & Stays Computation
// ==========================================
router.get('/loyalty', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const snap = await reservationsCol.where('user_id', '==', userId).get();

    let totalStays = 0;
    let totalNights = 0;
    let totalSpend = 0;

    snap.forEach((doc) => {
      const r = doc.data();
      if (r.status === 'CONFIRMED' || r.status === 'COMPLETED') {
        totalStays += 1;
        totalNights += Number(r.total_nights || 1);
        totalSpend += Number(r.total_price || 0);
      }
    });

    // Tier calculation
    let tier = 'Silver Member';
    let tierColor = 'text-slate-400';
    let discountPercent = 5;
    let nextTier = 'Gold VIP';
    let staysNeeded = Math.max(0, 3 - totalStays);
    let progressPercent = Math.min(100, Math.round((totalStays / 3) * 100));
    let perks = [
      '5% Guaranteed Member Savings on Every Stay',
      'Instant Mobile & QR Check-in',
      'Dedicated 24/7 Concierge Support'
    ];

    if (totalStays >= 7) {
      tier = 'Platinum Elite';
      tierColor = 'text-purple-400';
      discountPercent = 15;
      nextTier = 'Lifetime Elite';
      staysNeeded = 0;
      progressPercent = 100;
      perks = [
        '15% Elite Stays Discount',
        'Complimentary Room Category Upgrade (Subject to Availability)',
        'Guaranteed 4:00 PM Late Check-out',
        'Dedicated 24/7 Personal Luxury Concierge',
        'Complimentary Ayurvedic Wellness Spa Voucher',
        'Complimentary Airport / Railway Station Chauffeured Transfer'
      ];
    } else if (totalStays >= 3) {
      tier = 'Gold VIP';
      tierColor = 'text-amber-400';
      discountPercent = 10;
      nextTier = 'Platinum Elite';
      staysNeeded = Math.max(0, 7 - totalStays);
      progressPercent = Math.min(100, Math.round(((totalStays - 3) / 4) * 100));
      perks = [
        '10% VIP Stay Discount',
        'Complimentary Daily Kerala Breakfast Buffet',
        'Priority Early Check-in (10:00 AM)',
        'Free Reservation Cancellation up to 12 Hours Prior',
        'Welcome Heritage Gift Hamper'
      ];
    }

    const points = Math.floor(totalSpend / 10); // 10 points per 100 INR spent

    res.json({
      loyalty: {
        tier,
        tierColor,
        discountPercent,
        totalStays,
        totalNights,
        totalSpend,
        points,
        nextTier,
        staysNeeded,
        progressPercent,
        perks
      }
    });
  } catch (error) {
    console.error('Error computing loyalty:', error);
    res.status(500).json({ error: 'Failed to compute loyalty tier' });
  }
});

// ==========================================
// 7. Update Guest Profile
// ==========================================
router.patch('/profile', authenticateToken, validateBody(profileUpdateSchema), async (req, res) => {
  try {
    const userId = req.user.id || req.user.username;
    const { fullName, phone, preferences } = req.body;
    const userDocRef = usersCol.doc(userId);

    const doc = await userDocRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {
      updated_at: new Date().toISOString()
    };
    if (fullName) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (preferences !== undefined) updates.preferences = preferences ? preferences.trim() : null;

    await userDocRef.update(updates);

    const updatedData = (await userDocRef.get()).data();
    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: userDocRef.id,
        username: updatedData.username,
        email: updatedData.email,
        fullName: updatedData.fullName || updatedData.username,
        phone: updatedData.phone || null,
        preferences: updatedData.preferences || null,
        role: updatedData.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
