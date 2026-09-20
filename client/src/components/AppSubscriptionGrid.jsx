import React from 'react';
import { Film, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export default function AppSubscriptionGrid({ appSubscriptions = [], onSelectApp }) {
  if (!appSubscriptions || appSubscriptions.length === 0) return null;

  return (
    <section id="apps-section" className="py-14 bg-[#0a0d14] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Film className="w-4 h-4" />
              <span>STREAMING & ENTERTAINMENT APPS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Kanit']">
              ต่ออายุสมาชิกแอปพลิเคชัน <span className="text-zinc-500 font-light text-xl">({appSubscriptions.length} แอป)</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              แพ็กเกจพรีเมียมราคาประหยัด ดูหนัง ฟังเพลง เล่นเกม ไร้โฆษณาคั่น
            </p>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {appSubscriptions.map((app) => {
            const minPrice = app.plans && app.plans.length > 0
              ? Math.min(...app.plans.map(p => p.price))
              : 89;

            return (
              <div
                key={app.id}
                onClick={() => onSelectApp(app)}
                className="group relative flex flex-col bg-cyber-card rounded-2xl overflow-hidden border border-zinc-800 hover:border-purple-500/70 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-500/10"
              >
                {/* Badge */}
                {app.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-md shadow-md">
                      {app.badge}
                    </span>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={app.icon}
                    alt={app.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent"></div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">{app.publisher}</div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                      {app.name}
                    </h3>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {app.plans?.length || 0} ตัวเลือกแพ็กเกจ
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500">เริ่มต้น</span>
                      <div className="text-xs font-black text-purple-400 font-['Kanit']">
                        ฿{minPrice}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-zinc-800 group-hover:bg-purple-600 px-2.5 py-1 rounded-lg transition-colors">
                      เลือกแพ็กเกจ
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
