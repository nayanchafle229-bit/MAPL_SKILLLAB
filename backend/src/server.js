require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// Reflect whatever origin the request came from (localhost, LAN IP, public IP).
// `origin: true` echoes the request's Origin header, which is required because
// `credentials: true` forbids the "*" wildcard.
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const c = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${c}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} — ${Date.now()-start}ms`);
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/user',       require('./routes/user'));
app.use('/api/course',     require('./routes/course'));
app.use('/api/question',   require('./routes/question'));
app.use('/api/admin/quiz', require('./routes/quizAdmin'));    // Admin quiz CRUD
app.use('/api/quiz',       require('./routes/quizStudent'));  // Student quiz flow
app.use('/api/admin',      require('./routes/admin'));

app.use((req, res) => res.status(404).json({ message: `Route ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Smart Quiz API  → http://localhost:${PORT}`);
    console.log(`👤 Admin: username=a  password=a\n`);
  });
});

module.exports = app;
