import React from 'react';
import { Home, Gamepad2, ShoppingCart, MessageSquare, User, LogIn } from 'lucide-react';
import { triggerHaptic } from '../utils/native';

export default function MobileBottomNav({
  currentView,
  onNavigate,
  onOpenCart,
  cartCount = 0,
  onOpenChat,
  unreadChatCount = 0,
  user,
  onOpenAuth,
  onSelectGameSection
}) {
  const handleTab = (action) => {
    triggerHaptic();
    action();
  };

  return (
    <nav 
      aria-label="แถบเมนูด้านล่างสำหรับมือถือ"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080a0f]/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => handleTab(() => onNavigate('home'))}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentView === 'home'
              ? 'text-red-500 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium font-['Kanit']">หน้าแรก</span>
        </button>

        {/* Tab 2: Games */}
        <button
          type="button"
          onClick={() => handleTab(() => {
            if (currentView !== 'home') {
              onNavigate('home');
              setTimeout(() => onSelectGameSection?.(), 100);
            } else {
              onSelectGameSection?.();
            }
          })}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium font-['Kanit']">เติมเกม</span>
        </button>

        {/* Tab 3: Cart */}
        <button
          type="button"
          onClick={() => handleTab(onOpenCart)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-200 transition-all relative active:scale-95"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium font-['Kanit']">ตะกร้า</span>
        </button>

        {/* Tab 4: Live Chat Support */}
        <button
          type="button"
          onClick={() => handleTab(onOpenChat)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-200 transition-all relative active:scale-95"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#080a0f]" />
            )}
          </div>
          <span className="text-[10px] font-medium font-['Kanit']">แชทสด</span>
        </button>

        {/* Tab 5: Account */}
        <button
          type="button"
          onClick={() => handleTab(() => {
            if (user) {
              onNavigate('profile');
            } else {
              onOpenAuth('login');
            }
          })}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentView === 'profile'
              ? 'text-red-500 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {user ? (
            <User className={`w-5 h-5 mb-0.5 ${currentView === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          ) : (
            <LogIn className="w-5 h-5 mb-0.5 text-amber-400" />
          )}
          <span className="text-[10px] font-medium font-['Kanit']">
            {user ? 'โปรไฟล์' : 'เข้าสู่ระบบ'}
          </span>
        </button>
      </div>
    </nav>
  );
}
