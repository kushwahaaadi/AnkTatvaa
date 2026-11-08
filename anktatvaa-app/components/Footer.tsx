'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#0A0A09] border-t border-[#B08A57]/20 pt-16 pb-12 px-6 lg:px-12 text-[#898276]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="font-serif text-xl font-bold tracking-wider text-[#F7F3EB]">
              AnkTatvaa
            </span>
          </Link>
          <p className="text-xs text-[#898276] leading-relaxed">
            Ancient Vedic numerology, Chaldean vibrations, and planetary geometry translated into architectural insight.
          </p>
          <div className="pt-2 text-[10px] font-mono tracking-widest uppercase text-[#B08A57]">
            Vedic Mathematical Precision
          </div>
        </div>

        {/* Explorations Column */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2]">
            Vedic Portals
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <Link href="/numerology" className="hover:text-[#B08A57] transition-colors">
                · Vedic Numerology & Mahadasha
              </Link>
            </li>
            <li>
              <Link href="/name-vibration" className="hover:text-[#B08A57] transition-colors">
                · Name Vibration & Shadow Matrix
              </Link>
            </li>
            <li>
              <Link href="/compatibility" className="hover:text-[#B08A57] transition-colors">
                · Dual Profile Compatibility
              </Link>
            </li>
            <li>
              <Link href="/health-tendencies" className="hover:text-[#B08A57] transition-colors">
                · Planetary Health & Vitality
              </Link>
            </li>
            <li>
              <Link href="/phone-vibration" className="hover:text-[#B08A57] transition-colors">
                · Mobile Number Resonance
              </Link>
            </li>
          </ul>
        </div>

        {/* Seeker Access Column */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2]">
            Seeker Sanctuary
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <Link href="/dashboard" className="hover:text-[#B08A57] transition-colors">
                · Personal Cosmic Dashboard
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#B08A57] transition-colors">
                · Account Authentication
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-[#B08A57] transition-colors">
                · Register Seeker Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Mathematical Disclaimer */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2]">
            Philosophy
          </h4>
          <p className="text-[11px] text-[#898276] leading-relaxed">
            Every number carries a divine vibratory resonance from the cosmic fabric. Numerology provides reflective archetypal patterns, not dogmatic fortune-telling.
          </p>
          <div className="flex items-center gap-2 pt-2 text-[#B08A57] text-xs font-mono">
            <span>☉</span>
            <span>☽</span>
            <span>♃</span>
            <span>☊</span>
            <span>☿</span>
            <span>♀</span>
            <span>☋</span>
            <span>♄</span>
            <span>♂</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1B1915] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#5C5549] gap-4">
        <div>
          © 2026 AnkTatvaa. All celestial rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span>Obsidian & Antique Bronze Edition</span>
          <span>·</span>
          <span>Zero Emojis Aesthetic</span>
        </div>
      </div>
    </footer>
  );
}
