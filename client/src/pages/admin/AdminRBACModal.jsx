import React, { useState } from 'react';
import { X, Shield, ShieldCheck, UserCheck, Key, Save } from 'lucide-react';

export default function AdminRBACModal({ admin, onClose, onSaveSuccess }) {
  const [username, setUsername] = useState(admin?.username || '');
  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [password, setPassword] = useState(admin ? '' : 'staff1234');
  const [role, setRole] = useState(admin?.role || 'operator');
  const [department, setDepartment] = useState(admin?.department || 'Operations');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const endpoint = admin ? `/api/admin/admins/${admin.id}` : '/api/admin/admins';
      const method = admin ? 'PUT' : 'POST';

      const payload = {
        username,
        name,
        email,
        role,
        department
      };
      if (password) payload.password = password;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSaveSuccess(data.admin);
        onClose();
      } else {
        alert(data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-black text-white font-['Kanit']">
              {admin ? `แก้ไขสิทธิ์: ${admin.name}` : 'เพิ่มผู้ดูแลระบบและกำหนดสิทธิ์'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="text-zinc-300 font-bold block mb-1">ชื่อ-นามสกุล หรือ ชื่อเล่น *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นาย สมชาย ใจดี"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">ชื่อผู้ใช้ (Username) *</label>
            <input
              type="text"
              required
              disabled={Boolean(admin)}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น staff_somchai"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-red-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">อีเมล (Email) *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@boostup.com"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">
              {admin ? 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : 'รหัสผ่านตั้งต้น *'}
            </label>
            <input
              type="password"
              required={!admin}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Role Selection (RBAC) */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-zinc-300 font-bold block">ระดับสิทธิ์การเข้าถึง (Role & Permissions) *</label>
            
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                role === 'super_admin' ? 'bg-red-950/40 border-red-500' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="super_admin"
                  checked={role === 'super_admin'}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                    <span>Super Admin (ผู้ดูแลระบบสูงสุด)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    เข้าถึงได้ทุกส่วนของระบบ รวมถึงตั้งค่า API, จัดการแอดมินคนอื่น, และปรับเครดิตเงิน
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                role === 'operator' ? 'bg-red-950/40 border-red-500' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="operator"
                  checked={role === 'operator'}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>Order Operator (เจ้าหน้าที่จัดการออเดอร์)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    จัดการคำสั่งซื้อ, กดเติมซ้ำ (Retry), ตรวจสอบสลิปโอนเงิน, ดูแลลูกค้า
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                role === 'content_editor' ? 'bg-red-950/40 border-red-500' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="content_editor"
                  checked={role === 'content_editor'}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Content Editor (ฝ่ายเนื้อหาและการตลาด)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    เพิ่ม/แก้ไขเกมและแพ็กเกจราคา, จัดการแบนเนอร์สไลด์, สร้างโค้ดคูปอง
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสิทธิ์'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
