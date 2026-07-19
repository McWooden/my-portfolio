"use client";
import React, { useEffect, useState } from 'react';
import { SiGooglechrome, SiSafari, SiBrave } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';

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
      alert("Tap the three dots (•••) at the top-right corner of Instagram and select 'Open in browser' or 'Open in Safari'.");
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
    <div className="fixed bottom-4 right-4 max-w-[calc(100%-2rem)] w-[360px] md:w-[380px] z-[9999] bg-bg-dark/95 backdrop-blur-md border border-border/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Close button top right */}
      <button 
        onClick={() => setIsInAppBrowser(false)}
        className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Close warning"
      >
        <IoClose className="w-5 h-5" />
      </button>

      {/* Title & Icons */}
      <div className="flex items-center gap-3 pr-6">
        <div className="flex gap-1.5 text-text-muted">
          <SiGooglechrome className="w-4 h-4" />
          <SiSafari className="w-4 h-4" />
          <SiBrave className="w-4 h-4" />
        </div>
        <h4 className="font-sans font-bold text-text-primary text-[0.85rem] tracking-tight">
          In-App Browser Alert
        </h4>
      </div>

      {/* Description */}
      <p className="font-sans text-[0.75rem] text-text-secondary leading-relaxed pr-2">
        Instagram's internal browser limits login and audio capabilities. 
        {isIOS ? (
          <span> Tap the <strong className="text-white">three dots (•••)</strong> at the top right of Instagram to select <strong className="text-white">"Open in browser"</strong>.</span>
        ) : (
          <span> Open in Chrome or Safari for the full experience.</span>
        )}
      </p>

      {/* Buttons */}
      <div className="flex gap-2 w-full mt-1">
        {!isIOS && (
          <button
            onClick={handleOpenBrowser}
            className="flex-1 py-2 rounded-lg bg-accent text-[0.75rem] font-bold text-bg-dark hover:opacity-90 transition-opacity cursor-pointer text-center"
          >
            Open Browser
          </button>
        )}
        <button
          onClick={handleCopyLink}
          className="flex-1 py-2 rounded-lg border border-border/10 text-[0.75rem] font-semibold text-text-primary hover:bg-white/5 transition-colors cursor-pointer text-center"
        >
          {copied ? "Link Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
