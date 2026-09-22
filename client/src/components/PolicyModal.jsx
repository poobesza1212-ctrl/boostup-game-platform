import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  RotateCcw, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Lock,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';

export default function PolicyModal({ isOpen, onClose, initialTab = 'terms', siteSettings }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const contactLine = siteSettings?.contactLine || '@boostup';
  const contactFacebook = siteSettings?.contactFacebook || 'BoostUpGameStore';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Prompt']">
      <div className="w-full max-w-3xl bg-[#0f131d] text-zinc-200 border border-[#273248] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#202738] bg-[#090c13] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Kanit'] leading-tight">
                นโยบายและข้อกำหนดทางกฎหมาย (Legal & Policies)
              </h2>
              <p className="text-[11px] text-zinc-400">
                มาตรฐานความปลอดภัยและสิทธิประโยชน์ของผู้ใช้บริการ BOOSTUP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#181d2a] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-[#262f44] transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#202738] bg-[#0c1017] px-4 overflow-x-auto custom-scrollbar shrink-0 text-xs font-semibold font-['Kanit']">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ข้อกำหนดและเงื่อนไข</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>นโยบายความเป็นส่วนตัว (PDPA)</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'refund'
                ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>นโยบายการคืนเงิน & รับประกัน</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>เกี่ยวกับเรา & ติดต่อ</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed custom-scrollbar">
          
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-900/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 leading-relaxed">
                  โปรดอ่านข้อกำหนดและเงื่อนไขการใช้บริการนี้อย่างละเอียดก่อนทำรายการสั่งซื้อ การใช้บริการร้านค้า BOOSTUP ถือว่าท่านตกลงและยอมรับข้อกำหนดเหล่านี้ทุกประการ
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">1. ลักษณะของบริการ</h3>
                <p>
                  BOOSTUP เป็นผู้ให้บริการแพลตฟอร์มตัวกลางอำนวยความสะดวกในการเติมเงินเกมออนไลน์ (In-game Currency), จัดจำหน่ายบัตรเติมเงินเกมดิจิทัล (Digital Gift Cards & Vouchers), และการต่ออายุแพ็กเกจสมาชิกแอปพลิเคชัน โดยระบบทำการเชื่อมต่อ API อัตโนมัติกับผู้จัดจำหน่ายชั้นนำเพื่อส่งมอบสินค้าอย่างรวดเร็วตลอด 24 ชั่วโมง
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">2. ความรับผิดชอบต่อข้อมูลตัวละคร (Player UID)</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                  <li>ผู้ใช้บริการมีหน้าที่ตรวจสอบความถูกต้องของ Player ID / UID, Server, และชื่อตัวละครก่อนกดยืนยันชำระเงินทุกครั้ง</li>
                  <li>ระบบมีฟังก์ชันตรวจสอบชื่อตัวละครอัตโนมัติ (IGN Verification) ในเกมที่รองรับเพื่อช่วยยืนยันก่อนชำระเงิน</li>
                  <li>หากผู้ใช้ระบุ UID หรือ Server ผิดพลาดด้วยตนเอง และระบบได้ทำการจัดส่งสินค้าไปยังบัญชีดังกล่าวเรียบร้อยแล้ว ทางร้านไม่สามารถดึงคืนหรือยกเลิกรายการดังกล่าวได้</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">3. ช่องทางการชำระเงิน</h3>
                <p>
                  ทางร้านรองรับการชำระเงินผ่าน พร้อมเพย์ QR Code, ซองของขวัญ TrueMoney, บัญชีธนาคาร และกระเป๋าเงินสมาชิก ทุกธุรกรรมจะได้รับการบันทึกหลักฐานและออกใบเสร็จรับเงินดิจิทัล (Digital E-Receipt) โดยอัตโนมัติ
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">4. ทรัพย์สินทางปัญญา</h3>
                <p>
                  เครื่องหมายการค้า โลโก้ และภาพลิขสิทธิ์ของเกมต่างๆ เช่น Garena ROV, Free Fire, Riot Games Valorant, HoYoverse Genshin Impact, Roblox, Steam เป็นทรัพย์สินทางปัญญาของเจ้าของลิขสิทธิ์นั้นๆ ร้าน BOOSTUP นำมาใช้เพื่ออ้างอิงถึงสินค้าที่ให้บริการเท่านั้น
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY (PDPA) */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200 leading-relaxed">
                  ร้าน BOOSTUP ให้ความสำคัญสูงสุดต่อการรักษาความปลอดภัยของข้อมูลส่วนบุคคล ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                  <li><strong>ข้อมูลคำสั่งซื้อ</strong>: Player ID / UID, เซิร์ฟเวอร์, ประวัติคำสั่งซื้อ, ยอดเงิน และช่องทางชำระเงิน</li>
                  <li><strong>ข้อมูลบัญชีสมาชิก (ถ้ามี)</strong>: ชื่อผู้ใช้, อีเมล, เบอร์โทรศัพท์ และรหัสผ่านที่ถูกเข้ารหัสด้วย SHA-256</li>
                  <li><strong>หลักฐานการชำระเงิน</strong>: สลิปการโอนเงินเพื่อการตรวจสอบความถูกต้องและป้องกันมิจฉาชีพ</li>
                  <li><strong className="text-emerald-400">สำคัญ</strong>: ทางร้าน <u>ไม่มีนโยบายสอบถามรหัสผ่านเกม (Password), รหัสสองชั้น (2FA), หรือ OTP ใดๆ ทั้งสิ้น</u> ในการเติมเกมผ่าน UID</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">2. วัตถุประสงค์ในการนำข้อมูลไปใช้</h3>
                <p>
                  ข้อมูลของท่านจะถูกนำไปใช้เพื่อ: (1) ดำเนินการเติมเงินเกมและจัดส่งสินค้าดิจิทัล, (2) ตรวจสอบความถูกต้องของยอดชำระเงิน, (3) อำนวยความสะดวกในการตรวจสอบประวัติคำสั่งซื้อย้อนหลัง และ (4) พัฒนาระบบเพื่อความปลอดภัยสูงสุด
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">3. มาตรการรักษาความปลอดภัยของข้อมูล</h3>
                <p>
                  ข้อมูลทั้งหมดได้รับการปกป้องด้วยการเข้ารหัส SSL/TLS 256-bit ข้อมูลรหัสผ่านถูกแฮชระดับสากล ไม่สามารถถอดรหัสย้อนกลับได้ และจัดเก็บในโครงสร้าง Cloud Database ที่ได้มาตรฐานความปลอดภัยสากล
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: REFUND & WARRANTY POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200 leading-relaxed">
                  BOOSTUP รับประกันความพึงพอใจ 100% หากสินค้าไม่เข้าตามเงื่อนไขที่กำหนด ท่านมีสิทธิ์ได้รับเงินคืนเต็มจำนวน
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">1. เงื่อนไขการรับประกันและคืนเงิน (Full Refund Guarantee)</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                  <li><strong>ยอดเงินไม่เข้าภายใน 10 นาที</strong>: หากท่านชำระเงินสำเร็จ แต่ระบบเกิดข้อขัดข้องทางเทคนิคและสินค้าไม่เข้าเกม สามารถแจ้งแอดมินเพื่อขอรับเงินคืนเต็มจำนวน หรือให้แอดมินดำเนินการส่งสินค้าให้ทันที</li>
                  <li><strong>สินค้าหมดหรือผู้ให้บริการปิดปรับปรุง</strong>: หากแพ็กเกจที่สั่งซื้อไม่สามารถจัดส่งได้เนื่องจากระบบต้นทางปิดปรับปรุง ทางร้านจะทำการคืนเงินเข้ากระเป๋าเงินสมาชิก หรือโอนเงินคืนเข้าบัญชีเดิมของท่าน 100%</li>
                  <li><strong>บัตรดิจิทัลมีปัญหา</strong>: บัตรเติมเงินดิจิทัล (Gift Card) ทุกใบได้รับการรับประกันการใช้งาน หากพบรหัสไม่ถูกต้อง สามารถแจ้งเคลมเปลี่ยนรหัสใหม่ได้ทันที</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">2. กรณีที่ไม่สามารถขอคืนเงินได้</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                  <li>ลูกค้ากรอก UID หรือเลือกเซิร์ฟเวอร์ผิดพลาดด้วยตนเอง และระบบได้ทำการจัดส่งสินค้าไปยังบัญชีนั้นสำเร็จเรียบร้อยแล้ว</li>
                  <li>บัตรดิจิทัลที่ถูกเปิดดูรหัสหรือนำไปใช้งาน (Redeemed) สำเร็จเรียบร้อยแล้ว</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">3. ขั้นตอนการแจ้งขอคืนเงิน</h3>
                <p>
                  เพียงเตรียมเลขที่ใบสั่งซื้อ (Order Number เช่น BST-XXXXX) พร้อมหลักฐานการชำระเงิน และติดต่อฝ่ายบริการลูกค้าผ่าน LINE: <strong className="text-white">{contactLine}</strong> หรือแชทสดบนหน้าเว็บ เจ้าหน้าที่จะตรวจสอบและดำเนินการคืนเงินให้ภายใน 15-30 นาที
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: ABOUT US & CONTACT */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-['Kanit']">เกี่ยวกับ BOOSTUP (About Us)</h3>
                <p>
                  BOOSTUP ร้านเติมเงินเกม (PLAY MORE GO FURTHER) ดำเนินงานโดยทีมงานผู้เชี่ยวชาญด้านระบบเกมเมอร์และฟินเทค ให้บริการเติมเงินเกมและสินค้าดิจิทัลครบวงจรด้วยระบบอัตโนมัติความเร็วสูง ได้รับความไว้วางใจจากผู้เล่นทั่วประเทศกว่า 2,500,000+ ออเดอร์
                </p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#161c28] border border-[#273248] space-y-1">
                  <div className="text-xs text-zinc-400 font-semibold">ช่องทางติดต่อหลัก (24 ชม.)</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>LINE: {contactLine}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#161c28] border border-[#273248] space-y-1">
                  <div className="text-xs text-zinc-400 font-semibold">Facebook Fanpage</div>
                  <div className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    <span>{contactFacebook}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121622] border border-[#202738] space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>การรับรองความถูกต้องของร้านค้า</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  ร้านค้ามีการจดทะเบียนพาณิชย์อิเล็กทรอนิกส์อย่างถูกต้อง ระบบเชื่อมต่อ API ผ่านเกตเวย์มาตรฐานความปลอดภัยระดับสูงของธนาคารในประเทศไทย ปลอดภัย ไร้กังวล 100%
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#202738] bg-[#090c13] flex items-center justify-between shrink-0 text-xs">
          <span className="text-zinc-500">
            อัปเดตล่าสุด: กันยายน 2569 (Official Terms v2.4)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/30 cursor-pointer"
          >
            เข้าใจและปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
