import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCw, 
  Coins, 
  CalendarCheck, 
  Gift, 
  Sparkles, 
  Trophy, 
  Ticket, 
  Wallet, 
  Check, 
  Flame, 
  AlertCircle 
} from 'lucide-react';
import Swal from '../utils/swal';

export default function LuckyWheelModal({ isOpen, onClose, user, onUpdateUser, onOpenLogin }) {
  const [prizes, setPrizes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [checkinStreak, setCheckinStreak] = useState(user?.checkinStreak || 0);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const canvasRef = useRef(null);

  // Fetch prizes on open
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/wheel/prizes')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.prizes) {
          setPrizes(data.prizes);
        }
      })
      .catch(err => console.error("Error fetching prizes:", err));

    // Check if user already checked in today
    if (user?.lastDailyCheckin) {
      const today = new Date().toISOString().slice(0, 10);
      const last = user.lastDailyCheckin.slice(0, 10);
      setIsCheckedInToday(last === today);
      setCheckinStreak(user.checkinStreak || 0);
    } else {
      setIsCheckedInToday(false);
      setCheckinStreak(0);
    }
  }, [isOpen, user]);

  // Draw Canvas Wheel
  useEffect(() => {
    if (!canvasRef.current || prizes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const numSlices = prizes.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color || (i % 2 === 0 ? '#b91c1c' : '#1e1b4b');
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Kanit, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(prize.name, radius - 24, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
  }, [prizes]);

  if (!isOpen) return null;

  // Handle Wheel Spin
  const handleSpin = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }

    if (isSpinning) return;

    const tickets = user.spinTickets || 0;
    const points = user.points || 0;

    if (tickets <= 0 && points < 20) {
      Swal.fire({
        icon: 'warning',
        title: 'สิทธิ์หมุนไม่เพียงพอ',
        text: 'คุณต้องมีตั๋วหมุนฟรี หรือ 20 พอยท์ เพื่อหมุนวงล้อ 1 ครั้ง (สามารถเช็คชื่อรายวันเพื่อรับพอยท์และตั๋วฟรีได้ครับ)',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setIsSpinning(true);

    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();

      if (!data.success) {
        setIsSpinning(false);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถหมุนได้',
          text: data.message,
          confirmButtonColor: '#dc2626'
        });
        return;
      }

      // Calculate rotation target
      const sliceDeg = 360 / prizes.length;
      const targetIndex = data.prizeIndex >= 0 ? data.prizeIndex : 0;
      // In canvas, 0 deg points right (3 o'clock). The top pointer is at 270 deg (12 o'clock).
      // Angle to stop at pointer = 270 - (targetIndex * sliceDeg + sliceDeg / 2)
      const stopAtDeg = (270 - (targetIndex * sliceDeg + sliceDeg / 2) + 360) % 360;
      const fullRotations = 360 * 6; // 6 full spins
      const currentMod = rotationAngle % 360;
      const targetRotation = rotationAngle + (360 - currentMod) + fullRotations + stopAtDeg;

      setRotationAngle(targetRotation);

      // Wait for spin animation (4 seconds)
      setTimeout(() => {
        setIsSpinning(false);
        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            spinTickets: data.remainingTickets,
            points: data.newPoints,
            walletBalance: data.newBalance
          });
        }

        Swal.fire({
          icon: data.prize.type === 'none' ? 'info' : 'success',
          title: data.prize.name,
          text: data.prizeMessage,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#10b981'
        });
      }, 4200);

    } catch (err) {
      setIsSpinning(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Handle Daily Check-in
  const handleDailyCheckin = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }

    if (isCheckedInToday || isCheckingIn) return;

    setIsCheckingIn(true);
    try {
      const res = await fetch('/api/user/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();

      if (data.success) {
        setIsCheckedInToday(true);
        setCheckinStreak(data.streak);
        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            points: data.newPoints,
            spinTickets: data.newTickets,
            checkinStreak: data.streak,
            lastDailyCheckin: new Date().toISOString()
          });
        }

        Swal.fire({
          icon: 'success',
          title: 'เช็คชื่อสำเร็จ!',
          text: data.message,
          confirmButtonColor: '#10b981'
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'เช็คชื่อแล้ว',
          text: data.message,
          confirmButtonColor: '#3b82f6'
        });
        if (data.alreadyCheckedIn) {
          setIsCheckedInToday(true);
        }
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเช็คชื่อได้ในขณะนี้',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const streakDays = [
    { day: 1, pts: 10, bonus: '' },
    { day: 2, pts: 15, bonus: '' },
    { day: 3, pts: 20, bonus: '' },
    { day: 4, pts: 25, bonus: '' },
    { day: 5, pts: 30, bonus: '' },
    { day: 6, pts: 40, bonus: '' },
    { day: 7, pts: 50, bonus: '+1 ตั๋วหมุน' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#181126] via-[#0f0c1b] to-black border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-red-950/60 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Kanit'] flex items-center gap-2">
                วงล้อเสี่ยงโชค & เช็คชื่อรายวัน
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  สิทธิ์ฟรีทุกวัน
                </span>
              </h2>
              <p className="text-xs text-zinc-400">หมุนรับเครดิตฟรี พอยท์สะสม และรางวัลใหญ่ 100 บาท!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* User Status Bar */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Ticket className="w-4 h-4" />
                <span>ตั๋วหมุนฟรี: <strong className="text-white text-sm">{user?.spinTickets || 0}</strong> ใบ</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Coins className="w-4 h-4" />
                <span>พอยท์สะสม: <strong className="text-white text-sm">{user?.points || 0}</strong> P</span>
              </div>
            </div>
            <div className="text-zinc-400 text-[11px] hidden sm:block">
              (หากไม่มีตั๋ว ใช้ 20 พอยท์ / ครั้ง)
            </div>
          </div>

          {/* Lucky Wheel Canvas Container */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
              {/* Top Pointer */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.7)]" />

              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] pointer-events-none" />

              {/* Canvas Wheel */}
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
                }}
                className="rounded-full shadow-2xl"
              />

              {/* Center Spin Button Badge */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-amber-600/50 flex flex-col items-center justify-center border-2 border-amber-300 disabled:opacity-75 transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>SPIN</span>
              </button>
            </div>

            {/* Spin CTA Button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 hover:from-amber-400 hover:to-red-500 text-black font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 mx-auto font-['Kanit']"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'กำลังหมุนวงล้อ...' : (user?.spinTickets > 0 ? `หมุนฟรีทันที (${user.spinTickets} สิทธิ์)` : 'หมุนเลย (ใช้ 20 พอยท์)')}
              </button>
            </div>
          </div>

          {/* Daily Check-in Streak Section */}
          <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit']">เช็คชื่อรายวัน (Daily Streak)</h3>
                  <p className="text-[11px] text-zinc-400">เช็คชื่อต่อเนื่อง 7 วันเพื่อรับรางวัลใหญ่ + ตั๋วหมุนวงล้อฟรี!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400">
                  ต่อเนื่อง: <strong className="text-white text-sm">{checkinStreak}</strong> / 7 วัน
                </span>
              </div>
            </div>

            {/* Streak Days Bar */}
            <div className="grid grid-cols-7 gap-1.5">
              {streakDays.map((item) => {
                const isPassed = checkinStreak >= item.day;
                const isCurrent = checkinStreak + 1 === item.day && !isCheckedInToday;
                return (
                  <div 
                    key={item.day}
                    className={`p-2 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                      isPassed 
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                        : isCurrent 
                          ? 'bg-amber-950/50 border-amber-500/70 text-amber-300 animate-pulse' 
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold">วันที่ {item.day}</span>
                    <div className="my-1">
                      {isPassed ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <Coins className={`w-5 h-5 mx-auto ${isCurrent ? 'text-amber-400' : 'text-zinc-600'}`} />
                      )}
                    </div>
                    <span className="text-[10px] font-black">+{item.pts}P</span>
                    {item.bonus && (
                      <span className="text-[8px] bg-red-600/40 text-red-300 px-1 rounded mt-0.5 font-semibold leading-tight">
                        {item.bonus}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Check-in CTA Button */}
            <button
              type="button"
              onClick={handleDailyCheckin}
              disabled={isCheckedInToday || isCheckingIn}
              className={`w-full py-3 rounded-2xl font-black text-xs font-['Kanit'] flex items-center justify-center gap-2 transition-all ${
                isCheckedInToday 
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 active:scale-98'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              {isCheckedInToday ? '✓ คุณได้เช็คชื่อของวันนี้แล้ว (กลับมาใหม่พรุ่งนี้นะครับ)' : (isCheckingIn ? 'กำลังเช็คชื่อ...' : 'กดรับพอยท์ & เช็คชื่อวันนี้เลย!')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
