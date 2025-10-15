import express from 'express';
import { body, validationResult } from 'express-validator';
import { eq } from 'drizzle-orm';
import db from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, comparePassword, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      preferences: {}
    }).returning();

    // Generate token
    const token = generateToken(newUser[0].id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user[0].id);

    res.json({
      message: 'Login successful',
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        preferences: user[0].preferences
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      preferences: users.preferences,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user preferences
router.put('/preferences', [
  body('preferences').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    const { preferences } = req.body;

    const updatedUser = await db.update(users)
      .set({ 
        preferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser[0].preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;