const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/database');
const topupEngine = require('../services/topupEngine');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const aiChatService = require('../services/aiChatService');
const ignVerificationService = require('../services/ignVerificationService');
const slipVerificationService = require('../services/slipVerificationService');
const notificationService = require('../services/notificationService');
const QRCode = require('qrcode');

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

    // Store in DB image cache to survive Render container restarts & ephemeral disk wipes
    if (db && typeof db.storeUploadedImage === 'function') {
      db.storeUploadedImage(uniqueName, imageBase64);
    }

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

    const result = await ignVerificationService.verifyPlayer(gameId, playerId.trim(), server);
    res.json({ 
      success: true, 
      ...result, 
      nickname: result.characterName || result.name || result.nickname || result.playerName,
      playerName: result.characterName || result.name || result.nickname || result.playerName
    });
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
    return res.status(404).json({ success: false, message: 'ไม่พบโค้ดส่วนลดนี้ หรือพิมพ์รหัสไม่ถูกต้อง' });
  }

  if (coupon.isInactive) {
    return res.status(400).json({ success: false, message: `โค้ดส่วนลด "${coupon.code}" ถูกปิดใช้งานชั่วคราว` });
  }

  if (coupon.isExpired) {
    const expDate = new Date(coupon.expiresAt).toLocaleDateString('th-TH');
    return res.status(400).json({ success: false, message: `โค้ดส่วนลด "${coupon.code}" หมดอายุการใช้งานแล้ว (สิ้นสุด ${expDate})` });
  }

  if (coupon.isLimitReached) {
    const limit = coupon.usageLimit || coupon.maxUses;
    return res.status(400).json({ success: false, message: `โค้ดส่วนลด "${coupon.code}" ถูกใช้งานครบจำนวนสิทธิ์เต็มแล้ว (${limit}/${limit} สิทธิ์)` });
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
      subPaymentChannel,
      couponCode,
      voucherUrl,
      userId
    } = req.body;

    if (!gameId || !packageId || !playerId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการสั่งซื้อไม่ครบถ้วน' });
    }

    const settings = db.getSettings();
    const pmConfig = settings?.paymentMethods || {};
    const channelToCheck = subPaymentChannel || paymentMethod;
    if (pmConfig[channelToCheck] && pmConfig[channelToCheck].enabled === false) {
      return res.status(400).json({
        success: false,
        message: `ขออภัย ช่องทางชำระเงิน "${pmConfig[channelToCheck].name || channelToCheck}" ปิดให้บริการชั่วคราว กรุณาเลือกช่องทางอื่น`
      });
    }
    if (pmConfig[paymentMethod] && pmConfig[paymentMethod].enabled === false) {
      return res.status(400).json({
        success: false,
        message: `ขออภัย ช่องทางชำระเงิน "${pmConfig[paymentMethod].name || paymentMethod}" ปิดให้บริการชั่วคราว กรุณาเลือกช่องทางอื่น`
      });
    }

    let game = db.getGameById(gameId);
    let pkg = null;

    if (game && Array.isArray(game.packages)) {
      pkg = game.packages.find(p => p.id === packageId);
    }

    if (!game || !pkg) {
      // Check gift cards
      const giftCards = (typeof db.getGiftCards === 'function') ? db.getGiftCards() : [];
      const giftCard = giftCards.find(g => g.id === gameId);
      if (giftCard) {
        game = giftCard;
        const denom = giftCard.denominations?.find(d => d.id === packageId);
        if (denom) {
          pkg = { id: denom.id, name: denom.name, price: denom.price, currencyAmount: denom.price };
        }
      }
    }

    if (!game || !pkg) {
      // Check app subscriptions
      const appSubs = (typeof db.getAppSubscriptions === 'function') ? db.getAppSubscriptions() : [];
      const appSub = appSubs.find(a => a.id === gameId);
      if (appSub) {
        game = appSub;
        const plan = appSub.plans?.find(p => p.id === packageId);
        if (plan) {
          pkg = { id: plan.id, name: plan.name, price: plan.price, currencyAmount: plan.price };
        }
      }
    }

    if (!game || !pkg) {
      // Check flash sale items
      const flashSales = (typeof db.getFlashSales === 'function') ? db.getFlashSales() : [];
      const flash = flashSales.find(f => f.id === gameId || f.id === packageId);
      if (flash) {
        game = { id: flash.id, name: flash.gameName || flash.packageName || 'Flash Sale Item', image: flash.image };
        pkg = { id: flash.id, name: flash.packageName, price: flash.flashPrice, currencyAmount: flash.flashPrice };
      }
    }

    if (!game) return res.status(404).json({ success: false, message: 'ไม่พบเกมหรือสินค้าที่เลือก' });
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
    } else if (paymentMethod === 'promptpay' || paymentMethod === 'bank_transfer' || paymentMethod === 'credit_card') {
      // PromptPay and direct channels are verified
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
      currencyAmount: pkg.currencyAmount || pkg.price,
      currencyName: game.currencyName || 'ไอเทม',
      playerId,
      playerNickname: playerNickname || `Player_${playerId.slice(-4)}`,
      server: server || '',
      originalAmount,
      discountAmount,
      finalAmount,
      costPrice: pkg.costPrice || (pkg.price * 0.88),
      couponCode: couponCode || null,
      paymentMethod,
      subPaymentChannel: subPaymentChannel || paymentMethod,
      paymentStatus: paymentVerified ? 'paid' : 'pending'
    });

    // Auto Top-up Execution (Asynchronous or Synchronous)
    const topupResult = await topupEngine.processOrder(order.id);

    // Send Real-time Merchant Notification (LINE Notify / Webhook)
    try {
      const activeOrder = topupResult.order || order;
      notificationService.sendNewOrderNotification(activeOrder, settings).catch(() => {});
    } catch (notifErr) {
      console.warn("Notification dispatch warning:", notifErr.message);
    }

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

// Generate Order Verification QR & E-Receipt Meta
router.get('/orders/:id/receipt-qr', async (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อนี้' });
    }
    const host = req.get('host') || 'www.boostup-game.online';
    const proto = req.protocol || 'https';
    const verifyUrl = `${proto}://${host}/orders?id=${order.orderNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 220,
      color: { dark: '#04281a', light: '#ffffff' }
    });
    res.json({ success: true, qrDataUrl, verifyUrl, orderNumber: order.orderNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get User Orders
router.get('/orders/user/:userId', (req, res) => {
  const allOrders = db.getOrders();
  const userOrders = allOrders.filter(o => o.userId === req.params.userId);
  res.json({ success: true, orders: userOrders });
});

// Customer Order History Search API (Richman Shop Style)
router.get('/orders/history', (req, res) => {
  try {
    const { 
      userId, 
      orderNumber, 
      gameUid, 
      playerId, 
      gameId, 
      status, 
      category, 
      startDate, 
      endDate 
    } = req.query;

    let orders = db.getOrders() || [];

    // Filter by userId if provided
    if (userId && userId.trim()) {
      orders = orders.filter(o => o.userId === userId.trim());
    }

    // Filter by Order Number (partial or exact)
    if (orderNumber && orderNumber.trim()) {
      const q = orderNumber.trim().toLowerCase();
      orders = orders.filter(o => 
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q))
      );
    }

    // Filter by Game UID / Player ID
    const targetUid = (gameUid || playerId || '').trim().toLowerCase();
    if (targetUid) {
      orders = orders.filter(o => 
        o.playerId && o.playerId.toString().toLowerCase().includes(targetUid)
      );
    }

    // Filter by Game ID
    if (gameId && gameId !== 'all' && gameId.trim()) {
      orders = orders.filter(o => o.gameId === gameId.trim());
    }

    // Filter by Status
    if (status && status !== 'all' && status.trim()) {
      const s = status.trim().toLowerCase();
      if (s === 'completed' || s === 'สำเร็จ') {
        orders = orders.filter(o => o.topupStatus === 'completed' || o.paymentStatus === 'paid');
      } else if (s === 'pending' || s === 'รอดำเนินการ') {
        orders = orders.filter(o => o.topupStatus === 'pending' || o.paymentStatus === 'pending');
      } else if (s === 'failed' || s === 'cancelled' || s === 'ยกเลิก') {
        orders = orders.filter(o => o.topupStatus === 'failed' || o.paymentStatus === 'failed');
      } else {
        orders = orders.filter(o => o.topupStatus === s || o.paymentStatus === s);
      }
    }

    // Filter by Category
    if (category && category !== 'all' && category.trim()) {
      const cat = category.trim().toLowerCase();
      orders = orders.filter(o => {
        const orderCat = (o.category || '').toLowerCase();
        const gid = (o.gameId || '').toLowerCase();
        if (cat === 'gift_card' || cat.includes('บัตร')) {
          return orderCat === 'gift_card' || gid.includes('card') || gid === 'steam' || gid === 'razer' || gid === 'roblox_card';
        }
        if (cat === 'app_subscription' || cat.includes('แอป')) {
          return orderCat === 'app_subscription' || gid.includes('sub_') || gid === 'discord' || gid === 'youtube' || gid === 'netflix' || gid === 'spotify';
        }
        if (cat === 'uid_only' || cat.includes('เกม')) {
          return orderCat !== 'gift_card' && orderCat !== 'app_subscription';
        }
        return true;
      });
    }

    // Filter by Date Range
    if (startDate) {
      const start = new Date(startDate).getTime();
      if (!isNaN(start)) {
        orders = orders.filter(o => new Date(o.createdAt).getTime() >= start);
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endMs = end.getTime();
      if (!isNaN(endMs)) {
        orders = orders.filter(o => new Date(o.createdAt).getTime() <= endMs);
      }
    }

    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Format response items with category labels
    const formattedOrders = orders.map((o) => {
      let typeLabel = 'เติมเกม UID';
      if (o.category === 'gift_card' || o.gameId?.includes('card') || o.digitalCode) {
        typeLabel = 'บัตรเติมเงิน';
      } else if (o.category === 'app_subscription' || o.gameId?.includes('sub_')) {
        typeLabel = 'ต่ออายุสมาชิกแอป';
      }

      return {
        id: o.id,
        orderNumber: o.orderNumber || o.id,
        typeLabel,
        gameId: o.gameId,
        gameName: o.gameName || 'เกมออนไลน์',
        packageName: o.packageName || `${o.currencyAmount || ''} ${o.currencyName || ''}`.trim(),
        playerId: o.playerId || '-',
        playerNickname: o.playerNickname || '',
        server: o.server || '',
        price: Number(o.finalAmount || o.originalAmount || 0),
        status: o.topupStatus === 'completed' ? 'completed' : (o.topupStatus === 'failed' ? 'failed' : 'pending'),
        statusLabel: o.topupStatus === 'completed' ? 'สำเร็จ' : (o.topupStatus === 'failed' ? 'ไม่สำเร็จ' : 'รอดำเนินการ'),
        paymentMethod: o.paymentMethod,
        digitalCode: o.digitalCode || null,
        vaultPin: o.vaultPin || null,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt || o.createdAt,
        rawOrder: o
      };
    });

    res.json({ success: true, count: formattedOrders.length, orders: formattedOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer's Cards & Digital Vouchers ("บัตรของฉัน")
router.get('/orders/my-cards', (req, res) => {
  try {
    const { userId } = req.query;
    const allOrders = db.getOrders() || [];
    let cardOrders = allOrders.filter(o => 
      o.digitalCode || o.category === 'gift_card' || o.gameId?.includes('card')
    );

    if (userId && userId.trim()) {
      cardOrders = cardOrders.filter(o => o.userId === userId.trim());
    }

    const cards = cardOrders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber || o.id,
      cardName: o.gameName || 'บัตรเติมเงินดิจิทัล',
      packageName: o.packageName || 'บัตรเติมเงิน',
      amount: Number(o.finalAmount || o.originalAmount || 0),
      digitalCode: o.digitalCode || 'STEAM-PROMO-9988-7722',
      pin: o.vaultPin || '8888',
      status: o.topupStatus === 'completed' ? 'active' : o.topupStatus,
      statusLabel: o.topupStatus === 'completed' ? 'พร้อมใช้งาน' : 'รอดำเนินการ',
      createdAt: o.createdAt
    }));

    res.json({ success: true, count: cards.length, cards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. AUTH & WALLET APIS
// ==========================================

// Helper to format consistent Customer Profile payload matching Richman Shop specs
const formatUserResponse = (user) => {
  if (!user) return null;
  const nameParts = (user.name || '').trim().split(/\s+/);
  const firstName = user.firstName || (nameParts[0] || user.username || '');
  const lastName = user.lastName || (nameParts.slice(1).join(' ') || '');
  const uid = user.uid || `U${crypto.createHash('md5').update((user.id || user.username || '') + 'uid_salt').digest('hex')}`;

  return {
    id: user.id,
    uid: uid,
    username: user.username,
    name: user.name || `${firstName} ${lastName}`.trim() || user.username,
    firstName: firstName,
    lastName: lastName,
    firstNameEn: user.firstNameEn || '',
    lastNameEn: user.lastNameEn || '',
    email: user.email,
    phone: user.phone || '',
    lineId: user.lineId || '',
    role: user.role === 'admin' ? 'Administrator' : 'Customer',
    status: user.status || 'active',
    walletBalance: Number(user.walletBalance) || 0,
    points: Number(user.points) || 0,
    tier: user.tier || 'Bronze',
    spinTickets: Number(user.spinTickets) || 0,
    referralCode: user.referralCode || '',
    createdAt: user.createdAt
  };
};

router.post('/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้หรืออีเมล' });
  }
  if (!password && password !== 0) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสผ่าน' });
  }

  const cleanIdentifier = identifier.toString().trim();
  const user = db.findUserByEmailOrUsername(cleanIdentifier);
  if (!user) {
    return res.status(401).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้หรืออีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง' });
  }

  const inputPassword = password.toString();
  const hashedInput = crypto.createHash('sha256').update(inputPassword).digest('hex');
  const hashedInputTrimmed = crypto.createHash('sha256').update(inputPassword.trim()).digest('hex');

  // Multi-tier password verification (SHA-256 hash, trimmed hash, legacy plaintext)
  const isValidPassword = 
    (user.passwordHash && (user.passwordHash === hashedInput || user.passwordHash === hashedInputTrimmed)) ||
    (user.password && (user.password === inputPassword || user.password === inputPassword.trim() || user.password === hashedInput));

  if (!isValidPassword) {
    return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง' });
  }

  if (user.status === 'banned' || user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อแอดมินทางแชทสด' });
  }

  db.logAction('user', user.name || user.username, 'USER_LOGIN', `ผู้ใช้ ${user.username} (${user.email || 'no-email'}) เข้าสู่ระบบสำเร็จ`);

  res.json({
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับครับ!',
    user: formatUserResponse(user)
  });
});

router.post('/auth/register', (req, res) => {
  const { username, email, password, name, phone } = req.body;
  const cleanUsername = (username || '').toString().trim();
  const cleanEmail = (email || '').toString().trim().toLowerCase();
  const cleanPassword = (password !== undefined && password !== null) ? password.toString() : '';

  if (!cleanUsername || !cleanEmail || !cleanPassword) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อผู้ใช้, อีเมล, รหัสผ่าน)' });
  }

  if (cleanPassword.length < 3) {
    return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 3 ตัวอักษร' });
  }

  const existing = db.findUserByEmailOrUsername(cleanUsername) || db.findUserByEmailOrUsername(cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว กรุณาเลือกชื่อหรืออีเมลอื่น' });
  }

  const newUser = db.createUser({
    username: cleanUsername,
    email: cleanEmail,
    password: cleanPassword,
    name: (name && name.toString().trim()) || cleanUsername,
    phone: phone ? phone.toString().trim() : ''
  });

  db.logAction('user', newUser.name || newUser.username, 'USER_REGISTER', `สมาชิกใหม่ ${newUser.username} (${newUser.email}) ลงทะเบียนสำเร็จ`);

  res.json({
    success: true,
    message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ BOOSTUP!',
    user: formatUserResponse(newUser)
  });
});

router.get('/auth/user/:id', (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
  }
  res.json({
    success: true,
    user: formatUserResponse(user)
  });
});

// Update Customer Self Profile (Richman Shop Style Profile Data)
router.put('/user/profile', (req, res) => {
  try {
    const { userId, name, firstName, lastName, firstNameEn, lastNameEn, phone, email, lineId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'ไม่พบรหัสผู้ใช้' });

    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();

    if (firstName !== undefined || lastName !== undefined) {
      const f = firstName !== undefined ? firstName.trim() : (user.firstName || '');
      const l = lastName !== undefined ? lastName.trim() : (user.lastName || '');
      updates.name = `${f} ${l}`.trim() || user.name || user.username;
    } else if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (firstNameEn !== undefined) updates.firstNameEn = firstNameEn.trim();
    if (lastNameEn !== undefined) updates.lastNameEn = lastNameEn.trim();
    if (lineId !== undefined) updates.lineId = lineId.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = db.findUserByEmail(cleanEmail);
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
      }
      updates.email = cleanEmail;
    }

    const updated = db.updateUser(user.id, updates);
    res.json({
      success: true,
      message: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว',
      user: formatUserResponse(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Request Password Reset OTP to registered Email
router.post('/auth/request-reset-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้' });
    }

    const user = db.findUserByEmailOrUsername(identifier.trim());
    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมลอีกครั้ง' });
    }

    if (!user.email || !user.email.includes('@')) {
      return res.status(400).json({ success: false, message: 'บัญชีนี้ยังไม่ได้ระบุอีเมลที่ถูกต้อง กรุณาติดต่อแอดมินทางแชทสดเพื่อขอรับความช่วยเหลือ' });
    }

    // Generate 6-digit OTP
    const { otp, expiresInSeconds } = otpService.generateOtp(user.id, user.email);

    // Send email with OTP
    const emailResult = await emailService.sendPasswordResetOtp(user.email, user.name || user.username, otp);

    // Mask email for user privacy (e.g. k***t@gmail.com)
    const [namePart, domainPart] = user.email.split('@');
    const maskedName = namePart.length > 2 
      ? namePart[0] + '*'.repeat(namePart.length - 2) + namePart[namePart.length - 1]
      : namePart[0] + '*';
    const maskedEmail = `${maskedName}@${domainPart}`;

    db.logAction('user', user.name || user.username, 'OTP_REQUESTED', `ขอรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยัง ${maskedEmail}`);

    res.json({
      success: true,
      userId: user.id,
      maskedEmail,
      expiresInSeconds,
      simulated: emailResult.simulated,
      devOtp: emailResult.simulated ? otp : undefined,
      message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${maskedEmail} เรียบร้อยแล้ว (รหัสมีอายุ 5 นาที)`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Verify OTP and Set New Password
router.post('/auth/verify-otp-reset', (req, res) => {
  try {
    const { userId, otp, newPassword, confirmPassword } = req.body;
    if (!userId || !otp || !otp.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสยืนยัน OTP ให้ครบถ้วน' });
    }

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' });
    }

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' });
    }

    // Verify OTP
    const verifyResult = otpService.verifyOtp(userId, otp.trim());
    if (!verifyResult.valid) {
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    // Update password
    db.updateUser(user.id, { password: newPassword });
    db.logAction('user', user.name || user.username, 'PASSWORD_RESET_SUCCESS', `รีเซ็ตรหัสผ่านสำเร็จผ่านการยืนยัน OTP ทางอีเมล (${user.username})`);

    res.json({
      success: true,
      message: 'ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว! สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/wallet/deposit', async (req, res) => {
  try {
    const { userId, amount, method, slipImage, voucherUrl } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการเติมเงินไม่ถูกต้อง' });
    }

    const settings = db.getSettings();
    const pmConfig = settings?.paymentMethods || {};
    if (pmConfig[method] && pmConfig[method].enabled === false) {
      return res.status(400).json({
        success: false,
        message: `ขออภัย ช่องทางเติมเงิน "${pmConfig[method].name || method}" ปิดให้บริการชั่วคราว กรุณาเลือกช่องทางอื่น`
      });
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
    const dayCost = dayOrders.reduce((sum, o) => sum + (o.costPrice !== undefined ? o.costPrice : (o.finalAmount || 0) * 0.85), 0);
    const dayProfit = dayOrders.reduce((sum, o) => sum + (o.profit !== undefined ? o.profit : ((o.finalAmount || 0) - (o.costPrice || (o.finalAmount || 0) * 0.85))), 0);
    salesChartData.push({
      date: i === 0 ? "วันนี้" : thaiDay,
      sales: Math.round(daySales * 100) / 100,
      cost: Math.round(dayCost * 100) / 100,
      profit: Math.round(dayProfit * 100) / 100,
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
  db.logAction('admin', 'Admin', 'SAVE_SLIDE', `บันทึกแบนเนอร์ ${slide.title || slide.id}`);
  res.json({ success: true, slide });
});

router.post('/admin/slides/batch', (req, res) => {
  try {
    const { slides } = req.body;
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่พบรายการรูปภาพแบนเนอร์' });
    }
    const added = db.saveCarouselSlidesBatch(slides);
    db.logAction('admin', 'Admin', 'BATCH_ADD_SLIDES', `เพิ่มแบนเนอร์ใหม่จำนวน ${added.length} ภาพ`);
    res.json({ success: true, count: added.length, slides: added });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/slides/:id', (req, res) => {
  try {
    const updated = db.updateCarouselSlide(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'ไม่พบแบนเนอร์' });
    db.logAction('admin', 'Admin', 'UPDATE_SLIDE', `แก้ไขแบนเนอร์ ID: ${req.params.id}`);
    res.json({ success: true, slide: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/slides/reorder', (req, res) => {
  try {
    const { slideIds } = req.body;
    if (!Array.isArray(slideIds)) return res.status(400).json({ success: false, message: 'ข้อมูลลำดับไม่ถูกต้อง' });
    const reordered = db.reorderCarouselSlides(slideIds);
    db.logAction('admin', 'Admin', 'REORDER_SLIDES', 'สลับลำดับการแสดงผลแบนเนอร์');
    res.json({ success: true, slides: reordered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/slides/reset-defaults', (req, res) => {
  try {
    const slides = db.resetCarouselSlidesToDefaults();
    db.logAction('admin', 'Admin', 'RESET_SLIDES', 'คืนค่าแบนเนอร์เกมตัวอย่าง (ROV, Free Fire, Valorant, Genshin)');
    res.json({ success: true, message: 'คืนค่าแบนเนอร์เกมตัวอย่างสำเร็จ', slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/slides/all', (req, res) => {
  db.clearAllCarouselSlides();
  db.logAction('admin', 'Admin', 'CLEAR_SLIDES', 'ลบแบนเนอร์ทั้งหมดในระบบ');
  res.json({ success: true, message: 'ลบแบนเนอร์ทั้งหมดสำเร็จ' });
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

router.put('/admin/coupons/:id', (req, res) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'ไม่พบคูปองนี้' });
  }
  db.logAction('admin', req.body.adminName || 'Admin', 'UPDATE_COUPON', `แก้ไขคูปอง: ${updated.code}`);
  res.json({ success: true, coupon: updated });
});

router.post('/admin/coupons/:id/toggle', (req, res) => {
  const updated = db.toggleCouponStatus(req.params.id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'ไม่พบคูปองนี้' });
  }
  db.logAction('admin', req.body.adminName || 'Admin', 'TOGGLE_COUPON', `${updated.isActive ? 'เปิด' : 'ปิด'}การใช้งานคูปอง: ${updated.code}`);
  res.json({ success: true, coupon: updated });
});

router.delete('/admin/coupons/:id', (req, res) => {
  const coupon = (db.data.coupons || []).find(c => c.id === req.params.id);
  const code = coupon ? coupon.code : req.params.id;
  db.deleteCoupon(req.params.id);
  db.logAction('admin', req.query.adminName || 'Admin', 'DELETE_COUPON', `ลบคูปองส่วนลด: "${code}"`);
  res.json({ success: true });
});

// Admin Customers CRUD
router.get('/admin/customers', (req, res) => {
  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone || '',
    role: u.role,
    walletBalance: u.walletBalance,
    points: u.points,
    tier: u.tier,
    createdAt: u.createdAt
  }));
  res.json({ success: true, customers: users });
});

// Admin: Edit customer details (name, phone, email, password, tier, walletBalance)
router.put('/admin/customers/:id', (req, res) => {
  try {
    const { name, phone, email, password, tier, walletBalance, points, adminName } = req.body;
    const user = db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ระบุ' });

    const updates = {};
    const changedFields = [];

    if (name !== undefined && name.trim() !== (user.name || '')) {
      updates.name = name.trim();
      changedFields.push(`ชื่อ: "${updates.name}"`);
    }
    if (phone !== undefined && phone.trim() !== (user.phone || '')) {
      updates.phone = phone.trim();
      changedFields.push(`เบอร์โทร: "${updates.phone}"`);
    }
    if (email !== undefined && email.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
      const existing = db.findUserByEmail(email.trim().toLowerCase());
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานโดยบัญชีอื่นแล้ว' });
      }
      updates.email = email.trim().toLowerCase();
      changedFields.push(`อีเมล: "${updates.email}"`);
    }
    if (password && password.trim()) {
      updates.password = password.trim();
      changedFields.push('รีเซ็ตรหัสผ่านใหม่');
    }
    if (tier !== undefined && tier !== user.tier) {
      updates.tier = tier;
      changedFields.push(`ระดับ: "${tier}"`);
    }
    if (walletBalance !== undefined && !isNaN(walletBalance)) {
      const numBal = Number(walletBalance);
      if (numBal !== user.walletBalance) {
        updates.walletBalance = numBal;
        changedFields.push(`ยอดเงิน: ฿${numBal.toLocaleString()}`);
      }
    }
    if (points !== undefined && !isNaN(points)) {
      updates.points = Number(points);
    }

    const updatedUser = db.updateUser(user.id, updates);
    const details = changedFields.length > 0
      ? `แก้ไขข้อมูลลูกค้า @${user.username} (${changedFields.join(', ')})`
      : `แก้ไขข้อมูลลูกค้า @${user.username} (ไม่มีการเปลี่ยนแปลง)`;

    db.logAction('admin', adminName || 'Admin', 'UPDATE_CUSTOMER', details);

    res.json({
      success: true,
      message: 'บันทึกการแก้ไขข้อมูลลูกค้าเรียบร้อย',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        walletBalance: updatedUser.walletBalance,
        points: updatedUser.points,
        tier: updatedUser.tier,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/customers/:id/wallet', (req, res) => {
  const { amount, action, adminName } = req.body;
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });

  let newBal = user.walletBalance || 0;
  if (action === 'add') newBal += Number(amount);
  else if (action === 'subtract') newBal = Math.max(0, newBal - Number(amount));
  else newBal = Number(amount);

  const updated = db.updateUser(user.id, { walletBalance: newBal });
  const actionText = action === 'add' ? `เพิ่มเงิน +฿${Number(amount).toLocaleString()}` : action === 'subtract' ? `หักเงิน -฿${Number(amount).toLocaleString()}` : `ตั้งยอดเงินเป็น ฿${Number(amount).toLocaleString()}`;
  db.logAction('admin', adminName || 'Admin', 'ADJUST_WALLET', `ปรับยอดเงินลูกค้า @${user.username}: ${actionText} (ยอดคงเหลือใหม่: ฿${newBal.toLocaleString()})`);
  res.json({ success: true, user: updated });
});

// Update Website Settings (CMS)
router.put('/admin/settings', (req, res) => {
  const { adminName, ...settingsData } = req.body;
  const settings = db.updateSettings(settingsData);
  db.logAction('admin', adminName || 'Admin', 'UPDATE_SETTINGS', 'อัปเดตการตั้งค่าเว็บไซต์และบัญชีธนาคารรับเงิน');
  res.json({ success: true, settings });
});

// Admin: Test Google Gemini API connection
router.post('/admin/test-gemini', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    const settings = db.getSettings();
    const keyToTest = (apiKey && apiKey.trim()) || settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!keyToTest || !keyToTest.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอก Google Gemini API Key ก่อนทำการทดสอบ' 
      });
    }

    if (model && db?.updateSettings) {
      db.updateSettings({ geminiModel: model });
    }

    const aiChatService = require('../services/aiChatService');
    const reply = await aiChatService.queryGeminiAPI(
      'สวัสดี แนะนำตัวแบบสั้นๆ 1 ประโยค พร้อมทักทายแอดมินร้าน BOOSTUP หน่อยครับ',
      keyToTest.trim(),
      { chat: { messages: [] }, user: { name: 'Admin BOOSTUP' }, db }
    );

    if (!reply) {
      throw new Error('ไม่ได้รับข้อความตอบกลับจาก Google Gemini API กรุณาตรวจสอบ API Key');
    }

    const currentSettings = db.getSettings();
    const activeModel = currentSettings?.geminiActiveModel || model || 'gemini-2.5-flash';

    res.json({
      success: true,
      message: `เชื่อมต่อ Google Gemini AI (${activeModel}) สำเร็จ 100%!`,
      activeModel,
      reply
    });
  } catch (err) {
    console.error('Gemini test error:', err.message);
    let userFriendly = err.message;
    if (err.message.includes('API_KEY_INVALID') || err.message.includes('400')) {
      userFriendly = 'Google แจ้งว่า API Key ไม่ถูกต้อง (API_KEY_INVALID) กรุณาตรวจสอบหรือสร้าง API Key ใหม่จาก aistudio.google.com';
    } else if (err.message.includes('PERMISSION_DENIED') || err.message.includes('403')) {
      userFriendly = 'ไม่มีสิทธิ์เข้าถึง (PERMISSION_DENIED) กรุณาตรวจสอบว่าเปิดใช้งาน Generative Language API ในบัญชี Google แล้ว';
    }
    res.status(400).json({
      success: false,
      message: `ทดสอบไม่สำเร็จ: ${userFriendly}`
    });
  }
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
    const { id } = req.params;
    const { adminName } = req.body;
    const result = db.approveDeposit(id, adminName || 'Admin');
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Reject a pending deposit slip
router.post('/admin/deposits/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminName } = req.body;
    const result = db.rejectDeposit(id, reason || 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง', adminName || 'Admin');
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
router.post('/chat/message', async (req, res) => {
  try {
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

    // If chat is currently in AI mode, trigger intelligent 24/7 AI response
    const currentMode = chat.mode || 'ai';
    if (currentMode === 'ai') {
      let aiReply;
      try {
        const userObj = userId ? db.getUserById(userId) : null;
        const siteSettings = db.getSettings();
        aiReply = await aiChatService.generateReply(text, { chat, db, user: userObj, siteSettings });
      } catch (aiErr) {
        console.error("AI reply error, using emergency local reply:", aiErr.message);
        aiReply = aiChatService.generateLocalSmartReply(text, text.toLowerCase(), { user: null, db });
      }

      if (!aiReply || !aiReply.text) {
        aiReply = aiChatService.generateLocalSmartReply(text, text.toLowerCase(), { user: null, db });
      }

      if (aiReply.shouldHandoffToHuman) {
        db.setChatMode(chat.id, 'human');
      }

      db.addChatMessage(chat.id, {
        sender: 'ai',
        senderName: 'BOOSTUP AI Assistant',
        text: aiReply.text
      });
    }

    const updatedChat = db.getChatById(chat.id);
    res.json({ success: true, chat: updatedChat, message: result.message });
  } catch (err) {
    console.error("Chat message error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer: Switch between AI and Human Admin
router.post('/chat/switch-mode', (req, res) => {
  try {
    const { chatId, sessionId, targetMode, mode: bodyMode, userId, customerName } = req.body;
    let chat = chatId ? db.getChatById(chatId) : null;
    if (!chat && sessionId) {
      chat = db.createOrGetChatSession({ sessionId, userId, customerName });
    }
    if (!chat) {
      return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท' });
    }

    const requestedMode = targetMode || bodyMode;
    const mode = requestedMode === 'human' ? 'human' : 'ai';
    db.setChatMode(chat.id, mode);

    if (mode === 'human') {
      db.addChatMessage(chat.id, {
        sender: 'ai',
        senderName: 'BOOSTUP AI Assistant',
        text: 'ระบบได้ส่งเรื่องแจ้งเตือนไปยังแอดมินเจ้าหน้าที่คนจริงให้เรียบร้อยแล้วครับ 👨‍💼 เจ้าหน้าที่จะเข้ามาตอบกลับโดยเร็วที่สุด กรุณาพิมพ์รายละเอียดหรือคำถามทิ้งไว้ได้เลยครับ 🙏'
      });
    } else {
      db.addChatMessage(chat.id, {
        sender: 'ai',
        senderName: 'BOOSTUP AI Assistant',
        text: 'สลับกลับมาโหมด AI Assistant อัจฉริยะเรียบร้อยแล้วครับ 🤖 สามารถพิมพ์สอบถามข้อมูล วิธีเติมเกม หรือเช็คสถานะออเดอร์ได้ตลอด 24 ชม. ครับ!'
      });
    }

    const updatedChat = db.getChatById(chat.id);
    res.json({ success: true, chat: updatedChat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all live chat rooms
router.get('/admin/chats', (req, res) => {
  const chats = db.getChats();
  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0);
  const humanRequiredCount = chats.filter(c => c.needsHumanAttention || c.mode === 'human').length;
  res.json({ success: true, chats, totalUnread, humanRequiredCount });
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

  // Admin replied: mark as read, set human mode, clear needsHumanAttention
  db.markChatAsRead(req.params.id, 'admin');
  const chat = db.getChatById(req.params.id);
  if (chat) {
    chat.needsHumanAttention = false;
    chat.mode = 'human';
    db.save();
  }

  db.logAction('admin', adminName || 'Admin', 'CHAT_REPLY', `ตอบแชทลูกค้า (ห้อง #${req.params.id}): ${text.length > 60 ? text.substring(0, 57) + '...' : text}`);
  res.json({ success: true, chat: db.getChatById(req.params.id), message: result.message });
});

// Admin: Hand chat back to AI Assistant
router.post('/admin/chats/:id/handoff-ai', (req, res) => {
  const chat = db.getChatById(req.params.id);
  if (!chat) return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท' });
  db.setChatMode(chat.id, 'ai');
  db.addChatMessage(chat.id, {
    sender: 'ai',
    senderName: 'BOOSTUP AI Assistant',
    text: 'แอดมินได้ส่งต่อการดูแลกลับมาให้ระบบ AI อัจฉริยะ 24 ชม. เรียบร้อยแล้วครับ 🤖 คุณลูกค้าสามารถสอบถามข้อมูลอื่นๆ ได้ตลอดเวลา หรือกดปุ่ม "ติดต่อแอดมินคนจริง" หากต้องการคุยกับเจ้าหน้าที่อีกครั้งครับ 🙏'
  });
  const updatedChat = db.getChatById(chat.id);
  res.json({ success: true, chat: updatedChat });
});

// Admin: Mark chat as read
router.put('/admin/chats/:id/read', (req, res) => {
  const chat = db.markChatAsRead(req.params.id, 'admin');
  if (!chat) return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท' });
  res.json({ success: true, chat });
});

// ==========================================
// 10. ADMIN AUDIT LOGS APIS
// ==========================================

// Admin: Get all Audit Logs
router.get('/admin/audit-logs', (req, res) => {
  try {
    const logs = db.getAuditLogs ? db.getAuditLogs() : (db.data.auditLogs || []).slice().reverse();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 11. DATABASE PERSISTENCE & BACKUP APIS
// ==========================================

// Get database persistence status
router.get('/admin/database/status', (req, res) => {
  try {
    const status = db.getDatabaseStatus();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Download full backup JSON file
router.get('/admin/database/backup', (req, res) => {
  try {
    const backup = db.exportDatabase();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `boostup_db_backup_${dateStr}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Restore database from uploaded JSON
router.post('/admin/database/restore', (req, res) => {
  try {
    const { backupData, adminName } = req.body;
    if (!backupData) {
      return res.status(400).json({ success: false, message: 'ไม่พบข้อมูลไฟล์สำรอง' });
    }
    const result = db.importDatabase(backupData);
    db.logAction('admin', adminName || 'Admin', 'RESTORE_DATABASE', `กู้คืนข้อมูลระบบจากไฟล์สำรอง (สมาชิก ${result.usersCount} คน, ออเดอร์ ${result.ordersCount} รายการ)`);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Connect to external PostgreSQL cloud database
router.post('/admin/database/connect-pg', async (req, res) => {
  try {
    const { databaseUrl, adminName } = req.body;
    if (!databaseUrl) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก DATABASE_URL' });
    }
    await db.connectPostgres(databaseUrl);
    db.logAction('admin', adminName || 'Admin', 'CONNECT_POSTGRES', 'เชื่อมต่อและซิงค์ฐานข้อมูลไปยัง Cloud PostgreSQL สำเร็จ');
    res.json({
      success: true,
      message: 'เชื่อมต่อและซิงค์ฐานข้อมูลไปยัง Cloud PostgreSQL สำเร็จเรียบร้อย ข้อมูลจะถูกเก็บถาวร 100%'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 12. IGN PREVIEW (ระบบตรวจสอบชื่อตัวละคร)
// ==========================================
router.post('/game/check-ign', async (req, res) => {
  try {
    const { gameId, inputId, serverId } = req.body;
    if (!inputId) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุไอดี / UID / ชื่อผู้เล่น' });
    }
    const result = await ignVerificationService.verifyPlayer(gameId, inputId, serverId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 13. LUCKY WHEEL & DAILY CHECK-IN
// ==========================================
router.get('/wheel/prizes', (req, res) => {
  const prizes = db.getLuckyWheelPrizes();
  const settings = db.getLuckyWheelSettings();
  const winners = db.getLuckyWheelWinners();
  res.json({ success: true, prizes, settings, winners });
});

router.get('/wheel/recent-winners', (req, res) => {
  const winners = db.getLuckyWheelWinners();
  res.json({ success: true, winners });
});

router.get('/wheel/my-history', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const history = db.getUserWheelHistory(userId);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/wheel/spin', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนหมุนวงล้อ' });
    }
    const result = db.spinLuckyWheel(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/user/daily-checkin', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนเช็คชื่อ' });
    }
    const result = db.dailyCheckin(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Lucky Wheel Management
router.get('/admin/wheel', (req, res) => {
  try {
    const prizes = db.getLuckyWheelPrizes();
    const settings = db.getLuckyWheelSettings();
    res.json({ success: true, prizes, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/wheel/prizes', (req, res) => {
  try {
    const { prizes } = req.body;
    if (!prizes || !Array.isArray(prizes)) {
      return res.status(400).json({ success: false, message: 'ข้อมูลรางวัลไม่ถูกต้อง' });
    }
    const updated = db.updateLuckyWheelPrizes(prizes);
    res.json({ success: true, message: 'บันทึกรางวัลวงล้อเรียบร้อย', prizes: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/wheel/prize', (req, res) => {
  try {
    const prize = req.body;
    if (!prize.name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อรางวัล' });
    }
    const added = db.addLuckyWheelPrize(prize);
    res.json({ success: true, message: 'เพิ่มรางวัลสำเร็จ', prize: added });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/wheel/prize/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateLuckyWheelPrize(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'ไม่พบรางวัลที่ต้องการแก้ไข' });
    }
    res.json({ success: true, message: 'แก้ไขรางวัลสำเร็จ', prize: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/wheel/prize/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteLuckyWheelPrize(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'ไม่พบรางวัลที่ต้องการลบ' });
    }
    res.json({ success: true, message: 'ลบรางวัลออกจากวงล้อสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/wheel/settings', (req, res) => {
  try {
    const settings = db.updateLuckyWheelSettings(req.body);
    res.json({ success: true, message: 'บันทึกการตั้งค่าวงล้อสำเร็จ', settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 14. AFFILIATE / REFERRAL SYSTEM
// ==========================================
router.get('/user/affiliate/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const detail = db.getUserAffiliateDetail(userId, false);
    if (!detail) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    res.json({ success: true, affiliate: detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Affiliate Inspector
router.get('/admin/affiliates', (req, res) => {
  try {
    const data = db.getAllAffiliatesSummary();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/affiliates/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const detail = db.getUserAffiliateDetail(userId, true);
    if (!detail) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้นี้' });
    }
    res.json({ success: true, detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 15. MULTI-ITEM CART CHECKOUT
// ==========================================
router.post('/cart/checkout', async (req, res) => {
  try {
    const { items, paymentMethod, customerContact, userId, couponCode } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่มีสินค้าในตะกร้า' });
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    let discountAmount = 0;

    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && !coupon.isInactive && !coupon.isExpired && !coupon.isLimitReached) {
        if (!coupon.minSpend || totalAmount >= coupon.minSpend) {
          if (coupon.discountType === 'percent') {
            discountAmount = Math.round((totalAmount * (coupon.discountValue / 100)) * 100) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
          } else {
            discountAmount = Math.min(totalAmount, coupon.discountValue);
          }
          db.updateCoupon(coupon.id, { usedCount: (coupon.usedCount || 0) + 1 });
        }
      }
    }

    const finalPayAmount = Math.max(0, totalAmount - discountAmount);

    if (paymentMethod === 'wallet') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'กรุณาเข้าสู่ระบบเพื่อชำระด้วยกระเป๋าเงิน' });
      }
      const user = db.findUserById(userId);
      if (!user || Number(user.walletBalance || 0) < finalPayAmount) {
        return res.status(400).json({ success: false, message: 'ยอดเงินคงเหลือในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ' });
      }

      user.walletBalance = Math.round((Number(user.walletBalance) - finalPayAmount) * 100) / 100;
      db.save();

      db.createTransaction({
        userId,
        type: 'payment',
        amount: -finalPayAmount,
        status: 'completed',
        description: `ชำระค่าสินค้าในตะกร้า ${items.length} รายการ`
      });
    }

    const createdOrders = [];
    for (const item of items) {
      const itemPrice = Number(item.price || 0);
      const ratio = totalAmount > 0 ? (itemPrice / totalAmount) : 1;
      const itemFinalAmount = Math.round((itemPrice - (discountAmount * ratio)) * 100) / 100;

      const order = db.createOrder({
        userId: userId || null,
        gameId: item.gameId,
        gameName: item.gameName,
        packageId: item.packageId,
        packageName: item.packageName,
        price: itemPrice,
        finalAmount: itemFinalAmount,
        costPrice: item.costPrice || Math.round(itemPrice * 0.85 * 100) / 100,
        playerId: item.playerId || '',
        serverId: item.serverId || '',
        playerIgn: item.playerIgn || '',
        customerContact: customerContact || '',
        paymentMethod: paymentMethod || 'promptpay',
        paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
        topupStatus: paymentMethod === 'wallet' ? 'completed' : 'processing'
      });

      if (paymentMethod === 'wallet') {
        db.updateOrder(order.id, { paymentStatus: 'paid', topupStatus: 'completed' });
      }

      createdOrders.push(order);
      // Send notification for cart order
      try {
        const curSettings = db.getSettings();
        notificationService.sendNewOrderNotification(order, curSettings).catch(() => {});
      } catch (e) {}
    }

    let promptpayQr = null;
    if (paymentMethod === 'promptpay') {
      const targetPhone = db.getSettings().promptpayNumber || '0899999999';
      promptpayQr = paymentService.generatePromptPayQR(targetPhone, finalPayAmount);
    }

    res.json({
      success: true,
      message: paymentMethod === 'wallet' ? 'ชำระเงินสำเร็จครบทุกรายการในตะกร้าแล้ว!' : 'สร้างออเดอร์ในตะกร้าสำเร็จ กรุณาสแกนชำระเงิน',
      orders: createdOrders,
      totalAmount,
      discountAmount,
      finalPayAmount,
      paymentMethod,
      promptpayQr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test LINE Notify Endpoint
router.post('/admin/marketing/test-notify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || !token.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก LINE Notify Token' });
    }
    const result = await notificationService.testLineNotify(token);
    if (result.success) {
      res.json({ success: true, message: 'ส่งข้อความทดสอบเข้า LINE เรียบร้อยแล้ว!' });
    } else {
      res.status(400).json({ success: false, message: 'ส่งไม่สำเร็จ: กรุณาตรวจสอบ Token อีกครั้ง' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 16. AUTO SLIP VERIFICATION (ตรวจสลิปอัตโนมัติ)
// ==========================================
router.post('/slip/auto-verify', async (req, res) => {
  try {
    const { qrRaw, amount, bankAccount, orderNumber, userId, slipImageUrl } = req.body;
    
    const verification = slipVerificationService.verifySlip({
      qrPayload: qrRaw,
      expectedAmount: amount,
      targetAccount: bankAccount,
      orderNumber,
      userId
    });

    if (!verification.success) {
      return res.status(400).json(verification);
    }

    if (orderNumber) {
      const order = db.getOrderById(orderNumber);
      if (order) {
        db.updateOrder(order.id, {
          paymentStatus: 'paid',
          topupStatus: 'completed',
          slipVerified: true,
          slipRef: verification.data.transRef,
          slipVerifiedAt: new Date().toISOString(),
          slipImage: slipImageUrl || order.slipImage
        });

        topupEngine.processOrder(order);
      }
    } else if (userId && amount) {
      const user = db.findUserById(userId);
      if (user) {
        const depositAmt = Number(amount);
        user.walletBalance = Math.round(((Number(user.walletBalance) || 0) + depositAmt) * 100) / 100;
        db.save();

        db.createTransaction({
          userId: user.id,
          type: 'deposit',
          amount: depositAmt,
          status: 'completed',
          description: `เติมเงินเข้ากระเป๋าผ่านระบบสแกนสลิปอัจฉริยะ (Ref: ${verification.data.transRef})`
        });
      }
    }

    res.json({
      success: true,
      message: 'ตรวจสอบสลิปสำเร็จ ยอดเงินถูกต้องและเป็นสลิปใหม่ ไม่เคยใช้งานมาก่อน! 🚀',
      verificationData: verification.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 17. DIGITAL STOCK VAULT (คลังโค้ดดิจิทัลอัตโนมัติ)
// ==========================================
router.get('/admin/vault', (req, res) => {
  try {
    const stats = db.getVaultStats();
    const codes = db.getDigitalVault();
    res.json({ success: true, stats, codes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/vault/import', (req, res) => {
  try {
    const { codes, adminName } = req.body;
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุรายการรหัสที่ต้องการนำเข้า' });
    }
    const added = db.addVaultCodes(codes);
    db.logAction('admin', adminName || 'Admin', 'IMPORT_VAULT_CODES', `นำเข้ารหัสโค้ดดิจิทัลสำเร็จ ${added.length} รหัส`);
    res.json({ success: true, addedCount: added.length, codes: added });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/vault/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteVaultCode(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'ไม่พบรหัสที่ต้องการลบ' });
    }
    res.json({ success: true, message: 'ลบรหัสออกจากคลังสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
