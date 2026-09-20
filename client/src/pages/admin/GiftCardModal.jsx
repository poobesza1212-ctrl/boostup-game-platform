import React, { useState, useEffect } from 'react';
import { X, CreditCard, Plus, Trash2 } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

export default function GiftCardModal({ isOpen, onClose, onSave, giftCard }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    publisher: '',
    category: '',
    badge: 'จัดส่งรหัสทันที',
    icon: '',
    denominations: []
  });

  const [newDeno, setNewDeno] = useState({ name: '', price: '' });

  useEffect(() => {
    if (giftCard) {
      setFormData({
        id: giftCard.id || '',
        name: giftCard.name || '',
        publisher: giftCard.publisher || '',
        category: giftCard.category || 'Game Card',
        badge: giftCard.badge || 'จัดส่งรหัสทันที',
        icon: giftCard.icon || '',
        denominations: giftCard.denominations ? [...giftCard.denominations] : []
      });
    } else {
      setFormData({
        id: '',
        name: '',
        publisher: '',
        category: 'Universal Game Card',
        badge: 'จัดส่งรหัสทันที',
        icon: '',
        denominations: [
          { id: 'deno_1', name: '100 THB', price: 100 },
          { id: 'deno_2', name: '300 THB', price: 300 },
          { id: 'deno_3', name: '500 THB', price: 500 },
          { id: 'deno_4', name: '1,000 THB', price: 1000 }
        ]
      });
    }
  }, [giftCard, isOpen]);

  const handleAddDenomination = () => {
    if (!newDeno.name || !newDeno.price) return;
    const item = {
      id: `deno_${Date.now()}`,
      name: newDeno.name,
      price: Number(newDeno.price)
    };
    setFormData(prev => ({
      ...prev,
      denominations: [...prev.denominations, item]
    }));
    setNewDeno({ name: '', price: '' });
  };

  const handleRemoveDenomination = (id) => {
    setFormData(prev => ({
      ...prev,
      denominations: prev.denominations.filter(d => d.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('กรุณากรอกชื่อบัตรเติมเงิน');
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
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Kanit']">
              {giftCard ? 'แก้ไขบัตรเติมเงิน (Gift Card)' : 'เพิ่มบัตรเติมเงินใหม่ (Gift Card)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อบัตรเติมเงิน *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น Steam Wallet Code (THB), Razer Gold PIN"
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ผู้ผลิต / แบรนด์</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="เช่น Valve, Razer, Roblox"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ป้ายกำกับ (Badge)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                placeholder="เช่น จัดส่งรหัสทันที, ยอดนิยม"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">รูปภาพบัตร / โลโก้</label>
            <ImageUploader
              value={formData.icon}
              onChange={(url) => setFormData({ ...formData, icon: url })}
            />
          </div>

          {/* Denominations List */}
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-zinc-300 font-['Kanit']">
              รายการราคา & หน่วยเงิน (Denominations)
            </label>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {formData.denominations.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">฿{d.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDenomination(d.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.denominations.length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-2">ยังไม่มีรายการราคา</p>
              )}
            </div>

            {/* Add Denomination Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
              <input
                type="text"
                value={newDeno.name}
                onChange={e => setNewDeno({ ...newDeno, name: e.target.value })}
                placeholder="ชื่อราคา เช่น 100 THB"
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-white"
              />
              <input
                type="number"
                value={newDeno.price}
                onChange={e => setNewDeno({ ...newDeno, price: e.target.value })}
                placeholder="ราคาขาย (฿)"
                className="w-24 px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-white"
              />
              <button
                type="button"
                onClick={handleAddDenomination}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่ม
              </button>
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:brightness-110 transition-all"
            >
              {giftCard ? 'บันทึกการแก้ไข' : 'เพิ่มบัตรเติมเงิน'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
