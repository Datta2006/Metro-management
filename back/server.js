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

// Verify token middleware (simplified without role checking)
const verifyToken = () => {
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
      'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, phone]
    );

    const token = jwt.sign(
      { id: result.insertId, username }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: result.insertId, 
        username, 
        email, 
        phone 
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
      { id: user.id, username: user.username }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
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
// Add this to your server code (app.js)
app.get('/api/verify-token', verifyToken(), (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone
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
    
    // Create payment record (using PNR as string)
    await connection.query(
      `INSERT INTO payments (
        booking_id, amount, payment_method, transaction_id, payment_status
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        pnrNumber, // Now matches VARCHAR column type
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
    const [users] = await db.query('SELECT id, username, email, phone FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});