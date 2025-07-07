const mysql = require('mysql2/promise');

const dbUrl = process.env.DATABASE_URL || '';
let config;

if (dbUrl) {
  // Format attendu : mysql://user:password@host:port/database
  const url = new URL(dbUrl);
  config = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    port: url.port || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
} else {
  config = {
    host: 'localhost',
    user: 'root',
    password: '13135690',
    database: 'db_biblio',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

const connection = mysql.createPool(config);

module.exports = connection;
  
