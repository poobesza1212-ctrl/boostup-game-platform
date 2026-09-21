import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  QrCode, 
  Gift, 
  Building2, 
  CheckCircle2, 
  ArrowLeft, 
  Upload, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function WalletModal({ user, siteSettings, onClose, onDepositSuccess }) {
  const [step, setStep] = useState('select'); // 'select' | 'pay'
  const [amount, setAmount] = useState('100');
  const [method, setMethod] = useState('bank_transfer'); // 'bank_transfer' | 'promptpay' | 'truemoney'
  const [voucherUrl, setVoucherUrl] = useState('');
  const [slipImage, setSlipImage] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [qrData, setQrData] = useState(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [pendingDetails, setPendingDetails] = useState(null);

  const quickAmounts = ['50', '100', '300', '500', '1000', '2000'];
  const activeBankAccounts = siteSettings?.bankAccounts?.filter(b => b.isActive) || [];

  const isDepositChannelEnabled = (channelId) => {
    if (!siteSettings || !siteSettings.paymentMethods) return true;
    return siteSettings.paymentMethods[channelId]?.enabled !== false;
  };

  const availableDepositMethods = [
    {
      id: 'bank_transfer',
      name: 'โอนธนาคาร',
      desc: 'แนบสลิป',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'promptpay',
      name: 'พร้อมเพย์ QR',
      desc: 'สแกนจ่าย',
      icon: <QrCode className="w-5 h-5 text-blue-400" />
    },
    {
      id: 'truemoney',
      name: 'ซองทรูมันนี่',
      desc: 'อั่งเปา',
      icon: <Gift className="w-5 h-5 text-amber-400" />
    }
  ].filter(m => isDepositChannelEnabled(m.id));

  // Auto-switch method if current is disabled
  useEffect(() => {
    if (availableDepositMethods.length > 0 && !availableDepositMethods.some(m => m.id === method)) {
      setMethod(availableDepositMethods[0].id);
    }
  }, [availableDepositMethods, method]);

  // When switching to pay step with PromptPay, generate QR
  const handleProceedToPay = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    setErrorMsg('');
    setStep('pay');

    if (method === 'promptpay') {
      setIsGeneratingQr(true);
      try {
        const res = await fetch('/api/payments/promptpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numAmount })
        });
        const data = await res.json();
        if (data.success) {
          setQrData(data);
        } else {
          setErrorMsg(data.message || 'ไม่สามารถสร้าง QR พร้อมเพย์ได้ในขณะนี้');
        }
      } catch (err) {
        setErrorMsg('เกิดข้อผิดพลาดในการโหลด QR พร้อมเพย์');
      } finally {
        setIsGeneratingQr(false);
      }
    }
  };

  // Handle Slip File Selection
  const handleSlipChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSlipImage(reader.result);
      setSlipPreview(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  // Submit Deposit with Proof
  const handleConfirmDeposit = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่ต้องการเติม');
      return;
    }

    // Strict validation: Require actual payment proof!
    if (method === 'bank_transfer' || method === 'promptpay') {
      if (!slipImage) {
        setErrorMsg('กรุณาแนบรูปสลิปหลักฐานการโอนเงินเพื่อยืนยันรายการ');
        return;
      }
    } else if (method === 'truemoney') {
      if (!voucherUrl.trim()) {
        setErrorMsg('กรุณากรอกลิงก์ซองของขวัญ TrueMoney');
        return;
      }
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: numAmount,
          method,
          slipImage: slipImage || null,
          voucherUrl: voucherUrl.trim() || null
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.status === 'pending') {
          // Deposit requires Admin Slip Approval!
          setIsPendingApproval(true);
          setPendingDetails({
            amount: numAmount,
            method,
            txnId: data.transaction?.id
          });
        } else {
          setSuccessMsg(`เติมเงินเข้ากระเป๋าจำนวน ฿${numAmount.toFixed(2)} สำเร็จเรียบร้อย!`);
          if (onDepositSuccess) onDepositSuccess(data.newBalance);
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } else {
        setErrorMsg(data.message || 'การเติมเงินไม่สำเร็จ');
      }
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white font-['Kanit']">เติมเงินเข้ากระเป๋า (Deposit Wallet)</h3>
              <p className="text-xs text-zinc-400">
                ยอดคงเหลือปัจจุบัน: <strong className="text-emerald-400 font-['Kanit']">฿{(user?.walletBalance || 0).toFixed(2)}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {isPendingApproval ? (
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Clock className="w-3.5 h-3.5" /> อยู่ระหว่างรอแอดมินตรวจสอบสลิป
                </div>
                <h4 className="text-lg font-black text-white font-['Kanit']">แจ้งโอนเงินเรียบร้อยแล้ว!</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  ระบบได้รับหลักฐานการโอนเงินจำนวน <strong className="text-emerald-400 font-['Kanit']">฿{Number(pendingDetails?.amount || amount).toFixed(2)}</strong> เรียบร้อยแล้ว ขณะนี้เจ้าหน้าที่กำลังตรวจสอบความถูกต้อง และจะเติมยอดเงินเข้ากระเป๋าของคุณภายใน 1-3 นาที
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>รหัสธุรกรรม:</span>
                  <span className="text-white font-mono text-[11px]">{pendingDetails?.txnId || '-'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>ยอดเงินที่แจ้งโอน:</span>
                  <span className="text-emerald-400 font-bold font-['Kanit'] text-sm">฿{Number(pendingDetails?.amount || amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>ช่องทาง:</span>
                  <span className="text-white">{pendingDetails?.method === 'promptpay' ? 'QR พร้อมเพย์' : 'โอนผ่านบัญชีธนาคาร'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>สถานะปัจจุบัน:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> รอการอนุมัติ (Pending)
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  รับทราบและปิดหน้าต่าง
                </button>
                <p className="text-[11px] text-zinc-500">
                  หากยอดเงินไม่เข้าภายใน 5 นาที สามารถติดต่อแอดมินผ่านปุ่ม "แชทสด" ที่มุมขวาล่างได้ตลอด 24 ชม.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Amount & Method */}
              {step === 'select' && (
            <div className="space-y-5">
              
              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase flex items-center justify-between">
                  <span>1. เลือกจำนวนเงินที่ต้องการเติม (บาท)</span>
                  <span className="text-[11px] text-zinc-400">ขั้นต่ำ ฿10</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-2.5 rounded-xl text-xs font-bold font-['Kanit'] border transition-all ${
                        amount === amt
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30 scale-[1.02]'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      ฿{amt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="หรือพิมพ์ระบุจำนวนเงินเอง"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-red-500 focus:outline-none font-['Kanit']"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-bold">บาท</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase">2. เลือกช่องทางการชำระเงิน</label>
                <div className={`grid gap-2 ${
                  availableDepositMethods.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {availableDepositMethods.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        method === m.id
                          ? 'bg-red-950/60 border-red-500 text-white shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {m.icon}
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className="text-[10px] text-zinc-400">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {availableDepositMethods.length === 0 && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-center text-xs text-red-300">
                    ขณะนี้ทุกช่องทางการเติมเงินปิดปรับปรุงชั่วคราว
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Proceed Button */}
              <button
                type="button"
                onClick={handleProceedToPay}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>ดำเนินการชำระเงิน ฿{Number(amount || 0).toFixed(2)}</span>
                <span>→</span>
              </button>

            </div>
          )}

          {/* STEP 2: Actual Payment & Slip Upload */}
          {step === 'pay' && (
            <div className="space-y-4">
              
              {/* Back to Step 1 & Summary */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setStep('select'); setErrorMsg(''); }}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>เปลี่ยนยอดเงิน / ช่องทาง</span>
                </button>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400">ยอดที่ต้องชำระ</div>
                  <div className="text-lg font-black text-emerald-400 font-['Kanit']">
                    ฿{Number(amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Option A: Bank Transfer */}
              {method === 'bank_transfer' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>ข้อมูลบัญชีธนาคารสำหรับโอนเงิน</span>
                  </div>

                  {activeBankAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {activeBankAccounts.map((bank) => (
                        <div
                          key={bank.id}
                          className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{bank.bankName}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(bank.accountNo, bank.id)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              {copiedBankId === bank.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>คัดลอกเลขบัญชี</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-base font-black text-emerald-400 font-mono tracking-wider">
                            {bank.accountNo}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            ชื่อบัญชี: <strong className="text-zinc-200">{bank.accountName}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>ยังไม่ได้ระบุข้อมูลบัญชีธนาคาร</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        ขณะนี้ร้านค้ายังไม่ได้ระบุบัญชีธนาคารในระบบ (แอดมินสามารถเพิ่มได้ในระบบหลังบ้าน /admin) หรือท่านสามารถเลือกชำระผ่าน PromptPay QR ได้ครับ
                      </p>
                    </div>
                  )}

                  {/* Slip Upload Box */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>แนบสลิปหลักฐานการโอนเงิน *</span>
                      <span className="text-[10px] text-zinc-400">ไฟล์รูปภาพเท่านั้น</span>
                    </label>

                    {slipPreview ? (
                      <div className="relative p-3 rounded-2xl bg-zinc-900 border border-emerald-600/60 flex items-center gap-3">
                        <img
                          src={slipPreview}
                          alt="Slip Preview"
                          className="w-16 h-20 object-cover rounded-xl border border-zinc-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>แนบสลิปเรียบร้อยแล้ว</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">พร้อมตรวจสอบยอดเงิน ฿{Number(amount).toFixed(2)}</p>
                          <label className="inline-block mt-2 text-[10px] text-red-400 hover:underline cursor-pointer">
                            เปลี่ยนรูปสลิปใหม่
                            <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900">
                        <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                        <span className="text-xs font-bold text-zinc-300">คลิกเพื่อเลือกรูปสลิปจากเครื่อง</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">รองรับไฟล์ JPG, PNG</span>
                        <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Option B: PromptPay QR */}
              {method === 'promptpay' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    <span>สแกน QR Code พร้อมเพย์เพื่อชำระเงิน</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center">
                    {isGeneratingQr ? (
                      <div className="py-8 text-xs text-zinc-400 animate-pulse">กำลังสร้าง QR Code พร้อมเพย์...</div>
                    ) : qrData?.qrDataUrl ? (
                      <div className="space-y-3">
                        <div className="p-2.5 bg-white rounded-2xl inline-block shadow-lg">
                          <img src={qrData.qrDataUrl} alt="PromptPay QR" className="w-48 h-48 mx-auto" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">ยอดโอนเป๊ะ: <span className="text-emerald-400 font-mono text-base">฿{Number(amount).toFixed(2)}</span></div>
                          {qrData.accountName && (
                            <div className="text-[11px] text-zinc-400 mt-0.5">ชื่อบัญชี: {qrData.accountName}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-xs text-zinc-400">ไม่สามารถแสดง QR Code ได้</div>
                    )}
                  </div>

                  {/* Slip Upload for PromptPay */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-white">แนบสลิปการสแกนจ่าย PromptPay *</label>
                    {slipPreview ? (
                      <div className="relative p-3 rounded-2xl bg-zinc-900 border border-emerald-600/60 flex items-center gap-3">
                        <img
                          src={slipPreview}
                          alt="Slip Preview"
                          className="w-16 h-20 object-cover rounded-xl border border-zinc-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>แนบสลิปเรียบร้อยแล้ว</span>
                          </div>
                          <label className="inline-block mt-2 text-[10px] text-red-400 hover:underline cursor-pointer">
                            เปลี่ยนรูปสลิปใหม่
                            <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900">
                        <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                        <span className="text-xs font-bold text-zinc-300">คลิกเพื่อแนบสลิปที่โอนจากแอปธนาคาร</span>
                        <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Option C: TrueMoney Voucher */}
              {method === 'truemoney' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>กรอกลิงก์ซองของขวัญ TrueMoney Wallet</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-600/40 space-y-2">
                    <div className="text-xs font-semibold text-amber-300">
                      สร้างซองของขวัญมูลค่า ฿{Number(amount).toFixed(2)} บาท แล้วนำลิงก์มาวาง
                    </div>
                    <input
                      type="text"
                      value={voucherUrl}
                      onChange={(e) => setVoucherUrl(e.target.value)}
                      placeholder="https://gift.truemoney.com/campaign/?v=..."
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      *วิธีสร้าง: เข้าแอป TrueMoney &rarr; กด "ส่งของขวัญ" &rarr; ใส่จำนวนเงินเท่ากับยอดชำระ &rarr; เลือกแบ่งเท่ากัน 1 คน &rarr; คัดลอกลิงก์มาวาง
                    </p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Payment Confirmation */}
              <button
                type="button"
                onClick={handleConfirmDeposit}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>กำลังตรวจสอบข้อมูล...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>แจ้งโอนเงินและยืนยันการเติมเงิน ฿{Number(amount || 0).toFixed(2)}</span>
                  </>
                )}
              </button>

            </div>
          )}

            </>
          )}

        </div>

      </div>
    </div>
  );
}
