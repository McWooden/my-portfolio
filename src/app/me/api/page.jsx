'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import { FiArrowLeft, FiCode, FiSave, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import Header from '../../../components/Utils/Header';

export default function ApiSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [accountName, setAccountName] = useState('');
  
  // API Key config
  const [puterApiKey, setPuterApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchAccountData(session.user.id);
      } else {
        window.location.href = '/login';
      }
    });
  }, []);

  const fetchAccountData = async (userId) => {
    try {
      const { data: member, error: memberErr } = await supabase
        .from('account_members')
        .select('account_id, accounts(name, puter_api_key)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (memberErr) throw memberErr;

      if (member) {
        setAccountId(member.account_id);
        setAccountName(member.accounts?.name || 'Shared Account');
        setPuterApiKey(member.accounts?.puter_api_key || '');
      }
    } catch (err) {
      console.error('Error fetching account API keys:', err);
      showStatus('error', 'Failed to load API settings.');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!accountId) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ puter_api_key: puterApiKey.trim() || null })
        .eq('id', accountId);

      if (error) throw error;

      showStatus('success', 'Puter.js API Key updated successfully.');
    } catch (err) {
      showStatus('error', err.message || 'Failed to update Puter API key.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearKey = async () => {
    if (!accountId) return;
    if (!confirm('Are you sure you want to delete the saved Puter.js API Key?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ puter_api_key: null })
        .eq('id', accountId);

      if (error) throw error;

      setPuterApiKey('');
      showStatus('success', 'Puter.js API Key removed.');
    } catch (err) {
      showStatus('error', err.message || 'Failed to delete Puter API key.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Loading API Settings...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="relative min-h-[calc(100vh-100px)] bg-bg-dark text-white font-sans overflow-hidden mt-[100px] py-12 px-6">
        {/* Glow decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="max-w-[700px] mx-auto relative z-10 space-y-8">
          
          {/* Header & Navigation */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800/80">
            <div className="flex items-center gap-4">
              <Link
                href="/me/account"
                className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">API Settings</h1>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{accountName}</p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg.text && (
            <div className={`p-4 rounded-xl border text-xs font-mono text-center leading-relaxed animate-fade-in ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {statusMsg.text}
            </div>
          )}

          {/* Puter API Key Setup Card */}
          <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/15 text-purple-400 rounded-lg">
                <FiCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Puter.js SDK API Configuration</h2>
                <p className="text-xs text-neutral-500">Provide an API Key for your shared workspace account. This key powers Mia Assistant and Chatbot.</p>
              </div>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500">Puter App API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={puterApiKey}
                    onChange={(e) => setPuterApiKey(e.target.value)}
                    placeholder="pt_xxxxxx..."
                    className="w-full px-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm placeholder-neutral-600 focus:outline-none focus:border-accent/40 font-mono tracking-wide"
                    disabled={actionLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors duration-150 cursor-pointer"
                  >
                    {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-accent hover:brightness-110 disabled:bg-neutral-800 text-bg-dark disabled:text-neutral-500 font-semibold text-xs rounded-xl transition-all duration-150 cursor-pointer"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save Key</span>
                </button>
                
                {puterApiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs rounded-xl transition-all duration-150 cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Key</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Guide Card */}
          <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider font-mono">How to get a Puter API Key</h3>
            <div className="text-xs text-neutral-500 space-y-2 leading-relaxed">
              <p>1. Sign in to your developer panel on <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-mono">puter.com</a>.</p>
              <p>2. Create a new App in your dashboard.</p>
              <p>3. Generate an API Key (it typically starts with <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-neutral-400">pt_</code>).</p>
              <p>4. Paste your key in the input field above and save it.</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
