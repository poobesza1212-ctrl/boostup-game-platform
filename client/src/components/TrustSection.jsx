import React from 'react';
import { ShieldCheck, Zap, Lock, Users, Award, CheckCircle2 } from 'lucide-react';

const iconMap = {
  ShieldCheck: <ShieldCheck className="w-8 h-8 text-red-500" />,
  Zap: <Zap className="w-8 h-8 text-amber-400" />,
  Lock: <Lock className="w-8 h-8 text-emerald-400" />,
  Users: <Users className="w-8 h-8 text-blue-400" />,
  Award: <Award className="w-8 h-8 text-amber-500" />
};

export default function TrustSection({ siteSettings }) {
  const defaultPoints = [
    {
      icon: "ShieldCheck",
      title: "จดทะเบียนบริษัทถูกต้องตามกฎหมาย",
      desc: "ดำเนินงานโดย บริษัท บูสต์อัพ (BOOSTUP THAILAND) จำกัด มั่นใจได้ 100% ปลอดภัย มีเอกสารรับรองชัดเจน"
    },
    {
      icon: "Zap",
      title: "ระบบเติมเงินอัตโนมัติ 24 ชม.",
      desc: "สั่งซื้อเสร็จ ระบบยิง API เติมเข้าเกมทันทีเฉลี่ยใน 1-3 วินาที ไม่ต้องรอแอดมินตอบแชท"
    },
    {
      icon: "Lock",
      title: "ปลอดภัย เติมผ่าน UID เท่านั้น",
      desc: "ไม่ขอรหัสผ่าน ไม่เข้าไอดีของคุณ ป้องกันความเสี่ยงไอดีโดนแฮกหรือถูกระงับ 100%"
    },
    {
      icon: "Users",
      title: "ไว้วางใจกว่า 1,000,000+ รายการ",
      desc: "ได้รับความไว้วางใจจากเหล่าโปรเพลเยอร์ สตรีมเมอร์ และเกมเมอร์ทั่วประเทศอย่างต่อเนื่อง"
    }
  ];

  const points = siteSettings?.trustPoints && siteSettings.trustPoints.length > 0 
    ? siteSettings.trustPoints 
    : defaultPoints;

  return (
    <section className="py-16 bg-[#07090e] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-red-500 text-xs font-bold uppercase tracking-widest">
            TRUST & SECURITY GUARANTEED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Kanit'] mt-1">
            ทำไมเกมเมอร์จึงเลือกเติมเกมกับเรา?
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2">
            มาตรฐานการให้บริการระดับพรีเมียม รวดเร็ว ปลอดภัย และคุ้มค่าที่สุดในทุกธุรกรรม
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, idx) => (
            <div
              key={pt.id || idx}
              className="p-6 rounded-2xl bg-cyber-card border border-zinc-800/80 hover:border-red-600/60 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {iconMap[pt.icon] || <ShieldCheck className="w-8 h-8 text-red-500" />}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 group-hover:text-red-400 transition-colors font-['Kanit']">
                {pt.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {pt.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
