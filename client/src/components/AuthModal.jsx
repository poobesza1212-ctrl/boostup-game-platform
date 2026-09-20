import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Gamepad2, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        if (!identifier.trim()) {
          setError('กรุณากรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้');
          setIsLoading(false);
          return;
        }

        if (password.length < 4) {
          setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: identifier.trim(),
            newPassword: password,
            confirmPassword
          })
        });

        const data = await res.json();
        if (data.success) {
          setSuccessMsg(data.message || 'ตั้งรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว!');
          setTimeout(() => {
            setMode('login');
            setPassword('');
            setConfirmPassword('');
            setSuccessMsg('ตั้งรหัสผ่านใหม่สำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ');
          }, 1500);
        } else {
          setError(data.message || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้');
        }
        return;
      }

      // Login or Register
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
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับหน้าเข้าสู่ระบบ</span>
            </button>
            <span className="text-xs font-black text-white font-['Kanit']">ลืมรหัสผ่าน</span>
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
          
          {/* Forgot Password Mode Info Box */}
          {mode === 'forgot' && (
            <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-900/40 text-xs text-zinc-300 flex items-start gap-2.5">
              <KeyRound className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-white font-['Kanit']">กู้คืนและตั้งรหัสผ่านใหม่</div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">
                  กรอกชื่อผู้ใช้หรืออีเมลที่เคยลงทะเบียนไว้ พร้อมกำหนดรหัสผ่านใหม่ที่คุณต้องการใช้งาน
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                {mode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : mode === 'forgot' ? 'ชื่อผู้ใช้ หรือ อีเมลที่ลงทะเบียน *' : 'ชื่อผู้ใช้ (Username)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={mode === 'login' ? "ชื่อผู้ใช้ หรืออีเมลของคุณ" : "เช่น proplayer99 หรือ name@example.com"}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs text-zinc-400 block mb-1">อีเมล (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-400">
                  {mode === 'forgot' ? 'รหัสผ่านใหม่ *' : 'รหัสผ่าน'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { 
                      setMode('forgot'); 
                      setError(''); 
                      setSuccessMsg(''); 
                      setPassword(''); 
                      setConfirmPassword('');
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
                  placeholder={mode === 'forgot' ? "ตั้งรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)" : "••••••••"}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Confirm Password for Forgot Password Mode */}
            {mode === 'forgot' && (
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
            )}

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
                : mode === 'register' 
                ? 'ลงทะเบียนสมาชิก' 
                : 'บันทึกและตั้งรหัสผ่านใหม่'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Help Notice */}
          {mode === 'forgot' ? (
            <div className="pt-2 text-center text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-800/80">
              <span>ติดปัญหาหรือจำข้อมูลไม่ได้? สามารถกดที่ปุ่ม </span>
              <span className="text-red-400 font-bold">"แชทสด"</span>
              <span> มุมขวาล่างเพื่อแจ้งแอดมินช่วยกู้คืนบัญชีได้ตลอด 24 ชม.</span>
            </div>
          ) : (
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
          )}

        </div>

      </div>
    </div>
  );
}
