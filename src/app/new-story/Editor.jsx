'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';

import { convertToWebP, wrapImagesInContentEditableFalse, wrapCodeBlocksInWrapper, highlightSyntax } from './utils/editorHelpers';

// Subcomponents
import EditorHeader from './components/EditorHeader';
import FormatTooltip from './components/FormatTooltip';
import BlockInserter from './components/BlockInserter';
import ImageContextMenu from './components/ImageContextMenu';
import CodeBlockContextMenu from './components/CodeBlockContextMenu';
import PublishModal from './components/PublishModal';
import MiaAssistant from './components/MiaAssistant';
import ConnectionErrorModal from './components/ConnectionErrorModal';

const ALLOWED_EMAILS = ['huddin8876@gmail.com', 'halohuddin@gmail.com'];
const MAX_HISTORY = 15;

const cleanHtmlStyles = (html) => {
  if (typeof document === 'undefined') return html;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 1. Strip all inline styles (except on images/iframes/image wrappers, and keep text alignment)
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach((el) => {
    if (el.tagName !== 'IMG' && el.tagName !== 'IFRAME' && el.tagName !== 'PRE' && !el.closest('pre') && !el.closest('div[contenteditable="false"]')) {
      const styleVal = el.getAttribute('style') || '';
      if (styleVal.includes('text-align')) {
        const match = styleVal.match(/text-align\s*:\s*[^;]+/i);
        if (match) {
          el.setAttribute('style', match[0]);
        } else {
          el.removeAttribute('style');
        }
      } else {
        el.removeAttribute('style');
      }
    }
  });

  // 2. Merge adjacent lists of the same type (UL/OL)
  let lists = Array.from(tempDiv.querySelectorAll('ul, ol'));
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      if (!list.parentNode) continue;
      let next = list.nextSibling;
      while (next && next.nodeType === 3 && next.nodeValue.trim() === '') {
        next = next.nextSibling;
      }
      if (next && next.nodeType === 1 && next.nodeName === list.nodeName) {
        while (next.firstChild) {
          list.appendChild(next.firstChild);
        }
        next.remove();
        changed = true;
        lists = Array.from(tempDiv.querySelectorAll('ul, ol'));
        break;
      }
    }
  }

  // 3. Unwrap bare <span> elements with no class or other attributes
  //    These are browser-generated wrappers from contenteditable typing
  const spans = tempDiv.querySelectorAll('span:not([class]):not([data-type])');
  spans.forEach((span) => {
    if (!span.closest('div[contenteditable="false"]')) {
      const parent = span.parentNode;
      if (parent) {
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
      }
    }
  });

  // 4. Clean empty image captions to prevent browser-inserted <br> tags from triggering change detection
  const captions = tempDiv.querySelectorAll('.image-caption');
  captions.forEach((cap) => {
    if (cap.textContent.trim() === '') {
      cap.innerHTML = '';
    }
  });

  return tempDiv.innerHTML;
};

const mergeAdjacentLists = (root) => {
  if (!root) return;
  let lists = Array.from(root.querySelectorAll('ul, ol'));
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      if (!list.parentNode) continue;
      let next = list.nextSibling;
      while (next && next.nodeType === 3 && next.nodeValue.trim() === '') {
        next = next.nextSibling;
      }
      if (next && next.nodeType === 1 && next.nodeName === list.nodeName) {
        while (next.firstChild) {
          list.appendChild(next.firstChild);
        }
        next.remove();
        changed = true;
        lists = Array.from(root.querySelectorAll('ul, ol'));
        break;
      }
    }
  }
};

const sanitizePasteHtml = (html) => {
  if (typeof document === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const allowedTags = new Set([
    'P', 'BR', 'B', 'I', 'STRONG', 'EM', 'U', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'BLOCKQUOTE', 'UL', 'OL', 'LI', 'CODE', 'PRE'
  ]);

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toUpperCase();
      
      if (['SCRIPT', 'STYLE', 'META', 'HEAD', 'TITLE', 'LINK'].includes(tagName)) {
        return null;
      }
      
      const fragment = document.createDocumentFragment();
      node.childNodes.forEach((child) => {
        const cleanedChild = cleanNode(child);
        if (cleanedChild) {
          fragment.appendChild(cleanedChild);
        }
      });
      
      if (allowedTags.has(tagName)) {
        const newEl = document.createElement(tagName);
        
        if (tagName === 'A') {
          const href = node.getAttribute('href');
          if (href) newEl.setAttribute('href', href);
          newEl.setAttribute('target', '_blank');
          newEl.setAttribute('rel', 'noopener noreferrer');
        }
        
        const style = node.getAttribute('style') || '';
        if (style.includes('text-align')) {
          const alignMatch = style.match(/text-align\s*:\s*[^;]+/i);
          if (alignMatch) {
            newEl.setAttribute('style', alignMatch[0]);
          }
        }
        
        newEl.appendChild(fragment);
        return newEl;
      } else {
        return fragment;
      }
    }
    
    return null;
  };
  
  const destFragment = document.createDocumentFragment();
  doc.body.childNodes.forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) {
      destFragment.appendChild(cleaned);
    }
  });
  
  const temp = document.createElement('div');
  temp.appendChild(destFragment);
  return temp.innerHTML;
};

const deleteStorageImageByUrl = async (url) => {
  if (url && url.includes('/storage/v1/object/public/images/')) {
    const parts = url.split('/storage/v1/object/public/images/');
    if (parts.length > 1) {
      const fileName = decodeURIComponent(parts[1].split('?')[0]);
      if (fileName) {
        try {
          const { error } = await supabase.storage.from('images').remove([fileName]);
          if (error) {
            console.error('Failed to delete image from storage:', error.message);
          } else {
            console.log('Successfully deleted image from storage:', fileName);
          }
        } catch (err) {
          console.error('Error during storage delete:', err);
        }
      }
    }
  }
};

export default function Editor({ type }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Claps & Custom Metadata
  const [claps, setClaps] = useState(0);
  const [clapsByUser, setClapsByUser] = useState({});
  const [author, setAuthor] = useState(null);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Modal control
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Autosave and Loading State
  const [storyId, setStoryId] = useState(null);
  const storyIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saving...' | 'Saved' | 'Error saving'
  const [showErrorModal, setShowErrorModal] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Editor states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [featured, setFeatured] = useState(false);

  // Project-specific metadata
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [locationIndustryInput, setLocationIndustryInput] = useState('');
  const [testimonialQuote, setTestimonialQuote] = useState('');
  const [testimonialAuthor, setTestimonialAuthor] = useState('');
  const [testimonialCompany, setTestimonialCompany] = useState('');

  // Blog-specific metadata
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Main editor ref
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleTextareaRef = useRef(null);
  const subtitleTextareaRef = useRef(null);
  const knownImagesRef = useRef([]);
  const singleClickTimerRef = useRef(null);
  
  // Selection states
  const [isH2Active, setIsH2Active] = useState(false);
  const [isH3Active, setIsH3Active] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [showGutterButton, setShowGutterButton] = useState(false);
  const [gutterButtonPos, setGutterButtonPos] = useState({ top: 0, left: 0 });
  const [isLineEmpty, setIsLineEmpty] = useState(true);
  const [savedSelectionRange, setSavedSelectionRange] = useState(null);
  const [currentAlignment, setCurrentAlignment] = useState('left');

  // Unified table story type state
  const [storyType, setStoryType] = useState(type || 'blog');
  
  // Image Context Menu states
  const [contextMenu, setContextMenu] = useState(null); // { x: 0, y: 0, targetImg: HTMLElement }
  const touchTimeoutRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const clickStartPosRef = useRef({ x: 0, y: 0 });
  const lastMergeTimeRef = useRef(0);
  const isSavingRef = useRef(false);
  const hasPendingSaveRef = useRef(false);
  const lastSavedStateRef = useRef({
    title: '',
    subtitle: '',
    content: '',
    date: '',
    featured: false,
    location: '',
    industry: '',
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialCompany: '',
    category: '',
    storyType: '',
  });
  const isFirstLoadRef = useRef(true);
  // History stack for undo/redo (up to 15 states)
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const historyDebounceRef = useRef(null);
  const lastActionRef = useRef(null);
  const lastActionTimeRef = useRef(0);

  // Code Block Context Menu states
  const [codeBlockContextMenu, setCodeBlockContextMenu] = useState(null); // { x, y, targetPre }

  // Global listener to close context menu and handle custom dropdown click
  useEffect(() => {
    const handleGlobalClick = (e) => {
      setContextMenu(null);
      setCodeBlockContextMenu(null);

      // Custom language dropdown toggle
      const btn = e.target.closest('.code-language-btn');
      if (btn) {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        if (menu) {
          const allMenus = editorRef.current?.querySelectorAll('.code-language-menu');
          allMenus?.forEach((m) => {
            if (m !== menu) m.classList.add('hidden');
          });
          menu.classList.toggle('hidden');
        }
        return;
      }

      // Custom language dropdown option selection
      const item = e.target.closest('.code-language-item');
      if (item) {
        e.stopPropagation();
        const val = item.getAttribute('data-value');
        const menu = item.parentNode;
        const dropdown = menu.parentNode;
        const header = dropdown.parentNode;
        const pre = header.parentNode;
        
        if (pre && pre.nodeName === 'PRE') {
          pre.setAttribute('data-language', val);
          
          let contentSpan = pre.querySelector('.pre--content');
          if (!contentSpan) {
            contentSpan = document.createElement('span');
            contentSpan.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
            contentSpan.innerHTML = pre.innerHTML;
            pre.innerHTML = '';
            pre.appendChild(contentSpan);
          }
          const text = contentSpan.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<[^>]+>/g, '');
          contentSpan.innerHTML = highlightSyntax(text, val);
        }

        // Update active classes on items
        const items = menu.querySelectorAll('.code-language-item');
        items.forEach((it) => {
          const v = it.getAttribute('data-value');
          if (v === val) {
            it.className = 'code-language-item w-full text-left px-2.5 py-1.5 hover:bg-neutral-900 rounded-lg text-xs transition-colors duration-150 cursor-pointer bg-neutral-900 text-white selected';
          } else {
            it.className = 'code-language-item w-full text-left px-2.5 py-1.5 hover:bg-neutral-900 rounded-lg text-xs transition-colors duration-150 cursor-pointer text-neutral-400';
          }
        });

        // Update button visual state
        const selectedLang = dropdown.querySelector('.selected-lang');
        if (selectedLang) selectedLang.textContent = val;

        menu.classList.add('hidden');
        triggerAutosave();
        return;
      }

      // Copy code block button click
      const copyBtn = e.target.closest('.copy-code-btn');
      if (copyBtn) {
        e.stopPropagation();
        const wrapper = copyBtn.closest('.code-block-wrapper');
        const pre = wrapper;
        const contentSpan = pre?.querySelector('.pre--content');
        const text = contentSpan ? contentSpan.textContent : '';
        
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = `
              <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            `;
            
            setTimeout(() => {
              copyBtn.innerHTML = originalHtml;
            }, 2000);
          });
        }
        return;
      }

      if (editorRef.current) {
        const allMenus = editorRef.current.querySelectorAll('.code-language-menu');
        allMenus.forEach((m) => m.classList.add('hidden'));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }
  }, [contextMenu]);

  const handleSelectionChange = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();

    const isEditorFocused = editorRef.current && (
      document.activeElement === editorRef.current || 
      editorRef.current.contains(document.activeElement)
    );

    if (!isEditorFocused) {
      setShowGutterButton(false);
      setIsH2Active(false);
      setIsH3Active(false);
      return;
    }



    // 0. Save the selection range if it's inside the editor container (even if collapsed)
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      setSavedSelectionRange(selection.getRangeAt(0).cloneRange());
    }

    // 1. Handle Selection Tooltip (Bold/Italic/Link)
    if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
      // Check if selection is inside or contains a code block (PRE or pre--content)
      let containsCodeBlock = false;
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'PRE' || (node.classList && node.classList.contains('pre--content'))) {
          containsCodeBlock = true;
          break;
        }
        node = node.parentNode;
      }

      if (!containsCodeBlock && selection.rangeCount > 0) {
        try {
          const range = selection.getRangeAt(0);
          const clone = range.cloneContents();
          const tempDiv = document.createElement('div');
          tempDiv.appendChild(clone);
          if (tempDiv.querySelector('pre') || tempDiv.querySelector('.pre--content') || tempDiv.querySelector('.code-block-wrapper')) {
            containsCodeBlock = true;
          }
        } catch (_) {}
      }

      if (isMouseDownRef.current || isTouchActiveRef.current || containsCodeBlock) {
        setShowTooltip(false);
      } else {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const parentRect = containerRef.current 
            ? containerRef.current.getBoundingClientRect() 
            : editorRef.current.parentNode.getBoundingClientRect();
          
          // Calculate tooltip position (centered above selection, relative to parent container)
          const selectionCenterViewportX = rect.left + (rect.width / 2);
          
          // Clamp selection center relative to the viewport width (assuming tooltip width of ~230px, half is 115px, with 16px safety padding)
          const tooltipHalfWidth = 115;
          const screenPadding = 16;
          const minX = screenPadding + tooltipHalfWidth;
          const maxX = window.innerWidth - screenPadding - tooltipHalfWidth;
          const clampedCenterViewportX = Math.max(minX, Math.min(maxX, selectionCenterViewportX));
          
          const left = clampedCenterViewportX - parentRect.left;
          const top = rect.top - parentRect.top - 48;
          
          setTooltipPos({ top, left });
          setShowTooltip(true);
        } catch (err) {
          setShowTooltip(false);
        }
      }
    } else {
      setShowTooltip(false);
    }

    // 2. Handle Gutter Toolbar (Image / H2 / H3 toggler)
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      try {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        if (node === editorRef.current && editorRef.current.childNodes.length > 0) {
          const index = Math.min(range.startOffset, editorRef.current.childNodes.length - 1);
          node = editorRef.current.childNodes[index];
        }
        
        // Traverse up to find the block element directly inside editorRef
        while (node && node !== editorRef.current && node.parentNode !== editorRef.current) {
          node = node.parentNode;
        }
        
        if (node === editorRef.current) {
          setIsH2Active(false);
          setIsH3Active(false);
          setIsLineEmpty(true);
          setGutterButtonPos({ top: editorRef.current.offsetTop + 4, left: -44 });
          setShowGutterButton(true);
          return;
        }

        if (node && node.parentNode === editorRef.current) {
          const text = node.textContent || '';
          const tagName = node.nodeName.toUpperCase();
          
          setIsH2Active(tagName === 'H2');
          setIsH3Active(tagName === 'H3');
          setIsLineEmpty(text.trim() === '');

          // Detect alignment by climbing up the DOM from the selected node
          let align = 'left';
          let alignNode = range.startContainer;
          if (alignNode && alignNode.nodeType === 3) {
            alignNode = alignNode.parentNode;
          }
          while (alignNode && alignNode !== editorRef.current) {
            if (alignNode.style && alignNode.style.textAlign) {
              align = alignNode.style.textAlign;
              break;
            }
            alignNode = alignNode.parentNode;
          }
          setCurrentAlignment(align);
          
          // Calculate vertical position next to the active block
          const rect = node.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          const top = rect.top - editorRect.top + editorRef.current.offsetTop + (rect.height / 2) - 16;
          
          setGutterButtonPos({ top, left: -44 });
          const allowedTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE'];
          if (allowedTags.includes(tagName) && text.trim() === '') {
            setShowGutterButton(true);
          } else {
            setShowGutterButton(false);
          }
          return;
        }
      } catch (err) {
        setShowGutterButton(false);
      }
    }
    setShowGutterButton(false);
    setIsH2Active(false);
    setIsH3Active(false);
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {
      console.warn('defaultParagraphSeparator failed:', e);
    }
    try {
      document.execCommand('styleWithCSS', false, true);
    } catch (e) {
      console.warn('styleWithCSS failed:', e);
    }
    
    const onSelection = () => {
      handleSelectionChange();
    };

    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        if (!event.target.closest('.block-inserter')) {
          setShowGutterButton(false);
        }
      }
    };

    document.addEventListener('selectionchange', onSelection);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Drag selection event listeners
    const handleMouseDownGlobal = (e) => {
      isMouseDownRef.current = true;
      clickStartPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUpGlobal = (e) => {
      isMouseDownRef.current = false;
      const start = clickStartPosRef.current;
      const dist = Math.sqrt((e.clientX - start.x) ** 2 + (e.clientY - start.y) ** 2);

      if (dist < 5 && e.detail === 1) {
        // Delay gutter click so a rapid double/triple click can cancel it first.
        // This prevents the cursor collapsing to position 0 on the first click
        // of a multi-click sequence (word/paragraph selection).
        singleClickTimerRef.current = setTimeout(() => {
          singleClickTimerRef.current = null;
          handleGutterClick(e);
        }, 250);
      } else if (dist < 5) {
        // Double/triple click: cancel any pending gutter single-click action
        if (singleClickTimerRef.current) {
          clearTimeout(singleClickTimerRef.current);
          singleClickTimerRef.current = null;
        }
        setTimeout(() => handleSelectionChange(), 0);
      } else {
        // Drag selection
        if (singleClickTimerRef.current) {
          clearTimeout(singleClickTimerRef.current);
          singleClickTimerRef.current = null;
        }
        setTimeout(() => handleSelectionChange(), 0);
      }

      // Always show selection tooltip if there is an active selection
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        setTimeout(() => handleSelectionChange(), 0);
      }
    };
    const handleTouchStartGlobal = (e) => {
      isTouchActiveRef.current = true;
      if (e.touches && e.touches[0]) {
        clickStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchEndGlobal = (e) => {
      isTouchActiveRef.current = false;
      const start = clickStartPosRef.current;
      let dist = 0;
      if (e.changedTouches && e.changedTouches[0]) {
        dist = Math.sqrt((e.changedTouches[0].clientX - start.x) ** 2 + (e.changedTouches[0].clientY - start.y) ** 2);
      }
      
      if (dist < 5) {
        handleGutterClick(e.changedTouches ? e.changedTouches[0] : e);
      } else {
        setTimeout(() => {
          handleSelectionChange();
        }, 0);
      }

      // Always show selection tooltip on double tap or word selection
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        setTimeout(() => {
          handleSelectionChange();
        }, 0);
      }
    };

    document.addEventListener('mousedown', handleMouseDownGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    document.addEventListener('touchstart', handleTouchStartGlobal);
    document.addEventListener('touchend', handleTouchEndGlobal);
    
    return () => {
      document.removeEventListener('selectionchange', onSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousedown', handleMouseDownGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('touchstart', handleTouchStartGlobal);
      document.removeEventListener('touchend', handleTouchEndGlobal);
      if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleCaretScroll = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const headerThreshold = 100;
          
          if (rect.top > 0 && rect.top < headerThreshold) {
            const scrollAmount = headerThreshold - rect.top;
            window.scrollBy({
              top: -scrollAmount,
              behavior: 'auto'
            });
          }
        } catch (err) {
          // Ignore temporary measurement errors
        }
      }
    };

    document.addEventListener('selectionchange', handleCaretScroll);
    return () => {
      document.removeEventListener('selectionchange', handleCaretScroll);
    };
  }, []);

  useEffect(() => {
    if (showPublishModal) {
      setTimeout(() => {
        if (titleTextareaRef.current) {
          titleTextareaRef.current.style.height = 'auto';
          titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
        }
        if (subtitleTextareaRef.current) {
          subtitleTextareaRef.current.style.height = 'auto';
          subtitleTextareaRef.current.style.height = `${subtitleTextareaRef.current.scrollHeight}px`;
        }
      }, 50);
    }
  }, [showPublishModal, title, subtitle]);

  useEffect(() => {
    const closeDropdown = () => setShowProfileDropdown(false);
    if (showProfileDropdown) {
      window.addEventListener('click', closeDropdown);
      return () => window.removeEventListener('click', closeDropdown);
    }
  }, [showProfileDropdown]);



  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setErrorMsg('');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch story if ID is present in URL query
  useEffect(() => {
    if (!user) return;

    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    if (id) {
      setStoryId(id);
      storyIdRef.current = id;
      const loadStory = async () => {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (!error && data) {
          setTitle(data.title || '');
          if (titleRef.current) {
            titleRef.current.innerText = data.title || '';
          }
          setSubtitle(data.subtitle || '');
          setDate(data.date || new Date().toISOString().split('T')[0]);
          setStoryType(data.type || type || 'blog');
          let finalContent = '';
          if (editorRef.current) {
            const cleanedContent = cleanHtmlStyles(data.content || '');
            const wrappedImages = wrapImagesInContentEditableFalse(cleanedContent);
            const htmlContent = wrapCodeBlocksInWrapper(wrappedImages) || '<p><br></p>';
            editorRef.current.innerHTML = htmlContent;
            finalContent = cleanHtmlStyles(htmlContent);

            // Extract and store initial images
            const urls = [];
            const regex = /<img[^>]+src="([^">]+)"/g;
            let match;
            while ((match = regex.exec(htmlContent)) !== null) {
              urls.push(match[1]);
            }
            knownImagesRef.current = urls;
          } else {
            finalContent = cleanHtmlStyles(data.content || '');
          }
          const loc = data.location || '';
          const ind = data.industry || '';
          setLocation(loc);
          setIndustry(ind);
          setLocationIndustryInput([loc, ind].filter(Boolean).join(' — '));
          setTestimonialQuote(data.testimonial_quote || '');
          setTestimonialAuthor(data.testimonial_author || '');
          setTestimonialCompany(data.testimonial_company || '');
          setCategory(data.category || '');
          setCategories(data.category ? data.category.split(',').map(c => c.trim()).filter(Boolean) : []);
          
          // Parse metadata
          if (data.testimonial_company && data.testimonial_company.trim().startsWith('{')) {
            try {
               const meta = JSON.parse(data.testimonial_company);
               setClaps(meta.claps || 0);
               setClapsByUser(meta.claps_by_user || {});
               setAuthor(meta.author || null);
            } catch (_) {}
          }

          // Populate initial saved state to prevent redundant saves on load
          lastSavedStateRef.current = {
            title: data.title || '',
            subtitle: data.subtitle || '',
            content: finalContent,
            date: data.date || '',
            featured: data.featured || false,
            location: data.location || '',
            industry: data.industry || '',
            testimonialQuote: data.testimonial_quote || '',
            testimonialAuthor: data.testimonial_author || '',
            testimonialCompany: data.testimonial_company || '',
            category: data.category || '',
            storyType: data.type || type || 'blog',
          };
        } else {
          if (editorRef.current) {
            editorRef.current.innerHTML = '<p><br></p>';
          }
          knownImagesRef.current = [];
        }
        setIsLoaded(true);
      };
      loadStory();
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p><br></p>';
      }
      knownImagesRef.current = [];
      setIsLoaded(true);
    }
  }, [user, type]);

  // Seed history with the initial loaded state
  useEffect(() => {
    if (!isLoaded || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (historyRef.current.length === 0) {
      historyRef.current = [{ html }];
      historyIndexRef.current = 0;
    }
  }, [isLoaded]);



  const getCaretOffset = (element) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const offset = range.startOffset;

    let charCount = 0;

    const traverse = (node) => {
      if (node === container) {
        if (node.nodeType === Node.TEXT_NODE) {
          charCount += offset;
          return true;
        } else {
          for (let i = 0; i < offset; i++) {
            const child = node.childNodes[i];
            if (child) {
              if (child.nodeType === Node.TEXT_NODE) {
                charCount += child.nodeValue.length;
              } else if (child.tagName === 'BR') {
                charCount += 1;
              } else {
                traverse(child);
              }
            }
          }
          return true;
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        charCount += node.nodeValue.length;
      } else if (node.tagName === 'BR') {
        charCount += 1;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (traverse(node.childNodes[i])) {
            return true;
          }
        }
      }
      return false;
    };

    traverse(element);
    return charCount;
  };

  const setCaretOffset = (element, offset) => {
    const range = document.createRange();
    const selection = window.getSelection();
    
    let currentOffset = 0;
    const nodeQueue = [element];
    let targetNode = null;
    let targetOffset = 0;
    
    while (nodeQueue.length > 0) {
      const node = nodeQueue.shift();
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.nodeValue.length;
        if (currentOffset + len >= offset) {
          targetNode = node;
          targetOffset = offset - currentOffset;
          
          if (targetOffset === len && node.parentNode && node.parentNode.tagName === 'SPAN') {
            const span = node.parentNode;
            if (span.nextSibling) {
              if (span.nextSibling.nodeType === Node.TEXT_NODE) {
                targetNode = span.nextSibling;
                targetOffset = 0;
              }
            } else {
              const emptyText = document.createTextNode('');
              span.parentNode.insertBefore(emptyText, span.nextSibling);
              targetNode = emptyText;
              targetOffset = 0;
            }
          }
          break;
        }
        currentOffset += len;
      } else if (node.tagName === 'BR') {
        if (currentOffset + 1 >= offset) {
          targetNode = node.parentNode;
          const idx = Array.from(node.parentNode.childNodes).indexOf(node);
          targetOffset = offset === currentOffset ? idx : idx + 1;
          break;
        }
        currentOffset += 1;
      } else {
        let child = node.firstChild;
        while (child) {
          nodeQueue.push(child);
          child = child.nextSibling;
        }
      }
    }
    
    if (targetNode) {
      try {
        range.setStart(targetNode, targetOffset);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (_) {}
    } else {
      try {
        range.selectNodeContents(element);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (_) {}
    }
  };

  const handleEditorInput = (e) => {
    // Highlight code block if caret is inside one
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.startContainer;
      let pre = null;
      let contentSpan = null;
      
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'PRE') {
          pre = node;
        }
        if (node.classList && node.classList.contains('pre--content')) {
          contentSpan = node;
        }
        node = node.parentNode;
      }
      
      if (pre) {
        if (!contentSpan) {
          contentSpan = pre.querySelector('.pre--content');
        }
        if (contentSpan) {
          const lang = pre.getAttribute('data-language') || 'txt';
          const offset = getCaretOffset(contentSpan);
          const rawText = contentSpan.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<[^>]+>/g, '');
          const newHtml = highlightSyntax(rawText, lang);
          if (contentSpan.innerHTML !== newHtml) {
            contentSpan.innerHTML = newHtml;
            setCaretOffset(contentSpan, offset);
          }
        }
      }
    }
    
    triggerAutosave();
  };

  useEffect(() => {
    if (saveStatus === 'Error saving') {
      setShowErrorModal(true);
    } else if (saveStatus === 'Saved') {
      setShowErrorModal(false);
    }
  }, [saveStatus]);

  // ── History helpers ──────────────────────────────────────────────────────
  const getNodePath = (root, node) => {
    const path = [];
    let current = node;
    while (current && current !== root) {
      const parent = current.parentNode;
      if (!parent) break;
      const index = Array.from(parent.childNodes).indexOf(current);
      path.unshift(index);
      current = parent;
    }
    return path;
  };

  const getNodeFromPath = (root, path) => {
    let current = root;
    for (const index of path) {
      if (!current || !current.childNodes || index < 0 || index >= current.childNodes.length) {
        return null;
      }
      current = current.childNodes[index];
    }
    return current;
  };

  // Serialize cursor as detailed node paths to survive DOM state changes
  const getCursorInfo = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return null;
    const range = sel.getRangeAt(0);
    
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return null;
    }
    
    const anchorPath = getNodePath(editorRef.current, sel.anchorNode);
    const focusPath = getNodePath(editorRef.current, sel.focusNode);
    
    return {
      anchorPath,
      anchorOffset: sel.anchorOffset,
      focusPath,
      focusOffset: sel.focusOffset
    };
  };

  const restoreCursor = (cursor) => {
    if (!cursor || !editorRef.current) return;
    const anchorNode = getNodeFromPath(editorRef.current, cursor.anchorPath);
    const focusNode = getNodeFromPath(editorRef.current, cursor.focusPath);
    
    if (anchorNode && focusNode) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        try {
          sel.collapse(anchorNode, cursor.anchorOffset);
          if (sel.extend && (anchorNode !== focusNode || cursor.anchorOffset !== cursor.focusOffset)) {
            sel.extend(focusNode, cursor.focusOffset);
          }
        } catch (e) {
          console.warn("Cursor restoration failed: ", e);
        }
      }
    }
  };

  const pushHistory = (type = 'typing', immediate = false) => {
    if (typeof type === 'boolean') {
      immediate = type;
      type = 'layout';
    }
    const doIt = () => {
      const html = editorRef.current?.innerHTML || '';
      if (html.includes('upload-placeholder')) {
        return;
      }
      const current = historyRef.current[historyIndexRef.current];
      const cursor = getCursorInfo();

      if (current?.html === html) {
        if (cursor && historyIndexRef.current >= 0) {
          historyRef.current[historyIndexRef.current] = {
            ...historyRef.current[historyIndexRef.current],
            cursor,
          };
        }
        return;
      }

      const now = Date.now();
      const shouldCoalesce = 
        type === 'typing' && 
        lastActionRef.current === 'typing' && 
        (now - lastActionTimeRef.current < 2000) && 
        !immediate;

      if (shouldCoalesce && historyIndexRef.current > 0) {
        historyRef.current[historyIndexRef.current] = {
          html,
          cursor
        };
      } else {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push({ html, cursor });

        if (historyRef.current.length > MAX_HISTORY) {
          historyRef.current.shift();
        }
        historyIndexRef.current = historyRef.current.length - 1;
      }

      lastActionRef.current = type;
      lastActionTimeRef.current = now;
    };

    if (immediate) {
      if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
      doIt();
    } else {
      if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
      historyDebounceRef.current = setTimeout(doIt, 300);
    }
  };

  const applyHistoryState = (state) => {
    if (!editorRef.current) return;
    const wrappedImages = wrapImagesInContentEditableFalse(state.html);
    editorRef.current.innerHTML = wrapCodeBlocksInWrapper(wrappedImages);
    restoreCursor(state.cursor);
    triggerAutosave();
  };

  const undoHistory = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      applyHistoryState(historyRef.current[historyIndexRef.current]);
    }
  };

  const redoHistory = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      applyHistoryState(historyRef.current[historyIndexRef.current]);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Autosave triggers
  const triggerAutosave = () => {
    console.log('[DEBUG AUTOSAVE] triggerAutosave called');
    console.trace();
    // Each input event schedules a debounced history snapshot + db save
    pushHistory();
    setSaveStatus('Saving...');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await performAutosave();
    }, 2000);
  };

  const performAutosave = async () => {
    if (isSavingRef.current) {
      hasPendingSaveRef.current = true;
      return;
    }
    isSavingRef.current = true;
    setSaveStatus('Saving...');
    try {
      const currentTitle = title.trim() || 'Untitled Draft';
      const rawContentHtml = editorRef.current?.innerHTML || '';
      const contentHtml = cleanHtmlStyles(rawContentHtml);
      const coverImage = getCoverImage();

      // Extract current images and compare with known images to clean up deleted files
      const currentUrls = [];
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      while ((match = imgRegex.exec(contentHtml)) !== null) {
        currentUrls.push(match[1]);
      }
      const deletedImages = knownImagesRef.current.filter(url => !currentUrls.includes(url));
      for (const url of deletedImages) {
        await deleteStorageImageByUrl(url);
      }
      knownImagesRef.current = currentUrls;

      // Auto generate slug
      const currentSlug = currentTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '---');
      const authorMeta = user ? {
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
        username: user.user_metadata?.username || user.email.split('@')[0],
        avatar: user.user_metadata?.avatar_url || '',
        email: user.email
      } : null;

      const finalTestimonialCompany = storyType === 'blog' && authorMeta
        ? JSON.stringify({ claps, claps_by_user: clapsByUser, author: authorMeta })
        : testimonialCompany;

      if (!user) {
        setSaveStatus('Error saving');
        isSavingRef.current = false;
        return;
      }

      // Check if any actual values changed from the last saved state
      const hasChanged =
        currentTitle !== lastSavedStateRef.current.title ||
        subtitle !== lastSavedStateRef.current.subtitle ||
        contentHtml !== lastSavedStateRef.current.content ||
        date !== lastSavedStateRef.current.date ||
        featured !== lastSavedStateRef.current.featured ||
        location !== lastSavedStateRef.current.location ||
        industry !== lastSavedStateRef.current.industry ||
        testimonialQuote !== lastSavedStateRef.current.testimonialQuote ||
        testimonialAuthor !== lastSavedStateRef.current.testimonialAuthor ||
        finalTestimonialCompany !== lastSavedStateRef.current.testimonialCompany ||
        category !== lastSavedStateRef.current.category ||
        storyType !== lastSavedStateRef.current.storyType;

      const currentStoryId = storyIdRef.current;
      if (!hasChanged && currentStoryId) {
        console.log('[DEBUG AUTOSAVE] No content changes detected, skipping database save.');
        setSaveStatus('Saved');
        isSavingRef.current = false;
        return;
      }

      if (!currentStoryId) {
        // Insert new draft row
        const insertData = {
          user_id: user.id,
          title: currentTitle,
          subtitle,
          content: contentHtml,
          cover_image: coverImage,
          date,
          published: false,
          type: storyType,
          slug: `${currentSlug}---${Math.random().toString(36).substring(2, 7)}`,
          location,
          industry,
          featured,
          testimonial_quote: testimonialQuote,
          testimonial_author: testimonialAuthor,
          testimonial_company: finalTestimonialCompany,
          category,
        };

        const { data, error } = await supabase
          .from('stories')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          storyIdRef.current = data.id;
          setStoryId(data.id);
          const newUrl = `${window.location.pathname}?id=${data.id}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        }
      } else {
        // Update existing row
        const updateData = {
          title: currentTitle,
          subtitle,
          content: contentHtml,
          cover_image: coverImage,
          date,
          type: storyType,
          location,
          industry,
          featured,
          testimonial_quote: testimonialQuote,
          testimonial_author: testimonialAuthor,
          testimonial_company: finalTestimonialCompany,
          category,
        };

        const { error } = await supabase
          .from('stories')
          .update(updateData)
          .eq('id', currentStoryId)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Sync the cache with the successfully saved state values
      lastSavedStateRef.current = {
        title: currentTitle,
        subtitle,
        content: contentHtml,
        date,
        featured,
        location,
        industry,
        testimonialQuote,
        testimonialAuthor,
        testimonialCompany: finalTestimonialCompany,
        category,
        storyType,
      };

      setSaveStatus('Saved');
    } catch (err) {
      console.error('Autosave error:', err?.message || err);
      setSaveStatus('Error saving');
    } finally {
      isSavingRef.current = false;
      if (hasPendingSaveRef.current) {
        hasPendingSaveRef.current = false;
        performAutosave();
      }
    }
  };

  useEffect(() => {
    if (!isLoaded || loading || !user) return;
    
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      console.log('[DEBUG AUTOSAVE] Skipping autosave on initial load.');
      return;
    }

    console.log('[DEBUG AUTOSAVE] Metadata useEffect triggered. Values:', {
      title, subtitle, date, featured, location, industry, testimonialQuote, testimonialAuthor, testimonialCompany, category, storyType, isLoaded
    });
    triggerAutosave();
  }, [title, subtitle, date, featured, location, industry, testimonialQuote, testimonialAuthor, testimonialCompany, category, storyType, isLoaded]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/new-story` : undefined,
        },
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      const currentUser = data.user;
      if (currentUser && !ALLOWED_EMAILS.includes(currentUser.email)) {
        setErrorMsg(`Access Denied: ${currentUser.email} is not authorized.`);
        await supabase.auth.signOut();
        setUser(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  // Editor Actions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleFormat = (command, value = null) => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (savedSelectionRange && selection) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRange);
    }
    document.execCommand(command, false, value);
    handleSelectionChange();
    triggerAutosave();
  };

  const toggleBlock = (tag) => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    
    let range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    let node = range ? range.startContainer : null;
    
    while (node && node !== editorRef.current && node.parentNode !== editorRef.current) {
      node = node.parentNode;
    }
    
    if (node && node.parentNode === editorRef.current) {
      const currentTagName = node.nodeName.toUpperCase();
      if (currentTagName === tag.toUpperCase()) {
        document.execCommand('formatBlock', false, 'P');
      } else {
        document.execCommand('formatBlock', false, tag);
      }
      triggerAutosave();
      setTimeout(() => {
        handleSelectionChange();
      }, 50);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const insertImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be uploaded consecutively
    e.target.value = '';

    // Save selection range before we lose focus to file selection dialog
    let savedRange = null;
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && sel.rangeCount > 0) {
      savedRange = sel.getRangeAt(0).cloneRange();
    }

    setSaveStatus('Saving...');

    // Detect local file dimensions to use for aspect-ratio matching
    let aspectRatio = '16/9';
    const tempFileUrl = URL.createObjectURL(file);
    try {
      const imgDimensions = new Image();
      imgDimensions.src = tempFileUrl;
      await new Promise((resolve) => {
        imgDimensions.onload = () => {
          if (imgDimensions.width && imgDimensions.height) {
            aspectRatio = `${imgDimensions.width} / ${imgDimensions.height}`;
          }
          resolve();
        };
        imgDimensions.onerror = resolve;
      });
    } catch (err) {
      console.warn('Failed to detect uploading image dimensions:', err);
    } finally {
      URL.revokeObjectURL(tempFileUrl);
    }

    // Generate a unique ID for the placeholder element
    const placeholderId = `upload-placeholder-${Date.now()}`;
    
    // Create placeholder element HTML
    const placeholderHtml = `<div id="${placeholderId}" contenteditable="false" class="w-full my-6 select-none flex flex-col items-center justify-center bg-bg-card border border-border rounded-[20px] animate-pulse" style="aspect-ratio: ${aspectRatio};"><div class="flex flex-col items-center gap-2 text-text-muted"><svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="text-xs font-mono">Uploading image...</span></div></div><p><br></p>`;

    // Restore Selection and insert the placeholder instantly
    if (editorRef.current) {
      editorRef.current.focus();
      if (savedRange && sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
        document.execCommand('insertHTML', false, placeholderHtml);
      } else {
        editorRef.current.innerHTML += placeholderHtml;
      }
    }

    try {
      // 1. Convert client-side to WebP
      const webpBlob = await convertToWebP(file);

      // 2. Upload to Supabase Storage bucket 'images'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, webpBlob, {
            contentType: 'image/webp',
            cacheControl: '31536000',
          });

      let imgUrl = '';
      if (error) {
        console.error('Supabase storage upload failed, falling back to base64:', error);
        
        // Fallback to data URL
        imgUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(webpBlob);
        });
      } else {
        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
        imgUrl = publicUrl;
      }

      // Wait for the image to load and decode fully in the background
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.decode) {
            img.decode().then(resolve).catch(resolve);
          } else {
            resolve();
          }
        };
        img.onerror = resolve;
        img.src = imgUrl;
      });

      // Replace placeholder contents with the final loaded image
      const placeholderElement = editorRef.current?.querySelector(`#${placeholderId}`);
      if (placeholderElement) {
        placeholderElement.removeAttribute('id');
        placeholderElement.className = 'image-wrapper w-full my-6 select-none flex flex-col items-center';
        placeholderElement.style.aspectRatio = aspectRatio;
        placeholderElement.innerHTML = `
          <img src="${imgUrl}" alt="Uploaded Image" class="rounded-[20px] border border-border w-full" style="aspect-ratio: ${aspectRatio};" />
          <span class="image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full" contenteditable="true" placeholder="Type caption for image (optional)"></span>
        `;
        knownImagesRef.current.push(imgUrl);
        setSaveStatus('Saved');
        triggerAutosave();
      } else {
        // The user undid or deleted the placeholder during upload - clean up the storage file!
        await deleteStorageImageByUrl(imgUrl);
      }
    } catch (err) {
      console.error('Error processing/uploading image:', err);
      // Clean up placeholder on failure
      const placeholderElement = editorRef.current?.querySelector(`#${placeholderId}`);
      if (placeholderElement) {
        placeholderElement.remove();
      }
      setSaveStatus('Error saving');
    }
  };

  const insertEmbed = () => {
    const url = prompt('Enter video or link URL to embed:');
    if (!url) return;
    
    let embedUrl = url;
    if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com/watch') 
        ? new URLSearchParams(new URL(url).search).get('v')
        : url.split('/').pop().split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    let embedHtml = '';
    if (embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com')) {
      embedHtml = `<div class="w-full aspect-video rounded-[20px] my-6 overflow-hidden border border-neutral-900 shadow-lg relative">
        <iframe src="${embedUrl}" class="absolute inset-0 w-full h-full border-0" allowfullscreen></iframe>
      </div>`;
    } else {
      embedHtml = `<div class="w-full h-[400px] rounded-[20px] my-6 overflow-hidden border border-neutral-900 shadow-lg relative">
        <iframe src="${embedUrl}" class="absolute inset-0 w-full h-full border-0"></iframe>
      </div>`;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (savedSelectionRange && selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRange);
        document.execCommand('insertHTML', false, embedHtml);
      } else {
        editorRef.current.innerHTML += embedHtml;
      }
      triggerAutosave();
    }
  };

  const applyAlignment = (alignValue) => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    pushHistory(true);
    
    const range = selection.getRangeAt(0);
    
    const getBlockAncestor = (node) => {
      let curr = node;
      if (curr && curr.nodeType === 3) curr = curr.parentNode;
      
      // If the node is inside a list item, always target the list item itself!
      const li = curr.closest('li');
      if (li && editorRef.current?.contains(li)) {
        return li;
      }
      
      while (curr && curr !== editorRef.current) {
        if (['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'].includes(curr.nodeName.toUpperCase())) {
          return curr;
        }
        curr = curr.parentNode;
      }
      return null;
    };
    
    const startBlock = getBlockAncestor(range.startContainer);
    const endBlock = getBlockAncestor(range.endContainer);
    
    const blocks = [];
    if (startBlock) blocks.push(startBlock);
    if (endBlock && endBlock !== startBlock) blocks.push(endBlock);
    
    // Also find intermediate siblings if selecting multiple paragraphs
    if (startBlock && endBlock && startBlock !== endBlock) {
      let next = startBlock.nextSibling;
      while (next && next !== endBlock) {
        const block = getBlockAncestor(next);
        if (block && !blocks.includes(block)) {
          blocks.push(block);
        }
        next = next.nextSibling;
      }
    }
    
    blocks.forEach((block) => {
      if (alignValue === 'left') {
        block.style.removeProperty('text-align');
        if (block.getAttribute('style') === '') {
          block.removeAttribute('style');
        }
      } else {
        block.style.textAlign = alignValue;
      }
      
      // Clean up text-align styles on children so they inherit from the main block
      const styledChildren = block.querySelectorAll('*');
      styledChildren.forEach((child) => {
        if (child.style) {
          child.style.removeProperty('text-align');
          if (child.getAttribute('style') === '') {
            child.removeAttribute('style');
          }
        }
      });
    });
    
    handleSelectionChange();
    triggerAutosave();
  };

  const cycleAlignment = () => {
    let nextAlign = 'left';
    if (currentAlignment === 'left') {
      nextAlign = 'center';
    } else if (currentAlignment === 'center') {
      nextAlign = 'right';
    }
    applyAlignment(nextAlign);
  };

  const handleLocationIndustryChange = (val) => {
    setLocationIndustryInput(val);
    const parts = val.split(/\s*[-—•]\s*/);
    const loc = parts[0] ? parts[0].trim() : '';
    const ind = parts[1] ? parts[1].trim() : '';
    setLocation(loc);
    setIndustry(ind);
  };

  const addCategoryTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      setCategory(updated.join(', '));
    }
  };

  const removeCategoryTag = (indexToRemove) => {
    const updated = categories.filter((_, idx) => idx !== indexToRemove);
    setCategories(updated);
    setCategory(updated.join(', '));
  };

  const createEditorDropdown = (selectedLang = 'txt') => {
    const dropdown = document.createElement('div');
    dropdown.className = 'code-language-dropdown relative z-20';
    
    const btn = document.createElement('button');
    btn.className = 'code-language-btn text-neutral-400 text-xs font-sans opacity-70 hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1';
    btn.setAttribute('type', 'button');
    
    const span = document.createElement('span');
    span.className = 'selected-lang';
    span.textContent = selectedLang;
    
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = '▼';
    chevron.style.fontSize = '8px';
    chevron.style.marginLeft = '2px';
    chevron.style.opacity = '0.5';
    
    btn.appendChild(span);
    btn.appendChild(chevron);
    
    const menu = document.createElement('div');
    menu.className = 'code-language-menu hidden absolute left-0 mt-1 w-24 bg-neutral-950 border border-neutral-900 rounded-xl py-1.5 px-1 shadow-2xl flex flex-col gap-0.5 z-30 max-h-40 overflow-y-auto';
    
    const languages = [
      { val: 'txt', label: 'txt' },
      { val: 'html', label: 'html' },
      { val: 'css', label: 'css' },
      { val: 'js', label: 'js' },
      { val: 'ts', label: 'ts' },
      { val: 'jsx', label: 'jsx' },
      { val: 'tsx', label: 'tsx' },
      { val: 'python', label: 'python' },
      { val: 'php', label: 'php' },
      { val: 'json', label: 'json' }
    ];
    
    languages.forEach((lang) => {
      const item = document.createElement('div');
      const isSel = lang.val === selectedLang;
      item.className = `code-language-item w-full text-left px-2.5 py-1.5 hover:bg-neutral-900 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${isSel ? 'bg-neutral-900 text-white selected' : 'text-neutral-400'}`;
      item.setAttribute('data-value', lang.val);
      item.textContent = lang.label;
      menu.appendChild(item);
    });
    
    dropdown.appendChild(btn);
    dropdown.appendChild(menu);
    return dropdown;
  };

  const insertCodeBlock = () => {
    if (!editorRef.current) return;

    const pre = document.createElement('pre');
    pre.className = 'code-block-wrapper relative group my-6 border border-neutral-900 bg-[#050505] rounded-2xl p-8 flex flex-col gap-0';
    pre.setAttribute('data-language', 'txt');
    pre.setAttribute('spellcheck', 'false');

    // Header bar
    const header = document.createElement('div');
    header.className = 'code-block-header flex items-center justify-between';
    header.setAttribute('contenteditable', 'false');

    // Dropdown container
    const dropdown = createEditorDropdown('txt');
    header.appendChild(dropdown);

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn border border-neutral-800 rounded-lg px-2 py-1 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-sans';
    copyBtn.setAttribute('type', 'button');
    copyBtn.innerHTML = `
      <svg class="w-3 h-3 transform -scale-x-100" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>Copy</span>
    `;
    header.appendChild(copyBtn);

    const span = document.createElement('span');
    span.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
    span.textContent = '// Write your code here...';

    pre.appendChild(header);
    pre.appendChild(span);

    const selection = window.getSelection();
    const range = savedSelectionRange || (selection?.rangeCount > 0 ? selection.getRangeAt(0) : null);

    if (range) {
      let block = range.startContainer;
      while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
        block = block.parentNode;
      }

      if (block && block.parentNode === editorRef.current) {
        const isEmpty = block.textContent.trim() === '' || block.innerHTML === '<br>';
        if (isEmpty) {
          editorRef.current.insertBefore(pre, block);
          block.remove();
        } else {
          if (block.nextSibling) {
            editorRef.current.insertBefore(pre, block.nextSibling);
          } else {
            editorRef.current.appendChild(pre);
          }
        }
      } else {
        editorRef.current.appendChild(pre);
      }
    } else {
      editorRef.current.appendChild(pre);
    }

    span.focus();
    const newRange = document.createRange();
    const sel = window.getSelection();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(newRange);

    triggerAutosave();
  };

  const handleEditorClick = (e) => {
    const img = e.target.closest('img');
    if (img && editorRef.current?.contains(img)) {
      e.stopPropagation();
      const wrapper = img.closest('div[contenteditable="false"]');
      if (wrapper) {
        let caption = wrapper.querySelector('.image-caption');
        if (!caption) {
          caption = document.createElement('span');
          caption.className = 'image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full';
          caption.contentEditable = 'true';
          caption.setAttribute('placeholder', 'Type caption for image (optional)');
          wrapper.appendChild(caption);
        }
        caption.focus();
        caption.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const mergeBlockIntoHeading = (heading, block) => {
    // Snapshot BEFORE the merge so undo can step back to this exact state
    pushHistory(true);

    // Find the last text node of the heading to determine insertion context
    let lastTextNode = null;
    const walkHeading = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walkHeading.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim() !== '') {
        lastTextNode = node;
      }
    }

    // The parent of the last text node is the innermost formatting wrapper
    // (e.g. <strong>, <em>, <span style="..">) — merged text should live inside it
    const insertionParent = lastTextNode ? lastTextNode.parentNode : heading;

    // Move every child of the paragraph block into the heading's last format context
    const children = Array.from(block.childNodes);
    let insertAfter = lastTextNode;
    children.forEach(child => {
      if (child.nodeName === 'BR') return; // drop placeholder <br>
      if (insertAfter && insertAfter.nextSibling) {
        insertionParent.insertBefore(child, insertAfter.nextSibling);
      } else {
        insertionParent.appendChild(child);
      }
      insertAfter = child;
    });

    block.remove();

    // Place cursor right at the join point
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel && lastTextNode && lastTextNode.parentNode) {
      range.setStart(lastTextNode, lastTextNode.nodeValue.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    triggerAutosave();
  };

  const handleEditorKeyDown = async (e) => {
    // Enter key inside pre block -> manually insert a <br> at the cursor position
    if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        let contentSpan = null;
        while (node && node !== editorRef.current) {
          if (node.classList && node.classList.contains('pre--content')) {
            contentSpan = node;
            break;
          }
          node = node.parentNode;
        }
        if (contentSpan) {
          e.preventDefault();
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const br = document.createElement('br');
          range.insertNode(br);
          // After a br at the very end, we need a second br to show the new line
          const isAtEnd = !br.nextSibling || (br.nextSibling.nodeType === Node.TEXT_NODE && br.nextSibling.nodeValue === '') || br.nextSibling === null;
          const hasTrailingBr = br.nextSibling && br.nextSibling.nodeName === 'BR';
          if (isAtEnd && !hasTrailingBr) {
            const trailingBr = document.createElement('br');
            br.parentNode.insertBefore(trailingBr, br.nextSibling);
          }
          // Move cursor after the inserted br
          const newRange = document.createRange();
          newRange.setStartAfter(br);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          triggerAutosave();
          return;
        }
      }
    }

    // Tab key inside pre block -> insert 5 spaces
    if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        let node = selection.anchorNode;
        let pre = null;
        while (node && node !== editorRef.current) {
          if (node.nodeName === 'PRE') {
            pre = node;
            break;
          }
          node = node.parentNode;
        }
        if (pre) {
          e.preventDefault();
          document.execCommand('insertText', false, '     ');
          triggerAutosave();
          return;
        }
      }
    }

    // For any key that restructures blocks, stamp the current cursor onto the
    // most recent history entry RIGHT NOW (before the key is processed).
    // This ensures Ctrl+Z restores the cursor to where the user actually was,
    // not to where the debounced snapshot happened to fire later.
    if (['Enter', 'Backspace', 'Delete'].includes(e.key) && !(e.ctrlKey || e.metaKey)) {
      const preCursor = getCursorInfo();
      if (preCursor && historyIndexRef.current >= 0) {
        historyRef.current[historyIndexRef.current] = {
          ...historyRef.current[historyIndexRef.current],
          cursor: preCursor,
        };
      }
    }

    // Case List-A: Space key after '1.', '-', or '*' -> convert to Ordered/Unordered List
    if ((e.key === ' ' || e.keyCode === 32) && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        let block = range.startContainer;
        while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
          block = block.parentNode;
        }
        if (block && block.parentNode === editorRef.current) {
          const tagName = block.nodeName.toUpperCase();
          if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
            const rangeToCaret = document.createRange();
            rangeToCaret.setStart(block, 0);
            rangeToCaret.setEnd(range.startContainer, range.startOffset);
            const textBeforeCaret = rangeToCaret.toString();
            
            if (textBeforeCaret === '1.' || textBeforeCaret === '-' || textBeforeCaret === '*') {
              e.preventDefault();
              pushHistory(true);
              
              const listType = textBeforeCaret === '1.' ? 'OL' : 'UL';
              const li = document.createElement('li');
              
              const rangeAfterCaret = document.createRange();
              rangeAfterCaret.setStart(range.startContainer, range.startOffset);
              rangeAfterCaret.setEnd(block, block.childNodes.length);
              const remainingFrag = rangeAfterCaret.extractContents();
              
              if (remainingFrag.childNodes.length === 0 || remainingFrag.textContent.trim() === '') {
                li.innerHTML = '<br>';
              } else {
                li.appendChild(remainingFrag);
                if (li.firstChild && li.firstChild.nodeType === Node.TEXT_NODE) {
                  li.firstChild.nodeValue = li.firstChild.nodeValue.replace(/^\s+/, '');
                }
                if (li.innerHTML.trim() === '') {
                  li.innerHTML = '<br>';
                }
              }
              
              const list = document.createElement(listType);
              list.appendChild(li);
              block.parentNode.replaceChild(list, block);
              
              mergeAdjacentLists(editorRef.current);
              
              let targetNode = li;
              let targetOffset = 0;
              const walk = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null, false);
              const firstText = walk.nextNode();
              if (firstText) {
                targetNode = firstText;
                targetOffset = 0;
              }
              
              const newRange = document.createRange();
              newRange.setStart(targetNode, targetOffset);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              li.focus();
              
              triggerAutosave();
              return;
            }
          }
        }
      }
    }

    // Case List-B: Enter key on empty LI -> convert to P and exit list
    if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        let node = selection.anchorNode;
        let li = null;
        while (node && node !== editorRef.current) {
          if (node.nodeName === 'LI') {
            li = node;
            break;
          }
          node = node.parentNode;
        }
        if (li) {
          const isEmpty = li.textContent.trim() === '' && !li.querySelector('img, iframe, pre');
          if (isEmpty) {
            e.preventDefault();
            pushHistory(true);
            
            const list = li.parentNode;
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            
            if (list.childNodes.length <= 1) {
              list.parentNode.insertBefore(p, list);
              list.remove();
            } else {
              if (li === list.lastChild) {
                list.parentNode.insertBefore(p, list.nextSibling);
                li.remove();
              } else if (li === list.firstChild) {
                list.parentNode.insertBefore(p, list);
                li.remove();
              } else {
                const listTag = list.tagName;
                const secondList = document.createElement(listTag);
                
                let next = li.nextSibling;
                while (next) {
                  const tempNext = next.nextSibling;
                  secondList.appendChild(next);
                  next = tempNext;
                }
                
                list.parentNode.insertBefore(p, list.nextSibling);
                if (secondList.childNodes.length > 0) {
                  list.parentNode.insertBefore(secondList, p.nextSibling);
                }
                li.remove();
              }
            }
            
            const range = document.createRange();
            range.setStart(p, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            p.focus();
            
            triggerAutosave();
            return;
          }
        }
      }
    }

    if (e.target && e.target.classList && e.target.classList.contains('image-caption') && (e.key === 'Enter' || e.keyCode === 13)) {
      e.preventDefault();
      
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      
      let block = e.target;
      while (block && block.parentNode !== editorRef.current) {
        block = block.parentNode;
      }
      
      if (block && block.nextSibling) {
        editorRef.current.insertBefore(p, block.nextSibling);
      } else {
        editorRef.current.appendChild(p);
      }
      
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(p, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      p.focus();
      
      triggerAutosave();
      return;
    }

    // Ctrl+Z / Cmd+Z → undo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      undoHistory();
      return;
    }

    // Ctrl+Shift+Z / Ctrl+Y / Cmd+Shift+Z → redo
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault();
      redoHistory();
      return;
    }

    if (e.key === 'Backspace') {
      const selection = window.getSelection();

      // Case List-Backspace: Backspace on empty LI -> convert to P first (exit list)
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        let li = null;
        while (node && node !== editorRef.current) {
          if (node.nodeName === 'LI') {
            li = node;
            break;
          }
          node = node.parentNode;
        }
        if (li) {
          const isEmpty = li.textContent.trim() === '' && !li.querySelector('img, iframe, pre');
          if (isEmpty && range.startOffset === 0) {
            e.preventDefault();
            pushHistory(true);
            
            const list = li.parentNode;
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            
            if (list.childNodes.length <= 1) {
              list.parentNode.insertBefore(p, list);
              list.remove();
            } else {
              if (li === list.lastChild) {
                list.parentNode.insertBefore(p, list.nextSibling);
                li.remove();
              } else if (li === list.firstChild) {
                list.parentNode.insertBefore(p, list);
                li.remove();
              } else {
                const listTag = list.tagName;
                const secondList = document.createElement(listTag);
                
                let next = li.nextSibling;
                while (next) {
                  const tempNext = next.nextSibling;
                  secondList.appendChild(next);
                  next = tempNext;
                }
                
                list.parentNode.insertBefore(p, list.nextSibling);
                if (secondList.childNodes.length > 0) {
                  list.parentNode.insertBefore(secondList, p.nextSibling);
                }
                li.remove();
              }
            }
            
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            p.focus();
            
            triggerAutosave();
            return;
          }
        }
      }

      // Case A000: Backspace at the start of a block following a codeblock -> merge paragraph text into codeblock
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        let block = range.startContainer;
        while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
          block = block.parentNode;
        }
        if (block && block.parentNode === editorRef.current) {
          const prevSibling = block.previousSibling;
          if (prevSibling && prevSibling.nodeType === 1 && prevSibling.classList.contains('code-block-wrapper')) {
            const checkRange = document.createRange();
            checkRange.setStart(block, 0);
            checkRange.setEnd(range.startContainer, range.startOffset);
            if (checkRange.toString() === '') {
              e.preventDefault();
              pushHistory(true);
              
              const pre = prevSibling;
              let codeEl = pre?.querySelector('.pre--content');
              if (pre) {
                const currentLang = pre.querySelector('.selected-lang')?.textContent || 'txt';
                if (!codeEl) {
                  codeEl = document.createElement('span');
                  codeEl.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
                  pre.appendChild(codeEl);
                }
                
                const currentCodeText = codeEl.textContent || '';
                const blockText = block.textContent || '';
                const separator = currentCodeText ? '\n' : '';
                const newCodeText = currentCodeText + separator + blockText;
                
                codeEl.textContent = newCodeText;
                codeEl.innerHTML = highlightSyntax(newCodeText, currentLang);
                
                block.remove();
                
                const targetOffset = currentCodeText.length + separator.length;
                pre.focus();
                setCaretOffset(codeEl, targetOffset);
                
                triggerAutosave();
                return;
              }
            }
          }
        }
      }

      // Case A00: Backspace at the start of a block following a heading -> merge preserving style of heading's last letter
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        let block = range.startContainer;
        while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
          block = block.parentNode;
        }
        if (block && block.parentNode === editorRef.current) {
          const prevSibling = block.previousSibling;
          if (prevSibling && prevSibling.nodeType === 1) {
            const prevName = prevSibling.nodeName.toUpperCase();
            const isHeading = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(prevName);
            if (isHeading) {
              const now = Date.now();
              if (now - lastMergeTimeRef.current < 150) {
                e.preventDefault();
                return; // Guard against rapid repeats / race conditions
              }
              const checkRange = document.createRange();
              checkRange.setStart(block, 0);
              checkRange.setEnd(range.startContainer, range.startOffset);
              if (checkRange.toString() === '') {
                e.preventDefault();
                lastMergeTimeRef.current = now;
                mergeBlockIntoHeading(prevSibling, block);
                return;
              }
            }
          }
        }
      }

      // Case A0: Backspace on first paragraph when it is empty -> turn back to title
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        let block = range.startContainer;
        while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
          block = block.parentNode;
        }
        if (block && block.parentNode === editorRef.current && block === editorRef.current.firstChild) {
          const isEmpty = block.textContent.trim() === '' && !block.querySelector('img, iframe, pre');
          if (isEmpty && range.startOffset === 0) {
            if (titleRef.current) {
              e.preventDefault();
              if (editorRef.current.childNodes.length > 1) {
                block.remove();
              }
              titleRef.current.focus();
              const titleRange = document.createRange();
              const titleSel = window.getSelection();
              if (titleSel) {
                titleRange.selectNodeContents(titleRef.current);
                titleRange.collapse(false);
                titleSel.removeAllRanges();
                titleSel.addRange(titleRange);
              }
              triggerAutosave();
              return;
            }
          }
        }
      }

      // Case A: Backspace in empty caption -> delete image wrapper and storage file
      if (e.target && e.target.classList && e.target.classList.contains('image-caption')) {
        const text = e.target.textContent || '';
        if (text.trim() === '') {
          e.preventDefault();
          
          let block = e.target;
          while (block && block.parentNode !== editorRef.current) {
            block = block.parentNode;
          }
          
          if (block) {
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            
            // Insert the new paragraph right before the block we are deleting
            editorRef.current.insertBefore(p, block);
            
            const imgEl = block.querySelector('img');
            if (imgEl) {
              const src = imgEl.src;
              await deleteStorageImageByUrl(src);
            }
            
            block.remove();
            
            // Focus the new paragraph
            p.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(p, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            
            triggerAutosave();
          }
          return;
        }
      }

      // Case B: Backspace at the start of a paragraph following an image -> focus caption & delete paragraph
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0) {
          let block = range.startContainer;
          while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
            block = block.parentNode;
          }
          if (block && block.parentNode === editorRef.current) {
            const prevSibling = block.previousSibling;
            if (prevSibling && prevSibling.nodeType === 1) {
              const img = prevSibling.querySelector('img');
              if (img) {
                e.preventDefault();
                
                let caption = prevSibling.querySelector('.image-caption');
                if (!caption) {
                  caption = document.createElement('span');
                  caption.className = 'image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full';
                  caption.contentEditable = 'true';
                  caption.setAttribute('placeholder', 'Type caption for image (optional)');
                  caption.oninput = triggerAutosave;
                  prevSibling.appendChild(caption);
                }
                
                caption.focus();
                const newRange = document.createRange();
                newRange.selectNodeContents(caption);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
                
                block.remove();
                triggerAutosave();
              }
            }
          }
        }
      }
    }
  };

  const handleEditorFocus = () => {
    setTimeout(handleSelectionChange, 10);
  };

  const handleEditorPaste = (e) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData('text/html');
    const textData = e.clipboardData.getData('text/plain');
    
    pushHistory(true);
    
    if (htmlData) {
      const cleanHtml = sanitizePasteHtml(htmlData);
      document.execCommand('insertHTML', false, cleanHtml);
    } else if (textData) {
      if (textData.includes('\n')) {
        const paragraphsHtml = textData
          .split(/\r?\n/)
          .map(line => line.trim() ? `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '<p><br></p>')
          .join('');
        document.execCommand('insertHTML', false, paragraphsHtml);
      } else {
        const textNode = document.createTextNode(textData);
        const selection = window.getSelection();
        if (selection && selection.rangeCount) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    
    mergeAdjacentLists(editorRef.current);
    triggerAutosave();
  };

  const handleEditorBlur = (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('image-caption')) {
      if (e.target.textContent.trim() === '') {
        e.target.innerHTML = '';
      }
    }
    
    // Auto-dismiss gutter button on editor blur, after a small delay
    setTimeout(() => {
      if (editorRef.current && !editorRef.current.contains(document.activeElement)) {
        if (!document.activeElement?.closest('.block-inserter')) {
          setShowGutterButton(false);
        }
      }
    }, 100);
  };

  const handleContextMenu = (e) => {
    const img = e.target.closest('img');
    if (img && editorRef.current?.contains(img)) {
      e.preventDefault();
      setCodeBlockContextMenu(null);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetImg: img
      });
      return;
    }
    const pre = e.target.closest('pre');
    if (pre && editorRef.current?.contains(pre)) {
      e.preventDefault();
      setContextMenu(null);
      setCodeBlockContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetPre: pre
      });
    }
  };

  const handleTouchStart = (e) => {
    const img = e.target.closest('img');
    if (img && editorRef.current?.contains(img)) {
      touchTimeoutRef.current = setTimeout(() => {
        const touch = e.touches[0];
        setCodeBlockContextMenu(null);
        setContextMenu({
          x: touch.clientX,
          y: touch.clientY,
          targetImg: img
        });
      }, 500);
      return;
    }
    const pre = e.target.closest('pre');
    if (pre && editorRef.current?.contains(pre)) {
      touchTimeoutRef.current = setTimeout(() => {
        const touch = e.touches[0];
        setContextMenu(null);
        setCodeBlockContextMenu({
          x: touch.clientX,
          y: touch.clientY,
          targetPre: pre
        });
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  };

  const moveImageUp = () => {
    if (!contextMenu) return;
    let block = contextMenu.targetImg;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block && block.previousSibling) {
      editorRef.current.insertBefore(block, block.previousSibling);
      triggerAutosave();
    }
    setContextMenu(null);
  };

  const moveImageDown = () => {
    if (!contextMenu) return;
    let block = contextMenu.targetImg;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block && block.nextSibling) {
      editorRef.current.insertBefore(block.nextSibling, block);
      triggerAutosave();
    }
    setContextMenu(null);
  };

  const addParagraphBefore = () => {
    if (!contextMenu) return;
    let block = contextMenu.targetImg;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      editorRef.current.insertBefore(p, block);
      triggerAutosave();
    }
    setContextMenu(null);
  };

  const addParagraphAfter = () => {
    if (!contextMenu) return;
    let block = contextMenu.targetImg;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (block.nextSibling) {
        editorRef.current.insertBefore(p, block.nextSibling);
      } else {
        editorRef.current.appendChild(p);
      }
      triggerAutosave();
    }
    setContextMenu(null);
  };

  const addCaption = () => {
    if (!contextMenu) return;
    let block = contextMenu.targetImg;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      let caption = block.querySelector('.image-caption');
      if (caption) {
        caption.focus();
      } else {
        const span = document.createElement('span');
        span.className = 'image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full';
        span.contentEditable = 'true';
        span.setAttribute('placeholder', 'Type caption for image (optional)');
        span.oninput = triggerAutosave;
        block.appendChild(span);
        span.focus();
      }
      triggerAutosave();
    }
    setContextMenu(null);
  };

  const deleteImage = () => {
    if (!contextMenu) return;
    const imgEl = contextMenu.targetImg;
    if (imgEl) {
      const src = imgEl.src;
      if (src && src.includes('/storage/v1/object/public/images/')) {
        const parts = src.split('/storage/v1/object/public/images/');
        if (parts.length > 1) {
          const fileName = decodeURIComponent(parts[1].split('?')[0]);
          if (fileName) {
            supabase.storage.from('images').remove([fileName])
              .then(({ error }) => {
                if (error) {
                  console.error('Failed to delete image from storage:', error.message);
                } else {
                  console.log('Successfully deleted image from storage:', fileName);
                }
              })
              .catch(err => console.error('Error during storage delete:', err));
          }
        }
      }
    }

    let block = contextMenu.targetImg;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      block.remove();
      triggerAutosave();
    }
    setContextMenu(null);
  };

  // Code Block context menu actions
  const moveCodeBlockUp = () => {
    if (!codeBlockContextMenu) return;
    const pre = codeBlockContextMenu.targetPre;
    let block = pre;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block && block.previousSibling) {
      editorRef.current.insertBefore(block, block.previousSibling);
      triggerAutosave();
    }
    setCodeBlockContextMenu(null);
  };

  const moveCodeBlockDown = () => {
    if (!codeBlockContextMenu) return;
    const pre = codeBlockContextMenu.targetPre;
    let block = pre;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block && block.nextSibling) {
      editorRef.current.insertBefore(block.nextSibling, block);
      triggerAutosave();
    }
    setCodeBlockContextMenu(null);
  };

  const deleteCodeBlock = () => {
    if (!codeBlockContextMenu) return;
    const pre = codeBlockContextMenu.targetPre;
    let block = pre;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      pushHistory(true);
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      editorRef.current.insertBefore(p, block);
      block.remove();
      p.focus();
      triggerAutosave();
    }
    setCodeBlockContextMenu(null);
  };

  const addCodeBlockParagraphBefore = () => {
    if (!codeBlockContextMenu) return;
    const pre = codeBlockContextMenu.targetPre;
    let block = pre;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      pushHistory(true);
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      editorRef.current.insertBefore(p, block);
      p.focus();
      triggerAutosave();
    }
    setCodeBlockContextMenu(null);
  };

  const addCodeBlockParagraphAfter = () => {
    if (!codeBlockContextMenu) return;
    const pre = codeBlockContextMenu.targetPre;
    let block = pre;
    while (block && block.parentNode !== editorRef.current) {
      block = block.parentNode;
    }
    if (block) {
      pushHistory(true);
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (block.nextSibling) {
        editorRef.current.insertBefore(p, block.nextSibling);
      } else {
        editorRef.current.appendChild(p);
      }
      p.focus();
      triggerAutosave();
    }
    setCodeBlockContextMenu(null);
  };

  const getCaretCharacterOffsetWithin = (element) => {
    let caretOffset = 0;
    const doc = element.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  };

  const splitCodeBlockAtCursor = () => {
    if (!codeBlockContextMenu) return;
    const pre = codeBlockContextMenu.targetPre;
    
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !pre.contains(sel.anchorNode)) {
      alert("Please place your text cursor inside the code block at the position you want to split.");
      setCodeBlockContextMenu(null);
      return;
    }

    pushHistory(true);

    const codeEl = pre.querySelector('.pre--content') || pre;
    const caretOffset = getCaretCharacterOffsetWithin(codeEl);
    const text = codeEl.textContent || '';
    
    const beforeText = text.substring(0, caretOffset);
    const afterText = text.substring(caretOffset);
    
    let wrapper = pre;
    while (wrapper && !wrapper.classList.contains('code-block-wrapper')) {
      wrapper = wrapper.parentNode;
    }
    
    if (wrapper) {
      const parent = wrapper.parentNode;
      const currentLang = wrapper.querySelector('.selected-lang')?.textContent || 'txt';
      
      // Update first code block
      let codeEl = pre.querySelector('.pre--content');
      if (!codeEl) {
        codeEl = document.createElement('span');
        codeEl.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
        pre.appendChild(codeEl);
      }
      codeEl.textContent = beforeText || '\n';
      codeEl.innerHTML = highlightSyntax(codeEl.textContent, currentLang);
      
      // Insert paragraph
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      
      // Create second code block pre
      const secondPre = document.createElement('pre');
      secondPre.className = 'code-block-wrapper relative group my-6 border border-neutral-900 bg-[#050505] rounded-2xl p-4 flex flex-col gap-3';
      secondPre.setAttribute('data-language', currentLang);
      secondPre.setAttribute('spellcheck', 'false');
      
      const header = document.createElement('div');
      header.className = 'code-block-header flex items-center justify-between';
      header.setAttribute('contenteditable', 'false');
      
      const dropdown = createEditorDropdown(currentLang);
      header.appendChild(dropdown);
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn border border-neutral-800 rounded-lg px-2 py-1 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-sans';
      copyBtn.setAttribute('type', 'button');
      copyBtn.innerHTML = `
        <svg class="w-3 h-3 transform -scale-x-100" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        <span>Copy</span>
      `;
      header.appendChild(copyBtn);
      
      const secondSpan = document.createElement('span');
      secondSpan.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
      secondSpan.textContent = afterText || '\n';
      
      secondPre.appendChild(header);
      secondPre.appendChild(secondSpan);
      
      parent.insertBefore(p, wrapper.nextSibling);
      parent.insertBefore(secondPre, p.nextSibling);
      
      secondSpan.innerHTML = highlightSyntax(secondSpan.textContent, currentLang);
      
      p.focus();
      const splitRange = document.createRange();
      const splitSel = window.getSelection();
      if (splitSel) {
        splitRange.setStart(p, 0);
        splitRange.collapse(true);
        splitSel.removeAllRanges();
        splitSel.addRange(splitRange);
      }
      triggerAutosave();
    }
    
    setCodeBlockContextMenu(null);
  };

  // Get current cover image from canvas HTML
  const getCoverImage = () => {
    const contentHtml = editorRef.current?.innerHTML || '';
    const imgMatch = contentHtml.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
  };

  const handlePublish = async () => {
    if (!title) {
      setErrorMsg('Please specify a title.');
      return;
    }

    setAuthLoading(true);
    setErrorMsg('');
    setPublishSuccess(false);

    // Auto generate clean slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // remove special chars except spaces
      .trim()
      .replace(/\s+/g, '---');

    const rawContentHtml = editorRef.current?.innerHTML || '';
    const contentHtml = cleanHtmlStyles(rawContentHtml);
    const coverImage = getCoverImage();

    try {
      const authorMeta = user ? {
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
        username: user.user_metadata?.username || user.email.split('@')[0],
        avatar: user.user_metadata?.avatar_url || '',
        email: user.email
      } : null;

      const finalTestimonialCompany = storyType === 'blog' && authorMeta
        ? JSON.stringify({ claps, claps_by_user: clapsByUser, author: authorMeta })
        : testimonialCompany;

      if (!user) {
        throw new Error('Not authenticated');
      }

      const publishData = {
        user_id: user.id,
        title,
        slug,
        subtitle,
        content: contentHtml,
        cover_image: coverImage,
        date,
        published: true, // Finalized publication status!
        type: storyType,
        location,
        industry,
        featured,
        testimonial_quote: testimonialQuote,
        testimonial_author: testimonialAuthor,
        testimonial_company: finalTestimonialCompany,
        category,
      };

      if (storyId) {
        const { error } = await supabase
          .from('stories')
          .update(publishData)
          .eq('id', storyId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stories')
          .insert([publishData]);
        if (error) throw error;
      }

      setPublishSuccess(true);
      setTimeout(() => {
        setShowPublishModal(false);
        setPublishSuccess(false);
        window.location.href = '/me/stories';
      }, 1200);

    } catch (err) {
      setErrorMsg(err.message || 'Failed to publish.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInsertTextFromMia = (text) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const p = document.createElement('p');
      p.className = 'text-[1.125rem] text-neutral-300 my-4';
      p.innerText = text;
      editorRef.current.appendChild(p);
      triggerAutosave();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Securing Session...</p>
      </div>
    );
  }

  // Not authenticated or access denied
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[440px] bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 border border-accent/30 text-accent font-mono text-2xl font-bold tracking-tight mb-4 shadow-[0_0_20px_rgba(224,255,111,0.15)]">
              W
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Publisher</h2>
            <p className="text-sm text-neutral-400 mt-1.5">Sign in to write portfolio and blogs</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono leading-relaxed text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white text-black hover:bg-neutral-100 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer"
            >
              Sign In with Google
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                className="text-xs text-neutral-500 hover:text-neutral-300 font-mono tracking-tight transition-all duration-200 cursor-pointer"
              >
                {showPasswordLogin ? 'Hide backup authentication' : 'Use backup credentials'}
              </button>
            </div>

            {showPasswordLogin && (
              <form onSubmit={handlePasswordLogin} className="mt-4 border-t border-neutral-800/80 pt-4 flex flex-col gap-3">
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@huddin.dev"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Password</label>
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
                  className="w-full mt-2 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  function handleGutterClick(e) {
    // If they clicked on buttons, inputs, links, dropdowns, etc., do not intercept
    if (
      e.target.closest('button') || 
      e.target.closest('input') || 
      e.target.closest('a') || 
      e.target.closest('.copy-code-btn') || 
      e.target.closest('.code-language-dropdown') ||
      e.target.closest('.modal') || 
      e.target.closest('[role="dialog"]') || 
      e.target.closest('.fixed') ||
      e.target.closest('h1') ||
      e.target === titleRef.current
    ) {
      return;
    }
    
    // Ignore clicks in the top header area
    const clickY = e.clientY;
    const clickX = e.clientX;
    if (e.target.closest('header') || e.target.closest('.editor-header') || clickY < 64) {
      return;
    }

    const clickedOnGutter = e.target === editorRef.current || !editorRef.current.contains(e.target);

    if (clickedOnGutter) {
      if (!editorRef.current || !editorRef.current.children || editorRef.current.children.length === 0) return;
      
      let closestChild = null;
      let minDistance = Infinity;
      let isBelowLastChild = false;
      
      const children = Array.from(editorRef.current.children);
      const validChildren = children.filter(child => 
        !child.classList.contains('u-ignoreBlock') && 
        !child.classList.contains('block-inserter') &&
        child.nodeName !== 'INPUT'
      );
      
      if (validChildren.length === 0) return;
      
      for (let i = 0; i < validChildren.length; i++) {
        const child = validChildren[i];
        const rect = child.getBoundingClientRect();
        const blockCenterY = rect.top + rect.height / 2;
        const dist = Math.abs(clickY - blockCenterY);
        
        if (dist < minDistance) {
          minDistance = dist;
          closestChild = child;
          isBelowLastChild = (i === validChildren.length - 1) && (clickY > rect.bottom);
        }
      }
      
      if (closestChild) {
        const rect = closestChild.getBoundingClientRect();
        const blockCenterX = rect.left + rect.width / 2;
        let isLeft = clickX < blockCenterX;
        if (isBelowLastChild) {
          isLeft = false;
        }
        
        let targetNode = closestChild;
        if (closestChild.nodeName === 'PRE') {
          const contentSpan = closestChild.querySelector('.pre--content');
          if (contentSpan) {
            targetNode = contentSpan;
          }
        }
        
        targetNode.focus();
        
        const selection = window.getSelection();
        const range = document.createRange();
        
        if (selection) {
          try {
            if (isLeft) {
              range.selectNodeContents(targetNode);
              range.collapse(true);
            } else {
              range.selectNodeContents(targetNode);
              range.collapse(false);
            }
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (_) {}
        }
        
        handleSelectionChange();
      }
    }
  };

  const coverImage = getCoverImage();

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans relative cursor-text">
      <EditorHeader
        saveStatus={saveStatus}
        title={title}
        subtitle={subtitle}
        editorRef={editorRef}
        setShowPublishModal={setShowPublishModal}
        setTitle={setTitle}
        setSubtitle={setSubtitle}
        setErrorMsg={setErrorMsg}
        user={user}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
      />


      {/* Main editor dashboard */}
      <div className="flex-1 w-full pt-[64px] pb-[80px] flex flex-col min-h-screen relative">
        {/* Centered wrapper for title and overlays */}
        <div ref={containerRef} className="max-w-[680px] w-full mx-auto px-6 md:px-12 relative flex flex-col">
          <FormatTooltip
            showTooltip={showTooltip}
            tooltipPos={tooltipPos}
            handleFormat={handleFormat}
            toggleBlock={toggleBlock}
            cycleAlignment={cycleAlignment}
            currentAlignment={currentAlignment}
            isH2Active={isH2Active}
            isH3Active={isH3Active}
          />

          <BlockInserter
            showGutterButton={showGutterButton}
            isLineEmpty={isLineEmpty}
            triggerImageUpload={triggerImageUpload}
            insertEmbed={insertEmbed}
            insertCodeBlock={insertCodeBlock}
          />

          {/* Hidden file input for image uploads */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={insertImage}
            className="hidden"
            accept="image/*"
          />

          {/* Title Input */}
          <h1
            ref={titleRef}
            contentEditable
            spellCheck={false}
            suppressContentEditableWarning
            onInput={(e) => {
              setTitle(e.target.innerText || '');
              triggerAutosave();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (editorRef.current) {
                  const firstChild = editorRef.current.firstChild;
                  const isFirstChildEmptyParagraph = firstChild && 
                    firstChild.nodeName === 'P' && 
                    firstChild.textContent.trim() === '' && 
                    !firstChild.querySelector('img, iframe, pre');
                  
                  let targetPara;
                  if (isFirstChildEmptyParagraph) {
                    targetPara = firstChild;
                  } else {
                    targetPara = document.createElement('p');
                    targetPara.innerHTML = '<br>';
                    editorRef.current.insertBefore(targetPara, firstChild);
                  }
                  
                  const range = document.createRange();
                  const sel = window.getSelection();
                  if (sel) {
                    range.setStart(targetPara, 0);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                  }
                  targetPara.focus();
                  triggerAutosave();
                }
              }
            }}
            placeholder="Title"
            className="w-full bg-transparent border-none outline-none text-[2.5rem] md:text-[3rem] font-bold text-white placeholder:text-neutral-800/80 mt-[3.5rem] mb-[1.2rem] leading-[1.2] tracking-tight h-auto select-text"
            style={{
              caretColor: 'var(--color-accent)'
            }}
          />
        </div>

        {/* Medium-style writing body */}
        <div
          ref={editorRef}
          contentEditable
          spellCheck={false}
          suppressContentEditableWarning
          placeholder="Tell your story..."
          onInput={handleEditorInput}
          onPaste={handleEditorPaste}
          onClick={handleEditorClick}
          onKeyDown={handleEditorKeyDown}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`max-w-[680px] w-full mx-auto px-6 md:px-12 bg-transparent text-left outline-none text-[1.25rem] leading-[1.65] text-neutral-300 placeholder:text-neutral-700 min-h-[400px] border-none select-text ${storyType === 'blog' ? 'blog-document-content' : 'project-document-content'}`}
          style={{
            caretColor: 'var(--color-accent)'
          }}
        />
      </div>

      <PublishModal
        showPublishModal={showPublishModal}
        setShowPublishModal={setShowPublishModal}
        title={title}
        setTitle={setTitle}
        subtitle={subtitle}
        setSubtitle={setSubtitle}
        coverImage={coverImage}
        errorMsg={errorMsg}
        publishSuccess={publishSuccess}
        storyType={storyType}
        setStoryType={setStoryType}
        featured={featured}
        setFeatured={setFeatured}
        categories={categories}
        categoryInput={categoryInput}
        setCategoryInput={setCategoryInput}
        addCategoryTag={addCategoryTag}
        removeCategoryTag={removeCategoryTag}
        locationIndustryInput={locationIndustryInput}
        handleLocationIndustryChange={handleLocationIndustryChange}
        testimonialQuote={testimonialQuote}
        setTestimonialQuote={setTestimonialQuote}
        testimonialAuthor={testimonialAuthor}
        setTestimonialAuthor={setTestimonialAuthor}
        testimonialCompany={testimonialCompany}
        setTestimonialCompany={setTestimonialCompany}
        handlePublish={handlePublish}
        authLoading={authLoading}
        titleTextareaRef={titleTextareaRef}
        subtitleTextareaRef={subtitleTextareaRef}
        isAdmin={user ? ALLOWED_EMAILS.includes(user.email) : false}
      />

      <MiaAssistant
        editorRef={editorRef}
        onInsertText={handleInsertTextFromMia}
      />

      <ImageContextMenu
        contextMenu={contextMenu}
        moveImageUp={moveImageUp}
        moveImageDown={moveImageDown}
        addParagraphBefore={addParagraphBefore}
        addParagraphAfter={addParagraphAfter}
        addCaption={addCaption}
        deleteImage={deleteImage}
      />

      <CodeBlockContextMenu
        contextMenu={codeBlockContextMenu}
        moveCodeBlockUp={moveCodeBlockUp}
        moveCodeBlockDown={moveCodeBlockDown}
        addCodeBlockParagraphBefore={addCodeBlockParagraphBefore}
        addCodeBlockParagraphAfter={addCodeBlockParagraphAfter}
        splitCodeBlockAtCursor={splitCodeBlockAtCursor}
        deleteCodeBlock={deleteCodeBlock}
      />

      <ConnectionErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={title}
        subtitle={subtitle}
        editorRef={editorRef}
        onRetrySave={performAutosave}
        saveStatus={saveStatus}
      />

      {!isLoaded && (
        <div className="fixed inset-0 bg-[#08080a]/70 backdrop-blur-md z-[2000] flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Loading Story Content...</p>
        </div>
      )}

      {/* Editor styles */}
      <style jsx global>{`
        [contenteditable] > * {
          scroll-margin-top: 100px;
        }
        [contenteditable] > *:first-child {
          margin-top: 0 !important;
        }
        [contenteditable] h2, [contenteditable] h3 {
          font-weight: 500 !important;
        }
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #26262b;
          pointer-events: none;
          display: block;
        }

        /* Make image figures bleed into container padding to align with outer column bounds */
        .blog-document-content > figure,
        .project-document-content > figure {
          margin-left: -24px !important;
          margin-right: -24px !important;
          width: calc(100% + 48px) !important;
          max-width: none !important;
          box-sizing: border-box !important;
        }
        @media (min-width: 768px) {
          .blog-document-content > figure,
          .project-document-content > figure {
            margin-left: -48px !important;
            margin-right: -48px !important;
            width: calc(100% + 96px) !important;
          }
        }

        /* Set code block padding to 32px on all sides and prevent overflow */
        .code-block-wrapper {
          padding: 32px !important;
          gap: 0 !important;
          box-sizing: border-box !important;
          position: relative !important;
          border-radius: 16px !important; /* Match rounded-2xl */
          overflow: visible !important;
          width: 100% !important;
        }
        .code-block-wrapper .code-block-header {
          position: absolute;
          top: 10px;
          left: 32px;
          right: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-in-out;
        }
        .code-block-wrapper:hover .code-block-header,
        .code-block-wrapper:focus-within .code-block-header {
          opacity: 1;
          pointer-events: auto;
        }

        .code-block-wrapper .pre--content {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: auto !important;
          white-space: pre !important;
          word-break: normal !important;
          display: block !important;
          width: 100% !important;
        }

        .image-wrapper .image-caption {
          opacity: 0;
          height: 0;
          overflow: hidden;
          margin-top: 0;
          pointer-events: none;
        }
        .image-wrapper:focus-within .image-caption,
        .image-caption:focus,
        .image-caption:not(:empty) {
          opacity: 1;
          height: auto;
          overflow: visible;
          margin-top: 10px;
          pointer-events: auto;
        }
        .image-caption[placeholder]:empty:before {
          content: attr(placeholder);
          color: #52525b;
          pointer-events: none;
          display: block;
        }
        .image-wrapper img {
          cursor: pointer;
        }
        .image-wrapper:focus-within img {
          border-color: #e0ff6f !important;
          box-shadow: 0 0 0 1px #e0ff6f;
        }

        /* Star bullet alignment: when a ul li is centered/right-aligned,
           pull the ::before bullet out of absolute positioning so it flows
           inline alongside the text. These rules live here (after globals.css)
           so they win the cascade over the base absolute-positioned definitions. */
        .blog-document-content ul li[style*="text-align"]::before,
        .project-document-content ul li[style*="text-align"]::before {
          position: static !important;
          left: unset !important;
          top: unset !important;
          display: inline-block !important;
          margin-right: 8px !important;
        }
        .blog-document-content ul li[style*="text-align"],
        .project-document-content ul li[style*="text-align"] {
          padding-left: 0 !important;
        }
      `}</style>
    </div>
  );
}
