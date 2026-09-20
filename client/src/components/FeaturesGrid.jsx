import React from 'react';
import { 
  Zap, 
  GitFork, 
  Gamepad2, 
  UserCheck, 
  CreditCard, 
  BadgePercent, 
  LineChart, 
  Settings 
} from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-red-500" />,
      title: "ระบบเติมเกมอัตโนมัติ 24 ชม.",
      desc: "สั่งซื้อเสร็จ ระบบยิง API เข้าเกมทันที ไม่ต้องรอแอดมินตอบแชท"
    },
    {
      icon: <GitFork className="w-8 h-8 text-red-500" />,
      title: "เชื่อมต่อ API หลายค่ายเกม",
      desc: "สลับผู้ให้บริการอัตโนมัติ (Failover) เมื่อยอดเงินหมดหรือ API ค่ายหลักหน่วง"
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-red-500" />,
      title: "รองรับหลายเกมยอดนิยม",
      desc: "ROV, Free Fire, PUBG Mobile, Valorant, HoK, Genshin และอื่นๆ อีกมากมาย"
    },
    {
      icon: <UserCheck className="w-8 h-8 text-red-500" />,
      title: "ระบบสมาชิกและสะสมแต้ม",
      desc: "ยิ่งเติมยิ่งได้แต้ม อัปเกรดระดับ VIP รับส่วนลดราคาพิเศษอัตโนมัติ"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-red-500" />,
      title: "รองรับหลายช่องทางการชำระเงิน",
      desc: "สแกน PromptPay QR Code, TrueMoney Wallet, โอนธนาคาร, บัตรเครดิต"
    },
    {
      icon: <BadgePercent className="w-8 h-8 text-red-500" />,
      title: "โปรโมชั่นและโค้ดส่วนลด",
      desc: "ตั้งค่าคูปองลดเปอร์เซ็นต์ / ลดเป็นบาท กำหนดยอดขั้นต่ำและสิทธิ์การใช้ได้ตามใจ"
    },
    {
      icon: <LineChart className="w-8 h-8 text-red-500" />,
      title: "รายงานและสถิติแบบเรียลไทม์",
      desc: "สรุปยอดขายรายวัน กำไรสุทธิ สถิติการชำระเงิน และเกมขายดีแบบเรียลไทม์"
    },
    {
      icon: <Settings className="w-8 h-8 text-red-500" />,
      title: "จัดการง่ายผ่านหลังบ้าน",
      desc: "Dashboard จัดการคำสั่งซื้อ ปรับแต่งราคาเกม และควบคุมระบบได้เพียงคลิกเดียว"
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#080a0f] border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-red-500 text-xs font-bold uppercase tracking-widest">WHY CHOOSE US</span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1">
            ฟีเจอร์จัดเต็ม เพื่อธุรกิจเติมเกมของคุณ
          </h2>
          <p className="text-zinc-400 text-sm mt-2">
            แพลตฟอร์มเติมเกมมาตรฐานสากล ออกแบบมาเพื่อเพิ่มยอดขายและความพึงพอใจสูงสุดของลูกค้า
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-cyber-card border border-red-950/40 hover:border-red-600/70 hover:shadow-lg hover:shadow-red-600/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-950/60 to-black border border-red-900/50 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-red-600 transition-all">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Banner CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-red-950 via-zinc-900 to-black border border-red-800/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-2xl font-black text-white">สร้างรายได้ 24 ชม. ด้วยระบบเติมเกมมืออาชีพ</h3>
            <p className="text-zinc-400 text-sm mt-1">พร้อมระบบหลังบ้าน Dashboard จัดการคำสั่งซื้อได้อย่างมีประสิทธิภาพ</p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="#popular-games"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all text-center"
            >
              ทดลองเติมเกมตอนนี้
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
