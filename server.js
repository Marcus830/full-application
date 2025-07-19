const express = require('express');
const app = express();
const db = require('./db'); // Import the DB connection

app.use(express.json());

const cors = require('cors');

app.use(cors({

  origin: ['http://localhost:3000', 'null']

})); // This allows all origins — for dev use only

//logging helper function
async function logActivity(userId, action, module, description, ip) {
  const sql = `
    INSERT INTO activity_logs (user_id, action, module, description, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [userId, action, module, description, ip], (err) => {
    if (err) {
      console.error('Log error:', err.message);
    }
  });
}

app.get('/activity-logs', (req, res) => {
  const sql = `
    SELECT * FROM activity_logs
    ORDER BY timestamp DESC
    LIMIT 100
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Log fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
    res.json(results);
  });
});

//number of inmates
app.get('/inmates/count', (req, res) => {

  const sql = 'SELECT COUNT(*) AS total FROM inmates';

  db.query(sql, (err, results) => {

    if (err) {

      console.error('Count error:', err);

      return res.status(500).json({ error: 'Database count failed' });

    }
    res.json({ total: results[0].total });

  });

});

//number of staff
app.get('/staff/count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM staff';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Count error:', err);
      return res.status(500).json({ error: 'Database count failed' });
    }
    res.json({ total: results[0].total });
  });
});

// Add this GET route to fetch all inmates
app.get('/inmates', (req, res) => {
  const sql = 'SELECT * FROM jail.inmates';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).json({ error: 'Database query failed: ' + err.message });
    }
    res.json(results);
  });
});

// Add this GET route to fetch inmate by ID
// This route fetches a specific inmate by ID
app.get('/inmates/:id', (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM jail.inmates WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching inmate by ID:', err);
      res.status(500).json({ error: 'Database error' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Inmate not found' });
    } else {
      res.json(results[0]); // Return the single record
    }
  });
});

//fetch inmate bio
app.get('/bio/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM jail.bio WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching inmate bio by ID:', err);
      res.status(500).json({ error: 'Database error' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Inmate not found' });
    } else {
      res.json(results);
    }
  });
});

// Insert new inmate
app.post('/inmates', (req, res) => {
  const id = req.params.id;
  const { name, crime, sentenceDuration, arrestDate } = req.body;
  const ip = req.ip;
  const userId = 1; // TODO: Replace with actual logged-in user ID when auth is implemented

  const sql = 'INSERT INTO inmates (name, crime, sentenceDuration, arrestDate) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, crime, sentenceDuration, arrestDate], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Database insert failed' }); //TODO: changed schema, might have thrown error
    }
    // Log this activity
    logActivity(userId, 'Create', 'Inmates', `Created inmate ID ${result.insertId}`, ip);
    res.json({ message: 'User added successfully', userId: result.insertId });
  });
});

// Update inmate
app.put('/inmates/:id', (req, res) => {
  const id = req.params.id;
  const { name, crime, sentenceDuration, arrestDate } = req.body;
  const ip = req.ip;
  const userId = 1; // TODO: Replace with actual logged-in user ID when auth is implemented

  const sql = 'UPDATE inmates SET name = ?, crime = ?, sentenceDuration = ?, arrestDate = ? WHERE id = ?';
  db.query(sql, [name, crime, sentenceDuration, arrestDate, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    // Log this activity
    logActivity(userId, 'Update', 'Inmates', `Updated inmate ID ${id}`, ip);

    res.json({ message: 'Inmate updated successfully' });
  });
});


// Delete inmate
app.delete('/inmates/:id', (req, res) => {
  const id = req.params.id;
  const ip = req.ip;
  const userId = 1; // TODO: Replace with actual logged-in user ID when auth is implemented

  db.query('DELETE FROM inmates WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Database delete failed' });
    }
    // Log this activity
    logActivity(userId, 'Delete', 'Inmates', `Deleted inmate ID ${id}`, ip);
    res.json({ message: 'Inmate deleted successfully' });
  });
});

// Get all staff
app.get('/staff', async (req, res) => {
    const sql = 'SELECT * FROM staff';
    db.query(sql, (err, rows) => {
      if (err) {
        console.error('Select error:', err);
        return res.status(500).json({ error: 'database query failed: ' + err.message });
      }
      res.json(rows);
    });
});

// Get staff by ID
// This route fetches a specific staff member by ID
app.get('/staff/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new staff
app.post('/staff', (req, res) => {
  const { name, role, department, phone } = req.body;
  const ip = req.ip;
  const userId = 1; // TODO: Replace with actual logged-in user ID when auth is implemented
  db.query('INSERT INTO staff (name, role, department, phone) VALUES (?, ?, ?, ?)', 
    [name, role, department, phone], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      logActivity(userId, 'Create', 'Staff', `Created staff ID ${result.insertId}`, ip);
      res.sendStatus(201);
    });
});

// Update staff
app.put('/staff/:id', (req, res) => {
  const id = req.params.id;
  const { name, role, department, phone } = req.body;
  const ip = req.ip;
  const userId = 1; 
  db.query(
    'UPDATE staff SET name = ?, role = ?, department = ?, phone = ? WHERE id = ?',
    [name, role, department, phone, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      logActivity(userId, 'Update', 'Staff', `Updated staff ID ${id}`, ip);
      res.sendStatus(200);
    }
  );
});

// Delete staff
app.delete('/staff/:id', (req, res) => {
  const id = req.params.id;
  const ip = req.ip;
  const userId = 1; // TODO: Replace with actual logged-in user ID when auth is implemented
  db.query('DELETE FROM staff WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    logActivity(userId, 'Delete', 'Staff', `Deleted staff ID ${id}`, ip);
    res.sendStatus(204);
  });
});

// Search inmates by name or crime
app.post('/inmates/search', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  const sql = `SELECT * FROM jail.inmates WHERE name LIKE ? OR crime LIKE ?`;
  const likeQuery = `%${query}%`;
  db.query(sql, [likeQuery, likeQuery], (err, results) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Database search failed' });
    }
    res.json(results);
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});





