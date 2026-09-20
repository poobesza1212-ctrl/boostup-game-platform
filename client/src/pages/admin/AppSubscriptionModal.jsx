import React, { useState, useEffect } from 'react';
import { X, Film, Plus, Trash2 } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

export default function AppSubscriptionModal({ isOpen, onClose, onSave, appSubscription }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    publisher: '',
    badge: 'พรีเมียม',
    icon: '',
    plans: []
  });

  const [newPlan, setNewPlan] = useState({ name: '', price: '', originalPrice: '' });

  useEffect(() => {
    if (appSubscription) {
      setFormData({
        id: appSubscription.id || '',
        name: appSubscription.name || '',
        publisher: appSubscription.publisher || '',
        badge: appSubscription.badge || 'พรีเมียม',
        icon: appSubscription.icon || '',
        plans: appSubscription.plans ? [...appSubscription.plans] : []
      });
    } else {
      setFormData({
        id: '',
        name: '',
        publisher: '',
        badge: 'พรีเมียม',
        icon: '',
        plans: [
          { id: 'plan_1m', name: 'สมาชิก 1 เดือน', price: 99, originalPrice: 159 },
          { id: 'plan_3m', name: 'สมาชิก 3 เดือน', price: 279, originalPrice: 477 },
          { id: 'plan_1y', name: 'สมาชิก 1 ปี', price: 990, originalPrice: 1590 }
        ]
      });
    }
  }, [appSubscription, isOpen]);

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price) return;
    const item = {
      id: `plan_${Date.now()}`,
      name: newPlan.name,
      price: Number(newPlan.price),
      originalPrice: Number(newPlan.originalPrice) || Number(newPlan.price)
    };
    setFormData(prev => ({
      ...prev,
      plans: [...prev.plans, item]
    }));
    setNewPlan({ name: '', price: '', originalPrice: '' });
  };

  const handleRemovePlan = (id) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.filter(p => p.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('กรุณากรอกชื่อบริการแอป');
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
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Kanit']">
              {appSubscription ? 'แก้ไขบริการแอป (App Subscription)' : 'เพิ่มบริการแอปใหม่ (App Subscription)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อบริการแอป *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น YouTube Premium, Netflix 4K, Canva Pro, ChatGPT Plus"
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ผู้ให้บริการ / บริษัท</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="เช่น Google, Netflix, OpenAI"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ป้ายกำกับ (Badge)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                placeholder="เช่น ไม่มีโฆษณา, 4K UHD, บูสต์เซิร์ฟ"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">รูปไอคอน / โลโก้แอป</label>
            <ImageUploader
              value={formData.icon}
              onChange={(url) => setFormData({ ...formData, icon: url })}
            />
          </div>

          {/* Plans List */}
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-zinc-300 font-['Kanit']">
              แพ็กเกจระยะเวลา (Subscription Plans)
            </label>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {formData.plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{p.name}</span>
                    {p.originalPrice > p.price && (
                      <span className="text-[10px] text-zinc-500 line-through">฿{p.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold">฿{p.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlan(p.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.plans.length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-2">ยังไม่มีแพ็กเกจระยะเวลา</p>
              )}
            </div>

            {/* Add Plan Input */}
            <div className="grid grid-cols-12 gap-2 pt-2 border-t border-zinc-800/80">
              <input
                type="text"
                value={newPlan.name}
                onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                placeholder="ชื่อแพ็กเกจ เช่น 1 เดือน"
                className="col-span-5 px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-white"
              />
              <input
                type="number"
                value={newPlan.originalPrice}
                onChange={e => setNewPlan({ ...newPlan, originalPrice: e.target.value })}
                placeholder="ราคาปกติ"
                className="col-span-3 px-2 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400"
              />
              <input
                type="number"
                value={newPlan.price}
                onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                placeholder="ราคาขาย *"
                className="col-span-2 px-2 py-1.5 text-xs rounded-lg bg-zinc-900 border border-purple-500 text-white"
              />
              <button
                type="button"
                onClick={handleAddPlan}
                className="col-span-2 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20 hover:brightness-110 transition-all"
            >
              {appSubscription ? 'บันทึกการแก้ไข' : 'เพิ่มบริการแอป'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
