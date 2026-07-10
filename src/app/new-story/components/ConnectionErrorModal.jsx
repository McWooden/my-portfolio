'use client';

import React, { useState } from 'react';

export default function ConnectionErrorModal({
  isOpen,
  onClose,
  title,
  subtitle,
  editorRef,
  onRetrySave,
  saveStatus
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyToClipboard = async () => {
    const rawContentHtml = editorRef.current?.innerHTML || '';
    const plainTextContent = editorRef.current?.innerText || '';
    const backupText = `TITLE: ${title}\nSUBTITLE: ${subtitle}\n\nCONTENT HTML:\n${rawContentHtml}\n\nPLAIN TEXT CONTENT:\n${plainTextContent}`;
    
    try {
      await navigator.clipboard.writeText(backupText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Dark backdrop with blur */}
      <div 
        className="absolute inset-0 bg-[#08080a]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="bg-neutral-950 border border-red-500/20 rounded-[28px] max-w-[500px] w-full p-8 shadow-[0_20px_50px_rgba(255,0,0,0.08)] relative z-10 animate-scale-up text-left overflow-hidden">
        {/* Subtle top red line accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-80" />

        {/* Warning Icon & Heading */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 text-xl shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            ⚠️
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Autosave Failed</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              We couldn't reach the database. You may have lost your internet connection or the session has expired.
            </p>
          </div>
        </div>

        {/* Options / Action Description */}
        <div className="space-y-4 mb-8">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your latest edits are safe in the editor right now, but they haven't been saved to the cloud. Please choose one of the options below to protect your work:
          </p>

          {/* Copy confirmation status indicator */}
          {copied && (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 text-xs font-mono flex items-center justify-between">
              <span>✓ Draft copied to clipboard</span>
            </div>
          )}
        </div>

        {/* Buttons Grid */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCopyToClipboard}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-medium text-white transition-all cursor-pointer active:scale-[0.98]"
          >
            <span>📋 Copy whole draft to clipboard</span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Text Copy</span>
          </button>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onRetrySave}
              disabled={saveStatus === 'Saving...'}
              className="flex-1 py-3 px-4 bg-accent hover:bg-white text-bg-dark font-semibold rounded-xl text-xs transition-all cursor-pointer text-center active:scale-95 disabled:opacity-50"
            >
              {saveStatus === 'Saving...' ? 'Saving...' : 'Try Reconnecting'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-xl text-xs font-medium border border-neutral-950 transition-all cursor-pointer"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
