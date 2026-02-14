require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ── Process guards ──
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err.stack || err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED_REJECTION]', err);
  process.exit(1);
});

// ── Middleware ──
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiting ──
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down, brother.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Wait 15 minutes.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health ──
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    stage: '215_FORUM_MVP',
    anchor: process.env.PROHP_ANCHOR || 'E3592DC3',
    port: PORT,
    ts: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', stage: 215, ts: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/threads', require('./routes/threads'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/compounds', require('./routes/compounds'));
app.use('/api/cycles', require('./routes/cycles'));

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`[STAGE_215] ProHP Forum API`);
  console.log(`[STAGE_215] Port: ${PORT} | PID: ${process.pid} | Node: ${process.version}`);
  console.log(`[STAGE_215] Anchor: ${process.env.PROHP_ANCHOR || 'E3592DC3'}`);
  console.log(`[STAGE_215] Proof Over Hype.`);
});
