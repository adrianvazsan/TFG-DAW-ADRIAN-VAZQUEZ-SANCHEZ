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
  allowedHeaders: ['Content-Type', 'x-user-id']
}));

app.use(express.json({ limit: '10mb' })); // o más, según lo que necesites
app.use(express.urlencoded({ limit: '10mb', extended: true }));


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

  const sql = 'SELECT id, name, email, birthdate, location, profile_picture, bio FROM users WHERE id = ?';
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

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `post-${Date.now()}${ext}`);
  }
});

const postUpload = multer({ storage: postStorage });


app.put('/api/profile', upload.single('profile_picture'), (req, res) => {
  const { userId, name, birthdate, location, bio } = req.body;
  const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

  if (!userId) {
    return res.status(400).json({ message: 'Falta el ID del usuario' });
  }

  const updateFields = [];
  const values = [];

  if (name) {
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
  if (bio) {
  updateFields.push('bio = ?');
  values.push(bio);
  }

  if (profile_picture) {
    updateFields.push('profile_picture = ?');
    values.push(profile_picture);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No hay datos para actualizar' });
  }

  values.push(userId); // Usamos ID en lugar de email

  const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
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

// Obtener todas las publicaciones (ordenadas por fecha)
app.get('/posts', (req, res) => {
  db.query(`
    SELECT p.*, u.name, u.profile_picture 
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.posted_at DESC
  `, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al obtener publicaciones' });
    res.json(result);
  });
});

// Crear nueva publicación
app.post('/posts', postUpload.single('image'), (req, res) => {
  const { user_id, title, description, location_name, coordinates } = req.body;

  if (!user_id || !description || !req.file) {
    return res.status(400).json({ message: 'Faltan campos requeridos o imagen' });
  }

  const image_url = `/uploads/${req.file.filename}`;

  const sql = `
    INSERT INTO posts (user_id, title, description, image_url, location_name, coordinates)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [user_id, title, description, image_url, location_name, coordinates], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al guardar publicación' });
    res.json({ success: true, postId: result.insertId });
  });
});

app.post('/posts/:postId/like', (req, res) => {
  const { userId } = req.body;
  const postId = req.params.postId;

  if (!userId || !postId) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  const checkQuery = `SELECT score FROM rating WHERE user_id = ? AND post_id = ?`;
  db.query(checkQuery, [userId, postId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error en base de datos' });

    if (result.length > 0 && result[0].score === 1) {
      // Ya tiene like, lo quitamos (score = 0)
      const updateQuery = `UPDATE rating SET score = 0 WHERE user_id = ? AND post_id = ?`;
      db.query(updateQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: 'Error al quitar like' });
        return res.json({ liked: false });
      });
    } else if (result.length > 0) {
      // Ya existe, lo reactivamos
      const updateQuery = `UPDATE rating SET score = 1 WHERE user_id = ? AND post_id = ?`;
      db.query(updateQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: 'Error al dar like' });
        return res.json({ liked: true });
      });
    } else {
      // No existe, lo insertamos
      const insertQuery = `INSERT INTO rating (user_id, post_id, score) VALUES (?, ?, 1)`;
      db.query(insertQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: 'Error al dar like' });
        return res.json({ liked: true });
      });
    }
  });
});

app.get('/posts/:postId/likes', (req, res) => {
  const { postId } = req.params;
  const sql = `SELECT COUNT(*) AS likes FROM rating WHERE post_id = ? AND score = 1`;
  db.query(sql, [postId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al obtener likes' });
    res.json(result[0]);
  });
});

// Buscar usuarios por nombre
app.get('/search-users', (req, res) => {
  const q = req.query.q || '';
  const sql = 'SELECT id, name, profile_picture FROM users WHERE name LIKE ? LIMIT 20';
  db.query(sql, [`%${q}%`], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar usuarios:', err);
      return res.status(500).json({ message: 'Error en base de datos' });
    }
    res.json(results);
  });
});




app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
