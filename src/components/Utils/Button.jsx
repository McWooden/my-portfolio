import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button Component
 * Supports standard internal links, external links, and general click handlers.
 */
export default function Button({
  children,
  to,
  href,
  variant = 'primary', // 'primary' | 'secondary' | 'email-pill'
  className = '',
  noTranslate = false,
  ...props
}) {
  const baseStyle = `font-sans transition-all duration-200 ${noTranslate ? '' : 'hover:-translate-y-0.5'} select-none text-center flex items-center justify-center whitespace-nowrap`;
  
  const variants = {
    primary: "bg-accent text-bg-dark text-[1.05rem] font-semibold px-7 py-[14px] rounded-full hover:bg-white",
    secondary: "border border-border text-text-primary text-[1.05rem] font-medium px-7 py-[14px] rounded-full hover:border-text-primary hover:bg-bg-card",
    'email-pill': `flex items-center gap-3 bg-bg-dark border border-accent px-4 py-2 rounded-full text-[0.95rem] font-medium text-text-primary hover:border-text-primary hover:bg-bg-card ${noTranslate ? '' : 'hover:-translate-y-px'} shrink-0`,
  };

  const finalClass = `${baseStyle} ${variants[variant] || variants.primary} ${className}`;

  if (to) {
    return (
      <Link to={to} className={finalClass} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={finalClass} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
}
