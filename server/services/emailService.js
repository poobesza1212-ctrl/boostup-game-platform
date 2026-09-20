const nodemailer = require('nodemailer');
const db = require('../config/database');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Get or initialize nodemailer transporter
   */
  getTransporter() {
    const settings = db.getSettings();
    const smtp = settings.smtp || {};

    const host = smtp.host || process.env.SMTP_HOST;
    const port = Number(smtp.port || process.env.SMTP_PORT) || 465;
    const user = smtp.user || process.env.SMTP_USER;
    const pass = smtp.pass || process.env.SMTP_PASS;
    const secure = smtp.secure !== undefined ? smtp.secure : (port === 465);

    if (!user || !pass) {
      return null; // Not configured, fallback to simulation
    }

    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure,
      auth: { user, pass }
    });
  }

  /**
   * Send Password Reset OTP Email
   */
  async sendPasswordResetOtp(toEmail, recipientName, otpCode) {
    const settings = db.getSettings();
    const siteName = settings.siteName || 'BOOSTUP ร้านเติมเงินเกม';
    const fromSender = settings.smtp?.from || process.env.SMTP_FROM || `"${siteName}" <noreply@boostup-game.online>`;

    const transporter = this.getTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รหัสยืนยัน OTP สำหรับตั้งรหัสผ่านใหม่</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #07090e; font-family: 'Prompt', 'Kanit', Arial, sans-serif; color: #f1f5f9;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07090e; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0e121a; border: 1px solid #7f1d1d; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 28px 32px; background: linear-gradient(135deg, #450a0a 0%, #1c0505 100%); border-bottom: 1px solid rgba(220, 38, 38, 0.3); text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
                      BOOST<span style="color: #ef4444;">UP</span>
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 11px; color: #fca5a5; letter-spacing: 1px;">
                      PLAY MORE GO FURTHER • บริการเติมเงินเกมอัตโนมัติ
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; text-align: center;">
                      🔑 รหัสยืนยันตั้งรหัสผ่านใหม่ (Reset OTP)
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">
                      สวัสดีคุณ <strong>${recipientName || 'ลูกค้า'}</strong>,<br>
                      เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณบน <strong>${siteName}</strong><br>
                      กรุณานำรหัส OTP 6 หลักด้านล่างนี้ไปกรอกที่หน้าต่างกู้คืนรหัสผ่าน:
                    </p>

                    <!-- OTP Code Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                      <tr>
                        <td align="center">
                          <div style="display: inline-block; background-color: #1a0808; border: 2px dashed #ef4444; border-radius: 16px; padding: 18px 36px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);">
                            <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #ef4444;">
                              ${otpCode}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 12px; color: #f59e0b; text-align: center; font-weight: 600;">
                      ⏳ รหัส OTP นี้มีอายุการใช้งาน 5 นาทีเท่านั้น
                    </p>

                    <div style="margin-top: 30px; padding: 16px; background-color: #181c24; border-radius: 12px; border: 1px solid #27272a;">
                      <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
                        🛡️ <strong>คำแนะนำด้านความปลอดภัย:</strong><br>
                        • อย่าเปิดเผยรหัส OTP นี้ให้แก่บุคคลอื่น ไม่ว่ากรณีใดๆ<br>
                        • หากคุณไม่ได้เป็นผู้ทำรายการนี้ กรุณาละเว้นอีเมลนี้ บัญชีของคุณยังคงปลอดภัย
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #090b10; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="margin: 0; font-size: 10px; color: #64748b;">
                      อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้โดยตรง<br>
                      ต้องการความช่วยเหลือ? ติดต่อฝ่ายบริการลูกค้าผ่านแชทสดบนเว็บไซต์ได้ตลอด 24 ชม.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (!transporter) {
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL SERVICE - DEV/SIMULATION MODE]`);
      console.log(`✉️ To:        ${toEmail} (${recipientName})`);
      console.log(`🔑 OTP Code:  ${otpCode}`);
      console.log(`⏰ Expires:   In 5 minutes`);
      console.log(`ℹ️ Notice:    Configure SMTP in Admin Settings to deliver real emails.`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true, otp: otpCode };
    }

    try {
      const info = await transporter.sendMail({
        from: fromSender,
        to: toEmail,
        subject: `[${siteName}] รหัส OTP สำหรับรีเซ็ตรหัสผ่านของคุณ: ${otpCode}`,
        html: htmlContent
      });

      console.log(`✅ [EMAIL SERVICE] Reset OTP sent successfully to ${toEmail} (Message ID: ${info.messageId})`);
      return { success: true, simulated: false, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [EMAIL SERVICE ERROR] Failed to send email to ${toEmail}:`, err.message);
      // Fallback so user is not stuck if SMTP fails
      return { success: true, simulated: true, otp: otpCode, error: err.message };
    }
  }
}

const emailService = new EmailService();
module.exports = emailService;
