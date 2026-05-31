import React from 'react';

/**
 * Reusable Section Wrapper
 * Standardizes padding, max-width, horizontal margins, alignment, and bottom borders across all sections.
 */
export default function Section({ id, children, extraClass = '', borderBottom = false }) {
  const borderClass = borderBottom ? "border-b border-border" : "";
  return (
    <section id={id} className={`w-full ${borderClass} ${extraClass}`}>
      <div className="w-full max-w-[1600px] mx-auto px-5 xl:px-10 py-[100px] max-[810px]:py-[60px] flex flex-col items-center">
        {children}
      </div>
    </section>
  );
}
