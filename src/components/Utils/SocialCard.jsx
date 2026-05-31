import React from 'react';
import { FiTwitter, FiInstagram, FiAtSign } from 'react-icons/fi';
import { BsMedium } from 'react-icons/bs';

const renderIcon = (label) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('twitter') || normalized.includes('x')) {
    return <FiTwitter className="w-5 h-5" strokeWidth={2} />;
  }
  if (normalized.includes('instagram')) {
    return <FiInstagram className="w-5 h-5" strokeWidth={2} />;
  }
  if (normalized.includes('medium')) {
    return <BsMedium className="w-5 h-5" />;
  }
  if (normalized.includes('email') || normalized.includes('mail')) {
    return <FiAtSign className="w-5 h-5" strokeWidth={2} />;
  }
};

export default function SocialCard({ label, value, href, isEmail = false }) {
  const cardClasses = "bg-[#262626] rounded-[24px] p-8 flex flex-col gap-6 w-full text-left";

  const content = (
    <>
      {/* squircle icon badge */}
      <div className="w-10 h-10 bg-[#E0FF6F] text-[#1A1A1A] rounded-[12px] flex items-center justify-center">
        {renderIcon(label)}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-white font-sans font-medium text-[1.15rem]">
          {label}
        </span>
        {/* Hidden on mobile to make layout simple and compact */}
        <span className="text-[0.85rem] text-[#E0FF6F] tracking-wider hidden sm:block">
          {value}
        </span>
      </div>
    </>
  );

  if (isEmail) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      {content}
    </a>
  );
}
