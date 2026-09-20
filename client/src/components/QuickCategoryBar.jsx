import React from 'react';
import { Gamepad2, CreditCard, Zap, Film, Smartphone, Coins } from 'lucide-react';

const iconMap = {
  Gamepad2: (color) => <Gamepad2 className={`w-6 h-6 ${color || 'text-red-500'}`} />,
  CreditCard: (color) => <CreditCard className={`w-6 h-6 ${color || 'text-blue-400'}`} />,
  Zap: (color) => <Zap className={`w-6 h-6 ${color || 'text-amber-400'}`} />,
  Film: (color) => <Film className={`w-6 h-6 ${color || 'text-purple-400'}`} />,
  Smartphone: (color) => <Smartphone className={`w-6 h-6 ${color || 'text-emerald-400'}`} />,
  Coins: (color) => <Coins className={`w-6 h-6 ${color || 'text-amber-500'}`} />
};

export default function QuickCategoryBar({ categories: customCategories, onSelectCategory }) {
  const defaultCategories = [
    {
      id: 'games',
      label: 'เติมเกมออนไลน์',
      sublabel: 'UID ออโต้ 24 ชม.',
      iconName: 'Gamepad2',
      iconColor: 'text-red-500',
      targetId: 'popular-games',
      color: 'hover:border-red-500/60'
    },
    {
      id: 'cards',
      label: 'บัตรเติมเงิน',
      sublabel: 'Steam, Razer, Roblox',
      iconName: 'CreditCard',
      iconColor: 'text-blue-400',
      targetId: 'gift-cards-section',
      color: 'hover:border-blue-500/60'
    },
    {
      id: 'flash',
      label: 'Flash Sale',
      sublabel: 'ดีลฟ้าผ่า ลดสูงสุด 30%',
      iconName: 'Zap',
      iconColor: 'text-amber-400',
      targetId: 'flash-sale-section',
      badge: 'HOT 🔥',
      badgeColor: 'bg-red-600 text-white',
      color: 'hover:border-amber-500/60'
    },
    {
      id: 'apps',
      label: 'ต่ออายุสมาชิกแอป',
      sublabel: 'YouTube, Netflix, Discord',
      iconName: 'Film',
      iconColor: 'text-purple-400',
      targetId: 'apps-section',
      color: 'hover:border-purple-500/60'
    },
    {
      id: 'mobile',
      label: 'เติมเงินมือถือ',
      sublabel: 'AIS, True, Dtac',
      iconName: 'Smartphone',
      iconColor: 'text-emerald-400',
      targetId: 'popular-games',
      color: 'hover:border-emerald-500/60'
    },
    {
      id: 'coins',
      label: 'Boost Coins',
      sublabel: 'สะสมเหรียญแลกส่วนลด',
      iconName: 'Coins',
      iconColor: 'text-amber-500',
      targetId: 'popular-games',
      badge: '2X COINS',
      badgeColor: 'bg-amber-500 text-black',
      color: 'hover:border-amber-500/60'
    }
  ];

  const categories = customCategories && customCategories.length > 0 ? customCategories : defaultCategories;

  const handleScrollTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderIcon = (cat) => {
    if (React.isValidElement(cat.icon)) return cat.icon;
    const name = cat.iconName || 'Gamepad2';
    const renderer = iconMap[name] || iconMap.Gamepad2;
    return renderer(cat.iconColor);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleScrollTo(cat.targetId || 'popular-games')}
            className={`group relative p-3.5 rounded-2xl bg-cyber-card border border-zinc-800/80 ${cat.color || 'hover:border-red-500/60'} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            {cat.badge && (
              <span className={`absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-md ${cat.badgeColor || 'bg-red-600 text-white'}`}>
                {cat.badge}
              </span>
            )}
            
            <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              {renderIcon(cat)}
            </div>

            <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
              {cat.label}
            </div>
            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
              {cat.sublabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
