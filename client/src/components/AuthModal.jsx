import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  RotateCw, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  
  // Login / Register Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Forgot Password 2-Step OTP State
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [resetUserId, setResetUserId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Request OTP to registered Email (Step 1)
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/request-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setResetUserId(data.userId);
        setMaskedEmail(data.maskedEmail);
        if (data.devOtp) setDevOtp(data.devOtp);
        setOtpStep('verify');
        setResendCooldown(60);
        setSuccessMsg(data.message || `ส่งรหัส OTP ไปยัง ${data.maskedEmail} แล้ว`);
      } else {
        setError(data.message || 'ไม่สามารถส่งรหัส OTP ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & Reset Password (Step 2)
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }

    if (password.length < 4) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resetUserId,
          otp: otpCode.trim(),
          newPassword: password,
          confirmPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('ตั้งรหัสผ่านใหม่สำเร็จแล้ว! กำลังพากลับสู่หน้าเข้าสู่ระบบ...');
        setTimeout(() => {
          setMode('login');
          setOtpStep('request');
          setPassword('');
          setConfirmPassword('');
          setOtpCode('');
          setDevOtp('');
          setSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
        }, 1500);
      } else {
        setError(data.message || 'ไม่สามารถยืนยันรหัส OTP ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Login / Register
  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { identifier: identifier.trim(), password }
        : { username: identifier.trim(), email: email.trim(), password, name: name.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'การดำเนินการไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Tabs */}
        {mode === 'forgot' ? (
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
            <button
              type="button"
              onClick={() => { 
                setMode('login'); 
                setOtpStep('request'); 
                setError(''); 
                setSuccessMsg(''); 
                setOtpCode('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับหน้าเข้าสู่ระบบ</span>
            </button>
            <span className="text-xs font-black text-white font-['Kanit'] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-red-500" />
              <span>กู้คืนรหัสผ่านด้วย OTP</span>
            </span>
            <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex border-b border-zinc-800 bg-zinc-950">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-4 text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'text-white border-b-2 border-red-500 bg-[#0e121a]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-4 text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'text-white border-b-2 border-red-500 bg-[#0e121a]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              สมัครสมาชิกใหม่
            </button>
            <button onClick={onClose} className="p-4 text-zinc-500 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          
          {/* ========================================================= */}
          {/* MODE: FORGOT PASSWORD (EMAIL OTP WORKFLOW)                */}
          {/* ========================================================= */}
          {mode === 'forgot' ? (
            <div className="space-y-4">
              
              {/* STEP 1: Request OTP */}
              {otpStep === 'request' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-900/40 text-xs text-zinc-300 flex items-start gap-2.5">
                    <Mail className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-white font-['Kanit']">ยืนยันตัวตนด้วยรหัส OTP ทางอีเมล</div>
                      <div className="text-[11px] text-zinc-400 leading-relaxed">
                        เพื่อความปลอดภัยสูงสุด ระบบจะส่งรหัสผ่านใช้ครั้งเดียว (OTP 6 หลัก) ไปยังอีเมลที่คุณเคยลงทะเบียนไว้เพื่อยืนยันความเป็นเจ้าของบัญชี
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      ชื่อผู้ใช้ (Username) หรือ อีเมลที่ลงทะเบียน *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="เช่น proplayer99 หรือ name@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-700 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <X className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>กำลังตรวจสอบข้อมูลและส่งอีเมล...</span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>ส่งรหัสยืนยัน OTP ไปยังอีเมล</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-800/80">
                    <span>จำอีเมลหรือชื่อผู้ใช้ไม่ได้? สามารถกดที่ปุ่ม </span>
                    <span className="text-red-400 font-bold">"แชทสด"</span>
                    <span> มุมขวาล่างเพื่อติดต่อแอดมินช่วยกู้คืนบัญชีได้ตลอด 24 ชม.</span>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter OTP & Set New Password */}
              {otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-bold">ส่งรหัส OTP เรียบร้อยแล้ว!</span>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        ตรวจสอบรหัส 6 หลักที่ส่งไปยังอีเมล <strong>{maskedEmail}</strong> (รหัสมีอายุ 5 นาที)
                      </p>
                      {devOtp && (
                        <p className="text-[10px] text-amber-300 mt-1 font-mono bg-amber-950/60 p-1 rounded border border-amber-800/40">
                          [ระบบทดสอบ OTP Code: <strong>{devOtp}</strong>]
                        </p>
                      )}
                    </div>
                  </div>

                  {/* OTP Code Input */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      รหัสยืนยัน OTP (6 หลักจากอีเมล) *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-red-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        maxLength="6"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="กรอกตัวเลข 6 หลัก เช่น 123456"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-red-500/60 text-white text-sm font-mono tracking-widest text-center focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">กำหนดรหัสผ่านใหม่ *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ตั้งรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">ยืนยันรหัสผ่านใหม่อีกครั้ง *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านใหม่อีกครั้งเพื่อยืนยัน"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Resend OTP button */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-zinc-500">ไม่ได้รับอีเมล?</span>
                    <button
                      type="button"
                      onClick={() => handleRequestOtp()}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-red-400 hover:text-red-300 disabled:text-zinc-600 font-semibold cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {resendCooldown > 0 
                          ? `ขอรหัสใหม่ได้ใน ${resendCooldown} วินาที` 
                          : 'ส่งรหัส OTP ใหม่อีกครั้ง'}
                      </span>
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-700 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <X className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'กำลังตรวจสอบ OTP และบันทึกรหัสผ่าน...' : 'ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          ) : (
            /* ========================================================= */
            /* MODE: STANDARD LOGIN / REGISTER                          */
            /* ========================================================= */
            <form onSubmit={handleStandardAuth} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">ชื่อ-นามสกุล / ชื่อเล่น</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น กานต์ โปรเพลเยอร์"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  {mode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'ชื่อผู้ใช้ (Username)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={mode === 'login' ? "ชื่อผู้ใช้ หรืออีเมลของคุณ" : "เช่น proplayer99"}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">อีเมล (Email) *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com (ใช้รับรหัส OTP เมื่อลืมรหัส)"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400">รหัสผ่าน</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { 
                        setMode('forgot'); 
                        setOtpStep('request'); 
                        setError(''); 
                        setSuccessMsg(''); 
                        setPassword(''); 
                        setConfirmPassword('');
                        setOtpCode('');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-700 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <X className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading 
                  ? 'กำลังดำเนินการ...' 
                  : mode === 'login' 
                  ? 'เข้าสู่ระบบทันที' 
                  : 'ลงทะเบียนสมาชิก'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-zinc-500">
                {mode === 'login' ? (
                  <span>
                    ยังไม่มีบัญชีผู้ใช้?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                      className="text-red-400 hover:underline font-bold cursor-pointer"
                    >
                      สมัครสมาชิกฟรี
                    </button>
                  </span>
                ) : (
                  <span>
                    มีบัญชีอยู่แล้ว?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                      className="text-red-400 hover:underline font-bold cursor-pointer"
                    >
                      เข้าสู่ระบบที่นี่
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
