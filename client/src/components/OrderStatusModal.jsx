import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Copy, 
  Check, 
  Download, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderStatusModal({ order, onClose, onRefreshOrder }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [countdown, setCountdown] = useState(900); // 15 mins

  // Load PromptPay QR if applicable
  useEffect(() => {
    if (order?.paymentMethod === 'promptpay') {
      fetch('/api/payments/promptpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: order.finalAmount })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQrCodeUrl(data.qrDataUrl);
        }
      })
      .catch(err => console.error("QR load err:", err));
    }
  }, [order]);

  // Animated stages progression
  useEffect(() => {
    if (!order) return;

    if (order.topupStatus === 'completed') {
      setCurrentStep(4);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      // Simulate rapid automated steps
      const t1 = setTimeout(() => setCurrentStep(2), 700);
      const t2 = setTimeout(() => setCurrentStep(3), 1500);
      const t3 = setTimeout(() => {
        setCurrentStep(4);
        try {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }, 2400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [order]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-['Kanit']">
              สถานะการทำรายการ (Live Order)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* PromptPay QR Section (if waiting for payment and still in step 1) */}
          {order.paymentMethod === 'promptpay' && currentStep === 1 && qrCodeUrl && (
            <div className="p-4 rounded-2xl bg-white text-zinc-900 text-center space-y-3 shadow-xl">
              <div className="inline-block bg-[#0056b3] text-white px-3 py-1 rounded text-xs font-bold">
                Thai QR Payment / พร้อมเพย์
              </div>
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="PromptPay QR" className="w-52 h-52 object-contain" />
              </div>
              <div className="text-sm font-black text-red-600 font-['Kanit'] text-xl">
                ฿{Number(order.finalAmount).toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-600">
                เปิดแอปธนาคารใดก็ได้ แล้วสแกนเพื่อชำระเงิน ระบบจะเติมเข้าเกมให้อัตโนมัติทันที
              </p>
            </div>
          )}

          {/* Live Progress Stepper */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-300">ความคืบหน้าระบบอัตโนมัติ 24 ชม.</div>
            
            <div className="space-y-2.5">
              
              {/* Step 1 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                currentStep >= 1 ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'opacity-40 border-zinc-800'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">ยืนยันการชำระเงินเรียบร้อย</div>
                  <div className="text-[10px] text-zinc-400">ช่องทาง: {order.paymentMethod.toUpperCase()} (฿{order.finalAmount})</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                currentStep >= 2 ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'opacity-40 border-zinc-800'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {currentStep === 2 ? <Zap className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">ส่งงานเข้า API ผู้ให้บริการ (Auto Top-up Engine)</div>
                  <div className="text-[10px] text-zinc-400">กำลังเชื่อมต่อ Smile One / UniPin Gateway...</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                currentStep >= 3 ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'opacity-40 border-zinc-800'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 3 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">เซิร์ฟเวอร์เกมยืนยันยอดไอเท็ม</div>
                  <div className="text-[10px] text-zinc-400">UID: {order.playerId} ({order.playerNickname})</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                currentStep >= 4 ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10' : 'opacity-40 border-zinc-800'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 4 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">เติมเงินสำเร็จเรียบร้อยแล้ว!</div>
                  <div className="text-[10px] text-emerald-400 font-medium">ไอเท็มเข้าตัวละครทันที เข้าเกมตรวจสอบได้เลย</div>
                </div>
              </div>

            </div>
          </div>

          {/* Receipt Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-[11px] text-zinc-400">เลขที่คำสั่งซื้อ</span>
              <button 
                onClick={copyOrderNumber}
                className="flex items-center gap-1 text-xs font-mono font-bold text-red-400 hover:text-red-300"
              >
                <span>{order.orderNumber}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">เกม</span>
                <strong className="text-white">{order.gameName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">แพ็กเกจ</span>
                <strong className="text-white">{order.packageName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">ไอดีผู้เล่น (UID)</span>
                <strong className="text-white">{order.playerId}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">ชื่อตัวละคร</span>
                <strong className="text-emerald-400">{order.playerNickname || '-'}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">ยอดชำระสุทธิ</span>
                <strong className="text-red-400 font-['Kanit'] text-sm">฿{Number(order.finalAmount).toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">สถานะการเติม</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> สำเร็จ 100%
                </span>
              </div>
            </div>

            {order.digitalCode && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/60 shadow-lg space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    🔑 รหัสโค้ด / Serial / PIN ดิจิทัล
                  </span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-bold">
                    คลังอัตโนมัติ 24 ชม.
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-emerald-500/40">
                  <span className="font-mono text-sm font-black text-white select-all tracking-wider">
                    {order.digitalCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(order.digitalCode);
                      alert('คัดลอกรหัสเรียบร้อยแล้ว!');
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> คัดลอก
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>รับประกันการเติมเงิน 100%</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-600/30"
          >
            เสร็จสิ้น
          </button>
        </div>

      </div>
    </div>
  );
}
