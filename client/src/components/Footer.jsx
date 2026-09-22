import React from 'react';
import { ShieldCheck, MessageCircle, Heart, Flame } from 'lucide-react';

export default function Footer({ siteSettings, onOpenPolicy }) {
  return (
    <footer id="contact" className="bg-[#06080c] border-t border-red-950/60 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={siteSettings?.logoUrl || '/boostup_logo.jpg'}
                alt="BOOSTUP"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/boostup_logo.jpg';
                }}
                className="w-11 h-11 rounded-xl object-contain border border-red-500/40 glow-red-sm shadow-md"
              />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black tracking-wider text-white font-['Kanit']">
                    BOOST
                  </span>
                  <span className="text-xl font-black tracking-wider text-red-500 font-['Kanit']">
                    UP
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">ร้านเติมเงินเกม • PLAY MORE GO FURTHER</p>
              </div>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              {siteSettings?.siteSlogan || 'ผู้ให้บริการแพลตฟอร์มเติมเกมออนไลน์ครบวงจรอันดับ 1 ในไทย ระบบอัตโนมัติ 24 ชั่วโมง เสถียร ปลอดภัย เติมไวใน 1-3 วินาที เชื่อมต่อ API ตรงกับผู้ให้บริการชั้นนำ'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>จดทะเบียนพาณิชย์อิเล็กทรอนิกส์ ปลอดภัย 100% ตามมาตรฐาน PDPA</span>
            </div>
          </div>

          {/* Quick Links & Legal Policies (Essential for Ad Approvals) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 font-['Kanit']">เมนูด่วน & ข้อตกลง</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#popular-games" className="hover:text-red-400 transition-colors">เติมเกมยอดนิยม</a></li>
              <li><a href="#step-guide" className="hover:text-red-400 transition-colors">วิธีการเติมเกม</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('terms')}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  ข้อกำหนดและเงื่อนไข (Terms)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  นโยบายความเป็นส่วนตัว (PDPA)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('refund')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  นโยบายการคืนเงิน & รับประกัน
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 font-['Kanit']">ติดต่อฝ่ายบริการลูกค้า</h4>
            <p className="text-xs text-zinc-400 mb-3">ทีมงานพร้อมดูแลและแก้ไขปัญหาตลอด 24 ชั่วโมง</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>LINE: <strong className="text-white">{siteSettings?.contactLine || '@boostup'}</strong></span>
              </div>
              <div>Facebook: <strong className="text-white">{siteSettings?.contactFacebook || 'BoostUpGameStore'}</strong></div>
              <div>Discord: <strong className="text-white">{siteSettings?.contactDiscord || 'discord.gg/boostup'}</strong></div>
            </div>
          </div>

        </div>

        {/* Payment Channels Strip */}
        <div className="py-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-zinc-500">
            รองรับช่องทางการชำระเงินชั้นนำของไทย:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-blue-400">
              🇹🇭 PromptPay QR
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-amber-400">
              TrueMoney Wallet
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-emerald-400">
              K-Bank / SCB
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-cyan-400">
              VISA / Mastercard
            </span>
          </div>
        </div>

        {/* Bottom Copyright & Policy Links */}
        <div className="pt-4 border-t border-zinc-900/80 flex flex-col md:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
          <div>
            © 2026 BOOSTUP ร้านเติมเงินเกม (PLAY MORE GO FURTHER). สงวนลิขสิทธิ์ทุกประการ
          </div>
          <div className="flex flex-wrap items-center gap-3 text-zinc-400">
            <button
              type="button"
              onClick={() => onOpenPolicy && onOpenPolicy('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ข้อกำหนดการใช้บริการ
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenPolicy && onOpenPolicy('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              นโยบายความเป็นส่วนตัว (PDPA)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenPolicy && onOpenPolicy('refund')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              นโยบายการคืนเงิน
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenPolicy && onOpenPolicy('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              เกี่ยวกับเรา
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
