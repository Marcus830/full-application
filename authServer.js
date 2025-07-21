require('dotenv').config();

const express = require('express');
const app = express();
const db = require('./db');
const bcrypt = require('bcrypt');
const cors = require('cors');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')




// Middleware to handle JSON body parsing
app.use(express.json());

// Middleware to handle CORS
app.use(cors({
  origin: ['http://localhost:3000', 'null']
}));

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


// REGISTRATION ROUTE - NO AUTHENTICATION REQUIRED
app.post('/users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields - Updated to match your form
    if (!username || !email || !password || !role) {
      console.log('Missing required fields');
      return res.status(400).json({
        error: 'All fields (username, email, password, role) are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
      if (err) {
        console.error('Database error during user check:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        console.log('User already exists');
        return res.status(409).json({ error: 'User with this email or username already exists' });
      }
      
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user - Updated to match your form fields
        const insertQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
        const insertValues = [username, email, hashedPassword, role];

        db.query(insertQuery, insertValues, (err, result) => {
          if (err) {
            console.error('Database error during insert:', err);
            return res.status(500).json({ error: 'Failed to add user: ' + err.message });
          }
          
          console.log('User inserted successfully with ID:', result.insertId);
          res.status(201).json({ 
            message: 'User added successfully',
            userId: result.insertId 
          });
        });
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        res.status(500).json({ error: 'Password processing failed' });
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// STAFF ROUTE - AUTHENTICATION REQUIRED
app.post('/staff', (req, res) => {
  const { name, role, department, phone } = req.body;

  // Validate required fields
  if (!name || !role || !department || !phone) {
    return res.status(400).json({ error: 'All staff fields are required' });
  }

  const insertQuery = 'INSERT INTO staff (name, role, department, phone) VALUES (?, ?, ?, ?)';
  const insertValues = [name, role, department, phone];

  db.query(insertQuery, insertValues, (err, result) => {
    if (err) {
      console.error('Database error during staff insert:', err);
      return res.status(500).json({ error: 'Failed to add staff: ' + err.message });
    }

    console.log('Staff inserted with ID:', result.insertId);
    res.status(201).json({ message: 'Staff added successfully', staffId: result.insertId });
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}



// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});