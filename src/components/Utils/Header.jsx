import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { SiGithub, SiMedium } from 'react-icons/si';
import { FaLinkedinIn } from "react-icons/fa";

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleContactClick = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkClass = (active) =>
    `font-mono text-[0.95rem] font-medium uppercase tracking-tight transition-colors duration-200 ${
      active ? 'text-accent' : 'text-text-primary'
    }`;

  return (
    <nav ref={headerRef} className="fixed top-0 left-0 w-full h-[100px] bg-bg-dark z-[1000] flex justify-center items-center">
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
            <Link to="/network" className={navLinkClass(location.pathname === '/network')}>
              Network
            </Link>
          </div>

          {/* Mobile hamburger menu toggle & Huddin branding */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden max-md:flex items-center gap-3 z-50 text-text-primary hover:text-accent transition-colors cursor-pointer select-none"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-4.5 relative flex flex-col justify-between items-end">
              <span
                className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ease-out origin-right ${
                  isMenuOpen ? 'w-5.5 -rotate-45 translate-x-[-1px] translate-y-[-1px]' : 'w-5.5'
                }`}
              />
              <span
                className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ease-out ${
                  isMenuOpen ? 'w-0 opacity-0' : 'w-3.5'
                }`}
              />
              <span
                className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ease-out origin-right ${
                  isMenuOpen ? 'w-5.5 rotate-45 translate-x-[-1px] translate-y-[1px]' : 'w-4.5'
                }`}
              />
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
            <span className="max-md:hidden">Sholahuddin Ahmad</span>
          </Link>
        </div>

        {/* Right — Socials (Desktop) + Email Button */}
        <div className="flex justify-end items-center gap-[30px] w-[30%] max-md:w-auto max-md:shrink-0 max-md:gap-3">
          {/* Social icons wrapper link — hidden on mobile, scrolls to contact */}
          {/* Social icons wrapper link — hidden on mobile, scrolls to contact with sliding hover animation */}
          <a
            href="#contact"
            onClick={handleContactClick}
            className="group relative h-[20px] min-w-[92px] overflow-hidden max-md:hidden block cursor-pointer select-none"
            title="Scroll to Contact"
          >
            <div className="transition-transform duration-200 ease-out flex flex-col -translate-y-0 group-hover:-translate-y-[20px]">
              {/* Row 1: Icons */}
              <div className="flex gap-4 items-center justify-center h-[20px] text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                <SiGithub className="w-[18px] h-[18px]" />
                <FaLinkedinIn className="w-[18px] h-[18px]" />
                <SiMedium className="w-[18px] h-[18px]" />
              </div>
              {/* Row 2: Text */}
              <div className="flex items-center justify-center h-[20px] text-accent font-mono text-[0.75rem] tracking-wider uppercase font-normal whitespace-nowrap">
                Scroll To Contact ↓
              </div>
            </div>
          </a>

          {/* Email button */}
          <Button
            href="mailto:halohuddin@gmail.com"
            variant="email-pill"
            noTranslate
          >
            <span>Email me</span>
            <img
              src="https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png?width=1024&height=1024"
              alt="Sholahuddin Ahmad"
              className="w-[2.5em] h-[2.5em] rounded-full object-cover border border-accent"
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
          {/* Profile link */}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`${navLinkClass(location.pathname === '/')} flex items-center gap-3.5`}
            style={{
              transitionDelay: isMenuOpen ? '50ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          
          <Link
            to="/portfolio"
            onClick={() => setIsMenuOpen(false)}
            className={`${navLinkClass(location.pathname === '/portfolio')} flex items-center gap-3.5`}
            style={{
              transitionDelay: isMenuOpen ? '100ms' : '0ms',
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
              transitionDelay: isMenuOpen ? '150ms' : '0ms',
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
          <Link
            to="/network"
            onClick={() => setIsMenuOpen(false)}
            className={`${navLinkClass(location.pathname === '/network')} flex items-center gap-3.5`}
            style={{
              transitionDelay: isMenuOpen ? '200ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zm6 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
            </svg>
            <span>Network</span>
          </Link>
          <a
            href="#contact"
            onClick={(e) => {
              setIsMenuOpen(false);
              handleContactClick(e);
            }}
            className="flex gap-5 items-center pt-4 mt-2 border-t border-border/50 text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer"
            style={{
              transitionDelay: isMenuOpen ? '250ms' : '0ms',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isMenuOpen ? 1 : 0,
              transitionProperty: 'all',
            }}
          >
            <SiGithub className="w-5 h-5" />
            <FaLinkedinIn className="w-5 h-5" />
            <SiMedium className="w-5 h-5" />
          </a>
        </div>

      </div>
    </nav>
  );
}
