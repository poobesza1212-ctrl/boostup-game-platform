import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import LiveChatModal from './LiveChatModal';

export default function FloatingSupport({ contactLine = '@boostup', user = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAdminMessage, setHasNewAdminMessage] = useState(false);

  // Background check for unread admin messages
  useEffect(() => {
    const sid = localStorage.getItem('boostup_chat_sid');
    if (!sid || isOpen) return;

    const checkUnread = async () => {
      try {
        const params = new URLSearchParams({
          sessionId: sid,
          ...(user?.id ? { userId: user.id } : {})
        });
        const res = await fetch(`/api/chat/session?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.chat?.unreadCustomer > 0) {
          setHasNewAdminMessage(true);
        } else {
          setHasNewAdminMessage(false);
        }
      } catch (e) {}
    };

    checkUnread();
    const timer = setInterval(checkUnread, 8000);
    return () => clearInterval(timer);
  }, [isOpen, user]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewAdminMessage(false);
    }
  };

  return (
    <>
      {/* Live Chat Modal Window */}
      <LiveChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        contactLine={contactLine}
      />

      {/* Main Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
          
          {/* New message tooltip bubble if admin replied while chat was closed */}
          {hasNewAdminMessage && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg animate-bounce flex items-center gap-1.5 font-['Kanit']">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>แอดมินตอบกลับข้อความแล้ว!</span>
            </div>
          )}

          <button
            onClick={handleToggle}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-2xl shadow-emerald-600/40 transition-all duration-300 hover:scale-105 cursor-pointer font-['Kanit']"
            aria-label="Contact Customer Support"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="tracking-wide">แชทสดกับแอดมิน 24 ชม.</span>
            {hasNewAdminMessage && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
