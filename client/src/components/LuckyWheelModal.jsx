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
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Swal from '../utils/swal';

// Sound Synthesis using Web Audio API (100% offline, zero external dependencies)
const playTickSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.038);
  } catch (e) {}
};

const playFanfareSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = ctx.currentTime + idx * 0.08;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  } catch (e) {}
};

export default function LuckyWheelModal({ isOpen, onClose, user, onUpdateUser, onOpenLogin }) {
  const [prizes, setPrizes] = useState([]);
  const [settings, setSettings] = useState({ pointsPerSpin: 20, enabled: true });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [checkinStreak, setCheckinStreak] = useState(user?.checkinStreak || 0);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [wonPrizeModal, setWonPrizeModal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flapperRecoil, setFlapperRecoil] = useState(false);

  const canvasRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // Fetch prizes on open
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/wheel/prizes')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.prizes) {
          setPrizes(data.prizes.filter(p => p.enabled !== false));
          if (data.settings) setSettings(data.settings);
        }
      })
      .catch(err => console.error("Error fetching prizes:", err));

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

  // Clean up sound intervals on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Draw High-End Cyber Casino Wheel on Canvas
  useEffect(() => {
    if (!canvasRef.current || prizes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const numSlices = prizes.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerBezelRadius = centerX - 6;
    const rimRadius = outerBezelRadius - 12;
    const wheelRadius = rimRadius - 4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Outer Metallic Bezel Ring
    const bezelGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bezelGrad.addColorStop(0, '#f59e0b');
    bezelGrad.addColorStop(0.3, '#d97706');
    bezelGrad.addColorStop(0.5, '#fef08a');
    bezelGrad.addColorStop(0.7, '#b45309');
    bezelGrad.addColorStop(1, '#f59e0b');

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerBezelRadius, 0, 2 * Math.PI);
    ctx.fillStyle = bezelGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Dark Ring with LED Lights
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerBezelRadius - 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f0a1c';
    ctx.fill();

    // 20 Glowing LED Lights around the Rim
    const numLeds = 20;
    for (let l = 0; l < numLeds; l++) {
      const ledAngle = (l * 2 * Math.PI) / numLeds;
      const ledX = centerX + Math.cos(ledAngle) * (outerBezelRadius - 8);
      const ledY = centerY + Math.sin(ledAngle) * (outerBezelRadius - 8);

      ctx.beginPath();
      ctx.arc(ledX, ledY, 3.5, 0, 2 * Math.PI);
      const isAlt = l % 2 === 0;
      ctx.fillStyle = isAlt ? '#fef08a' : '#38bdf8';
      ctx.shadowColor = isAlt ? '#f59e0b' : '#0284c7';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 3. Draw Slices
    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      // Premium Slice Gradients
      const sliceGrad = ctx.createRadialGradient(
        centerX, centerY, 30,
        centerX + Math.cos(startAngle + sliceAngle / 2) * wheelRadius,
        centerY + Math.sin(startAngle + sliceAngle / 2) * wheelRadius,
        wheelRadius
      );

      const baseColor = prize.color || (i % 2 === 0 ? '#dc2626' : '#1e1b4b');
      sliceGrad.addColorStop(0, '#1c1917');
      sliceGrad.addColorStop(0.35, baseColor);
      sliceGrad.addColorStop(1, baseColor);

      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Slice Divider Line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Divider Pin at Edge
      const pinX = centerX + Math.cos(endAngle) * (wheelRadius - 6);
      const pinY = centerY + Math.sin(endAngle) * (wheelRadius - 6);
      ctx.beginPath();
      ctx.arc(pinX, pinY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Prize Label Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Kanit, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Display name with max length protection
      const textToDisplay = prize.name.length > 14 ? prize.name.slice(0, 13) + '…' : prize.name;
      ctx.fillText(textToDisplay, wheelRadius - 22, 4);

      ctx.restore();
      ctx.restore();
    });

    // 4. Center Golden Metallic Hub
    const hubGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    hubGrad.addColorStop(0, '#fef08a');
    hubGrad.addColorStop(0.5, '#f59e0b');
    hubGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#1c1917';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [prizes]);

  if (!isOpen) return null;

  // Handle Wheel Spin with Dynamic Sound & Physics
  const handleSpin = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }

    if (isSpinning) return;

    const tickets = user.spinTickets || 0;
    const points = user.points || 0;
    const pointsCost = settings.pointsPerSpin || 20;

    if (tickets <= 0 && points < pointsCost) {
      Swal.fire({
        icon: 'warning',
        title: 'สิทธิ์หมุนไม่เพียงพอ',
        text: `คุณต้องมีตั๋วหมุนฟรี หรือ ${pointsCost} พอยท์ เพื่อหมุนวงล้อ 1 ครั้ง (เช็คชื่อรายวันเพื่อรับสิทธิ์ฟรีได้ครับ)`,
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

      // Start realistic clicking sound engine
      if (soundEnabled) {
        let tickCount = 0;
        const totalTicks = 45;
        const startInterval = 45; // ms
        
        const scheduleNextTick = () => {
          if (tickCount >= totalTicks) return;
          playTickSound();
          setFlapperRecoil(true);
          setTimeout(() => setFlapperRecoil(false), 30);
          tickCount++;
          // Decelerate smoothly
          const currentInterval = startInterval + Math.pow(tickCount / totalTicks, 2.5) * 320;
          setTimeout(scheduleNextTick, currentInterval);
        };
        scheduleNextTick();
      }

      // Calculate target rotation angle
      const sliceDeg = 360 / prizes.length;
      const targetIndex = data.prizeIndex >= 0 ? data.prizeIndex : 0;
      // 0 deg points right (3 o'clock); top pointer is at 270 deg (12 o'clock).
      const stopAtDeg = (270 - (targetIndex * sliceDeg + sliceDeg / 2) + 360) % 360;
      const fullRotations = 360 * 7; // 7 full rotations
      const currentMod = rotationAngle % 360;
      const targetRotation = rotationAngle + (360 - currentMod) + fullRotations + stopAtDeg;

      setRotationAngle(targetRotation);

      // Stop & Celebrate after 4.2 seconds
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

        if (data.prize.type !== 'none') {
          if (soundEnabled) playFanfareSound();
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }

        setWonPrizeModal({
          prize: data.prize,
          message: data.prizeMessage
        });

      }, 4300);

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
        if (soundEnabled) playFanfareSound();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#181028] via-[#0f091c] to-[#080511] border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/70 via-purple-950/70 to-red-950/70 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/40 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Kanit'] flex items-center gap-2">
                <span>BOOSTUP LUCKY WHEEL</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  สิทธิ์ฟรีทุกวัน
                </span>
              </h2>
              <p className="text-xs text-zinc-400">หมุนรับเครดิตฟรี พอยท์สะสม และโค้ดส่วนลด 24 ชม.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* User Status Bar */}
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Ticket className="w-4 h-4" />
                <span>ตั๋วหมุนฟรี: <strong className="text-white text-sm font-mono">{user?.spinTickets || 0}</strong> ใบ</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Coins className="w-4 h-4" />
                <span>พอยท์สะสม: <strong className="text-white text-sm font-mono">{user?.points || 0}</strong> P</span>
              </div>
            </div>
            <div className="text-zinc-400 text-[11px] hidden sm:block">
              (หากไม่มีตั๋ว ใช้ {settings.pointsPerSpin || 20} พอยท์ / ครั้ง)
            </div>
          </div>

          {/* Lucky Wheel Canvas Arena */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              
              {/* Top Pointer Flapper with Dynamic Physics Recoil */}
              <div 
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-75 ${
                  flapperRecoil ? '-rotate-12 scale-110' : 'rotate-0'
                }`}
              >
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[28px] border-t-amber-400 filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.9)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-amber-200 absolute -top-5 left-1/2 -translate-x-1/2 shadow-md" />
              </div>

              {/* Glowing Outer Atmosphere */}
              <div className="absolute inset-0 rounded-full border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.25)] pointer-events-none" />

              {/* Canvas Wheel */}
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: isSpinning ? 'transform 4.3s cubic-bezier(0.12, 0.92, 0.22, 1)' : 'none'
                }}
                className="rounded-full shadow-2xl"
              />

              {/* Center Spin Hub Button */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs shadow-xl shadow-amber-600/50 flex flex-col items-center justify-center border-2 border-amber-200 disabled:opacity-80 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="font-['Kanit'] tracking-wider">SPIN</span>
              </button>
            </div>

            {/* Spin CTA Button */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-sm shadow-xl shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 mx-auto font-['Kanit'] cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning 
                  ? 'กำลังหมุนวงล้อ...' 
                  : (user?.spinTickets > 0 
                      ? `หมุนฟรีทันที (${user.spinTickets} ตั๋ว)` 
                      : `หมุนเลย (ใช้ ${settings.pointsPerSpin || 20} พอยท์)`)}
              </button>
            </div>
          </div>

          {/* Daily Check-in Streak Section */}
          <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 space-y-4">
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
              className={`w-full py-3 rounded-2xl font-black text-xs font-['Kanit'] flex items-center justify-center gap-2 transition-all cursor-pointer ${
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

      {/* Won Prize Celebration Pop-up Modal */}
      {wonPrizeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 text-center shadow-2xl shadow-amber-500/30 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/50">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">ยินดีด้วย! คุณได้รับ</span>
              <h3 className="text-2xl font-black text-white font-['Kanit'] mt-1">
                {wonPrizeModal.prize.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 px-2">
                {wonPrizeModal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWonPrizeModal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm font-['Kanit'] transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
            >
              รับรางวัล ✨
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
