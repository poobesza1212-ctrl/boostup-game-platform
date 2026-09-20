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

    // 1. TrueMoney Voucher (instant check if valid)
    if (method === 'truemoney') {
      if (!voucherUrl) {
        throw new Error("กรุณากรอกลิงก์ซองของขวัญ TrueMoney เพื่อเติมเงิน");
      }
      await this.verifyTrueMoneyVoucher(voucherUrl, numAmount);

      const newBalance = (Number(user.walletBalance) || 0) + numAmount;
      db.updateUser(userId, { walletBalance: newBalance });

      const txn = db.createTransaction({
        userId,
        userName: user.name || user.username,
        userEmail: user.email || '',
        type: 'deposit',
        amount: numAmount,
        method,
        voucherUrl,
        status: 'completed',
        approvedAt: new Date().toISOString()
      });

      db.logAction('user', user.name || user.username, 'WALLET_DEPOSIT', `เติมเงินเข้ากระเป๋า ฿${numAmount} ผ่าน ${method} (สำเร็จทันที)`);

      return {
        success: true,
        status: 'completed',
        message: `เติมเงินเข้ากระเป๋าสำเร็จ ฿${numAmount.toFixed(2)} บาท`,
        newBalance,
        transaction: txn
      };
    }

    // 2. Bank Transfer / PromptPay Slip Verification
    if (method === 'bank_transfer' || method === 'promptpay') {
      if (!slipImage || typeof slipImage !== 'string' || slipImage.length < 50) {
        throw new Error("กรุณาแนบรูปภาพสลิปหลักฐานการโอนเงินที่ถูกต้อง");
      }

      const settings = db.getSettings();
      // Strict Security: Defaults to Manual Admin Approval so fake images cannot credit balance
      const isAutoApproval = settings.autoSlipApproval === true;

      if (!isAutoApproval) {
        // Create Pending Transaction for Admin Review
        const txn = db.createTransaction({
          userId,
          userName: user.name || user.username,
          userEmail: user.email || '',
          type: 'deposit',
          amount: numAmount,
          method,
          slipImage,
          status: 'pending', // PENDING ADMIN SLIP APPROVAL!
          notes: 'รอแอดมินตรวจสอบสลิปโอนเงิน'
        });

        db.logAction('user', user.name || user.username, 'SLIP_SUBMITTED', `ส่งสลิปแจ้งโอนเงิน ฿${numAmount} ผ่าน ${method} (รอดำเนินการตรวจสอบ)`);

        return {
          success: true,
          status: 'pending',
          message: `แจ้งโอนเงิน ฿${numAmount.toFixed(2)} เรียบร้อยแล้ว! สลิปของคุณอยู่ระหว่างรอแอดมินตรวจสอบ ยอดเงินจะเข้ากระเป๋าอัตโนมัติเมื่ออนุมัติ`,
          newBalance: user.walletBalance,
          transaction: txn
        };
      } else {
        // Auto approval (Demo mode)
        const newBalance = (Number(user.walletBalance) || 0) + numAmount;
        db.updateUser(userId, { walletBalance: newBalance });

        const txn = db.createTransaction({
          userId,
          userName: user.name || user.username,
          userEmail: user.email || '',
          type: 'deposit',
          amount: numAmount,
          method,
          slipImage,
          status: 'completed',
          approvedAt: new Date().toISOString()
        });

        db.logAction('user', user.name || user.username, 'WALLET_DEPOSIT', `เติมเงินเข้ากระเป๋า ฿${numAmount} ผ่าน ${method} (อนุมัติอัตโนมัติ)`);

        return {
          success: true,
          status: 'completed',
          message: `เติมเงินเข้ากระเป๋าสำเร็จ ฿${numAmount.toFixed(2)} บาท`,
          newBalance,
          transaction: txn
        };
      }
    }

    throw new Error("ไม่รองรับช่องทางการชำระเงินนี้");
  }

  /**
   * Admin approves a pending deposit slip
   */
  async approveDeposit(transactionId, adminName = 'แอดมิน') {
    const txn = db.getTransactionById(transactionId);
    if (!txn) throw new Error("ไม่พบรายการธุรกรรมนี้");
    if (txn.status === 'completed') throw new Error("รายการนี้ได้รับการอนุมัติไปแล้ว");
    if (txn.type !== 'deposit') throw new Error("ประเภทธุรกรรมไม่ถูกต้อง");

    const user = db.findUserById(txn.userId);
    if (!user) throw new Error("ไม่พบผู้ใช้งานเจ้าของสลิปนี้");

    const numAmount = Number(txn.amount) || 0;
    const newBalance = (Number(user.walletBalance) || 0) + numAmount;

    db.updateUser(user.id, { walletBalance: newBalance });
    const updatedTxn = db.updateTransaction(transactionId, {
      status: 'completed',
      approvedAt: new Date().toISOString(),
      approvedBy: adminName
    });

    db.logAction('admin', adminName, 'APPROVE_SLIP', `อนุมัติสลิปเติมเงิน ฿${numAmount} ให้แก่ลูกค้า ${user.name || user.username}`);

    return {
      success: true,
      transaction: updatedTxn,
      newBalance
    };
  }

  /**
   * Admin rejects a pending deposit slip
   */
  async rejectDeposit(transactionId, reason = 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง', adminName = 'แอดมิน') {
    const txn = db.getTransactionById(transactionId);
    if (!txn) throw new Error("ไม่พบรายการธุรกรรมนี้");
    if (txn.status === 'completed') throw new Error("ไม่สามารถปฏิเสธรายการที่อนุมัติแล้ว");

    const updatedTxn = db.updateTransaction(transactionId, {
      status: 'rejected',
      rejectedReason: reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: adminName
    });

    db.logAction('admin', adminName, 'REJECT_SLIP', `ปฏิเสธสลิปรายการ ${transactionId} เหตุผล: ${reason}`);

    return {
      success: true,
      transaction: updatedTxn
    };
  }
}

const paymentService = new PaymentService();
module.exports = paymentService;
