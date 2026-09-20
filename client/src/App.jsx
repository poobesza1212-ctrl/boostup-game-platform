import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import QuickCategoryBar from './components/QuickCategoryBar';
import FlashSaleSection from './components/FlashSaleSection';
import GameGrid from './components/GameGrid';
import GiftCardGrid from './components/GiftCardGrid';
import AppSubscriptionGrid from './components/AppSubscriptionGrid';
import StepGuide from './components/StepGuide';
import FeaturesGrid from './components/FeaturesGrid';
import TrustSection from './components/TrustSection';
import FloatingSupport from './components/FloatingSupport';
import Footer from './components/Footer';
import TopupModal from './components/TopupModal';
import OrderStatusModal from './components/OrderStatusModal';
import AuthModal from './components/AuthModal';
import WalletModal from './components/WalletModal';
import AdminPortal from './pages/admin/AdminPortal';

export default function App() {
  // Detect current URL route (/admin vs /)
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        return 'admin';
      }
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    const targetPath = view === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [games, setGames] = useState([]);
  const [slides, setSlides] = useState([]);
  const [quickCategories, setQuickCategories] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [appSubscriptions, setAppSubscriptions] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [user, setUser] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState(null);
  const [activeOrderForStatus, setActiveOrderForStatus] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Load all data from Backend APIs
  const fetchData = async () => {
    try {
      const [gamesRes, flashRes, cardsRes, appsRes, settingsRes, slidesRes, catsRes] = await Promise.all([
        fetch('/api/games').then(r => r.json()),
        fetch('/api/flash-sales').then(r => r.json()).catch(() => ({ flashSales: [] })),
        fetch('/api/gift-cards').then(r => r.json()).catch(() => ({ giftCards: [] })),
        fetch('/api/app-subscriptions').then(r => r.json()).catch(() => ({ appSubscriptions: [] })),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/slides').then(r => r.json()).catch(() => ({ slides: [] })),
        fetch('/api/quick-categories').then(r => r.json()).catch(() => ({ categories: [] }))
      ]);

      if (gamesRes.success) setGames(gamesRes.games);
      if (flashRes.success) setFlashSales(flashRes.flashSales);
      if (cardsRes.success) setGiftCards(cardsRes.giftCards);
      if (appsRes.success) setAppSubscriptions(appsRes.appSubscriptions);
      if (settingsRes.success) setSiteSettings(settingsRes.settings);
      if (slidesRes.success) setSlides(slidesRes.slides);
      if (catsRes.success) setQuickCategories(catsRes.categories);
    } catch (err) {
      console.error("Initial data load error:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // Check localStorage for saved user session
    const savedUser = localStorage.getItem('tw_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('tw_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('tw_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tw_user');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModal({ open: true, mode });
  };

  const handleDepositSuccess = (newBalance) => {
    setUser(prev => prev ? { ...prev, walletBalance: newBalance } : null);
  };

  // Submit Order from TopupModal
  const handleSubmitOrder = async (orderPayload) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        setSelectedProductForCheckout(null);
        setActiveOrderForStatus(data.order);
        
        // If paid with wallet, update local wallet state
        if (orderPayload.paymentMethod === 'wallet' && user) {
          const deduction = data.order.finalAmount || 0;
          setUser(prev => ({
            ...prev,
            walletBalance: Math.max(0, (prev?.walletBalance || 0) - deduction)
          }));
        }
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  // Render Dedicated Admin Portal if currentView === 'admin'
  if (currentView === 'admin') {
    return <AdminPortal onBackToStore={() => navigateTo('home')} />;
  }

  // Render Richman Shop Style Storefront
  return (
    <div id="root" className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenWallet={() => setWalletModalOpen(true)}
        siteSettings={siteSettings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        games={games}
        onSelectGame={(game) => setSelectedProductForCheckout(game)}
      />

      {/* 1. Promotional Carousel Hero Slider (Richman Shop Style) */}
      <HeroCarousel slides={slides} />

      {/* 2. Quick Category Service Bar (6 Quick Service Buttons) */}
      <QuickCategoryBar categories={quickCategories} />

      {/* 3. Flash Sale Section with Live Countdown Timer & Stock Progress Bar */}
      <FlashSaleSection
        flashSales={flashSales}
        onSelectFlashSale={(item) => setSelectedProductForCheckout(item)}
      />

      {/* 4. Popular Games Catalog Grid */}
      <GameGrid
        games={games}
        onSelectGame={(game) => setSelectedProductForCheckout(game)}
        searchQuery={searchQuery}
      />

      {/* 5. Gift Cards & Game Vouchers (Steam, Razer Gold, Roblox, Riot Cards) */}
      <GiftCardGrid
        giftCards={giftCards}
        onSelectCard={(card) => setSelectedProductForCheckout(card)}
      />

      {/* 6. App Subscriptions (Discord Nitro, YouTube Premium, Netflix, Spotify) */}
      <AppSubscriptionGrid
        appSubscriptions={appSubscriptions}
        onSelectApp={(app) => setSelectedProductForCheckout(app)}
      />

      {/* 7. 4-Step How-to-Topup Guide */}
      <StepGuide />

      {/* 8. 8 Feature Highlights */}
      <FeaturesGrid />

      {/* 9. Trust & Company Credentials */}
      <TrustSection siteSettings={siteSettings} />

      {/* 10. Footer */}
      <Footer
        siteSettings={siteSettings}
      />

      {/* Floating LINE Support Widget */}
      <FloatingSupport contactLine={siteSettings?.contactLine || '@boostup'} />

      {/* Interactive Purchase Modal (Handles Games, Flash Deals, Gift Cards & App Subs) */}
      {selectedProductForCheckout && (
        <TopupModal
          game={selectedProductForCheckout}
          onClose={() => setSelectedProductForCheckout(null)}
          onSubmitOrder={handleSubmitOrder}
          user={user}
          onOpenWallet={() => {
            setSelectedProductForCheckout(null);
            setWalletModalOpen(true);
          }}
        />
      )}

      {/* Live Order Status Progress Modal */}
      {activeOrderForStatus && (
        <OrderStatusModal
          order={activeOrderForStatus}
          onClose={() => setActiveOrderForStatus(null)}
          onRefreshOrder={() => {}}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Wallet Deposit Modal */}
      {walletModalOpen && (
        <WalletModal
          user={user}
          siteSettings={siteSettings}
          onClose={() => setWalletModalOpen(false)}
          onDepositSuccess={handleDepositSuccess}
        />
      )}

    </div>
  );
}
