import express from 'express';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import apiRoutes from './server/routes/api.js';

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
  console.log('================================================================');
  console.log('👑 VERIFYING UNIVERSAL ADMIN CMS & STOREFRONT DYNAMIC MANAGEMENT');
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

  // -------------------------------------------------------------
  // SECTION 1: FLASH SALE MANAGEMENT CRUD
  // -------------------------------------------------------------
  console.log('--- [1. Flash Sales Management] ---');
  const flashSalePayload = {
    title: 'VALORANT 1,650 Points Flash Deal',
    gameId: 'valorant',
    originalPrice: 500,
    salePrice: 379,
    discountPercent: 24,
    endsAt: '2026-12-31T23:59:59Z',
    stockTotal: 100,
    stockSold: 42,
    active: true
  };

  const createFlashRes = await dispatch('POST', '/api/admin/flash-sales', flashSalePayload);
  const createdFlash = createFlashRes.data?.flashSale;
  assert(
    '1.1 สร้าง Flash Sale จากหลังบ้าน: POST /api/admin/flash-sales',
    createFlashRes.status === 200 && createFlashRes.data?.success && createdFlash?.id,
    `ID: ${createdFlash?.id} - Sale Price: ฿${createdFlash?.salePrice}`
  );

  const getPublicFlashRes = await dispatch('GET', '/api/flash-sales');
  assert(
    '1.2 หน้าร้านดึง Flash Sale อัตโนมัติ: GET /api/flash-sales',
    getPublicFlashRes.status === 200 && getPublicFlashRes.data?.flashSales?.some(f => f.id === createdFlash?.id),
    `Count: ${getPublicFlashRes.data?.flashSales?.length}`
  );

  const updateFlashRes = await dispatch('PUT', `/api/admin/flash-sales/${createdFlash?.id}`, {
    salePrice: 349,
    discountPercent: 30
  });
  assert(
    '1.3 แก้ไขราคา Flash Sale: PUT /api/admin/flash-sales/:id',
    updateFlashRes.status === 200 && updateFlashRes.data?.flashSale?.salePrice === 349,
    `New Sale Price: ฿${updateFlashRes.data?.flashSale?.salePrice}`
  );

  const deleteFlashRes = await dispatch('DELETE', `/api/admin/flash-sales/${createdFlash?.id}`);
  assert(
    '1.4 ลบ Flash Sale จากหลังบ้าน: DELETE /api/admin/flash-sales/:id',
    deleteFlashRes.status === 200 && deleteFlashRes.data?.success,
    `Deleted ID: ${createdFlash?.id}`
  );

  // -------------------------------------------------------------
  // SECTION 2: GIFT CARDS & VOUCHERS MANAGEMENT CRUD
  // -------------------------------------------------------------
  console.log('\n--- [2. Gift Cards & Vouchers Management] ---');
  const giftCardPayload = {
    name: 'PlayStation Store Gift Card',
    category: 'console',
    icon: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
    description: 'บัตรเติมเงิน PSN Wallet ไทยและ US เติมได้ทั้ง PS4, PS5',
    active: true,
    packages: [
      { id: 'psn_300', name: 'PSN Card 300 บาท', price: 295, originalPrice: 300, active: true },
      { id: 'psn_1000', name: 'PSN Card 1,000 บาท', price: 975, originalPrice: 1000, active: true }
    ]
  };

  const createCardRes = await dispatch('POST', '/api/admin/gift-cards', giftCardPayload);
  const createdCard = createCardRes.data?.giftCard;
  assert(
    '2.1 เพิ่มบัตรของขวัญใหม่จากหลังบ้าน: POST /api/admin/gift-cards',
    createCardRes.status === 200 && createCardRes.data?.success && createdCard?.id,
    `ID: ${createdCard?.id} - Name: ${createdCard?.name}`
  );

  const addDenomRes = await dispatch('POST', `/api/admin/gift-cards/${createdCard?.id}/denominations`, {
    name: 'PSN Card 2,000 บาท',
    price: 1940,
    originalPrice: 2000,
    active: true
  });
  const addedDenom = addDenomRes.data?.denomination;
  assert(
    '2.2 เพิ่มราคาหน้าบัตร (Denomination): POST /api/admin/gift-cards/:id/denominations',
    addDenomRes.status === 200 && addedDenom?.name?.includes('2,000'),
    `Denom ID: ${addedDenom?.id} (฿${addedDenom?.price})`
  );

  const getPublicCardsRes = await dispatch('GET', '/api/gift-cards');
  assert(
    '2.3 หน้าร้านแสดงบัตรของขวัญใหม่ทันที: GET /api/gift-cards',
    getPublicCardsRes.status === 200 && getPublicCardsRes.data?.giftCards?.some(c => c.id === createdCard?.id),
    `Total Cards: ${getPublicCardsRes.data?.giftCards?.length}`
  );

  if (addedDenom?.id) {
    const delDenomRes = await dispatch('DELETE', `/api/admin/gift-cards/${createdCard?.id}/denominations/${addedDenom.id}`);
    assert(
      '2.4 ลบราคาหน้าบัตรย่อย: DELETE /api/admin/gift-cards/:id/denominations/:denomId',
      delDenomRes.status === 200 && delDenomRes.data?.success,
      `Deleted Denom: ${addedDenom.id}`
    );
  }

  const deleteCardRes = await dispatch('DELETE', `/api/admin/gift-cards/${createdCard?.id}`);
  assert(
    '2.5 ลบบัตรของขวัญออกจากระบบ: DELETE /api/admin/gift-cards/:id',
    deleteCardRes.status === 200 && deleteCardRes.data?.success,
    `Deleted Card ID: ${createdCard?.id}`
  );

  // -------------------------------------------------------------
  // SECTION 3: APP SUBSCRIPTIONS MANAGEMENT CRUD
  // -------------------------------------------------------------
  console.log('\n--- [3. App Subscriptions Management] ---');
  const appSubPayload = {
    name: 'Disney+ Hotstar Premium',
    category: 'streaming',
    icon: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80',
    description: 'สมัครแพ็กเกจสตรีมมิ่งความคมชัดระดับ 4K ดูได้สูงสุด 4 จอ',
    active: true,
    packages: [
      { id: 'disney_1m', name: 'รายเดือน 1 เดือน', price: 99, originalPrice: 119, active: true }
    ]
  };

  const createAppRes = await dispatch('POST', '/api/admin/app-subscriptions', appSubPayload);
  const createdApp = createAppRes.data?.appSubscription;
  assert(
    '3.1 เพิ่มแอปพรีเมียมใหม่จากหลังบ้าน: POST /api/admin/app-subscriptions',
    createAppRes.status === 200 && createAppRes.data?.success && createdApp?.id,
    `ID: ${createdApp?.id} - Name: ${createdApp?.name}`
  );

  const addPlanRes = await dispatch('POST', `/api/admin/app-subscriptions/${createdApp?.id}/plans`, {
    name: 'รายปี 12 เดือน (เหมาจ่ายสุดคุ้ม)',
    price: 890,
    originalPrice: 1190,
    active: true
  });
  const addedPlan = addPlanRes.data?.plan;
  assert(
    '3.2 เพิ่มแพ็กเกจระยะเวลาใช้งาน (Plan): POST /api/admin/app-subscriptions/:id/plans',
    addPlanRes.status === 200 && addedPlan?.name?.includes('รายปี'),
    `Plan ID: ${addedPlan?.id} (฿${addedPlan?.price})`
  );

  const getPublicAppsRes = await dispatch('GET', '/api/app-subscriptions');
  assert(
    '3.3 หน้าร้านแสดงแอปพรีเมียมใหม่ทันที: GET /api/app-subscriptions',
    getPublicAppsRes.status === 200 && getPublicAppsRes.data?.appSubscriptions?.some(a => a.id === createdApp?.id),
    `Total Apps: ${getPublicAppsRes.data?.appSubscriptions?.length}`
  );

  if (addedPlan?.id) {
    const delPlanRes = await dispatch('DELETE', `/api/admin/app-subscriptions/${createdApp?.id}/plans/${addedPlan.id}`);
    assert(
      '3.4 ลบแพ็กเกจระยะเวลาย่อย: DELETE /api/admin/app-subscriptions/:id/plans/:planId',
      delPlanRes.status === 200 && delPlanRes.data?.success,
      `Deleted Plan: ${addedPlan.id}`
    );
  }

  const deleteAppRes = await dispatch('DELETE', `/api/admin/app-subscriptions/${createdApp?.id}`);
  assert(
    '3.5 ลบแอปพรีเมียมออกจากระบบ: DELETE /api/admin/app-subscriptions/:id',
    deleteAppRes.status === 200 && deleteAppRes.data?.success,
    `Deleted App ID: ${createdApp?.id}`
  );

  // -------------------------------------------------------------
  // SECTION 4: STOREFRONT QUICK CATEGORIES BAR CMS
  // -------------------------------------------------------------
  console.log('\n--- [4. Quick Category Service Bar CMS] ---');
  const getInitialCatsRes = await dispatch('GET', '/api/quick-categories');
  const initialCats = getInitialCatsRes.data?.categories || [];
  assert(
    '4.1 ดึงรายการ 6 หมวดหมู่บริการด่วน: GET /api/quick-categories',
    getInitialCatsRes.status === 200 && Array.isArray(initialCats) && initialCats.length >= 6,
    `Count: ${initialCats.length} categories`
  );

  // Modify first category badge
  const updatedCategories = initialCats.map((c, i) => i === 0 ? { ...c, badge: 'HOT 2026' } : c);
  const putCatsRes = await dispatch('PUT', '/api/admin/quick-categories', { categories: updatedCategories });
  assert(
    '4.2 อัปเดตข้อมูลหมวดหมู่ด่วนจากหลังบ้าน: PUT /api/admin/quick-categories',
    putCatsRes.status === 200 && putCatsRes.data?.success,
    `Updated ${putCatsRes.data?.categories?.length} categories`
  );

  const getReflectedCatsRes = await dispatch('GET', '/api/quick-categories');
  const firstCat = getReflectedCatsRes.data?.categories?.[0];
  assert(
    '4.3 หน้าร้านแสดงข้อมูลหมวดหมู่ด่วนที่แก้ไขทันที: GET /api/quick-categories',
    firstCat?.badge === 'HOT 2026',
    `First Category: "${firstCat?.title}" (Badge: ${firstCat?.badge})`
  );

  // -------------------------------------------------------------
  // SECTION 5: SITE SETTINGS, MULTI-BANK & TRUST CMS
  // -------------------------------------------------------------
  console.log('\n--- [5. Site Settings, Multi-Bank Accounts & Trust Badges CMS] ---');
  const customSettingsPayload = {
    siteName: 'TWELVE SYSTEMS - Ultimate Gaming Hub',
    logoUrl: '/uploads/custom_logo_2026.png',
    coinsRewardRate: 0.05,
    coinsMultiplierText: '2X COINS BACK',
    bankAccounts: [
      {
        id: 'bank_kbank_main',
        bankName: 'ธนาคารกสิกรไทย (KBANK)',
        accountNo: '098-2-33445-5',
        accountName: 'บจก. ทเวลฟ์ ซิสเต็มส์',
        promptpayLinked: true,
        isActive: true
      },
      {
        id: 'bank_scb_sub',
        bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
        accountNo: '112-9-88776-1',
        accountName: 'บจก. ทเวลฟ์ ซิสเต็มส์',
        promptpayLinked: false,
        isActive: true
      }
    ],
    trustPoints: [
      {
        id: 't1',
        icon: 'ShieldCheck',
        title: 'จดทะเบียนนิติบุคคล 100%',
        desc: 'ทุนจดทะเบียน 5,000,000 บาท ถูกต้องตามกฎหมาย'
      },
      {
        id: 't2',
        icon: 'Zap',
        title: 'ระบบตัดยอดผ่าน API ตรง 1-3 วิ',
        desc: 'ทำงานตลอด 24 ชั่วโมง ไม่มีวันหยุด'
      },
      {
        id: 't3',
        icon: 'Lock',
        title: 'ใช้เพียง Player ID เท่านั้น',
        desc: 'ปลอดภัย ไม่ต้องให้รหัสผ่านหรือ OTP'
      },
      {
        id: 't4',
        icon: 'Users',
        title: 'รีวิวกว่า 2,500,000+ ออเดอร์',
        desc: 'เกมเมอร์ระดับท็อปและสตรีมเมอร์ไว้วางใจ'
      }
    ],
    footerAbout: 'ศูนย์รวมบริการเติมเกมและสินค้าดิจิทัลครบวงจรที่ดีที่สุดในประเทศไทย',
    footerLegal: 'สงวนลิขสิทธิ์ พ.ศ. 2569 บริษัท ทเวลฟ์ ซิสเต็มส์ จำกัด'
  };

  const putSettingsRes = await dispatch('PUT', '/api/admin/settings', customSettingsPayload);
  assert(
    '5.1 แก้ไขการตั้งค่าระบบ, โลโก้, บัญชีธนาคาร และจุดเด่นความน่าเชื่อถือ: PUT /api/admin/settings',
    putSettingsRes.status === 200 && putSettingsRes.data?.success,
    `Site: ${putSettingsRes.data?.settings?.siteName}`
  );

  const getSettingsRes = await dispatch('GET', '/api/settings');
  const loadedSettings = getSettingsRes.data?.settings;
  assert(
    '5.2 หน้าร้านดึงการตั้งค่าใหม่ทั้งหมดแบบเรียลไทม์: GET /api/settings',
    loadedSettings?.logoUrl === '/uploads/custom_logo_2026.png' &&
    loadedSettings?.bankAccounts?.length === 2 &&
    loadedSettings?.trustPoints?.length === 4 &&
    loadedSettings?.coinsMultiplierText === '2X COINS BACK',
    `Banks: ${loadedSettings?.bankAccounts?.length}, Trust Badges: ${loadedSettings?.trustPoints?.length}`
  );

  // -------------------------------------------------------------
  // SECTION 6: HERO CAROUSEL BANNERS CMS
  // -------------------------------------------------------------
  console.log('\n--- [6. Hero Carousel Banners CMS] ---');
  const slidePayload = {
    title: 'ROV แชมเปี้ยนชิพ ซีซั่นใหม่ ลดกระหน่ำ',
    subtitle: 'รับคูปองทันที พร้อมของแถมสกินระดับ Legend Exclusive',
    badge: '🏆 ESPORTS DEAL',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-red-600 text-white',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'รับสิทธิ์เลย',
    ctaTarget: 'popular-games',
    isActive: true
  };

  const createSlideRes = await dispatch('POST', '/api/admin/slides', slidePayload);
  const createdSlide = createSlideRes.data?.slide;
  assert(
    '6.1 เพิ่มแบนเนอร์ Hero Carousel ใหม่: POST /api/admin/slides',
    createSlideRes.status === 200 && createSlideRes.data?.success && createdSlide?.id,
    `Slide ID: ${createdSlide?.id} - Title: ${createdSlide?.title}`
  );

  const getSlidesRes = await dispatch('GET', '/api/slides');
  assert(
    '6.2 หน้าร้านแสดงแบนเนอร์ใหม่ใน Hero Carousel: GET /api/slides',
    getSlidesRes.status === 200 && getSlidesRes.data?.slides?.some(s => s.id === createdSlide?.id),
    `Total Slides: ${getSlidesRes.data?.slides?.length}`
  );

  const deleteSlideRes = await dispatch('DELETE', `/api/admin/slides/${createdSlide?.id}`);
  assert(
    '6.3 ลบแบนเนอร์สไลด์ออกจากระบบ: DELETE /api/admin/slides/:id',
    deleteSlideRes.status === 200 && deleteSlideRes.data?.success,
    `Deleted Slide ID: ${createdSlide?.id}`
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🎉 COMPREHENSIVE TEST RESULTS: ${passed}/${total} TESTS PASSED! (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🌟 ALL UNIVERSAL ADMIN FEATURES FULLY VERIFIED & WORKING SEAMLESSLY!');
  } else {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
