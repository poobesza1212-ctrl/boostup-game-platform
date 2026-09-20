/**
 * OTP Service for Managing Password Reset One-Time Passwords
 */
class OtpService {
  constructor() {
    this.otpStore = new Map(); // userId -> { otp, email, expiresAt, attempts, lastRequestedAt }
    
    // Auto cleanup expired OTPs every minute
    setInterval(() => {
      const now = Date.now();
      for (const [userId, record] of this.otpStore.entries()) {
        if (now > record.expiresAt) {
          this.otpStore.delete(userId);
        }
      }
    }, 60 * 1000);
  }

  /**
   * Generate 6-digit numeric OTP
   */
  generateOtp(userId, email) {
    const now = Date.now();
    const existing = this.otpStore.get(userId);

    // Rate limit: 60s cooldown between requests
    if (existing && now - existing.lastRequestedAt < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (now - existing.lastRequestedAt)) / 1000);
      throw new Error(`กรุณารออีก ${waitSeconds} วินาที ก่อนขอรหัส OTP ใหม่อีกครั้ง`);
    }

    // Generate 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiry

    this.otpStore.set(userId, {
      otp,
      email,
      expiresAt,
      attempts: 0,
      lastRequestedAt: now
    });

    return {
      otp,
      expiresAt,
      expiresInSeconds: 300
    };
  }

  /**
   * Verify provided OTP
   */
  verifyOtp(userId, inputOtp) {
    const record = this.otpStore.get(userId);
    if (!record) {
      return { valid: false, message: 'ไม่พบรหัส OTP หรือรหัสหมดอายุแล้ว กรุณากดขอรหัสใหม่' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(userId);
      return { valid: false, message: 'รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง' };
    }

    if (record.attempts >= 5) {
      this.otpStore.delete(userId);
      return { valid: false, message: 'คุณกรอกรหัส OTP ผิดเกิน 5 ครั้ง เพื่อความปลอดภัยกรุณากดขอรหัสใหม่' };
    }

    if (record.otp !== String(inputOtp).trim()) {
      record.attempts += 1;
      const remainingAttempts = 5 - record.attempts;
      return {
        valid: false,
        message: `รหัส OTP ไม่ถูกต้อง (เหลือโอกาสกรอกอีก ${remainingAttempts} ครั้ง)`
      };
    }

    // Valid! Consume OTP so it cannot be reused
    this.otpStore.delete(userId);
    return { valid: true };
  }

  /**
   * Clear OTP for user
   */
  clear(userId) {
    this.otpStore.delete(userId);
  }
}

const otpService = new OtpService();
module.exports = otpService;
