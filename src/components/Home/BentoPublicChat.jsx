'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabase';

// 4 distinct color palette derived from status themes (Emerald, Amber, Cyan, Purple)
const NAME_COLORS = [
  'text-emerald-400',
  'text-amber-400',
  'text-cyan-400',
  'text-purple-400'
];

function getUserColorClass(userName) {
  if (!userName) return NAME_COLORS[0];
  if (userName === 'Mia Hamada' || userName === 'System') return 'text-accent';
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % NAME_COLORS.length;
  return NAME_COLORS[index];
}

export default function BentoPublicChat() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Mia Hamada', text: 'Welcome to the lounge! Say hi 👋', created_at: '2026-01-01T12:00:00.000Z' }
  ]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Generate a quick fun guest name if none exists
    const storedName = localStorage.getItem('bento_chat_username');
    if (storedName) {
      setUserName(storedName);
    } else {
      const randomName = 'Guest#' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('bento_chat_username', randomName);
      setUserName(randomName);
    }

    if (!supabase) return;

    // Fetch initial public messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('public_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(30);

      if (data && data.length > 0) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public_chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_chat' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      user: userName || 'Guest',
      text: input.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setMessages(prev => [...prev, { ...newMessage, id: Date.now() }]);
    setInput('');

    if (supabase) {
      await supabase.from('public_chat').insert([newMessage]);
    }
  };

  return (
    <div className="group w-full h-full min-h-[360px] flex flex-col justify-between select-none">
      {/* Message List (removed mb-3 and pr-1) */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-neutral-700">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.user === userName;
            const userColorClass = getUserColorClass(msg.user);
            const timeStr = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 16, scale: 0.9, originX: isMe ? 1 : 0 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-xs px-3.5 pb-2 pt-2.5 rounded-2xl flex flex-col gap-0.5 leading-relaxed shadow-sm relative ${
                    isMe
                      ? 'bg-accent text-neutral-950 rounded-br-xs'
                      : 'bg-neutral-800/90 text-neutral-200 border border-white/5 rounded-tl-xs'
                  }`}
                >
                  {!isMe && (
                    <span className={`text-[11px] font-semibold tracking-wide ${userColorClass}`}>
                      {msg.user}
                    </span>
                  )}
                  {/* Pad right to prevent text from overlapping with absolutely positioned clock */}
                  <div className="pr-12 break-words">
                    {msg.text}
                  </div>
                  {timeStr && (
                    <span suppressHydrationWarning className={`text-[9px] absolute bottom-1.5 right-2.5 opacity-60 pointer-events-none select-none ${isMe ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                      {timeStr}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Form */}
      <motion.form 
        layout
        onSubmit={handleSend} 
        className={`relative flex items-center gap-2 shrink-0 pt-2 transition-opacity duration-300 ${
          !input.trim() ? 'opacity-30 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
        }`}
      >
        <motion.input
          layout
          transition={{ type: 'spring', stiffness: 550, damping: 25 }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          className="w-full bg-bg-card rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-transparent group-hover:placeholder-neutral-500 focus:placeholder-neutral-500 focus:outline-none transition-colors"
        />
        <AnimatePresence mode="popLayout">
          {input.trim() && (
            <motion.button
              layout
              key="send-btn"
              type="submit"
              initial={{ scale: 0, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 15 }}
              transition={{ type: 'spring', stiffness: 550, damping: 25 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="bg-accent text-neutral-950 p-2.5 rounded-xl shrink-0 font-bold flex items-center justify-center cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
