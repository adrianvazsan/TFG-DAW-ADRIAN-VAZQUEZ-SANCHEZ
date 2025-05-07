// db/config.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Cambia esto si tu MySQL tiene contraseña
  database: 'skypath'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Base de datos conectada');
});

module.exports = connection;
