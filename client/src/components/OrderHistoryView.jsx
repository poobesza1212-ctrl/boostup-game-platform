import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCw, 
  Calendar, 
  Filter, 
  CreditCard, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  ChevronRight, 
  Inbox, 
  X, 
  ArrowLeft,
  Key,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function OrderHistoryView({
  user,
  games = [],
  onBackToHome,
  onViewReceipt,
  onOpenAuth
}) {
  // Filters State
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [searchGameUid, setSearchGameUid] = useState('');

  // Data State
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // My Cards (บัตรของฉัน) Modal State
  const [showMyCardsModal, setShowMyCardsModal] = useState(false);
  const [myCards, setMyCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id);
      if (searchOrderNumber.trim()) params.append('orderNumber', searchOrderNumber.trim());
      if (searchGameUid.trim()) params.append('gameUid', searchGameUid.trim());
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedGame && selectedGame !== 'all') params.append('gameId', selectedGame);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const res = await fetch(`/api/orders/history?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setTotalCount(data.count || 0);
      } else {
        setOrders([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setDateRange({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setSelectedCategory('all');
    setSelectedGame('all');
    setSelectedStatus('all');
    setSearchOrderNumber('');
    setSearchGameUid('');
    setTimeout(() => {
      fetchOrders();
    }, 50);
  };

  // Open My Cards Modal & fetch cards
  const handleOpenMyCards = async () => {
    setShowMyCardsModal(true);
    setIsLoadingCards(true);
    try {
      const url = user?.id ? `/api/orders/my-cards?userId=${user.id}` : '/api/orders/my-cards';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMyCards(data.cards || []);
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-zinc-800 py-8 px-4 sm:px-6 lg:px-8 font-['Prompt']">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back button & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าแรก</span>
          </button>
          <div className="text-xs text-zinc-500 font-medium">
            หน้าแรก / <span className="font-bold text-zinc-800">ประวัติการสั่งซื้อ</span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 p-6 sm:p-8 space-y-6">
          
          {/* Header Row (Title + Yellow Button 'บัตรของฉัน') */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 font-['Kanit'] tracking-tight">
                รายการคำสั่งซื้อ
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                ตรวจสอบสถานะและประวัติการเติมเกม / บัตรเติมเงิน / ต่ออายุแอปพลิเคชันทั้งหมดของคุณ
              </p>
            </div>

            {/* Yellow 'บัตรของฉัน' Button matching Image 1 */}
            <button
              type="button"
              onClick={handleOpenMyCards}
              className="bg-[#facc15] hover:bg-[#eab308] active:scale-95 text-black font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-300/40 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Kanit']"
            >
              <CreditCard className="w-4 h-4 text-black" />
              <span>บัตรของฉัน</span>
            </button>
          </div>

          {/* Filter Form Controls matching Image 1 layout */}
          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* วันที่สั่งซื้อ */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">วันที่สั่งซื้อ</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                  <span className="text-zinc-400 text-xs">~</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {/* ประเภท */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">ประเภท</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-zinc-700"
                >
                  <option value="all">เลือกประเภท</option>
                  <option value="uid_only">เติมเกม UID</option>
                  <option value="gift_card">บัตรเติมเงิน</option>
                  <option value="app_subscription">ต่ออายุสมาชิกแอพ</option>
                </select>
              </div>

              {/* เกม */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">เกม</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-zinc-700"
                >
                  <option value="all">เลือกเกม</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* สถานะ */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">สถานะ</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-zinc-700"
                >
                  <option value="all">เลือกสถานะ</option>
                  <option value="completed">สำเร็จ (Completed)</option>
                  <option value="pending">รอดำเนินการ (Pending)</option>
                  <option value="failed">ยกเลิก / ไม่สำเร็จ</option>
                </select>
              </div>

            </div>

            {/* Filter Row 2 (เลขที่ใบสั่งซื้อ, Game UID, ปุ่มค้นหา) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              
              {/* เลขที่ใบสั่งซื้อ */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">เลขที่ใบสั่งซื้อ</label>
                <input
                  type="text"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  placeholder="เลขที่ใบสั่งซื้อ เช่น BST-..."
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white placeholder-zinc-400"
                />
              </div>

              {/* Game UID */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">Game UID</label>
                <input
                  type="text"
                  value={searchGameUid}
                  onChange={(e) => setSearchGameUid(e.target.value)}
                  placeholder="Game UID"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white placeholder-zinc-400"
                />
              </div>

              {/* Action Buttons: Yellow 'ค้นหา' and Reset */}
              <div className="flex items-center gap-2 lg:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#facc15] hover:bg-[#eab308] active:scale-95 text-black font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer font-['Kanit'] disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
                >
                  ล้างค่า
                </button>

                <span className="text-[11px] text-zinc-400 ml-auto hidden sm:inline">
                  พบทั้งหมด <strong>{totalCount}</strong> รายการ
                </span>
              </div>

            </div>

          </form>

          {/* Orders Table Container matching Image 1 layout */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-600 font-semibold font-['Kanit']">
                  <th className="py-3 px-4 w-12 text-center">ลำดับ.</th>
                  <th className="py-3 px-4 min-w-[140px]">เลขที่ใบสั่งซื้อ</th>
                  <th className="py-3 px-4 min-w-[110px]">ประเภท</th>
                  <th className="py-3 px-4 min-w-[140px]">เกม</th>
                  <th className="py-3 px-4 min-w-[140px]">แพ็กเกจ</th>
                  <th className="py-3 px-4 min-w-[120px]">Game UID</th>
                  <th className="py-3 px-4 min-w-[130px]">วันที่สั่งซื้อ</th>
                  <th className="py-3 px-4 min-w-[90px] text-right">ราคาสินค้า</th>
                  <th className="py-3 px-4 min-w-[90px] text-center">สถานะ</th>
                  <th className="py-3 px-4 min-w-[110px] text-center">หลักฐาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.length > 0 ? (
                  orders.map((item, index) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-medium text-zinc-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        <div className="flex items-center gap-1">
                          <span>{item.orderNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.orderNumber, item.id)}
                            className="text-zinc-400 hover:text-zinc-700 p-0.5"
                            title="คัดลอกเลขออเดอร์"
                          >
                            {copiedCodeId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200">
                          {item.typeLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">
                        {item.gameName}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700">
                        {item.packageName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600">
                        {item.playerId}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                        {new Date(item.createdAt).toLocaleString('th-TH', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 text-right font-['Kanit']">
                        ฿{item.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.status === 'failed'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onViewReceipt && onViewReceipt(item.rawOrder || item)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-red-700 text-white text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          title="ดูสลิปและใบเสร็จดิจิทัล"
                        >
                          <FileText className="w-3 h-3" />
                          <span>ดูสลิป</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty State exactly matching Image 1 */
                  <tr>
                    <td colSpan={10} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        {/* Box/Inbox Tray Outline Icon matching Image 1 */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-zinc-300">
                          <Inbox className="w-12 h-12 stroke-[1.2]" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-400">
                          No Data
                        </p>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          ไม่พบรายการคำสั่งซื้อตามเงื่อนไขที่เลือก หรือยังไม่มีประวัติการทำรายการ
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL: บัตรของฉัน (MY CARDS & DIGITAL VOUCHERS)           */}
      {/* ========================================================= */}
      {showMyCardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-black flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-black" />
                <h2 className="text-lg font-black font-['Kanit'] tracking-tight">
                  บัตรของฉัน (My Vouchers & Digital Cards)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMyCardsModal(false)}
                className="p-1 rounded-full hover:bg-black/10 text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {isLoadingCards ? (
                <div className="py-12 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>กำลังโหลดรายการบัตรของคุณ...</span>
                </div>
              ) : myCards.length > 0 ? (
                <div className="space-y-3">
                  {myCards.map((card, idx) => (
                    <div 
                      key={card.id || idx}
                      className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-amber-400 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-zinc-900 text-sm font-['Kanit']">{card.cardName}</div>
                          <div className="text-xs text-zinc-500">{card.packageName} • ฿{card.amount.toFixed(2)}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {card.statusLabel || 'พร้อมใช้งาน'}
                        </span>
                      </div>

                      {/* Code Box with 1-click copy */}
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">รหัสบัตร / Digital Code</div>
                          <div className="text-sm font-mono font-black text-zinc-900 tracking-wider">
                            {card.digitalCode}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(card.digitalCode, card.id + '_code')}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCodeId === card.id + '_code' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-800" />
                              <span>คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>คัดลอก</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Optional PIN if exists */}
                      {card.pin && (
                        <div className="flex items-center justify-between text-xs px-1 text-zinc-500">
                          <span>รหัส PIN สำหรับเปิดใช้งาน: <strong className="font-mono text-zinc-900">{card.pin}</strong></span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(card.pin, card.id + '_pin')}
                            className="text-amber-600 hover:text-amber-700 font-bold text-[11px] cursor-pointer"
                          >
                            {copiedCodeId === card.id + '_pin' ? 'คัดลอก PIN แล้ว' : 'คัดลอก PIN'}
                          </button>
                        </div>
                      )}

                      <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60 flex items-center justify-between">
                        <span>เลขออเดอร์: {card.orderNumber}</span>
                        <span>{new Date(card.createdAt).toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-zinc-600">ยังไม่มีรายการบัตรเติมเงินในบัญชีของคุณ</p>
                  <p className="text-[11px] text-zinc-400">เมื่อสั่งซื้อบัตรเติมเงินหรือบัตร Gift Voucher รหัสจะปรากฏที่นี่ทันที</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowMyCardsModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
