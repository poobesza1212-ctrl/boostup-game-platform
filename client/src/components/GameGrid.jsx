import React, { useState } from 'react';
import { Sparkles, Flame, ChevronRight, Zap } from 'lucide-react';

export default function GameGrid({ games, onSelectGame, searchQuery }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'popular', label: '🔥 ยอดนิยม' },
    { id: 'MOBA', label: 'MOBA' },
    { id: 'Battle Royale', label: 'Battle Royale' },
    { id: 'Tactical FPS', label: 'FPS / Shooter' },
    { id: 'Action RPG', label: 'RPG / Open World' }
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = !searchQuery || 
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.publisher.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'popular') return game.isPopular;
    return game.category === activeCategory;
  });

  return (
    <section id="popular-games" className="py-14 bg-[#080a0f] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>OFFICIAL GAME CATALOG</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              เกมยอดนิยม <span className="text-zinc-500 font-light text-xl">({filteredGames.length} รายการ)</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">เลือกเกมที่ต้องการเติมเงิน ระบบเชื่อมต่อ API เติมเข้าทันทีอัตโนมัติ</p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid Showcase */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">ไม่พบเกมที่ตรงกับการค้นหา "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredGames.map((game) => {
              const minPrice = game.packages && game.packages.length > 0
                ? Math.min(...game.packages.map(p => p.price))
                : 35;

              return (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className="group relative flex flex-col bg-cyber-card rounded-2xl overflow-hidden glow-border cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
                >
                  {/* Top Badge */}
                  {game.badge && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600/90 text-white backdrop-blur-md shadow-md">
                        {game.badge}
                      </span>
                    </div>
                  )}

                  {/* Game Art Thumbnail */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                    <img 
                      src={game.icon} 
                      alt={game.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                    
                    {/* Hover Quick Overlay Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                      <span className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-lg flex items-center gap-1">
                        เติมเงิน <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-medium">{game.publisher}</div>
                      <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {game.name}
                      </h3>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {game.currencyName}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500">เริ่มต้น</span>
                        <div className="text-xs font-extrabold text-red-400 font-['Kanit']">
                          ฿{minPrice}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                        <Zap className="w-3 h-3" /> ออโต้
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
