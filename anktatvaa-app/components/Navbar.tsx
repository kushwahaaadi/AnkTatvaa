'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle sticky glass opacity change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitor Firebase Auth state + localStorage fallback
  useEffect(() => {
    if (auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
        });
        return () => unsubscribe();
      } catch (e) {}
    }

    // LocalStorage fallback
    try {
      const localUser = JSON.parse(localStorage.getItem('ank_user') || 'null');
      if (localUser && localUser.loggedIn) {
        setCurrentUser({ email: localUser.email, displayName: localUser.name } as any);
      }
    } catch (e) {}
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const exploreRoutes = [
    { label: 'Vedic Numerology', href: '/numerology', desc: 'Moolank, Bhagyank, 3x3 Grid & Mahadasha' },
    { label: 'Name Vibration', href: '/name-vibration', desc: 'Chaldean frequency & Shadow Number' },
    { label: 'Compatibility', href: '/compatibility', desc: 'Dual-soul resonance & karmic score' },
    { label: 'Health Tendencies', href: '/health-tendencies', desc: 'Planetary constitution & vitality' },
    { label: 'Phone Vibration', href: '/phone-vibration', desc: 'Harmonic alignment of mobile frequency' },
  ];

  return (
    <>
      <header
        className={`navbar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-[72px] transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#0D0D0C]/95 border-[#B08A57]/30 shadow-[0_6px_32px_rgba(0,0,0,0.7)] backdrop-blur-md'
            : 'bg-[#0D0D0C]/80 border-[#B08A57]/20 backdrop-blur-md'
        }`}
      >
        {/* ── LEFT: Brand Logo & Typography ── */}
        <Link href="/" className="nav-brand flex items-center gap-3.5 group">
          <span className="text-[#B08A57] text-lg transition-transform duration-300 group-hover:rotate-45">✦</span>
          <div className="flex flex-col">
            <span className="font-serif text-[1.35rem] font-semibold tracking-wider text-[#F7F3EB] leading-none">
              AnkTatvaa
            </span>
            <span className="font-mono text-[8px] tracking-[0.26em] uppercase text-[#898276] leading-none mt-1">
              THE LANGUAGE OF NUMBERS
            </span>
          </div>
        </Link>

        {/* ── CENTER: Desktop Navigation ── */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`nav-link text-xs tracking-[0.16em] uppercase transition-colors py-1 relative ${
              pathname === '/' ? 'text-[#F7F3EB] font-medium' : 'text-[#E8E0D2] hover:text-[#F7F3EB]'
            }`}
          >
            Home
          </Link>

          {/* Explore Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="nav-link text-xs tracking-[0.16em] uppercase transition-colors py-1 flex items-center gap-1.5 text-[#E8E0D2] hover:text-[#F7F3EB] cursor-pointer"
              aria-expanded={dropdownOpen}
            >
              <span>Explore</span>
              <span className={`text-[10px] transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#B08A57]' : 'text-[#898276]'}`}>
                ▼
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 min-w-[310px] bg-[#161411]/95 border border-[#B08A57]/25 rounded-sm p-3 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-[fadeIn_0.2s_ease-out]">
                {exploreRoutes.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDropdownOpen(false)}
                    className="block p-2.5 rounded-sm hover:bg-[#B08A57]/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium tracking-wider text-[#E8E0D2] group-hover:text-[#B08A57] uppercase">
                        {item.label}
                      </span>
                      <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-[11px] text-[#898276] mt-0.5 font-sans leading-tight">
                      {item.desc}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className={`nav-link text-xs tracking-[0.16em] uppercase transition-colors py-1 relative ${
              pathname === '/dashboard' ? 'text-[#F7F3EB] font-medium' : 'text-[#E8E0D2] hover:text-[#F7F3EB]'
            }`}
          >
            Readings
          </Link>

          <Link
            href="/#features"
            className="nav-link text-xs tracking-[0.16em] uppercase text-[#E8E0D2] hover:text-[#F7F3EB] transition-colors py-1"
          >
            About
          </Link>
        </nav>

        {/* ── RIGHT: CTA & Auth Entry ── */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-mono tracking-wider uppercase border border-[#B08A57]/40 text-[#E8E0D2] hover:bg-[#B08A57]/15 rounded-sm transition-all flex items-center gap-2"
            >
              <span className="text-[#B08A57]">◈</span>
              <span>Seeker Portal</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-mono tracking-wider uppercase text-[#898276] hover:text-[#E8E0D2] transition-colors px-2 py-1"
            >
              Login
            </Link>
          )}

          <Link
            href="/numerology"
            className="px-5 py-2.5 bg-[#B08A57] hover:bg-[#c49e6a] text-[#0D0D0C] font-mono font-medium text-xs tracking-wider uppercase rounded-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(176,138,87,0.35)] flex items-center gap-2"
          >
            <span>Get Your Reading</span>
            <span>→</span>
          </Link>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 text-[#E8E0D2] focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <span className={`block h-[1.5px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-[1.5px] w-4 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-[1.5px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </header>

      {/* ── Mobile Slide-down Panel ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-[#0D0D0C]/98 z-40 backdrop-blur-2xl flex flex-col px-8 py-8 overflow-y-auto border-t border-[#B08A57]/20 md:hidden animate-[fadeIn_0.25s_ease-out]">
          <div className="flex flex-col gap-6 flex-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-base tracking-widest uppercase text-[#E8E0D2] hover:text-[#B08A57] py-2 border-b border-[#1B1915]"
            >
              Home
            </Link>

            {/* Expandable Explore Submenu */}
            <div className="py-2 border-b border-[#1B1915]">
              <button
                onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                className="w-full flex items-center justify-between font-mono text-base tracking-widest uppercase text-[#E8E0D2] hover:text-[#B08A57]"
              >
                <span>Explore Tools</span>
                <span className="text-xs text-[#B08A57]">{mobileSubmenuOpen ? '−' : '+'}</span>
              </button>

              {mobileSubmenuOpen && (
                <div className="mt-4 pl-4 flex flex-col gap-3 border-l border-[#B08A57]/30">
                  {exploreRoutes.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-mono text-xs tracking-wider uppercase text-[#898276] hover:text-[#F7F3EB] py-1"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-base tracking-widest uppercase text-[#E8E0D2] hover:text-[#B08A57] py-2 border-b border-[#1B1915]"
            >
              Readings & Archives
            </Link>

            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-base tracking-widest uppercase text-[#E8E0D2] hover:text-[#B08A57] py-2 border-b border-[#1B1915]"
            >
              About The System
            </Link>

            <Link
              href={currentUser ? "/dashboard" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-base tracking-widest uppercase text-[#898276] hover:text-[#E8E0D2] py-2 border-b border-[#1B1915]"
            >
              {currentUser ? "Seeker Dashboard" : "Sign In / Register"}
            </Link>
          </div>

          <div className="pt-6">
            <Link
              href="/numerology"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block text-center py-3.5 bg-[#B08A57] text-[#0D0D0C] font-mono text-xs font-semibold tracking-wider uppercase rounded-sm"
            >
              Get Your Vedic Reading →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
