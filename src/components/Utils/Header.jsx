import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleContactClick = (e) => {
    if (isHome) {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinkClass = (active) =>
    `font-mono text-[0.95rem] font-medium uppercase tracking-tight transition-colors duration-200 ${
      active ? 'text-accent' : 'text-text-primary hover:text-accent'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full h-[100px] bg-bg-dark z-[1000] flex justify-center items-center">
      <div className="w-full max-w-[1600px] px-5 xl:px-10 flex justify-between items-center relative h-full">

        {/* Left — Nav Links (Desktop) / Hamburger Button & "Huddin" (Mobile) */}
        <div className="flex items-center w-[30%] max-md:w-auto max-md:shrink-0">
          {/* Desktop links */}
          <div className="flex gap-6 max-md:hidden">
            <Link to="/portfolio" className={navLinkClass(location.pathname === '/portfolio')}>
              Portfolio
            </Link>
            <Link to="/blog" className={navLinkClass(location.pathname.startsWith('/blog'))}>
              Blog
            </Link>
            <a
              href={isHome ? '#contact' : '/#contact'}
              onClick={handleContactClick}
              className={navLinkClass(false)}
            >
              Contact
            </a>
          </div>

          {/* Mobile hamburger menu toggle & Huddin branding */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden max-md:flex items-center gap-3 z-50 text-text-primary hover:text-accent transition-colors cursor-pointer select-none"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </div>
            <span className="font-mono text-[1.1rem] uppercase tracking-tight">Huddin</span>
          </button>
        </div>

        {/* Center — Logo */}
        <div className="flex justify-center items-center w-[40%] max-md:hidden">
          <Link to="/" className="flex items-center gap-2 font-mono text-[1.15rem] font-medium uppercase text-text-primary tracking-tight">
            <div className="w-4 h-4 flex justify-center items-center relative">
              <span className="pulse-dot"></span>
            </div>
            <span className="max-md:hidden">Julian Blake</span>
          </Link>
        </div>

        {/* Right — Socials (Desktop) + Email Button */}
        <div className="flex justify-end items-center gap-[30px] w-[30%] max-md:w-auto max-md:shrink-0 max-md:gap-3">
          {/* Social icons — hidden on mobile */}
          <div className="flex gap-4 items-center max-md:hidden">
            <a
              href="https://framer.link/sashamozdir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-5 h-5 text-text-secondary transition-all duration-200 hover:text-text-primary hover:-translate-y-0.5"
              title="Framer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-full h-full fill-current">
                <path d="M208,104V40a8,8,0,0,0-8-8H56a8,8,0,0,0-5.31,14L107,96H56a8,8,0,0,0-8,8v64a8,8,0,0,0,2.34,5.66l72,72A8,8,0,0,0,136,240V176h64a8,8,0,0,0,5.31-14L149,112h51A8,8,0,0,0,208,104Zm-29,56H128a8,8,0,0,0-8,8v52.69l-56-56V112h61Zm13-64H131L77,48H192Z" />
              </svg>
            </a>
            <a
              href="https://x.com/sashamozdir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-5 h-5 text-text-secondary transition-all duration-200 hover:text-text-primary hover:-translate-y-0.5"
              title="X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-full h-full fill-current">
                <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/Sasha.mozdir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-5 h-5 text-text-secondary transition-all duration-200 hover:text-text-primary hover:-translate-y-0.5"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-full h-full fill-current">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
              </svg>
            </a>
          </div>

          {/* Email button */}
          <Button
            href="mailto:hello@tmpl.digital"
            variant="email-pill"
          >
            <span>Email me</span>
            <img
              src="https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png?width=1024&height=1024"
              alt="Julian Blake"
              className="w-10 h-10 rounded-full object-cover border border-border max-md:w-8 max-md:h-8"
            />
          </Button>
        </div>

      </div>

      {/* Mobile Expandable Menu Dropdown */}
      <div
        className={`absolute top-[100px] left-0 w-full bg-bg-dark/95 px-6 z-40 transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
          isMenuOpen ? 'max-h-[350px] py-8 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6">
          <Link
            to="/portfolio"
            onClick={() => setIsMenuOpen(false)}
            className={`${navLinkClass(location.pathname === '/portfolio')} flex items-center gap-3.5`}
            style={{
              transitionDelay: isMenuOpen ? '50ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Portfolio</span>
          </Link>
          <Link
            to="/blog"
            onClick={() => setIsMenuOpen(false)}
            className={`${navLinkClass(location.pathname.startsWith('/blog'))} flex items-center gap-3.5`}
            style={{
              transitionDelay: isMenuOpen ? '125ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Blog</span>
          </Link>
          <a
            href={isHome ? '#contact' : '/#contact'}
            onClick={(e) => {
              setIsMenuOpen(false);
              handleContactClick(e);
            }}
            className={`${navLinkClass(false)} flex items-center gap-3.5`}
            style={{
              transitionDelay: isMenuOpen ? '200ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact</span>
          </a>

          {/* Profile online status */}
          <div
            className="flex items-center gap-3 font-mono text-[0.95rem] font-medium uppercase tracking-tight text-text-secondary mt-4 pt-6 border-t border-border/30"
            style={{
              transitionDelay: isMenuOpen ? '275ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <div className="relative w-3 h-3 flex items-center justify-center">
              <span className="pulse-dot"></span>
            </div>
            <span>Julian Blake</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
