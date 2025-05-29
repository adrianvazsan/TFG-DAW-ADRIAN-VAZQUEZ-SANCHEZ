const express = require('express'); // Framework para servidor web
const mysql = require('mysql'); // Cliente MySQL
const bcrypt = require('bcrypt'); // Librería para hashear contraseñas
const cors = require('cors'); // Middleware para habilitar CORS
const multer = require('multer'); // Middleware para manejo de archivos (multipart/form-data)
const path = require('path'); // Utilidad para trabajar con rutas de archivos

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT','DELETE', 'OPTIONS'],
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

  // Validar campos vacíos
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  // Validar longitud del nombre
  if (name.trim().length < 3) {
    return res.status(400).json({
      message: 'El nombre debe tener al menos 3 caracteres.'
    });
  }

  // Validar formato de la contraseña
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'
    });
  }

  // Encriptar y guardar
  bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    return res.status(500).json({ message: 'Error al encriptar' });
  }

  const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [name.trim(), email, hash, 'user'], (err, result) => {
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


// Ruta para login
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

  const sql = 'SELECT id, name, email, birthdate, location, profile_picture, bio, role FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error en base de datos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(results[0]); // ¡incluye el rol ahora!
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

// Actualizar perfil
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
// Obtener publicaciones de un usuario específico
app.post('/posts/:postId/like', (req, res) => {
  const { userId } = req.body;
  const postId = req.params.postId;

  if (!userId || !postId) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
// Verificar si ya existe un like de este usuario a esta publicación
  const checkQuery = `SELECT * FROM ratings WHERE user_id = ? AND post_id = ?`;
  db.query(checkQuery, [userId, postId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error en base de datos' });

    if (result.length > 0) {
      // Ya existe like, entonces lo quitamos eliminando la fila
      const deleteQuery = `DELETE FROM ratings WHERE user_id = ? AND post_id = ?`;
      db.query(deleteQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: 'Error al quitar like' });
        return res.json({ liked: false });
      });
    } else {
      // No existe like, lo insertamos
      const insertQuery = `INSERT INTO ratings (user_id, post_id, score) VALUES (?, ?, 1)`;
      db.query(insertQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: 'Error al dar like' });
        return res.json({ liked: true });
      });
    }
  });
});

// Obtener cantidad de likes de una publicación
app.get('/posts/:postId/likes', (req, res) => {
  const { postId } = req.params;
  const sql = `SELECT COUNT(*) AS likes FROM ratings WHERE post_id = ? AND score = 1`;
  db.query(sql, [postId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al obtener likes' });
    res.json(result[0]);
  });
});
// Eliminar publicación
app.delete('/posts/:id', (req, res) => {
  const postId = req.params.id;

  const sql = 'DELETE FROM posts WHERE post_id = ?';
  db.query(sql, [postId], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar publicación' });
    res.json({ success: true });
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
// Verificar si hay mensajes no leídos para el usuario
app.get('/notifications/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT COUNT(*) AS unreadCount
    FROM messages
    WHERE receiver_id = ? AND is_read = 0
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al verificar mensajes' });
    res.json({ unreadCount: result[0].unreadCount });
  });
});
// Marcar mensajes como leídos
app.put('/messages/read/:receiverId/:senderId', (req, res) => {
  const { receiverId, senderId } = req.params;
  const sql = `
    UPDATE messages
    SET is_read = 1
    WHERE receiver_id = ? AND sender_id = ? AND is_read = 0
  `;
  db.query(sql, [receiverId, senderId], (err) => {
    if (err) return res.status(500).json({ message: 'Error al marcar como leídos' });
    res.json({ success: true });
  });
});

// Obtener usuarios (excepto yo) con cantidad de mensajes no leídos
app.get('/users-with-unread/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT u.id, u.name, u.profile_picture,
           COUNT(m.message_id) AS unreadCount
    FROM follows f
    JOIN users u ON u.id = f.followed_id
    LEFT JOIN messages m 
      ON u.id = m.sender_id 
     AND m.receiver_id = ? 
     AND m.is_read = 0
    WHERE f.follower_id = ?
    GROUP BY u.id
  `;

  db.query(sql, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener chats de seguidos con mensajes' });
    res.json(results);
  });
});


app.get('/api/continents', (req, res) => {
  const sql = 'SELECT id, name FROM continents ORDER BY name';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener continentes' });
    res.json(results);
  });
});
app.get('/api/countries/:continentId', (req, res) => {
  const continentId = req.params.continentId;
  const sql = 'SELECT id, name FROM countries WHERE continent_id = ? ORDER BY name';
  db.query(sql, [continentId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener países' });
    res.json(results);
  });
});
app.get('/api/recommended-places/:countryId', (req, res) => {
  const countryId = req.params.countryId;
  const sql = 'SELECT id, title, image_url FROM recommended_places WHERE country_id = ? ORDER BY title';
  db.query(sql, [countryId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener lugares' });
    res.json(results);
  });
});
const placeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/places');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const placeUpload = multer({ storage: placeStorage });

// Agregar lugar recomendado a un país específico
app.post('/api/recommended-places/:countryId', placeUpload.single('image'), (req, res) => {
  const { title } = req.body;
  const country_id = req.params.countryId;

  if (!title || !req.file) {
    return res.status(400).json({ message: 'Faltan datos o imagen' });
  }

  const image_url = `/uploads/places/${req.file.filename}`;

  db.query(
    'INSERT INTO recommended_places (title, image_url, country_id) VALUES (?, ?, ?)',
    [title, image_url, country_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error en base de datos' });
      res.json({ success: true });
    }
  );
});

// Agregar continente
app.post('/api/continents', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Nombre requerido' });

  db.query('INSERT INTO continents (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos' });
    res.status(201).json({ id: result.insertId, name });
  });
});
// Agregar país
app.post('/api/countries', (req, res) => {
  const { name, continent_id } = req.body;
  if (!name || !continent_id) return res.status(400).json({ message: 'Faltan datos' });

  db.query('INSERT INTO countries (name, continent_id) VALUES (?, ?)', [name, continent_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al agregar país' });
    res.status(201).json({ id: result.insertId, name });
  });
});
// Agregar lugar recomendado
app.post('/api/recommended-places', (req, res) => {
  const { title, image_url, country_id } = req.body;
  if (!title || !country_id) return res.status(400).json({ message: 'Faltan datos' });

  db.query('INSERT INTO recommended_places (title, image_url, country_id) VALUES (?, ?, ?)', [title, image_url || null, country_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al agregar lugar' });
    res.status(201).json({ id: result.insertId, title });
  });
});
// Eliminar continente
app.delete('/api/continents/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM continents WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar continente' });
    res.json({ success: true });
  });
});

// Eliminar país
app.delete('/api/countries/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM countries WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar país' });
    res.json({ success: true });
  });
});

// Eliminar lugar recomendado
app.delete('/api/recommended-places/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM recommended_places WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar lugar' });
    res.json({ success: true });
  });
});

// Seguir a un usuario
app.post('/follow', (req, res) => {
  const { followerId, followedId } = req.body;

  if (!followerId || !followedId) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  // Evitar seguirse a sí mismo
  if (followerId === followedId) {
    return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
  }
  // Verificar si ya se sigue
  const query = 'INSERT IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)';
  db.query(query, [followerId, followedId], (err) => {
    if (err) {
      console.error('❌ Error al seguir usuario:', err);
      return res.status(500).json({ message: 'Error en base de datos' });
    }
    res.json({ message: 'Ahora sigues a este usuario' });
  });
});

// Obtener lista de seguidos por un usuario
app.get('/following/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT u.id, u.name, u.profile_picture
    FROM follows f
    JOIN users u ON u.id = f.followed_id
    WHERE f.follower_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener seguidos' });
    res.json(results);
  });
});

// Obtener lista de seguidores de un usuario
app.get('/followers/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT u.id, u.name, u.profile_picture
    FROM follows f
    JOIN users u ON u.id = f.follower_id
    WHERE f.followed_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener seguidores' });
    res.json(results);
  });
});
// Obtener lista de IDs de seguidos por un usuario
app.get('/api/following-list/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT followed_id FROM follows WHERE follower_id = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener seguidos' });

    const followedIds = results.map(r => r.followed_id);
    res.json(followedIds);
  });
});
// Dejar de seguir
app.post('/unfollow', (req, res) => {
  const { followerId, followedId } = req.body;

  if (!followerId || !followedId) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  const sql = 'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?';
  db.query(sql, [followerId, followedId], (err) => {
    if (err) return res.status(500).json({ message: 'Error al dejar de seguir' });
    res.json({ success: true });
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
