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
  Headphones
} from 'lucide-react';

const QUICK_INQUIRIES = [
  '⚡ เติมเงินแล้วไอเทมยังไม่เข้า',
  '💳 แจ้งสลิปโอนเงิน / พร้อมเพย์',
  '🎁 ติดปัญหาซองของขวัญ TrueMoney',
  '👤 ต้องการคุยกับเจ้าหน้าที่'
];

export default function LiveChatModal({ isOpen, onClose, user, contactLine = '@boostup' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const handleSendMessage = async (textToSend = null) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

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
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] sm:max-w-[400px] h-[560px] max-h-[85vh] bg-[#0c1017] border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 font-['Kanit']">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-zinc-950 via-[#0e1622] to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0c1017] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">ฝ่ายบริการลูกค้า 24 ชม.</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-medium">แชทสด</span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>แอดมินกำลังออนไลน์ (ตอบกลับทันที)</span>
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

      {/* LINE OA Quick Banner */}
      <div className="px-4 py-2 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center justify-between text-[11px] shrink-0">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090d13]/60 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* Quick Question Chips (Always shown at top or when few messages) */}
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
          const isMe = msg.sender === 'customer';
          const isBot = msg.sender === 'bot';

          if (isBot) {
            return (
              <div key={msg.id || idx} className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-emerald-950/40 border border-emerald-800/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{msg.senderName}</span>
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed">{msg.text}</p>
                <div className="text-[9px] text-zinc-500 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="text-[10px] text-zinc-400 px-1">
                {isMe ? 'คุณ' : msg.senderName || 'แอดมิน BOOSTUP'}
              </div>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-sm'
                }`}
              >
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
          placeholder="พิมพ์ข้อความสอบถามที่นี่... (Enter เพื่อส่ง)"
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
