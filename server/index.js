require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Production Security Headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routing
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'BOOSTUP Game Topup Engine',
    version: '1.0.0'
  });
});

const fs = require('fs');

// Serve uploaded images with Auto-Recovery from Database Image Cache
const uploadsDir = path.join(__dirname, 'uploads');
app.get('/uploads/:filename', (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Recover from DB image cache if file was lost due to ephemeral disk redeploy
  if (db && typeof db.getUploadedImage === 'function') {
    const cachedBase64 = db.getUploadedImage(filename);
    if (cachedBase64) {
      try {
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const matches = cachedBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const buffer = matches && matches[2] ? Buffer.from(matches[2], 'base64') : Buffer.from(cachedBase64, 'base64');
        fs.writeFileSync(filePath, buffer);
        return res.sendFile(filePath);
      } catch (err) {
        console.error("Failed to restore image from DB cache:", err.message);
      }
    }
  }
  next();
});
app.use('/uploads', express.static(uploadsDir, { dotfiles: 'allow' }));

// Serve frontend in production or if build exists
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const indexHtml = path.join(clientDist, 'index.html');

// Explicit asset serving handler with dotfiles: allow
app.use('/assets', (req, res, next) => {
  const filePath = path.join(clientDist, 'assets', req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.json': 'application/json'
    };
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    return res.sendFile(filePath, { dotfiles: 'allow' }, (err) => {
      if (err) {
        res.send(fs.readFileSync(filePath));
      }
    });
  }
  next();
});

app.use(express.static(clientDist, { dotfiles: 'allow' }));

// Helper to serve index.html directly via fs to bypass any dotfile restriction
const serveSpa = (req, res) => {
  if (fs.existsSync(indexHtml)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(fs.readFileSync(indexHtml, 'utf8'));
  }
  res.status(500).send(`
    <html>
      <head><title>BOOSTUP API Server</title></head>
      <body style="background:#0b0e14;color:#fff;font-family:sans-serif;text-align:center;padding-top:100px;">
        <h1 style="color:#e62020;">BOOSTUP - ร้านเติมเงินเกม (PLAY MORE GO FURTHER)</h1>
        <p>Backend API is active on port ${PORT}. Please run <code>npm run build</code> in the client folder.</p>
        <p><a href="/api/games" style="color:#00e5ff;">View /api/games</a> | <a href="/api/admin/stats" style="color:#00e5ff;">View /api/admin/stats</a></p>
      </body>
    </html>
  `);
};

// Explicit routes for home and admin
app.use('/admin', serveSpa);
app.get('/', serveSpa);

// Fallback for SPA routing in Express 5
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  serveSpa(req, res);
});

// Production Error Handler (Clean JSON response without leaking stack traces)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง'
      : (err.message || 'Internal Server Error')
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎮 BOOSTUP ร้านเติมเงินเกม (PLAY MORE GO FURTHER) is running!`);
  console.log(`🚀 Server Address: http://localhost:${PORT}`);
  console.log(`🔌 API Endpoints:  http://localhost:${PORT}/api/games`);
  console.log(`🛡️ Admin Stats:    http://localhost:${PORT}/api/admin/stats`);
  console.log(`====================================================`);
});
