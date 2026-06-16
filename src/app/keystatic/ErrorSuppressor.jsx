"use client";

import { useEffect } from "react";

export default function KeystaticErrorSuppressor({ children }) {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('An empty string ("") was passed to the href attribute')) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
}
