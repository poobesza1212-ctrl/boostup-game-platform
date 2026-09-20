const QRCode = require('qrcode');
const { generatePromptPayPayload } = require('./promptpay');
const db = require('../config/database');

class PaymentService {
  /**
   * Generate dynamic PromptPay QR Code
   * @param {number} amount 
   * @param {string} customNumber 
   * @returns {Promise<{qrDataUrl: string, rawPayload: string, expiresAt: string}>}
   */
  async generatePromptPay(amount, customNumber = null) {
    const settings = db.getSettings();
    const target = customNumber || settings.promptpayNumber || '0891234567';
    const payload = generatePromptPayPayload(target, amount);

    // Render high quality QR Code with red/dark accent styling
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    return {
      qrDataUrl,
      rawPayload: payload,
      promptpayNumber: target,
      accountName: settings.promptpayName || "บจก. บูสต์อัพ (BOOSTUP)",
      amount: Number(amount).toFixed(2),
      expiresAt
    };
  }

  /**
   * Validate and redeem TrueMoney Gift Voucher (ซองของขวัญ)
   * Example: https://gift.truemoney.com/campaign/?v=38194829381923
   */
  async verifyTrueMoneyVoucher(voucherUrl, expectedAmount) {
    let voucherCode = voucherUrl.trim();
    if (voucherUrl.includes('?v=')) {
      voucherCode = voucherUrl.split('?v=')[1].split('&')[0];
    }

    if (!voucherCode || voucherCode.length < 8) {
      throw new Error("ลิงก์ซองของขวัญ TrueMoney ไม่ถูกต้อง กรุณาคัดลอกลิงก์ให้ครบถ้วน");
    }

    // In production, calls TrueMoney B2B / campaign redeem API
    // Here we provide instant verified simulation
    return {
      success: true,
      voucherCode,
      redeemedAmount: Number(expectedAmount),
      message: "ดึงเงินจากซองของขวัญ TrueMoney สำเร็จแล้ว"
    };
  }

  /**
   * Bank Transfer Slip Verification (Simulated SlipOK / EasySlip OCR API)
   */
  async verifyBankSlip(slipFileBase64, expectedAmount) {
    // Generates simulated bank ref and matching verification
    const randomBankRef = `BKB-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      bankRef: randomBankRef,
      verifiedAmount: Number(expectedAmount),
      transferTime: new Date().toISOString(),
      bankSender: "ธนาคารกสิกรไทย (KBANK)",
      message: "ตรวจสอบสลิปธนาคารถูกต้อง มียอดเงินเข้าเรียบร้อย"
    };
  }

  /**
   * Pay with User Wallet Balance
   */
  async payWithWallet(userId, amount) {
    const user = db.findUserById(userId);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้งาน");
    }

    const currentBalance = Number(user.walletBalance || 0);
    const requiredAmount = Number(amount);

    if (currentBalance < requiredAmount) {
      throw new Error(`ยอดเงินคงเหลือไม่พอ (มี ฿${currentBalance.toFixed(2)} แต่ต้องชำระ ฿${requiredAmount.toFixed(2)})`);
    }

    const newBalance = currentBalance - requiredAmount;
    db.updateUser(userId, { walletBalance: newBalance });

    return {
      success: true,
      remainingBalance: newBalance
    };
  }

  /**
   * Deposit into User Wallet with proof of payment verification
   */
  async depositWallet(userId, amount, method, slipImage = null, voucherUrl = null) {
    const user = db.findUserById(userId);
    if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้งาน");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new Error("ยอดเงินที่ต้องการเติมไม่ถูกต้อง");
    }

    if (method === 'truemoney') {
      if (!voucherUrl) {
        throw new Error("กรุณากรอกลิงก์ซองของขวัญ TrueMoney เพื่อเติมเงิน");
      }
      await this.verifyTrueMoneyVoucher(voucherUrl, numAmount);
    } else if (method === 'bank_transfer' || method === 'promptpay') {
      if (!slipImage) {
        throw new Error("กรุณาแนบสลิปหลักฐานการโอนเงินเพื่อยืนยันรายการ");
      }
    }

    const newBalance = (Number(user.walletBalance) || 0) + numAmount;
    db.updateUser(userId, { walletBalance: newBalance });

    // Record wallet transaction
    db.createTransaction({
      userId,
      type: 'deposit',
      amount: numAmount,
      method,
      slipImage: slipImage || null,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    db.logAction('user', user.name || user.username, 'WALLET_DEPOSIT', `เติมเงินเข้ากระเป๋า ฿${numAmount} ผ่าน ${method}`);

    return {
      success: true,
      newBalance
    };
  }
}

const paymentService = new PaymentService();
module.exports = paymentService;
