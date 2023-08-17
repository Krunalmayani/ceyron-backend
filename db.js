var mysql = require('mysql2');
require('dotenv').config();

var db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.MYSQL_DB,
  waitForConnections: true
};

var connection;

function handleDisconnect() {

  connection = mysql.createPool(db_config);

  connection.getConnection(function (err, con) {
    if (err) {
      console.error('Error connecting to database:', err);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
    }
    if (con) {
      console.error("Connected :)");
    }
  })

  connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });

}

handleDisconnect();

module.exports = connection;
