const BaseProvider = require('./baseProvider');

class CodashopProvider extends BaseProvider {
  constructor(config = {}) {
    super({
      id: "prov_codashop",
      name: "Codashop Direct B2B",
      code: "CODASHOP",
      endpoint: config.endpoint || "https://order.codashop.com/th/init",
      apiKey: config.apiKey || process.env.CODASHOP_API_KEY || "coda_demo",
      apiSecret: config.apiSecret || process.env.CODASHOP_API_SECRET || "coda_sec_demo",
      supportedGames: ["valorant", "genshin", "pubg_mobile"]
    });
  }

  async checkPlayer(playerId, gameId, server = '') {
    if (gameId === 'valorant') {
      const parts = playerId.split('#');
      const tag = parts[1] || 'TH1';
      return {
        success: true,
        nickname: `${parts[0]}#${tag}`,
        level: 82
      };
    }
    return {
      success: true,
      nickname: `CodaPlayer_${playerId.slice(-4)}`,
      level: 60
    };
  }

  async executeTopup(order) {
    const startTime = Date.now();
    await new Promise(r => setTimeout(r, 190));
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      providerOrderId: `CODA-${Date.now().toString().slice(-8)}`,
      latencyMs,
      message: "ทำรายการเติมเงินอัตโนมัติสำเร็จ (Codashop Direct B2B)",
      rawResponse: {
        result: "SUCCESS",
        txnId: `TX-CODA-${Date.now()}`
      }
    };
  }

  async getBalance() {
    return {
      balance: 24500.00,
      currency: "THB"
    };
  }
}

module.exports = CodashopProvider;
