"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiGithub, SiMedium } from 'react-icons/si';
import { FaLinkedinIn } from "react-icons/fa";
import { navigationMenu } from '../../data/siteData';
import { supabase } from '../../utils/supabase';

export default function Header({ availabilityStatus = 'available' }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const headerRef = useRef(null);
  const brandMenuRef = useRef(null);
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const options = {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      setTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (brandMenuRef.current && !brandMenuRef.current.contains(event.target)) {
        setIsBrandMenuOpen(false);
      }
    };

    if (isMenuOpen || isBrandMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, isBrandMenuOpen]);

  const handleContactClick = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkClass = (active) =>
    `font-mono text-[0.95rem] leading-none font-medium uppercase tracking-tight transition-colors duration-200 inline-flex items-center translate-y-[1px] ${
      active ? 'text-accent' : 'text-text-primary'
    }`;

  return (
    <nav 
      ref={headerRef} 
      className={`fixed top-0 left-0 w-full z-[1000] flex justify-center items-start bg-bg-dark/95 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? 'h-[70px] pt-4' : 'h-[110px] pt-6'
      }`}
    >
      <div className="w-full max-w-[1600px] px-5 xl:px-10 flex justify-between items-start relative h-full">

        {/* Left — Brand & Navigation (Desktop & Mobile) */}
        <div ref={brandMenuRef} className="relative flex flex-col items-start gap-0.5 shrink-0">
          <button 
            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
            className={`font-bebas font-normal uppercase tracking-[-0.05em] text-text-primary transition-all duration-300 cursor-pointer select-none leading-[0.8] origin-left flex items-start -ml-[0.04em] ${
              isScrolled 
                ? 'text-[2rem] md:text-[2.5rem]' 
                : 'text-[2.5rem] md:text-[13rem]'
            }`}
          >
            <span className="relative">
              HUDDIN
              <span className="absolute top-[0.08em] left-full ml-[0.25em] text-[0.2em] font-sans font-bold leading-none select-none text-text-muted opacity-60">™</span>
            </span>
          </button>

          {/* Desktop Brand Dropdown Menu */}
          {isBrandMenuOpen && (
            <div className="absolute top-[100%] mt-3 left-0 w-48 bg-bg-dark border border-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <Link
                href="/"
                onClick={() => setIsBrandMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
              <Link
                href="/portfolio"
                onClick={() => setIsBrandMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Portfolio</span>
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsBrandMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Blog</span>
              </Link>
              <Link
                href="/network"
                onClick={() => setIsBrandMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zm6 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
                </svg>
                <span>Network</span>
              </Link>
              <Link
                href="/playground"
                onClick={() => setIsBrandMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Playground</span>
              </Link>
              {session && (
                <Link
                  href="/me/stories"
                  onClick={() => setIsBrandMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Stories</span>
                </Link>
              )}
              {session ? (
                <Link
                  href="/logout"
                  onClick={() => setIsBrandMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsBrandMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-dark-light transition-colors font-mono uppercase tracking-tight"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right — Time, Status & Location (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-6 max-md:gap-3 shrink-0 self-start">
          {mounted && (
            <>
              {/* Availability status badge */}
              <div className="flex flex-col items-end text-[0.75rem] select-none max-md:hidden">
                <span className="font-sans font-semibold text-text-primary flex items-center gap-1.5 tracking-[-0.02em] leading-tight">
                  <span className="pulse-dot status-available shrink-0"></span>
                  2 Slots Open
                </span>
                <span className="font-mono text-text-muted text-[0.65rem] tracking-[0.06em] leading-none mt-1 uppercase">
                  for {new Date().toLocaleString('en-US', { month: 'long' })}
                </span>
              </div>

              {/* Timezone clock */}
              <div className="flex flex-col items-end text-[0.75rem] select-none max-md:hidden">
                <span className="font-sans font-semibold text-text-primary tracking-[-0.02em] leading-tight">{time}</span>
                <span className="font-mono text-text-muted text-[0.65rem] tracking-[0.06em] leading-none mt-1 uppercase">(GMT+7)</span>
              </div>

              {/* Google Maps Location */}
              <a
                href="https://maps.app.goo.gl/QaQxcJyqj2XyEuXB6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-end text-[0.75rem] select-none hover:text-accent transition-colors duration-200 max-md:hidden group"
                title="View Studio on Google Maps"
              >
                <span className="font-sans font-semibold text-text-primary group-hover:text-accent transition-colors tracking-[-0.02em] leading-tight">Home Studio</span>
                <span className="font-mono text-text-muted text-[0.65rem] tracking-[0.06em] leading-none mt-1 group-hover:text-accent transition-colors uppercase">Magelang, ID</span>
              </a>
            </>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden max-md:flex items-center gap-3 z-50 text-text-primary hover:text-accent transition-colors cursor-pointer select-none shrink-0 mt-[0.35rem]"
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
          </button>
        </div>
      </div>

      {/* Mobile Expandable Menu Dropdown */}
      <div
        className={`absolute top-[100px] left-0 w-full bg-bg-dark/95 px-6 z-40 transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
          isMenuOpen ? 'max-h-[500px] py-8 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6">
          {[
            {
              label: 'Network',
              path: '/network',
              svgPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zm6 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75'
            },
            ...navigationMenu.filter(item => item.path !== '/network'),
            {
              label: 'Playground',
              path: '/playground',
              svgPath: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            },
            ...(session
              ? [
                  {
                    label: 'Stories',
                    path: '/me/stories',
                    svgPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  },
                  {
                    label: 'Logout',
                    path: '/logout',
                    svgPath: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  }
                ]
              : [
                  {
                    label: 'Login',
                    path: '/login',
                    svgPath: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3h7a3 3 0 013 3v1'
                  }
                ]
            )
          ].map((item, idx) => {
            const isActive = item.path === '/blog'
              ? pathname.startsWith('/blog')
              : pathname === item.path;
            const delay = `${(idx + 1) * 50}ms`;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`${navLinkClass(isActive)} flex items-center gap-3.5`}
                style={{
                  transitionDelay: isMenuOpen ? delay : '0ms',
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: isMenuOpen ? 1 : 0,
                  transitionProperty: 'all',
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.svgPath} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <a
            href="#contact"
            onClick={(e) => {
              setIsMenuOpen(false);
              handleContactClick(e);
            }}
            className="flex gap-5 items-center pt-4 mt-2 border-t border-border/50 text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer"
            style={{
              transitionDelay: isMenuOpen ? '350ms' : '0ms',
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
