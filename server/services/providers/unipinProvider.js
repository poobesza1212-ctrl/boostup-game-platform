const BaseProvider = require('./baseProvider');
const crypto = require('crypto');

class UnipinProvider extends BaseProvider {
  constructor(config = {}) {
    super({
      id: "prov_unipin",
      name: "UniPin B2B Gateway",
      code: "UNIPIN",
      endpoint: config.endpoint || "https://api.unipin.com/v2/order",
      apiKey: config.apiKey || process.env.UNIPIN_API_KEY || "uni_live_demo",
      apiSecret: config.apiSecret || process.env.UNIPIN_API_SECRET || "uni_sec_demo",
      supportedGames: ["rov", "freefire", "pubg_mobile", "genshin", "valorant"]
    });
  }

  async checkPlayer(playerId, gameId, server = '') {
    const hash = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      success: true,
      nickname: `UniGamer_${playerId.slice(-4)}`,
      level: 50 + (hash % 30)
    };
  }

  async executeTopup(order) {
    const startTime = Date.now();
    await new Promise(r => setTimeout(r, 260));
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      providerOrderId: `UNI-${Date.now().toString().slice(-8)}`,
      latencyMs,
      message: "ทำรายการเติมเงินอัตโนมัติสำเร็จ (UniPin B2B Gateway)",
      rawResponse: {
        status: "PAID",
        code: 1,
        refNo: `UNIPIN-REF-${Date.now()}`
      }
    };
  }

  async getBalance() {
    return {
      balance: 8900.50,
      currency: "THB"
    };
  }
}

module.exports = UnipinProvider;
