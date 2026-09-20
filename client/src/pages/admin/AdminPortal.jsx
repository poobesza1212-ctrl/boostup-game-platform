import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, ArrowLeft, KeyRound, AlertCircle, CheckCircle, ExternalLink, LogOut } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

export default function AdminPortal({ onBackToStore }) {
  const [adminUser, setAdminUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check saved admin session on mount
  useEffect(() => {
    const saved = localStorage.getItem('tw_admin_session');
    if (saved) {
      try {
        setAdminUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('tw_admin_session');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('กรุณากรอก Username และ Password ของผู้ดูแลระบบ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();

      if (data.success && data.admin) {
        setAdminUser(data.admin);
        localStorage.setItem('tw_admin_session', JSON.stringify(data.admin));
        if (data.token) {
          localStorage.setItem('tw_admin_token', data.token);
        }
      } else {
        setError(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('tw_admin_session');
    localStorage.removeItem('tw_admin_token');
    setUsername('');
    setPassword('');
  };

  // If authenticated as Admin, show the Full Admin Dashboard
  if (adminUser) {
    return (
      <div className="relative min-h-screen bg-[#07090e]">
        {/* Dedicated Admin Portal Top Notification Bar */}
        <div className="bg-red-950/80 border-b border-red-800/60 px-4 py-2 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white font-['Kanit']">BOOSTUP ADMIN PORTAL</span>
            <span className="text-zinc-400 hidden sm:inline">• ผู้ดูแลระบบ:</span>
            <strong className="text-amber-400">{adminUser.name || adminUser.username}</strong>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase">
              {adminUser.role === 'super_admin' ? 'Super Admin (สิทธิ์สูงสุด)' : adminUser.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
              <span>ดูหน้าร้านค้า</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        <AdminDashboard 
          onBackToStore={onBackToStore} 
          adminUser={adminUser}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // Otherwise, render Dedicated Admin Login Gate
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-['Prompt',sans-serif]">
      {/* Cyber Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Return to Storefront link top-left */}
      <button
        onClick={onBackToStore}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs text-zinc-400 hover:text-white px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-all z-20"
      >
        <ArrowLeft className="w-4 h-4 text-red-400" />
        <span>กลับสู่หน้าร้านค้าลูกค้า</span>
      </button>

      {/* Admin Login Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Shield Header */}
        <div className="text-center mb-8">
          <img
            src="/boostup_logo.jpg"
            alt="BOOSTUP"
            className="w-20 h-20 rounded-2xl object-contain border border-red-500/60 shadow-xl shadow-red-600/30 mb-3 mx-auto glow-red"
          />
          <h1 className="text-3xl font-black text-white tracking-wider font-['Kanit'] uppercase">
            BOOST<span className="text-red-500">UP</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 text-[11px] font-bold text-red-400 uppercase tracking-widest mt-1">
            <Lock className="w-3 h-3 text-red-400" />
            ADMIN MANAGEMENT PORTAL
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            ร้านเติมเงินเกม • PLAY MORE GO FURTHER
          </p>
        </div>

        {/* Card Body */}
        <div className="p-7 rounded-3xl bg-[#0b0e17] border border-red-950/80 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                ชื่อผู้ใช้งานผู้ดูแล (Admin Username / Email)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                รหัสผ่านความปลอดภัย (Admin Password)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบจัดการหลังบ้าน</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Security Notice */}
        <p className="text-center text-[10px] text-zinc-500 mt-6">
          🔒 ระบบมีการบันทึก Audit Logs และการตรวจสอบ IP ตามมาตรฐานความปลอดภัยสูงสุด
        </p>

      </div>
    </div>
  );
}
