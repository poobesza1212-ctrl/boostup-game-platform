import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Coins, 
  Wallet, 
  Gift, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Percent 
} from 'lucide-react';
import Swal from '../utils/swal';

export default function AffiliateModal({ isOpen, onClose, user, onOpenLogin }) {
  const [affiliateData, setAffiliateData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    setIsLoading(true);
    fetch(`/api/user/affiliate/${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.affiliate) {
          setAffiliateData(data.affiliate);
        }
      })
      .catch(err => console.error("Error loading affiliate data:", err))
      .finally(() => setIsLoading(false));
  }, [isOpen, user]);

  if (!isOpen) return null;

  const referralCode = affiliateData?.referralCode || user?.referralCode || (user?.id ? `REF${user.id.slice(-6)}` : 'REF888');
  const referralUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralCode}` : `https://boostup.store/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกลิงก์สำเร็จ!',
      text: 'นำลิงก์นี้ไปแชร์ให้เพื่อนของคุณได้ทันที เมื่อเพื่อนเติมเงิน คุณจะได้รับค่าคอมมิชชั่น 2% อัตโนมัติ',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#141824] via-[#0d1017] to-black border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-zinc-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Kanit'] flex items-center gap-2">
                ระบบแนะนำเพื่อนรับค่าคอมมิชชั่น
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                  รับ 2.0% ทุกออเดอร์
                </span>
              </h2>
              <p className="text-xs text-zinc-400">ชวนเพื่อนมาเติมเกม รับเงินเข้ากระเป๋าถาวรตลอดชีพ!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {!user ? (
            <div className="p-8 text-center space-y-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <Users className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">กรุณาเข้าสู่ระบบเพื่อรับลิงก์แนะนำเพื่อน</h3>
              <p className="text-xs text-zinc-400">เข้าสู่ระบบเพื่อเริ่มสร้างรายได้จากค่าคอมมิชชั่น 2% และรับตั๋วหมุนวงล้อฟรี!</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
              >
                เข้าสู่ระบบเลย
              </button>
            </div>
          ) : (
            <>
              {/* Earnings Overview Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-zinc-950 border border-purple-500/30 text-center">
                  <div className="text-[11px] text-zinc-400">เพื่อนที่แนะนำ</div>
                  <div className="text-xl font-black text-white mt-1 font-['Kanit'] flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>{affiliateData?.referralCount || 0}</span>
                  </div>
                  <div className="text-[10px] text-purple-400 mt-0.5">คน</div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-zinc-950 border border-emerald-500/30 text-center">
                  <div className="text-[11px] text-zinc-400">รายได้คอมมิชชั่น</div>
                  <div className="text-xl font-black text-emerald-400 mt-1 font-['Kanit'] flex items-center justify-center gap-1">
                    <Coins className="w-4 h-4" />
                    <span>฿{(affiliateData?.totalEarnings || 0).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">เข้ากระเป๋าทันที</div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-zinc-950 border border-amber-500/30 text-center">
                  <div className="text-[11px] text-zinc-400">ตั๋วหมุนวงล้อฟรี</div>
                  <div className="text-xl font-black text-amber-400 mt-1 font-['Kanit'] flex items-center justify-center gap-1">
                    <Gift className="w-4 h-4" />
                    <span>{affiliateData?.spinTickets || 0}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">+1 สิทธิ์ / เพื่อน 1 คน</div>
                </div>
              </div>

              {/* Referral Link & Code Box */}
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>ลิงก์แนะนำของคุณ (Referral Link)</span>
                  </label>
                  <span className="text-[11px] text-purple-400 font-semibold">
                    รหัสแนะนำ: <strong className="text-white">{referralCode}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    className="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs font-mono select-all focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  💡 ส่งลิงก์นี้ให้เพื่อน เมื่อเพื่อนสมัครสมาชิกหรือสั่งซื้อสินค้าผ่านลิงก์นี้ คุณจะได้รับส่วนแบ่ง <strong>2% ของยอดชำระ</strong> เติมเข้ากระเป๋าของคุณอัตโนมัติทันทีที่ออเดอร์สำเร็จ!
                </p>
              </div>

              {/* How it works steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase">ขั้นตอนการสร้างรายได้</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center mx-auto mb-1.5">1</div>
                    <div className="font-bold text-white text-[11px]">แชร์ลิงก์</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">ส่งต่อให้เพื่อนในกลุ่มหรือโซเชียล</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center mx-auto mb-1.5">2</div>
                    <div className="font-bold text-white text-[11px]">เพื่อนเติมเกม</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">เพื่อนสั่งซื้อแพ็กเกจใดก็ได้ในร้าน</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center mx-auto mb-1.5">3</div>
                    <div className="font-bold text-white text-[11px]">รับเงิน 2% ทันที</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">เงินเข้ากระเป๋าใช้ซื้อเกมต่อได้</div>
                  </div>
                </div>
              </div>

              {/* Referred Friends Detailed List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>เพื่อนที่สมัครผ่านลิงก์ของคุณ ({affiliateData?.referredUsers?.length || 0} คน)</span>
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    เติมเงินแล้ว: <strong className="text-emerald-400">{affiliateData?.activeReferred || 0}</strong> คน
                  </span>
                </div>

                {(!affiliateData?.referredUsers || affiliateData.referredUsers.length === 0) ? (
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-500">
                    ยังไม่มีเพื่อนสมัครผ่านลิงก์นี้ คัดลอกลิงก์ด้านบนแล้วส่งให้เพื่อนเพื่อเริ่มรับรายได้ได้เลย! ✨
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                        <tr>
                          <th className="py-2.5 px-3">ผู้ใช้งาน</th>
                          <th className="py-2.5 px-3">วันที่สมัคร</th>
                          <th className="py-2.5 px-3 text-center">ออเดอร์</th>
                          <th className="py-2.5 px-3 text-right">คอมมิชชั่นที่ได้รับ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850 text-zinc-300">
                        {affiliateData.referredUsers.map((friend) => (
                          <tr key={friend.id} className="hover:bg-zinc-900/40">
                            <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                                {friend.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <span>{friend.username || friend.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-500">
                              {friend.createdAt ? new Date(friend.createdAt).toLocaleDateString('th-TH') : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {friend.ordersCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                                  {friend.ordersCount} บิล
                                </span>
                              ) : (
                                <span className="text-zinc-600">ยังไม่เติม</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                              {friend.commissionGenerated > 0 ? `+฿${friend.commissionGenerated.toFixed(2)}` : '฿0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Commissions List */}
              {affiliateData?.recentCommissions && affiliateData.recentCommissions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase">ประวัติคอมมิชชั่นล่าสุด</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {affiliateData.recentCommissions.map(txn => (
                      <div key={txn.id} className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">{txn.description || 'ค่าคอมมิชชั่นจากเพื่อน'}</div>
                          <div className="text-[10px] text-zinc-500">{new Date(txn.createdAt).toLocaleString('th-TH')}</div>
                        </div>
                        <span className="font-bold text-emerald-400">+฿{Number(txn.amount || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
