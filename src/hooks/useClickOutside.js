import { useEffect } from 'react';

/**
 * Hook to detect clicks outside of a ref'd element.
 * Replaces the repeated click-outside pattern in Hero, Header, and Chatbot.
 *
 * @param {React.RefObject} ref - The ref to the element to watch
 * @param {Function} handler - Called when a click occurs outside the element
 * @param {boolean} [active=true] - Only listen when active is true
 */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return;

    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, active]);
}
