"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop component
 * Automatically scrolls the window to the top smoothly whenever the route pathname changes.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
}
