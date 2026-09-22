/**
 * BOOSTUP Merchant Notification Service
 * Supports: LINE Notify, Discord Webhook, Telegram
 */

const https = require('https');
const { URL } = require('url');

class NotificationService {
  /**
   * Helper to make POST request with URL-encoded or JSON payload
   */
  async makeRequest(targetUrl, headers, bodyString) {
    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(targetUrl);
        const options = {
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: {
            ...headers,
            'Content-Length': Buffer.byteLength(bodyString)
          },
          timeout: 8000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, statusCode: res.statusCode, body: data });
            } else {
              resolve({ success: false, statusCode: res.statusCode, body: data });
            }
          });
        });

        req.on('error', err => reject(err));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Notification request timed out (8s)'));
        });

        req.write(bodyString);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Send LINE Notify message
   * @param {string} token 
   * @param {string} message 
   */
  async sendLineNotify(token, message) {
    if (!token || !token.trim()) return { success: false, message: 'Missing LINE Notify Token' };

    try {
      const postData = new URLSearchParams({ message: message.trim() }).toString();
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token.trim()}`
      };

      const res = await this.makeRequest('https://notify-api.line.me/api/notify', headers, postData);
      return res;
    } catch (err) {
      console.warn('[LINE Notify Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send Discord Webhook message
   * @param {string} webhookUrl 
   * @param {Object} embedPayload 
   */
  async sendDiscordWebhook(webhookUrl, embedPayload) {
    if (!webhookUrl || !webhookUrl.trim()) return { success: false, message: 'Missing Discord Webhook' };

    try {
      const postData = JSON.stringify(embedPayload);
      const headers = { 'Content-Type': 'application/json' };
      const res = await this.makeRequest(webhookUrl.trim(), headers, postData);
      return res;
    } catch (err) {
      console.warn('[Discord Webhook Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send New Order Notification to merchant channels
   * @param {Object} order 
   * @param {Object} settings 
   */
  async sendNewOrderNotification(order, settings = {}) {
    if (!order) return;

    const marketing = settings?.marketing || {};
    const lineToken = marketing.lineNotifyToken || process.env.LINE_NOTIFY_TOKEN;
    const discordWebhook = marketing.discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL;

    // Build Thai message text
    const paymentLabelMap = {
      promptpay: 'พร้อมเพย์ QR',
      truemoney: 'ซองทรูมันนี่',
      bank_transfer: 'โอนธนาคาร',
      wallet: 'กระเป๋าเงินสมาชิก',
      credit_card: 'บัตรเครดิต'
    };
    const paymentName = paymentLabelMap[order.paymentMethod] || order.paymentMethod;

    const message = [
      `\n🛒 [BOOSTUP] ออเดอร์ใหม่เข้าแล้ว!`,
      `📄 เลขที่: ${order.orderNumber || order.id}`,
      `🎮 เกม: ${order.gameName || 'เกมออนไลน์'}`,
      `💎 แพ็กเกจ: ${order.packageName || '-'}`,
      `👤 บัญชี/UID: ${order.playerId || '-'} (${order.playerNickname || 'ลูกค้า'})`,
      `💰 ยอดชำระ: ฿${Number(order.finalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      `💳 ช่องทาง: ${paymentName}`,
      `🚦 สถานะ: ${order.topupStatus === 'completed' ? '✅ สำเร็จทันที' : '⏳ รอดำเนินการ'}`,
      `⏰ เวลา: ${new Date().toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' })} น.`
    ].join('\n');

    // 1. Send LINE Notify
    if (lineToken) {
      this.sendLineNotify(lineToken, message).catch(() => {});
    }

    // 2. Send Discord Webhook
    if (discordWebhook) {
      const discordEmbed = {
        username: "BOOSTUP Store Notifier",
        avatar_url: "https://www.boostup-game.online/boostup_logo.jpg",
        embeds: [{
          title: "🎉 มีคำสั่งซื้อใหม่เข้าระบบ!",
          description: `**เลขออเดอร์**: \`${order.orderNumber || order.id}\``,
          color: 0xef4444, // Red
          fields: [
            { name: "🎮 เกม / สินค้า", value: order.gameName || "-", inline: true },
            { name: "💎 แพ็กเกจ", value: order.packageName || "-", inline: true },
            { name: "💰 ยอดเงิน", value: `**฿${Number(order.finalAmount || 0).toFixed(2)}**`, inline: true },
            { name: "👤 UID ผู้เล่น", value: `\`${order.playerId || '-'}\``, inline: true },
            { name: "💳 ช่องทางชำระ", value: paymentName, inline: true },
            { name: "🚦 สถานะ", value: order.topupStatus === 'completed' ? "✅ สำเร็จทันที" : "⏳ รอดำเนินการ", inline: true }
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "BOOSTUP Automated Sales Engine" }
        }]
      };
      this.sendDiscordWebhook(discordWebhook, discordEmbed).catch(() => {});
    }
  }

  /**
   * Test LINE Notify connection
   */
  async testLineNotify(token) {
    const testMsg = `\n🔔 ทดสอบการแจ้งเตือนจากระบบร้านค้า BOOSTUP!\n✅ เชื่อมต่อระบบแจ้งเตือนสำเร็จ 100%\nพร้อมรับออเดอร์จากแคมเปญการตลาดแล้วครับ 🚀`;
    return await this.sendLineNotify(token, testMsg);
  }
}

module.exports = new NotificationService();
