const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/database');
const topupEngine = require('../services/topupEngine');
const paymentService = require('../services/paymentService');

// ==========================================
// 1. PUBLIC & STOREFRONT APIS
// ==========================================

// Get site settings & announcements
router.get('/settings', (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

// Get all active games with packages
router.get('/games', (req, res) => {
  const games = db.getGames();
  res.json({ success: true, games });
});

// Richman Shop features: Flash Sales, Gift Cards, App Subscriptions
router.get('/flash-sales', (req, res) => {
  const flashSales = db.getFlashSales();
  res.json({ success: true, flashSales });
});

router.get('/gift-cards', (req, res) => {
  const giftCards = db.getGiftCards();
  res.json({ success: true, giftCards });
});

router.get('/app-subscriptions', (req, res) => {
  const appSubscriptions = db.getAppSubscriptions();
  res.json({ success: true, appSubscriptions });
});

// Carousel Slides (CMS Storefront Banners)
router.get('/slides', (req, res) => {
  const slides = db.getCarouselSlides();
  res.json({ success: true, slides });
});

// Quick Category Service Bar (Storefront)
router.get('/quick-categories', (req, res) => {
  const categories = db.getQuickCategories();
  res.json({ success: true, categories });
});

// Upload Image from Machine (Local Upload API)
router.post('/upload', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'ไม่พบข้อมูลรูปภาพ' });
    }

    // Extract base64 and mime type
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = 'png';
    let dataBuffer;

    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else ext = 'png';

      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      dataBuffer = Buffer.from(imageBase64, 'base64');
    }

    // Max 5MB check
    if (dataBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'ขนาดไฟล์เกินกำหนด (สูงสุด 5MB)' });
    }

    const uniqueName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, dataBuffer);

    const publicUrl = `/uploads/${uniqueName}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      sizeBytes: dataBuffer.length,
      message: 'อัปโหลดรูปภาพสำเร็จเรียบร้อย'
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get specific game details
router.get('/games/:id', (req, res) => {
  const game = db.getGameById(req.params.id);
  if (!game) {
    return res.status(404).json({ success: false, message: 'Game not found' });
  }
  res.json({ success: true, game });
});

// Verify Player Character Nickname (prevents mistaken UID top-ups)
router.post('/games/verify-player', async (req, res) => {
  try {
    const { gameId, playerId, server } = req.body;
    if (!gameId || !playerId) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก UID หรือไอดีผู้เล่น' });
    }

    const result = await topupEngine.verifyPlayer(gameId, playerId.trim(), server);
    res.json({ success: true, ...result, playerName: result.nickname || result.playerName });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Validate Coupon Code
router.post('/coupons/validate', (req, res) => {
  const { code, amount } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุโค้ดส่วนลด' });
  }

  const coupon = db.getCouponByCode(code);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'ไม่พบโค้ดส่วนลดนี้ หรือโค้ดหมดอายุแล้ว' });
  }

  const orderAmount = Number(amount) || 0;
  if (coupon.minSpend && orderAmount < coupon.minSpend) {
    return res.status(400).json({
      success: false,
      message: `โค้ดนี้ใช้ได้เมื่อสั่งซื้อครบ ฿${coupon.minSpend} ขึ้นไป (ยอดปัจจุบัน ฿${orderAmount})`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, orderAmount);

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountAmount: Number(discount.toFixed(2)),
      finalPrice: Number(Math.max(0, orderAmount - discount).toFixed(2))
    }
  });
});

// Generate Dynamic PromptPay QR Code
router.post('/payments/promptpay', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'จำนวนเงินไม่ถูกต้อง' });
    }

    const qrData = await paymentService.generatePromptPay(amount);
    res.json({ success: true, ...qrData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Order & Initiate Auto Top-up
router.post('/orders', async (req, res) => {
  try {
    const {
      gameId,
      packageId,
      playerId,
      playerNickname,
      server,
      paymentMethod,
      couponCode,
      voucherUrl,
      userId
    } = req.body;

    if (!gameId || !packageId || !playerId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการสั่งซื้อไม่ครบถ้วน' });
    }

    const game = db.getGameById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'ไม่พบเกมที่เลือก' });

    const pkg = game.packages.find(p => p.id === packageId);
    if (!pkg) return res.status(404).json({ success: false, message: 'ไม่พบแพ็กเกจที่เลือก' });

    let originalAmount = pkg.price;
    let discountAmount = 0;

    // Apply Coupon
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && (!coupon.minSpend || originalAmount >= coupon.minSpend)) {
        if (coupon.discountType === 'percent') {
          discountAmount = (originalAmount * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, originalAmount);
        db.updateCoupon(coupon.id, { usedCount: (coupon.usedCount || 0) + 1 });
      }
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    // Process Payment verification
    let paymentVerified = false;
    if (paymentMethod === 'wallet') {
      if (!userId || userId === 'usr_anonymous') {
        return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนชำระเงินด้วยกระเป๋าเงิน' });
      }
      await paymentService.payWithWallet(userId, finalAmount);
      paymentVerified = true;
    } else if (paymentMethod === 'truemoney') {
      if (voucherUrl) {
        await paymentService.verifyTrueMoneyVoucher(voucherUrl, finalAmount);
      }
      paymentVerified = true;
    } else if (paymentMethod === 'promptpay' || paymentMethod === 'bank_transfer') {
      // PromptPay and Slip uploads are instantly confirmed in demo / auto-confirmed
      paymentVerified = true;
    }

    // Get customer name
    let customerName = "ลูกค้าทั่วไป";
    if (userId) {
      const user = db.findUserById(userId);
      if (user) customerName = user.name || user.username;
    }

    // Create Order Record
    const order = db.createOrder({
      userId: userId || 'usr_anonymous',
      customerName,
      gameId: game.id,
      gameName: game.name,
      packageId: pkg.id,
      packageName: pkg.name,
      currencyAmount: pkg.currencyAmount,
      currencyName: game.currencyName,
      playerId,
      playerNickname: playerNickname || `Player_${playerId.slice(-4)}`,
      server: server || '',
      originalAmount,
      discountAmount,
      finalAmount,
      costPrice: pkg.costPrice || (pkg.price * 0.88),
      couponCode: couponCode || null,
      paymentMethod,
      paymentStatus: paymentVerified ? 'paid' : 'pending'
    });

    // Auto Top-up Execution (Asynchronous or Synchronous)
    const topupResult = await topupEngine.processOrder(order.id);

    res.json({
      success: true,
      order: topupResult.order || order,
      topupSuccess: topupResult.success,
      message: topupResult.success ? 'เติมเงินเข้าเกมสำเร็จทันที 24 ชม.' : 'กำลังดำเนินการเติมเงิน'
    });

  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Order Details & Real-time Status
router.get('/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อนี้' });
  }
  res.json({ success: true, order });
});

// Get User Orders
router.get('/orders/user/:userId', (req, res) => {
  const allOrders = db.getOrders();
  const userOrders = allOrders.filter(o => o.userId === req.params.userId);
  res.json({ success: true, orders: userOrders });
});

// ==========================================
// 2. AUTH & WALLET APIS
// ==========================================

router.post('/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้หรืออีเมล' });
  }

  const user = db.findUserByEmailOrUsername(identifier);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance,
      points: user.points,
      tier: user.tier
    }
  });
});

router.post('/auth/register', (req, res) => {
  const { username, email, password, name } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const existing = db.findUserByEmailOrUsername(username) || db.findUserByEmailOrUsername(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว' });
  }

  const newUser = db.createUser({
    username,
    email,
    password,
    name: name || username
  });

  res.json({
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      walletBalance: newUser.walletBalance,
      points: newUser.points,
      tier: newUser.tier
    }
  });
});

router.post('/auth/forgot-password', (req, res) => {
  const { identifier, newPassword, confirmPassword } = req.body;
  if (!identifier || !identifier.trim()) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้' });
  }

  const user = db.findUserByEmailOrUsername(identifier.trim());
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมลอีกครั้ง' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' });
  }

  db.updateUser(user.id, { password: newPassword });
  db.logAction('user', user.name || user.username, 'PASSWORD_RESET', `ผู้ใช้รีเซ็ตรหัสผ่านใหม่สำเร็จ (${user.username})`);

  res.json({
    success: true,
    message: 'ตั้งรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว! สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'
  });
});

router.post('/wallet/deposit', async (req, res) => {
  try {
    const { userId, amount, method, slipImage, voucherUrl } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการเติมเงินไม่ถูกต้อง' });
    }

    const result = await paymentService.depositWallet(userId, amount, method, slipImage, voucherUrl);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. ADMIN DASHBOARD APIS
// ==========================================

// Analytics & Dashboard Summary
router.get('/admin/stats', (req, res) => {
  const stats = db.getStats();
  const engineMetrics = topupEngine.getEngineMetrics();
  
  // Dynamic 7-day sales timeline based on real orders in db
  const orders = db.data.orders || [];
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid' && o.topupStatus === 'completed');
  
  const salesChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const thaiDay = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

    const dayOrders = paidOrders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
    const daySales = dayOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    salesChartData.push({
      date: i === 0 ? "วันนี้" : thaiDay,
      sales: daySales,
      orders: dayOrders.length
    });
  }

  // Dynamic payment channel distribution
  const allPaid = orders.filter(o => o.paymentStatus === 'paid');
  const totalPaid = allPaid.length;

  const getPercent = (filterFn) => totalPaid > 0 ? Math.round((allPaid.filter(filterFn).length / totalPaid) * 100) : 0;

  const paymentChannelData = [
    { name: "TrueMoney Wallet", percentage: getPercent(o => o.paymentMethod === 'truemoney'), color: "#ff8200" },
    { name: "โอนผ่านธนาคาร", percentage: getPercent(o => o.paymentMethod === 'bank_transfer'), color: "#00a950" },
    { name: "พร้อมเพย์ (PromptPay)", percentage: getPercent(o => o.paymentMethod === 'promptpay'), color: "#0056b3" },
    { name: "อื่นๆ / กระเป๋าเงิน", percentage: getPercent(o => o.paymentMethod === 'wallet' || o.paymentMethod === 'other'), color: "#e62020" }
  ];

  res.json({
    success: true,
    stats,
    engineMetrics,
    salesChartData,
    paymentChannelData
  });
});

// Reset Dashboard Stats & Orders to 0
router.post('/admin/reset-stats', (req, res) => {
  db.data.orders = [];
  db.data.users = [];
  db.data.transactions = [];
  db.data.auditLogs = [];
  topupEngine.latencyHistory = [];
  db.save();

  db.logAction('admin', 'Admin', 'RESET_STATS', 'รีเซ็ตข้อมูลคำสั่งซื้อและสถิติหลังบ้านทั้งหมดเป็น 0');

  res.json({
    success: true,
    message: 'รีเซ็ตข้อมูลสถิติและคำสั่งซื้อหลังบ้านทั้งหมดเป็น 0 เรียบร้อยแล้ว',
    stats: db.getStats()
  });
});

// List All Orders with Filtering
router.get('/admin/orders', (req, res) => {
  const { status, game, search } = req.query;
  let orders = db.getOrders();

  if (status && status !== 'all') {
    orders = orders.filter(o => o.topupStatus === status || o.paymentStatus === status);
  }
  if (game && game !== 'all') {
    orders = orders.filter(o => o.gameId === game);
  }
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o => 
      o.orderNumber.toLowerCase().includes(q) ||
      o.playerId.toLowerCase().includes(q) ||
      (o.playerNickname && o.playerNickname.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, orders });
});

// Retry Order Auto Top-up
router.post('/admin/orders/:id/retry', async (req, res) => {
  try {
    const result = await topupEngine.processOrder(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manually update order status
router.put('/admin/orders/:id/status', (req, res) => {
  const { topupStatus, paymentStatus, note } = req.body;
  const updated = db.updateOrder(req.params.id, {
    topupStatus,
    paymentStatus,
    adminNote: note
  });
  res.json({ success: true, order: updated });
});

// List Providers & Balances
router.get('/admin/providers', (req, res) => {
  const providers = db.getProviders();
  const routes = db.getGameRoutes();
  res.json({ success: true, providers, routes });
});

// Update Provider Details
router.put('/admin/providers/:id', (req, res) => {
  const updated = db.updateProvider(req.params.id, req.body);
  res.json({ success: true, provider: updated });
});

// Update Game Routes (Primary & Fallback)
router.put('/admin/routes', (req, res) => {
  const { gameId, primary, fallback } = req.body;
  if (!gameId || !primary) {
    return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
  }
  const routes = db.setGameRoute(gameId, { primary, fallback });
  res.json({ success: true, routes });
});

// Admin Games CRUD
router.get('/admin/games', (req, res) => {
  const games = db.getAllGamesAdmin();
  res.json({ success: true, games });
});

router.post('/admin/games', (req, res) => {
  const gameData = req.body;
  if (!gameData.id) {
    const slug = gameData.slug || gameData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    gameData.id = slug;
    gameData.slug = slug;
  }
  const game = db.saveGame(gameData);
  db.logAction('admin', 'Admin', 'SAVE_GAME', `บันทึกข้อมูลเกม ${game.name}`);
  res.json({ success: true, game });
});

router.delete('/admin/games/:id', (req, res) => {
  db.deleteGame(req.params.id);
  db.logAction('admin', 'Admin', 'DELETE_GAME', `ลบเกม ID: ${req.params.id}`);
  res.json({ success: true, message: 'ลบเกมสำเร็จ' });
});

router.post('/admin/games/:id/packages', (req, res) => {
  try {
    const pkg = db.addPackageToGame(req.params.id, req.body);
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/games/:id/packages/:pkgId', (req, res) => {
  try {
    db.deletePackageFromGame(req.params.id, req.params.pkgId);
    res.json({ success: true, message: 'ลบแพ็กเกจสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Carousel Slides (CMS Storefront Banners)
router.get('/admin/slides', (req, res) => {
  const slides = db.getAllCarouselSlidesAdmin();
  res.json({ success: true, slides });
});

router.post('/admin/slides', (req, res) => {
  const slide = db.saveCarouselSlide(req.body);
  db.logAction('admin', 'Admin', 'SAVE_SLIDE', `บันทึกแบนเนอร์ ${slide.title}`);
  res.json({ success: true, slide });
});

router.delete('/admin/slides/:id', (req, res) => {
  db.deleteCarouselSlide(req.params.id);
  db.logAction('admin', 'Admin', 'DELETE_SLIDE', `ลบแบนเนอร์ ID: ${req.params.id}`);
  res.json({ success: true, message: 'ลบแบนเนอร์สำเร็จ' });
});

// ==========================================
// ADMIN FLASH SALES CRUD
// ==========================================
router.get('/admin/flash-sales', (req, res) => {
  const flashSales = db.getAllFlashSalesAdmin();
  res.json({ success: true, flashSales });
});

router.post('/admin/flash-sales', (req, res) => {
  try {
    const item = db.saveFlashSale(req.body);
    db.logAction('admin', 'Admin', 'SAVE_FLASH_SALE', `บันทึกดีลฟ้าผ่า ${item.packageName || item.id}`);
    res.json({ success: true, flashSale: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/flash-sales/:id', (req, res) => {
  try {
    const item = db.saveFlashSale({ ...req.body, id: req.params.id });
    res.json({ success: true, flashSale: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/flash-sales/:id', (req, res) => {
  try {
    db.deleteFlashSale(req.params.id);
    db.logAction('admin', 'Admin', 'DELETE_FLASH_SALE', `ลบดีลฟ้าผ่า ${req.params.id}`);
    res.json({ success: true, message: 'ลบดีลฟ้าผ่าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ADMIN GIFT CARDS CRUD
// ==========================================
router.get('/admin/gift-cards', (req, res) => {
  const giftCards = db.getAllGiftCardsAdmin();
  res.json({ success: true, giftCards });
});

router.post('/admin/gift-cards', (req, res) => {
  try {
    const card = db.saveGiftCard(req.body);
    db.logAction('admin', 'Admin', 'SAVE_GIFT_CARD', `บันทึกบัตรเติมเงิน ${card.name}`);
    res.json({ success: true, giftCard: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/gift-cards/:id', (req, res) => {
  try {
    const card = db.saveGiftCard({ ...req.body, id: req.params.id });
    res.json({ success: true, giftCard: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/gift-cards/:id', (req, res) => {
  try {
    db.deleteGiftCard(req.params.id);
    db.logAction('admin', 'Admin', 'DELETE_GIFT_CARD', `ลบบัตรเติมเงิน ${req.params.id}`);
    res.json({ success: true, message: 'ลบบัตรเติมเงินสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/gift-cards/:id/denominations', (req, res) => {
  try {
    const deno = db.addDenominationToGiftCard(req.params.id, req.body);
    res.json({ success: true, denomination: deno });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/gift-cards/:id/denominations/:denoId', (req, res) => {
  try {
    db.deleteDenominationFromGiftCard(req.params.id, req.params.denoId);
    res.json({ success: true, message: 'ลบราคาบัตรสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ADMIN APP SUBSCRIPTIONS CRUD
// ==========================================
router.get('/admin/app-subscriptions', (req, res) => {
  const appSubscriptions = db.getAllAppSubscriptionsAdmin();
  res.json({ success: true, appSubscriptions });
});

router.post('/admin/app-subscriptions', (req, res) => {
  try {
    const app = db.saveAppSubscription(req.body);
    db.logAction('admin', 'Admin', 'SAVE_APP_SUB', `บันทึกบริการแอป ${app.name}`);
    res.json({ success: true, appSubscription: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/app-subscriptions/:id', (req, res) => {
  try {
    const app = db.saveAppSubscription({ ...req.body, id: req.params.id });
    res.json({ success: true, appSubscription: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/app-subscriptions/:id', (req, res) => {
  try {
    db.deleteAppSubscription(req.params.id);
    db.logAction('admin', 'Admin', 'DELETE_APP_SUB', `ลบบริการแอป ${req.params.id}`);
    res.json({ success: true, message: 'ลบบริการแอปสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/app-subscriptions/:id/plans', (req, res) => {
  try {
    const plan = db.addPlanToAppSubscription(req.params.id, req.body);
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/app-subscriptions/:id/plans/:planId', (req, res) => {
  try {
    db.deletePlanFromAppSubscription(req.params.id, req.params.planId);
    res.json({ success: true, message: 'ลบแพ็กเกจแอปสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ADMIN QUICK CATEGORY BAR CMS
// ==========================================
router.get('/admin/quick-categories', (req, res) => {
  const categories = db.getAllQuickCategoriesAdmin();
  res.json({ success: true, categories });
});

router.post('/admin/quick-categories', (req, res) => {
  try {
    const cat = db.saveQuickCategory(req.body);
    res.json({ success: true, category: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/quick-categories', (req, res) => {
  try {
    if (Array.isArray(req.body.categories)) {
      const updated = db.updateAllQuickCategories(req.body.categories);
      res.json({ success: true, categories: updated });
    } else {
      const cat = db.saveQuickCategory(req.body);
      res.json({ success: true, category: cat });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/quick-categories/:id', (req, res) => {
  try {
    db.deleteQuickCategory(req.params.id);
    res.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// DEDICATED ADMIN AUTHENTICATION GATEWAY
// ==========================================
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านของผู้ดูแลระบบ' });
  }

  const admin = db.findAdminByEmailOrUsername(username);
  if (!admin || admin.password !== password) {
    db.logAction('system', 'Security', 'ADMIN_LOGIN_FAILED', `เข้าสู่ระบบแอดมินไม่สำเร็จสำหรับผู้ใช้: ${username}`);
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง' });
  }

  if (admin.isActive === false) {
    return res.status(403).json({ success: false, message: 'บัญชีผู้ดูแลระบบนี้ถูกระงับการใช้งานชั่วคราว' });
  }

  db.logAction(admin.id, admin.name, 'ADMIN_LOGIN_SUCCESS', `ผู้ดูแลระบบ ${admin.name} (${admin.role}) เข้าสู่ระบบสำเร็จ`);

  res.json({
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department
    },
    token: `adm_tok_${admin.id}_${Date.now()}`
  });
});

router.get('/admin/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบผู้ดูแลระบบ' });
  }
  const match = authHeader.match(/^Bearer adm_tok_(adm_[a-zA-Z0-9_-]+)_/);
  if (match) {
    const adminId = match[1];
    const admin = db.findAdminById(adminId);
    if (admin && admin.isActive !== false) {
      return res.json({
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          department: admin.department
        }
      });
    }
  }
  res.status(401).json({ success: false, message: 'เซสชันผู้ดูแลหมดอายุหรือไม่มีสิทธิ์' });
});

// Admin RBAC (Admin Accounts & Permissions)
router.get('/admin/admins', (req, res) => {
  const admins = db.getAdmins();
  res.json({ success: true, admins });
});

router.post('/admin/admins', (req, res) => {
  const { username, email, password, name, role, department } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const existing = db.findAdminByEmailOrUsername(username);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username หรือ Email นี้มีในระบบแล้ว' });
  }

  const newAdmin = db.createAdmin({
    username,
    email: email || `${username}@boostup.com`,
    password,
    name,
    role: role || 'operator',
    department: department || 'Operations'
  });

  db.logAction('admin', 'Admin', 'CREATE_ADMIN', `สร้างบัญชีแอดมินใหม่: ${username} (${role})`);
  res.json({ success: true, admin: newAdmin });
});

router.put('/admin/admins/:id', (req, res) => {
  const updated = db.updateAdmin(req.params.id, req.body);
  db.logAction('admin', 'Admin', 'UPDATE_ADMIN', `อัปเดตสิทธิ์แอดมิน ID: ${req.params.id}`);
  res.json({ success: true, admin: updated });
});

router.delete('/admin/admins/:id', (req, res) => {
  if (req.params.id === 'adm_super') {
    return res.status(400).json({ success: false, message: 'ไม่สามารถลบบัญชี Super Admin หลักได้' });
  }
  db.deleteAdmin(req.params.id);
  db.logAction('admin', 'Admin', 'DELETE_ADMIN', `ลบบัญชีแอดมิน ID: ${req.params.id}`);
  res.json({ success: true, message: 'ลบบัญชีแอดมินเรียบร้อย' });
});

// Admin Coupons CRUD
router.get('/admin/coupons', (req, res) => {
  const coupons = db.getAllCoupons();
  res.json({ success: true, coupons });
});

router.post('/admin/coupons', (req, res) => {
  const coupon = db.createCoupon(req.body);
  db.logAction('admin', 'Admin', 'CREATE_COUPON', `สร้างคูปอง: ${coupon.code}`);
  res.json({ success: true, coupon });
});

router.delete('/admin/coupons/:id', (req, res) => {
  db.deleteCoupon(req.params.id);
  res.json({ success: true });
});

// Admin Customers CRUD
router.get('/admin/customers', (req, res) => {
  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    walletBalance: u.walletBalance,
    points: u.points,
    tier: u.tier,
    createdAt: u.createdAt
  }));
  res.json({ success: true, customers: users });
});

router.post('/admin/customers/:id/wallet', (req, res) => {
  const { amount, action } = req.body;
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });

  let newBal = user.walletBalance || 0;
  if (action === 'add') newBal += Number(amount);
  else if (action === 'subtract') newBal = Math.max(0, newBal - Number(amount));
  else newBal = Number(amount);

  const updated = db.updateUser(user.id, { walletBalance: newBal });
  db.logAction('admin', 'Admin', 'ADJUST_WALLET', `ปรับยอดเงินลูกค้า ${user.username} จำนวน ฿${amount}`);
  res.json({ success: true, user: updated });
});

// Update Website Settings (CMS)
router.put('/admin/settings', (req, res) => {
  const settings = db.updateSettings(req.body);
  db.logAction('admin', 'Admin', 'UPDATE_SETTINGS', 'อัปเดตการตั้งค่าเว็บไซต์และหน้าร้าน');
  res.json({ success: true, settings });
});

// ==========================================
// 8. ADMIN SLIP APPROVAL & DEPOSIT APIS
// ==========================================

// Admin: Get all wallet deposit transactions
router.get('/admin/deposits', (req, res) => {
  try {
    const txns = (db.getTransactions() || []).filter(t => t.type === 'deposit');
    // Sort newest first
    txns.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const pendingCount = txns.filter(t => t.status === 'pending').length;
    res.json({ success: true, deposits: txns, pendingCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Approve a pending deposit slip
router.post('/admin/deposits/:id/approve', async (req, res) => {
  try {
    const { adminName } = req.body;
    const result = await paymentService.approveDeposit(req.params.id, adminName || 'Admin');
    res.json({ success: true, ...result, message: 'อนุมัติสลิปและเติมเงินเข้ากระเป๋าลูกค้าสำเร็จเรียบร้อย' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: Reject a pending deposit slip
router.post('/admin/deposits/:id/reject', async (req, res) => {
  try {
    const { reason, adminName } = req.body;
    const result = await paymentService.rejectDeposit(req.params.id, reason, adminName || 'Admin');
    res.json({ success: true, ...result, message: 'ปฏิเสธสลิปการเติมเงินเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// User: Get personal wallet deposit transactions
router.get('/wallet/history/:userId', (req, res) => {
  try {
    const txns = (db.getTransactions() || [])
      .filter(t => t.userId === req.params.userId && t.type === 'deposit')
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json({ success: true, transactions: txns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. LIVE CHAT APIS (Customer & Admin)
// ==========================================

// Get or initialize customer chat session
router.get('/chat/session', (req, res) => {
  const { sessionId, userId, customerName } = req.query;
  const chat = db.createOrGetChatSession({ sessionId, userId, customerName });
  db.markChatAsRead(chat.id, 'customer');
  res.json({ success: true, chat });
});

// Customer sends message
router.post('/chat/message', (req, res) => {
  const { chatId, sessionId, userId, customerName, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อความ' });
  }

  let chat = chatId ? db.getChatById(chatId) : null;
  if (!chat) {
    chat = db.createOrGetChatSession({ sessionId, userId, customerName });
  }

  const result = db.addChatMessage(chat.id, {
    sender: 'customer',
    senderName: customerName || (chat.customerName || 'ลูกค้า'),
    text
  });

  if (!result) {
    return res.status(500).json({ success: false, message: 'ไม่สามารถส่งข้อความได้' });
  }

  res.json({ success: true, chat: result.chat, message: result.message });
});

// Admin: Get all live chat rooms
router.get('/admin/chats', (req, res) => {
  const chats = db.getChats();
  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0);
  res.json({ success: true, chats, totalUnread });
});

// Admin: Reply to customer chat
router.post('/admin/chats/:id/reply', (req, res) => {
  const { text, adminName } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อความตอบกลับ' });
  }

  const result = db.addChatMessage(req.params.id, {
    sender: 'admin',
    senderName: adminName || 'แอดมิน BOOSTUP',
    text
  });

  if (!result) {
    return res.status(404).json({ success: false, message: 'ไม่พบห้องแชทนี้' });
  }

  db.markChatAsRead(req.params.id, 'admin');
  res.json({ success: true, chat: result.chat, message: result.message });
});

// Admin: Mark chat as read
router.put('/admin/chats/:id/read', (req, res) => {
  const chat = db.markChatAsRead(req.params.id, 'admin');
  if (!chat) return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท' });
  res.json({ success: true, chat });
});

module.exports = router;
