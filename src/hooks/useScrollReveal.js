import { useEffect, useRef, useState } from 'react';

/**
 * Custom Hook for Scroll Reveal Animations
 * Uses IntersectionObserver to trigger entry animation when element scrolls into view.
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isRevealed];
}
