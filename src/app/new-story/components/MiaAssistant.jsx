'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiActivity, FiArrowRight, FiSmile } from 'react-icons/fi';

export default function MiaAssistant({ editorRef, onInsertText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Mia, your writing assistant. How can I help you write your story today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPuterSignedIn, setIsPuterSignedIn] = useState(false);
  const [puterUsage, setPuterUsage] = useState(null);

  const puterRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    import('@heyputer/puter.js')
      .then((module) => {
        puterRef.current = module.default || module;
        checkPuterStatus();
      })
      .catch((err) => console.error('Failed to load puter.js inside assistant:', err));
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const checkPuterStatus = async () => {
    if (!puterRef.current) return;
    try {
      const signedIn = puterRef.current.auth.isSignedIn();
      setIsPuterSignedIn(signedIn);
      if (signedIn) {
        const usage = await puterRef.current.auth.getMonthlyUsage();
        setPuterUsage(usage);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    if (!isPuterSignedIn) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: 'Please connect your Puter.js account in your Profile settings first so that we can write together using your quota!' }
      ]);
      setInput('');
      return;
    }

    const userText = input;
    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    try {
      // Puter AI Chat integration (client-side, user-pays)
      const response = await puterRef.current.ai.chat(
        newMessages.map(m => ({ role: m.role, content: m.content }))
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response.message.content }]);
      
      // Update balance/quota
      const usage = await puterRef.current.auth.getMonthlyUsage();
      setPuterUsage(usage);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an error. Please verify your Puter quota and connection.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const remaining = puterUsage?.allowanceInfo?.remaining ?? 0;
  const total = puterUsage?.allowanceInfo?.total ?? 1;
  const usagePercent = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));

  return (
    <>
      {/* Floating Mia Helper toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent hover:bg-white text-bg-dark rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 group border border-accent/20"
        title="Ask Mia (AI Assistant)"
      >
        <FiMessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
      </button>

      {/* Drawer panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-[#0a0a0d] border-l border-neutral-900 z-50 flex flex-col shadow-2xl animate-fade-in font-sans">
          {/* Header */}
          <div className="p-4 border-b border-neutral-900 flex justify-between items-center bg-neutral-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/50 bg-[#08080a] flex items-center justify-center">
                <img src="/mia.webp" alt="Mia Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white">Mia Assistant</h4>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Puter.js Powered AI</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-white font-light text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Puter Usage display */}
          {isPuterSignedIn && puterUsage && (
            <div className="p-3 bg-neutral-950 border-b border-neutral-900/60 text-left">
              <div className="flex justify-between text-[10px] font-mono text-neutral-450 mb-1">
                <span>Puter Quota Used</span>
                <span>{usagePercent.toFixed(1)}% ({((total - remaining) / 1000000).toFixed(2)}¢)</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                <div className="h-full bg-accent" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          )}

          {/* Messages list */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-neutral-950/20 text-left"
          >
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' 
                    ? 'bg-accent text-bg-dark rounded-tr-none font-medium' 
                    : 'bg-neutral-900 border border-neutral-850 text-neutral-200 rounded-tl-none leading-relaxed'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  
                  {/* Action link to insert generated text if assistant message */}
                  {m.role === 'assistant' && idx > 0 && (
                    <button
                      onClick={() => onInsertText(m.content)}
                      className="mt-2 text-[10px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer bg-neutral-950/80 px-2 py-1 rounded border border-accent/20"
                    >
                      Insert in story <FiArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="bg-neutral-900 border border-neutral-850 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="p-3 border-t border-neutral-900 bg-neutral-950 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPuterSignedIn ? "Write prompt (e.g. outline my draft)..." : "Connect Puter.js in Profile settings"}
              className="flex-1 bg-neutral-900 border border-neutral-850 focus:border-accent/40 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 shrink-0 bg-accent disabled:bg-neutral-800 disabled:text-neutral-500 text-bg-dark rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
