import React from 'react';
import { 
  Home, 
  Tag, 
  Gamepad2, 
  CreditCard, 
  Ticket, 
  Crown, 
  Smartphone, 
  Clock, 
  Gift, 
  Coins, 
  ChevronRight, 
  X,
  Menu,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User
} from 'lucide-react';

export default function LeftSidebar({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
  user,
  onOpenWallet,
  onOpenWheel,
  onOpenAffiliate,
  onOpenCoupons,
  siteSettings
}) {
  const handleNavClick = (view, scrollId = null) => {
    setCurrentView(view);
    // Only close drawer on mobile screen widths (< 1024px); keep pinned on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
    if (scrollId) {
      setTimeout(() => {
        const el = document.getElementById(scrollId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleActionClick = (actionFn) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
    if (actionFn) actionFn();
  };

  return (
    <>
      {/* Backdrop for Mobile Only (Hidden on Desktop) */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Left Sidebar: Permanently Pinned on Desktop (ขึ้นค้างเลย), Slide-over on Mobile */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 xl:w-72 bg-[#10131c] text-white border-r border-[#202738] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 1. Header with Brand Logo & Hamburger Button */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#202738] bg-[#0c0f17]">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src={siteSettings?.logoUrl || '/boostup_logo.jpg'}
              alt={siteSettings?.siteName || 'BOOSTUP'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/boostup_logo.jpg';
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain border border-red-500/50 group-hover:scale-105 transition-transform shadow-md"
            />
            <div className="leading-tight">
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black tracking-wider text-white font-['Kanit']">
                  BOOST
                </span>
                <span className="text-base sm:text-lg font-black tracking-wider text-red-500 font-['Kanit']">
                  UP
                </span>
              </div>
              <p className="text-[9px] text-zinc-400 font-medium font-['Prompt']">
                ร้านเติมเงินเกม 24 ชม.
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-[#181d2a] hover:bg-red-950/60 text-zinc-300 hover:text-white border border-[#262f44] hover:border-red-600 transition-all cursor-pointer shadow-inner lg:hidden"
            title="ปิดเมนู"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Desktop Hamburger Icon Box matching Image 2 [ ≡ ] */}
          <div className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-[#181d2a] text-zinc-300 border border-[#262f44] shadow-inner" title="เมนูหลัก">
            <Menu className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 custom-scrollbar">
          
          {/* 2. Coins & Points Card (Richman Shop Style) */}
          <div 
            onClick={() => handleActionClick(onOpenWheel)}
            className="p-3 rounded-2xl bg-[#181d2a] hover:bg-[#1f2536] border border-[#2a344d] hover:border-amber-500/60 transition-all cursor-pointer shadow-md group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-amber-950/80 flex items-center justify-center border border-amber-300/40">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-black text-amber-300 font-['Kanit'] leading-tight">
                  {user?.points || 0}
                </div>
                <div className="text-[11px] text-zinc-400 font-medium">คอยน์สะสม</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-amber-300 transition-colors">
              <span className="text-[10px] font-semibold hidden sm:inline">แลกรางวัล</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 3. Green VIP Banner (Richman Premium Style) */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenAffiliate)}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer font-['Kanit']"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <div className="text-left text-xs leading-none">
              <div className="font-black tracking-wide text-white drop-shadow">BOOSTUP VIP Premium</div>
              <div className="text-[10px] font-medium text-emerald-100 mt-0.5">เชื่อมบัญชี & รับค่าคอม 2%</div>
            </div>
          </button>

          {/* 4. Redeem Rewards / Wheel Button */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenWheel)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-200 hover:text-amber-300 hover:bg-[#181d2a] transition-colors cursor-pointer group text-left"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold font-['Kanit']">แลกของรางวัล & วงล้อเสี่ยงโชค</span>
          </button>

          {/* Divider */}
          <hr className="border-[#202738]" />

          {/* 5. Navigation Menu List */}
          <nav className="space-y-1 text-xs font-medium font-['Kanit']">
            
            {/* หน้าแรก */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                currentView === 'home'
                  ? 'bg-red-950/60 text-white font-bold border border-red-800/60 shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-[#181d2a]'
              }`}
            >
              <Home className={`w-4 h-4 ${currentView === 'home' ? 'text-red-400' : 'text-zinc-400'}`} />
              <span>หน้าแรก</span>
            </button>

            {/* คูปองของฉัน */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCoupons) handleActionClick(onOpenCoupons);
                else handleNavClick('home', 'popular-games');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#181d2a] transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
                <span>คูปองของฉัน</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-900">
                PROMO
              </span>
            </button>

            {/* เติมเกม */}
            <button
              type="button"
              onClick={() => handleNavClick('home', 'popular-games')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#181d2a] transition-all text-left cursor-pointer group"
            >
              <Gamepad2 className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
              <span>เติมเกม</span>
            </button>

            {/* บัตรกำนัล / บัตรเติมเกม */}
            <button
              type="button"
              onClick={() => handleNavClick('home', 'gift-cards-section')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#181d2a] transition-all text-left cursor-pointer group"
            >
              <CreditCard className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
              <span>บัตรกำนัล / บัตรเติมเกม</span>
            </button>

            {/* บัตร Gift Voucher */}
            <button
              type="button"
              onClick={() => handleNavClick('home', 'gift-cards-section')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#181d2a] transition-all text-left cursor-pointer group"
            >
              <Ticket className="w-4 h-4 text-zinc-400 group-hover:text-purple-400 transition-colors" />
              <span>บัตร Gift Voucher</span>
            </button>

            {/* ต่ออายุสมาชิกแอพ */}
            <button
              type="button"
              onClick={() => handleNavClick('home', 'apps-section')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#181d2a] transition-all text-left cursor-pointer group"
            >
              <Crown className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
              <span>ต่ออายุสมาชิกแอพ</span>
            </button>

            {/* เติมเงินมือถือ (NEW) */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                alert('ระบบเติมเงินมือถืออัตโนมัติ (AIS, TRUE, DTAC) กำลังเตรียมเปิดให้บริการในเร็วๆ นี้ครับ!');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#181d2a] transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                <span>เติมเงินมือถือ</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/40">
                NEW
              </span>
            </button>

            {/* ประวัติการสั่งซื้อ (Order History View) */}
            <button
              type="button"
              onClick={() => handleNavClick('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                currentView === 'orders'
                  ? 'bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/40 shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-[#181d2a]'
              }`}
            >
              <Clock className={`w-4 h-4 ${currentView === 'orders' ? 'text-yellow-400' : 'text-zinc-400'}`} />
              <span>ประวัติการสั่งซื้อ</span>
            </button>

          </nav>

        </div>

        {/* 6. Footer inside Sidebar */}
        <div className="p-4 border-t border-[#202738] bg-[#0c0f17] text-left">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {(user.name || user.username || 'U')[0].toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{user.name || user.username}</div>
                  <div className="text-[10px] text-zinc-400 truncate">@{user.username}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleActionClick(onOpenWallet)}
                className="px-2 py-1 rounded-lg bg-[#181d2a] hover:bg-emerald-950/60 text-emerald-400 text-xs font-bold border border-[#262f44] shrink-0"
              >
                ฿{(Number(user.walletBalance) || 0).toFixed(2)}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[10px] text-zinc-400">© 2026 BOOSTUP ร้านเติมเงินเกม 24 ชม.</p>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
