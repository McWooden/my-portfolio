"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { SiGithub, SiMedium } from 'react-icons/si';
import { FaLinkedinIn } from "react-icons/fa";
import { navigationMenu } from '../../data/siteData';

export default function Header({ availabilityStatus = 'available' }) {
  const pathname = usePathname();
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
        <div className="flex items-center shrink-0">
          {/* Desktop links */}
          <div className="flex gap-6 max-md:hidden">
            {navigationMenu.filter(item => item.path !== '/').map(item => {
              const isActive = item.path === '/blog'
                ? pathname.startsWith('/blog')
                : pathname === item.path;
              return (
                <Link key={item.path} href={item.path} className={navLinkClass(isActive)}>
                  {item.label}
                </Link>
              );
            })}
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
          <Link href="/" className="flex items-center gap-2 font-mono text-[1.15rem] font-medium uppercase text-text-primary tracking-tight">
            <div className="w-4 h-4 flex justify-center items-center relative">
              <span className={`pulse-dot status-${availabilityStatus}`}></span>
            </div>
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
          {navigationMenu.map((item, idx) => {
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
