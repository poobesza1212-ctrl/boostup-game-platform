import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, ShieldCheck, Clock } from 'lucide-react';

export default function FloatingSupport({ contactLine = '@boostup' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Support Popup Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-[#0e121a] border border-emerald-600/60 rounded-2xl shadow-2xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">ฝ่ายบริการลูกค้า 24 ชม.</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            มีข้อสงสัยเกี่ยวกับรายการเติมเกม แจ้งปัญหาการชำระเงิน หรือต้องการความช่วยเหลือ ติดต่อแอดมินได้ตลอด 24 ชั่วโมงครับ
          </p>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-emerald-300">
            <span>LINE Official ID:</span>
            <strong className="text-white font-mono">{contactLine}</strong>
          </div>

          <a
            href={`https://line.me/R/ti/p/${contactLine}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-lg shadow-[#06c755]/20 transition-all"
          >
            <span>ทักแชท LINE OA ตอนนี้</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-xs shadow-2xl shadow-[#06c755]/40 transition-all duration-300 hover:scale-105"
        aria-label="Contact Customer Support"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="font-['Kanit'] tracking-wide">ติดต่อเรา 24 ชม.</span>
      </button>

    </div>
  );
}
