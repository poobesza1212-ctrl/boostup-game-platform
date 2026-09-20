import express from 'express';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import apiRoutes from './server/routes/api.js';
import db from './server/config/database.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiRoutes);

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
      resolve({ status: statusCode, headers: resHeaders, data });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
      else resolve({ status: 404, data: 'Not Found' });
    });
  });
}

async function run() {
  console.log('====================================================');
  console.log('🧪 TESTING ALL 9 CORE MODULES (IN-PROCESS VERIFICATION)');
  console.log('====================================================\n');

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

  // 1. หน้าร้าน (Storefront & Catalog)
  const res1 = await dispatch('GET', '/api/games');
  const gamesList = res1.data?.games;
  assert('1. หน้าร้าน: Storefront Games API (GET /api/games)', 
    res1.status === 200 && Array.isArray(gamesList) && gamesList.length > 0, 
    `(${gamesList ? gamesList.length : 0} games available)`
  );

  // 2. ระบบอัปโหลดรูปจากเครื่อง (Local Image Upload API)
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const res2 = await dispatch('POST', '/api/upload', {
    imageBase64: sampleBase64,
    filename: 'test_game_cover.png'
  });
  assert('2. ระบบอัปโหลดรูปจากเครื่อง: POST /api/upload', 
    res2.status === 200 && res2.data?.success && res2.data?.url?.startsWith('/uploads/'), 
    `Saved to: ${res2.data?.url}`
  );
  const uploadedUrl = res2.data?.url || '/uploads/sample.png';

  // 3. ระบบเพิ่มเกมและแพ็กเกจ (Game & Package CRUD manager)
  const res3 = await dispatch('POST', '/api/admin/games', {
    id: 'wuwa_test',
    name: 'Wuthering Waves (Test)',
    category: 'mobile',
    icon: uploadedUrl,
    publisher: 'Kuro Games',
    uidPlaceholder: 'Kuro UID (9 digits)',
    hasServer: true,
    active: true,
    packages: [
      { id: 'wuwa-60', name: '60 Lunite', originalPrice: 39, price: 33, active: true },
      { id: 'wuwa-300', name: '300+30 Lunite', originalPrice: 179, price: 159, active: true }
    ]
  });
  assert('3. ระบบเพิ่มเกมและแพ็กเกจ: POST /api/admin/games', 
    res3.status === 200 && res3.data?.success && res3.data?.game?.name?.includes('Wuthering Waves'), 
    `Game ID: ${res3.data?.game?.id}, Packages: ${res3.data?.game?.packages?.length}`
  );

  // 4. ระบบเพิ่มแพ็กเกจย่อยเข้าสู่เกม
  const res4 = await dispatch('POST', '/api/admin/games/wuwa_test/packages', {
    name: '980+110 Lunite',
    originalPrice: 599,
    price: 499,
    active: true
  });
  assert('4. ระบบเพิ่มแพ็กเกจย่อย: POST /api/admin/games/:id/packages', 
    res4.status === 200 && res4.data?.success && res4.data?.package?.name?.includes('980+110'), 
    `Package ID: ${res4.data?.package?.id}`
  );

  // 5. ระบบสิทธิ์แอดมิน (RBAC: super_admin, operator, content_editor)
  const uniqueUsername = `operator_${Date.now().toString().slice(-4)}`;
  const res5 = await dispatch('POST', '/api/admin/admins', {
    username: uniqueUsername,
    password: 'SecureOperatorPass2026',
    name: 'Somchai Operator',
    role: 'operator'
  });
  assert('5. ระบบสิทธิ์แอดมิน (RBAC): POST /api/admin/admins', 
    res5.status === 200 && res5.data?.success && res5.data?.admin?.role === 'operator', 
    `Username: ${res5.data?.admin?.username} (Role: ${res5.data?.admin?.role})`
  );

  const res5List = await dispatch('GET', '/api/admin/admins');
  const adminCount = res5List.data?.admins?.length || 0;
  assert('5.1 รายชื่อผู้ดูแลและสิทธิ์: GET /api/admin/admins', 
    res5List.status === 200 && adminCount >= 3, 
    `(${adminCount} admins in database: Super Admin, Operator, Content Editor)`
  );

  // 6. ระบบแก้ไขข้อความและหน้าร้าน (CMS for Site Settings & Announcements)
  const res6 = await dispatch('PUT', '/api/admin/settings', {
    siteName: 'TWELVE SYSTEMS - Richman Shop Style',
    announcement: '⚡ เติมไวใน 3 วินาที รับประกันความพึงพอใจ 100%',
    lineContact: '@twelveshop',
    autoTopupEnabled: true
  });
  assert('6. ระบบแก้ไขข้อความและหน้าร้าน: PUT /api/admin/settings', 
    res6.status === 200 && res6.data?.success && res6.data?.settings?.siteName?.includes('TWELVE SYSTEMS'), 
    `Site: ${res6.data?.settings?.siteName}`
  );

  // 7. ระบบแบนเนอร์และภาพสไลด์หน้าร้าน (Hero Carousel CMS)
  const res7 = await dispatch('GET', '/api/admin/slides');
  const slideCount = res7.data?.slides?.length || 0;
  assert('7. ระบบจัดการแบนเนอร์ Hero Carousel: GET /api/admin/slides', 
    res7.status === 200 && slideCount > 0, 
    `(${slideCount} active banners on storefront)`
  );

  // 8. ระบบออเดอร์ & Auto Topup Engine 24 ชม.
  const res8 = await dispatch('POST', '/api/orders', {
    gameId: 'rov',
    packageId: 'rov_35',
    playerId: '9988776655',
    playerNickname: 'ProPlayer_TH',
    paymentMethod: 'promptpay',
    userId: 'usr_user1'
  });
  const order = res8.data?.order;
  assert('8. ระบบออเดอร์ & Auto Topup 24 ชม.: POST /api/orders', 
    res8.status === 200 && res8.data?.success && order?.id, 
    `Order ID: ${order?.id}, Status: ${order?.status || order?.topupStatus}, Method: ${order?.paymentMethod}`
  );

  // 8.1 การติดตามสถานะออเดอร์ Real-time
  if (order?.id) {
    const res8_1 = await dispatch('GET', `/api/orders/${order.id}`);
    assert('8.1 ติดตามสถานะออเดอร์ Real-time: GET /api/orders/:id', 
      res8_1.status === 200 && res8_1.data?.order?.id === order.id, 
      `Order: ${res8_1.data?.order?.id}, Provider: ${res8_1.data?.order?.providerId}`
    );
  }

  // 9. ระบบสมาชิก & Twelve Coins & กระเป๋าเงิน
  const res9 = await dispatch('POST', '/api/auth/login', {
    identifier: 'user@gamer.th',
    password: 'password'
  });
  const user = res9.data?.user;
  assert('9. ระบบสมาชิก, Wallet & Twelve Coins: POST /api/auth/login', 
    res9.status === 200 && user?.email === 'user@gamer.th', 
    `User: ${user?.name}, Tier: ${user?.tier}, Coins: ${user?.points}, Wallet: ฿${user?.walletBalance}`
  );

  console.log('\n====================================================');
  console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED! (${Math.round((passed/total)*100)}%)`);
  console.log('====================================================\n');
}

run().catch(console.error);
