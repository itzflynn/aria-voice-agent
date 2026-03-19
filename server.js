require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const compression = require('compression');
const cors       = require('cors');
const morgan     = require('morgan');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const ENV  = process.env.NODE_ENV || 'development';

// ─── Security & middleware ────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc:     ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
      connectSrc:  ["'self'"],
      mediaSrc:    ["'self'", "blob:"],
      imgSrc:      ["'self'", "data:"],
    }
  }
}));
app.use(compression());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(morgan(ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50kb' }));

// ─── Static frontend ─────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// ─── Health check (for Railway / Render / Docker) ────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'aria-voice-agent',
    version: require('./package.json').version,
    uptime:  process.uptime(),
    env:     ENV,
    time:    new Date().toISOString(),
  });
});

// ─── Session log API ─────────────────────────────────────
// Receives conversation events from the frontend for analytics / audit
const sessionLogs = [];   // In-memory store (replace with DB in production)

app.post('/api/session/log', (req, res) => {
  const { sessionId, event, intent, timestamp } = req.body;
  if (!sessionId || !event) {
    return res.status(400).json({ error: 'sessionId and event are required' });
  }
  const entry = { sessionId, event, intent: intent || null, timestamp: timestamp || Date.now() };
  sessionLogs.push(entry);
  if (sessionLogs.length > 10000) sessionLogs.shift(); // rolling window
  res.json({ ok: true, logged: entry });
});

// ─── Session stats (simple analytics endpoint) ───────────
app.get('/api/session/stats', (_req, res) => {
  const total   = sessionLogs.length;
  const intents = sessionLogs.reduce((acc, e) => {
    if (e.intent) acc[e.intent] = (acc[e.intent] || 0) + 1;
    return acc;
  }, {});
  res.json({ total, intents });
});

// ─── 404 → serve SPA index ───────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Error handler ────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   ARIA Voice Agent — Server Online   ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  URL   : http://localhost:${PORT}         ║`);
  console.log(`  ║  Env   : ${ENV.padEnd(27)}║`);
  console.log(`  ║  Health: http://localhost:${PORT}/health  ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});

module.exports = app;
