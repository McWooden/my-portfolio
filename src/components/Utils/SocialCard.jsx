import { FiAtSign } from 'react-icons/fi';
import { SiMedium, SiGithub, SiTiktok, SiX } from 'react-icons/si';
import { FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const renderIcon = (label) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('twitter') || normalized.includes('x')) {
    return <SiX className="w-5 h-5" />;
  }
  if (normalized.includes('instagram')) {
    return <FaInstagram className="w-5 h-5" />;
  }
  if (normalized.includes('medium')) {
    return <SiMedium className="w-5 h-5" />;
  }
  if (normalized.includes('github')) {
    return <SiGithub className="w-5 h-5" />;
  }
  if (normalized.includes('linkedin')) {
    return <FaLinkedinIn className="w-5 h-5" />;
  }
  if (normalized.includes('tiktok')) {
    return <SiTiktok className="w-5 h-5" />;
  }
  if (normalized.includes('email') || normalized.includes('mail')) {
    return <FiAtSign className="w-5 h-5" strokeWidth={2} />;
  }
};

export default function SocialCard({ label, value, href, isEmail = false, isTextCard = false }) {
  if (isTextCard) {
    return (
      <div className="bg-[#262626] rounded-[24px] p-8 flex flex-col items-center justify-center text-center w-full min-h-[160px] select-none font-sans">
        <div className="flex flex-col items-center relative mt-1">
          <span 
            className="text-[2.2rem] leading-[1.1] text-white font-normal select-none"
            style={{ fontFamily: "'Sedgwick Ave', cursive" }}
          >
            Halo
          </span>
          <span 
            className="text-[2.2rem] leading-[1.1] text-white font-normal select-none mt-0.5"
            style={{ fontFamily: "'Sedgwick Ave', cursive" }}
          >
            Huddin
          </span>
          {/* bent underline */}
          <div className="w-[110%] h-3 mt-1.5 text-accent relative">
            <svg className="w-full h-full text-accent fill-none stroke-current" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M2,3 Q50,9 98,2" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

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
