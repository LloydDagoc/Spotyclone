const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer'); 
const db = require('./config/database');
const routes = require('./routes/music_routes');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });


app.use('/', routes);

app.post('/upload', upload.single('musicFile'), (req, res) => {
  const { title } = req.body;

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = `/uploads/${req.file.filename}`;

  const sql = 'INSERT INTO music (title, file_path) VALUES (?, ?)';
  db.query(sql, [title, filePath], (err) => {
    if (err) throw err;
    res.redirect('/'); 
  });
});

app.use((req, res, next) => {
  res.status(404).render('404', { message: 'Page not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
