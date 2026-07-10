'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiGrid, FiPlus, FiLogOut, FiHome, FiBookOpen } from 'react-icons/fi';

export default function EditorHeader({
  saveStatus,
  title,
  subtitle,
  editorRef,
  setShowPublishModal,
  setTitle,
  setSubtitle,
  setErrorMsg,
  user,
  showProfileDropdown,
  setShowProfileDropdown
}) {
  const [showLogoDropdown, setShowLogoDropdown] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setShowLogoDropdown(false);
    if (showLogoDropdown) {
      window.addEventListener('click', closeDropdown);
      return () => window.removeEventListener('click', closeDropdown);
    }
  }, [showLogoDropdown]);

  const handlePublishClick = () => {
    const finalTitle = title.trim();
    const contentHtml = editorRef.current?.innerHTML || '';
    let currentSubtitle = '';
    
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      const paragraphs = tempDiv.querySelectorAll('p');
      if (paragraphs.length > 0) {
        currentSubtitle = paragraphs[0].textContent || '';
      }
    }
    
    const finalSubtitle = subtitle || currentSubtitle;

    if (!finalTitle || finalTitle === 'Untitled Draft') {
      setErrorMsg('Please write a title first in your story.');
    } else {
      setTitle(finalTitle);
      setSubtitle(finalSubtitle.trim());
      setErrorMsg('');
      setShowPublishModal(true);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#08080a]/80 backdrop-blur-md border-b border-neutral-900/80 cursor-default">
      <div className="max-w-[680px] w-full mx-auto px-6 md:px-12 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowLogoDropdown(!showLogoDropdown);
              }}
              className="font-serif text-[22px] font-black text-white hover:text-accent transition-colors duration-150 tracking-tight mr-1 cursor-pointer focus:outline-none"
            >
              Huddin
            </button>
            {showLogoDropdown && (
              <div className="absolute left-0 mt-2 w-36 bg-neutral-950/95 backdrop-blur-xl border border-neutral-900 rounded-2xl py-2 px-1.5 shadow-2xl flex flex-col gap-0.5 z-50">
                <Link
                  href="/"
                  className="w-full text-left px-3 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                >
                  <FiHome className="w-3.5 h-3.5" /> Home
                </Link>
                <Link
                  href="/blog"
                  className="w-full text-left px-3 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                >
                  <FiBookOpen className="w-3.5 h-3.5" /> Blog
                </Link>
              </div>
            )}
          </div>
          <span className="text-neutral-500 text-sm font-normal">
            Draft
          </span>
          <span className={`text-xs ml-1 transition-all duration-150 ${saveStatus === 'Saving...' ? 'text-accent' : saveStatus === 'Error saving' ? 'text-red-400 font-bold' : 'text-neutral-600'}`}>
            {saveStatus}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublishClick}
            className="px-6 py-2.5 bg-accent hover:bg-white text-bg-dark font-semibold rounded-full text-sm transition-all duration-200 cursor-pointer active:scale-95 animate-pulse-ring"
          >
            Publish
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileDropdown(!showProfileDropdown);
              }}
              className="w-9 h-9 rounded-full overflow-hidden border border-neutral-800 hover:border-neutral-700 focus:outline-none flex items-center justify-center cursor-pointer transition-colors duration-150"
              title="User menu"
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2.5 w-48 bg-neutral-950/95 backdrop-blur-xl border border-neutral-900 rounded-2xl py-2 px-1.5 shadow-2xl flex flex-col gap-0.5 z-50">
                <Link
                  href="/me/stories"
                  className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                >
                  <FiGrid className="w-3.5 h-3.5" /> Stories
                </Link>
                <Link
                  href="/new-story"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                >
                  <FiPlus className="w-3.5 h-3.5" /> New Story
                </Link>
                <div className="h-[1px] bg-neutral-900/60 my-1" />
                <Link
                  href="/logout"
                  className="w-full text-left px-4 py-2 hover:bg-red-950/40 hover:text-red-400 rounded-xl text-xs text-red-500 transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                >
                  <FiLogOut className="w-3.5 h-3.5" /> Log Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
