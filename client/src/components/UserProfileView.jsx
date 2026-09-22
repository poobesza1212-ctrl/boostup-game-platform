import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Gift, 
  Copy, 
  Check, 
  Save, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  MessageSquare
} from 'lucide-react';

export default function UserProfileView({ 
  user, 
  onUpdateUser, 
  onBackToHome, 
  onOpenAuth, 
  onOpenWallet, 
  siteSettings 
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payments'
  
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    firstNameEn: user?.firstNameEn || '',
    lastNameEn: user?.lastNameEn || '',
    phone: user?.phone || '',
    email: user?.email || '',
    lineId: user?.lineId || ''
  });

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUid, setCopiedUid] = useState(false);

  // Sync form data when user prop changes
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(/\s+/);
      setFormData({
        firstName: user.firstName || nameParts[0] || user.username || '',
        lastName: user.lastName || nameParts.slice(1).join(' ') || '',
        firstNameEn: user.firstNameEn || '',
        lastNameEn: user.lastNameEn || '',
        phone: user.phone || '',
        email: user.email || '',
        lineId: user.lineId || ''
      });
    }
  }, [user]);

  const handleCopyUid = (uidText) => {
    if (!uidText) return;
    navigator.clipboard.writeText(uidText);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccessMsg('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          firstNameEn: formData.firstNameEn,
          lastNameEn: formData.lastNameEn,
          phone: formData.phone,
          email: formData.email,
          lineId: formData.lineId
        })
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        setIsEditingPhone(false);
        setIsEditingEmail(false);
        if (onUpdateUser && data.user) {
          onUpdateUser(data.user);
        }
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#0a1526]/80">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center border border-slate-200">
          <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto mb-4 text-blue-600">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-['Kanit']">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            เข้าสู่ระบบเพื่อดูข้อมูลบัญชีผู้ใช้ ข้อมูลส่วนตัว และช่องทางการชำระเงินของคุณ
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all font-['Kanit'] cursor-pointer"
            >
              เข้าสู่ระบบทันที
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userUid = user.uid || `U${(user.id || user.username || '').padEnd(32, 'a').slice(0, 32)}`;

  return (
    <div className="min-h-screen bg-[#0d2238] font-['Prompt',sans-serif] text-slate-800 pb-16">
      
      {/* Top Header Navigation matching Image 2 */}
      <div className="bg-[#0b1c2e] border-b border-[#1c334d] px-4 sm:px-8 pt-6 pb-0">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2">
          
          {/* Tab 1: ข้อมูลผู้ใช้ */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 rounded-t-xl font-bold text-sm transition-all cursor-pointer font-['Kanit'] ${
              activeTab === 'profile'
                ? 'bg-[#1976d2] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            ข้อมูลผู้ใช้
          </button>

          {/* Tab 2: ช่องทางการชำระเงิน */}
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2.5 rounded-t-xl font-bold text-sm transition-all cursor-pointer font-['Kanit'] ${
              activeTab === 'payments'
                ? 'bg-[#1976d2] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            ช่องทางการชำระเงิน
          </button>

          {/* Action: กลับหน้าหลัก */}
          <button
            type="button"
            onClick={onBackToHome}
            className="px-6 py-2.5 rounded-t-xl bg-white text-slate-700 hover:bg-slate-100 font-bold text-sm transition-all cursor-pointer font-['Kanit'] flex items-center gap-1.5 ml-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* Success / Error Banners */}
        {saveSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{saveSuccessMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: ข้อมูลผู้ใช้ (User Profile View) */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* CARD 1: Header Profile Summary & Contact Channels */}
            <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-200">
              
              {/* Top Row: Avatar, Name, Badges & 3 Columns Info */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
                
                {/* Circular Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm shrink-0">
                  <User className="w-12 h-12 text-slate-400 fill-slate-300" />
                </div>

                {/* Name & Metadata */}
                <div className="flex-1 w-full space-y-3">
                  
                  {/* Name + Status Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Kanit'] tracking-tight">
                      {user.name || `${formData.firstName} ${formData.lastName}`.trim() || user.username}
                    </h1>

                    {/* Status Badge */}
                    <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#22c55e] text-white flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span>สถานะ : {user.status === 'banned' ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}</span>
                    </span>

                    {/* Line Badge */}
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#06c755] text-white flex items-center gap-1 shadow-sm">
                      <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      <span>Line</span>
                    </span>
                  </div>

                  {/* 3 Info Columns (UID, อีเมล, บทบาท) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                    
                    {/* UID */}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs mb-1">UID :</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 font-mono text-[11px] truncate max-w-[200px]" title={userUid}>
                          {userUid}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUid(userUid)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                          title="คัดลอก UID"
                        >
                          {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* อีเมล */}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs mb-1">อีเมล :</span>
                      <span className="text-slate-600 text-xs truncate block" title={user.email}>
                        {user.email || 'ยังไม่ได้ระบุ'}
                      </span>
                    </div>

                    {/* บทบาท */}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs mb-1">บทบาท :</span>
                      <span className="text-slate-600 text-xs font-medium">
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

              {/* Horizontal Divider */}
              <hr className="my-7 border-slate-200" />

              {/* Contact Channels Section (ช่องทางการติดต่อ) */}
              <div className="space-y-4">
                
                <h3 className="text-base font-bold text-slate-800 font-['Kanit']">
                  ช่องทางการติดต่อ
                </h3>

                {/* Warning / Notice Banner */}
                <div className="p-3.5 rounded-xl bg-[#fff7ed] border border-[#ffedd5] text-[#c2410c] text-xs flex items-center gap-2.5 font-medium leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#ea580c]" />
                  <span>หากท่านต้องการเป็นสมาชิก BOOSTUP Premium กรุณาลงทะเบียนและยืนยันตัวตนให้ครบ</span>
                </div>

                {/* Form Fields matching Image 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  
                  {/* Field 1: เบอร์โทรศัพท์ */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-600">
                        เบอร์โทรศัพท์
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(prev => !prev)}
                        className="text-xs font-bold text-[#1976d2] hover:underline cursor-pointer"
                      >
                        {isEditingPhone ? 'ยกเลิก' : 'เปลี่ยน'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={!isEditingPhone}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="063xxxxxxx"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isEditingPhone
                            ? 'bg-white border-2 border-blue-500 text-slate-800 focus:outline-none'
                            : 'bg-[#f8fafc] border border-slate-200 text-slate-700'
                        }`}
                      />
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                    </div>
                  </div>

                  {/* Field 2: อีเมลที่ใช้รับโค้ด */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-600">
                        อีเมลที่ใช้รับโค้ด
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(prev => !prev)}
                        className="text-xs font-bold text-[#1976d2] hover:underline cursor-pointer"
                      >
                        {isEditingEmail ? 'ยกเลิก' : 'เปลี่ยน'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        disabled={!isEditingEmail}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@email.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isEditingEmail
                            ? 'bg-white border-2 border-blue-500 text-slate-800 focus:outline-none'
                            : 'bg-[#f8fafc] border border-slate-200 text-slate-700'
                        }`}
                      />
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                    </div>
                  </div>

                  {/* Field 3: เชื่อมบัญชี Line */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">
                      เชื่อมบัญชี Line
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.lineId}
                        onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                        placeholder="LINE ID (เช่น @boostup)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-full bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] hover:text-[#0369a1] text-xs font-bold border border-[#bae6fd] shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        {formData.lineId ? 'บันทึก' : 'สมัคร'}
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* CARD 2: ข้อมูลส่วนตัว | แก้ไข (Personal Information) */}
            <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-200 space-y-5">
              
              {/* Section Header */}
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 font-['Kanit']">
                  ข้อมูลส่วนตัว
                </h3>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="text-xs font-bold text-[#1976d2] hover:underline cursor-pointer"
                >
                  แก้ไข
                </button>
              </div>

              {/* Row 1: ชื่อ & นามสกุล ภาษาไทย */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    ชื่อ
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="กรอกชื่อภาษาไทย"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="กรอกนามสกุลภาษาไทย"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Credit Card Verification Warning Notice matching Image 2 */}
              <div className="p-3.5 rounded-xl bg-[#fff7ed] border border-[#ffedd5] text-[#c2410c] text-xs flex items-center gap-2.5 font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ea580c]" />
                <span>หากต้องการ ชำระเงินด้วยบัตรเครดิต ชื่อและนามสกุล ภาษาอังกฤษ ต้องตรงกับหน้าบัตรเครดิต รายการถึงจะทำสำเร็จ</span>
              </div>

              {/* Row 2: ชื่อ & นามสกุล ภาษาอังกฤษ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    ชื่อ (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={formData.firstNameEn}
                    onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                    placeholder="First Name (English)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    นามสกุล (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={formData.lastNameEn}
                    onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                    placeholder="Last Name (English)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer font-['Kanit']"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึกข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึกข้อมูลส่วนตัว</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ช่องทางการชำระเงิน (Payment Methods View) */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-200 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 font-['Kanit']">
                    ช่องทางการชำระเงินที่ผูกไว้
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จัดการกระเป๋าเงิน และช่องทางการชำระเงินสำหรับสั่งซื้อบริการเติมเกม
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenWallet}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer font-['Kanit']"
                >
                  <Wallet className="w-4 h-4" />
                  <span>เติมเงินเข้ากระเป๋า</span>
                </button>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Wallet Balance Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">กระเป๋าเงิน BOOSTUP</div>
                        <div className="text-xs font-bold text-emerald-400">พร้อมใช้งานตลอด 24 ชม.</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] text-slate-400">ยอดเงินคงเหลือ</div>
                    <div className="text-3xl font-black text-white font-['Kanit'] tracking-tight">
                      ฿{(Number(user.walletBalance) || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                    <span>เหรียญสะสม: {user.points || 0} Coins</span>
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      + เติมเงินด่วน
                    </button>
                  </div>
                </div>

                {/* 2. PromptPay QR Code */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold font-['Kanit']">พร้อมเพย์ QR Code (PromptPay)</div>
                        <div className="text-[11px] text-slate-500">สแกนจ่ายผ่าน Mobile Banking ทุกธนาคาร</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ระบบสแกน QR อัตโนมัติ ตรวจสอบยอดและตัดรอบใน 1-3 วินาที ค่าธรรมเนียม 0 บาท
                  </p>
                </div>

                {/* 3. TrueMoney Wallet */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold font-['Kanit']">ซองของขวัญ ทรูมันนี่ (TrueMoney)</div>
                        <div className="text-[11px] text-slate-500">ส่งลิงก์ซองอั่งเปาตัดยอดทันที</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เบอร์มือถือที่ผูกกับบัญชี: {formData.phone || 'ยังไม่ได้ระบุ'}
                  </p>
                </div>

                {/* 4. Credit / Debit Card Verification */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold font-['Kanit']">บัตรเครดิต / เดบิต</div>
                        <div className="text-[11px] text-slate-500">Visa, Mastercard, JCB</div>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ชื่อหน้าบัตร: {formData.firstNameEn && formData.lastNameEn ? `${formData.firstNameEn} ${formData.lastNameEn}` : '(กรุณาระบุชื่อ-นามสกุลภาษาอังกฤษในหน้าข้อมูลผู้ใช้)'}
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
