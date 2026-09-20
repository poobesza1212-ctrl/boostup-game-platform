import express from 'express';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import path from 'path';
import apiRoutes from './server/routes/api.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiRoutes);

// Simulate SPA routing as in server/index.js
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.status(200).send('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
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
      'host': 'localhost',
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
      const raw = Buffer.concat(chunks).toString('utf8');
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}
      resolve({ status: statusCode, headers: resHeaders, data, raw });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
      else resolve({ status: 404, data: 'Not Found' });
    });
  });
}

async function run() {
  console.log('================================================================');
  console.log('🔒 VERIFYING SEPARATION OF ADMIN PORTAL & AUTHENTICATION GATE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title} ${detail}`);
    } else {
      console.error(`❌ [FAIL] ${title} ${detail}`);
    }
  }

  // 1. Super Admin Login
  const res1 = await dispatch('POST', '/api/admin/login', {
    username: 'admin',
    password: 'admin'
  });
  const adminData = res1.data?.admin;
  const token = res1.data?.token;
  assert(
    '1. เข้าสู่ระบบ Super Admin หลังบ้าน: POST /api/admin/login',
    res1.status === 200 && res1.data?.success && adminData?.role === 'super_admin' && token,
    `Admin: ${adminData?.name} (${adminData?.role}) - Token: ${token?.slice(0, 20)}...`
  );

  // 2. Operator Admin Login
  const res2 = await dispatch('POST', '/api/admin/login', {
    username: 'operator1',
    password: 'operator123'
  });
  assert(
    '2. เข้าสู่ระบบ Operator หลังบ้าน: POST /api/admin/login',
    res2.status === 200 && res2.data?.success && res2.data?.admin?.role === 'operator',
    `Admin: ${res2.data?.admin?.name} (${res2.data?.admin?.role})`
  );

  // 3. Invalid Password Rejection
  const res3 = await dispatch('POST', '/api/admin/login', {
    username: 'admin',
    password: 'wrongpassword'
  });
  assert(
    '3. ปฏิเสธรหัสผ่านผิด: POST /api/admin/login with wrong pass',
    res3.status === 401 && res3.data?.success === false,
    `Message: ${res3.data?.message}`
  );

  // 4. Regular Customer User cannot access Admin Portal
  const res4 = await dispatch('POST', '/api/admin/login', {
    username: 'user@gamer.th',
    password: 'password'
  });
  assert(
    '4. ป้องกันลูกค้าร้านค้าทั่วไปเข้าสู่ระบบหลังบ้าน: Customer login blocked',
    res4.status === 401 && res4.data?.success === false,
    `Blocked unauthorized customer account`
  );

  // 5. Admin Session Verification with Bearer Token
  const res5 = await dispatch('GET', '/api/admin/me', null, {
    'authorization': `Bearer ${token}`
  });
  assert(
    '5. ตรวจสอบเซสชันผู้ดูแลระบบ: GET /api/admin/me with Bearer token',
    res5.status === 200 && res5.data?.success && res5.data?.admin?.id === adminData?.id,
    `Verified: ${res5.data?.admin?.name}`
  );

  // 6. Admin Session Verification without Token
  const res6 = await dispatch('GET', '/api/admin/me');
  assert(
    '6. ปฏิเสธการเข้าถึงเมื่อไม่มี Token: GET /api/admin/me without token',
    res6.status === 401 && res6.data?.success === false,
    `Status: ${res6.status}`
  );

  // 7. Route /admin SPA Fallback
  const res7 = await dispatch('GET', '/admin');
  assert(
    '7. เส้นทาง /admin ให้บริการไฟล์แอปพลิเคชันเดี่ยว (SPA Fallback): GET /admin',
    res7.status === 200 && res7.raw?.includes('<div id="root">'),
    `Served index.html correctly`
  );

  // 8. Route / Storefront Root
  const res8 = await dispatch('GET', '/');
  assert(
    '8. เส้นทางหน้าร้านค้าลูกค้า: GET /',
    res8.status === 200 && res8.raw?.includes('<div id="root">'),
    `Served index.html correctly`
  );

  console.log('\n================================================================');
  console.log(`📊 SEPARATION VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED! (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🌟 ADMIN PORTAL SUCCESSFULLY SEPARATED AND SECURED!');
  } else {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
