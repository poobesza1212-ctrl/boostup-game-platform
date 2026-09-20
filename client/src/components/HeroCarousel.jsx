import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Sparkles, Gift, ArrowRight } from 'lucide-react';

export default function HeroCarousel({ slides: customSlides, onSelectCategory, onOpenFlashSale }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultSlides = [
    {
      id: 1,
      badge: "⚡ ดีลพิเศษประจำวัน (DAILY FLASH SALE)",
      badgeColor: "bg-red-600 text-white",
      title: "FLASH SALE ดีลเดือดลดสูงสุด 30%",
      subtitle: "เติม ROV, Free Fire, Valorant, Genshin คูปองและเพชรเข้าเกมทันที 24 ชม. ไม่ต้องรอนาน",
      ctaText: "ช้อปดีล Flash Sale",
      ctaTarget: "flash-sale-section",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      accentGradient: "from-red-950 via-zinc-900 to-black"
    },
    {
      id: 2,
      badge: "🪙 สิทธิพิเศษสำหรับสมาชิก (COINS REWARD)",
      badgeColor: "bg-amber-500 text-black font-black",
      title: "รับเหรียญ BOOSTUP COINS คูณ 2 เท่า!",
      subtitle: "ยิ่งเติม ยิ่งคุ้ม ทุกยอดการเติมเกมสะสมเหรียญแลกรับส่วนลดเงินสด หรือรับแพ็กเกจเกมฟรี",
      ctaText: "ดูเกมยอดนิยม",
      ctaTarget: "popular-games",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      accentGradient: "from-amber-950 via-zinc-900 to-black"
    },
    {
      id: 3,
      badge: "🎁 กิจกรรมพิเศษประจำเดือน (LUCKY DRAW)",
      badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      title: "เติมร้อย ลุ้นล้าน แจกใหญ่ทุกสัปดาห์",
      subtitle: "เติมเงินครบทุก 100 บาท รับสิทธิ์ลุ้นรับ Steam Deck, iPhone, บัตรของขวัญ และไอเท็มแรร์มูลค่ารวม 500,000 บาท",
      ctaText: "เติมเงินรับสิทธิ์ลุ้น",
      ctaTarget: "popular-games",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
      accentGradient: "from-purple-950 via-zinc-900 to-black"
    }
  ];

  const slides = (customSlides && customSlides.length > 0) ? customSlides : defaultSlides;

  // Auto-play slider every 5 seconds
  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-red-950/60 shadow-2xl group min-h-[340px] sm:min-h-[380px] flex items-center">
        
        {/* Slides rendering */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Art with Gradient Overlay */}
              <div className="absolute inset-0 overflow-hidden bg-black">
                <img
                  src={slide.image}
                  alt={slide.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover object-center opacity-40 scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentGradient} opacity-90`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-transparent to-transparent"></div>
              </div>

              {/* Slide Content */}
              <div className="relative max-w-2xl px-6 sm:px-12 py-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${slide.badgeColor}`}>
                    {slide.badge}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Kanit'] leading-[1.15]">
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-lg leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (typeof slide.ctaAction === 'function') {
                        slide.ctaAction();
                      } else if (slide.ctaTarget) {
                        const el = document.getElementById(slide.ctaTarget);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        const el = document.getElementById('popular-games');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="cyber-btn px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/40 flex items-center gap-2 transition-all"
                  >
                    <span>{slide.ctaText || 'ช้อปทันที'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {/* Prev / Next Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 border border-zinc-700 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 border border-zinc-700 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-red-600 shadow-md shadow-red-600/50'
                  : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
