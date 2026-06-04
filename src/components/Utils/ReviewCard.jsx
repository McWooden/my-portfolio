import React from 'react';

// Predefined fallback avatar URLs using code asset images
const AVATARS = {
  "Riley James": "https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024",
  "Marta L.": "https://framerusercontent.com/images/qMrMTWyggoctZktmN3xk9LziWM.png?width=1024&height=1024",
  "Tomas E.": "https://framerusercontent.com/images/v4L6r5bO1P0gFP6z0HYvFxRmcYw.png?scale-down-to=512&width=1024&height=1024",
  "Sofia R.": "https://framerusercontent.com/images/LVcACvWfr9MemEEBhRIZ9Mj0A.png?width=1024&height=1024",
  "Daniel M.": "https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024"
};

export default function ReviewCard({ review, className = "" }) {
  const avatarUrl = AVATARS[review.author] || "https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024";
  const displayRating = review.rating.includes('.') ? `${review.rating}/5` : `${review.rating}.0/5`;

  return (
    <div
      className={`bg-[#262626] rounded-[30px] p-6 sm:p-[50px] flex flex-col justify-between text-left w-full h-auto min-h-[360px] sm:w-[360px] sm:h-[360px] flex-shrink-0 ${className}`}
    >
      {/* Top Content Area: Grouped with 36px gap between rating, quote text, and author */}
      <div className="flex flex-col gap-[36px]">
        {/* Star Rating Line */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[16px] font-medium text-white">
            {displayRating}
          </span>
          <div className="flex gap-[1px] text-[#E0FF6F]">
            {[...Array(5)].map((_, idx) => (
              <svg key={idx} viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Testimonial Quote */}
        <p className="text-[16px] font-normal text-[#F2F2F2] leading-[1.4] font-sans">
          "{review.text}"
        </p>
      </div>

      {/* Author Information (Bottom Section) */}
      <div className="flex flex-row items-center gap-[16px]">
        <img
          src={avatarUrl}
          alt={review.author}
          className="w-10 h-10 rounded-full object-cover border border-white/10"
        />
        <div className="flex flex-col">
          <span className="text-[18px] font-medium text-[#F2F2F2] font-sans">
            {review.author}
          </span>
          <span className="font-mono text-[16px] text-[#E0FF6F] uppercase tracking-wider">
            {review.company}
          </span>
        </div>
      </div>
    </div>
  );
}
