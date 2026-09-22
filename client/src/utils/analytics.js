/**
 * BOOSTUP Marketing & Conversion Tracking Engine
 * Supports: Meta (Facebook) Pixel, TikTok Pixel, Google Analytics 4 (GA4) / GTM
 */

class MarketingTracker {
  constructor() {
    this.initialized = false;
    this.config = {
      facebookPixelId: '',
      facebookPixelEnabled: true,
      tiktokPixelId: '',
      tiktokPixelEnabled: true,
      googleAnalyticsId: '',
      googleAnalyticsEnabled: true,
      customHeadScript: ''
    };
  }

  /**
   * Initialize Pixels from siteSettings
   * @param {Object} marketingSettings 
   */
  init(marketingSettings = {}) {
    if (typeof window === 'undefined') return;

    this.config = {
      ...this.config,
      ...marketingSettings
    };

    // 1. Meta (Facebook) Pixel
    if (this.config.facebookPixelId && this.config.facebookPixelEnabled && !window.fbq) {
      try {
        /* eslint-disable */
        (function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)})(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */

        window.fbq('init', this.config.facebookPixelId.trim());
        window.fbq('track', 'PageView');
        console.log(`🎯 [Meta Pixel] Initialized: ${this.config.facebookPixelId}`);
      } catch (err) {
        console.warn('[Meta Pixel Init Error]:', err);
      }
    }

    // 2. TikTok Pixel
    if (this.config.tiktokPixelId && this.config.tiktokPixelEnabled && !window.ttq) {
      try {
        /* eslint-disable */
        (function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
          var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
          ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
          ttq.load(this.config.tiktokPixelId.trim());
          ttq.page();
        })(window, document, 'ttq');
        /* eslint-enable */
        console.log(`🎵 [TikTok Pixel] Initialized: ${this.config.tiktokPixelId}`);
      } catch (err) {
        console.warn('[TikTok Pixel Init Error]:', err);
      }
    }

    // 3. Google Analytics (GA4)
    if (this.config.googleAnalyticsId && this.config.googleAnalyticsEnabled && !window.gtag) {
      try {
        const gaId = this.config.googleAnalyticsId.trim();
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId);
        console.log(`📊 [Google Analytics] Initialized: ${gaId}`);
      } catch (err) {
        console.warn('[GA4 Init Error]:', err);
      }
    }

    // 4. Custom Head Script injection (if provided)
    if (this.config.customHeadScript && !document.getElementById('boostup-custom-marketing-script')) {
      try {
        const container = document.createElement('div');
        container.id = 'boostup-custom-marketing-script';
        container.innerHTML = this.config.customHeadScript;
        document.head.appendChild(container);
      } catch (err) {
        console.warn('[Custom Script Injection Error]:', err);
      }
    }

    this.initialized = true;
  }

  /**
   * Track Page View
   */
  trackPageView(pageTitle = 'Home') {
    if (typeof window === 'undefined') return;

    if (window.fbq && this.config.facebookPixelEnabled) {
      window.fbq('track', 'PageView');
    }
    if (window.ttq && this.config.tiktokPixelEnabled) {
      window.ttq.page();
    }
    if (window.gtag && this.config.googleAnalyticsEnabled) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href
      });
    }
  }

  /**
   * Track View Content (When customer views a game or package)
   */
  trackViewContent(product) {
    if (!product || typeof window === 'undefined') return;

    const payload = {
      content_name: product.name || product.gameName || 'Game Item',
      content_category: product.category || 'Game Topup',
      content_ids: [String(product.id || product.gameId)],
      content_type: 'product',
      value: Number(product.price || product.flashPrice || 0),
      currency: 'THB'
    };

    if (window.fbq && this.config.facebookPixelEnabled) {
      window.fbq('track', 'ViewContent', payload);
    }
    if (window.ttq && this.config.tiktokPixelEnabled) {
      window.ttq.track('ViewContent', {
        content_id: String(product.id || product.gameId),
        content_type: 'product',
        content_name: payload.content_name,
        value: payload.value,
        currency: 'THB'
      });
    }
    if (window.gtag && this.config.googleAnalyticsEnabled) {
      window.gtag('event', 'view_item', {
        currency: 'THB',
        value: payload.value,
        items: [{ item_id: payload.content_ids[0], item_name: payload.content_name }]
      });
    }
  }

  /**
   * Track Add To Cart
   */
  trackAddToCart(item) {
    if (!item || typeof window === 'undefined') return;

    const price = Number(item.price || item.finalPrice || 0);
    const payload = {
      content_name: `${item.gameName || 'Game'} - ${item.packageName || 'Package'}`,
      content_ids: [String(item.id || item.packageId)],
      content_type: 'product',
      value: price,
      currency: 'THB'
    };

    if (window.fbq && this.config.facebookPixelEnabled) {
      window.fbq('track', 'AddToCart', payload);
    }
    if (window.ttq && this.config.tiktokPixelEnabled) {
      window.ttq.track('AddToCart', {
        content_id: payload.content_ids[0],
        content_name: payload.content_name,
        value: price,
        currency: 'THB'
      });
    }
    if (window.gtag && this.config.googleAnalyticsEnabled) {
      window.gtag('event', 'add_to_cart', {
        currency: 'THB',
        value: price,
        items: [{ item_id: payload.content_ids[0], item_name: payload.content_name, price }]
      });
    }
  }

  /**
   * Track Initiate Checkout
   */
  trackInitiateCheckout(itemOrAmount, numItems = 1) {
    if (typeof window === 'undefined') return;

    const value = typeof itemOrAmount === 'number' 
      ? itemOrAmount 
      : Number(itemOrAmount?.finalAmount || itemOrAmount?.price || 0);

    const payload = {
      value,
      currency: 'THB',
      num_items: numItems
    };

    if (window.fbq && this.config.facebookPixelEnabled) {
      window.fbq('track', 'InitiateCheckout', payload);
    }
    if (window.ttq && this.config.tiktokPixelEnabled) {
      window.ttq.track('InitiateCheckout', {
        value,
        currency: 'THB'
      });
    }
    if (window.gtag && this.config.googleAnalyticsEnabled) {
      window.gtag('event', 'begin_checkout', {
        currency: 'THB',
        value
      });
    }
  }

  /**
   * Track Successful Purchase
   */
  trackPurchase(order) {
    if (!order || typeof window === 'undefined') return;

    const value = Number(order.finalAmount || order.originalAmount || 0);
    const orderId = String(order.orderNumber || order.id || `ORD_${Date.now()}`);

    const payload = {
      content_name: `${order.gameName || 'Game'} - ${order.packageName || 'Package'}`,
      content_type: 'product',
      value,
      currency: 'THB',
      order_id: orderId
    };

    if (window.fbq && this.config.facebookPixelEnabled) {
      window.fbq('track', 'Purchase', payload);
    }
    if (window.ttq && this.config.tiktokPixelEnabled) {
      window.ttq.track('CompletePayment', {
        content_id: orderId,
        content_name: payload.content_name,
        value,
        currency: 'THB'
      });
    }
    if (window.gtag && this.config.googleAnalyticsEnabled) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value,
        currency: 'THB',
        items: [{
          item_id: String(order.packageId || order.gameId),
          item_name: payload.content_name,
          price: value
        }]
      });
    }
    console.log(`💰 [Marketing Event] Purchase tracked: ${orderId} (฿${value})`);
  }
}

export const tracker = new MarketingTracker();
export default tracker;
