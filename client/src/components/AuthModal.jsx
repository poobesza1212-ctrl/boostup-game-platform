import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Gamepad2, ArrowRight } from 'lucide-react';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { identifier, password }
        : { username: identifier, email, password, name };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-4 text-xs font-bold transition-all ${
              mode === 'login'
                ? 'text-white border-b-2 border-red-500 bg-[#0e121a]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-4 text-xs font-bold transition-all ${
              mode === 'register'
                ? 'text-white border-b-2 border-red-500 bg-[#0e121a]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            สมัครสมาชิกใหม่
          </button>
          <button onClick={onClose} className="p-4 text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
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
              <label className="text-xs text-zinc-400 block mb-1">รหัสผ่าน</label>
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
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-700 text-red-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบทันที' : 'ลงทะเบียนสมาชิก'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
