"use client";
import React, { useEffect, useState } from 'react';
import { SiGooglechrome, SiSafari, SiBrave } from 'react-icons/si';

export default function InAppBrowserOverlay() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [copied, setCopied] = useState(false);

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
    }
  }, []);

  const handleOpenBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(ua)) {
      const currentUrl = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else if (isIOS) {
      // Fallback for iOS
      alert("Please tap the three dots (•••) at the top-right corner of Instagram and select 'Open in browser' or 'Open in Safari'.");
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-bg-dark border border-border/10 rounded-3xl p-6 max-w-[420px] w-full shadow-2xl flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200">
        
        {/* Browser Icons Row */}
        <div className="flex gap-5 items-center justify-center text-text-primary mt-2">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <SiGooglechrome className="w-7 h-7 text-accent" />
          </div>
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <SiSafari className="w-7 h-7 text-accent" />
          </div>
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <SiBrave className="w-7 h-7 text-accent" />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bebas text-3xl uppercase tracking-wider text-text-primary">
            Open in System Browser
          </h3>
          <p className="font-sans text-[0.8rem] text-text-secondary leading-relaxed px-1">
            You are viewing this site inside a social media in-app browser. Logins and media features are restricted by Instagram.
          </p>
          {isIOS && (
            <p className="font-sans text-[0.75rem] text-accent font-semibold leading-relaxed bg-accent/5 border border-accent/10 rounded-xl p-3 mt-1.5">
              💡 Tap the <strong className="text-white">three dots (•••)</strong> at the top right of Instagram, then select <strong className="text-white">"Open in browser"</strong>.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          {!isIOS && (
            <button
              onClick={handleOpenBrowser}
              className="w-full py-3 rounded-full bg-accent text-[0.85rem] font-bold text-bg-dark hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              Open in Chrome
            </button>
          )}
          
          <button
            onClick={handleCopyLink}
            className="w-full py-3 rounded-full border border-border/10 text-[0.85rem] font-semibold text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
          >
            {copied ? "Link Copied!" : "Copy Website Link"}
          </button>
          
          <button
            onClick={() => setIsInAppBrowser(false)}
            className="w-full py-2.5 text-[0.75rem] font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            Stay here anyway
          </button>
        </div>
      </div>
    </div>
  );
}
