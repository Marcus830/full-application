const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',      // or your DB host
  user: 'root',
  password: 'Scholarlife1',
  database: 'jail'
});


connection.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});


module.exports = connection;