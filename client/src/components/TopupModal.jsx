import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  QrCode, 
  Wallet, 
  CreditCard, 
  Gift, 
  Sparkles,
  HelpCircle,
  Loader2,
  Mail,
  Key,
  ShoppingCart
} from 'lucide-react';
import tracker from '../utils/analytics';

export default function TopupModal({ game, onClose, onSubmitOrder, onAddToCart, user, onOpenWallet, initialPackageId, siteSettings, onOpenPolicy }) {
  // Normalize packages from different product types
  const packagesList = game?.packages || 
    game?.denominations?.map(d => ({ id: d.id, name: d.name, price: d.price, originalPrice: d.price })) ||
    game?.plans?.map(p => ({ id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice || p.price })) ||
    (game?.flashPrice ? [{ id: game.id, name: game.packageName, price: game.flashPrice, originalPrice: game.originalPrice }] : []);

  const isGiftCard = Boolean(game?.denominations);
  const isAppSub = Boolean(game?.plans);
  const isCodeDelivery = isGiftCard || isAppSub;

  const initialPkg = initialPackageId 
    ? packagesList.find(p => p.id === initialPackageId) || packagesList[0]
    : packagesList[0] || null;

  // Payment Channels configuration
  const isChannelEnabled = (channelId) => {
    if (!siteSettings || !siteSettings.paymentMethods) return true;
    return siteSettings.paymentMethods[channelId]?.enabled !== false;
  };

  const paymentChannels = [
    {
      id: 'promptpay',
      name: 'พร้อมเพย์ QR',
      sublabel: 'สแกนจ่าย 0% ฟรี',
      icon: <QrCode className="w-4 h-4 text-blue-400" />,
      iconBox: 'bg-blue-950/80 border-blue-800/50 text-blue-400',
      activeBorder: 'bg-blue-950/60 border-blue-500 shadow-sm shadow-blue-500/20'
    },
    {
      id: 'truemoney',
      name: 'ซองทรูมันนี่',
      sublabel: 'กรอกลิงก์ซอง',
      icon: <Gift className="w-4 h-4 text-amber-400" />,
      iconBox: 'bg-amber-950/80 border-amber-800/50 text-amber-400',
      activeBorder: 'bg-amber-950/60 border-amber-500 shadow-sm shadow-amber-500/20'
    },
    {
      id: 'bank_transfer',
      name: 'โอนธนาคาร',
      sublabel: 'แนบสลิปออโต้',
      icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
      iconBox: 'bg-emerald-950/80 border-emerald-800/50 text-emerald-400',
      activeBorder: 'bg-emerald-950/60 border-emerald-500 shadow-sm shadow-emerald-500/20'
    },
    {
      id: 'wallet',
      name: 'กระเป๋าเงิน',
      sublabel: `฿${(user?.walletBalance || 0).toFixed(2)}`,
      sublabelClass: 'text-emerald-400 font-bold',
      icon: <Wallet className="w-4 h-4 text-red-400" />,
      iconBox: 'bg-red-950/80 border-red-800/50 text-red-400',
      activeBorder: 'bg-red-950/60 border-red-500 shadow-sm shadow-red-500/20'
    },
    {
      id: 'credit_card',
      name: 'บัตรเครดิต/เดบิต',
      sublabel: 'Visa, Mastercard',
      icon: <CreditCard className="w-4 h-4 text-purple-400" />,
      iconBox: 'bg-purple-950/80 border-purple-800/50 text-purple-400',
      activeBorder: 'bg-purple-950/60 border-purple-500 shadow-sm shadow-purple-500/20'
    }
  ].filter(c => isChannelEnabled(c.id));

  const initialMethod = paymentChannels[0]?.id || 'promptpay';
  const [playerId, setPlayerId] = useState(isCodeDelivery ? (user?.email || '') : '');
  const [server, setServer] = useState(game?.servers ? game.servers[0] : '');
  const [selectedPackage, setSelectedPackage] = useState(initialPkg);
  const [paymentMethod, setPaymentMethod] = useState(initialMethod);
  const [voucherUrl, setVoucherUrl] = useState('');

  // Fallback payment method if current is disabled
  useEffect(() => {
    if (paymentChannels.length > 0 && !paymentChannels.some(c => c.id === paymentMethod)) {
      setPaymentMethod(paymentChannels[0].id);
    }
  }, [paymentChannels, paymentMethod]);

  // Track InitiateCheckout on modal mount
  useEffect(() => {
    if (selectedPackage || game) {
      tracker.trackInitiateCheckout(selectedPackage || game);
    }
  }, []);
  
  // Player Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPlayer, setVerifiedPlayer] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Auto-verify character UID
  const handleVerifyPlayer = async () => {
    if (!playerId.trim()) {
      setVerificationError('กรุณากรอก UID หรือไอดีผู้เล่น');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setVerifiedPlayer(null);

    try {
      const res = await fetch('/api/games/verify-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id || game.gameId, playerId: playerId.trim(), server })
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedPlayer(data);
      } else {
        setVerificationError(data.message || 'ไม่พบข้อมูลตัวละคร');
      }
    } catch (err) {
      setVerificationError('ไม่สามารถตรวจสอบตัวละครได้ในขณะนี้');
    } finally {
      setIsVerifying(false);
    }
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
          amount: selectedPackage?.price || 0 
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
      } else {
        setCouponError(data.message || 'โค้ดส่วนลดไม่ถูกต้อง');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('เกิดข้อผิดพลาดในการตรวจสอบโค้ด');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    const basePrice = selectedPackage.price;
    if (!appliedCoupon) return basePrice;
    return Math.max(0, basePrice - appliedCoupon.discountAmount);
  };

  const handleSubmit = () => {
    if (paymentChannels.length === 0) {
      alert('ขออภัย ขณะนี้ทุกช่องทางการชำระเงินปิดปรับปรุงชั่วคราว กรุณาติดต่อแอดมิน');
      return;
    }
    if (!playerId.trim()) {
      setVerificationError(isCodeDelivery ? 'กรุณาระบุอีเมลสำหรับรับโค้ด' : 'กรุณากรอกไอดีผู้เล่นก่อนทำรายการ');
      return;
    }
    if (!selectedPackage) return;

    if (paymentMethod === 'truemoney' && !voucherUrl.trim()) {
      alert('กรุณากรอกลิงก์ซองของขวัญ TrueMoney');
      return;
    }

    if (paymentMethod === 'wallet') {
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนชำระเงินด้วยกระเป๋าเงิน');
        return;
      }
      if ((user.walletBalance || 0) < calculateFinalPrice()) {
        alert('ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ');
        return;
      }
    }

    onSubmitOrder({
      gameId: game.id || game.gameId || 'game_general',
      packageId: selectedPackage.id,
      playerId: playerId.trim(),
      playerNickname: verifiedPlayer?.nickname || (isCodeDelivery ? `อีเมล: ${playerId}` : `Player_${playerId.slice(-4)}`),
      server,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      voucherUrl: voucherUrl.trim(),
      userId: user ? user.id : 'usr_anonymous'
    });
  };

  const handleAddToCart = () => {
    if (!playerId.trim()) {
      setVerificationError(isCodeDelivery ? 'กรุณาระบุอีเมลสำหรับรับโค้ด' : 'กรุณากรอกไอดีผู้เล่นก่อนทำรายการ');
      return;
    }
    if (!selectedPackage) return;
    if (onAddToCart) {
      const cartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        gameId: game.id || game.slug || 'game_general',
        gameName: game.name || game.gameName,
        gameIcon: game.icon,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        price: calculateFinalPrice(),
        originalPrice: selectedPackage.price,
        costPrice: selectedPackage.costPrice || Math.round(selectedPackage.price * 0.85 * 100) / 100,
        playerId: playerId.trim(),
        server,
        playerIgn: verifiedPlayer?.nickname || verifiedPlayer?.characterName || ''
      };
      tracker.trackAddToCart(cartItem);
      onAddToCart(cartItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-red-950/80 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={game.icon} alt={game.name || game.gameName} className="w-12 h-12 rounded-xl object-cover border border-red-500/40 glow-red-sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-400 uppercase">{game.publisher || 'Official'}</span>
                <span className="text-[10px] bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-bold">อัตโนมัติ 24 ชม.</span>
              </div>
              <h2 className="text-lg font-black text-white">{game.name || game.gameName}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-red-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* STEP 1: กรอกข้อมูลผู้เล่น หรือ อีเมลรับโค้ด */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
                <span>
                  {isCodeDelivery ? 'ระบุอีเมลสำหรับรับรหัส Serial / ข้อมูลสมาชิก' : `กรอกข้อมูลตัวละคร (${game.inputType === 'riot_id' ? 'Riot ID' : game.inputType === 'username' ? 'ชื่อผู้ใช้ (Username)' : 'UID'})`}
                </span>
              </label>
              {game.inputHelp && !isCodeDelivery && (
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-red-400" /> {game.inputHelp}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className={isCodeDelivery ? "sm:col-span-12" : (game.servers ? "sm:col-span-6" : "sm:col-span-8")}>
                <div className="relative">
                  {isCodeDelivery && <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />}
                  <input
                    type={isCodeDelivery ? "email" : "text"}
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      setVerifiedPlayer(null);
                    }}
                    placeholder={isCodeDelivery ? "เช่น yourname@gmail.com สำหรับจัดส่งโค้ด" : (game.inputPlaceholder || (game.inputType === 'username' ? "กรอกชื่อผู้ใช้ Roblox (Username)" : "กรอก UID / Player ID"))}
                    className={`w-full ${isCodeDelivery ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-red-500 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Server selector if applicable */}
              {!isCodeDelivery && game.servers && (
                <div className="sm:col-span-3">
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-red-500 focus:outline-none"
                  >
                    {game.servers.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Verify Nickname Button */}
              {!isCodeDelivery && (
                <div className={game.servers ? "sm:col-span-3" : "sm:col-span-4"}>
                  <button
                    type="button"
                    onClick={handleVerifyPlayer}
                    disabled={isVerifying || !playerId.trim()}
                    className="w-full h-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
                  >
                    {isVerifying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจ...</>
                    ) : (
                      <><Search className="w-3.5 h-3.5" /> ตรวจสอบชื่อ</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Verification Result Feedback */}
            {verifiedPlayer && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center gap-3">
                  {verifiedPlayer.avatar ? (
                    <img 
                      src={verifiedPlayer.avatar} 
                      alt="Player Avatar" 
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-400/60 shadow-sm"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-[11px]">ชื่อตัวละคร:</span>
                      <strong className="text-white text-sm font-black">{verifiedPlayer.nickname || verifiedPlayer.characterName}</strong>
                      {verifiedPlayer.level && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          Lv.{verifiedPlayer.level}
                        </span>
                      )}
                    </div>
                    {verifiedPlayer.serverName && (
                      <div className="text-[10px] text-zinc-400 mt-0.5">เซิร์ฟเวอร์: {verifiedPlayer.serverName}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-bold border border-emerald-500/30">
                    ✓ พบข้อมูลในเกม
                  </span>
                  <span className="text-[9px] text-zinc-500">ตรวจสอบโดยระบบ IGN API</span>
                </div>
              </div>
            )}

            {verificationError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/60 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}
          </div>

          {/* STEP 2: เลือกแพ็กเกจที่ต้องการ */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
              <span>เลือกแพ็กเกจ / ราคา</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {packagesList.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-red-950/70 to-zinc-900 border-red-500 shadow-md shadow-red-600/20 scale-[1.02]'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {pkg.bonus && (
                      <span className="absolute top-2 right-2 text-[9px] bg-red-600/90 text-white font-bold px-1.5 py-0.5 rounded">
                        {pkg.bonus}
                      </span>
                    )}
                    <div className="text-xs font-bold text-white">{pkg.name}</div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-red-400 font-['Kanit']">฿{pkg.price}</span>
                      {pkg.originalPrice > pkg.price && (
                        <span className="text-[10px] text-zinc-500 line-through">฿{pkg.originalPrice}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: เลือกช่องทางการชำระเงิน */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
              <span>เลือกช่องทางชำระเงิน</span>
            </label>

            <div className={`grid gap-2.5 ${
              paymentChannels.length <= 2 ? 'grid-cols-2' : 
              paymentChannels.length === 3 ? 'grid-cols-3' : 
              'grid-cols-2 sm:grid-cols-4'
            }`}>
              {paymentChannels.map((channel) => {
                const isSelected = paymentMethod === channel.id;
                return (
                  <div
                    key={channel.id}
                    onClick={() => setPaymentMethod(channel.id)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? channel.activeBorder
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto rounded-lg border flex items-center justify-center mb-1 ${channel.iconBox}`}>
                      {channel.icon}
                    </div>
                    <div className="text-xs font-bold text-white">{channel.name}</div>
                    <div className={`text-[10px] ${channel.sublabelClass || 'text-zinc-400'}`}>
                      {channel.sublabel}
                    </div>
                  </div>
                );
              })}
            </div>

            {paymentChannels.length === 0 && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-center space-y-1 text-xs text-red-300">
                <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
                <p className="font-bold">ขณะนี้ระบบชำระเงินปิดปรับปรุงชั่วคราว</p>
                <p className="text-[11px] text-zinc-400">กรุณาติดต่อแอดมินผ่านแชทสดเพื่อขอรับช่องทางชำระเงินพิเศษ</p>
              </div>
            )}

            {/* TrueMoney Voucher Link Field */}
            {paymentMethod === 'truemoney' && (
              <div className="mt-3 p-3.5 bg-zinc-900/90 border border-amber-600/40 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-amber-300">กรอกลิงก์ซองของขวัญ TrueMoney Wallet</div>
                <input
                  type="text"
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
                <div className="text-[10px] text-zinc-400">
                  *สร้างซองอั่งเปาในแอป TrueMoney จำนวนเงินเท่ากับยอดชำระ แล้วนำลิงก์มาวาง
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: กรอกโค้ดโปรโมชั่น / คูปอง */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">4</span>
              <span>โค้ดส่วนลดโปรโมชั่น (Optional)</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="กรอกโค้ดส่วนลด เช่น WELCOME10, PROMO50"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs uppercase focus:border-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isValidatingCoupon || !couponCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isValidatingCoupon ? 'กำลังตรวจ...' : 'ใช้โค้ด'}
              </button>
            </div>

            {appliedCoupon && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-700/60 flex items-center justify-between text-xs text-red-300">
                <span>โค้ด <strong>{appliedCoupon.code}</strong>: {appliedCoupon.description}</span>
                <span className="text-emerald-400 font-bold">-฿{appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}

            {couponError && (
              <div className="text-xs text-red-400">{couponError}</div>
            )}
          </div>

        </div>

        {/* Modal Footer (Summary & Submit) */}
        <div className="p-6 bg-gradient-to-t from-black via-zinc-950 to-zinc-900 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-zinc-400">ยอดชำระสุทธิ</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-['Kanit']">
                ฿{calculateFinalPrice().toFixed(2)}
              </span>
              {appliedCoupon && (
                <span className="text-xs text-zinc-500 line-through">
                  ฿{selectedPackage?.price}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onAddToCart && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" /> เพิ่มลงตะกร้า
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" /> ชำระเงินทันที
            </button>
          </div>
        </div>

        {/* Legal Consent Notice */}
        <div className="px-6 py-2.5 bg-black/60 border-t border-zinc-900 text-center text-[10px] text-zinc-500">
          เมื่อกดยืนยัน ถือว่าท่านยอมรับ{' '}
          <button
            type="button"
            onClick={() => onOpenPolicy && onOpenPolicy('terms')}
            className="text-zinc-400 hover:text-white underline cursor-pointer"
          >
            ข้อกำหนดการให้บริการ
          </button>
          {' '}และ{' '}
          <button
            type="button"
            onClick={() => onOpenPolicy && onOpenPolicy('privacy')}
            className="text-zinc-400 hover:text-white underline cursor-pointer"
          >
            นโยบายความเป็นส่วนตัว (PDPA)
          </button>
        </div>

      </div>
    </div>
  );
}
