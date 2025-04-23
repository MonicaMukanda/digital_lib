const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'library_secret',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');

// File upload config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => res.render('index'));

app.get('/register', (req, res) => res.render('register'));

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length && results[0].password === password) {
      req.session.user = results[0];
      res.redirect('/dashboard');
    } else {
      res.send('Invalid login.');
    }
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  
  const search = req.query.search || '';
  db.query(
    'SELECT * FROM resources WHERE title LIKE ? OR description LIKE ?',
    [`%${search}%`, `%${search}%`],
    (err, resources) => {
      if (err) throw err;
      res.render('dashboard', {
        user: req.session.user,
        resources,
        search
      });
    }
  );
});
app.get('/upload', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/');
  res.render('upload');
});

app.post('/upload', upload.single('file'), (req, res) => {
  const { title, description } = req.body;
  const filePath = req.file.filename;
  const uploadedBy = req.session.user.user_id;

  db.query('INSERT INTO resources (title, description, file_path, uploaded_by) VALUES (?, ?, ?, ?)', [title, description, filePath, uploadedBy], (err) => {
    if (err) throw err;
    res.redirect('/dashboard');
  });
});

app.get('/notes', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const sql = `
    SELECT notes.comment, users.username
    FROM notes
    JOIN users ON notes.user_id = users.user_id
    ORDER BY notes.note_date DESC
  `;

  db.query(sql, (err, notes) => {
    if (err) throw err;
    console.log('Fetched notes', notes);
    res.render('notes', { notes });
  });
});

app.post('/notes', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const comment = req.body.comment;
  const userId = req.session.user.user_id;

  db.query('INSERT INTO notes (user_id, comment) VALUES (?, ?)', [userId, comment], (err) => {
    if (err) throw err;
    res.redirect('/notes');
  });
});

app.get('/delete/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Not authorized');
  }

  const resourceId = req.params.id;
  db.query('DELETE FROM resources WHERE resource_id = ?', [resourceId], (err) => {
    if (err) throw err;
    res.redirect('/dashboard');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});