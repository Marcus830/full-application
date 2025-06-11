const express = require('express');
const app = express();
const db = require('./db'); // Import the DB connection

app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'null']
})); // This allows all origins — for dev use only

// Add this GET route to fetch all inmates
app.get('/inmates', (req, res) => {
  const sql = 'SELECT * FROM inmates';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).json({ error: 'Database query failed: ' + err.message });
    }
    res.json(results);
  });
});

// Insert new inmate
app.post('/inmates', (req, res) => {
  const {ID, name, crime, sentenceDuration, arrestDate } = req.body; 
  
  const sql = 'INSERT INTO inmates (name, crime, sentenceDuration, arrestDate) VALUES (?, ?, ?, ?)';
  db.query(sql, [ID, name, crime, sentenceDuration, arrestDate], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }
    res.json({ message: 'User added successfully', userId: result.insertId });
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});





