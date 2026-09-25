import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

export default function HeroCarousel({ slides: customSlides, onSelectCategory, onOpenFlashSale }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const defaultSlides = [
    {
      id: 'slide_fast_safe',
      badge: '⚡ เติมไว ปลอดภัย 24 ชม.',
      badgeColor: 'bg-red-600 text-white',
      title: 'เติมเกมไว ปลอดภัย 24 ชม.',
      subtitle: 'ระบบอัตโนมัติ เติมไว ไม่ต้องใช้รหัสผ่าน',
      ctaText: 'เติมเกมทันที',
      ctaTarget: 'popular-games',
      image: '/banners/banner_fast_safe.png',
      isPureGraphic: true
    },
    {
      id: 'slide_flash_sale',
      badge: '🔥 FLASH SALE เติมคุ้มกว่าเดิม',
      badgeColor: 'bg-amber-500 text-black font-black',
      title: 'Flash Sale เติมคุ้มกว่าเดิม',
      subtitle: 'โปรโมชั่นส่วนลดพิเศษ คุ้มค่าทุกการเติม',
      ctaText: 'ดู Flash Sale',
      ctaTarget: 'popular-games',
      image: '/banners/banner_flash_sale.png',
      isPureGraphic: true
    },
    {
      id: 'slide_all_services',
      badge: '🎮 ครบทุกบริการเกมและดิจิทัล',
      badgeColor: 'bg-cyan-500 text-black font-black',
      title: 'ครบทุกบริการเกมและดิจิทัล',
      subtitle: 'บัตรเติมเงิน บัญชีพรีเมียม และไอเทมเกมชั้นนำ',
      ctaText: 'เลือกดูบริการ',
      ctaTarget: 'popular-games',
      image: '/banners/banner_all_services.png',
      isPureGraphic: true
    }
  ];

  // Active slides fallback
  const rawSlides = (customSlides && customSlides.length > 0) ? customSlides : defaultSlides;
  const slides = rawSlides.filter(s => s.isActive !== false);
  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Auto-play slider every 4.5 seconds (paused when user hovers mouse)
  useEffect(() => {
    if (activeSlides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeSlides.length, isHovered]);

  // Keep index within bounds if slide count changes
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    if (diffX > 50) {
      nextSlide();
    } else if (diffX < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleSlideClick = (slide) => {
    if (typeof slide.ctaAction === 'function') {
      slide.ctaAction();
    } else if (slide.ctaTarget) {
      if (slide.ctaTarget.startsWith('http://') || slide.ctaTarget.startsWith('https://')) {
        window.open(slide.ctaTarget, '_blank');
      } else {
        const el = document.getElementById(slide.ctaTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById('popular-games');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-6">
      <div 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-red-600/30 shadow-2xl shadow-red-950/40 group aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] min-h-[190px] sm:min-h-[280px] md:min-h-[350px] lg:min-h-[400px] flex items-center bg-[#0d1017] select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides rendering */}
        {activeSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          // If a slide is pure graphic or user uploaded image without text
          const hasTextOverlay = !slide.isPureGraphic && (slide.title || slide.subtitle);

          return (
            <div
              key={slide.id || index}
              onClick={() => handleSlideClick(slide)}
              className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Full Brightness Crisp Banner Artwork */}
              <div className="absolute inset-0 overflow-hidden bg-[#0d1017]">
                <img
                  src={slide.image}
                  alt={slide.title || 'Promotional Banner'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/banners/banner_fast_safe.png';
                  }}
                  className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                />

                {/* Subtle text gradient only when text overlay is requested */}
                {hasTextOverlay && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent sm:w-2/3"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  </>
                )}
              </div>

              {/* Slide Content (Only rendered if title/subtitle exists) */}
              {hasTextOverlay && (
                <div className="relative h-full max-w-2xl px-5 sm:px-12 flex flex-col justify-center space-y-2 sm:space-y-3.5 z-10 pointer-events-none">
                  {slide.badge && (
                    <div className="inline-flex items-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md ${slide.badgeColor || 'bg-red-600 text-white'}`}>
                        {slide.badge}
                      </span>
                    </div>
                  )}

                  {slide.title && (
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Kanit'] leading-tight drop-shadow-md">
                      {slide.title}
                    </h2>
                  )}

                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm text-zinc-200 font-normal max-w-lg leading-relaxed line-clamp-2 drop-shadow">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="pt-1.5 sm:pt-2">
                    <button
                      type="button"
                      className="pointer-events-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{slide.ctaText || 'ช้อปทันที'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Prev / Next Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-red-600 border border-zinc-700/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-red-600 border border-zinc-700/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Counter Badge (e.g. 1 / 4) */}
        {activeSlides.length > 1 && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-zinc-300">
            {currentSlide + 1} / {activeSlides.length}
          </div>
        )}

        {/* Pagination Dots */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-500/80'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-zinc-600/80 hover:bg-zinc-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
