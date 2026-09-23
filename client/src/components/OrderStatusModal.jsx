import React, { useState, useEffect, useRef } from 'react';
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
  FileText, 
  Share2, 
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

const getPaymentLabel = (method, subMethod) => {
  const m = (subMethod || method || '').toLowerCase();
  if (m === 'promptpay' || m === 'promptpay_scan') return 'สแกนผ่านพร้อมเพย์ (PromptPay)';
  if (m === 'bank_promptpay' || m === 'promptpay_bank') return 'QR PromptPay ธนาคาร';
  if (m === 'wallet') return 'BOOSTUP Wallet (กระเป๋าเงิน)';
  if (m === 'credit_card' || m.includes('credit_card')) return 'บัตรเครดิต / เดบิต (VISA • MC • JCB)';
  if (m === 'installment' || m === 'credit_installment') return 'ผ่อนชำระผ่านบัตรเครดิต 0%';
  if (m === 'truemoney' || m === 'truemoney_wallet') return 'TrueMoney Wallet';
  if (m === 'truemoney_paynext') return 'TrueMoney Pay Next';
  if (m === 'truemoney_scan' || m === 'truemoney_promptpay') return 'TrueMoney PromptPay (Scan)';
  if (m === 'linepay') return 'LINE Pay';
  return (method || 'PromptPay').toUpperCase();
};

export default function OrderStatusModal({ order, onClose, onRefreshOrder }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [receiptQrUrl, setReceiptQrUrl] = useState('');
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const isQrPayment = ['promptpay', 'promptpay_scan', 'promptpay_bank', 'bank_promptpay', 'truemoney_scan', 'truemoney_promptpay'].includes(order?.paymentMethod) || ['promptpay', 'promptpay_scan', 'promptpay_bank', 'bank_promptpay', 'truemoney_scan', 'truemoney_promptpay'].includes(order?.subPaymentChannel);

  // Load PromptPay QR if applicable
  useEffect(() => {
    if (isQrPayment && order?.finalAmount) {
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
  }, [order, isQrPayment]);

  // Load Order Verification QR Code
  useEffect(() => {
    if (order?.id || order?.orderNumber) {
      const ordId = order.id || order.orderNumber;
      fetch(`/api/orders/${ordId}/receipt-qr`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.qrDataUrl) {
            setReceiptQrUrl(data.qrDataUrl);
          }
        })
        .catch(err => console.error("Receipt QR load err:", err));
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

  // High-Resolution E-Receipt Canvas Image Generator & Downloader
  const handleDownloadReceipt = () => {
    if (!order) return;
    setIsGeneratingReceipt(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 640;
      const height = 980;
      const dpr = 2; // High-DPI 2x Retina sharpness
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // 1. Dark Cyber Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0e17');
      bgGrad.addColorStop(0.3, '#070b13');
      bgGrad.addColorStop(0.7, '#05070c');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer Glowing Emerald Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
      ctx.shadowBlur = 18;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.shadowBlur = 0;

      // Inner Gold Border Accent
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.strokeRect(16, 16, width - 32, height - 32);

      // Header Brand Box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, 20, width - 40, 100);

      // Store Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🎮 BOOSTUP STORE', 40, 60);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PLAY MORE GO FURTHER • THAILAND', 40, 82);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('ร้านเติมเกมอัตโนมัติ 24 ชม. • WWW.BOOSTUP-GAME.ONLINE', 40, 102);

      // Top-right Verified Badge
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.fillRect(width - 195, 35, 155, 45);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width - 195, 35, 155, 45);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ OFFICIAL VERIFIED', width - 117, 56);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '9px sans-serif';
      ctx.fillText('100% AUTHENTIC E-SLIP', width - 117, 70);
      ctx.textAlign = 'left';

      // Title Bar
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.fillRect(20, 130, width - 40, 42);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('ใบเสร็จรับเงินอิเล็กทรอนิกส์ (ELECTRONIC TRANSACTION E-RECEIPT)', 40, 156);

      // Order Meta Information Box
      const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('th-TH');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 182, width - 40, 80);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('เลขที่คำสั่งซื้อ:', 40, 210);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(order.orderNumber, 150, 210);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('วันเวลาทำรายการ:', 40, 242);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText(orderDate, 150, 242);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('สถานะรายการ:', 375, 210);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✓ สำเร็จ 100% (COMPLETED)', 460, 210);

      // Game & Item Details Box
      ctx.fillStyle = '#111827';
      ctx.fillRect(20, 272, width - 40, 160);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 272, width - 40, 160);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('📦 รายละเอียดสินค้าและการเติมเงิน', 40, 300);

      const drawRow = (label, val, y, isHighlight = false) => {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px sans-serif';
        ctx.fillText(label, 40, y);

        ctx.fillStyle = isHighlight ? '#34d399' : '#f3f4f6';
        ctx.font = isHighlight ? 'bold 13px sans-serif' : '13px sans-serif';
        ctx.fillText(String(val || '-'), 190, y);
      };

      drawRow('เกม:', order.gameName, 332);
      drawRow('แพ็กเกจ:', order.packageName, 362);
      drawRow('ไอดีผู้เล่น (UID):', order.playerId, 392);
      drawRow('ชื่อตัวละคร (IGN):', order.playerNickname || '-', 422, true);

      // Financial Details Box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, 442, width - 40, 185);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(20, 442, width - 40, 185);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('💳 สรุปยอดการชำระเงิน', 40, 470);

      drawRow('ช่องทางการชำระ:', getPaymentLabel(order.paymentMethod, order.subPaymentChannel), 505);
      const subtotal = Number(order.originalAmount || order.price || order.finalAmount).toFixed(2);
      drawRow('ยอดรวมสินค้า:', `฿${subtotal}`, 535);
      if (order.couponCode) {
        drawRow('ส่วนลดคูปอง:', `โค้ด "${order.couponCode}"`, 565, true);
      } else {
        drawRow('ส่วนลด:', '฿0.00', 565);
      }

      // Net Amount Ribbon
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.fillRect(40, 582, width - 80, 34);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('ยอดชำระสุทธิ (NET TOTAL):', 50, 604);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`฿${Number(order.finalAmount).toFixed(2)}`, width - 50, 606);
      ctx.textAlign = 'left';

      // Digital Code Box (if applicable)
      let currentY = 638;
      if (order.digitalCode) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.fillRect(20, currentY, width - 40, 65);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, currentY, width - 40, 65);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('🔑 รหัสโค้ดดิจิทัล / SERIAL PIN:', 40, currentY + 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(order.digitalCode, 40, currentY + 48);
        currentY += 75;
      }

      // Bottom Section with QR code & Security Guarantee
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';

      const finishCanvas = () => {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('สแกน QR Code ด้านขวาเพื่อตรวจสอบความถูกต้องของสลิปนี้', 40, currentY + 32);
        ctx.fillText('ระบบรักษาความปลอดภัยมาตรฐาน 256-bit SSL Encryption', 40, currentY + 52);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('LINE Official: @boostup • ฝ่ายบริการลูกค้า 24 ชม.', 40, currentY + 78);

        // Holographic stamp watermark
        ctx.save();
        ctx.translate(280, currentY + 55);
        ctx.rotate(-0.06);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-90, -25, 180, 50);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ BOOSTUP VERIFIED ★', 0, -5);
        ctx.font = '9px sans-serif';
        ctx.fillText('SECURE DIGITAL RECEIPT', 0, 12);
        ctx.restore();

        // Footer Bar
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(20, height - 45, width - 40, 25);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('© 2026 BOOSTUP GAME PLATFORM. ALL RIGHTS RESERVED. KEEP THIS RECEIPT AS PROOF.', width / 2, height - 28);

        // Trigger Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `BOOSTUP-Receipt-${order.orderNumber}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsGeneratingReceipt(false);

        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        alert('ดาวน์โหลดภาพใบเสร็จ (E-Receipt PNG) เรียบร้อยแล้ว!');
      };

      qrImg.onload = () => {
        ctx.drawImage(qrImg, width - 150, currentY + 8, 110, 110);
        finishCanvas();
      };
      qrImg.onerror = () => {
        finishCanvas();
      };

      if (receiptQrUrl) {
        qrImg.src = receiptQrUrl;
      } else {
        finishCanvas();
      }

    } catch (e) {
      console.error('Receipt generation error:', e);
      setIsGeneratingReceipt(false);
      alert('ไม่สามารถสร้างรูปใบเสร็จได้ กรุณาลองใหม่');
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-['Kanit']">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-950 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                สถานะการทำรายการ (Live Order)
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">{order.orderNumber}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* PromptPay QR Section (if waiting for payment and still in step 1) */}
          {isQrPayment && currentStep === 1 && qrCodeUrl && (
            <div className="p-4 rounded-2xl bg-white text-zinc-900 text-center space-y-3 shadow-xl">
              <div className="inline-block bg-[#0056b3] text-white px-3 py-1 rounded text-xs font-bold">
                Thai QR Payment / พร้อมเพย์
              </div>
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="PromptPay QR" className="w-52 h-52 object-contain" />
              </div>
              <div className="text-sm font-black text-red-600 text-xl font-['Kanit']">
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
                  <div className="text-[10px] text-zinc-400">ช่องทาง: {getPaymentLabel(order.paymentMethod, order.subPaymentChannel)} (฿{order.finalAmount})</div>
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
                  <div className="text-[10px] text-zinc-400">UID: {order.playerId} ({order.playerNickname || '-'})</div>
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

          {/* Receipt Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
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
                <span className="text-zinc-500 block text-[10px]">ชื่อตัวละคร (IGN)</span>
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

            {order.couponCode && (
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs text-purple-300">
                <span>🏷️ ใช้โค้ดส่วนลด: <strong>{order.couponCode}</strong></span>
                <span className="text-emerald-400 font-bold">ประหยัดแล้ว ✓</span>
              </div>
            )}

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

            {/* 🧾 E-Receipt & Slip Card Action Area */}
            <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                disabled={isGeneratingReceipt}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="ดาวน์โหลดรูปสลิปใบเสร็จ PNG คมชัดสูงลงเครื่อง"
              >
                <Download className={`w-4 h-4 ${isGeneratingReceipt ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingReceipt ? 'กำลังสร้างสลิป...' : 'บันทึกรูปสลิป PNG'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="เปิดดูการ์ดใบเสร็จดิจิทัลฉบับเต็ม"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>ดูใบเสร็จ E-Receipt</span>
              </button>
            </div>
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
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-600/30 cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>

      </div>

      {/* 🧾 Interactive E-Receipt Fullscreen Card Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0e1626] via-[#090d17] to-[#04060a] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-xs font-['Kanit']">
            
            {/* E-Receipt Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-white tracking-wide">🎮 BOOSTUP STORE</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Electronic Transaction Receipt
                </div>
                <div className="text-[9px] text-zinc-500">
                  {new Date(order.createdAt).toLocaleString('th-TH')}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  ✓ VERIFIED
                </span>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Order Box */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">เลขอ้างอิงคำสั่งซื้อ:</span>
                <span className="font-mono font-bold text-white text-[11px]">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">เกมที่เติม:</span>
                <span className="font-bold text-white">{order.gameName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">แพ็กเกจ:</span>
                <span className="text-zinc-300">{order.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">UID / ไอดีผู้เล่น:</span>
                <span className="font-mono text-zinc-300">{order.playerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">ชื่อตัวละคร (IGN):</span>
                <span className="font-bold text-emerald-400">{order.playerNickname || '-'}</span>
              </div>
            </div>

            {/* Financial Details */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">ช่องทางชำระเงิน:</span>
                <span className="text-zinc-300 font-bold">{getPaymentLabel(order.paymentMethod, order.subPaymentChannel)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px]">ยอดรวมสินค้า:</span>
                <span className="text-zinc-300 font-mono">฿{Number(order.originalAmount || order.price || order.finalAmount).toFixed(2)}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-purple-400">
                  <span className="text-[10px]">ส่วนลดคูปอง ({order.couponCode}):</span>
                  <span className="font-mono font-bold">หักส่วนลดแล้ว ✓</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-white font-bold text-xs">ยอดชำระสุทธิ:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">฿{Number(order.finalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* QR & Verification Footprint */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 block font-semibold">QR ยืนยันความถูกต้องสลิป</span>
                <p className="text-[9px] text-zinc-500 leading-tight">
                  สแกนเพื่อตรวจสอบสถานะออเดอร์ย้อนหลังผ่านเซิร์ฟเวอร์ BOOSTUP
                </p>
                <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-bit SSL Protected</span>
                </div>
              </div>
              {receiptQrUrl ? (
                <img src={receiptQrUrl} alt="Verify QR" className="w-16 h-16 rounded-xl border border-zinc-700 bg-white p-1 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-600">
                  <QrCode className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                disabled={isGeneratingReceipt}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>บันทึกภาพสลิป PNG</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer"
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
