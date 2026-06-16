'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, SquarePen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import huddinConfig from '../../data/huddinContext.json';
import { projects } from '../../data/siteData';

let activeAudio = null;
const playKickSound = () => {
  if (typeof window !== 'undefined') {
    try {
      if (!activeAudio) {
        activeAudio = new Audio('/sounds/closing-door.mp3');
      }
      activeAudio.currentTime = 0;
      const playPromise = activeAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          // Safe check to ignore browser-aborted media playback interrupts
          if (e.name !== 'AbortError') {
            console.warn("Audio playback issue:", e);
          }
        });
      }
    } catch (err) {
      console.warn("Audio init failed:", err);
    }
  }
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('right'); // 'left' | 'right'
  const [isBlocked, setIsBlocked] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about Huddin\'s projects, services, or availability!)*' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  // Ban Overlay states
  const [banTimeLeft, setBanTimeLeft] = useState(180);
  const [lastWords, setLastWords] = useState('');
  const [isCheckingApology, setIsCheckingApology] = useState(false);
  const [apologyResult, setApologyResult] = useState('');
  const [banHistory, setBanHistory] = useState([
    { sender: 'nico', content: '*Nico the hover-drone grabs you by the neck and drags you outside the house!*' },
    { sender: 'nico', content: "We don't accept bad attitude, please bring your honor. What are your last words?" }
  ]);
  const [isForgivenButNicoNot, setIsForgivenButNicoNot] = useState(false);
  const [banInputHidden, setBanInputHidden] = useState(false);
  const [isKickingOut, setIsKickingOut] = useState(false);

  const messagesEndRef = useRef(null);
  const banHistoryEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  const quickPrompts = [
    'What are Huddin\'s services?',
    'Show me Huddin\'s projects',
    'What can you do?',
  ];

  // Handle click outside to close chatbot
  useEffect(() => {
    function handleClickOutside(event) {
      if (isBlocked) return; // Disable closing when blocked/punished
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isBlocked]);

  // Handle ban page countdown
  useEffect(() => {
    if (!isOpen || !isBlocked) {
      setBanTimeLeft(180); // Reset if closed
      setIsForgivenButNicoNot(false);
      setBanInputHidden(false);
      setBanHistory([
        { sender: 'nico', content: '*Nico the hover-drone grabs you by the neck and drags you outside the house!*' },
        { sender: 'nico', content: "We don't accept bad attitude, please bring your honor. What are your last words?" }
      ]);
      return;
    }
    
    if (banTimeLeft <= 0) {
      if (typeof window !== 'undefined') {
        if (isForgivenButNicoNot) {
          localStorage.removeItem('mia_blocked_time');
          setIsBlocked(false);
          setMessages([
            { role: 'assistant', content: '*Smiles warmly with relief.* \n\nThank you for checking your attitude. I am happy to welcome you back! How can I assist you today?' }
          ]);
          setLastWords('');
          setApologyResult('');
        } else if (isKickingOut) {
          window.location.href = 'https://www.google.com/search?q=How+to+apologize+sincerely';
        } else {
          window.location.href = 'about:blank';
        }
      }
      return;
    }

    const timer = setInterval(() => {
      setBanTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isBlocked, banTimeLeft, isForgivenButNicoNot, isKickingOut]);

  // Play kick sound when opening the chatbot window if they are currently blocked
  useEffect(() => {
    if (isOpen && isBlocked) {
      playKickSound();
    }
  }, [isOpen, isBlocked]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-scroll to bottom of ban history
  useEffect(() => {
    if (banHistoryEndRef.current) {
      banHistoryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [banHistory]);

  // Check persistent block status on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const blockedTimeStr = localStorage.getItem('mia_blocked_time');
      if (blockedTimeStr) {
        const blockedTime = parseInt(blockedTimeStr, 10);
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;

        if (now - blockedTime < threeHours) {
          setIsBlocked(true);
          setMessages([
            { role: 'assistant', sender: 'nico', content: 'Nico detected bad attitude. You are kicked from the chat.\n\n*"When you are in someone\'s home, please check your attitude."*' }
          ]);
          // Play door closing sound safely
          playKickSound();
        } else {
          // Expiration passed, clear block
          localStorage.removeItem('mia_blocked_time');
        }
      }
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined' && localStorage.getItem('mia_blocked_time')) {
      const blockedTime = parseInt(localStorage.getItem('mia_blocked_time'), 10);
      if (Date.now() - blockedTime < 3 * 60 * 60 * 1000) {
        return;
      }
    }
    // Reset state & messages to start a New Chat next time
    setIsBlocked(false);
    setMessages([
      { role: 'assistant', content: '*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about Huddin\'s projects, services, or availability!)*' }
    ]);
  };

  const togglePosition = () => {
    setPosition(prev => prev === 'right' ? 'left' : 'right');
  };

  // Blocklist for sexual keywords
  const isSensitiveInput = (text) => {
    const keywords = ['horny', 'fuck', 'sex', 'fck', 'porn', 'nudity', 'naked', 'blowjob', 'dick', 'pussy', 'boobs', 'cunt', 'asshole', 'goon', 'jerk off', 'masturbat'];
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  };

  const handleSendMessage = async (textToSend) => {
    if (isBlocked) return;
    const text = textToSend || input.trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }

    // Check for sensitive keywords locally first
    if (isSensitiveInput(text)) {
      const userMsg = { role: 'user', content: text };
      const blockMsg = {
        role: 'assistant',
        sender: 'nico',
        content: 'Nico detected bad attitude. You are kicked from the chat.\n\n*"When you are in someone\'s home, please check your attitude."*'
      };
      setMessages(prev => [...prev, userMsg, blockMsg]);
      setIsBlocked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mia_blocked_time', Date.now().toString());
        // Play door closing sound safely
        playKickSound();
      }
      return;
    }

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentPath: window.location.pathname
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to fetch response';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        const error = new Error(errMsg);
        error.status = response.status;
        throw error;
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false); // Stop loading animation since streaming has started

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;

        // Update the last message in state
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1].content = assistantReply;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);

      const isRateLimit = error.status === 429 || (error.message && (error.message.includes('429') || error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('limit')));
      
      if (isRateLimit) {
        setCooldown(60);
        const nicoMessage = {
          role: 'assistant',
          sender: 'nico',
          content: '*A small round hover-robot zooms in, its neon visor flashing in alert mode.* \n\n"BEEP BOOP! Mia is currently busy greeting another guest! Please wait a moment and try talking to her again later!"'
        };
        setMessages(prev => [...prev, nicoMessage]);
      } else {
        const sleepMessage = '*Frowns slightly, looking confused.* \n\nI am sorry, but I seem to have trouble connecting right now. Could you please try again in a moment?';
        setMessages(prev => [...prev, { role: 'assistant', content: sleepMessage }]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApologySubmit = async (e) => {
    e.preventDefault();
    if (!lastWords.trim() || isCheckingApology || isKickingOut) return;

    setIsCheckingApology(true);
    setApologyResult('');

    const userWords = lastWords.trim();
    setBanHistory(prev => [...prev, { sender: 'user', content: userWords }]);
    setLastWords('');

    try {
      const evaluationPrompt = `Please act as an expert editor. Evaluate this text and tell me if it is good, bad, or neutral. Provide specific feedback on its clarity, flow, and where I can improve it. Text: "${userWords}"`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: evaluationPrompt }
          ],
          currentPath: window.location.pathname,
          isApologyEvaluation: true
        }),
      });

      if (!response.ok) throw new Error('Failed to verify apology');

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
      }

      const lowerReply = reply.toLowerCase();

      if (lowerReply.includes('good')) {
        // Good attitude -> Forgive
        setBanHistory(prev => [
          ...prev,
          { sender: 'mia', content: 'I forgive you... but Nico is still very angry!' },
          { sender: 'system', content: '*Nico locks you in. Wait time is reduced by 50% from current remaining time.*' }
        ]);
        
        // Halve the countdown timer
        setBanTimeLeft(prev => Math.max(1, Math.floor(prev / 2)));
        setIsForgivenButNicoNot(true);
        setBanInputHidden(true);
      } else if (lowerReply.includes('bad')) {
        // Bad attitude -> End conversation & kick out
        setBanHistory(prev => [
          ...prev,
          { sender: 'nico', content: 'Apology rejected! Nico will kick you out.' },
          { sender: 'system', content: '*Nico grabs you by the neck and kicks you out!*' },
          { sender: 'system', content: 'When you make a mistake, please apologize sincerely first.' }
        ]);
        
        setIsKickingOut(true);
        setBanInputHidden(true);
        setBanTimeLeft(7); // Jump the countdown visual timer to 7s
      } else {
        // Neutral attitude -> Will not respond anything (no state transitions, user can try again)
        setBanHistory(prev => [
          ...prev,
          { sender: 'nico', content: '...' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setBanHistory(prev => [...prev, { sender: 'system', content: 'Error checking apology. Please try again.' }]);
    } finally {
      setIsCheckingApology(false);
    }
  };

  const renderBanOverlay = () => {
    const progressPercent = (banTimeLeft / 180) * 100;
    const colorClass = isForgivenButNicoNot ? 'text-blue-500' : isKickingOut ? 'text-red-500' : 'text-orange-500';
    const borderClass = isForgivenButNicoNot ? 'border-blue-500' : isKickingOut ? 'border-red-500' : 'border-orange-500';
    const bgClass = isForgivenButNicoNot ? 'bg-blue-500' : isKickingOut ? 'bg-red-500' : 'bg-orange-500';
    const timerColorClass = isForgivenButNicoNot ? 'text-blue-400' : isKickingOut ? 'text-red-400' : 'text-orange-400';
    const headerTitle = isForgivenButNicoNot 
      ? 'Nico & Calm Mia' 
      : isKickingOut 
        ? 'Anger Nico & Mad Mia' 
        : 'Mad Nico & Mia';

    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center font-sans select-none animate-in fade-in duration-500">
        <div className="w-[360px] h-[500px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
          
          {/* Header styled like chat but with Nico Mode details */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex -space-x-2.5">
                  <div className={`w-8 h-8 rounded-full overflow-hidden border ${borderClass} flex items-center justify-center bg-zinc-950 shrink-0 aspect-square z-10`}>
                    <img 
                      src="/nico.png" 
                      alt="Nico Avatar" 
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                  <div className={`w-8 h-8 rounded-full overflow-hidden border ${borderClass} flex items-center justify-center bg-zinc-950 shrink-0 aspect-square`}>
                    <img 
                      src="/mia.png" 
                      alt="Mia Avatar" 
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-1 ring-zinc-900 z-20" />
              </div>
              <div className="text-left">
                <h4 className={`text-sm font-semibold ${colorClass}`}>{headerTitle}</h4>
                <p className="text-[10px] font-mono text-zinc-500">Closed Door</p>
              </div>
            </div>
          </div>

          {/* Progress Bar & Timer */}
          <div className="w-full px-4 pt-3 flex flex-col gap-1.5 shrink-0 bg-zinc-900/40">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>{isForgivenButNicoNot ? "Locked by Nico..." : isKickingOut ? "User time before kick out..." : "Redirecting to browser home..."}</span>
              <span className={`${timerColorClass} font-semibold`}>{banTimeLeft}s</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${bgClass} transition-all duration-1000 ease-linear`} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Message List (Bubble Chat layout) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col scrollbar-thin bg-zinc-900/20" style={{ overscrollBehavior: 'contain' }}>
            {banHistory.map((item, idx) => {
              if (item.sender === 'system') {
                return (
                  <div key={idx} className="flex w-full justify-start">
                    <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed bg-zinc-800/40 border border-zinc-800/60 text-zinc-400 italic rounded-tl-none text-left">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <span className="inline">{children}</span>,
                          em: ({ children }) => <em className="text-zinc-500/80 italic font-normal">{children}</em>
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              }
              
              const isUser = item.sender === 'user';
              const isMia = item.sender === 'mia';
              const isNicoWhite = item.content.includes("We don't accept bad attitude") || item.content === '...';
              
              const userBgClass = isForgivenButNicoNot ? 'bg-blue-600' : isKickingOut ? 'bg-red-600' : 'bg-orange-600';
              const nicoTextClass = isForgivenButNicoNot ? 'text-blue-400' : isKickingOut ? 'text-red-400' : 'text-orange-400';

              return (
                <div 
                  key={idx} 
                  className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      isUser 
                        ? `${userBgClass} text-white rounded-tr-none font-medium text-right` 
                        : (isMia || isNicoWhite)
                          ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-tl-none text-left'
                          : `bg-zinc-800 border border-zinc-700 ${nicoTextClass} rounded-tl-none text-left`
                    }`}
                  >
                    {isUser ? (
                      item.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                          em: ({ children }) => <em className="text-zinc-400/70 opacity-70 italic font-normal">{children}</em>,
                          strong: ({ children }) => <strong className="font-semibold text-red-400">{children}</strong>
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })}
            {isCheckingApology && (
              <div className="flex w-full justify-start">
                <div className="bg-zinc-800 border border-zinc-700 text-zinc-500 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={banHistoryEndRef} />
          </div>

          {/* Apology Form / Actions */}
          {!banInputHidden && (
            <div className="p-3 border-t border-zinc-800 bg-zinc-900">
              <form onSubmit={handleApologySubmit} className="flex gap-2 w-full">
                <input
                  type="text"
                  value={lastWords}
                  onChange={(e) => setLastWords(e.target.value)}
                  placeholder={isCheckingApology ? "Checking..." : "Apologize sincerely..."}
                  disabled={isCheckingApology || isKickingOut}
                  className={`flex-1 bg-zinc-950 border border-zinc-800 ${isForgivenButNicoNot ? 'focus:border-blue-500/40' : isKickingOut ? 'focus:border-red-500/40' : 'focus:border-orange-500/40'} rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-200 placeholder:text-zinc-600 transition-colors disabled:opacity-50`}
                />
                <button
                  type="submit"
                  disabled={isCheckingApology || isKickingOut || !lastWords.trim()}
                  className={`px-4 py-2.5 ${isForgivenButNicoNot ? 'bg-blue-600 hover:bg-blue-500' : isKickingOut ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'} disabled:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none`}
                >
                  Submit
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render open chatbot window
  const renderChatWindow = () => {
    const posClass = position === 'left' ? 'left-6' : 'right-6';

    return (
      <div 
        ref={chatWindowRef}
        className={`fixed bottom-6 ${posClass} z-50 flex flex-col w-[360px] h-[500px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 font-sans`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-accent flex items-center justify-center bg-bg-dark shrink-0 aspect-square">
                <img 
                  src="/mia.png" 
                  alt="Mia Avatar" 
                  className="w-full h-full object-cover aspect-square"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(224, 255, 111, 0.4))' }} 
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-online-green ring-1 ring-bg-dark" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Mia</h4>
              <p className="text-[10px] font-mono text-text-muted">Maid GPT-4o-Mini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={togglePosition}
              className="px-2 py-1 text-[10px] font-mono rounded bg-bg-dark border border-border text-text-secondary hover:text-accent hover:border-accent transition-colors"
              title="Switch Side"
            >
              ← Swipe →
            </button>
            {!isBlocked && (
              <button 
                onClick={handleClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
                title="New Chat"
              >
                <SquarePen className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" style={{ overscrollBehavior: 'contain' }}>
          {messages.map((message, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] ${
                  message.role === 'user' 
                    ? 'bg-accent text-bg-dark rounded-tr-none font-medium' 
                    : 'bg-bg-dark border border-border text-text-primary rounded-tl-none'
                }`}
              >
                {message.role === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                ) : (
                  <div className="prose prose-invert max-w-none text-left">
                    <ReactMarkdown 
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-[0.95rem]">{children}</li>,
                        em: ({ children }) => <em className="text-text-muted opacity-70 italic font-normal">{children}</em>,
                        strong: ({ children }) => <strong className="font-semibold text-accent">{children}</strong>,
                        a: ({ href, children }) => {
                          const isInternal = href.startsWith('/') || href.startsWith('#');
                          const buttonStyle = "inline-flex items-center gap-1 bg-accent/10 hover:bg-accent text-accent hover:text-bg-dark border border-accent/30 rounded-lg px-2.5 py-1 text-xs font-mono transition-all duration-200 my-1 font-semibold";
                          
                          if (isInternal) {
                            return (
                              <Link href={href} className={buttonStyle}>
                                {children}
                              </Link>
                            );
                          }
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className={buttonStyle}>
                              {children} ↗
                            </a>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="bg-bg-dark border border-border text-text-muted rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 pb-2 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-text-muted">Suggested questions:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-bg-dark border border-border hover:border-accent hover:bg-bg-card-hover text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 border-t border-border bg-bg-card">
          <div className="flex items-end gap-2 bg-bg-dark border border-border rounded-xl px-3 py-1.5 focus-within:border-accent transition-colors">
            <textarea
              value={input}
              onChange={(e) => {
                if (isBlocked || cooldown > 0) return;
                setInput(e.target.value);
                // Auto-adjust height
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`; // Max 4 lines (20px * 4 = 80px)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isBlocked && cooldown <= 0) {
                    handleSendMessage();
                  }
                  // Reset height
                  e.target.style.height = 'auto';
                }
              }}
              placeholder={
                isBlocked 
                  ? "No permission." 
                  : cooldown > 0 
                    ? `Mia is busy... Locked for ${cooldown}s` 
                    : "Ask me something..."
              }
              rows={1}
              disabled={isBlocked || cooldown > 0}
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted resize-none text-sm leading-5 py-1 focus:ring-0 overflow-y-auto disabled:opacity-50"
              style={{ height: 'auto', maxHeight: '80px' }}
            />
            <button
              onClick={(e) => {
                if (!isBlocked && cooldown <= 0) {
                  handleSendMessage();
                }
                // Find and reset sibling textarea height
                const textarea = e.currentTarget.previousElementSibling;
                if (textarea) textarea.style.height = 'auto';
              }}
              disabled={isLoading || !input.trim() || isBlocked || cooldown > 0}
              className="p-1.5 rounded-lg text-accent hover:bg-bg-card disabled:opacity-40 disabled:hover:bg-transparent transition-all shrink-0 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Floating trigger button
  const posClass = position === 'left' ? 'left-6' : 'right-6';
  const triggerBtnClasses = isBlocked 
    ? isForgivenButNicoNot 
      ? 'bg-blue-500 hover:bg-blue-400 text-white' 
      : isKickingOut 
        ? 'bg-red-500 hover:bg-red-400 text-white' 
        : 'bg-orange-500 hover:bg-orange-400 text-white' 
    : 'bg-accent hover:bg-white text-bg-dark';

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 ${posClass} z-50 w-14 h-14 ${triggerBtnClasses} rounded-full shadow-2xl flex items-center justify-center hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 group`}
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
        </button>
      )}

      {isOpen && (
        isBlocked ? renderBanOverlay() : renderChatWindow()
      )}
    </>
  );
}
