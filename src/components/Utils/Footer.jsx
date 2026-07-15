"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationMenu } from '../../data/siteData';

export default function Footer() {
  const pathname = usePathname();
  const path = pathname;

  let topBtnText = 'BACK TO TOP';
  let topBtnLink = '#';

  if (path.startsWith('/portfolio/')) {
    topBtnText = 'BACK TO CASES';
    topBtnLink = '/portfolio';
  } else if (path.startsWith('/blog/')) {
    topBtnText = 'BACK TO BLOG';
    topBtnLink = '/blog';
  }

  const handleTopClick = (e) => {
    if (topBtnText === 'BACK TO TOP') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactClick = (e) => {
    if (path === '/') {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="w-full bg-bg-dark pt-20 pb-10 px-5 xl:px-10 flex flex-col items-center gap-16">
      
      {/* Main top footer layout */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 w-full max-w-[1600px]">
        
        {/* Column 1: Brand & Avatar info */}
        <address className="not-italic flex flex-col gap-4 max-w-[300px] text-left">
          <div className="flex items-center gap-3">
            <img
              src="https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png?width=1024&height=1024"
              alt="Sholahuddin Ahmad"
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
            <span className="font-mono text-[1.3rem] font-normal text-white uppercase tracking-tight">
              Sholahuddin Ahmad
            </span>
          </div>
          <p className="text-[1rem] text-text-secondary leading-relaxed">
            Coder and designer focused on bold,<br />modern branding
          </p>
          <a
            href="mailto:halohuddin@gmail.com"
            className="font-sans text-[1rem] text-[#E0FF6F] hover:opacity-80 transition-opacity duration-200 mt-2 block"
          >
            halohuddin@gmail.com
          </a>
        </address>
 
        {/* Column 2: Center Back to top anchor */}
        <div className="flex justify-center items-center h-full pt-1">
          {topBtnText === 'BACK TO TOP' ? (
            <a
              href="#"
              onClick={handleTopClick}
              className="font-sans text-[0.95rem] font-medium uppercase text-white hover:text-[#E0FF6F] transition-colors duration-200 flex items-center gap-1.5"
            >
              BACK TO TOP <span>↗</span>
            </a>
          ) : (
            <Link
              href={topBtnLink}
              className="font-sans text-[0.95rem] font-medium uppercase text-white hover:text-[#E0FF6F] transition-colors duration-200 flex items-center gap-1.5"
            >
              {topBtnText} <span>↗</span>
            </Link>
          )}
        </div>
 
        {/* Column 3: Copyright & Credits replacement block */}
        <div className="flex flex-col text-left md:text-right gap-4 max-w-[300px] font-sans text-[0.95rem] text-text-secondary leading-relaxed">
          <div>
            © 2025 JULIAN Template.<br />
            ™ 2027 HaloHuddin Project.
          </div>
          <div>
            Built in <span className="text-[#E0FF6F] font-medium">Framer & Antigravity</span>
          </div>
          <div className="flex items-center gap-1.5 md:justify-end">
            <span className="text-text-muted">MADE BY</span>
            <a
              href="https://tmpl.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold tracking-tight uppercase hover:text-[#E0FF6F] transition-colors duration-200"
            >
              tmpl
            </a>
          </div>
        </div>
 
      </div>
 
      {/* Large Sholahuddin Ahmad Heading Text Background */}
      <div className="w-full max-w-[1600px] select-none overflow-hidden pt-4 pb-4 flex justify-end [mask-image:linear-gradient(to_right,rgba(0,0,0,0.15),#000)] [-webkit-mask-image:linear-gradient(to_right,rgba(0,0,0,0.15),#000)]">
        <div className="w-full text-right uppercase font-mono text-text-primary leading-none tracking-tighter text-[clamp(5rem,10vw,100rem)] whitespace-nowrap">
          SHOLAHUDDIN AHMAD
        </div>
      </div>
    </footer>
  );
}
