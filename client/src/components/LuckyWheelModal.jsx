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
  VolumeX,
  ShieldCheck,
  History,
  CheckCircle2,
  ChevronRight,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Swal from '../utils/swal';

// Sound Synthesis using Web Audio API (100% offline, zero external dependencies)
const playTickSound = (pitchMultiplier = 1) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(560 * pitchMultiplier, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchMultiplier, ctx.currentTime + 0.032);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.032);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {}
};

const playFanfareSound = (isJackpot = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = isJackpot 
      ? [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51] // C4 to E6
      : [329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = ctx.currentTime + idx * (isJackpot ? 0.07 : 0.09);
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  } catch (e) {}
};

export default function LuckyWheelModal({ isOpen, onClose, user, onUpdateUser, onOpenLogin, onOpenWallet }) {
  const [prizes, setPrizes] = useState([]);
  const [settings, setSettings] = useState({ pointsPerSpin: 20, enabled: true });
  const [recentWinners, setRecentWinners] = useState([]);
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [checkinStreak, setCheckinStreak] = useState(user?.checkinStreak || 0);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [wonPrizeModal, setWonPrizeModal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flapperRecoil, setFlapperRecoil] = useState(false);
  
  // Secondary Modals / Overlays
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const canvasRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const ledPhaseRef = useRef(0);

  // Fetch prizes and winners on open
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/wheel/prizes')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.prizes) {
          setPrizes(data.prizes.filter(p => p.enabled !== false));
          if (data.settings) setSettings(data.settings);
          if (data.winners && data.winners.length > 0) {
            setRecentWinners(data.winners);
          }
        }
      })
      .catch(err => console.error("Error fetching wheel prizes:", err));

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

  // Rotate Live Recent Winners Marquee every 3.5s
  useEffect(() => {
    if (!isOpen || recentWinners.length <= 1) return;
    const timer = setInterval(() => {
      setWinnerIndex(prev => (prev + 1) % recentWinners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isOpen, recentWinners]);

  // Clean up sound intervals on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Fetch personal spin history
  const handleOpenHistory = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    setHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/wheel/my-history?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setUserHistory(data.history || []);
      }
    } catch (e) {
      console.error("Failed to load wheel history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Ultra High-DPI Canvas Wheel Rendering (Retina Crisp 4K)
  useEffect(() => {
    if (!canvasRef.current || prizes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Scale for High-DPI displays (Retina, Mac, iPhone, OLED)
    const dpr = Math.min(window.devicePixelRatio || 2, 3);
    const size = 340;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const numSlices = prizes.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = size / 2;
    const centerY = size / 2;
    const outerBezelRadius = centerX - 6;
    const rimRadius = outerBezelRadius - 14;
    const wheelRadius = rimRadius - 4;

    ctx.clearRect(0, 0, size, size);

    // 1. Triple-Layer Metallic Gold & Titanium Bezel
    const bezelGrad = ctx.createLinearGradient(0, 0, size, size);
    bezelGrad.addColorStop(0, '#fef08a');
    bezelGrad.addColorStop(0.18, '#f59e0b');
    bezelGrad.addColorStop(0.38, '#b45309');
    bezelGrad.addColorStop(0.55, '#fef08a');
    bezelGrad.addColorStop(0.72, '#d97706');
    bezelGrad.addColorStop(0.88, '#78350f');
    bezelGrad.addColorStop(1, '#fef08a');

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerBezelRadius, 0, 2 * Math.PI);
    ctx.fillStyle = bezelGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Inner Carbon Ring with 24 Glowing LED Rivets
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerBezelRadius - 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0614';
    ctx.fill();

    const numLeds = 24;
    for (let l = 0; l < numLeds; l++) {
      const ledAngle = (l * 2 * Math.PI) / numLeds;
      const ledX = centerX + Math.cos(ledAngle) * (outerBezelRadius - 9);
      const ledY = centerY + Math.sin(ledAngle) * (outerBezelRadius - 9);

      ctx.beginPath();
      ctx.arc(ledX, ledY, 3, 0, 2 * Math.PI);
      
      // Dynamic pulsing colors around the rim
      const isGold = (l + ledPhaseRef.current) % 3 === 0;
      const isCyan = (l + ledPhaseRef.current) % 3 === 1;
      ctx.fillStyle = isGold ? '#fef08a' : (isCyan ? '#38bdf8' : '#ec4899');
      ctx.shadowColor = isGold ? '#f59e0b' : (isCyan ? '#0284c7' : '#db2777');
      ctx.shadowBlur = 7;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 3. Draw Slices with High-End Rarity Gradients & Icons
    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      // Determine Rarity Colors
      const isJackpot = prize.type === 'credit' && prize.value >= 50;
      const isEpic = (prize.type === 'credit' && prize.value >= 20) || prize.type === 'ticket';
      const isRare = prize.type === 'points' && prize.value >= 50;
      const isNone = prize.type === 'none';

      const sliceGrad = ctx.createRadialGradient(
        centerX, centerY, 20,
        centerX + Math.cos(startAngle + sliceAngle / 2) * wheelRadius,
        centerY + Math.sin(startAngle + sliceAngle / 2) * wheelRadius,
        wheelRadius
      );

      if (isJackpot) {
        // Mythic Gold
        sliceGrad.addColorStop(0, '#261600');
        sliceGrad.addColorStop(0.4, '#b45309');
        sliceGrad.addColorStop(0.85, '#f59e0b');
        sliceGrad.addColorStop(1, '#fde047');
      } else if (isEpic) {
        // Epic Purple
        sliceGrad.addColorStop(0, '#1c0330');
        sliceGrad.addColorStop(0.4, '#6b21a8');
        sliceGrad.addColorStop(0.85, '#9333ea');
        sliceGrad.addColorStop(1, '#c084fc');
      } else if (isRare) {
        // Rare Cyan
        sliceGrad.addColorStop(0, '#021e33');
        sliceGrad.addColorStop(0.4, '#0369a1');
        sliceGrad.addColorStop(0.85, '#0284c7');
        sliceGrad.addColorStop(1, '#38bdf8');
      } else if (isNone) {
        // Miss Smoky Slate
        sliceGrad.addColorStop(0, '#0f172a');
        sliceGrad.addColorStop(0.5, '#1e293b');
        sliceGrad.addColorStop(1, '#334155');
      } else {
        // Common Emerald / Teal
        sliceGrad.addColorStop(0, '#022416');
        sliceGrad.addColorStop(0.4, '#047857');
        sliceGrad.addColorStop(0.85, '#059669');
        sliceGrad.addColorStop(1, '#34d399');
      }

      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Slice Golden Divider Line
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fef08a';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
      ctx.shadowBlur = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Outer Edge Metallic Stud Pin
      const pinX = centerX + Math.cos(endAngle) * (wheelRadius - 5);
      const pinY = centerY + Math.sin(endAngle) * (wheelRadius - 5);
      ctx.beginPath();
      ctx.arc(pinX, pinY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Slice Content: Emoji Icon + Crisp Thai Label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';

      // Emoji Icon glyph
      const emojiIcon = prize.iconEmoji || (
        isJackpot ? '👑' : 
        (prize.type === 'credit' ? '💰' : 
        (prize.type === 'ticket' ? '🎟️' : 
        (prize.type === 'coupon' ? '🏷️' : 
        (prize.type === 'points' ? '🪙' : '😊'))))
      );
      ctx.font = '14px sans-serif';
      ctx.fillText(emojiIcon, wheelRadius - 10, 5);

      // Label Text with drop-shadow
      ctx.fillStyle = isJackpot ? '#fef08a' : '#ffffff';
      ctx.font = isJackpot ? 'bold 12px Kanit, sans-serif' : '600 11px Kanit, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const label = prize.name.length > 13 ? prize.name.slice(0, 12) + '…' : prize.name;
      ctx.fillText(label, wheelRadius - 30, 4);

      ctx.restore();
      ctx.restore();
    });

    // 4. Center High-Relief Metallic 3D Hub
    const hubGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 32);
    hubGrad.addColorStop(0, '#fef08a');
    hubGrad.addColorStop(0.35, '#f59e0b');
    hubGrad.addColorStop(0.7, '#d97706');
    hubGrad.addColorStop(1, '#78350f');

    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hub Inner Core Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#100820';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

  }, [prizes]);

  if (!isOpen) return null;

  // Handle Wheel Spin with High-Precision Suspense Deceleration
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
        confirmButtonColor: '#d97706'
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

      // Dynamic Audio Tick Engine with Suspense Pitch Deceleration
      if (soundEnabled) {
        let tickCount = 0;
        const totalTicks = 48;
        const startInterval = 40; // ms
        
        const scheduleNextTick = () => {
          if (tickCount >= totalTicks) return;
          const progress = tickCount / totalTicks;
          // Pitch slightly rises then drops for suspense
          const pitch = progress < 0.6 ? 1.0 + progress * 0.3 : Math.max(0.75, 1.3 - (progress - 0.6) * 1.4);
          playTickSound(pitch);
          
          setFlapperRecoil(true);
          setTimeout(() => setFlapperRecoil(false), 28);
          tickCount++;

          // Exponential easing curve (smooth suspense slowdown)
          const currentInterval = startInterval + Math.pow(progress, 3) * 360;
          setTimeout(scheduleNextTick, currentInterval);
        };
        scheduleNextTick();
      }

      // Calculate Target Angle precisely
      const sliceDeg = 360 / prizes.length;
      const targetIndex = data.prizeIndex >= 0 ? data.prizeIndex : 0;
      // 0 deg is 3 o'clock; top pointer is at 270 deg (12 o'clock).
      const stopAtDeg = (270 - (targetIndex * sliceDeg + sliceDeg / 2) + 360) % 360;
      const fullRotations = 360 * 8; // 8 full spins for excitement
      const currentMod = rotationAngle % 360;
      const targetRotation = rotationAngle + (360 - currentMod) + fullRotations + stopAtDeg;

      setRotationAngle(targetRotation);

      // Stop & Celebrate after 4.5 seconds
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

        const isBigWin = data.prize.type === 'credit' && data.prize.value >= 20;
        if (data.prize.type !== 'none') {
          if (soundEnabled) playFanfareSound(isBigWin);
          confetti({
            particleCount: isBigWin ? 140 : 80,
            spread: isBigWin ? 100 : 70,
            origin: { y: 0.58 }
          });
        }

        // Add to local recent winners feed
        if (data.prize.type !== 'none') {
          const uname = user.username || user.name || 'คุณ';
          const masked = uname.length > 2 ? `${uname[0]}***${uname.slice(-1)}` : `${uname[0]}***`;
          setRecentWinners(prev => [{
            id: `win_local_${Date.now()}`,
            username: masked,
            prizeName: data.prize.name,
            prizeType: data.prize.type,
            value: data.prize.value,
            timeAgo: 'เมื่อสักครู่'
          }, ...prev.slice(0, 20)]);
        }

        setWonPrizeModal({
          prize: data.prize,
          message: data.prizeMessage,
          isBigWin
        });

      }, 4600);

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

  // Handle Daily Check-in Streak
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
        if (soundEnabled) playFanfareSound(data.streak === 7);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });

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

  const currentWinner = recentWinners[winnerIndex] || recentWinners[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Kanit']">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#19102c] via-[#0f091f] to-[#070410] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden my-4">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-zinc-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/40">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>BOOSTUP LUCKY CASINO</span>
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 uppercase tracking-wider">
                  สิทธิ์ฟรี 24 ชม.
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">หมุนรับเครดิตฟรี พอยท์สะสม และโค้ดส่วนลดเกมยอดนิยม</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Recent Winners Marquee Ticker (Social Proof & Trust) */}
        {currentWinner && (
          <div className="px-4 py-2 bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-amber-950/60 border-b border-amber-500/20 flex items-center justify-between gap-2 overflow-hidden text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide shrink-0">
                ผู้โชคดีสด:
              </span>
              <div className="truncate text-[11px] text-zinc-300 animate-in fade-in duration-300" key={currentWinner.id}>
                🎉 ยูสเซอร์ <strong className="text-white font-mono">{currentWinner.username}</strong> เพิ่งได้รับ{' '}
                <span className="text-amber-400 font-semibold underline decoration-amber-500/50">[{currentWinner.prizeName}]</span>
                <span className="text-zinc-500 ml-1">({currentWinner.timeAgo || 'เมื่อสักครู่'})</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleOpenHistory}
                className="px-2 py-0.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-cyan-300 text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                title="ดูประวัติการหมุนของคุณ"
              >
                <History className="w-3 h-3 text-cyan-400" />
                <span>ประวัติ</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* User Status Bar & Trust Badges */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>ตั๋วหมุนฟรี: <strong className="text-white text-sm font-mono">{user?.spinTickets || 0}</strong> ใบ</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span>พอยท์สะสม: <strong className="text-white text-sm font-mono">{user?.points || 0}</strong> P</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ระบบสุ่ม RNG โปร่งใส 100% ไม่ล็อคผล</span>
            </div>
          </div>

          {/* Lucky Wheel Canvas Arena */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-[340px] h-[340px] flex items-center justify-center">
              
              {/* Top Pointer Flapper with Authentic Physics Recoil */}
              <div 
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-75 origin-top pointer-events-none ${
                  flapperRecoil ? '-rotate-15 scale-110' : 'rotate-0'
                }`}
              >
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[30px] border-t-amber-400 filter drop-shadow-[0_5px_12px_rgba(245,158,11,1)]" />
                <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-amber-200 absolute -top-5 left-1/2 -translate-x-1/2 shadow-lg" />
              </div>

              {/* Glowing Outer Atmosphere */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.3)] pointer-events-none" />

              {/* Canvas Wheel (Retina Scaled) */}
              <canvas
                ref={canvasRef}
                style={{
                  width: 340,
                  height: 340,
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: isSpinning ? 'transform 4.6s cubic-bezier(0.15, 0.98, 0.24, 1)' : 'none'
                }}
                className="rounded-full shadow-2xl"
              />

              {/* Center Spin Hub Button (3D Metallic Pressable) */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-orange-400 text-white font-black text-xs shadow-2xl shadow-amber-600/60 flex flex-col items-center justify-center border-2 border-amber-200 disabled:opacity-85 transition-all active:scale-90 cursor-pointer group"
                title="กดเพื่อหมุนวงล้อ"
              >
                <RotateCw className={`w-5 h-5 text-black drop-shadow ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
                <span className="text-[11px] font-black text-black tracking-wider mt-0.5">หมุน!</span>
              </button>
            </div>

            {/* Spin CTA Button */}
            <div className="mt-5 text-center w-full max-w-sm">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-sm shadow-xl shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning 
                  ? 'กำลังหมุนวงล้อ...' 
                  : (user?.spinTickets > 0 
                      ? `หมุนฟรีทันที (มี ${user.spinTickets} สิทธิ์ฟรี) ✨` 
                      : `หมุนวงล้อ (ใช้ ${settings.pointsPerSpin || 20} พอยท์)`)}
              </button>
              <p className="text-[11px] text-zinc-500 mt-2">
                {user?.spinTickets > 0 
                  ? 'ระบบจะใช้ตั๋วฟรีก่อนเสมอ ไม่หักพอยท์ของคุณ' 
                  : `เช็คชื่อรายวันด้านล่างเพื่อสะสมพอยท์ หรือรับตั๋วหมุนฟรีทุกสัปดาห์`}
              </p>
            </div>
          </div>

          {/* Daily Check-in Streak Section */}
          <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">เช็คชื่อรายวัน (Daily Streak)</h3>
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
                        ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300 shadow-sm' 
                        : isCurrent 
                          ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 animate-pulse' 
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
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
                      <span className="text-[8px] bg-red-600/50 text-red-200 px-1 rounded mt-0.5 font-bold leading-tight">
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
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-sm bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 rounded-3xl p-6 text-center shadow-2xl space-y-4 ${
            wonPrizeModal.isBigWin 
              ? 'border-amber-400 shadow-amber-500/40 ring-4 ring-amber-500/20' 
              : 'border-purple-500/60 shadow-purple-500/30'
          }`}>
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xl ${
              wonPrizeModal.isBigWin
                ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 text-black animate-bounce'
                : 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white'
            }`}>
              {wonPrizeModal.isBigWin ? <Trophy className="w-10 h-10 text-white" /> : <Gift className="w-10 h-10 text-white" />}
            </div>

            <div>
              <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                wonPrizeModal.isBigWin 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {wonPrizeModal.isBigWin ? '👑 JACKPOT WINNER' : '✨ ยินดีด้วย! คุณได้รับ'}
              </span>
              <h3 className="text-2xl font-black text-white mt-3">
                {wonPrizeModal.prize.name}
              </h3>
              <p className="text-xs text-zinc-300 mt-2 px-2 leading-relaxed">
                {wonPrizeModal.message}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setWonPrizeModal(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
              >
                รับรางวัลเข้าบัญชี ✨
              </button>
              {wonPrizeModal.prize.type === 'credit' && onOpenWallet && (
                <button
                  type="button"
                  onClick={() => {
                    setWonPrizeModal(null);
                    onClose();
                    onOpenWallet();
                  }}
                  className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>ดูยอดเงินในกระเป๋าของคุณ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* 📜 Personal Spin History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">ประวัติการหมุนวงล้อของฉัน</h3>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-8 text-center text-xs text-zinc-500">กำลังโหลดประวัติ...</div>
            ) : userHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">คุณยังไม่มีประวัติการหมุนวงล้อ กดหมุนเพื่อรับรางวัลได้เลย!</div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-xs">
                {userHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.prizeName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleString('th-TH')}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                      เข้าบัญชีแล้ว
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setHistoryModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
