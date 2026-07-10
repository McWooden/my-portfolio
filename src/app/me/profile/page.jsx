'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import { FiUser, FiCode, FiArrowLeft, FiLogOut, FiActivity, FiCopy, FiCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isCopied, setIsCopied] = useState(false);

  // Puter states
  const [isPuterSignedIn, setIsPuterSignedIn] = useState(false);
  const [puterUsage, setPuterUsage] = useState(null);
  const puterRef = useRef(null);
  const fileInputRef = useRef(null);

  // Puter script to copy
  const puterCodeString = `<!-- Puter.js SDK Setup -->
<script src="https://js.puter.com/v2/"></script>
<script>
  // Initialize Puter.js
  puter.ai.chat("Hello from Puter!")
    .then(response => console.log(response));
</script>`;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user;
        setUser(u);
        setName(u.user_metadata?.name || u.user_metadata?.full_name || '');
        setUsername(u.user_metadata?.username || '');
        setAvatarUrl(u.user_metadata?.avatar_url || '');
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    });

    // Load Puter.js dynamically
    import('@heyputer/puter.js')
      .then((module) => {
        puterRef.current = module.default || module;
        checkPuterStatus();
      })
      .catch((err) => console.error('Puter load failed:', err));
  }, []);

  const checkPuterStatus = async () => {
    if (!puterRef.current) return;
    try {
      const signedIn = puterRef.current.auth.isSignedIn();
      setIsPuterSignedIn(signedIn);
      if (signedIn) {
        const usage = await puterRef.current.auth.getMonthlyUsage();
        setPuterUsage(usage);
      } else {
        setPuterUsage(null);
      }
    } catch (e) {
      console.warn('Puter status check:', e);
    }
  };

  const handlePuterConnect = async () => {
    if (!puterRef.current) return;
    try {
      if (isPuterSignedIn) {
        await puterRef.current.auth.signOut();
        setIsPuterSignedIn(false);
        setPuterUsage(null);
      } else {
        await puterRef.current.auth.signIn({ attempt_temp_user_creation: true });
        const signedIn = puterRef.current.auth.isSignedIn();
        setIsPuterSignedIn(signedIn);
        if (signedIn) {
          const usage = await puterRef.current.auth.getMonthlyUsage();
          setPuterUsage(usage);
        }
      }
    } catch (err) {
      console.error('Puter action failed:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name,
          username,
          avatar_url: avatarUrl
        }
      });
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  const uploadAvatar = async (e) => {
    try {
      setUploading(true);
      setStatusMsg({ type: '', text: '' });
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase images bucket
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setStatusMsg({ type: 'success', text: 'Avatar uploaded! Save changes to apply.' });
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(puterCodeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Securing Profile...</p>
      </div>
    );
  }

  const remaining = puterUsage?.allowanceInfo?.remaining ?? 0;
  const total = puterUsage?.allowanceInfo?.total ?? 1;
  const usagePercent = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans relative">
      {/* Decorative glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="flex-1 max-w-[800px] w-full mx-auto px-6 md:px-12 py-[80px] z-10">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-neutral-900">
          <div className="flex items-center gap-4">
            <Link href="/me/stories" className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-full transition-all">
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Profile settings</h1>
              <p className="text-sm text-neutral-500 font-mono">Configure your public credentials</p>
            </div>
          </div>
          <Link href="/logout" className="px-5 py-2.5 border border-neutral-800 hover:border-red-950/30 hover:border-red-900/50 text-neutral-400 hover:text-red-400 rounded-full text-xs font-mono transition-all duration-200 uppercase flex items-center gap-2">
            <FiLogOut /> Log Out
          </Link>
        </div>

        {statusMsg.text && (
          <div className={`mb-8 p-4 border rounded-2xl text-sm font-mono text-center ${
            statusMsg.type === 'success' 
              ? 'bg-accent/10 border-accent/20 text-accent' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar column */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-800 bg-neutral-950 relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-neutral-700">
                  <FiUser />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-t-accent border-neutral-800 rounded-full animate-spin"></span>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-700 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white rounded-full transition-all"
              >
                Change Avatar
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={uploadAvatar}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-[10px] text-neutral-500 font-mono max-w-[200px] leading-relaxed">
              Avatar images will be optimized and saved in Supabase Storage.
            </p>
          </div>

          {/* Form and Settings Column */}
          <div className="md:col-span-2 flex flex-col gap-8 text-left">
            
            {/* Account Settings form */}
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FiUser className="text-accent" /> Account Info
              </h2>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sholahuddin Ahmad"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 focus:border-accent/40 rounded-2xl text-sm text-white placeholder-neutral-700 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-neutral-600 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-3 bg-neutral-900 border border-neutral-800 focus:border-accent/40 rounded-2xl text-sm text-white placeholder-neutral-700 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-accent hover:bg-white text-bg-dark font-bold rounded-full text-xs font-mono uppercase tracking-wider transition-all self-start cursor-pointer"
              >
                Save Profile
              </button>
            </form>

            <div className="h-[1px] bg-neutral-900 my-4" />

            {/* Puter.js connection */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <FiCode className="text-accent" /> Puter.js Connection
                  </h2>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-[400px]">
                    Connect your account with Puter.js to use your own quota to write stories with Mia.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePuterConnect}
                  className={`px-5 py-2.5 font-bold font-mono text-xs uppercase tracking-wider rounded-full transition-all border cursor-pointer ${
                    isPuterSignedIn
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-accent hover:bg-white text-bg-dark border-accent'
                  }`}
                >
                  {isPuterSignedIn ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Readonly script copyable */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">SDK Initialization Code</span>
                  <button
                    onClick={copyCode}
                    className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-neutral-900 px-3 py-1.5 border border-neutral-850 rounded-xl"
                  >
                    {isCopied ? <><FiCheck className="text-accent" /> Copied!</> : <><FiCopy /> Copy SDK</>}
                  </button>
                </div>
                <pre className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl font-mono text-xs text-neutral-400 overflow-x-auto text-left select-all select-none">
                  {puterCodeString}
                </pre>
              </div>

              {/* Progress bar and statistics */}
              {isPuterSignedIn && puterUsage && (
                <div className="p-5 bg-neutral-950 border border-neutral-900 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                    <FiActivity className="text-accent" /> Monthly Quota Usage
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full">
                    <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1.5">
                      <span>Used: {((total - remaining) / 1000000).toFixed(2)}¢</span>
                      <span>Total: {(total / 1000000).toFixed(2)}¢</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-900 border border-neutral-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                      <span>{usagePercent.toFixed(1)}% consumed</span>
                      <span>Remaining: {(remaining / 1000000).toFixed(2)}¢</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
