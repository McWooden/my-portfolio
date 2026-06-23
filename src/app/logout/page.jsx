'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(3);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await supabase.auth.signOut();
        setSuccess(true);
      } catch (err) {
        console.error('Sign out error:', err);
        // Even on error, redirect
        setSuccess(true);
      }
    };
    performLogout();
  }, []);

  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      window.location.href = '/';
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [success, countdown]);

  return (
    <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white font-sans p-6 relative overflow-hidden">
      {/* Decorative gradient glowing backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center">
        {/* Chat Bubble Container */}
        <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl mb-8 animate-float">
          {/* Avatar / Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-lg">
              ✨
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">System Assistant</h3>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Session Terminated</p>
            </div>
          </div>

          {/* Speech Text */}
          <p className="text-neutral-200 leading-relaxed text-sm md:text-base">
            {!success ? (
              <span className="flex items-center gap-2 font-mono text-neutral-400">
                <span className="w-4 h-4 border-2 border-neutral-700 border-t-accent rounded-full animate-spin" />
                Processing sign out request...
              </span>
            ) : (
              <span>
                Sign out is successful! You will be redirected to the homepage in{' '}
                <span className="text-accent font-bold font-mono text-lg md:text-xl inline-block px-1">
                  {countdown}...
                </span>
              </span>
            )}
          </p>

          {/* Chat bubble pointer */}
          <div className="absolute bottom-[-10px] left-10 w-5 h-5 bg-neutral-900 border-r border-b border-neutral-800 transform rotate-45" />
        </div>

        {/* Small brand mark */}
        <div className="text-center">
          <span className="font-mono text-[10px] tracking-widest text-neutral-600 uppercase">
            Huddin Portfolio CMS
          </span>
        </div>
      </div>
    </div>
  );
}

