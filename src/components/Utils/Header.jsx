"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { SiGithub, SiMedium } from 'react-icons/si';
import { FaLinkedinIn } from "react-icons/fa";
import { navigationMenu } from '../../data/siteData';
import { supabase } from '../../utils/supabase';

export default function Header({ availabilityStatus = 'available' }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);
  const desktopMenuRef = useRef(null);

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
    const handleScroll = () => {
      const heroEl = document.getElementById('hero');
      // If we are on a detail page or there is no hero section, make it sticky immediately
      if (!heroEl) {
        setIsSticky(true);
        return;
      }
      
      const threshold = heroEl.offsetHeight || 600;
      if (window.scrollY >= threshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    // Run once on load
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target)) {
        setIsDesktopMenuOpen(false);
      }
    };

    if (isMenuOpen || isDesktopMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, isDesktopMenuOpen]);

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
      className={`left-0 w-full h-[100px] z-[1000] flex justify-center items-center transition-all duration-300 ${
        isSticky 
          ? 'fixed top-0 bg-bg-dark shadow-lg border-b border-border animate-in fade-in slide-in-from-top duration-300' 
          : 'absolute top-0 bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1600px] px-5 xl:px-10 flex justify-between md:grid md:grid-cols-3 items-center relative h-full">

        {/* Left — Nav Links (Desktop) / Hamburger Button & "Huddin" (Mobile) */}
        <div className="flex items-center justify-start shrink-0">
          {/* Desktop links */}
          <div className="flex gap-6 max-md:hidden items-center">
            {navigationMenu.filter(item => item.path !== '/' && item.path !== '/network').map(item => {
              const isActive = item.path === '/blog'
                ? pathname.startsWith('/blog')
                : pathname === item.path;
              return (
                <Link key={item.path} href={item.path} className={navLinkClass(isActive)}>
                  {item.label}
                </Link>
              );
            })}

            {/* Desktop Hamburger Button & Dropdown */}
            <div ref={desktopMenuRef} className="relative flex items-center">
              <button
                onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                className="w-8 h-8 flex items-center justify-center text-text-primary cursor-pointer select-none"
                aria-label="Toggle Desktop Menu"
              >
                <div className="w-4.5 h-2.5 relative flex flex-col justify-between items-start">
                  <span
                    className={`h-[1px] bg-current rounded-full transition-all duration-300 ease-out origin-center ${
                      isDesktopMenuOpen ? 'w-4.5 rotate-45 absolute top-1/2 -translate-y-1/2' : 'w-4.5'
                    }`}
                  />
                  <span
                    className={`h-[1px] bg-current rounded-full transition-all duration-300 ease-out origin-center ${
                      isDesktopMenuOpen ? 'w-4.5 -rotate-45 absolute top-1/2 -translate-y-1/2' : 'w-3'
                    }`}
                  />
                </div>
              </button>

              {/* Desktop Dropdown Menu (no hover animations/bg-changes on children) */}
              {isDesktopMenuOpen && (
                <div className="absolute top-[45px] right-0 w-44 bg-bg-dark border border-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <Link
                    href="/network"
                    onClick={() => setIsDesktopMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary font-mono uppercase tracking-tight"
                  >
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zm6 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
                    </svg>
                    <span>Network</span>
                  </Link>
                  <Link
                    href="/playground"
                    onClick={() => setIsDesktopMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary font-mono uppercase tracking-tight"
                  >
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Playground</span>
                  </Link>
                  {session && (
                    <Link
                      href="/me/stories"
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary font-mono uppercase tracking-tight"
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
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary font-mono uppercase tracking-tight"
                    >
                      <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary font-mono uppercase tracking-tight"
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
        <div className="flex justify-center items-center max-md:hidden">
          <Link href="/" className="flex items-center font-mono text-[1.15rem] font-medium uppercase text-text-primary tracking-tight">
            <span className="max-md:hidden">Sholahuddin Ahmad</span>
          </Link>
        </div>

        {/* Right — Socials (Desktop) + Email Button */}
        <div className="flex justify-end items-center gap-[30px] shrink-0 max-md:gap-3">
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
                    svgPath: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
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
