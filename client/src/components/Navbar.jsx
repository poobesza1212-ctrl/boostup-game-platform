import React, { useState } from 'react';
import { 
  Search,
  Wallet, 
  Coins,
  ShieldCheck, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Sparkles, 
  Menu, 
  X,
  CreditCard,
  Gift,
  Zap,
  Film,
  ShoppingCart,
  RotateCw,
  Share2
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenWallet,
  cartCount = 0,
  onOpenCart,
  onOpenWheel,
  onOpenAffiliate,
  siteSettings,
  searchQuery,
  setSearchQuery,
  games = [],
  onSelectGame
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredQuickGames = searchQuery?.trim() 
    ? games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleNavClick = (targetId) => {
    setCurrentView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-950/40 bg-[#080a0f]/95 backdrop-blur-md">
      
      {/* Top Announcement & Support Bar */}
      <div className="bg-[#0e121a] text-xs py-1.5 px-4 text-zinc-300 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-medium text-zinc-200">
            {siteSettings?.announcement || "🔥 ยินดีต้อนรับสู่ BOOSTUP ร้านเติมเงินเกม! เติมไว ปลอดภัย 100% ระบบอัตโนมัติ 24 ชม."}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-400">
          <span>LINE: <strong className="text-white">{siteSettings?.contactLine || '@boostup'}</strong></span>
          <span>Facebook: <strong className="text-white">{siteSettings?.contactFacebook || 'BoostUpGameStore'}</strong></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo - BOOSTUP ร้านเติมเงินเกม */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <img
              src={siteSettings?.logoUrl || '/boostup_logo.jpg'}
              alt={siteSettings?.siteName || 'BOOSTUP'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/boostup_logo.jpg';
              }}
              className="w-12 h-12 rounded-xl object-contain border border-red-500/40 glow-red-sm group-hover:scale-105 transition-all shadow-md shadow-red-950/40"
            />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-wider text-white font-['Kanit'] group-hover:text-red-100 transition-colors">
                  BOOST
                </span>
                <span className="text-2xl font-black tracking-wider text-red-500 font-['Kanit'] group-hover:text-red-400 transition-colors">
                  UP
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider font-semibold font-['Prompt']">
                ร้านเติมเงินเกม • PLAY MORE GO FURTHER
              </p>
            </div>
          </div>

          {/* Global Search Bar (Richman Shop Style) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                placeholder="ค้นหาเกม หรือ บัตรเติมเงิน... เช่น ROV, Valorant, Steam"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Instant Search Dropdown */}
            {searchFocused && searchQuery?.trim() && filteredQuickGames.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#121622] border border-red-900/60 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-800">
                {filteredQuickGames.map(game => (
                  <div
                    key={game.id}
                    onClick={() => {
                      onSelectGame(game);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-red-950/40 cursor-pointer transition-colors"
                  >
                    <img src={game.icon} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold text-white">{game.name}</div>
                      <div className="text-[10px] text-zinc-400">{game.publisher}</div>
                    </div>
                    <span className="text-[10px] text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900 font-semibold">
                      เติมเงิน
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5">
            <button 
              onClick={() => handleNavClick('root')}
              className={`text-xs font-semibold transition-colors hover:text-red-400 ${currentView === 'home' ? 'text-red-500' : 'text-zinc-300'}`}
            >
              หน้าแรก
            </button>
            <button 
              onClick={() => handleNavClick('popular-games')}
              className="text-xs font-semibold text-zinc-300 hover:text-red-400 transition-colors"
            >
              เติมเกม
            </button>
            <button 
              onClick={() => handleNavClick('flash-sale-section')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> Flash Sale
            </button>
            <button 
              onClick={() => handleNavClick('gift-cards-section')}
              className="text-xs font-semibold text-zinc-300 hover:text-red-400 transition-colors"
            >
              บัตรเติมเกม
            </button>
            <button 
              onClick={() => handleNavClick('apps-section')}
              className="text-xs font-semibold text-zinc-300 hover:text-red-400 transition-colors"
            >
              ต่ออายุแอป
            </button>
          </nav>

          {/* Quick Actions (Wheel, Affiliate, Cart) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenWheel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/70 to-red-950/70 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="วงล้อเสี่ยงโชค & เช็คชื่อรายวัน"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline font-['Kanit']">วงล้อ & เช็คชื่อ</span>
            </button>

            <button
              type="button"
              onClick={onOpenAffiliate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="ระบบแนะนำเพื่อนรับค่าคอมมิชชั่น 2%"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline font-['Kanit']">ชวนเพื่อน 2%</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer"
              title="ตะกร้าสินค้า"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* User Section (Coins, Wallet & Profile) */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                
                {/* Boost Coins Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/60 rounded-lg px-2.5 py-1 text-amber-300 text-xs font-bold font-['Kanit']">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.points || 240} Coins</span>
                </div>

                {/* User Wallet Balance */}
                <button
                  onClick={onOpenWallet}
                  className="flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-black hover:from-red-950 hover:to-black border border-red-900/60 rounded-lg px-3 py-1.5 transition-all text-left"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[9px] text-zinc-400 leading-tight">กระเป๋าเงิน</div>
                    <div className="text-xs font-bold text-white font-['Kanit'] leading-tight">
                      ฿{(user.walletBalance || 0).toFixed(2)}
                    </div>
                  </div>
                </button>

                {/* Logout Button */}
                <button 
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>

              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="cyber-btn px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md shadow-red-600/30 transition-all"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเกม หรือ บัตรเติมเงิน..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c0f17] border-b border-red-900/40 px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col space-y-2 text-xs">
            <button 
              onClick={() => handleNavClick('root')}
              className="text-left py-2 text-zinc-200 hover:text-red-400 font-semibold"
            >
              หน้าแรก
            </button>
            <button 
              onClick={() => handleNavClick('popular-games')}
              className="text-left py-2 text-zinc-200 hover:text-red-400 font-semibold"
            >
              เติมเกมออนไลน์
            </button>
            <button 
              onClick={() => handleNavClick('flash-sale-section')}
              className="text-left py-2 text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Flash Sale ดีลฟ้าผ่า
            </button>
            <button 
              onClick={() => handleNavClick('gift-cards-section')}
              className="text-left py-2 text-zinc-200 hover:text-red-400 font-semibold"
            >
              บัตรเติมเกม & บัตรกำนัล
            </button>
            <button 
              onClick={() => handleNavClick('apps-section')}
              className="text-left py-2 text-zinc-200 hover:text-red-400 font-semibold"
            >
              ต่ออายุสมาชิกแอป
            </button>
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenWheel(); }}
                className="text-left py-2 text-amber-300 font-bold flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span>วงล้อเสี่ยงโชค & เช็คชื่อรายวัน</span>
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenAffiliate(); }}
                className="text-left py-2 text-purple-300 font-bold flex items-center gap-2"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>แนะนำเพื่อนรับค่าคอมมิชชั่น 2%</span>
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenCart(); }}
                className="text-left py-2 text-white font-bold flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>ตะกร้าสินค้า ({cartCount} รายการ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
