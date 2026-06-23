'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';

// Modular utilities
import { convertToWebP, wrapImagesInContentEditableFalse } from './utils/editorHelpers';

// Subcomponents
import EditorHeader from './components/EditorHeader';
import FormatTooltip from './components/FormatTooltip';
import BlockInserter from './components/BlockInserter';
import ImageContextMenu from './components/ImageContextMenu';
import PublishModal from './components/PublishModal';

const ALLOWED_EMAILS = ['huddin8876@gmail.com', 'halohuddin@gmail.com'];

export default function Editor({ type }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Modal control
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Autosave and Loading State
  const [storyId, setStoryId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saving...' | 'Saved' | 'Error saving'
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
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleTextareaRef = useRef(null);
  const subtitleTextareaRef = useRef(null);
  
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

  // Global listener to close context menu on click
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }
  }, [contextMenu]);

  const handleSelectionChange = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();

    // Clean up empty image captions if they are not active
    if (editorRef.current) {
      const captions = editorRef.current.querySelectorAll('.image-caption');
      captions.forEach((caption) => {
        if (caption.textContent.trim() === '' && document.activeElement !== caption) {
          caption.remove();
          triggerAutosave();
        }
      });
    }

    // 1. Handle Selection Tooltip (Bold/Italic/Link)
    if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
      try {
        const range = selection.getRangeAt(0);
        setSavedSelectionRange(range.cloneRange());
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        // Calculate tooltip position (centered above selection, relative to parent container)
        const selectionCenterViewportX = rect.left + (rect.width / 2);
        
        // Clamp selection center relative to the viewport width (assuming tooltip width of ~230px, half is 115px, with 16px safety padding)
        const tooltipHalfWidth = 115;
        const screenPadding = 16;
        const minX = screenPadding + tooltipHalfWidth;
        const maxX = window.innerWidth - screenPadding - tooltipHalfWidth;
        const clampedCenterViewportX = Math.max(minX, Math.min(maxX, selectionCenterViewportX));
        
        const left = clampedCenterViewportX - editorRect.left;
        const top = rect.top - editorRect.top + editorRef.current.offsetTop - 55;
        
        setTooltipPos({ top, left });
        setShowTooltip(true);
      } catch (err) {
        setShowTooltip(false);
      }
    } else {
      setShowTooltip(false);
    }

    // 2. Handle Gutter Toolbar (Image / H2 / H3 toggler)
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      try {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        
        // Traverse up to find the block element directly inside editorRef
        while (node && node !== editorRef.current && node.parentNode !== editorRef.current) {
          node = node.parentNode;
        }
        
        if (node && node.parentNode === editorRef.current) {
          const text = node.textContent || '';
          const tagName = node.nodeName.toUpperCase();
          
          setIsH2Active(tagName === 'H2');
          setIsH3Active(tagName === 'H3');
          setIsLineEmpty(text.trim() === '');

          const align = node.style.textAlign || 'left';
          setCurrentAlignment(align);
          
          // Calculate vertical position next to the active block
          const rect = node.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          const top = rect.top - editorRect.top + editorRef.current.offsetTop + (rect.height / 2) - 16;
          
          setGutterButtonPos({ top, left: -44 });
          setShowGutterButton(true);
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
    
    const onSelection = () => {
      handleSelectionChange();
    };

    document.addEventListener('selectionchange', onSelection);
    return () => {
      document.removeEventListener('selectionchange', onSelection);
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
        const currentUser = session.user;
        if (ALLOWED_EMAILS.includes(currentUser.email)) {
          setUser(currentUser);
        } else {
          setErrorMsg(`Access Denied: ${currentUser.email} is not authorized.`);
          supabase.auth.signOut();
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const currentUser = session.user;
        if (ALLOWED_EMAILS.includes(currentUser.email)) {
          setUser(currentUser);
          setErrorMsg('');
        } else {
          setErrorMsg(`Access Denied: ${currentUser.email} is not authorized.`);
          setUser(null);
          supabase.auth.signOut();
        }
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
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    if (id) {
      setStoryId(id);
      const loadStory = async () => {
        const { data, error } = await supabase.from('stories').select('*').eq('id', id).single();
        if (!error && data) {
          setTitle(data.title || '');
          if (titleRef.current) {
            titleRef.current.innerText = data.title || '';
          }
          setSubtitle(data.subtitle || '');
          setDate(data.date || new Date().toISOString().split('T')[0]);
          setStoryType(data.type || type || 'blog');
          if (editorRef.current) {
            editorRef.current.innerHTML = wrapImagesInContentEditableFalse(data.content || '');
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
        }
        setIsLoaded(true);
      };
      loadStory();
    } else {
      setIsLoaded(true);
    }
  }, [type]);

  // Autosave triggers
  const triggerAutosave = () => {
    setSaveStatus('Saving...');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await performAutosave();
    }, 1500);
  };

  const performAutosave = async () => {
    const currentTitle = title.trim() || 'Untitled Draft';
    const contentHtml = editorRef.current?.innerHTML || '';
    const coverImage = getCoverImage();

    // Auto generate slug
    const currentSlug = currentTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '---');

    try {
      if (!storyId) {
        // Insert new draft row
        const insertData = {
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
          testimonial_company: testimonialCompany,
          category,
        };

        const { data, error } = await supabase
          .from('stories')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
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
          testimonial_company: testimonialCompany,
          category,
        };

        const { error } = await supabase
          .from('stories')
          .update(updateData)
          .eq('id', storyId);

        if (error) throw error;
      }
      setSaveStatus('Saved');
    } catch (err) {
      console.error('Autosave error:', err);
      setSaveStatus('Error saving');
    }
  };

  useEffect(() => {
    if (!isLoaded || loading || !user) return;
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

    // Save selection range before we lose focus to file selection dialog
    let savedRange = null;
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && sel.rangeCount > 0) {
      savedRange = sel.getRangeAt(0).cloneRange();
    }

    setSaveStatus('Saving...');
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

      const imgHtml = `<div contenteditable="false" class="w-full my-6 select-none flex flex-col items-center"><img src="${imgUrl}" alt="Uploaded Image" class="rounded-[20px] border border-border w-full" /></div>`;

      // Restore Selection and insert the image
      if (editorRef.current) {
        editorRef.current.focus();
        if (savedRange && sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
          document.execCommand('insertHTML', false, imgHtml);
        } else {
          // If there was no active range, append to editor content
          editorRef.current.innerHTML += imgHtml;
        }
      }

      setSaveStatus('Saved');
      triggerAutosave();
    } catch (err) {
      console.error('Error processing/uploading image:', err);
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

  const cycleAlignment = () => {
    let nextAlign = 'left';
    if (currentAlignment === 'left') {
      nextAlign = 'center';
    } else if (currentAlignment === 'center') {
      nextAlign = 'right';
    }

    if (nextAlign === 'center') {
      handleFormat('justifyCenter');
    } else if (nextAlign === 'right') {
      handleFormat('justifyRight');
    } else {
      handleFormat('justifyLeft');
    }

    setCurrentAlignment(nextAlign);
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

  const insertCodeBlock = () => {
    const codeHtml = `<pre class="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl font-mono text-sm my-6 overflow-x-auto text-left" contenteditable="true"><code class="text-neutral-300">// Write your code here...</code></pre><p><br></p>`;
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (savedSelectionRange && selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRange);
        document.execCommand('insertHTML', false, codeHtml);
      } else {
        editorRef.current.innerHTML += codeHtml;
      }
      triggerAutosave();
    }
  };

  const handleEditorClick = (e) => {
    const img = e.target.closest('img');
    if (img && editorRef.current?.contains(img)) {
      e.stopPropagation();
      let block = img;
      while (block && block.parentNode !== editorRef.current) {
        block = block.parentNode;
      }
      if (block) {
        let caption = block.querySelector('.image-caption');
        if (caption) {
          caption.focus();
          caption.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const span = document.createElement('span');
          span.className = 'image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full';
          span.contentEditable = 'true';
          span.setAttribute('placeholder', 'Type caption for image (optional)');
          span.oninput = triggerAutosave;
          
          block.appendChild(span);
          span.focus();
          setTimeout(() => {
            span.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
          triggerAutosave();
        }
      }
    }
  };

  const handleEditorKeyDown = (e) => {
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
    }
  };

  const handleEditorBlur = (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('image-caption')) {
      if (e.target.textContent.trim() === '') {
        e.target.remove();
        triggerAutosave();
      }
    }
  };

  const handleContextMenu = (e) => {
    const img = e.target.closest('img');
    if (img && editorRef.current?.contains(img)) {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetImg: img
      });
    }
  };

  const handleTouchStart = (e) => {
    const img = e.target.closest('img');
    if (img && editorRef.current?.contains(img)) {
      touchTimeoutRef.current = setTimeout(() => {
        const touch = e.touches[0];
        setContextMenu({
          x: touch.clientX,
          y: touch.clientY,
          targetImg: img
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

    const contentHtml = editorRef.current?.innerHTML || '';
    const coverImage = getCoverImage();

    try {
      const publishData = {
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
        testimonial_company: testimonialCompany,
        category,
      };

      if (storyId) {
        const { error } = await supabase
          .from('stories')
          .update(publishData)
          .eq('id', storyId);
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

  const coverImage = getCoverImage();

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans relative">
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
      <div className="flex-1 max-w-[680px] w-full mx-auto px-6 md:px-12 pt-[64px] pb-[80px] flex flex-col min-h-screen relative">
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
          suppressContentEditableWarning
          onInput={(e) => {
            setTitle(e.target.innerText || '');
            triggerAutosave();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              editorRef.current?.focus();
            }
          }}
          placeholder="Title"
          className="w-full bg-transparent border-none outline-none text-[2.5rem] md:text-[3rem] font-bold text-white placeholder:text-neutral-800/80 mt-[3.5rem] mb-[1.2rem] leading-[1.2] tracking-tight h-auto select-text"
          style={{
            caretColor: 'var(--color-accent)'
          }}
        />

        {/* Medium-style writing body */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          placeholder="Tell your story..."
          onInput={triggerAutosave}
          onClick={handleEditorClick}
          onKeyDown={handleEditorKeyDown}
          onBlur={handleEditorBlur}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 bg-transparent text-left outline-none text-[1.25rem] leading-[1.65] text-neutral-300 placeholder:text-neutral-700 min-h-[400px] border-none select-text"
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

      {/* Editor styles */}
      <style jsx global>{`
        [contenteditable] > * {
          scroll-margin-top: 100px;
        }
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #26262b;
          pointer-events: none;
          display: block;
        }
        [contenteditable] h1 {
          font-size: clamp(2.5rem, 5vw, 3rem);
          font-weight: 700;
          color: #ffffff;
          margin-top: 3.5rem;
          margin-bottom: 1.2rem;
          line-height: 1.2;
        }
        [contenteditable] h2 {
          font-size: clamp(1.8rem, 4vw, 2.1rem);
          font-weight: 600;
          color: #ffffff;
          margin-top: 3.1rem;
          margin-bottom: 0;
          line-height: 1.25;
        }
        [contenteditable] h3 {
          font-size: 1.5rem;
          font-weight: 500;
          color: #ffffff;
          margin-top: 2.5rem;
          margin-bottom: 0;
          line-height: 1.33;
        }
        [contenteditable] p {
          font-size: 1.125rem;
          color: #d4d4d8;
          margin-top: 0;
          margin-bottom: 0;
          line-height: 1.55;
        }
      `}</style>
    </div>
  );
}
