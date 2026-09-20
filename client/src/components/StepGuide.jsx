import React from 'react';
import { Gamepad2, FileText, CreditCard, CheckCircle2 } from 'lucide-react';

export default function StepGuide() {
  const steps = [
    {
      num: "01",
      icon: <Gamepad2 className="w-7 h-7 text-red-500" />,
      title: "เลือกเกม",
      desc: "เลือกเกมโปรดที่คุณต้องการเติมเงินจากรายการเกมยอดนิยมกว่า 50+ เกม"
    },
    {
      num: "02",
      icon: <FileText className="w-7 h-7 text-red-500" />,
      title: "กรอกข้อมูล",
      desc: "กรอก UID หรือ Riot ID พร้อมกดตรวจสอบชื่อตัวละคร ป้องกันการเติมผิดไอดี 100%"
    },
    {
      num: "03",
      icon: <CreditCard className="w-7 h-7 text-red-500" />,
      title: "ชำระเงิน",
      desc: "เลือกช่องทางที่สะดวก เช่น สแกน PromptPay QR, TrueMoney, หรือโอนธนาคาร"
    },
    {
      num: "04",
      icon: <CheckCircle2 className="w-7 h-7 text-red-500" />,
      title: "รับไอเท็มทันที",
      desc: "ระบบอัตโนมัติส่งไอเท็มหรือเหรียญเข้าเกมทันทีภายใน 1-3 วินาที ไม่ต้องรอคิว"
    }
  ];

  return (
    <section id="step-guide" className="py-16 bg-[#0a0d14] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-red-500 text-xs font-bold uppercase tracking-widest">EASY & FAST TOPUP</span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1">วิธีการเติมเกม</h2>
          <p className="text-zinc-400 text-sm mt-2">ทำรายการง่ายๆ เพียง 4 ขั้นตอน ไอเท็มเข้าไอดีอัตโนมัติทันที 24 ชม.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative p-6 rounded-2xl bg-cyber-card border border-zinc-800/80 hover:border-red-600/60 transition-all duration-300 group"
            >
              {/* Step number watermark */}
              <div className="absolute top-4 right-5 text-4xl font-black text-zinc-800/50 group-hover:text-red-950/80 transition-colors font-['Kanit']">
                {step.num}
              </div>

              <div className="w-14 h-14 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>

              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
