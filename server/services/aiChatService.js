// server/services/aiChatService.js
// BOOSTUP 24/7 Intelligent AI Store Assistant

/**
 * Intelligent AI Chat Assistant for BOOSTUP Game Top-up Platform
 * Provides 24/7 instant, accurate, and polite responses in Thai.
 * Has full context on games, pricing, payment methods, order lookup, and human handoff.
 */

class AIChatService {
  constructor() {
    this.name = "BOOSTUP AI Assistant";
  }

  /**
   * Main entry point: generate an intelligent AI reply
   * @param {string} userMessage - Text from the customer
   * @param {object} context - { chat, db, user }
   * @returns {object} - { text, shouldHandoffToHuman, suggestedChips }
   */
  async generateReply(userMessage, { chat, db, user } = {}) {
    const raw = (userMessage || '').trim();
    const lower = raw.toLowerCase();

    // 1. Detect Intent: Requesting Human Admin / Person
    if (this.isRequestingHuman(lower)) {
      return {
        text: `รับทราบครับผม! 👨‍💼 ขณะนี้ระบบได้ส่งเรื่องแจ้งเตือนไปยัง **แอดมินเจ้าหน้าที่คนจริง** ให้เรียบร้อยแล้วครับ\n\nกรุณาพิมพ์รายละเอียด คำถาม หรือเลขออเดอร์ที่ต้องการให้เจ้าหน้าที่ตรวจสอบทิ้งไว้ได้เลยครับ เจ้าหน้าที่จะเข้ามาตอบกลับโดยเร็วที่สุดครับ 🙏`,
        shouldHandoffToHuman: true,
        suggestedChips: ['เช็คสถานะออเดอร์', 'โอนเงินไม่เข้า', 'ติดต่อผ่าน LINE']
      };
    }

    // 2. Detect Intent: Order Tracking (e.g. BST-20260921-12571 or contains "สถานะ", "ออเดอร์", "เลขออเดอร์")
    const orderMatch = raw.match(/BST-\d{8}-\d+/i) || raw.match(/ord_\d+/i);
    if (orderMatch && db) {
      const orderId = orderMatch[0];
      const order = db.getOrderById(orderId);
      if (order) {
        return this.formatOrderLookupReply(order);
      } else {
        return {
          text: `🔍 ไม่พบข้อมูลคำสั่งซื้อหมายเลข **${orderId}** ในระบบครับ\n\nรบกวนตรวจสอบตัวสะกดอีกครั้ง หรือหากเพิ่งทำรายการเข้ามา สามารถรอระบบอัปเดตสักครู่ หรือกดปุ่ม **"ติดต่อแอดมินคนจริง"** เพื่อให้เจ้าหน้าที่ตรวจสอบให้ได้เลยครับ`,
          shouldHandoffToHuman: false,
          suggestedChips: ['วิธีเติมเงิน', 'ติดต่อแอดมินคนจริง']
        };
      }
    }

    // 3. User asking about general order status without specifying an ID
    if (lower.includes('เช็คออเดอร์') || lower.includes('ตามออเดอร์') || lower.includes('สถานะออเดอร์') || lower.includes('เช็คสถานะ')) {
      // If user is logged in, look up their latest order
      if (user?.id && db) {
        const userOrders = (db.getOrders() || []).filter(o => o.userId === user.id);
        if (userOrders.length > 0) {
          const latest = userOrders[0];
          return this.formatOrderLookupReply(latest, true);
        }
      }
      return {
        text: `📦 **วิธีตรวจสอบสถานะคำสั่งซื้อ:**\n\nคุณลูกค้าสามารถพิมพ์ **เลขออเดอร์** (เช่น \`BST-20260922-12570\`) ส่งเข้ามาในแชทนี้ได้เลยครับ AI จะดึงสถานะล่าสุดมาให้ทันทีครับ!\n\nหรือหากต้องการให้เจ้าหน้าที่คนจริงตรวจสอบ สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ได้ตลอดเวลาครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ติดต่อแอดมินคนจริง', 'วิธีเติมเงิน']
      };
    }

    // 4. Detect Intent: Roblox / Robux
    if (lower.includes('roblox') || lower.includes('robux') || lower.includes('โรบล็อก') || lower.includes('โรบัก') || lower.includes('โรบักส์')) {
      return {
        text: `🔥 **บริการเติม Roblox (Robux) ร้าน BOOSTUP:**\n\n• **ระบบเติม**: เติมผ่าน **Username (ชื่อผู้ใช้)** ได้โดยตรง ปลอดภัย 100% ไม่ต้องใช้รหัสผ่าน (Password) และไม่ต้องขอ OTP\n• **เรตราคา**: คุ้มค่า มีแพ็กเกจตั้งแต่ 80 Robux ถึง 10,000 Robux (VIP Pack)\n• **ระยะเวลา**: เฉลี่ย 1-3 วินาที เติมเข้าทันทีหลังชำระเงินเรียบร้อย\n\n💡 *ข้อแนะนำ: กรุณากรอก Username ในโปรไฟล์ (ไม่ใช่ Display Name) เพื่อให้ระบบส่ง Robux เข้าไอดีได้อย่างถูกต้องครับ!*`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'เช็คสถานะออเดอร์', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 5. Detect Intent: ROV
    if (lower.includes('rov') || lower.includes('อาร์โอวี') || lower.includes('คูปอง rov')) {
      return {
        text: `⚔️ **บริการเติมเกม ROV (Realm of Valor):**\n\n• **ระบบเติม**: ใช้เพียง **OpenID / Player ID** จากในเกม ไม่ขอรหัสผ่าน ปลอดภัย 100%\n• **วิธีดู OpenID**: เข้าเกม ROV > กดที่รูปโปรไฟล์มุมซ้ายบน > เลือกแท็บข้อมูลตัวละคร > คัดลอก OpenID\n• **ความไว**: ยิง API เข้าคูปองอัตโนมัติ 24 ชม. ภายใน 1-3 วินาทีครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 6. Detect Intent: Free Fire
    if (lower.includes('free fire') || lower.includes('freefire') || lower.includes('ฟีฟาย') || lower.includes('เพชรฟีฟาย')) {
      return {
        text: `⚡ **บริการเติมเกม Free Fire:**\n\n• **ระบบเติม**: ใช้เพียง **Player ID (UID)** ตัวเลข 8-10 หลักใต้ชื่อตัวละคร\n• **แพ็กเกจ**: มีทั้งเพชรรายสัปดาห์ / รายเดือน และเพชรปกติ เติมเข้าทันทีใน 1 วิ ได้รับโบนัสเพชรจุใจ\n• ไม่ต้องใช้รหัสผ่าน ปลอดภัย ไม่โดนแบน 100% ครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 7. Detect Intent: Valorant
    if (lower.includes('valorant') || lower.includes('วาโล') || lower.includes('vp')) {
      return {
        text: `🎯 **บริการเติมเกม Valorant (VP - Valorant Points):**\n\n• **ระบบเติม**: ใช้ **Riot ID พร้อม Tagline** เช่น \`Player#TH1\`\n• **เรตพิเศษ**: ถูกกว่าเติมตรงในเกม มีแพ็กเกจ 475 VP ถึง 5,350 VP\n• ส่งเข้าบัญชี Riot โดยตรงใน 1-3 วินาทีครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 8. Detect Intent: Payment Methods / Payment Help
    if (lower.includes('ชำระเงิน') || lower.includes('จ่ายเงิน') || lower.includes('โอนเงิน') || lower.includes('ช่องทาง') || lower.includes('พร้อมเพย์') || lower.includes('true money') || lower.includes('ทรูมันนี่')) {
      return {
        text: `💳 **ช่องทางการชำระเงินที่ร้าน BOOSTUP รองรับ:**\n\n1. **พร้อมเพย์ (PromptPay QR Code)**: สแกนจ่ายผ่าน Mobile Banking ทุกธนาคาร ฟรีค่าธรรมเนียม ตรวจสอบยอดออโต้วินาทีต่อวินาที\n2. **โอนผ่านบัญชีธนาคาร (Bank Transfer)**: โอนเข้าบัญชีร้านแล้วแนบสลิป แอดมินตรวจสอบและอนุมัติยอดไว\n3. **ซองของขวัญ TrueMoney**: สร้างลิงก์ซองอั่งเปาในแอป TrueMoney แล้วนำลิงก์มากรอก เงินเข้าทันที\n4. **กระเป๋าเงินสมาชิก (Wallet)**: เติมเงินเก็บไว้ในบัญชี แล้วกดซื้อได้ทันที ไม่ต้องสแกนบ่อยครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ซองของขวัญทำไง', 'เงินไม่เข้าทำไง', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 9. Detect Intent: Problem with Payment / Money not received
    if (lower.includes('ไม่เข้า') || lower.includes('เงินไม่เข้า') || lower.includes('สลิป') || lower.includes('โอนแล้ว') || lower.includes('ยอดไม่ปรับ') || lower.includes('ติดปัญหา')) {
      return {
        text: `⚠️ **พบปัญหาการชำระเงินหรือยอดไม่เข้าใช่ไหมครับ?**\n\nไม่ต้องกังวลนะครับ ทางร้านมีระบบรับประกัน 100%:\n\n1. **หากโอนเงินแนบสลิป**: แอดมินกำลังตรวจสอบความถูกต้องของสลิปและยอดเงิน จะอนุมัติให้ภายในไม่กี่นาทีครับ\n2. **หากสแกน QR พร้อมเพย์**: ปกติยอดจะตัดออโต้ทันที หากยอดไม่อัปเดต กรุณาแจ้งเลขออเดอร์หรือแนบหลักฐานสลิปไว้ในแชทนี้ได้เลยครับ\n\n👨‍💼 **ต้องการให้แอดมินตรวจสอบทันที**: กดปุ่ม **"ติดต่อแอดมินคนจริง"** ด้านบนได้เลยครับ เจ้าหน้าที่จะรีบเข้ามาเช็คให้ครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ติดต่อแอดมินคนจริง', 'เช็คสถานะออเดอร์']
      };
    }

    // 10. Detect Intent: TrueMoney Gift Link Guide
    if (lower.includes('ซองของขวัญ') || lower.includes('อั่งเปา') || lower.includes('ทรูมันนี่วอลเล็ท')) {
      return {
        text: `🎁 **วิธีสร้างซองของขวัญ TrueMoney:**\n\n1. เปิดแอป **TrueMoney Wallet**\n2. ไปที่เมนู **"ส่งซองของขวัญ" (โอนเงินด้วยซองของขวัญ)**\n3. กรอกจำนวนเงินให้ตรงกับยอดชำระ\n4. เลือกประเภทการแบ่ง: **"สุ่มจำนวนเงิน"** หรือ **"แบ่งเท่ากัน"** ใส่จำนวนผู้รับ **1 คน**\n5. กดยืนยัน แล้วคัดลอก **ลิงก์ซองของขวัญ** (https://gift.truemoney.com/...)\n6. นำลิงก์มากรอกในหน้าสั่งซื้อ เงินจะตัดและเติมเกมให้อัตโนมัติทันทีครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 11. Greetings
    if (lower.includes('สวัสดี') || lower.includes('ดีครับ') || lower.includes('ดีค่ะ') || lower.includes('hello') || lower.includes('hi') || lower === 'หวัดดี') {
      const name = user?.name || user?.username || '';
      return {
        text: `สวัสดีครับคุณ ${name ? name : 'ลูกค้า'}! 🙏 ยินดีต้อนรับสู่ **BOOSTUP ร้านเติมเกมอัตโนมัติ 24 ชม.** ครับ 🤖\n\nผมคือ **AI Assistant** คอยช่วยตอบคำถามและดูแลลูกค้าตลอด 24 ชั่วโมงครับ คุณลูกค้าสามารถพิมพ์ถามได้เลยนะครับ เช่น:\n• สอบถามวิธีเติมเกม / เรตราคา\n• ตรวจสอบสถานะออเดอร์\n• ช่องทางชำระเงิน\n\nหรือหากต้องการคุยกับเจ้าหน้าที่คนจริง สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ด้านบนได้ตลอดเวลาครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติม Roblox (Robux)', 'เช็คสถานะออเดอร์', 'วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // 12. General fallback response
    return {
      text: `ขอบคุณสำหรับคำถามครับ! 🙏 ผมคือ **BOOSTUP AI Assistant** 🤖\n\nผมพร้อมช่วยตอบข้อมูลการเติมเกม, เรตราคาแพ็กเกจ, วิธีชำระเงิน (พร้อมเพย์ / สลิป / ซองของขวัญ) หรือเช็คสถานะเลขออเดอร์ (\`BST-...\`) ครับ\n\nหากต้องการความช่วยเหลือเฉพาะเจาะจง หรือต้องการคุยกับเจ้าหน้าที่โดยตรง สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ด้านบนได้เลยนะครับ เจ้าหน้าที่จะเข้ามาดูแลคุณลูกค้าทันทีครับ!`,
      shouldHandoffToHuman: false,
      suggestedChips: ['เติม Roblox (Robux)', 'เช็คสถานะออเดอร์', 'วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
    };
  }

  /**
   * Helper to check if user is asking to speak with a human
   */
  isRequestingHuman(text) {
    const keywords = [
      'คนจริง',
      'คุยกับคน',
      'ติดต่อคน',
      'คุยกับแอดมิน',
      'แอดมินคนจริง',
      'ขอคุยกับคน',
      'พนักงาน',
      'เจ้าหน้าที่',
      'ต้องการคุยกับเจ้าหน้าที่',
      'ติดต่อเจ้าหน้าที่',
      'ขอแอดมิน',
      'call admin',
      'human',
      'agent'
    ];
    return keywords.some(k => text.includes(k));
  }

  /**
   * Helper to format an order lookup response
   */
  formatOrderLookupReply(order, isLatest = false) {
    const statusThai = order.topupStatus === 'completed'
      ? '✅ เติมเงินสำเร็จเรียบร้อยแล้ว'
      : order.topupStatus === 'processing'
      ? '⏳ กำลังส่งคำสั่งเติมเงินเข้าเกม (เฉลี่ย 1-3 วินาที)'
      : order.topupStatus === 'failed'
      ? '❌ รายการติดขัด (ระบบกำลังตรวจสอบ/รอดำเนินการซ้ำ)'
      : 'รอดำเนินการ';

    const paymentStatusThai = order.paymentStatus === 'paid'
      ? 'ชำระเงินแล้ว ✓'
      : 'รอชำระเงิน';

    return {
      text: `📦 **ข้อมูลสถานะคำสั่งซื้อ ${isLatest ? '(ล่าสุดของคุณ)' : ''}**\n\n• **เลขออเดอร์**: \`${order.orderNumber || order.id}\`\n• **สินค้า/เกม**: ${order.gameName || order.itemTitle || 'เติมเกมออนไลน์'}\n• **แพ็กเกจ**: ${order.packageName || '-'}\n• **ยอดเงิน**: ฿${(order.finalAmount || order.price || 0).toLocaleString()} บาท\n• **สถานะการชำระ**: ${paymentStatusThai}\n• **สถานะการเติมเกม**: ${statusThai}\n• **เวลาที่ทำรายการ**: ${new Date(order.createdAt).toLocaleString('th-TH')}\n\nหากต้องการสอบถามเพิ่มเติมเกี่ยวกับออเดอร์นี้ สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ได้เลยครับ!`,
      shouldHandoffToHuman: false,
      suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
    };
  }
}

module.exports = new AIChatService();
