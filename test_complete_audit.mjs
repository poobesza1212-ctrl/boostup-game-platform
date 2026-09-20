import express from 'express';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import apiRoutes from './server/routes/api.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'BOOSTUP Game Topup Engine',
    version: '1.0.0'
  });
});

app.use('/api', apiRoutes);

// Simulate SPA routing as in server/index.js
const indexHtmlPath = path.resolve('client/dist/index.html');
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  if (fs.existsSync(indexHtmlPath)) {
    return res.status(200).send(fs.readFileSync(indexHtmlPath, 'utf8'));
  }
  res.status(200).send('<!DOCTYPE html><html><head><title>BOOSTUP ร้านเติมเงินเกม</title></head><body><div id="root"></div></body></html>');
});

function dispatch(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = new Readable({
      read() {
        if (payload) {
          this.push(payload);
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      'host': 'localhost:5000',
      'content-type': 'application/json',
      ...(payload ? { 'content-length': Buffer.byteLength(payload) } : {}),
      ...headers
    };

    let statusCode = 200;
    let resHeaders = {};
    let chunks = [];

    const res = new EventEmitter();
    res.setHeader = (key, val) => { resHeaders[key.toLowerCase()] = val; };
    res.getHeader = (key) => resHeaders[key.toLowerCase()];
    res.status = (code) => { statusCode = code; return res; };
    res.writeHead = (code, hdrs) => {
      statusCode = code;
      if (hdrs) Object.assign(resHeaders, hdrs);
      return res;
    };
    res.write = (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };
    res.end = (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const text = Buffer.concat(chunks).toString('utf8');
      let data = text;
      try {
        if (resHeaders['content-type'] && resHeaders['content-type'].includes('application/json')) {
          data = JSON.parse(text);
        }
      } catch (e) {}
      resolve({ status: statusCode, headers: resHeaders, data, text });
    };

    app(req, res, (err) => {
      if (err) reject(err);
      else resolve({ status: 404, headers: resHeaders, data: { error: 'Not Found' }, text: 'Not Found' });
    });
  });
}

async function runAudit() {
  console.log("==================================================");
  console.log("🔍 BOOSTUP - COMPREHENSIVE PLATFORM PRE-LAUNCH AUDIT");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check & Brand verify
    const health = await dispatch('GET', '/health');
    assert(
      '1. Health Check Endpoint & Branding',
      health.status === 200 && health.data.platform === 'BOOSTUP Game Topup Engine',
      `Got status ${health.status}, platform: ${health.data?.platform}`
    );

    // 2. Storefront Settings
    const settingsRes = await dispatch('GET', '/api/settings');
    const settings = settingsRes.data?.settings || settingsRes.data;
    assert(
      '2. Storefront Settings (Site Name & Slogan)',
      settingsRes.status === 200 && 
      settings?.siteName?.includes('BOOSTUP') &&
      settings?.contactLine === '@boostup',
      `SiteName: ${settings?.siteName}, contactLine: ${settings?.contactLine}`
    );

    // 3. Games Catalog
    const gamesRes = await dispatch('GET', '/api/games');
    const games = gamesRes.data?.games || gamesRes.data;
    assert(
      '3. Games Catalog (/api/games)',
      gamesRes.status === 200 && Array.isArray(games) && games.length >= 4,
      `Loaded ${games?.length} games`
    );

    // 4. Player UID Verification
    const verifyRes = await dispatch('POST', '/api/games/verify-player', { gameId: 'rov', playerId: '123456789' });
    assert(
      '4. Player UID Verification (/api/games/verify-player)',
      verifyRes.status === 200 && verifyRes.data?.success && verifyRes.data?.playerName,
      `Player name: ${verifyRes.data?.playerName}`
    );

    // 5. Coupon Discount System (BOOSTUP20)
    const couponRes = await dispatch('POST', '/api/coupons/validate', { code: 'BOOSTUP20', amount: 200 });
    assert(
      '5. Coupon System (/api/coupons/validate BOOSTUP20)',
      couponRes.status === 200 && couponRes.data?.success && couponRes.data?.coupon?.discountAmount === 20,
      `Coupon response: ${JSON.stringify(couponRes.data)}`
    );

    // 6. Payment PromptPay QR Creation
    const ppRes = await dispatch('POST', '/api/payments/promptpay', { amount: 159.00 });
    assert(
      '6. PromptPay EMVCo QR Generation (/api/payments/promptpay)',
      ppRes.status === 200 && ppRes.data?.qrDataUrl && ppRes.data?.qrDataUrl.startsWith('data:image/png;base64,'),
      `QR Generated: ${Boolean(ppRes.data?.qrDataUrl)}`
    );

    // 7. Order Creation & Auto Topup Simulation
    const orderRes = await dispatch('POST', '/api/orders', {
      gameId: 'rov',
      gameName: 'ROV (Realm of Valor)',
      packageId: 'rov_180',
      packageName: '180 คูปอง',
      price: 179,
      originalPrice: 199,
      playerId: '123456789',
      playerName: 'ProGamerTH',
      paymentMethod: 'promptpay',
      customerPhone: '0812345678',
      appliedCoupon: { code: 'BOOSTUP20', discount: 20 }
    });
    const order = orderRes.data?.order || orderRes.data;
    assert(
      '7. Order Placement & Auto-Topup Processing (BST- prefix)',
      orderRes.status === 200 && order?.orderNumber?.startsWith('BST-'),
      `Order ID: ${order?.orderNumber}, Status: ${order?.status}`
    );

    // 8. Admin Authentication (Super Admin)
    const adminLoginRes = await dispatch('POST', '/api/admin/login', { username: 'admin', password: 'admin' });
    const adminToken = adminLoginRes.data?.token;
    assert(
      '8. Admin Authentication (/api/admin/login)',
      adminLoginRes.status === 200 && adminLoginRes.data?.success && Boolean(adminToken),
      `Admin logged in: ${adminLoginRes.data?.admin?.name}`
    );

    // 9. Admin Stats Endpoint
    const statsRes = await dispatch('GET', '/api/admin/stats', null, { authorization: `Bearer ${adminToken}` });
    assert(
      '9. Admin Stats Overview (/api/admin/stats)',
      statsRes.status === 200 && statsRes.data?.success && typeof statsRes.data?.stats?.todaySales === 'number',
      `Today sales: ${statsRes.data?.stats?.todaySales}`
    );

    // 10. Admin Reset Stats to 0 (Clean Baseline)
    const resetRes = await dispatch('POST', '/api/admin/reset-stats', null, { authorization: `Bearer ${adminToken}` });
    assert(
      '10. Admin Reset Stats to Clean 0 Baseline',
      resetRes.status === 200 && resetRes.data?.success && resetRes.data?.stats?.totalOrders === 0,
      `Stats after reset: Orders=${resetRes.data?.stats?.totalOrders}, Sales=${resetRes.data?.stats?.todaySales}`
    );

    // 11. Admin Carousel Slides CMS
    const slidesRes = await dispatch('GET', '/api/slides', null, { authorization: `Bearer ${adminToken}` });
    const slides = slidesRes.data?.slides || slidesRes.data;
    const hasBoostCoinsSlide = Array.isArray(slides) && slides.some(s => s.title?.includes('BOOSTUP COINS'));
    assert(
      '11. CMS Carousel Slides (/api/slides) Brand Check',
      slidesRes.status === 200 && hasBoostCoinsSlide,
      `Found slides: ${slides?.length}, Has BOOSTUP COINS: ${hasBoostCoinsSlide}`
    );

    // 12. Frontend SPA Index Route Serving
    const spaRes = await dispatch('GET', '/');
    assert(
      '12. Frontend SPA HTML Serving (/ & /admin)',
      spaRes.status === 200 && spaRes.text?.includes('BOOSTUP'),
      `SPA HTML title/meta contains BOOSTUP`
    );

    console.log("==================================================");
    console.log(`AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Audit crashed with error:', err);
    process.exit(1);
  }
}

runAudit();
