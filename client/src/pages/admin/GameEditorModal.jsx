import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Gamepad2, Layers, Check } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

export default function GameEditorModal({ game, onClose, onSaveSuccess }) {
  const [name, setName] = useState(game?.name || '');
  const [publisher, setPublisher] = useState(game?.publisher || '');
  const [category, setCategory] = useState(game?.category || 'MOBA');
  const [currencyName, setCurrencyName] = useState(game?.currencyName || 'คูปอง');
  const [inputType, setInputType] = useState(game?.inputType || 'uid_only');
  const [serversStr, setServersStr] = useState(game?.servers ? game.servers.join(', ') : '');
  const [iconUrl, setIconUrl] = useState(game?.icon || '');
  const [badge, setBadge] = useState(game?.badge || '🔥 มาใหม่');
  const [packages, setPackages] = useState(game?.packages || [
    { id: 'pkg_1', name: 'แพ็กเกจเริ่มต้น', currencyAmount: 100, price: 35, costPrice: 30, originalPrice: 39, bonus: '+0' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPackage = () => {
    const newPkg = {
      id: `pkg_${Date.now().toString().slice(-4)}`,
      name: 'แพ็กเกจใหม่',
      currencyAmount: 300,
      price: 99,
      costPrice: 85,
      originalPrice: 119,
      bonus: '+10 โบนัส'
    };
    setPackages([...packages, newPkg]);
  };

  const handlePackageChange = (idx, field, value) => {
    const updated = [...packages];
    updated[idx][field] = value;
    setPackages(updated);
  };

  const handleRemovePackage = (idx) => {
    setPackages(packages.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อเกม');
      return;
    }
    if (!iconUrl) {
      alert('กรุณาอัปโหลดรูปภาพไอคอนเกม');
      return;
    }

    setIsSaving(true);
    const slug = game?.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const servers = serversStr.trim() ? serversStr.split(',').map(s => s.trim()).filter(Boolean) : null;

    const gamePayload = {
      id: game?.id || slug,
      slug,
      name,
      publisher,
      category,
      currencyName,
      inputType,
      servers,
      icon: iconUrl,
      badge,
      isPopular: game?.isPopular || false,
      isActive: true,
      displayOrder: game?.displayOrder || 10,
      packages: packages.map(p => ({
        ...p,
        price: Number(p.price),
        costPrice: Number(p.costPrice || p.price * 0.88),
        originalPrice: Number(p.originalPrice || p.price)
      }))
    };

    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gamePayload)
      });
      const data = await res.json();
      if (data.success) {
        onSaveSuccess(data.game);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-zinc-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-black text-white font-['Kanit']">
              {game ? `แก้ไขเกม: ${game.name}` : 'เพิ่มเกมใหม่เข้าสู่ระบบ'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Row 1: Name & Publisher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">ชื่อเกม (Game Name) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ROV, Valorant, Free Fire"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">ค่ายผู้ให้บริการ (Publisher)</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="เช่น Garena, Riot Games, HoYoverse"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Category & In-game currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">หมวดหมู่เกม</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              >
                <option value="MOBA">MOBA</option>
                <option value="Battle Royale">Battle Royale</option>
                <option value="Tactical FPS">Tactical FPS</option>
                <option value="Action RPG">Action RPG</option>
                <option value="Sandbox / MMO">Sandbox / Metaverse / MMO (Roblox, Minecraft)</option>
                <option value="Sports">Sports / Racing</option>
                <option value="Casual">Casual / Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">ชื่อสกุลเงินในเกม</label>
              <input
                type="text"
                required
                value={currencyName}
                onChange={(e) => setCurrencyName(e.target.value)}
                placeholder="เช่น คูปอง, เพชร, UC, VP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">ป้ายกำกับ (Badge)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="เช่น 🔥 ยอดนิยม, ⚡ เติมไว"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Input type & Server list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">ประเภทข้อมูลที่ต้องกรอก (Input Type)</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              >
                <option value="uid_only">UID / Player ID อย่างเดียว</option>
                <option value="username">ชื่อผู้ใช้ (Username / ID เช่น Roblox)</option>
                <option value="uid_server">UID + เลือกเซิร์ฟเวอร์ (Server)</option>
                <option value="riot_id">Riot ID + Tagline (เช่น Name#TH1)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                รายชื่อเซิร์ฟเวอร์ (คั่นด้วยจุลภาค , ถ้ามี)
              </label>
              <input
                type="text"
                value={serversStr}
                onChange={(e) => setServersStr(e.target.value)}
                placeholder="เช่น Asia, America, Europe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Uploader from Machine */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <ImageUploader
              currentImageUrl={iconUrl}
              onImageUploaded={(url) => setIconUrl(url)}
              label="อัปโหลดไอคอนเกมจากเครื่องคอมพิวเตอร์ของคุณ (PNG / JPG / WEBP)"
              aspectRatio="square"
            />
          </div>

          {/* Package Manager Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>จัดการแพ็กเกจและราคา ({packages.length} แพ็กเกจ)</span>
              </label>
              <button
                type="button"
                onClick={handleAddPackage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มแพ็กเกจ
              </button>
            </div>

            <div className="space-y-2.5">
              {packages.map((pkg, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-zinc-400 block mb-1">ชื่อแพ็กเกจ</label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                      placeholder="เช่น 360 คูปอง"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-zinc-400 block mb-1">ราคาขาย (฿)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(idx, 'price', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-['Kanit'] font-bold text-red-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-zinc-400 block mb-1">ต้นทุน API (฿)</label>
                    <input
                      type="number"
                      value={pkg.costPrice}
                      onChange={(e) => handlePackageChange(idx, 'costPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-zinc-400 block mb-1">ราคาปกติ (฿)</label>
                    <input
                      type="number"
                      value={pkg.originalPrice}
                      onChange={(e) => handlePackageChange(idx, 'originalPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-zinc-400 block mb-1">โบนัส / ป้าย</label>
                    <input
                      type="text"
                      value={pkg.bonus || ''}
                      onChange={(e) => handlePackageChange(idx, 'bonus', e.target.value)}
                      placeholder="+25 โบนัส"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-emerald-400"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(idx)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-black text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกเกมและแพ็กเกจ'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
