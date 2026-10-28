import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersCol } from '../firestore.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
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

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account registered successfully',
      user: userPayload,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login user or admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

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

    const payload = {
      id: cleanUsername,
      username: userData.username,
      email: userData.email || null,
      fullName: userData.full_name || userData.fullName || userData.username,
      role: userData.role || 'USER'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: payload,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get currently logged-in user profile
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
