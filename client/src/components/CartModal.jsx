import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Zap, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Copy
} from 'lucide-react';
import Swal from '../utils/swal';
import tracker from '../utils/analytics';

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveFromCart, 
  onClearCart, 
  user, 
  onUpdateUser,
  onOpenLogin,
  onOpenTopupStatus 
}) {
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [customerContact, setCustomerContact] = useState(user?.phone || user?.email || '');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discountType === 'percent' 
        ? Math.round((totalAmount * (appliedCoupon.discountValue / 100)) * 100) / 100 
        : Math.min(totalAmount, appliedCoupon.discountValue))
    : 0;
  const finalPayAmount = Math.max(0, totalAmount - discountAmount);

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), amount: totalAmount })
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        Swal.fire({
          icon: 'success',
          title: 'ใช้โค้ดส่วนลดสำเร็จ!',
          text: `ลดทันที ฿${(data.coupon.discountAmount || 0).toFixed(2)}`,
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        setCouponError(data.message || 'โค้ดส่วนลดไม่ถูกต้อง');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('เกิดข้อผิดพลาดในการตรวจสอบโค้ด');
    }
  };

  // Submit Cart Checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Strict requirement: User must be logged in before checking out
    if (!user) {
      onClose();
      if (onOpenLogin) onOpenLogin();
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        text: 'เพื่อความปลอดภัยและบันทึกประวัติคำสั่งซื้อของคุณ กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนชำระเงินครับ',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'เข้าสู่ระบบ'
      });
      return;
    }

    if (paymentMethod === 'wallet') {
      if ((user.walletBalance || 0) < finalPayAmount) {
        Swal.fire({
          icon: 'warning',
          title: 'ยอดเงินคงเหลือไม่พอ',
          text: `ยอดเงินในกระเป๋าของคุณมี ฿${(user.walletBalance || 0).toFixed(2)} ต้องการ ฿${finalPayAmount.toFixed(2)} กรุณาเติมเงินก่อนครับ`,
          confirmButtonColor: '#dc2626'
        });
        return;
      }
    }

    setIsCheckingOut(true);
    tracker.trackInitiateCheckout(finalPayAmount, cartItems.length);

    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod,
          customerContact: customerContact.trim(),
          userId: user?.id || null,
          couponCode: appliedCoupon?.code || null
        })
      });
      const data = await res.json();

      if (data.success) {
        setCheckoutResult(data);

        // Save cart orders to tw_my_orders in localStorage
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          try {
            const saved = localStorage.getItem('tw_my_orders');
            const myOrders = saved ? JSON.parse(saved) : [];
            const newOrders = data.orders.map(o => ({
              ...o,
              finalAmount: Number(o.amount ?? o.finalAmount ?? o.price ?? 0),
              price: Number(o.amount ?? o.finalAmount ?? o.price ?? 0),
              topupStatus: o.topupStatus || (paymentMethod === 'wallet' ? 'completed' : 'pending'),
              paymentStatus: o.paymentStatus || (paymentMethod === 'wallet' ? 'paid' : 'pending')
            }));
            const updatedOrders = [
              ...newOrders,
              ...myOrders.filter(mo => !newOrders.some(no => no.id === mo.id || no.orderNumber === mo.orderNumber))
            ].slice(0, 50);
            localStorage.setItem('tw_my_orders', JSON.stringify(updatedOrders));
          } catch (e) {}
        }

        tracker.trackPurchase({
          orderNumber: data.orders?.[0]?.orderNumber || `CART_${Date.now()}`,
          gameName: 'คำสั่งซื้อจากตะกร้าสินค้า (Cart Checkout)',
          packageName: `${cartItems.length} รายการ`,
          finalAmount: finalPayAmount
        });
        onClearCart();

        if (paymentMethod === 'wallet') {
          if (onUpdateUser && user) {
            onUpdateUser({
              ...user,
              walletBalance: Math.max(0, (user.walletBalance || 0) - finalPayAmount)
            });
          }
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถชำระเงินได้',
          text: data.message,
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/80 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Kanit'] flex items-center gap-2">
                ตะกร้าสินค้า & รวมบิลชำระ
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-bold">
                  {cartItems.length} รายการ
                </span>
              </h2>
              <p className="text-xs text-zinc-400">สั่งหลายเกมพร้อมกันในบิลเดียว ชำระเงินเพียงครั้งเดียว สะดวก รวดเร็ว!</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setCheckoutResult(null);
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* If Checkout Succeeded: Show Confirmation Modal */}
          {checkoutResult ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-['Kanit']">
                  {paymentMethod === 'wallet' ? 'ชำระเงินสำเร็จครบทุกรายการแล้ว!' : 'สร้างออเดอร์ในตะกร้าเรียบร้อย'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {paymentMethod === 'wallet' 
                    ? 'ระบบได้ดำเนินการเติมเงินและออกรหัสให้คุณเรียบร้อยแล้ว' 
                    : 'กรุณาสแกนชำระเงินผ่านพร้อมเพย์ QR Code ด้านล่าง'}
                </p>
              </div>

              {/* PromptPay QR Code if applicable */}
              {paymentMethod === 'promptpay' && checkoutResult.promptpayQr && (
                <div className="p-5 rounded-3xl bg-white text-black max-w-xs mx-auto text-center space-y-3 shadow-xl">
                  <div className="text-xs font-bold text-zinc-700">พร้อมเพย์ QR Code (ยอดรวมทั้งหมด)</div>
                  <img 
                    src={checkoutResult.promptpayQr} 
                    alt="PromptPay QR" 
                    className="w-48 h-48 mx-auto rounded-xl border border-zinc-200"
                  />
                  <div className="text-xl font-black text-red-600 font-['Kanit']">
                    ฿{checkoutResult.finalPayAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-500">สแกนจ่ายได้ทุกธนาคาร ยอดตรง ออโต้ 24 ชม.</div>
                </div>
              )}

              {/* Created Orders List & Digital Codes */}
              <div className="space-y-2 text-left">
                <div className="text-xs font-bold text-zinc-400">รายการที่สั่งซื้อ ({checkoutResult.orders?.length || 0} รายการ):</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {checkoutResult.orders?.map((ord) => (
                    <div key={ord.id} className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{ord.gameName} - {ord.packageName}</span>
                          <span className="text-[10px] text-zinc-500">({ord.orderNumber})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          UID: <strong className="text-zinc-300">{ord.playerId}</strong>
                          {ord.playerIgn && <span className="ml-2 text-emerald-400 font-semibold">({ord.playerIgn})</span>}
                        </div>
                        {ord.digitalCode && (
                          <div className="mt-1.5 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center justify-between">
                            <span className="font-mono text-xs font-bold select-all">🔑 {ord.digitalCode}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(ord.digitalCode);
                                Swal.fire({ icon: 'success', title: 'คัดลอกรหัสแล้ว!', timer: 1200, showConfirmButton: false });
                              }}
                              className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded text-white font-bold ml-2"
                            >
                              คัดลอก
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-white shrink-0 ml-2">฿{ord.finalAmount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCheckoutResult(null);
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              {cartItems.length === 0 ? (
                <div className="p-12 text-center space-y-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/80">
                  <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto" />
                  <div className="text-sm font-bold text-zinc-300">ยังไม่มีสินค้าในตะกร้า</div>
                  <p className="text-xs text-zinc-500">เลือกแพ็กเกจเกมที่คุณต้องการ แล้วกดปุ่ม "เพิ่มลงตะกร้า" ได้เลยครับ</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30"
                  >
                    ไปเลือกดูเกมเลย
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {item.gameIcon ? (
                            <img src={item.gameIcon} alt={item.gameName} className="w-11 h-11 rounded-xl object-cover border border-zinc-700" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-red-400">
                              <Zap className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-sm">{item.gameName}</div>
                            <div className="text-xs text-red-400 font-semibold">{item.packageName}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              ID/UID: <strong className="text-zinc-200">{item.playerId}</strong>
                              {item.playerIgn && <span className="ml-1 text-emerald-400">({item.playerIgn})</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-black text-white font-['Kanit']">฿{Number(item.price || 0).toFixed(2)}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveFromCart(item.id)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="กรอกโค้ดส่วนลด (Coupon Code)"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs uppercase focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-600 text-white text-xs font-bold transition-colors"
                      >
                        ใช้โค้ด
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-700/50 flex items-center justify-between text-xs text-red-300">
                        <span>ใช้โค้ด <strong>{appliedCoupon.code}</strong></span>
                        <span className="text-emerald-400 font-bold">-฿{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {couponError && <div className="text-[11px] text-red-400">{couponError}</div>}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white uppercase">เลือกช่องทางการชำระเงินรวม</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('promptpay')}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          paymentMethod === 'promptpay'
                            ? 'bg-blue-950/60 border-blue-500 shadow-sm shadow-blue-500/20 text-white'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">พร้อมเพย์ QR Code</div>
                          <div className="text-[10px] text-zinc-400">สแกนจ่าย 0% ฟรี ทุกธนาคาร</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          paymentMethod === 'wallet'
                            ? 'bg-red-950/60 border-red-500 shadow-sm shadow-red-500/20 text-white'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">กระเป๋าเงินสมาชิก</div>
                          <div className="text-[10px] text-emerald-400 font-bold">
                            ฿{(user?.walletBalance || 0).toFixed(2)}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Customer Contact Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">เบอร์โทร หรือ อีเมลติดต่อ (สำหรับรับสลิป/หลักฐาน)</label>
                    <input
                      type="text"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder="เช่น 089xxxxxxx หรือ email@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Summary & Checkout Button */}
        {!checkoutResult && cartItems.length > 0 && (
          <div className="p-6 bg-gradient-to-t from-black via-zinc-950 to-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-zinc-400">
                ยอดรวม {cartItems.length} รายการ
                {discountAmount > 0 && <span className="text-emerald-400 ml-1">(ลด ฿{discountAmount.toFixed(2)})</span>}
              </div>
              <div className="text-2xl font-black text-white font-['Kanit']">
                ฿{finalPayAmount.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClearCart}
                className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all"
              >
                ล้างตะกร้า
              </button>
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenLogin) onOpenLogin();
                  }}
                  className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all animate-pulse cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>เข้าสู่ระบบก่อนชำระเงิน</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  {isCheckingOut ? 'กำลังดำเนินการ...' : `ชำระเงินรวม ฿${finalPayAmount.toFixed(2)}`}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
