import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/config.js';
import { verifyToken as authenticate } from '../middleware/authValidate.js';

const router = express.Router();

// ==========================================
// SIGN UP - Create new user account
// ==========================================
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name, organization } = req.body;
  
  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }
    
    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert new user into database
    const result = await pool.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, organization, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, email, first_name, last_name, organization, created_at`,
      [
        email.toLowerCase().trim(), 
        passwordHash, 
        first_name || null, 
        last_name || null,
        organization || null
      ]
    );
    
    const user = result.rows[0];
    
    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Error creating user account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// LOGIN - Authenticate existing user
// ==========================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const user = result.rows[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account is deactivated. Please contact support.' 
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Update last login timestamp
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    
    // Send success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        role: user.role,
        lastLoginAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Error logging in',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// GET CURRENT USER - Requires authentication
// ==========================================
router.get('/me', authenticate, async (req, res) => {
  console.log('Fetching user info for userId:', req.user.userId);
  try {
    // req.userId comes from authenticate middleware
    const result = await pool.query(
      `SELECT 
         id, 
         email, 
         first_name, 
         last_name, 
         organization, 
         role,
         created_at, 
         last_login_at,
         is_active,
         email_verified
       FROM users 
       WHERE id = $1`,
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    const user = result.rows[0];
    
    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        role: user.role,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        isActive: user.is_active,
        emailVerified: user.email_verified
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Error fetching user information' 
    });
  }
});

// ==========================================
// UPDATE USER PROFILE - Requires authentication
// ==========================================
router.patch('/me', authenticate, async (req, res) => {
  const { firstName, lastName, organization } = req.body;
  
  try {
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(firstName);
      paramCount++;
    }
    
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(lastName);
      paramCount++;
    }
    
    if (organization !== undefined) {
      updates.push(`organization = $${paramCount}`);
      values.push(organization);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }
    
    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // Add user ID for WHERE clause
    values.push(req.userId);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, organization, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        updatedAt: user.updated_at
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Error updating profile' 
    });
  }
});

// ==========================================
// CHANGE PASSWORD - Requires authentication
// ==========================================
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }
    
    // Get user's current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    const user = result.rows[0];
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password in database
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.userId]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Error changing password' 
    });
  }
});

// ==========================================
// LOGOUT - Requires authentication
// (Client-side should delete token)
// ==========================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a JWT system, logout is primarily client-side
    // (delete the token from client storage)
    // But we can log the logout event if needed
    
    console.log(`User ${req.userId} logged out at ${new Date().toISOString()}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Error during logout' 
    });
  }
});

// ==========================================
// VERIFY TOKEN - Check if token is still valid
// ==========================================
router.get('/verify', authenticate, async (req, res) => {
  try {
    // If middleware passed, token is valid
    res.json({
      success: true,
      valid: true,
      userId: req.userId,
      email: req.userEmail
    });
    
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      error: 'Error verifying token' 
    });
  }
});

// ==========================================
// REFRESH TOKEN - Get a new token
// ==========================================
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // Generate new token with same data but new expiration
    const token = jwt.sign(
      { 
        userId: req.userId, 
        email: req.userEmail 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      error: 'Error refreshing token' 
    });
  }
});


export default router;