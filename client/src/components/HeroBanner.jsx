import React from 'react';
import { Search, ShieldCheck, Zap, Tag, Award, Flame } from 'lucide-react';

export default function HeroBanner({ searchQuery, setSearchQuery, onSelectGame, games }) {
  const filteredQuickGames = searchQuery.trim() 
    ? games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <section className="relative overflow-hidden pt-10 pb-16 bg-radial-glow">
      {/* Background Cyber Ambient Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-red-950/20 blur-[90px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold tracking-wide">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
              <span>ระบบเสถียร อัตโนมัติ ปลอดภัย 100% เชื่อมต่อตรงหลาย API</span>
            </div>

            {/* Main Headline from Poster */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-['Kanit'] leading-[1.15]">
              เติมเกมสุดคุ้ม <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-300">
                รวดเร็ว ปลอดภัย 100%
              </span>
            </h1>

            {/* Subtitle from Poster */}
            <p className="text-zinc-300 text-base sm:text-lg max-w-xl font-light">
              เติมง่าย ได้ทันที ไม่ต้องรอนาน ระบบเติมเงินอัตโนมัติตลอด 24 ชม. ราคาคุ้มค่าที่สุดในไทย รองรับทุกช่องทางการชำระเงิน
            </p>

            {/* Search Input Box with Search Button */}
            <div className="relative max-w-xl mx-auto lg:mx-0">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาเกมที่ต้องการเติม... เช่น ROV, Free Fire, Valorant"
                  className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all shadow-inner"
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('popular-games');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="absolute right-2 px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all"
                >
                  ค้นหา
                </button>
              </div>

              {/* Instant Search Dropdown Results */}
              {searchQuery.trim() && filteredQuickGames.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#121622] border border-red-900/60 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-zinc-800">
                  {filteredQuickGames.map(game => (
                    <div
                      key={game.id}
                      onClick={() => {
                        onSelectGame(game);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-red-950/40 cursor-pointer transition-colors"
                    >
                      <img src={game.icon} alt={game.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-white">{game.name}</div>
                        <div className="text-xs text-zinc-400">{game.publisher} • {game.category}</div>
                      </div>
                      <span className="text-xs font-semibold text-red-400 bg-red-950 px-2 py-1 rounded border border-red-900/50">
                        เติมเงิน
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4 Trust Badges from the Poster */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-xs font-medium text-zinc-300">ปลอดภัย 100%</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-zinc-300">เติมไว 24 ชม.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <Tag className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-zinc-300">ราคาคุ้มค่า</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <Award className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-xs font-medium text-zinc-300">บริการดีที่สุด</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Banner (Esports Gaming Character Graphic) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Glow Ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-900 opacity-40 blur-xl animate-pulse"></div>
              
              <div className="relative rounded-2xl overflow-hidden border-2 border-red-700/50 bg-gradient-to-b from-[#181d2a] to-[#0d1017] shadow-2xl">
                <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden group">
                  <img 
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" 
                    alt="Gaming Hero" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-transparent"></div>
                  
                  {/* Floating Live Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-red-500/60 text-xs font-bold text-white backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>ระบบเปิดให้บริการปกติ 24/7</span>
                  </div>

                  {/* Bottom Hero Overlay Information */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-red-900/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Topup Platform</div>
                        <div className="text-sm font-bold text-white">รองรับมากกว่า 50+ เกมชั้นนำ</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-400">อัตราความสำเร็จ</div>
                        <div className="text-sm font-black text-emerald-400">99.4% สำเร็จทันที</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
