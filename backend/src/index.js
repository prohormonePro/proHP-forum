// SOVEREIGN_L5 stage 217 - crown test - 2026-03-12T05:26:03Z
// SOVEREIGN_L5 canary - stage 216 - deployed via autonomous executor
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const stripeWebhookHandler = require('./handlers/webhooksStripe');
const cookieParser = require('cookie-parser');
const communityComments = require('./routes/communityComments');

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err.stack || err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', reason);
});

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());

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

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    stage: '264',
    anchor: process.env.PROHP_ANCHOR || 'E3592DC3',
    port: PORT,
    ts: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', stage: 264, ts: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/threads', require('./routes/threads'));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/consultation-intake', require('./routes/consultationIntake'));
app.use('/api/compounds', require('./routes/compounds'));
app.use('/api/cycles', require('./routes/cycles'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/claim-account', require('./routes/claim'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/community-comments', communityComments);
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/youtube/comments', require('./routes/youtubeComments'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  console.log('[STAGE_264] ProHP Forum API');
  console.log(`[STAGE_264] Port: ${PORT} | PID: ${process.pid} | Node: ${process.version}`);
  console.log(`[STAGE_264] Anchor: ${process.env.PROHP_ANCHOR || 'E3592DC3'}`);
  console.log('[STAGE_264] Proof Over Hype.');
});
