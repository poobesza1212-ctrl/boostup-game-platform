import React, { useState, useEffect } from 'react';
import { Zap, Flame, Clock, ChevronRight } from 'lucide-react';

export default function FlashSaleSection({ flashSales = [], onSelectFlashSale }) {
  // Real-time countdown timer: 4 hours 32 mins 15 secs
  const [timeLeft, setTimeLeft] = useState(4 * 3600 + 32 * 60 + 15);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const format2 = (num) => String(num).padStart(2, '0');

  if (!flashSales || flashSales.length === 0) return null;

  return (
    <section id="flash-sale-section" className="py-12 bg-gradient-to-b from-[#0a0d14] via-[#10141f] to-[#080a0f] border-y border-red-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Flash Sale Header with Live Countdown Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-['Kanit']">
                  FLASH SALE ดีลฟ้าผ่า
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                  จำกัดเวลา
                </span>
              </div>
              <p className="text-xs text-zinc-400">แพ็กเกจเกมยอดนิยมราคาพิเศษ เติมไวอัตโนมัติ</p>
            </div>
          </div>

          {/* Digital Countdown Timer matching Richman Shop */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>สิ้นสุดใน:</span>
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-xs">
              <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 shadow-inner">
                {format2(hours)}
              </span>
              <span className="text-zinc-500 font-bold">:</span>
              <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 shadow-inner">
                {format2(minutes)}
              </span>
              <span className="text-zinc-500 font-bold">:</span>
              <span className="px-2 py-1 rounded-lg bg-red-950 border border-red-700 text-red-400 shadow-inner animate-pulse">
                {format2(seconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Flash Sale Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {flashSales.map((item) => {
            const soldPercent = Math.round((item.soldStock / item.totalStock) * 100);
            const remaining = item.totalStock - item.soldStock;

            return (
              <div
                key={item.id}
                onClick={() => onSelectFlashSale(item)}
                className="group relative flex flex-col bg-[#121622] rounded-2xl overflow-hidden border border-red-950 hover:border-red-600/80 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-600/10"
              >
                {/* Discount Ribbon */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md">
                    -{item.discountPercent}%
                  </span>
                </div>

                {/* Game / Package Thumbnail */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                  <img
                    src={item.icon}
                    alt={item.gameName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-transparent"></div>
                </div>

                {/* Card Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <div className="text-[10px] text-zinc-400 truncate">{item.gameName}</div>
                    <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {item.packageName}
                    </h3>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 font-medium">ขายแล้ว {soldPercent}%</span>
                      <span className="text-amber-400 font-bold">เหลือ {remaining} สิทธิ์</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-500"
                        style={{ width: `${soldPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-red-400 font-['Kanit'] leading-tight">
                        ฿{item.flashPrice}
                      </div>
                      <div className="text-[10px] text-zinc-500 line-through leading-tight">
                        ฿{item.originalPrice}
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 group-hover:shadow-red-600/30">
                      เติมทันที
                    </button>
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
