/**
 * Base Provider Interface for Game Top-up APIs
 */
class BaseProvider {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.code = config.code;
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.supportedGames = config.supportedGames || [];
  }

  /**
   * Check player nickname / account validity
   * @param {string} playerId 
   * @param {string} gameId 
   * @param {string} server 
   * @returns {Promise<{success: boolean, nickname: string, level?: number, error?: string}>}
   */
  async checkPlayer(playerId, gameId, server = '') {
    throw new Error("Method checkPlayer must be implemented by subclass");
  }

  /**
   * Execute auto top-up order
   * @param {object} orderDetails 
   * @returns {Promise<{success: boolean, providerOrderId: string, latencyMs: number, message: string, rawResponse: any}>}
   */
  async executeTopup(orderDetails) {
    throw new Error("Method executeTopup must be implemented by subclass");
  }

  /**
   * Check remaining balance in provider API
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    throw new Error("Method getBalance must be implemented by subclass");
  }
}

module.exports = BaseProvider;
