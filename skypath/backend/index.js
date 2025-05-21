const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Hacer accesible la carpeta de imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // O tu contraseña
  database: 'skypath'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a MySQL');
});

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando');
});

// Ruta para registrar usuario
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: 'Error al encriptar' });
    }

    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email ya existe' });
        }
        return res.status(500).json({ message: 'Error en base de datos' });
      }

      res.status(201).json({ message: 'Usuario registrado' });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error en consulta:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Login correcto
      res.json({ message: 'Login exitoso', userId: user.id, name: user.name });
    });
  });
});

// Ruta para obtener el perfil del usuario por id enviado en header
app.get('/api/profile', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ message: 'Falta el ID del usuario' });
  }

  const sql = 'SELECT id, name, email, birthdate, location, profile_picture FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error en base de datos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  });
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // asegúrate de que esta carpeta exista
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

app.put('/api/profile', upload.single('profile_picture'), (req, res) => {
  const { email, name, birthdate, location } = req.body;  // <-- Agregado 'name'
  const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

  const updateFields = [];
  const values = [];

  if (name) {  // <-- Actualiza nombre si existe
    updateFields.push('name = ?');
    values.push(name);
  }

  if (birthdate) {
    updateFields.push('birthdate = ?');
    values.push(birthdate);
  }

  if (location) {
    updateFields.push('location = ?');
    values.push(location);
  }

  if (profile_picture) {
    updateFields.push('profile_picture = ?');
    values.push(profile_picture);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No hay datos para actualizar' });
  }

  values.push(email); // para el WHERE

  const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE email = ?`;
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar perfil:', err);
      return res.status(500).json({ message: 'Error en base de datos' });
    }

    res.json({ 
      message: 'Perfil actualizado correctamente',
      profile_picture: profile_picture
    });
  });
});

// Obtener usuarios (excepto yo)
app.get('/users/:myId', (req, res) => {
  const myId = req.params.myId;
  db.query('SELECT id, name, profile_picture FROM users WHERE id != ?', [myId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Obtener mensajes entre dos usuarios
app.get('/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  db.query(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?) 
    ORDER BY sent_at ASC
  `, [user1, user2, user2, user1], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Enviar mensaje
app.post('/messages', (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  db.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [sender_id, receiver_id, message],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message_id: result.insertId });
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
