import React, { useState } from 'react';
import { CreditCard, Sparkles, Zap, Key, ShieldCheck } from 'lucide-react';

export default function GiftCardGrid({ giftCards = [], onSelectCard }) {
  const [selectedCard, setSelectedCard] = useState(null);

  if (!giftCards || giftCards.length === 0) return null;

  return (
    <section id="gift-cards-section" className="py-14 bg-[#080a0f] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Key className="w-4 h-4" />
              <span>INSTANT SERIAL CODE DELIVERY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Kanit']">
              บัตรเติมเกม <span className="text-zinc-500 font-light text-xl">({giftCards.length} รายการ)</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              จัดส่งรหัส Serial Code อัตโนมัติทันทีหลังชำระเงิน 24 ชม. ปลอดภัย รวดเร็ว
            </p>
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {giftCards.map((card) => {
            const minPrice = card.denominations && card.denominations.length > 0
              ? Math.min(...card.denominations.map(d => d.price))
              : 50;

            return (
              <div
                key={card.id}
                onClick={() => onSelectCard(card)}
                className="group relative flex flex-col bg-cyber-card rounded-2xl overflow-hidden border border-zinc-800 hover:border-blue-500/70 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Badge */}
                {card.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-md">
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Card Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={card.icon}
                    alt={card.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent"></div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">{card.publisher}</div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {card.name}
                    </h3>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {card.denominations?.length || 0} ขนาดราคาให้เลือก
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500">เริ่มต้น</span>
                      <div className="text-xs font-black text-blue-400 font-['Kanit']">
                        ฿{minPrice}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-zinc-800 group-hover:bg-blue-600 px-2.5 py-1 rounded-lg transition-colors">
                      เลือกราคา
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
