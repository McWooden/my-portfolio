import { useState, useEffect, useRef } from 'react';
import { RANDOM_REASONS } from './chatbotConstants';

export function useChatbotQuota(isOpen, isBlocked, setMessages) {
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(6);
  const [windowStart, setWindowStart] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownDuration, setCooldownDuration] = useState(1500);
  const [cooldownSteps, setCooldownSteps] = useState([]);
  const [isPuterSignedIn, setIsPuterSignedIn] = useState(false);
  const puterRef = useRef(null);

  // Dynamic Puter.js loading — passively checks if already signed in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@heyputer/puter.js')
        .then((module) => {
          puterRef.current = module.default || module;
          try {
            const alreadySignedIn = puterRef.current.auth.isSignedIn();
            if (alreadySignedIn) {
              setIsPuterSignedIn(true);
              setCooldown(0);
            }
          } catch (e) {
            console.warn("Puter auth state check:", e);
          }
        })
        .catch((err) => {
          console.error("Failed to load Puter.js library dynamically:", err);
        });
    }
  }, []);

  // Handle countdown timer & quota window reset
  const cooldownIntervalRef = useRef(null);
  const quotaUsedRef = useRef(quotaUsed);
  const quotaLimitRef = useRef(quotaLimit);
  useEffect(() => { quotaUsedRef.current = quotaUsed; }, [quotaUsed]);
  useEffect(() => { quotaLimitRef.current = quotaLimit; }, [quotaLimit]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
      if (typeof window !== 'undefined' && quotaUsedRef.current >= quotaLimitRef.current) {
        const now = Date.now();
        localStorage.setItem('chatbot_quota_limit', '4');
        localStorage.setItem('chatbot_quota_used', '0');
        localStorage.setItem('chatbot_quota_window_start', now.toString());
        const randomDurationMs = (Math.floor(Math.random() * (30 * 60 - 15 * 60 + 1)) + 15 * 60) * 1000;
        localStorage.setItem('chatbot_quota_cooldown_duration', randomDurationMs.toString());
        localStorage.removeItem('chatbot_cooldown_steps');

        setQuotaLimit(4);
        setQuotaUsed(0);
        setWindowStart(now);
        setCooldownDuration(Math.floor(randomDurationMs / 1000));
      }
      return;
    }

    if (!cooldownIntervalRef.current) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, [cooldown > 0]);

  // Check persistent block status and initialize chatbot quota on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toLocaleDateString('en-US');
      const savedDate = localStorage.getItem('chatbot_quota_date');
      let savedLimit = parseInt(localStorage.getItem('chatbot_quota_limit') || '6', 10);
      let savedUsed = parseInt(localStorage.getItem('chatbot_quota_used') || '0', 10);
      let savedWindowStart = parseInt(localStorage.getItem('chatbot_quota_window_start') || '0', 10);
      let savedCooldownDuration = parseInt(localStorage.getItem('chatbot_quota_cooldown_duration') || '900000', 10);
      let dailyUsed = parseInt(localStorage.getItem('chatbot_daily_used') || '0', 10);
      const now = Date.now();

      if (savedDate !== todayStr) {
        savedLimit = 6;
        savedUsed = 0;
        dailyUsed = 0;
        savedWindowStart = now;
        savedCooldownDuration = (Math.floor(Math.random() * (30 * 60 - 15 * 60 + 1)) + 15 * 60) * 1000;
        localStorage.setItem('chatbot_quota_date', todayStr);
        localStorage.setItem('chatbot_quota_limit', '6');
        localStorage.setItem('chatbot_quota_used', '0');
        localStorage.setItem('chatbot_daily_used', '0');
        localStorage.setItem('chatbot_quota_window_start', savedWindowStart.toString());
        localStorage.setItem('chatbot_quota_cooldown_duration', savedCooldownDuration.toString());
      } else if (now - savedWindowStart >= savedCooldownDuration) {
        savedLimit = 4;
        savedUsed = 0;
        savedWindowStart = now;
        savedCooldownDuration = (Math.floor(Math.random() * (30 * 60 - 15 * 60 + 1)) + 15 * 60) * 1000;
        localStorage.setItem('chatbot_quota_limit', '4');
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
          try {
            let steps = JSON.parse(localStorage.getItem('chatbot_cooldown_steps') || '[]');
            if (!steps || steps.length < 3) {
              const firstReason = localStorage.getItem('chatbot_current_reason');
              const rest = RANDOM_REASONS.filter(r => r !== firstReason);
              const shuffled = rest.sort(() => 0.5 - Math.random());
              steps = [firstReason || shuffled[0], shuffled[1], shuffled[2]];
              localStorage.setItem('chatbot_cooldown_steps', JSON.stringify(steps));
            }
            setCooldownSteps(steps);
          } catch (_) { }
        }
      }
    }
  }, []);

  const handlePuterSignIn = async () => {
    if (!puterRef.current) return;
    try {
      await puterRef.current.auth.signIn({ attempt_temp_user_creation: true });
      const signedIn = puterRef.current.auth.isSignedIn();
      setIsPuterSignedIn(signedIn);
      if (signedIn) {
        setCooldown(0);
        if (typeof window !== 'undefined') {
          const profileStr = localStorage.getItem('chatbot_user_profile');
          let welcomeMsg = '';
          if (profileStr) {
            try {
              const profile = JSON.parse(profileStr);
              welcomeMsg = `*Curtsies with a bright, welcoming smile.* Welcome back, ${profile.name || 'honored guest'}! Thank you for issuing a session ticket. How can I assist you today?`;
            } catch (_) {
              welcomeMsg = `*Curtsies with a bright, welcoming smile.* Thank you for issuing a session ticket! Before we begin, may I ask your name, what you do, your hobbies, where you are from, or how old you are? I would love to get to know you!`;
            }
          } else {
            welcomeMsg = `*Curtsies with a bright, welcoming smile.* Thank you for issuing a session ticket! Before we begin, may I ask your name, what you do, your hobbies, where you are from, or how old you are? I would love to get to know you!`;
          }
          setMessages(prev => [...prev, { role: 'assistant', content: welcomeMsg }]);
        }
      }
    } catch (err) {
      if (!(err && typeof err === 'object' && Object.keys(err).length === 0)) {
        console.warn("Puter sign-in:", err);
      }
    }
  };

  const handlePuterSignOut = async () => {
    if (!puterRef.current) return;
    try {
      await puterRef.current.auth.signOut();
      setIsPuterSignedIn(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chatbot_user_profile');
        setMessages(prev => [...prev, { role: 'assistant', content: '*Offers a gentle bow.* Your session ticket has been revoked. I am now back to standard visitor limits!' }]);
      }
    } catch (err) {
      console.warn("Puter sign-out:", err);
    }
  };

  /**
   * Consumes a message quota token. Returns true if allowed, or false if blocked by cooldown.
   * Modifies localStorage and hook state accordingly.
   */
  const consumeQuotaToken = () => {
    if (isPuterSignedIn) return { allowed: true };

    const todayStr = new Date().toLocaleDateString('en-US');
    let savedDate = localStorage.getItem('chatbot_quota_date');
    let savedLimit = parseInt(localStorage.getItem('chatbot_quota_limit') || '6', 10);
    let savedUsed = parseInt(localStorage.getItem('chatbot_quota_used') || '0', 10);
    let savedWindowStart = parseInt(localStorage.getItem('chatbot_quota_window_start') || '0', 10);
    let savedCooldownDuration = parseInt(localStorage.getItem('chatbot_quota_cooldown_duration') || '900000', 10);
    let dailyUsed = parseInt(localStorage.getItem('chatbot_daily_used') || '0', 10);
    const now = Date.now();

    if (savedDate !== todayStr) {
      savedDate = todayStr;
      savedLimit = 6;
      savedUsed = 0;
      dailyUsed = 0;
      savedWindowStart = now;
      savedCooldownDuration = (Math.floor(Math.random() * (30 * 60 - 15 * 60 + 1)) + 15 * 60) * 1000;
      localStorage.setItem('chatbot_daily_used', '0');
    } else if (now - savedWindowStart >= savedCooldownDuration) {
      savedLimit = 4;
      savedUsed = 0;
      savedWindowStart = now;
      savedCooldownDuration = (Math.floor(Math.random() * (30 * 60 - 15 * 60 + 1)) + 15 * 60) * 1000;
    }

    // Check daily limit first
    if (dailyUsed >= 14) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const msUntilTomorrow = tomorrow.getTime() - now;
      const secondsLeft = Math.ceil(msUntilTomorrow / 1000);
      if (secondsLeft > 0) {
        setCooldown(secondsLeft);
      }
      return { allowed: false };
    }

    // Check session limit
    if (savedUsed >= savedLimit) {
      const secondsLeft = Math.ceil(((savedWindowStart + savedCooldownDuration) - now) / 1000);
      if (secondsLeft > 0) {
        setCooldown(secondsLeft);
      }
      return { allowed: false };
    }

    const newUsed = savedUsed + 1;
    dailyUsed += 1;
    localStorage.setItem('chatbot_quota_date', savedDate);
    localStorage.setItem('chatbot_quota_limit', savedLimit.toString());
    localStorage.setItem('chatbot_quota_used', newUsed.toString());
    localStorage.setItem('chatbot_daily_used', dailyUsed.toString());

    if (newUsed >= savedLimit) {
      const cooldownSec = Math.floor(Math.random() * (30 * 60 - 15 * 60 + 1)) + 15 * 60;
      const cooldownMs = cooldownSec * 1000;
      savedWindowStart = now;
      savedCooldownDuration = cooldownMs;

      localStorage.setItem('chatbot_quota_cooldown_duration', cooldownMs.toString());
      localStorage.setItem('chatbot_quota_window_start', now.toString());

      setCooldownDuration(cooldownSec);
      setCooldown(cooldownSec);

      // Generate and set steps for the cooldown session
      const firstReason = localStorage.getItem('chatbot_current_reason');
      const rest = RANDOM_REASONS.filter(r => r !== firstReason);
      const shuffled = rest.sort(() => 0.5 - Math.random());
      const steps = [firstReason || shuffled[0], shuffled[1], shuffled[2]];
      localStorage.setItem('chatbot_cooldown_steps', JSON.stringify(steps));
      setCooldownSteps(steps);
    } else {
      localStorage.setItem('chatbot_quota_window_start', savedWindowStart.toString());
      localStorage.setItem('chatbot_quota_cooldown_duration', savedCooldownDuration.toString());
    }

    setQuotaUsed(newUsed);
    setQuotaLimit(savedLimit);
    setWindowStart(savedWindowStart);
    if (newUsed < savedLimit) {
      setCooldownDuration(Math.floor(savedCooldownDuration / 1000));
    }

    return {
      allowed: true,
      newUsed,
      savedLimit
    };
  };

  return {
    quotaUsed,
    quotaLimit,
    windowStart,
    cooldown,
    setCooldown,
    cooldownDuration,
    setCooldownDuration,
    cooldownSteps,
    setCooldownSteps,
    isPuterSignedIn,
    handlePuterSignIn,
    handlePuterSignOut,
    consumeQuotaToken
  };
}
