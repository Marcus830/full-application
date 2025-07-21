const mysql = require('mysql2');

// Use a connection pool instead of a single connection
const pool = mysql.createPool({
  host: '127.0.0.1',      // or your DB host
  user: 'root',
  password: 'Scholarlife1',
  database: 'jail',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');

  // Release the connection back to the pool
  connection.release();
});


module.exports = {
  pool,
  query: (...args) => pool.query(...args)
};
