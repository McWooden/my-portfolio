"use client";
import React, { useEffect, useState } from 'react';

export default function InAppBrowserOverlay() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInApp = (
      ua.indexOf('FBAN') > -1 || 
      ua.indexOf('FBAV') > -1 || 
      ua.indexOf('Instagram') > -1 || 
      ua.indexOf('Twitter') > -1 ||
      ua.indexOf('TikTok') > -1 ||
      ua.indexOf('LINE') > -1
    );

    if (isInApp) {
      setIsInAppBrowser(true);
      
      const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(iosDevice);

      // Attempt auto-redirect on Android to Chrome
      if (/android/i.test(ua)) {
        const currentUrl = window.location.href.replace(/^https?:\/\//, '');
        window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, []);

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[500px] z-[9999] bg-bg-dark/95 backdrop-blur-md border border-border/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-6 duration-300">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none">⚠️</span>
          <div className="flex flex-col gap-1 text-left">
            <h4 className="font-sans font-bold text-text-primary text-[0.85rem] tracking-tight leading-none">
              In-App Browser Detected
            </h4>
            <p className="font-sans text-[0.75rem] text-text-secondary leading-relaxed">
              Instagram/social in-app browsers restrict features like Supabase logins and YouTube audio playback. 
              {isIOS ? (
                <span> Tap the three dots (•••) at the top right and select <strong>'Open in browser'</strong> (Chrome or Safari).</span>
              ) : (
                <span> For the best experience, please open this link in your standard browser.</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={() => setIsInAppBrowser(false)}
            className="px-3 py-1.5 rounded-lg border border-border/10 text-[0.7rem] font-medium text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button 
            onClick={() => {
              const currentUrl = window.location.href;
              navigator.clipboard.writeText(currentUrl);
              alert("Link copied! Paste it in your system browser (Chrome/Safari) to open.");
            }}
            className="px-3 py-1.5 rounded-lg bg-accent text-[0.7rem] font-semibold text-bg-dark hover:opacity-90 transition-opacity cursor-pointer"
          >
            Copy URL
          </button>
        </div>
      </div>
    </div>
  );
}
