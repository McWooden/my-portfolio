'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, X, Send, SquarePen, ArrowLeftRight, Compass, HelpCircle, Menu, ArrowDown, LogIn, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import huddinConfig from '../../../data/huddinContext.json';
import { playVoiceSound, playKickSound, playBellSound } from '../../../utils/audio';
import BanOverlay from '../BanOverlay';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useChatbotQuota } from './useChatbotQuota';
import { getCurrentTask, getSteppedProgress } from './chatbotQuota';
import { parseCommandOrFaq, getAutoCompleteItems } from './chatbotCommands';
import { isSensitiveInput, RANDOM_REASONS } from './chatbotConstants';

export default function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('right'); // 'left' | 'center' | 'right'
  const [isBlocked, setIsBlocked] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about ${huddinConfig.master}'s projects, services, or availability!)*` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Chat and Position settings
  const [showConfirmNewChat, setShowConfirmNewChat] = useState(false);
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [showWidget, setShowWidget] = useState(true);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll bottom button
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Quota and Puter configuration hook
  const {
    quotaUsed,
    quotaLimit,
    cooldown,
    setCooldown,
    cooldownDuration,
    cooldownSteps,
    isPuterSignedIn,
    handlePuterSignIn,
    handlePuterSignOut,
    consumeQuotaToken
  } = useChatbotQuota(isOpen, isBlocked, setMessages);

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
  const hasRungBellRef = useRef(false);
  const autocompleteRef = useRef(null);
  const toggleAutocompleteRef = useRef(null);
  const textareaRef = useRef(null);

  const quickPrompts = huddinConfig.faq.map(f => f.question);

  // Unified scroll listener (fixes duplicate scroll listeners in Phase 3.4)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        // Toggle isScrolled (scrolled past 50px)
        setIsScrolled(window.scrollY > 50);

        // Toggle showWidget (hide at the absolute bottom of page)
        const threshold = 3;
        const showThreshold = 5;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

        if (distanceFromBottom <= threshold) {
          setShowWidget(false);
        } else if (distanceFromBottom > showThreshold) {
          setShowWidget(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for custom event to open the chatbot
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      if (!hasRungBellRef.current) {
        playBellSound();
        hasRungBellRef.current = true;
      }
    };
    window.addEventListener('open-chatbot', handleOpenChat);
    return () => window.removeEventListener('open-chatbot', handleOpenChat);
  }, []);

  // Close panel when clicking outside (useClickOutside hook)
  const handleOutsideClick = useCallback((event) => {
    // Prevent closing when clicking autocomplete toggle button
    if (toggleAutocompleteRef.current && toggleAutocompleteRef.current.contains(event.target)) return;
    if (autocompleteRef.current && autocompleteRef.current.contains(event.target)) return;
    
    setIsOpen(false);
  }, []);

  useClickOutside(chatWindowRef, handleOutsideClick, isOpen);

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
          window.location.href = 'https://www.google.com/search?q=Why+do+people+get+mad+at+words';
        }
      }
      return;
    }

    const timer = setInterval(() => {
      setBanTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isBlocked, banTimeLeft, isForgivenButNicoNot, isKickingOut]);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbot_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.warn("Failed to parse saved chatbot messages:", e);
        }
      }
    }
  }, []);

  // Save messages to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (messages.length > 1) {
        localStorage.setItem('chatbot_messages', JSON.stringify(messages));
      } else if (messages.length === 1 && messages[0].content.includes("Welcome. I am here to assist you")) {
        localStorage.removeItem('chatbot_messages');
      }
    }
  }, [messages]);

  // Play kick sound when opening the chatbot window if they are currently blocked
  useEffect(() => {
    if (isOpen && isBlocked) {
      playKickSound();
    }
  }, [isOpen, isBlocked]);

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
          playKickSound();
        } else {
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
      { role: 'assistant', content: `*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about Huddin\'s projects, services, or availability!)*` }
    ]);
  };

  const handleChatScroll = (e) => {
    const container = e.currentTarget;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBottomBtn(distanceFromBottom > 100);
  };

  const handleSendMessage = async (textToSend) => {
    if (isBlocked) return;
    const text = textToSend || input.trim();
    if (!text) return;

    // Check command status
    const cmdResult = parseCommandOrFaq(text, pathname);

    // If currently in cooldown and input is not a command/FAQ, block it
    if (cooldown > 0 && !cmdResult.isCommand && !isPuterSignedIn) {
      return;
    }

    setShowAutocomplete(false);

    // Execute Client-Side Actions
    if (cmdResult.actionType === 'login') {
      handlePuterSignIn();
      setInput('');
      return;
    }

    if (cmdResult.actionType === 'navigation') {
      if (cmdResult.targetId) {
        if (cmdResult.isPage) {
          if (pathname !== '/network') {
            window.dispatchEvent(new Event('page-loading-start'));
            router.push('/network');
          }
        } else {
          if (pathname !== '/') {
            window.dispatchEvent(new Event('page-loading-start'));
            router.push('/#' + cmdResult.targetId);
          } else {
            const element = document.getElementById(cmdResult.targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, null, `#${cmdResult.targetId}`);
            }
          }
        }
      }
      setInput('');
      return;
    }

    if (cmdResult.actionType === 'faq') {
      const faq = huddinConfig.faq[cmdResult.faqIdx];
      const FAQ_TEMPLATES = [
        (q) => `i see a bill board about faq at piece question '${q}' and its said`,
        (q) => `that sticky one card '${q}' said`,
        (q) => `glancing at the FAQ board for '${q}', it reads`,
        (q) => `reading the FAQ card about '${q}', it says`,
        (q) => `looking at the FAQ item '${q}', it notes`
      ];

      const templateFn = FAQ_TEMPLATES[Math.floor(Math.random() * FAQ_TEMPLATES.length)];
      const userText = templateFn(faq.question);
      const reply = `> ${faq.answer}`;

      setMessages(prev => {
        const filtered = prev.filter(m => m.faqIdx !== cmdResult.faqIdx);
        return [
          ...filtered,
          { role: 'user', content: userText, isAction: true, faqIdx: cmdResult.faqIdx },
          { role: 'assistant', content: reply, faqIdx: cmdResult.faqIdx }
        ];
      });

      playVoiceSound(faq.answer);
      setInput('');
      return;
    }

    // Quota Token consumption
    const quotaResult = consumeQuotaToken();
    if (quotaResult && !quotaResult.allowed) {
      return;
    }

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
        playKickSound();
      }
      return;
    }

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const isOneRemaining = !isPuterSignedIn && (quotaResult.savedLimit - quotaResult.newUsed) === 1;
      const isQuotaExhausted = !isPuterSignedIn && quotaResult.newUsed >= quotaResult.savedLimit;
      let chosenReason = undefined;

      if (isOneRemaining) {
        chosenReason = RANDOM_REASONS[Math.floor(Math.random() * RANDOM_REASONS.length)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('chatbot_current_reason', chosenReason);
        }
      } else if (isQuotaExhausted) {
        if (typeof window !== 'undefined') {
          chosenReason = localStorage.getItem('chatbot_current_reason');
        }
        if (!chosenReason) {
          chosenReason = RANDOM_REASONS[Math.floor(Math.random() * RANDOM_REASONS.length)];
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chatbot_current_reason');
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentPath: window.location.pathname,
          isOneRemainingRequest: isOneRemaining,
          isQuotaExhausted: isQuotaExhausted,
          randomReason: chosenReason
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to fetch response';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) { }
        const error = new Error(errMsg);
        error.status = response.status;
        throw error;
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';
      let hasPlayedVoice = false;

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false); // Stop loading animation since streaming has started

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;

        if (!hasPlayedVoice && assistantReply.trim().length > 0) {
          hasPlayedVoice = true;
          playVoiceSound(assistantReply);
        }

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

  const handleApologySubmit = async (e) => {
    e.preventDefault();
    if (!lastWords.trim() || isCheckingApology || isKickingOut) return;

    setIsCheckingApology(true);
    setApologyResult('');

    const userWords = lastWords.trim();
    setBanHistory(prev => [...prev, { sender: 'user', content: userWords }]);
    setLastWords('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: userWords }
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
        setBanHistory(prev => [
          ...prev,
          { sender: 'mia', content: 'I forgive you... but Nico is still mad' },
          { sender: 'system', content: '*Nico drop and locks you in.*' },
          { sender: 'system', content: 'Please wait for the timer to finish and do not exit or refresh the browser if you want Nico and Mia to forgive you.' }
        ]);

        setBanTimeLeft(prev => Math.max(1, Math.floor(prev / 2)));
        setIsForgivenButNicoNot(true);
        setBanInputHidden(true);
      } else if (lowerReply.includes('bad')) {
        setBanHistory(prev => [
          ...prev,
          { sender: 'nico', content: 'Apology rejected! Nico will kick you out.' },
          { sender: 'system', content: '*Nico grabs you by the neck and kicks you out!*' },
          { sender: 'system', content: 'When you make a mistake, please apologize sincerely first.' }
        ]);

        setIsKickingOut(true);
        setBanInputHidden(true);
        setBanTimeLeft(7); // Jump visual timer
      } else {
        setBanHistory(prev => [
          ...prev,
          { sender: 'nico', content: '...' },
          { sender: 'system', content: '*Nico stares at you. Attitude is neutral/acceptable, but the door remains locked.*' },
          { sender: 'system', content: 'Please wait for the prepare to finish and do not exit or trolling around if you want us to forgive you.' }
        ]);

        setBanTimeLeft(prev => Math.max(1, Math.floor(prev / 2)));
        setIsForgivenButNicoNot(true);
        setBanInputHidden(true);
      }
    } catch (err) {
      console.error(err);
      setBanHistory(prev => [...prev, { sender: 'system', content: 'Error checking apology. Please try again.' }]);
    } finally {
      setIsCheckingApology(false);
    }
  };

  const memoizedMessageList = useMemo(() => messages.map((message, i) => (
    <div key={i} className={`flex flex-col w-full ${message.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
      <div className={`flex w-full items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] w-fit rounded-2xl px-4 py-2.5 text-[0.95rem] ${message.role === 'user'
          ? message.isAction
            ? 'bg-accent/5 border border-accent/10 text-accent rounded-tr-none italic opacity-85 text-right font-normal'
            : 'bg-accent text-bg-dark rounded-tr-none font-medium text-right'
          : 'bg-bg-dark border border-border text-text-primary rounded-tl-none'
          }`}>
          {message.role === 'user' ? (
            <p className="whitespace-pre-wrap break-words text-left">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none text-left">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent pl-3 text-text-secondary italic my-1">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-[0.95rem]">{children}</li>,
                  em: ({ children }) => <em className="text-text-muted opacity-70 italic font-normal">{children}</em>,
                  strong: ({ children }) => <strong className="font-semibold text-accent">{children}</strong>,
                  a: ({ href, children }) => {
                    const isInternal = href.startsWith('/') || href.startsWith('#');
                    const buttonStyle = "inline-flex items-center gap-1 bg-accent text-bg-dark rounded-lg px-2.5 py-1 text-xs font-mono transition-all duration-200 mx-1 font-semibold shadow-sm hover:brightness-110";

                    if (isInternal) {
                      const handleClick = (e) => {
                        if (href.startsWith('#')) {
                          const targetId = href.substring(1);
                          const element = document.getElementById(targetId);
                          if (element) {
                            e.preventDefault();
                            element.scrollIntoView({ behavior: 'smooth' });
                            window.history.pushState(null, null, href);
                          }
                        }
                      };
                      return (
                        <Link href={href} className={buttonStyle} onClick={handleClick}>
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

      {i === 0 && messages.length === 1 && !isLoading && cooldown <= 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1 animate-in fade-in duration-300 justify-start max-w-[85%] px-1">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-bg-dark border border-border hover:border-accent hover:bg-bg-card-hover text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg transition-all text-left shadow-sm active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  )), [messages, isLoading, cooldown]);

  const renderChatWindow = () => {
    const posClass = position === 'left' ? 'left-6' : position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-6';

    return (
      <div
        ref={chatWindowRef}
        className={`fixed bottom-6 ${posClass} z-50 flex flex-col w-[360px] h-[500px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 font-sans`}
      >
        {showConfirmNewChat && (
          <div className="absolute inset-0 bg-bg-dark/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 text-center font-sans">
            <h4 className="text-base font-semibold text-text-primary mb-2">Start a new chat?</h4>
            <p className="text-xs text-text-muted mb-6 max-w-[200px]">This will clear your current conversation history.</p>
            <div className="flex gap-3 w-full max-w-[220px]">
              <button
                onClick={() => setShowConfirmNewChat(false)}
                className="flex-1 px-3 py-2 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-card hover:bg-bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleClose();
                  setShowConfirmNewChat(false);
                  playBellSound();
                }}
                className="flex-1 px-3 py-2 bg-accent hover:bg-white text-bg-dark rounded-xl text-xs font-semibold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-accent flex items-center justify-center bg-bg-dark shrink-0 aspect-square">
                <img
                  src="/mia.webp"
                  alt="Mia Avatar"
                  className="w-full h-full object-cover aspect-square select-none pointer-events-none"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(224, 255, 111, 0.4))' }}
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                  onMouseDown={(e) => e.preventDefault()}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-online-green ring-1 ring-bg-dark" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Mia Hamada</h4>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-mono text-text-muted">{huddinConfig.version}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isPuterSignedIn && (
              <button
                onClick={handlePuterSignOut}
                className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-bg-card-hover transition-colors"
                title="Sign Out of Puter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors flex items-center justify-center"
                title="Reposition Chat"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              {isPositionDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-fit min-w-[75px] bg-bg-dark border border-border rounded-lg shadow-xl py-1 z-[70] font-sans flex flex-col items-center">
                  <button
                    onClick={() => {
                      setPosition('left');
                      setIsPositionDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-center text-xs transition-colors ${position === 'left' ? 'text-accent bg-bg-card-hover font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'}`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => {
                      setPosition('center');
                      setIsPositionDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-center text-xs transition-colors ${position === 'center' ? 'text-accent bg-bg-card-hover font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'}`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => {
                      setPosition('right');
                      setIsPositionDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-center text-xs transition-colors ${position === 'right' ? 'text-accent bg-bg-card-hover font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'}`}
                  >
                    Right
                  </button>
                </div>
              )}
            </div>
            {!isBlocked && (
              <button
                onClick={() => setShowConfirmNewChat(true)}
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

        <div
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto pt-4 px-4 pb-0 space-y-4 custom-scrollbar"
          style={{ overscrollBehavior: 'contain' }}
        >
          {memoizedMessageList}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="bg-bg-dark border border-border text-text-muted rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          {cooldown > 0 && !isPuterSignedIn && (
            <>
              <div key="cooldown-progress" className="flex w-full justify-start animate-in fade-in duration-300">
                <div className="max-w-[85%] rounded-2xl bg-bg-dark border border-border rounded-tl-none px-4 py-2.5 flex flex-col gap-2 text-left">
                  <div className="text-[0.95rem] text-left">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                        em: ({ children }) => <em className="text-text-muted opacity-70 italic font-normal">{children}</em>
                      }}
                    >
                      {`*${getCurrentTask(cooldown, cooldownDuration, cooldownSteps)}*`}
                    </ReactMarkdown>
                  </div>
                  <div className="w-full h-1 bg-bg-card border border-border/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-1000 ease-out"
                      style={{ width: `${getSteppedProgress(cooldown, cooldownDuration)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div key="cooldown-sign-card" className="flex w-full justify-end animate-in fade-in duration-300">
                <div className="max-w-[85%] w-fit rounded-2xl px-4 py-2.5 text-[0.95rem] bg-accent/5 border border-accent/10 text-accent rounded-tr-none italic opacity-85 text-right font-normal">
                  <div className="prose prose-invert max-w-none text-right">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-right">{children}</p>,
                        em: ({ children }) => <em className="text-accent/90 italic font-normal">{children}</em>,
                        a: ({ children }) => (
                          <span
                            onClick={handlePuterSignIn}
                            className="font-semibold cursor-pointer transition-colors underline decoration-dotted not-italic inline-block"
                          >
                            {children}
                          </span>
                        )
                      }}
                    >
                      {`*Notices a neat sign card resting on the desk: 'To keep our conversation going, let's [issue a session ticket!](#)'*`}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScrollBottomBtn && (
          <button
            onClick={() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-40 bg-accent text-bg-dark rounded-full p-2.5 shadow-lg border border-accent/20 transition-all"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        <div className="px-3 pb-3 pt-1.5 bg-bg-card relative border-t border-border/20 flex flex-col gap-2">
          {!isBlocked && (
            <div
              className="flex gap-2 overflow-x-auto shrink-0 justify-start animate-in fade-in duration-300 [&::-webkit-scrollbar]:hidden py-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => {
                  setInput('/navigation ');
                  setShowAutocomplete(true);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="flex items-center gap-1.5 text-xs bg-bg-dark border border-border hover:border-accent hover:bg-bg-card-hover text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 shrink-0 group"
              >
                <Compass className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                <span>Navigation</span>
              </button>
              <button
                onClick={() => {
                  setInput('/faq ');
                  setShowAutocomplete(true);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="flex items-center gap-1.5 text-xs bg-bg-dark border border-border hover:border-accent hover:bg-bg-card-hover text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 shrink-0 group"
              >
                <HelpCircle className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                <span>FAQ</span>
              </button>
            </div>
          )}

          {showAutocomplete && (
            (() => {
              const suggestions = getAutoCompleteItems({
                input,
                isPuterSignedIn,
                pathname,
                router,
                setInput,
                setShowAutocomplete,
                handlePuterSignIn,
                handleSendMessage
              });
              if (suggestions.length === 0) return null;
              return (
                <div ref={autocompleteRef} className="absolute bottom-full left-3 right-3 z-50 bg-bg-card border border-border rounded-xl shadow-2xl p-1.5 max-h-[180px] overflow-y-auto flex flex-col gap-0.5 custom-scrollbar">
                  {suggestions.map((item, idx) => {
                    const isFocused = idx === activeSuggestionIndex;
                    const getCommandIcon = (cmd) => {
                      if (cmd.startsWith('/navigation')) {
                        return <Compass className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0" />;
                      }
                      if (cmd.startsWith('/faq')) {
                        return <HelpCircle className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0" />;
                      }
                      if (cmd.startsWith('/login')) {
                        return <LogIn className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0" />;
                      }
                      return <Menu className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0" />;
                    };
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action();
                          setActiveSuggestionIndex(0);
                        }}
                        onMouseEnter={() => setActiveSuggestionIndex(idx)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 group min-w-0 ${isFocused
                          ? 'bg-bg-card-hover text-text-primary'
                          : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                          }`}
                      >
                        {getCommandIcon(item.cmd)}
                        <span className="font-mono text-xs whitespace-nowrap shrink-0">{item.cmd}</span>
                        <span className="text-[11px] text-text-muted group-hover:text-text-muted/90 truncate min-w-0 flex-1">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()
          )}

          <div className="flex items-center gap-2">
            <button
              ref={toggleAutocompleteRef}
              onClick={() => setShowAutocomplete(!showAutocomplete)}
              disabled={isBlocked}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 self-center transition-colors ${showAutocomplete
                ? 'text-accent border-accent bg-bg-dark'
                : 'text-text-muted border-border bg-bg-dark hover:text-text-primary hover:border-accent'
                }`}
              title="Toggle Commands Menu"
            >
              <div className={`transition-transform duration-300 ${showAutocomplete ? 'rotate-90' : 'rotate-0'}`}>
                {showAutocomplete ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </div>
            </button>

            <div className="flex-1 flex items-center gap-2 bg-bg-dark border border-border rounded-xl px-3 py-1.5 focus-within:border-accent transition-colors relative">
              <textarea
                ref={textareaRef}
                value={input}
                maxLength={300}
                onChange={(e) => {
                  if (isBlocked) return;
                  const val = e.target.value;
                  setInput(val);
                  setActiveSuggestionIndex(0);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
                }}
                onKeyDown={(e) => {
                  const suggestions = showAutocomplete ? getAutoCompleteItems({
                    input,
                    isPuterSignedIn,
                    pathname,
                    router,
                    setInput,
                    setShowAutocomplete,
                    handlePuterSignIn,
                    handleSendMessage
                  }) : [];
                  const isAutocompleteOpen = showAutocomplete && suggestions.length > 0;

                  if (isAutocompleteOpen) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
                      return;
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const selectedItem = suggestions[activeSuggestionIndex];
                      if (selectedItem) {
                        selectedItem.action();
                      }
                      setActiveSuggestionIndex(0);
                      return;
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setShowAutocomplete(false);
                      setActiveSuggestionIndex(0);
                      return;
                    }
                  }

                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isBlocked) {
                      handleSendMessage();
                    }
                    e.target.style.height = 'auto';
                  }
                }}
                placeholder={
                  isBlocked
                    ? "No permission."
                    : (cooldown > 0 && !isPuterSignedIn)
                      ? "Mia is busy right now..."
                      : "Ask me something..."
                }
                rows={1}
                disabled={isBlocked}
                className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted resize-none text-sm leading-5 py-1 focus:ring-0 overflow-y-auto disabled:opacity-50"
                style={{ height: 'auto', maxHeight: '80px' }}
              />
              {input.trim() && (
                <button
                  onClick={(e) => {
                    if (!isBlocked) {
                      handleSendMessage();
                    }
                    const textarea = e.currentTarget.previousElementSibling;
                    if (textarea) textarea.style.height = 'auto';
                  }}
                  disabled={isLoading || !input.trim() || isBlocked || (cooldown > 0 && !isPuterSignedIn && !input.trim().startsWith('/'))}
                  className={`p-1.5 rounded-lg transition-all shrink-0 ${(cooldown > 0 && !isPuterSignedIn && !input.trim().startsWith('/'))
                    ? 'text-text-muted opacity-25 cursor-not-allowed'
                    : 'text-accent hover:bg-bg-card disabled:opacity-40 disabled:hover:bg-transparent'
                    }`}
                >
                  <div className="relative">
                    <Send className="w-4 h-4" />
                    {cooldown > 0 && !isPuterSignedIn && !input.trim().startsWith('/') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[18px] h-[1.5px] bg-text-muted rotate-45 transform" />
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const posClass = position === 'left' ? 'left-6' : position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-6';
  const triggerBtnClasses = isBlocked
    ? isForgivenButNicoNot
      ? 'bg-blue-500 hover:bg-blue-400 text-white'
      : isKickingOut
        ? 'bg-red-500 hover:bg-red-400 text-white'
        : 'bg-orange-500 hover:bg-orange-400 text-white'
    : 'bg-accent text-bg-dark hover:bg-accent/90';

  return (
    <>
      {!isOpen && showWidget && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (!hasRungBellRef.current) {
              playBellSound();
              hasRungBellRef.current = true;
            }
          }}
          className={`fixed bottom-6 ${posClass} z-50 w-14 h-14 ${triggerBtnClasses} rounded-full shadow-2xl flex items-center justify-center hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 group ${
            isScrolled
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
          }`}
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
        </button>
      )}

      {isOpen && (
        isBlocked ? (
          <BanOverlay
            banTimeLeft={banTimeLeft}
            setBanTimeLeft={setBanTimeLeft}
            isForgivenButNicoNot={isForgivenButNicoNot}
            setIsForgivenButNicoNot={setIsForgivenButNicoNot}
            isKickingOut={isKickingOut}
            setIsKickingOut={setIsKickingOut}
            banHistory={banHistory}
            setBanHistory={setBanHistory}
            lastWords={lastWords}
            setLastWords={setLastWords}
            isCheckingApology={isCheckingApology}
            setIsCheckingApology={setIsCheckingApology}
            banInputHidden={banInputHidden}
            setBanInputHidden={setBanInputHidden}
            banHistoryEndRef={banHistoryEndRef}
            handleApologySubmit={handleApologySubmit}
          />
        ) : renderChatWindow()
      )}
    </>
  );
}
