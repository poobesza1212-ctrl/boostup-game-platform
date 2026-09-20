import React, { useState } from 'react';
import { X, Wallet, QrCode, Gift, PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WalletModal({ user, onClose, onDepositSuccess }) {
  const [amount, setAmount] = useState('100');
  const [method, setMethod] = useState('promptpay');
  const [voucherUrl, setVoucherUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const quickAmounts = ['50', '100', '300', '500', '1000', '2000'];

  const handleDeposit = async () => {
    if (!user) return;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ต้องการเติม');
      return;
    }

    setIsProcessing(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: numAmount,
          method
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`เติมเงินเข้ากระเป๋าจำนวน ฿${numAmount.toFixed(2)} สำเร็จเรียบร้อย!`);
        if (onDepositSuccess) onDepositSuccess(data.newBalance);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        alert(data.message || 'เติมเงินไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-950 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-['Kanit']">กระเป๋าเงิน (My Wallet)</h3>
              <p className="text-xs text-zinc-400">ยอดคงเหลือ: <strong className="text-emerald-400 font-['Kanit']">฿{(user?.walletBalance || 0).toFixed(2)}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Amount selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase">จำนวนเงินที่ต้องการเติม (บาท)</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold font-['Kanit'] border transition-all ${
                    amount === amt
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  ฿{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="หรือกรอกจำนวนเงินเอง"
              className="w-full mt-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-red-500 focus:outline-none font-['Kanit']"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase">ช่องทางเติมเงิน</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('promptpay')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  method === 'promptpay'
                    ? 'bg-red-950/60 border-red-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <QrCode className="w-4 h-4 text-blue-400" />
                <div className="text-left text-xs font-bold">PromptPay QR</div>
              </button>
              <button
                type="button"
                onClick={() => setMethod('truemoney')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  method === 'truemoney'
                    ? 'bg-red-950/60 border-red-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <div className="text-left text-xs font-bold">ซอง TrueMoney</div>
              </button>
            </div>
          </div>

          {method === 'truemoney' && (
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">ลิงก์ซองของขวัญ</label>
              <input
                type="text"
                value={voucherUrl}
                onChange={(e) => setVoucherUrl(e.target.value)}
                placeholder="https://gift.truemoney.com/campaign/?v=..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none"
              />
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {isProcessing ? 'กำลังตรวจสอบ...' : `ยืนยันเติมเงิน ฿${amount || 0}`}
          </button>

        </div>

      </div>
    </div>
  );
}
