'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Stop loading when pathname or searchParams change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400); // Let the 100% slide complete
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, loading]);

  // Listen to custom start events & global click interceptor
  useEffect(() => {
    let interval;

    const startLoading = () => {
      setLoading(true);
      setProgress(10);

      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          // Incrementally slow down
          const diff = (95 - prev) * 0.15;
          return prev + diff;
        });
      }, 150);
    };

    const handleStart = () => {
      startLoading();
    };

    window.addEventListener('page-loading-start', handleStart);

    // Global click listener to catch Next.js Link transitions
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Skip hash links, external links, mailto/tel, or new tab links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's a same-origin navigation that changes the pathname
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          const currentPath = window.location.pathname;
          const targetPath = url.pathname;

          if (currentPath !== targetPath) {
            startLoading();
          }
        }
      } catch (err) {
        // Fallback for relative or invalid URL formats
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('page-loading-start', handleStart);
      document.removeEventListener('click', handleGlobalClick);
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none bg-neutral-900/10">
      <div
        className="h-full bg-accent transition-all duration-300 ease-out shadow-[0_0_10px_rgba(224,255,111,0.5)]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
