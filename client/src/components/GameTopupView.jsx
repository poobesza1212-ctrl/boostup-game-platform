import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Star, 
  CreditCard, 
  QrCode, 
  Wallet, 
  Gift, 
  Smartphone, 
  Zap, 
  Tag, 
  Check, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Info,
  Clock,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import tracker from '../utils/analytics';

export default function GameTopupView({ 
  game, 
  onBack, 
  onSubmitOrder, 
  onAddToCart, 
  user, 
  siteSettings, 
  initialPackageId,
  onOpenPolicy 
}) {
  // Normalize packages from different product types (Games, Gift Cards, App Subs, Flash Deals)
  const packagesList = useMemo(() => {
    return game?.packages || 
      game?.denominations?.map(d => ({ id: d.id, name: d.name, price: d.price, originalPrice: d.price })) ||
      game?.plans?.map(p => ({ id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice || p.price })) ||
      (game?.flashPrice ? [{ id: game.id, name: game.packageName, price: game.flashPrice, originalPrice: game.originalPrice }] : []);
  }, [game]);

  const isGiftCard = Boolean(game?.denominations);
  const isAppSub = Boolean(game?.plans);
  const isCodeDelivery = isGiftCard || isAppSub;

  const storageKey = `boostup_saved_id_${game?.id || 'game'}`;
  const [savedPrimaryId, setSavedPrimaryId] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch (e) {
      return '';
    }
  });

  // Form State
  const [playerId, setPlayerId] = useState(() => {
    if (isCodeDelivery && user?.email) return user.email;
    try {
      return localStorage.getItem(storageKey) || '';
    } catch (e) {
      return '';
    }
  });

  const [server, setServer] = useState(game?.servers ? game.servers[0] : '');

  const initialPkg = useMemo(() => {
    if (initialPackageId) {
      return packagesList.find(p => p.id === initialPackageId) || packagesList[0] || null;
    }
    return packagesList[0] || null;
  }, [packagesList, initialPackageId]);

  const [selectedPackage, setSelectedPackage] = useState(initialPkg);
  const [paymentMethod, setPaymentMethod] = useState('promptpay_scan');
  const [packageSearch, setPackageSearch] = useState('');
  const [showIdHelp, setShowIdHelp] = useState(false);

  // Voucher / Slip state
  const [voucherUrl, setVoucherUrl] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track InitiateCheckout on view load
  useEffect(() => {
    if (selectedPackage || game) {
      tracker.trackInitiateCheckout(selectedPackage || game);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [game]);

  // Payment Channels matching Image specifications
  const paymentMethodsList = [
    {
      id: 'promptpay_scan',
      name: 'สแกนผ่านพร้อมเพย์',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#003b71] flex items-center justify-center text-white font-black text-[10px] shadow-sm">
          PP
        </div>
      ),
      notice: 'ระยะเวลาตรวจสอบชำระเงิน 1-3 วินาที (ระบบอัตโนมัติ 24 ชม.)',
      badge: 'ไม่มีค่าธรรมเนียม',
      badgeType: 'free',
      feePercent: 0
    },
    {
      id: 'promptpay_bank',
      name: 'QR PromptPay ธนาคาร',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#1a3c61] flex items-center justify-center text-white font-black text-xs shadow-sm">
          <QrCode className="w-5 h-5 text-sky-300" />
        </div>
      ),
      notice: 'สแกน QR ผ่าน Mobile Banking ทุกธนาคาร',
      badge: 'ค่าธรรมเนียม 0% (โปรโมชั่นฟรี)',
      badgeType: 'info',
      feePercent: 0
    },
    {
      id: 'wallet',
      name: 'BOOSTUP Wallet',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
          <Wallet className="w-5 h-5" />
        </div>
      ),
      subtext: `คงเหลือ ฿${(Number(user?.walletBalance) || 0).toFixed(2)}`,
      badge: user ? 'ชำระเงินทันที' : 'ต้องเข้าสู่ระบบ',
      badgeType: user ? 'free' : 'warning',
      feePercent: 0
    },
    {
      id: 'credit_card',
      name: 'ชำระผ่านบัตรเครดิต',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-white shadow-sm">
          <CreditCard className="w-5 h-5 text-amber-400" />
        </div>
      ),
      notice: 'รองรับ VISA, Mastercard, JCB (ความปลอดภัยสูงสุด 3D Secure)',
      badge: 'รองรับ VISA • MC • JCB',
      badgeType: 'verified',
      feePercent: 0
    },
    {
      id: 'credit_installment',
      name: 'ผ่อนชำระผ่านบัตรเครดิต',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center text-white shadow-sm">
          <Calendar className="w-5 h-5 text-indigo-400" />
        </div>
      ),
      notice: 'ผ่อนชำระ 0% สำหรับยอด 1,000 บาทขึ้นไป',
      badge: 'ดอกเบี้ย 0% สูงสุด 10 เดือน',
      badgeType: 'free',
      feePercent: 0
    },
    {
      id: 'truemoney_wallet',
      name: 'True Money Wallet',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#ff6000] flex items-center justify-center text-white font-black text-[10px] shadow-sm">
          TM
        </div>
      ),
      notice: 'โอนผ่าน TrueMoney Wallet หรือ ซองอั่งเปาของขวัญ',
      badge: 'ไม่มีค่าธรรมเนียม',
      badgeType: 'free',
      feePercent: 0
    },
    {
      id: 'truemoney_paynext',
      name: 'True Money Pay Next (ใช้ก่อน จ่ายทีหลัง)',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-[9px] shadow-sm">
          NEXT
        </div>
      ),
      subtext: 'รองรับทั้ง Pay Next และ Pay Next Extra',
      badge: 'ค่าธรรมเนียม 0%',
      badgeType: 'info',
      feePercent: 0
    },
    {
      id: 'truemoney_promptpay',
      name: 'True Money PromptPay (Scan)',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#ff8c00] flex items-center justify-center text-white shadow-sm">
          <QrCode className="w-5 h-5 text-white" />
        </div>
      ),
      notice: 'ระยะเวลาตรวจสอบชำระเงิน 1-3 วินาที',
      badge: 'ไม่มีค่าธรรมเนียม',
      badgeType: 'free',
      feePercent: 0
    },
    {
      id: 'line_pay',
      name: 'LINE Pay',
      logo: (
        <div className="w-8 h-8 rounded-lg bg-[#06c755] flex items-center justify-center text-white font-black text-[9px] shadow-sm">
          LINE
        </div>
      ),
      notice: 'ชำระเงินผ่าน Rabbit LINE Pay อัตโนมัติ',
      badge: 'รองรับ LINE Pay',
      badgeType: 'info',
      feePercent: 0
    }
  ];

  // Check if a payment method is enabled in Admin Settings
  const isMethodEnabled = (methodId) => {
    if (!siteSettings || !siteSettings.paymentMethods) return true;
    const pm = siteSettings.paymentMethods;

    // Direct check for modern 9-channel keys
    if (pm[methodId] !== undefined) {
      return pm[methodId].enabled !== false;
    }

    // Fallback mapping to legacy keys if modern key is not explicitly configured
    if (methodId === 'promptpay_scan' || methodId === 'promptpay_bank') {
      return pm.promptpay?.enabled !== false;
    }
    if (methodId === 'truemoney_wallet' || methodId === 'truemoney_paynext' || methodId === 'truemoney_promptpay') {
      return pm.truemoney?.enabled !== false;
    }
    if (methodId === 'credit_installment') {
      return pm.credit_card?.enabled !== false;
    }
    if (methodId === 'line_pay' || methodId === 'linepay') {
      return (pm.line_pay?.enabled !== false) && (pm.linepay?.enabled !== false);
    }
    return pm[methodId]?.enabled !== false;
  };

  const visiblePaymentMethods = useMemo(() => {
    return paymentMethodsList.filter(item => isMethodEnabled(item.id));
  }, [paymentMethodsList, siteSettings]);

  // If currently selected payment method is disabled or not in visible list, select first available
  useEffect(() => {
    if (visiblePaymentMethods.length > 0 && !visiblePaymentMethods.some(c => c.id === paymentMethod)) {
      setPaymentMethod(visiblePaymentMethods[0].id);
    }
  }, [visiblePaymentMethods, paymentMethod]);

  // Primary ID actions
  const handleSaveAsPrimaryId = () => {
    if (!playerId.trim()) {
      alert('กรุณากรอก ID หรือ UID ก่อนกดบันทึกเป็น ID หลักครับ');
      return;
    }
    try {
      localStorage.setItem(storageKey, playerId.trim());
      setSavedPrimaryId(playerId.trim());
      alert(`⭐ บันทึก "${playerId.trim()}" เป็น ID หลักของเกม ${game?.name || ''} เรียบร้อยแล้ว! ครั้งต่อไปจะกรอกให้อัตโนมัติ`);
    } catch (e) {}
  };

  const handleClearPrimaryId = () => {
    try {
      localStorage.removeItem(storageKey);
      setSavedPrimaryId('');
      setPlayerId('');
      alert('ลบ ID หลักเรียบร้อยแล้ว');
    } catch (e) {}
  };

  // Coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: selectedPackage?.price || 0,
          gameId: game?.id
        })
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.message || 'คูปองไม่ถูกต้อง หรือหมดอายุแล้ว');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('ไม่สามารถตรวจสอบคูปองได้');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Price calculations
  const rawPrice = selectedPackage?.price || 0;
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (rawPrice * (appliedCoupon.discount || 0)) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discount || 0;
    }
  }
  const finalPrice = Math.max(0, rawPrice - discountAmount);

  // Filtered packages
  const filteredPackages = packagesList.filter(pkg =>
    !packageSearch.trim() || pkg.name.toLowerCase().includes(packageSearch.toLowerCase())
  );

  // Handle direct checkout
  const handleConfirmCheckout = async () => {
    if (!playerId.trim()) {
      alert(`กรุณากรอก ${game?.inputLabel || 'UID / Riot Tag'} ให้ถูกต้องก่อนทำการสั่งซื้อ`);
      const inputEl = document.getElementById('player-id-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!selectedPackage) {
      alert('กรุณาเลือกแพ็กเกจที่ต้องการเติมก่อนครับ');
      return;
    }

    // Direct payment mapping for backend
    let mappedMethod = 'promptpay';
    if (paymentMethod === 'wallet') mappedMethod = 'wallet';
    else if (paymentMethod === 'credit_card' || paymentMethod === 'credit_installment') mappedMethod = 'credit_card';
    else if (paymentMethod.startsWith('truemoney')) mappedMethod = 'truemoney';
    else mappedMethod = 'promptpay';

    // If wallet selected and balance not enough, notify politely
    if (mappedMethod === 'wallet' && (user?.walletBalance || 0) < finalPrice) {
      alert(`ยอดเงินในกระเป๋า BOOSTUP มี ฿${(user?.walletBalance || 0).toFixed(2)} ซึ่งไม่เพียงพอสำหรับยอดชำระ ฿${finalPrice.toFixed(2)}\n\nคุณสามารถเลือกชำระผ่าน "สแกนผ่านพร้อมเพย์" หรือ "บัตรเครดิต" หรือ "True Money" เพื่อชำระได้ทันทีโดยไม่ต้องเติมเข้ากระเป๋าก่อนครับ!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        gameId: game.id,
        gameName: game.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: finalPrice,
        originalPrice: selectedPackage.price,
        playerId: playerId.trim(),
        server: server || undefined,
        paymentMethod: mappedMethod,
        subPaymentChannel: paymentMethod,
        voucherUrl: paymentMethod === 'truemoney_wallet' ? voucherUrl : undefined,
        couponCode: appliedCoupon?.code || undefined,
        discount: discountAmount,
        userId: user?.id || undefined,
        userEmail: user?.email || (isCodeDelivery ? playerId.trim() : undefined)
      };

      await onSubmitOrder(orderPayload);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPackageBrandIcon = () => {
    const isValorant = game?.id === 'valorant' || game?.slug === 'valorant' || (game?.name && game.name.toLowerCase().includes('valorant'));
    if (isValorant) {
      return (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-rose-300 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
          <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="#ff4655" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z"/>
          </svg>
        </div>
      );
    }

    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-blue-200/80 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
        <img
          src={game?.icon || game?.image || '/boostup_logo.jpg'}
          alt="game logo"
          className="w-full h-full object-contain rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/boostup_logo.jpg';
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Prompt',sans-serif] pb-24 selection:bg-blue-600 selection:text-white">
      
      {/* Top Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* 1. Yellow Promotional Header Banner matching Image */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#fef08a] border-2 border-[#facc15] shadow-sm flex items-center gap-3.5 sm:gap-4 mb-6 transition-all animate-fadeIn">
          {/* Game Logo in White Square */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-sm border border-amber-200/80 flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src={game?.icon || game?.image || '/boostup_logo.jpg'} 
              alt={game?.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/boostup_logo.jpg';
              }}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Banner Text */}
          <div className="leading-snug">
            <h1 className="text-base sm:text-xl font-black text-slate-900 font-['Kanit'] tracking-tight">
              เติม {game?.name || 'เกมออนไลน์'} เข้าไวสุดๆ คุ้มกว่าเติมเอง เฉพาะ ID ไทยเท่านั้น
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-0.5">
              ระบบตัดยอดและส่งไอเทมอัตโนมัติ 24 ชม. • ปลอดภัย 100% • เติมได้ทันทีไม่ต้องรอแอดมิน
            </p>
          </div>
        </div>

        {/* 2. Back Button matching Image [< กลับไปเลือกเกม] */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer font-['Kanit']"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>กลับไปเลือกเกม</span>
          </button>
        </div>

        {/* 3. STEP 1: กรุณากรอก ID / Riot Tag */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Input Form) */}
            <div className="lg:col-span-7 space-y-3.5">
              
              {/* Section Header */}
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-black text-xl leading-none">|</span>
                <h2 className="text-base sm:text-lg font-black text-blue-700 font-['Kanit'] flex items-center gap-1.5">
                  <span>1. กรุณากรอก {game?.inputLabel || 'Riot Tag เช่น Richman#1234'} แล้วเลือกแพคที่ต้องการ</span>
                  <button
                    type="button"
                    onClick={() => setShowIdHelp(prev => !prev)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="ดูคำแนะนำการหา ID"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </h2>
              </div>

              {/* Input Field */}
              <div>
                <input
                  id="player-id-input"
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder={game?.inputPlaceholder || isCodeDelivery ? "กรอกอีเมลสำหรับรับโค้ดดิจิทัล..." : "เช่น Szol3osZlai#LFC หรือ UID ในเกม"}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* Server selector if game has multiple servers */}
              {game?.servers && game.servers.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">เซิร์ฟเวอร์ (Server)</label>
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {game.servers.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pink/Red Instruction Box matching Image */}
              <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-700 text-[11px] leading-relaxed">
                กรุณากรอก {game?.inputLabel || 'Riot Tag หรือ UID'} ให้ถูกต้อง โดยดูได้จากโปรไฟล์ในเกม แล้ว Copy {game?.inputLabel || 'Riot Tag เช่น Richman#1234'} แล้วเลือกแพคที่ต้องการ
              </div>

              {/* Yellow Star Button [⭐ บันทึก ID ปัจจุบันเป็น ID หลัก] */}
              <button
                type="button"
                onClick={handleSaveAsPrimaryId}
                className="w-full py-2.5 rounded-xl bg-[#ffe600] hover:bg-[#facc15] active:scale-[0.99] text-slate-900 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 font-['Kanit'] cursor-pointer"
              >
                <Star className="w-4 h-4 fill-slate-900" />
                <span>บันทึก ID ปัจจุบันเป็น ID หลัก</span>
              </button>

              {/* Manage/Clear ID Link */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={handleClearPrimaryId}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
                >
                  คลิกเพื่อจัดการ/ลบ ID หลัก
                </button>
              </div>

            </div>

            {/* Right Column (Instructions & Service Guarantee matching Image) */}
            <div className="lg:col-span-5 lg:pl-4 space-y-2.5 text-xs text-slate-600 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0">
              <h3 className="text-base font-black text-slate-900 font-['Kanit']">
                เติม {game?.name} ราคาถูก รับ {game?.currency || 'ไอเทม'} ทันที
              </h3>

              <p className="leading-relaxed text-slate-600 text-[11px] sm:text-xs">
                เติม {game?.name} กับ BOOSTUP — รับ {game?.currency || 'ไอเทม'} เข้าเกมอัตโนมัติภายใน 1-3 วินาที รองรับ QR PromptPay, บัตรเครดิต และทรูมันนี่วอลเล็ต พร้อมรับ Boost Coins ทุกการเติมเพื่อสะสมส่วนลดครั้งถัดไป บริการ 24 ชม.
              </p>

              <div className="pt-2 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-800 font-['Kanit'] text-xs">
                  วิธีเติม {game?.name} ที่ BOOSTUP
                </div>
                <div className="space-y-1 text-slate-600 pl-1">
                  <div>1. เลือกแพ็กเกจที่ต้องการ เปรียบเทียบราคาและโปรโมชั่น</div>
                  <div>2. กรอก {game?.inputLabel || 'UID / Game Account'} ให้ถูกต้อง</div>
                  <div>3. ชำระเงินผ่าน QR PromptPay, บัตรเครดิต/เดบิต หรือ ทรูมันนี่วอลเล็ต</div>
                  <div>4. ตรวจสอบรายการและยืนยันคำสั่งซื้อ</div>
                  <div>5. {game?.currency || 'ไอเทม'} เข้าบัญชีเกมอัตโนมัติภายใน 1-3 วินาที ไม่ต้องรอแอดมิน</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. STEP 2: กรุณาเลือกวิธีการชำระเงิน matching Image */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-blue-600 font-black text-xl leading-none">|</span>
            <h2 className="text-base sm:text-lg font-black text-blue-700 font-['Kanit']">
              2. กรุณาเลือกวิธีการชำระเงิน
            </h2>
          </div>

          {/* Payment Methods Grid matching Image */}
          {visiblePaymentMethods.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700 font-['Kanit']">
                ขณะนี้ช่องทางชำระเงินปิดปรับปรุงชั่วคราว
              </div>
              <p className="text-xs text-slate-500 mt-1">
                กรุณาติดต่อทีมงานแอดมินทาง LINE หรือลองใหม่อีกครั้งในภายหลังครับ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {visiblePaymentMethods.map((channel) => {
                const isSelected = paymentMethod === channel.id;

                return (
                  <div
                    key={channel.id}
                    onClick={() => setPaymentMethod(channel.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/20 shadow-md ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Top: Logo & Title */}
                    <div className="flex items-start gap-3">
                      {channel.logo}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 font-['Kanit'] leading-tight">
                        {channel.name}
                      </div>
                      {channel.subtext && (
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          {channel.subtext}
                        </div>
                      )}
                      {channel.notice && (
                        <div className="text-[10px] text-rose-600 mt-0.5 line-clamp-1">
                          {channel.notice}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Badge / Status */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      channel.badgeType === 'free'
                        ? 'text-emerald-600'
                        : channel.badgeType === 'verified'
                        ? 'text-blue-600'
                        : 'text-slate-600'
                    }`}>
                      {channel.badgeType === 'free' ? '✔' : 'ℹ'} {channel.badge}
                    </span>

                    {/* Radio circle indicator */}
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Conditional Input for TrueMoney Voucher Link if selected */}
          {paymentMethod === 'truemoney_wallet' && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 animate-fadeIn">
              <label className="text-xs font-bold text-amber-900 block mb-1.5">
                🎁 ลิงก์ซองของขวัญ TrueMoney (ถ้าต้องการตัดยอดผ่านซองอั่งเปา):
              </label>
              <input
                type="text"
                value={voucherUrl}
                onChange={(e) => setVoucherUrl(e.target.value)}
                placeholder="https://gift.truemoney.com/campaign/?v=..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[10px] text-amber-700 mt-1">
                สร้างซองของขวัญเท่ากับยอดชำระ กรอกรับสิทธิ์ 1 คน แล้วนำลิงก์มาวาง ระบบจะตัดยอดอัตโนมัติใน 1 วินาที
              </p>
            </div>
          )}

        </div>

        {/* 5. STEP 3: เลือกแพ็กเกจเติมเกม matching Image */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-black text-xl leading-none">|</span>
              <h2 className="text-base sm:text-lg font-black text-blue-700 font-['Kanit']">
                3. เลือกแพ็กเกจเติมเกม {game?.name} เข้าไวสุดๆ คุ้มกว่าเติมเอง เฉพาะ ID ไทยเท่านั้น
              </h2>
            </div>

            {/* Search Packages Input matching Image */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                placeholder="ค้นหาแพ็กเกจ เช่น ชื่อหรือรายละเอียดแพ็กเกจ"
                className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Packages Grid */}
          {filteredPackages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              ไม่พบแพ็กเกจที่ค้นหา ลองพิมพ์คำค้นอื่นครับ
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const coinReward = pkg.coinReward || Math.max(1, Math.round(pkg.price * 0.01));
                const formattedPrice = Number(pkg.price).toLocaleString('en-US', {
                  minimumFractionDigits: pkg.price % 1 === 0 ? 0 : 2,
                  maximumFractionDigits: 2
                });

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-white select-none min-h-[96px] ${
                      isSelected
                        ? 'border-2 border-blue-500 bg-blue-50/15 shadow-sm ring-2 ring-blue-400/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Name and Yellow Coin Badge */}
                    <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                      <div className="text-sm sm:text-base font-bold text-slate-800 font-['Kanit'] leading-tight">
                        {pkg.name}
                      </div>
                      <div className="bg-[#facc15] text-amber-950 font-bold text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap">
                        <span>🪙</span>
                        <span>รับ {coinReward} คอยน์</span>
                      </div>
                    </div>

                    {/* Bottom Row: Price in Blue and Circular Logo Badge */}
                    <div className="mt-3 pt-2 flex items-center justify-between">
                      <div className="text-sm sm:text-base font-bold text-blue-600 font-['Kanit']">
                        ฿{formattedPrice}
                      </div>
                      {renderPackageBrandIcon()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* 6. STEP 4: ตรวจสอบข้อมูลคำสั่งซื้อ & ยืนยันการชำระเงิน (DIRECT CHECKOUT - NO WALLET REQUIRED) */}
        <div id="checkout-summary-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-12">
          
          <div className="flex items-center gap-2 mb-5">
            <span className="text-blue-600 font-black text-xl leading-none">|</span>
            <h2 className="text-base sm:text-lg font-black text-blue-700 font-['Kanit']">
              4. ตรวจสอบข้อมูลและยืนยันการชำระเงินทันที
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Summary Details */}
            <div className="lg:col-span-7 space-y-3 text-xs text-slate-700">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">เกมที่เติม:</span>
                  <span className="font-bold text-slate-900">{game?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">แพ็กเกจ:</span>
                  <span className="font-bold text-blue-600">{selectedPackage?.name || 'ยังไม่ได้เลือก'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ไอดีผู้รับ:</span>
                  <span className="font-bold text-slate-900 font-mono">{playerId || '(กรุณากรอกไอดี)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วิธีชำระเงิน:</span>
                  <span className="font-bold text-emerald-600">
                    {visiblePaymentMethods.find(c => c.id === paymentMethod)?.name || paymentMethodsList.find(c => c.id === paymentMethod)?.name || 'พร้อมเพย์ QR'}
                  </span>
                </div>
              </div>

              {/* Coupon Code Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="กรอกโค้ดส่วนลด (เช่น WELCOME10, PROMO50)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono uppercase focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40 cursor-pointer font-['Kanit']"
                >
                  {isValidatingCoupon ? 'ตรวจ...' : 'ใช้โค้ด'}
                </button>
              </div>

              {/* Coupon feedback */}
              {appliedCoupon && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
                  <span>🎉 ใช้โค้ดส่วนลด <strong>{appliedCoupon.code}</strong> สำเร็จ ลดทันที ฿{discountAmount.toFixed(2)}</span>
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-rose-600 font-bold hover:underline">ลบ</button>
                </div>
              )}
              {couponError && (
                <div className="text-rose-600 text-xs">{couponError}</div>
              )}

            </div>

            {/* Right: Big Price & Action Button */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-center">
              <div>
                <div className="text-xs text-slate-500 font-medium">ยอดชำระสุทธิ</div>
                <div className="text-3xl sm:text-4xl font-black text-blue-600 font-['Kanit'] tracking-tight mt-1">
                  ฿{finalPrice.toFixed(2)}
                </div>
                {discountAmount > 0 && (
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    ประหยัดไป ฿{discountAmount.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Buttons Row: Add to Cart + Confirm Checkout */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-black text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Kanit']"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังสร้างรายการสั่งซื้อ...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>ยืนยันการสั่งซื้อและชำระเงินทันที</span>
                    </>
                  )}
                </button>

                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!playerId.trim()) {
                        alert(`กรุณากรอก ${game?.inputLabel || 'UID / Riot Tag'} ก่อนเพิ่มลงตะกร้า`);
                        return;
                      }
                      if (!selectedPackage) return;
                      onAddToCart({
                        id: 'cart_' + Date.now(),
                        gameId: game.id,
                        gameName: game.name,
                        gameIcon: game.icon || game.image,
                        packageId: selectedPackage.id,
                        packageName: selectedPackage.name,
                        price: finalPrice,
                        playerId: playerId.trim(),
                        server: server || undefined
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>เพิ่มลงในตะกร้า</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                เมื่อกดยืนยัน ระบบจะเปิดหน้าสแกน QR หรือช่องทางชำระเงินทันที ชำระได้โดยตรงไม่ต้องเติมเข้ากระเป๋าก่อน
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Bottom Helper Pill matching Screenshot */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <button
          type="button"
          onClick={() => {
            if (selectedPackage) {
              document.getElementById('checkout-summary-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className={`pointer-events-auto px-5 py-2.5 rounded-full shadow-2xl border flex items-center gap-2.5 text-xs font-bold font-['Kanit'] transition-all transform active:scale-95 ${
            selectedPackage
              ? 'bg-[#0f172a] hover:bg-slate-800 text-white border-slate-700/80 cursor-pointer shadow-blue-500/10'
              : 'bg-[#1e293b]/95 text-slate-200 border-slate-700/60 cursor-default'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-blue-400" />
          <span>
            {selectedPackage
              ? `เลือก: ${selectedPackage.name} (฿${Number(selectedPackage.price).toLocaleString('en-US', { minimumFractionDigits: selectedPackage.price % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })})`
              : 'กรุณาระบุ แพ็คเกจเติมเกม'}
          </span>
          {selectedPackage ? (
            <span className="text-emerald-400 text-xs ml-0.5">🚀 ชำระเงิน</span>
          ) : (
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin ml-1" />
          )}
        </button>
      </div>

    </div>
  );
}
