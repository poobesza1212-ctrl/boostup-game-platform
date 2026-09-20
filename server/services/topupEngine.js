const db = require('../config/database');
const SmileOneProvider = require('./providers/smileOneProvider');
const UnipinProvider = require('./providers/unipinProvider');
const CodashopProvider = require('./providers/codashopProvider');

class TopupEngine {
  constructor() {
    this.providers = {
      prov_smileone: new SmileOneProvider(),
      prov_unipin: new UnipinProvider(),
      prov_codashop: new CodashopProvider()
    };
    this.queue = [];
    this.isProcessing = false;
    this.latencyHistory = [];
  }

  getProvider(providerId) {
    return this.providers[providerId] || this.providers.prov_smileone;
  }

  /**
   * Verify character UID with primary or fallback provider
   */
  async verifyPlayer(gameId, playerId, server = '') {
    const routes = db.getGameRoutes();
    const route = routes[gameId] || { primary: 'prov_smileone', fallback: 'prov_unipin' };
    const provider = this.getProvider(route.primary);

    try {
      const result = await provider.checkPlayer(playerId, gameId, server);
      return result;
    } catch (err) {
      console.warn(`[TopupEngine] Primary UID check failed for ${gameId}, falling back...`);
      const fallbackProvider = this.getProvider(route.fallback);
      return await fallbackProvider.checkPlayer(playerId, gameId, server);
    }
  }

  /**
   * Process order through auto top-up pipeline with smart failover
   */
  async processOrder(orderId) {
    const order = db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const settings = db.getSettings();
    if (!settings.autoTopupEnabled) {
      db.updateOrder(orderId, {
        topupStatus: 'pending_manual',
        errorMessage: 'ระบบเติมเงินอัตโนมัติถูกปิดชั่วคราวโดยผู้ดูแลระบบ'
      });
      return { success: false, status: 'pending_manual' };
    }

    // Determine Provider based on Routing Rules
    const routes = db.getGameRoutes();
    const gameRoute = routes[order.gameId] || { primary: 'prov_smileone', fallback: 'prov_unipin' };
    
    let targetProviderId = gameRoute.primary;
    let provider = this.getProvider(targetProviderId);
    let isFallback = false;

    // Check balance of primary provider
    const providerInfo = db.getProviderById(targetProviderId);
    if (providerInfo && providerInfo.balance < (order.costPrice || order.finalAmount)) {
      console.warn(`[TopupEngine] Provider ${targetProviderId} balance low (${providerInfo.balance} THB). Triggering SMART FAILOVER to fallback: ${gameRoute.fallback}`);
      targetProviderId = gameRoute.fallback;
      provider = this.getProvider(targetProviderId);
      isFallback = true;
    }

    db.updateOrder(orderId, {
      topupStatus: 'processing',
      providerId: targetProviderId,
      providerName: provider.name,
      isFallbackUsed: isFallback
    });

    try {
      // Execute Top-up
      const result = await provider.executeTopup(order);

      // Deduct internal provider balance
      if (providerInfo) {
        const newBalance = Math.max(0, providerInfo.balance - (order.costPrice || order.finalAmount));
        db.updateProvider(targetProviderId, { 
          balance: newBalance,
          latencyMs: result.latencyMs 
        });
      }

      // Record latency
      this.latencyHistory.push({
        provider: targetProviderId,
        latency: result.latencyMs,
        timestamp: Date.now()
      });
      if (this.latencyHistory.length > 50) this.latencyHistory.shift();

      // Award membership points to user (10 THB = 1 Point)
      if (order.userId && order.userId !== 'usr_anonymous') {
        const user = db.findUserById(order.userId);
        if (user) {
          const earnedPoints = Math.floor(order.finalAmount / 10);
          db.updateUser(user.id, { points: (user.points || 0) + earnedPoints });
        }
      }

      // Mark order as completed
      const updatedOrder = db.updateOrder(orderId, {
        topupStatus: 'completed',
        paymentStatus: 'paid',
        providerOrderId: result.providerOrderId,
        providerLatencyMs: result.latencyMs,
        providerResponse: result.rawResponse,
        completedAt: new Date().toISOString()
      });

      console.log(`[TopupEngine] Order ${order.orderNumber} successfully filled via ${provider.name} in ${result.latencyMs}ms`);
      return { success: true, order: updatedOrder };

    } catch (err) {
      console.error(`[TopupEngine] Provider ${targetProviderId} failed:`, err.message);

      // If we haven't tried fallback yet, try failover immediately
      if (!isFallback && gameRoute.fallback && gameRoute.fallback !== targetProviderId) {
        console.log(`[TopupEngine] Attempting automatic failover to ${gameRoute.fallback}...`);
        const fallbackProvider = this.getProvider(gameRoute.fallback);
        try {
          const result = await fallbackProvider.executeTopup(order);
          const updatedOrder = db.updateOrder(orderId, {
            topupStatus: 'completed',
            paymentStatus: 'paid',
            providerId: gameRoute.fallback,
            providerName: fallbackProvider.name,
            isFallbackUsed: true,
            providerOrderId: result.providerOrderId,
            providerLatencyMs: result.latencyMs,
            completedAt: new Date().toISOString()
          });
          return { success: true, order: updatedOrder, failoverOccurred: true };
        } catch (fallbackErr) {
          console.error(`[TopupEngine] Fallback provider also failed:`, fallbackErr.message);
        }
      }

      // If all failed, mark as failed for admin attention
      const failedOrder = db.updateOrder(orderId, {
        topupStatus: 'failed',
        errorMessage: err.message || 'ผู้ให้บริการ API ปฏิเสธคำสั่งซื้อ'
      });
      return { success: false, error: err.message, order: failedOrder };
    }
  }

  /**
   * Health metrics for dashboard
   */
  getEngineMetrics() {
    const avgLatency = this.latencyHistory.length > 0
      ? Math.round(this.latencyHistory.reduce((acc, curr) => acc + curr.latency, 0) / this.latencyHistory.length)
      : 0;

    return {
      isAutoTopupActive: true,
      queueLength: this.queue.length,
      averageLatencyMs: avgLatency,
      providersOnline: Object.keys(this.providers).length,
      successRate24h: 0
    };
  }
}

const engine = new TopupEngine();
module.exports = engine;
