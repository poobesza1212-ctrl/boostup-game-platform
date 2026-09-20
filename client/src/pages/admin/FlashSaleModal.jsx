import React, { useState, useEffect } from 'react';
import { X, Zap, Upload, Tag, AlertCircle } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

export default function FlashSaleModal({ isOpen, onClose, onSave, flashSale, games = [] }) {
  const [formData, setFormData] = useState({
    id: '',
    gameId: '',
    gameName: '',
    packageName: '',
    icon: '',
    originalPrice: 399,
    flashPrice: 289,
    discountPercent: 28,
    totalStock: 50,
    soldStock: 10,
    currencyAmount: 360,
    currencyName: 'คูปอง'
  });

  useEffect(() => {
    if (flashSale) {
      setFormData({
        id: flashSale.id || '',
        gameId: flashSale.gameId || '',
        gameName: flashSale.gameName || '',
        packageName: flashSale.packageName || '',
        icon: flashSale.icon || '',
        originalPrice: flashSale.originalPrice || 399,
        flashPrice: flashSale.flashPrice || 289,
        discountPercent: flashSale.discountPercent || 28,
        totalStock: flashSale.totalStock || 50,
        soldStock: flashSale.soldStock || 0,
        currencyAmount: flashSale.currencyAmount || 300,
        currencyName: flashSale.currencyName || 'คูปอง'
      });
    } else {
      setFormData({
        id: '',
        gameId: games[0]?.id || '',
        gameName: games[0]?.name || '',
        packageName: '360 คูปอง (Flash Deal)',
        icon: games[0]?.icon || '',
        originalPrice: 399,
        flashPrice: 289,
        discountPercent: 28,
        totalStock: 50,
        soldStock: 0,
        currencyAmount: 360,
        currencyName: games[0]?.currencyName || 'คูปอง'
      });
    }
  }, [flashSale, games, isOpen]);

  // Handle Game change
  const handleGameSelect = (e) => {
    const selectedGameId = e.target.value;
    const g = games.find(game => game.id === selectedGameId);
    if (g) {
      setFormData(prev => ({
        ...prev,
        gameId: g.id,
        gameName: g.name,
        icon: prev.icon || g.icon,
        currencyName: g.currencyName || prev.currencyName
      }));
    }
  };

  // Auto calculate discount percent
  const handlePriceChange = (field, val) => {
    const num = Number(val) || 0;
    setFormData(prev => {
      const orig = field === 'originalPrice' ? num : prev.originalPrice;
      const flash = field === 'flashPrice' ? num : prev.flashPrice;
      const disc = orig > 0 ? Math.max(0, Math.round(((orig - flash) / orig) * 100)) : 0;
      return {
        ...prev,
        [field]: num,
        discountPercent: disc
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.packageName || !formData.flashPrice) {
      alert('กรุณากรอกชื่อแพ็กเกจและราคา Flash Sale');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-zinc-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Kanit']">
              {flashSale ? 'แก้ไขดีลฟ้าผ่า (Flash Sale)' : 'เพิ่มดีลฟ้าผ่าใหม่ (Flash Sale)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Select Existing Game (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">เลือกเกมที่ร่วมรายการ</label>
            <select
              value={formData.gameId}
              onChange={handleGameSelect}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">-- กำหนดเกมเอง / ไอเท็มพิเศษ --</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.publisher || 'Official'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อเกม / หมวดหมู่ *</label>
              <input
                type="text"
                required
                value={formData.gameName}
                onChange={e => setFormData({ ...formData, gameName: e.target.value })}
                placeholder="เช่น ROV, Free Fire, Valorant"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อแพ็กเกจ Flash Sale *</label>
              <input
                type="text"
                required
                value={formData.packageName}
                onChange={e => setFormData({ ...formData, packageName: e.target.value })}
                placeholder="เช่น 360 คูปอง, 1,000 VP"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">รูปภาพสินค้า / ไอคอนเกม</label>
            <ImageUploader
              value={formData.icon}
              onChange={(url) => setFormData({ ...formData, icon: url })}
            />
          </div>

          {/* Pricing & Discount */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">ราคาปกติ (บาท)</label>
              <input
                type="number"
                min="1"
                value={formData.originalPrice}
                onChange={e => handlePriceChange('originalPrice', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">ราคา Flash Sale *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.flashPrice}
                onChange={e => handlePriceChange('flashPrice', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 border border-amber-500 text-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-red-400 mb-1">ส่วนลด (%)</label>
              <div className="px-2.5 py-1.5 text-xs font-black rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-center">
                -{formData.discountPercent}%
              </div>
            </div>
          </div>

          {/* Stock control */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">สต็อกทั้งหมด (สิทธิ์)</label>
              <input
                type="number"
                min="1"
                value={formData.totalStock}
                onChange={e => setFormData({ ...formData, totalStock: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ขายไปแล้ว (สิทธิ์)</label>
              <input
                type="number"
                min="0"
                value={formData.soldStock}
                onChange={e => setFormData({ ...formData, soldStock: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Currency details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">จำนวนหน่วยเงินที่ได้รับ</label>
              <input
                type="number"
                value={formData.currencyAmount}
                onChange={e => setFormData({ ...formData, currencyAmount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อหน่วยเงิน</label>
              <input
                type="text"
                value={formData.currencyName}
                onChange={e => setFormData({ ...formData, currencyName: e.target.value })}
                placeholder="เช่น คูปอง, เพชร, VP"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
            >
              {flashSale ? 'บันทึกการแก้ไข' : 'เพิ่มดีลฟ้าผ่า'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
