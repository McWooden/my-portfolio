'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import { FiArrowLeft, FiMail, FiTrash2, FiPlus, FiUsers, FiSettings, FiCheck } from 'react-icons/fi';
import Header from '../../../components/Utils/Header';

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [accountName, setAccountName] = useState('');
  
  // Whitelist & members list
  const [whitelist, setWhitelist] = useState([]);
  const [members, setMembers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        
        // Check if there is a pending account merge/link token
        const pendingMergeToken = localStorage.getItem('pending_account_merge_token');
        if (pendingMergeToken) {
          localStorage.removeItem('pending_account_merge_token');
          setActionLoading(true);
          try {
            const { error: mergeErr } = await supabase.rpc('merge_workspaces_with_token', {
              merge_token: pendingMergeToken
            });
            if (mergeErr) throw mergeErr;
            showStatus('success', 'Google account linked and workspace merged successfully!');
            fetchAccountData(session.user.id);
          } catch (err) {
            console.error('Failed to merge workspace:', err);
            showStatus('error', err.message || 'Failed to link Google account.');
            fetchAccountData(session.user.id);
          } finally {
            setActionLoading(false);
          }
        } else {
          fetchAccountData(session.user.id);
        }
      } else {
        window.location.href = '/login';
      }
    });
  }, []);

  const fetchAccountData = async (userId) => {
    try {
      // Get membership
      const { data: member, error: memberErr } = await supabase
        .from('account_members')
        .select('account_id, accounts(name)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (memberErr) throw memberErr;

      if (member) {
        setAccountId(member.account_id);
        setAccountName(member.accounts?.name || 'Shared Account');

        // Load Whitelist
        const { data: whitelistData, error: wlErr } = await supabase
          .from('authorized_emails')
          .select('email, created_at')
          .eq('account_id', member.account_id);

        if (!wlErr && whitelistData) {
          setWhitelist(whitelistData);
        }

        // Load Registered Members
        const { data: membersData, error: memErr } = await supabase
          .from('account_members')
          .select('id, role, user_id, created_at')
          .eq('account_id', member.account_id);

        if (!memErr && membersData) {
          // Note: Since auth.users is in auth schema, we can't join directly via client SDK securely,
          // but we can query metadata or map what is present. For simplicity, list active logins by UUID or associate them.
          setMembers(membersData);
        }
      }
    } catch (err) {
      console.error('Error fetching account data:', err);
      showStatus('error', 'Failed to load account settings.');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleLinkGoogleAccount = async () => {
    if (!accountId || !user) return;
    
    setActionLoading(true);
    try {
      // 1. Insert a secure merge token in database
      const { data, error: tokenErr } = await supabase
        .from('pending_merges')
        .insert({
          account_id: accountId,
          created_by: user.id
        })
        .select('id')
        .single();

      if (tokenErr) throw tokenErr;

      // 2. Store the token ID in local storage to use upon return
      localStorage.setItem('pending_account_merge_token', data.id);
      
      // 3. Initiate Google sign-in
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/me/account`,
          queryParams: {
            prompt: 'select_account' // Force Google account selection dropdown
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      showStatus('error', err.message || 'Failed to start Google sign-in.');
      localStorage.removeItem('pending_account_merge_token');
      setActionLoading(false);
    }
  };

  const handleRemoveEmail = async (emailToRemove) => {
    if (!accountId) return;
    if (emailToRemove === user?.email) {
      showStatus('error', 'You cannot remove your own email.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${emailToRemove} from the authorized whitelist?`)) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('authorized_emails')
        .delete()
        .eq('email', emailToRemove)
        .eq('account_id', accountId);

      if (error) throw error;

      showStatus('success', 'Email removed from whitelist.');
      setWhitelist(whitelist.filter(e => e.email !== emailToRemove));
    } catch (err) {
      showStatus('error', err.message || 'Failed to remove email.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Loading Account Settings...</p>
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
                href="/me/stories"
                className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{accountName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/me/api"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer"
              >
                <FiSettings className="w-4 h-4 text-neutral-500" />
                <span>Puter API Settings</span>
              </Link>
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

          {/* Authorized Logins Card */}
          <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/15 text-accent rounded-lg">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Authorized Google Accounts</h2>
                <p className="text-xs text-neutral-500">Whitelist other email addresses to grant access to this workspace.</p>
              </div>
            </div>

            {/* Add email to whitelist via Google Sign-In */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLinkGoogleAccount}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-accent disabled:bg-neutral-800 text-bg-dark disabled:text-neutral-500 hover:brightness-110 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                </svg>
                <span>{actionLoading ? 'Connecting...' : 'Link Another Google Account'}</span>
              </button>
              <p className="text-[0.7rem] text-center text-neutral-600 font-mono">
                Clicking this will prompt a Google sign-in to authorize and merge an alternative account.
              </p>
            </div>

            {/* List whitelisted emails */}
            <div className="border border-neutral-900 rounded-xl divide-y divide-neutral-900 overflow-hidden bg-neutral-900/10">
              {whitelist.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-600 font-mono">
                  No whitelisted emails added yet. Only owners can log in.
                </div>
              ) : (
                whitelist.map((wl) => (
                  <div key={wl.email} className="flex items-center justify-between p-4 hover:bg-neutral-900/20 transition-all duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent/40 animate-pulse shrink-0" />
                      <span className="text-sm font-mono text-neutral-300">{wl.email}</span>
                      {wl.email === user?.email && (
                        <span className="px-2 py-0.5 bg-neutral-800 text-[0.65rem] text-neutral-400 font-mono rounded">You</span>
                      )}
                    </div>
                    {wl.email !== user?.email && (
                      <button
                        onClick={() => handleRemoveEmail(wl.email)}
                        disabled={actionLoading}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150 cursor-pointer"
                        title="Remove Access"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connected Member Logins */}
          <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider font-mono">Workspace Sign-Ins</h3>
            <p className="text-xs text-neutral-500">Currently registered logins linked to this workspace account.</p>
            
            <div className="border border-neutral-900 rounded-xl divide-y divide-neutral-900 bg-neutral-900/10">
              {members.map((mem) => (
                <div key={mem.id} className="flex items-center justify-between p-4 text-xs font-mono">
                  <div className="space-y-1">
                    <p className="text-neutral-300">User UUID: {mem.user_id}</p>
                    <p className="text-[0.65rem] text-neutral-600">Joined: {new Date(mem.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[0.65rem] ${
                    mem.role === 'owner' ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {mem.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
