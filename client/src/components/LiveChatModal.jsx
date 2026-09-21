import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  Clock, 
  Sparkles,
  HelpCircle,
  Headphones,
  Bot,
  UserCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const QUICK_INQUIRIES = [
  '⚡ เติมเงินแล้วออเดอร์ยังไม่เข้า',
  '💎 วิธีสั่งซื้อและรับ Robux',
  '💳 แจ้งสลิปโอนเงิน / ปัญหาซอง TrueMoney',
  '👨‍💼 ติดต่อขอคุยกับแอดมินคนจริง'
];

export default function LiveChatModal({ isOpen, onClose, user, contactLine = '@boostup' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatMode, setChatMode] = useState('ai'); // 'ai' | 'human'
  const [needsHumanAttention, setNeedsHumanAttention] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or get persistent session ID
  const getSessionId = () => {
    let sid = localStorage.getItem('boostup_chat_sid');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('boostup_chat_sid', sid);
    }
    return sid;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch or sync chat messages
  const syncChat = async () => {
    try {
      const sid = getSessionId();
      const params = new URLSearchParams({
        sessionId: sid,
        ...(user?.id ? { userId: user.id } : {}),
        ...(user?.name || user?.username ? { customerName: user.name || user.username } : {})
      });

      const res = await fetch(`/api/chat/session?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.chat) {
        setChatId(data.chat.id);
        setMessages(data.chat.messages || []);
        if (data.chat.mode) setChatMode(data.chat.mode);
        setNeedsHumanAttention(!!data.chat.needsHumanAttention);
      }
    } catch (err) {
      console.error("LiveChat sync error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen) {
      syncChat();
    }
  }, [isOpen, user]);

  // Periodic poll every 3s when chat is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(syncChat, 3000);
    return () => clearInterval(interval);
  }, [isOpen, chatId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle switching between AI mode and Human mode
  const handleSwitchMode = async (targetMode) => {
    if (isSwitchingMode) return;
    setIsSwitchingMode(true);
    try {
      const sid = getSessionId();
      const res = await fetch('/api/chat/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sessionId: sid,
          userId: user?.id || null,
          customerName: user?.name || user?.username || 'ลูกค้า (Guest)',
          mode: targetMode
        })
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setChatId(data.chat.id);
        setMessages(data.chat.messages || []);
        if (data.chat.mode) setChatMode(data.chat.mode);
        setNeedsHumanAttention(!!data.chat.needsHumanAttention);
      }
    } catch (err) {
      console.error("Failed to switch chat mode:", err);
    } finally {
      setIsSwitchingMode(false);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

    // Special quick action: if user clicked "คุยกับแอดมินคนจริง"
    if (content === '👨‍💼 ติดต่อขอคุยกับแอดมินคนจริง' && chatMode === 'ai') {
      setInputText('');
      handleSwitchMode('human');
      return;
    }

    setIsSending(true);
    setInputText('');

    const sid = getSessionId();
    const customerName = user?.name || user?.username || 'ลูกค้า (Guest)';

    // Optimistic message append
    const tempMsg = {
      id: `temp_${Date.now()}`,
      sender: 'customer',
      senderName: customerName,
      text: content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sessionId: sid,
          userId: user?.id || null,
          customerName,
          text: content
        })
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setChatId(data.chat.id);
        setMessages(data.chat.messages || []);
        if (data.chat.mode) setChatMode(data.chat.mode);
        setNeedsHumanAttention(!!data.chat.needsHumanAttention);
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] sm:max-w-[400px] h-[580px] max-h-[85vh] bg-[#0c1017] border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 font-['Kanit']">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-zinc-950 via-[#0e1622] to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              chatMode === 'ai'
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-purple-500/10'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
            }`}>
              {chatMode === 'ai' ? <Bot className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c1017] ${
              chatMode === 'ai' ? 'bg-purple-500' : 'bg-emerald-500 animate-pulse'
            }`}></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {chatMode === 'ai' ? 'BOOSTUP AI Assistant 24 ชม.' : 'ฝ่ายบริการลูกค้า (เจ้าหน้าที่คนจริง)'}
              </h3>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                chatMode === 'ai'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
              }`}>
                {chatMode === 'ai' ? '🤖 AI ตอบทันที' : '👨‍💼 แอดมินคนจริง'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${chatMode === 'ai' ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`}></span>
              <span>{chatMode === 'ai' ? 'ระบบ AI ออนไลน์พร้อมตอบตลอด 24 ชั่วโมง' : 'แอดมินได้รับเรื่องแล้ว กำลังเข้าตอบ'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
            title="ปิดหน้าต่างแชท"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI vs Human Mode Switch Bar */}
      {chatMode === 'ai' ? (
        <div className="px-3.5 py-2 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-950/70 border-b border-purple-500/30 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="text-[11px] text-purple-200 truncate">
              <strong className="text-purple-300 font-semibold">AI ตอบให้อัตโนมัติ</strong> — ถามข้อมูล/เช็คสถานะได้ทันที
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSwitchMode('human')}
            disabled={isSwitchingMode}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-95"
            title="กดเพื่อส่งเรื่องให้แอดมินคนจริงเข้ามาตอบ"
          >
            <Headphones className="w-3 h-3 text-amber-400" />
            <span>ติดต่อแอดมินคนจริง</span>
          </button>
        </div>
      ) : (
        <div className="px-3.5 py-2 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <div className="text-[11px] text-amber-200 truncate">
              <strong className="text-amber-300 font-semibold">รอแอดมินคนจริง</strong> — เจ้าหน้าที่กำลังมาตอบ
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSwitchMode('ai')}
            disabled={isSwitchingMode}
            className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 hover:text-purple-200 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-95"
            title="สลับกลับไปคุยกับ AI เพื่อรับคำตอบอัตโนมัติ 24 ชม."
          >
            <Bot className="w-3 h-3 text-purple-400" />
            <span>กลับไปคุยกับ AI</span>
          </button>
        </div>
      )}

      {/* LINE OA Quick Banner */}
      <div className="px-4 py-1.5 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center justify-between text-[11px] shrink-0">
        <div className="text-zinc-300 flex items-center gap-1.5">
          <span>สะดวกคุยผ่าน LINE?</span>
          <strong className="text-emerald-400 font-mono">{contactLine}</strong>
        </div>
        <a
          href={`https://line.me/R/ti/p/${contactLine}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 hover:underline font-bold"
        >
          <span>เปิด LINE</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#090d13]/60 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* Quick Question Chips (Shown when few messages or upon first visit) */}
        {messages.length <= 2 && (
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>เลือกหัวข้อที่ต้องการความช่วยเหลือด่วน:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INQUIRIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-emerald-950 hover:border-emerald-500/50 border border-zinc-700/60 text-zinc-200 hover:text-emerald-300 text-[11px] transition-all text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, idx) => {
          const isCustomer = msg.sender === 'customer';
          const isAi = msg.sender === 'ai';
          const isAdmin = msg.sender === 'admin';
          const isSystem = msg.sender === 'system' || msg.sender === 'bot';

          if (isSystem) {
            return (
              <div key={msg.id || idx} className="p-2.5 mx-1 rounded-xl bg-zinc-900/90 border border-zinc-700/60 text-center text-xs space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-[10px]">
                  <AlertCircle className="w-3 h-3" />
                  <span>{msg.senderName || 'การแจ้งเตือนจากระบบ'}</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                <div className="text-[9px] text-zinc-500">
                  {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          }

          if (isAi) {
            return (
              <div key={msg.id || idx} className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-purple-300 px-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>BOOSTUP AI Assistant • 24 ชม.</span>
                </div>
                <div className="max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs leading-relaxed bg-gradient-to-br from-[#1c1433] via-[#151228] to-[#121626] border border-purple-500/40 text-purple-100 shadow-md shadow-purple-950/30 whitespace-pre-line">
                  {msg.text}
                </div>
                <div className="text-[9px] text-zinc-500 px-1 flex items-center gap-2">
                  <span>{new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                  {chatMode === 'ai' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('human')}
                      className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>ไม่ตรงคำตอบ? ขอคุยกับคนจริง</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          if (isAdmin) {
            return (
              <div key={msg.id || idx} className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 px-1 font-semibold">
                  <Headphones className="w-3 h-3 text-emerald-400" />
                  <span>แอดมินตัวจริง (Human Agent)</span>
                </div>
                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs leading-relaxed bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-500/40 text-emerald-100 shadow-md whitespace-pre-line">
                  {msg.text}
                </div>
                <div className="text-[9px] text-zinc-500 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          }

          // Customer message
          return (
            <div
              key={msg.id || idx}
              className="flex flex-col items-end space-y-1"
            >
              <div className="text-[10px] text-zinc-400 px-1">
                คุณ
              </div>
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-sm text-xs leading-relaxed shadow-md bg-gradient-to-r from-red-600 to-rose-600 text-white whitespace-pre-line">
                {msg.text}
              </div>
              <div className="text-[9px] text-zinc-500 px-1">
                {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={chatMode === 'ai' ? "ถามคำถาม หรือใส่รหัสออเดอร์ให้ AI เช็ค..." : "พิมพ์ข้อความสอบถามแอดมินคนจริง..."}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className={`p-2.5 rounded-xl text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 ${
            chatMode === 'ai'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
          }`}
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
