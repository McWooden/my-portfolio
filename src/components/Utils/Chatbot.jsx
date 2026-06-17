'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, SquarePen, ArrowLeftRight, Compass, HelpCircle, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import huddinConfig from '../../data/huddinContext.json';
import { projects } from '../../data/siteData';

let activeAudio = null;
let activeVoiceAudio = null;

const playVoiceSound = (text) => {
  if (typeof window === 'undefined') return;

  const lowerText = text.toLowerCase();
  const categories = {
    chuckle: ['chuckle.mp3', 'chuckle2.mp3'],
    laugh: ['laughter.mp3', 'laughter2.mp3'],
    sigh: ['sign.mp3', 'sign2.mp3'],
    cough: ['cough.mp3', 'cough2.mp3'],
    gasp: ['gasp.mp3', 'gasp2.mp3'],
    shh: ['shh.mp3', 'shh2.mp3'],
    clear: ['clear-throat.mp3', 'clear-throat2.mp3', 'clear-throat3.mp3'],
    hmm: ['hmmm.mp3'],
    um: ['um.mp3', 'um2.mp3']
  };

  let chosenFile = null;

  if (lowerText.includes('chuckle') || lowerText.includes('giggle') || lowerText.includes('snicker')) {
    chosenFile = categories.chuckle[Math.floor(Math.random() * categories.chuckle.length)];
  } else if (lowerText.includes('laugh') || lowerText.includes('giggle') || lowerText.includes('haha')) {
    chosenFile = categories.laugh[Math.floor(Math.random() * categories.laugh.length)];
  } else if (lowerText.includes('gasp') || lowerText.includes('gasps')) {
    chosenFile = categories.gasp[Math.floor(Math.random() * categories.gasp.length)];
  } else if (lowerText.includes('sigh') || lowerText.includes('sighs')) {
    chosenFile = categories.sigh[Math.floor(Math.random() * categories.sigh.length)];
  } else if (lowerText.includes('cough') || lowerText.includes('coughs')) {
    chosenFile = categories.cough[Math.floor(Math.random() * categories.cough.length)];
  } else if (lowerText.includes('shh') || lowerText.includes('shhh') || lowerText.includes('whisper')) {
    chosenFile = categories.shh[Math.floor(Math.random() * categories.shh.length)];
  } else if (lowerText.includes('clear-throat') || lowerText.includes('clear throat')) {
    chosenFile = categories.clear[Math.floor(Math.random() * categories.clear.length)];
  } else if (lowerText.includes('hmmm') || lowerText.includes('hmm')) {
    chosenFile = categories.hmm[Math.floor(Math.random() * categories.hmm.length)];
  } else if (lowerText.includes('um') || lowerText.includes('uh') || lowerText.includes('well')) {
    chosenFile = categories.um[Math.floor(Math.random() * categories.um.length)];
  } else {
    const fallbacks = ['hmmm.mp3', 'um.mp3', 'um2.mp3', 'clear-throat.mp3'];
    chosenFile = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  if (chosenFile) {
    try {
      if (activeVoiceAudio) {
        activeVoiceAudio.pause();
        activeVoiceAudio = null;
      }
      activeVoiceAudio = new Audio(`/sounds/mia-voices/${chosenFile}`);
      activeVoiceAudio.volume = 0.2;
      const playPromise = activeVoiceAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.warn("Voice playback issue:", e);
          }
        });
      }
    } catch (err) {
      console.warn("Voice Audio init failed:", err);
    }
  }
};

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

const playBellSound = () => {
  if (typeof window !== 'undefined') {
    try {
      const audio = new Audio('/sounds/dragon-studio-bell-ring.mp3');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
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
  const [position, setPosition] = useState('right'); // 'left' | 'center' | 'right'
  const [isBlocked, setIsBlocked] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about Huddin\'s projects, services, or availability!)*' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownDuration, setCooldownDuration] = useState(300);

  // New Chat and Position settings
  const [showConfirmNewChat, setShowConfirmNewChat] = useState(false);
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [showWidget, setShowWidget] = useState(true);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Quota states
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(15);
  const [windowStart, setWindowStart] = useState(0);

  const RANDOM_REASONS = [
    "help my master find something",
    "see what my master needs",
    "see something in the kitchen",
    "carry something",
    "feed my cat",
    "charge Nico's battery",
    "look at something my master is fixing",
    "taste-test my master's cooking",
    "find room keys",
    "help my master make a phone call",
    "help my master on a phone call",
    "check something in the workspace"
  ];


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
        setIsPositionDropdownOpen(false);
        setShowConfirmNewChat(false);
        setShowAutocomplete(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isBlocked]);

  // Handle scroll visibility of the widget button
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
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

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Play kick sound when opening the chatbot window if they are currently blocked
  useEffect(() => {
    if (isOpen && isBlocked) {
      playKickSound();
    }
  }, [isOpen, isBlocked]);

  // Handle countdown timer & quota window reset
  useEffect(() => {
    if (cooldown <= 0) {
      if (typeof window !== 'undefined' && quotaUsed >= quotaLimit) {
        // Cooldown finished, start next session (subsequent session gets 10)
        const now = Date.now();
        localStorage.setItem('chatbot_quota_limit', '10');
        localStorage.setItem('chatbot_quota_used', '0');
        localStorage.setItem('chatbot_quota_window_start', now.toString());
        // generate a new random duration for the next cycle
        const randomDurationMs = (Math.floor(Math.random() * (10 * 60 - 5 * 60 + 1)) + 5 * 60) * 1000;
        localStorage.setItem('chatbot_quota_cooldown_duration', randomDurationMs.toString());
        
        setQuotaLimit(10);
        setQuotaUsed(0);
        setWindowStart(now);
        setCooldownDuration(Math.floor(randomDurationMs / 1000));
      }
      return;
    }
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, quotaUsed, quotaLimit]);

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

  // Check persistent block status and initialize chatbot quota on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check persistent ban
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

      // 2. Initialize Quota
      const todayStr = new Date().toLocaleDateString('en-US');
      const savedDate = localStorage.getItem('chatbot_quota_date');
      let savedLimit = parseInt(localStorage.getItem('chatbot_quota_limit') || '15', 10);
      let savedUsed = parseInt(localStorage.getItem('chatbot_quota_used') || '0', 10);
      let savedWindowStart = parseInt(localStorage.getItem('chatbot_quota_window_start') || '0', 10);
      let savedCooldownDuration = parseInt(localStorage.getItem('chatbot_quota_cooldown_duration') || '300000', 10);
      const now = Date.now();

      if (savedDate !== todayStr) {
        savedLimit = 15;
        savedUsed = 0;
        savedWindowStart = now;
        savedCooldownDuration = 300000;
        localStorage.setItem('chatbot_quota_date', todayStr);
        localStorage.setItem('chatbot_quota_limit', '15');
        localStorage.setItem('chatbot_quota_used', '0');
        localStorage.setItem('chatbot_quota_window_start', savedWindowStart.toString());
        localStorage.setItem('chatbot_quota_cooldown_duration', savedCooldownDuration.toString());
      } else if (now - savedWindowStart >= savedCooldownDuration) {
        savedLimit = 10;
        savedUsed = 0;
        savedWindowStart = now;
        savedCooldownDuration = (Math.floor(Math.random() * (10 * 60 - 5 * 60 + 1)) + 5 * 60) * 1000;
        localStorage.setItem('chatbot_quota_limit', '10');
        localStorage.setItem('chatbot_quota_used', '0');
        localStorage.setItem('chatbot_quota_window_start', savedWindowStart.toString());
        localStorage.setItem('chatbot_quota_cooldown_duration', savedCooldownDuration.toString());
      }

      setQuotaUsed(savedUsed);
      setQuotaLimit(savedLimit);
      setWindowStart(savedWindowStart);
      setCooldownDuration(Math.floor(savedCooldownDuration / 1000));

      if (savedUsed >= savedLimit && now - savedWindowStart < savedCooldownDuration) {
        const secondsLeft = Math.ceil(((savedWindowStart + savedCooldownDuration) - now) / 1000);
        if (secondsLeft > 0) {
          setCooldown(secondsLeft);
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

  const getCurrentTask = (currentCooldown, totalDuration) => {
    const elapsedPercent = ((totalDuration - currentCooldown) / totalDuration) * 100;
    if (elapsedPercent < 25) {
      return "Looks like Mia is greeting another guest...";
    } else if (elapsedPercent < 55) {
      return "Looks like Mia is checking the kitchen...";
    } else if (elapsedPercent < 80) {
      return "Looks like Mia is cleaning the workspace...";
    } else {
      return "Looks like Mia is preparing to return...";
    }
  };

  const togglePosition = () => {
    setPosition(prev => prev === 'right' ? 'left' : 'right');
  };

  // Blocklist for sexual keywords
  const isSensitiveInput = (text) => {
    const keywords = ['horny', 'fuck', 'sex', 'fck', 'porn', 'nudity', 'naked', 'blowjob', 'dick', 'pussy', 'boobs', 'cunt', 'asshole', 'goon', 'jerk off', 'masturbat', 'bitch'];
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  };

  const getAutoCompleteItems = () => {
    const text = input.toLowerCase().trim();
    // If input is empty or doesn't start with /, and showAutocomplete is true, we treat it as if they typed /
    const queryText = (input.startsWith('/') || input === '') ? text : '/' + text;

    if (queryText === '' || queryText === '/') {
      return [
        { cmd: '/navigation', desc: 'Navigate homepage sections', action: () => { setInput('/navigation '); setShowAutocomplete(true); } },
        { cmd: '/faq', desc: 'Browse frequently asked questions', action: () => { setInput('/faq '); setShowAutocomplete(true); } }
      ];
    }

    if (queryText.startsWith('/navigation')) {
      const subQuery = queryText.substring('/navigation'.length).trim().toLowerCase();
      const sections = [
        { label: 'Home', id: 'hero', cmd: '/navigation home' },
        { label: 'Services', id: 'services', cmd: '/navigation services' },
        { label: 'Portfolio', id: 'portfolio', cmd: '/navigation portfolio' },
        { label: 'Reviews', id: 'reviews', cmd: '/navigation reviews' },
        { label: 'Blog', id: 'blog', cmd: '/navigation blog' },
        { label: 'FAQ', id: 'faq', cmd: '/navigation faq' },
        { label: 'Contact', id: 'contact', cmd: '/navigation contact' }
      ];

      const filtered = sections.filter(s => s.cmd.toLowerCase().includes(queryText) || s.label.toLowerCase().includes(subQuery));
      return filtered.map(s => ({
        cmd: s.cmd,
        desc: `Scroll to ${s.label}`,
        action: () => {
          const element = document.getElementById(s.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, null, `#${s.id}`);
          }
          setInput('');
          setShowAutocomplete(false);
        }
      }));
    }

    if (queryText.startsWith('/faq')) {
      const subQuery = queryText.substring('/faq'.length).trim().toLowerCase();
      const faqs = huddinConfig.faq.map((f, idx) => ({
        cmd: `/faq q${idx + 1}`,
        desc: f.question,
        action: () => {
          handleSendMessage(f.question);
          setInput('');
          setShowAutocomplete(false);
        }
      }));

      const filtered = faqs.filter(f => f.cmd.toLowerCase().includes(queryText) || f.desc.toLowerCase().includes(subQuery));
      return filtered;
    }

    const baseCommands = [
      { cmd: '/navigation', desc: 'Navigate homepage sections', action: () => { setInput('/navigation '); setShowAutocomplete(true); } },
      { cmd: '/faq', desc: 'Browse frequently asked questions', action: () => { setInput('/faq '); setShowAutocomplete(true); } }
    ];
    return baseCommands.filter(c => c.cmd.toLowerCase().startsWith(queryText));
  };

  const handleSendMessage = async (textToSend) => {
    if (isBlocked) return;
    const text = textToSend || input.trim();
    if (!text) return;

    setShowAutocomplete(false);

    if (text.toLowerCase().startsWith('/navigation')) {
      const parts = text.trim().split(/\s+/);
      if (parts.length > 1) {
        const sec = parts[1].toLowerCase();
        const mapping = { home: 'hero', services: 'services', portfolio: 'portfolio', reviews: 'reviews', blog: 'blog', faq: 'faq', contact: 'contact' };
        const id = mapping[sec];
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, null, `#${id}`);
          }
        }
      }
      setInput('');
      return;
    }

    if (text.toLowerCase().startsWith('/faq')) {
      const parts = text.trim().split(/\s+/);
      if (parts.length > 1) {
        const match = parts[1].match(/q(\d+)/i);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const faq = huddinConfig.faq[idx];
          if (faq) {
            handleSendMessage(faq.question);
            setInput('');
            return;
          }
        }
      }
    }

    // Quota Check
    const todayStr = new Date().toLocaleDateString('en-US');
    let savedDate = localStorage.getItem('chatbot_quota_date');
    let savedLimit = parseInt(localStorage.getItem('chatbot_quota_limit') || '15', 10);
    let savedUsed = parseInt(localStorage.getItem('chatbot_quota_used') || '0', 10);
    let savedWindowStart = parseInt(localStorage.getItem('chatbot_quota_window_start') || '0', 10);
    let savedCooldownDuration = parseInt(localStorage.getItem('chatbot_quota_cooldown_duration') || '300000', 10);
    const now = Date.now();

    if (savedDate !== todayStr) {
      savedDate = todayStr;
      savedLimit = 15;
      savedUsed = 0;
      savedWindowStart = now;
      savedCooldownDuration = 300000;
    } else if (now - savedWindowStart >= savedCooldownDuration) {
      savedLimit = 10;
      savedUsed = 0;
      savedWindowStart = now;
      savedCooldownDuration = (Math.floor(Math.random() * (10 * 60 - 5 * 60 + 1)) + 5 * 60) * 1000;
    }

    if (savedUsed >= savedLimit) {
      const secondsLeft = Math.ceil(((savedWindowStart + savedCooldownDuration) - now) / 1000);
      if (secondsLeft > 0) {
        setCooldown(secondsLeft);
      }
      return;
    }

    const newUsed = savedUsed + 1;
    localStorage.setItem('chatbot_quota_date', savedDate);
    localStorage.setItem('chatbot_quota_limit', savedLimit.toString());
    localStorage.setItem('chatbot_quota_used', newUsed.toString());
    localStorage.setItem('chatbot_quota_window_start', savedWindowStart.toString());
    localStorage.setItem('chatbot_quota_cooldown_duration', savedCooldownDuration.toString());

    setQuotaUsed(newUsed);
    setQuotaLimit(savedLimit);
    setWindowStart(savedWindowStart);
    setCooldownDuration(Math.floor(savedCooldownDuration / 1000));

    const isOneRemaining = (savedLimit - newUsed) === 1;

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
      let chosenReason = undefined;
      if (isOneRemaining) {
        chosenReason = RANDOM_REASONS[Math.floor(Math.random() * RANDOM_REASONS.length)];
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentPath: window.location.pathname,
          isLastRequest: isOneRemaining,
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

      // Add placeholder assistant message
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

        // Update the last message in state
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1].content = assistantReply;
          }
          return updated;
        });
      }

      // If session limit reached, activate cooldown
      if (newUsed >= savedLimit) {
        const randomDurationSec = Math.floor(Math.random() * (10 * 60 - 5 * 60 + 1)) + 5 * 60;
        const randomDurationMs = randomDurationSec * 1000;
        
        localStorage.setItem('chatbot_quota_cooldown_duration', randomDurationMs.toString());
        localStorage.setItem('chatbot_quota_window_start', Date.now().toString());
        
        setCooldownDuration(randomDurationSec);
        setCooldown(randomDurationSec);
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
          { sender: 'mia', content: 'I forgive you... but Nico is still mad' },
          { sender: 'system', content: '*Nico drop and locks you in.*' },
          { sender: 'system', content: 'Please wait for the timer to finish and do not exit or refresh the browser if you want Nico and Mia to forgive you.' }
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
        // Neutral attitude -> Reduce timer by 50% and hide input to limit requests
        setBanHistory(prev => [
          ...prev,
          { sender: 'nico', content: '...' },
          { sender: 'system', content: '*Nico stares at you. Attitude is neutral/acceptable, but the door remains locked.*' },
          { sender: 'system', content: 'Please wait for the prepare to finish and do not exit or trolling around if you want us to forgive you.' }
        ]);

        // Halve the countdown timer
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

  const renderBanOverlay = () => {
    const progressPercent = (banTimeLeft / 180) * 100;
    const colorClass = isForgivenButNicoNot ? 'text-blue-500' : isKickingOut ? 'text-red-500' : 'text-orange-500';
    const borderClass = isForgivenButNicoNot ? 'border-blue-500' : isKickingOut ? 'border-red-500' : 'border-orange-500';
    const bgClass = isForgivenButNicoNot ? 'bg-blue-500' : isKickingOut ? 'bg-red-500' : 'bg-orange-500';
    const timerColorClass = isForgivenButNicoNot ? 'text-blue-400' : isKickingOut ? 'text-red-400' : 'text-orange-400';
    const headerTitle = isForgivenButNicoNot
      ? 'Nico & Calm Mia Hamada'
      : isKickingOut
        ? 'Anger Nico & Mad Mia Hamada'
        : 'Mad Nico & Mia Hamada';

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
                      className="w-full h-full object-cover aspect-square select-none pointer-events-none"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      onMouseDown={(e) => e.preventDefault()}
                    />
                  </div>
                  <div className={`w-8 h-8 rounded-full overflow-hidden border ${borderClass} flex items-center justify-center bg-zinc-950 shrink-0 aspect-square`}>
                    <img
                      src="/mia.png"
                      alt="Mia Avatar"
                      className="w-full h-full object-cover aspect-square select-none pointer-events-none"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      onMouseDown={(e) => e.preventDefault()}
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
              <span>{isForgivenButNicoNot ? "We're preparing seat for you!" : isKickingOut ? "User time before kick out..." : "Redirecting to browser home..."}</span>
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isUser
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
    const posClass = position === 'left' ? 'left-6' : position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-6';

    return (
      <div
        ref={chatWindowRef}
        className={`fixed bottom-6 ${posClass} z-50 flex flex-col w-[360px] h-[500px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 font-sans`}
      >
        {/* Confirmation overlay for starting a new chat */}
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

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-accent flex items-center justify-center bg-bg-dark shrink-0 aspect-square">
                <img
                  src="/mia.png"
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
              <p className="text-[10px] font-mono text-text-muted">{huddinConfig.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
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

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ overscrollBehavior: 'contain' }}>
          {messages.map((message, i) => (
            <div key={i} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
              <div
                className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] ${message.role === 'user'
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

              {/* WhatsApp-style Suggested Questions right after the first chat bubble */}
              {i === 0 && messages.length === 1 && !isLoading && (
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

        {/* Input Form or Cooldown Status */}
        {cooldown > 0 ? (
          <div className="p-4 border-t border-border bg-bg-card/95 flex flex-col gap-2.5 animate-in fade-in duration-300 w-full shrink-0">
            <div className="flex justify-between items-center text-xs font-medium text-text-muted">
              <span>{getCurrentTask(cooldown, cooldownDuration)}</span>
            </div>
            <div className="w-full h-2 bg-bg-dark border border-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, ((cooldownDuration - cooldown) / cooldownDuration) * 100))}%` }}
              />
            </div>
          </div>
        ) : (
            <div className="p-3 bg-bg-card relative">
              {/* Autocomplete Dropup */}
              {showAutocomplete && (
                (() => {
                  const suggestions = getAutoCompleteItems();
                  if (suggestions.length === 0) return null;
                  return (
                    <div className="absolute bottom-full left-3 right-3 mb-2 z-50 bg-bg-card border border-border rounded-xl shadow-2xl p-1.5 max-h-[180px] overflow-y-auto flex flex-col gap-0.5 custom-scrollbar">
                      {suggestions.map((item, idx) => {
                        const isFocused = idx === activeSuggestionIndex;
                        const getCommandIcon = (cmd) => {
                          if (cmd.startsWith('/navigation')) {
                            return <Compass className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0" />;
                          }
                          if (cmd.startsWith('/faq')) {
                            return <HelpCircle className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0" />;
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
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 group min-w-0 ${
                              isFocused
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
                  onClick={() => setShowAutocomplete(!showAutocomplete)}
                  disabled={isBlocked || cooldown > 0}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 self-center transition-colors ${
                    showAutocomplete
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
                    value={input}
                    maxLength={300}
                    onChange={(e) => {
                      if (isBlocked || cooldown > 0) return;
                      const val = e.target.value;
                      setInput(val);
                      setActiveSuggestionIndex(0);
                      // Auto-adjust height
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`; // Max 4 lines (20px * 4 = 80px)
                    }}
                    onKeyDown={(e) => {
                      const suggestions = showAutocomplete ? getAutoCompleteItems() : [];
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
                        : "Ask me something..."
                    }
                    rows={1}
                    disabled={isBlocked || cooldown > 0}
                    className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted resize-none text-sm leading-5 py-1 focus:ring-0 overflow-y-auto disabled:opacity-50"
                    style={{ height: 'auto', maxHeight: '80px' }}
                  />
                  {input.trim() && (
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
                      className="p-1.5 rounded-lg text-accent hover:bg-bg-card disabled:opacity-40 disabled:hover:bg-transparent transition-all shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  // Floating trigger button
  const posClass = position === 'left' ? 'left-6' : position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-6';
  const triggerBtnClasses = isBlocked
    ? isForgivenButNicoNot
      ? 'bg-blue-500 hover:bg-blue-400 text-white'
      : isKickingOut
        ? 'bg-red-500 hover:bg-red-400 text-white'
        : 'bg-orange-500 hover:bg-orange-400 text-white'
    : 'bg-accent hover:bg-white text-bg-dark';

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
