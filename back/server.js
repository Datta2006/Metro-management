const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Datta@2006',
  database: process.env.DB_NAME || 'railway_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const SECRET_KEY = process.env.JWT_SECRET || 'your-strong-secret-key-here';
const SALT_ROUNDS = 10;

// Verify token middleware
const verifyToken = (adminRequired = false) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      req.user = users[0];
      
      // Check admin permission if required
      if (adminRequired && !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  
  try {
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [username, email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.query(
      'INSERT INTO users (username, password, email, phone, is_admin) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, phone, false] // Default to non-admin
    );

    const token = jwt.sign(
      { id: result.insertId, username, is_admin: false }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: result.insertId, 
        username, 
        email, 
        phone,
        is_admin: false
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        phone: user.phone,
        is_admin: user.is_admin 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all stations
app.get('/api/stations', async (req, res) => {
  try {
    const [stations] = await db.query('SELECT * FROM stations ORDER BY name');
    res.json(stations);
  } catch (err) {
    console.error('Stations fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Search trains
app.get('/api/trains/search', async (req, res) => {
  const { source, destination, date, classType } = req.query;
  
  try {
    let query = `
      SELECT t.*, 
        s1.name as source_name, s1.code as source_code,
        s2.name as destination_name, s2.code as destination_code
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (source) {
      query += ' AND s1.code = ?';
      params.push(source);
    }
    
    if (destination) {
      query += ' AND s2.code = ?';
      params.push(destination);
    }
    
    if (date) {
      query += ' AND t.available_seats > 0';
    }
    
    const [trains] = await db.query(query, params);
    
    const trainsWithFares = trains.map(train => {
      const baseFare = train.fare_per_km * (train.distance_from_source / 1000);
      let fareMultiplier = 1;
      
      if (classType === '3A') fareMultiplier = 1.5;
      else if (classType === '2A') fareMultiplier = 2;
      else if (classType === '1A') fareMultiplier = 3;
      else if (classType === 'CC') fareMultiplier = 1.2;
      else if (classType === 'EC') fareMultiplier = 1.8;
      
      return {
        ...train,
        current_fare: Math.round(baseFare * fareMultiplier),
        available_classes: ['SL', '3A', '2A', '1A']
      };
    });
    
    res.json(trainsWithFares);
  } catch (err) {
    console.error('Train search error:', err);
    res.status(500).json({ error: 'Failed to search trains' });
  }
});

// Get train details
app.get('/api/trains/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [trains] = await db.query(`
      SELECT t.*, 
        s1.name as source_name, s1.code as source_code,
        s2.name as destination_name, s2.code as destination_code
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE t.id = ?
    `, [id]);
    
    if (trains.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    const train = trains[0];
    const [stops] = await db.query(`
      SELECT ts.*, s.name as station_name, s.code as station_code
      FROM train_stops ts
      JOIN stations s ON ts.station_id = s.id
      WHERE ts.train_id = ?
      ORDER BY ts.sequence_number
    `, [id]);
    
    res.json({ ...train, stops });
  } catch (err) {
    console.error('Train details error:', err);
    res.status(500).json({ error: 'Failed to get train details' });
  }
});

// Verify token endpoint
app.get('/api/verify-token', verifyToken(), (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone,
      is_admin: req.user.is_admin
    }
  });
});

// Book a ticket (with proper transaction handling)
app.post('/api/bookings', verifyToken(), async (req, res) => {
  const { trainId, passengers, classType } = req.body;
  const userId = req.user.id;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check train availability
    const [trains] = await connection.query(
      'SELECT * FROM trains WHERE id = ? FOR UPDATE', 
      [trainId]
    );
    
    if (trains.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Train not found' });
    }
    
    const train = trains[0];
    if (train.available_seats < passengers.length) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'Not enough seats available' });
    }
    
    // Hardcoded fare for now (1000 per passenger)
    const farePerPassenger = 1000;
    const totalFare = farePerPassenger * passengers.length;
    
    // Create bookings
    const pnrNumber = `PNR${uuidv4().substr(0, 8).toUpperCase()}`;
    const bookingPromises = passengers.map(passenger => {
      const seatNumber = `${classType}-${Math.floor(Math.random() * 50) + 1}`;
      return connection.query(
        `INSERT INTO bookings (
          train_id, user_id, pnr_number, passenger_name, passenger_age, 
          passenger_gender, seat_number, coach_number, class_type, fare
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trainId, userId, pnrNumber, passenger.name, passenger.age,
          passenger.gender, seatNumber, classType, classType, farePerPassenger
        ]
      );
    });
    
    await Promise.all(bookingPromises);
    
    // Update available seats
    await connection.query(
      'UPDATE trains SET available_seats = available_seats - ? WHERE id = ?',
      [passengers.length, trainId]
    );
    
    // Create payment record
    await connection.query(
      `INSERT INTO payments (
        booking_id, amount, payment_method, transaction_id, payment_status
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        pnrNumber,
        totalFare, 
        'UPI', 
        `TXN${uuidv4().substr(0, 8).toUpperCase()}`, 
        'Success'
      ]
    );
    
    await connection.commit();
    connection.release();
    
    res.json({ 
      success: true, 
      pnrNumber, 
      totalFare, 
      message: 'Booking successful' 
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get user bookings
app.get('/api/bookings', verifyToken(), async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [bookings] = await db.query(`
      SELECT b.*, t.name as train_name, t.number as train_number,
        s1.name as source_name, s2.name as destination_name,
        t.departure_time, t.arrival_time
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `, [userId]);
    
    res.json(bookings);
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking by PNR number
app.get('/api/bookings/:pnr', verifyToken(), async (req, res) => {
  const { pnr } = req.params;
  const userId = req.user.id;

  try {
    const [bookings] = await db.query(`
      SELECT b.*, t.name as train_name, t.number as train_number,
        s1.name as source_name, s2.name as destination_name,
        t.departure_time, t.arrival_time,
        p.payment_method, p.payment_status, p.transaction_id
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      LEFT JOIN payments p ON b.pnr_number = p.booking_id
      WHERE b.pnr_number = ? AND b.user_id = ?
    `, [pnr, userId]);

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(bookings[0]);
  } catch (err) {
    console.error('Booking fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

// Submit feedback
app.post('/api/feedback', verifyToken(), async (req, res) => {
  const { trainId, rating, comments } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!trainId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid feedback data' });
    }

    // Check if user has traveled on this train (simplified check)
    const [bookings] = await db.query(
      'SELECT id FROM bookings WHERE user_id = ? AND train_id = ? LIMIT 1',
      [userId, trainId]
    );

    if (bookings.length === 0) {
      return res.status(403).json({ error: 'You must have traveled on this train to provide feedback' });
    }

    // Insert feedback
    const [result] = await db.query(
      'INSERT INTO feedback (user_id, train_id, rating, comments) VALUES (?, ?, ?, ?)',
      [userId, trainId, rating, comments]
    );

    res.status(201).json({
      success: true,
      feedbackId: result.insertId,
      message: 'Feedback submitted successfully'
    });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback for a train
app.get('/api/trains/:id/feedback', async (req, res) => {
  const { id } = req.params;

  try {
    const [feedback] = await db.query(`
      SELECT f.*, u.username 
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.train_id = ?
      ORDER BY f.created_at DESC
    `, [id]);

    // Calculate average rating
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating
      FROM feedback
      WHERE train_id = ?
    `, [id]);

    res.json({
      feedback,
      stats: {
        totalFeedback: stats[0].total_feedback,
        averageRating: stats[0].average_rating ? parseFloat(stats[0].average_rating).toFixed(1) : 0
      }
    });
  } catch (err) {
    console.error('Feedback fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get user's feedback history
app.get('/api/user/feedback', verifyToken(), async (req, res) => {
  const userId = req.user.id;

  try {
    const [feedback] = await db.query(`
      SELECT f.*, t.name as train_name, t.number as train_number
      FROM feedback f
      JOIN trains t ON f.train_id = t.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json(feedback);
  } catch (err) {
    console.error('User feedback fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch your feedback history' });
  }
});

// Update user profile
app.put('/api/users/:id', verifyToken(), async (req, res) => {
  const userId = req.params.id;
  const { username, email, phone } = req.body;
  const requestingUserId = req.user.id;

  // Verify the user is updating their own profile
  if (parseInt(userId) !== requestingUserId) {
    return res.status(403).json({ error: 'Unauthorized to update this profile' });
  }

  try {
    // Check if new username or email already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Update user
    await db.query(
      'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?',
      [username, email, phone, userId]
    );

    // Get updated user
    const [users] = await db.query(
      'SELECT id, username, email, phone, is_admin FROM users WHERE id = ?', 
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// =============== ADMIN ROUTES ===============

// Get all users (admin only)
app.get('/api/admin/users', verifyToken(true), async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, phone, is_admin FROM users ORDER BY id'
    );
    
    res.json(users);
  } catch (err) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Toggle user admin status (admin only)
app.put('/api/admin/users/:id/toggle-admin', verifyToken(true), async (req, res) => {
  const userId = req.params.id;
  const adminUserId = req.user.id;
  
  // Prevent admins from removing their own admin privileges
  if (parseInt(userId) === adminUserId) {
    return res.status(400).json({ error: 'Cannot modify your own admin status' });
  }
  
  try {
    // Get current admin status
    const [users] = await db.query(
      'SELECT is_admin FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newAdminStatus = !users[0].is_admin;
    
    // Update admin status
    await db.query(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      [newAdminStatus, userId]
    );
    
    res.json({
      success: true,
      userId: parseInt(userId),
      is_admin: newAdminStatus,
      message: `User admin status updated to ${newAdminStatus}`
    });
  } catch (err) {
    console.error('Admin status update error:', err);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// Get all bookings (admin only)
app.get('/api/admin/bookings', verifyToken(true), async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, t.name as train_name, t.number as train_number,
        s1.name as source_name, s2.name as destination_name,
        t.departure_time, t.arrival_time,
        u.username, u.email, u.phone,
        p.payment_method, p.payment_status, p.transaction_id
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments p ON b.pnr_number = p.booking_id
      ORDER BY b.booking_date DESC
    `);
    
    res.json(bookings);
  } catch (err) {
    console.error('Admin bookings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Add a new train (admin only)
app.post('/api/admin/trains', verifyToken(true), async (req, res) => {
  const {
    name,
    number,
    source_station_id,
    destination_station_id,
    departure_time,
    arrival_time,
    distance_from_source=null,
    available_seats,
    fare_per_km
  } = req.body;
  
  try {
    // Validate required fields
    if (!name || !number || !source_station_id || !destination_station_id) {
      return res.status(400).json({ error: 'Missing required train information' });
    }
    
    // Insert new train
    const [result] = await db.query(
      `INSERT INTO trains (
        name, number, source_station_id, destination_station_id,
        departure_time, arrival_time, distance_from_source,
        available_seats, fare_per_km
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, number, source_station_id, destination_station_id,
        departure_time, arrival_time, distance_from_source,
        available_seats, fare_per_km
      ]
    );
    
    // Get the new train with station details
    const [trains] = await db.query(`
      SELECT t.*, 
        s1.name as source_name, s1.code as source_code,
        s2.name as destination_name, s2.code as destination_code
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE t.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      train: trains[0],
      message: 'Train added successfully'
    });
  } catch (err) {
    console.error('Train creation error:', err);
    res.status(500).json({ error: 'Failed to create train' });
  }
});
// Get all trains (admin only)
// Get all stations (admin only - with additional admin-only data if needed)
app.get('/api/admin/stations', verifyToken(true), async (req, res) => {
  try {
    const [stations] = await db.query(`
      SELECT * FROM stations 
      ORDER BY name
    `);
    
    res.json(stations);
  } catch (err) {
    console.error('Admin stations fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});
// Update a train (admin only)
app.put('/api/admin/trains/:id', verifyToken(true), async (req, res) => {
  const trainId = req.params.id;
  const {
    name,
    number,
    source_station_id,
    destination_station_id,
    departure_time,
    arrival_time,
    distance_from_source,
    available_seats,
    fare_per_km
  } = req.body;
  
  try {
    // Check if train exists
    const [existingTrains] = await db.query(
      'SELECT id FROM trains WHERE id = ?',
      [trainId]
    );
    
    if (existingTrains.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Update train
    await db.query(
      `UPDATE trains SET
        name = ?, number = ?, source_station_id = ?, destination_station_id = ?,
        departure_time = ?, arrival_time = ?, distance_from_source = ?,
        available_seats = ?, fare_per_km = ?
      WHERE id = ?`,
      [
        name, number, source_station_id, destination_station_id,
        departure_time, arrival_time, distance_from_source,
        available_seats, fare_per_km, trainId
      ]
    );
    
    // Get updated train
    const [trains] = await db.query(`
      SELECT t.*, 
        s1.name as source_name, s1.code as source_code,
        s2.name as destination_name, s2.code as destination_code
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE t.id = ?
    `, [trainId]);
    
    res.json({
      success: true,
      train: trains[0],
      message: 'Train updated successfully'
    });
  } catch (err) {
    console.error('Train update error:', err);
    res.status(500).json({ error: 'Failed to update train' });
  }
});

// Delete a train (admin only)
app.delete('/api/admin/trains/:id', verifyToken(true), async (req, res) => {
  const trainId = req.params.id;
  
  try {
    // Check if train exists
    const [existingTrains] = await db.query(
      'SELECT id FROM trains WHERE id = ?',
      [trainId]
    );
    
    if (existingTrains.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Check if train has bookings
    const [bookings] = await db.query(
      'SELECT id FROM bookings WHERE train_id = ? LIMIT 1',
      [trainId]
    );
    
    if (bookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete train with existing bookings' });
    }
    
    // Delete train stops first (foreign key constraint)
    await db.query('DELETE FROM train_stops WHERE train_id = ?', [trainId]);
    
    // Delete train
    await db.query('DELETE FROM trains WHERE id = ?', [trainId]);
    
    res.json({
      success: true,
      message: 'Train deleted successfully'
    });
  } catch (err) {
    console.error('Train deletion error:', err);
    res.status(500).json({ error: 'Failed to delete train' });
  }
});

// Add a new station (admin only)
// Get all stations (admin version - can include additional admin-only data)
app.get('/api/admin/stations', verifyToken(true), async (req, res) => {
  try {
    const [stations] = await db.query(`
      SELECT s.*, 
        COUNT(t1.id) AS trains_from,
        COUNT(t2.id) AS trains_to
      FROM stations s
      LEFT JOIN trains t1 ON s.id = t1.source_station_id
      LEFT JOIN trains t2 ON s.id = t2.destination_station_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    
    res.json(stations);
  } catch (err) {
    console.error('Admin stations fetch error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch stations',
      details: err.message
    });
  }
});

// Get dashboard stats (admin only)
app.get('/api/admin/stats', verifyToken(true), async (req, res) => {
  try {
    // Get user count
    const [userStats] = await db.query('SELECT COUNT(*) as total FROM users');
    
    // Get booking counts
    const [bookingStats] = await db.query('SELECT COUNT(*) as total FROM bookings');
    
    // Get train counts
    const [trainStats] = await db.query('SELECT COUNT(*) as total FROM trains');
    
    // Get recent bookings
    const [recentBookings] = await db.query(`
      SELECT b.id, b.pnr_number, u.username, t.name as train_name, 
        t.number as train_number, b.booking_date
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN trains t ON b.train_id = t.id
      ORDER BY b.booking_date DESC
      LIMIT 5
    `);
    
    // Get payment stats
    // Get payment stats
    const [paymentStats] = await db.query(`
      SELECT SUM(amount) as total_revenue FROM payments WHERE payment_status = 'Success'
    `);
    
    // Get class-wise booking stats
    const [classStats] = await db.query(`
      SELECT class_type, COUNT(*) as count
      FROM bookings
      GROUP BY class_type
      ORDER BY count DESC
    `);
    
    res.json({
      users: {
        total: userStats[0].total
      },
      bookings: {
        total: bookingStats[0].total
      },
      trains: {
        total: trainStats[0].total
      },
      revenue: {
        total: paymentStats[0].total_revenue || 0
      },
      recentBookings,
      classStats
    });
  } catch (err) {
    console.error('Admin stats fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Cancel booking (admin only)
app.put('/api/admin/bookings/:pnr/cancel', verifyToken(true), async (req, res) => {
  const { pnr } = req.params;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get booking details
    const [bookings] = await connection.query(`
      SELECT b.*, 
        COUNT(*) as passenger_count 
      FROM bookings b 
      WHERE b.pnr_number = ?
      GROUP BY b.train_id, b.user_id, b.pnr_number
    `, [pnr]);
    
    if (bookings.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookings[0];
    
    // Update booking status
    await connection.query(
      'UPDATE bookings SET status = "Cancelled" WHERE pnr_number = ?',
      [pnr]
    );
    
    // Update payment status
    await connection.query(
      'UPDATE payments SET payment_status = "Refunded" WHERE booking_id = ?',
      [pnr]
    );
    
    // Return seats to train inventory
    await connection.query(
      'UPDATE trains SET available_seats = available_seats + ? WHERE id = ?',
      [booking.passenger_count, booking.train_id]
    );
    
    await connection.commit();
    connection.release();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      pnrNumber: pnr
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Booking cancellation error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get all train stops (admin only)
app.get('/api/admin/trains/:id/stops', verifyToken(true), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if train exists
    const [trains] = await db.query('SELECT id FROM trains WHERE id = ?', [id]);
    
    if (trains.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Get stops
    const [stops] = await db.query(`
      SELECT ts.*, s.name as station_name, s.code as station_code
      FROM train_stops ts
      JOIN stations s ON ts.station_id = s.id
      WHERE ts.train_id = ?
      ORDER BY ts.sequence_number
    `, [id]);
    
    res.json(stops);
  } catch (err) {
    console.error('Train stops fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch train stops' });
  }
});
app.post('/api/admin/stations', verifyToken(true), async (req, res) => {
  const { name, code, city, state } = req.body;
  
  try {
    // Validate required fields
    if (!name || !code || !city || !state) {
      return res.status(400).json({ 
        error: 'Name, code, city, and state are required',
        missing: {
          name: !name,
          code: !code,
          city: !city,
          state: !state
        }
      });
    }

    // Check if station already exists
    const [existingStations] = await db.query(
      'SELECT id FROM stations WHERE name = ? OR code = ?',
      [name, code]
    );
    
    if (existingStations.length > 0) {
      return res.status(400).json({ 
        error: 'Station already exists',
        conflicts: {
          name: existingStations.some(s => s.name === name),
          code: existingStations.some(s => s.code === code)
        }
      });
    }

    // Insert new station
    const [result] = await db.query(
      'INSERT INTO stations (name, code, city, state) VALUES (?, ?, ?, ?)',
      [name, code, city, state]
    );

    // Return the created station
    const [stations] = await db.query('SELECT * FROM stations WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      success: true,
      station: stations[0],
      message: 'Station created successfully'
    });
  } catch (err) {
    console.error('Station creation error:', err);
    res.status(500).json({ 
      error: 'Failed to create station',
      details: err.message,
      code: err.code
    });
  }
});

// Add train stop (admin only)
app.post('/api/admin/trains/:id/stops', verifyToken(true), async (req, res) => {
  const { id } = req.params;
  const { station_id, arrival_time, departure_time, distance_from_source, sequence_number } = req.body;
  
  try {
    // Check if train exists
    const [trains] = await db.query('SELECT id FROM trains WHERE id = ?', [id]);
    
    if (trains.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Check if station exists
    const [stations] = await db.query('SELECT id FROM stations WHERE id = ?', [station_id]);
    
    if (stations.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    // Check if stop already exists
    const [existingStops] = await db.query(
      'SELECT id FROM train_stops WHERE train_id = ? AND station_id = ?',
      [id, station_id]
    );
    
    if (existingStops.length > 0) {
      return res.status(400).json({ error: 'Stop already exists for this train' });
    }
    
    // Add stop
    const [result] = await db.query(
      `INSERT INTO train_stops (
        train_id, station_id, arrival_time, departure_time,
        distance_from_source, sequence_number
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id, station_id, arrival_time, departure_time,
        distance_from_source, sequence_number
      ]
    );
    
    // Get the new stop
    const [stops] = await db.query(`
      SELECT ts.*, s.name as station_name, s.code as station_code
      FROM train_stops ts
      JOIN stations s ON ts.station_id = s.id
      WHERE ts.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      stop: stops[0],
      message: 'Train stop added successfully'
    });
  } catch (err) {
    console.error('Train stop creation error:', err);
    res.status(500).json({ error: 'Failed to add train stop' });
  }
});

// Update train stop (admin only)
app.put('/api/admin/train-stops/:id', verifyToken(true), async (req, res) => {
  const { id } = req.params;
  const { arrival_time, departure_time, distance_from_source, sequence_number } = req.body;
  
  try {
    // Check if stop exists
    const [stops] = await db.query('SELECT id FROM train_stops WHERE id = ?', [id]);
    
    if (stops.length === 0) {
      return res.status(404).json({ error: 'Train stop not found' });
    }
    
    // Update stop
    await db.query(
      `UPDATE train_stops SET
        arrival_time = ?, departure_time = ?,
        distance_from_source = ?, sequence_number = ?
      WHERE id = ?`,
      [
        arrival_time, departure_time,
        distance_from_source, sequence_number,
        id
      ]
    );
    
    // Get the updated stop
    const [updatedStops] = await db.query(`
      SELECT ts.*, s.name as station_name, s.code as station_code
      FROM train_stops ts
      JOIN stations s ON ts.station_id = s.id
      WHERE ts.id = ?
    `, [id]);
    
    res.json({
      success: true,
      stop: updatedStops[0],
      message: 'Train stop updated successfully'
    });
  } catch (err) {
    console.error('Train stop update error:', err);
    res.status(500).json({ error: 'Failed to update train stop' });
  }
});

// Delete train stop (admin only)
app.delete('/api/admin/train-stops/:id', verifyToken(true), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if stop exists
    const [stops] = await db.query('SELECT id FROM train_stops WHERE id = ?', [id]);
    
    if (stops.length === 0) {
      return res.status(404).json({ error: 'Train stop not found' });
    }
    
    // Delete stop
    await db.query('DELETE FROM train_stops WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Train stop deleted successfully'
    });
  } catch (err) {
    console.error('Train stop deletion error:', err);
    res.status(500).json({ error: 'Failed to delete train stop' });
  }
});

// Generate system reports (admin only)
app.get('/api/admin/reports/:type', verifyToken(true), async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate } = req.query;
  
  try {
    let reportData = {};
    
    switch (type) {
      case 'bookings': {
        // Booking reports with date filtering
        let query = `
          SELECT 
            DATE(b.booking_date) as date,
            COUNT(*) as total_bookings,
            SUM(b.fare) as total_revenue
          FROM bookings b
          WHERE 1=1
        `;
        
        const params = [];
        
        if (startDate) {
          query += ' AND b.booking_date >= ?';
          params.push(startDate);
        }
        
        if (endDate) {
          query += ' AND b.booking_date <= ?';
          params.push(endDate);
        }
        
        query += ' GROUP BY DATE(b.booking_date) ORDER BY date';
        
        const [bookingStats] = await db.query(query, params);
        
        // Class-wise stats
        const [classStats] = await db.query(`
          SELECT 
            class_type,
            COUNT(*) as bookings,
            SUM(fare) as revenue
          FROM bookings
          ${startDate ? 'WHERE booking_date >= ?' : ''}
          ${endDate ? (startDate ? 'AND booking_date <= ?' : 'WHERE booking_date <= ?') : ''}
          GROUP BY class_type
          ORDER BY bookings DESC
        `, [startDate, endDate].filter(Boolean));
        
        reportData = {
          daily: bookingStats,
          byClass: classStats
        };
        break;
      }
      
      case 'trains': {
        // Most popular trains
        const [popularTrains] = await db.query(`
          SELECT 
            t.id, t.name, t.number,
            COUNT(b.id) as total_bookings,
            SUM(b.fare) as total_revenue
          FROM trains t
          LEFT JOIN bookings b ON t.id = b.train_id
          ${startDate ? 'WHERE b.booking_date >= ?' : ''}
          ${endDate ? (startDate ? 'AND b.booking_date <= ?' : 'WHERE b.booking_date <= ?') : ''}
          GROUP BY t.id
          ORDER BY total_bookings DESC
          LIMIT 10
        `, [startDate, endDate].filter(Boolean));
        
        reportData = {
          popularTrains
        };
        break;
      }
      
      case 'users': {
        // User engagement stats
        const [userStats] = await db.query(`
          SELECT 
            COUNT(DISTINCT u.id) as total_users,
            COUNT(DISTINCT b.user_id) as users_with_bookings,
            AVG(bookings_per_user.booking_count) as avg_bookings_per_user
          FROM users u
          LEFT JOIN bookings b ON u.id = b.user_id
          LEFT JOIN (
            SELECT user_id, COUNT(*) as booking_count
            FROM bookings
            GROUP BY user_id
          ) as bookings_per_user ON u.id = bookings_per_user.user_id
        `);
        
        // Top users by booking count
        const [topUsers] = await db.query(`
          SELECT 
            u.id, u.username, u.email,
            COUNT(b.id) as booking_count,
            SUM(b.fare) as total_spent
          FROM users u
          JOIN bookings b ON u.id = b.user_id
          ${startDate ? 'WHERE b.booking_date >= ?' : ''}
          ${endDate ? (startDate ? 'AND b.booking_date <= ?' : 'WHERE b.booking_date <= ?') : ''}
          GROUP BY u.id
          ORDER BY booking_count DESC
          LIMIT 10
        `, [startDate, endDate].filter(Boolean));
        
        reportData = {
          stats: userStats[0],
          topUsers
        };
        break;
      }
      
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
    
    res.json({
      success: true,
      reportType: type,
      dateRange: {
        startDate: startDate || 'all time',
        endDate: endDate || 'present'
      },
      data: reportData
    });
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});
// Get all trains (admin only)
app.get('/api/admin/trains', verifyToken(true), async (req, res) => {
  try {
    const [trains] = await db.query(`
      SELECT t.*, 
        s1.name as source_name, s1.code as source_code,
        s2.name as destination_name, s2.code as destination_code
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      ORDER BY t.id
    `);
    
    res.json(trains);
  } catch (err) {
    console.error('Admin trains fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch trains' });
  }
});
app.post('/api/admin/trains', verifyToken(true), async (req, res) => {
  // Required fields validation
  const requiredFields = [
    'name', 'number', 
    'source_station_id', 'destination_station_id',
    'departure_time', 'arrival_time'
  ];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }

  // Set defaults for optional fields
  const trainData = {
    ...req.body,
    distance_from_source: req.body.distance_from_source || 0,
    available_seats: req.body.available_seats || 0,
    fare_per_km: req.body.fare_per_km || 0
  };

  try {
    // Insert train
    const [result] = await db.query(
      `INSERT INTO trains SET ?`, 
      [trainData]
    );

    // Return created train with station details
    const [trains] = await db.query(`
      SELECT t.*, 
        s1.name as source_name, s1.code as source_code,
        s2.name as destination_name, s2.code as destination_code
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE t.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      train: trains[0]
    });
    
  } catch (err) {
    console.error('Train creation error:', err);
    res.status(500).json({
      error: 'Failed to create train',
      details: err.message,
      sql: err.sql
    });
  }
});

// Create SQL migration for is_admin column
app.get('/api/admin/setup', async (req, res) => {
  try {
    // Check if is_admin column exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'
    `);
    
    if (columns.length === 0) {
      // Column doesn't exist, add it
      await db.query(`
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false
      `);
      
      // Set first user as admin
      await db.query(`
        UPDATE users SET is_admin = true WHERE id = 1
      `);
      
      res.json({
        success: true,
        message: 'Admin column added to users table and first user set as admin'
      });
    } else {
      res.json({
        success: true,
        message: 'Admin system already set up'
      });
    }
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ error: 'Failed to set up admin system' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});