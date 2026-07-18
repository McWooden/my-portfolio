'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import Header from '../../components/Utils/Header';

export default function LoginPage() {
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Tenancy states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const searchParams = new URLSearchParams(window.location.search);
        const target = searchParams.get('redirectTo') || '/me/stories';
        window.location.href = target;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const target = searchParams.get('redirectTo') || '/me/stories';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${target}` },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize Google login');
      setAuthLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials');
      setAuthLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="relative min-h-[calc(100vh-100px)] bg-bg-dark text-white flex items-center justify-center font-sans overflow-hidden mt-[100px]">
        {/* Floating Chat Bubbles Container */}
        <div className="w-full max-w-[420px] mx-4 space-y-4 flex flex-col">
          
          {/* Bubble 1: Mia says Welcome back */}
          <div className="flex items-start gap-3 w-full justify-start">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-accent flex items-center justify-center bg-bg-dark shrink-0 aspect-square">
              <img
                src="/mia.webp"
                alt="Mia Avatar"
                className="w-full h-full object-cover aspect-square select-none pointer-events-none"
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(224, 255, 111, 0.4))' }}
                draggable="false"
              />
            </div>
            <div className="max-w-[80%] bg-bg-card border border-border text-text-primary rounded-2xl rounded-tl-none px-4 py-2.5 text-[0.92rem] leading-relaxed shadow-sm">
              <p>Welcome back</p>
            </div>
          </div>

          {/* Bubble 2: Mia explains the sign-in details */}
          <div className="flex items-start gap-3 w-full justify-start">
            {/* Spacer to align with the first bubble's text */}
            <div className="w-9 shrink-0" />
            <div className="max-w-[80%] bg-bg-card border border-border text-text-primary rounded-2xl rounded-tl-none px-4 py-2.5 text-[0.92rem] leading-relaxed shadow-sm">
              <p>Sign in with Google to write stories, clap, and configure your profile.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center max-w-[80%] ml-12">
              {errorMsg}
            </div>
          )}

          {/* Bubble 3: User Google Sign In Button */}
          <div className="flex items-start gap-3 w-full justify-end">
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-fit flex items-center justify-center gap-3 px-5 py-3.5 bg-accent text-bg-dark hover:brightness-110 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-2xl rounded-tr-none font-semibold transition-all duration-200 shadow-md shadow-accent/5 active:scale-[0.98] cursor-pointer self-end text-[0.95rem]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              <span>{authLoading ? 'Signing In...' : 'Sign In with Google'}</span>
            </button>
          </div>

          {/* Backup Credentials Toggle */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowPasswordLogin(!showPasswordLogin)}
              className="text-xs text-neutral-500 hover:text-neutral-300 font-mono tracking-tight transition-all duration-200 cursor-pointer"
            >
              {showPasswordLogin ? 'Hide backup authentication' : 'Use backup credentials'}
            </button>
          </div>

          {showPasswordLogin && (
            <div className="w-full bg-bg-card border border-border rounded-2xl p-5 mt-3 shadow-md flex flex-col gap-3 animate-fade-in">
              <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@huddin.dev"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 px-5 py-2.5 bg-accent hover:brightness-110 disabled:bg-neutral-800 text-bg-dark font-semibold rounded-xl transition-all duration-150 cursor-pointer text-xs"
                >
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
