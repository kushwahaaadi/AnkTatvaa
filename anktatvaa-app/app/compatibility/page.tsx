'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateBirthNumber, calculateDestinyNumber, calculateCompatibility, PLANET_MAP } from '@/lib/numerology';
import { saveReading } from '@/lib/firebase';
import { useToast } from '@/components/ToastProvider';
import AnimatedNumber from '@/components/AnimatedNumber';
import SpotlightCard from '@/components/SpotlightCard';

function CompatibilityContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [name1, setName1] = useState('');
  const [dob1, setDob1] = useState('');
  const [name2, setName2] = useState('');
  const [dob2, setDob2] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);

  const formatDob = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.slice(0, 8);
    let f = '';
    if (clean.length > 0) f += clean.slice(0, 2);
    if (clean.length > 2) f += '/' + clean.slice(2, 4);
    if (clean.length > 4) f += '/' + clean.slice(4, 8);
    return f;
  };

  const handleCompute = (n1: string, d1: string, n2: string, d2: string) => {
    setErrorMsg('');

    if (!n1.trim() || !d1.trim() || !n2.trim() || !d2.trim()) {
      setErrorMsg('◈ Please fill all four fields for both souls');
      return;
    }

    const m1 = d1.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const m2 = d2.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m1 || !m2) {
      setErrorMsg('◈ Please enter dates in DD/MM/YYYY format');
      return;
    }

    const lp1 = calculateDestinyNumber(parseInt(m1[1], 10), parseInt(m1[2], 10), parseInt(m1[3], 10));
    const lp2 = calculateDestinyNumber(parseInt(m2[1], 10), parseInt(m2[2], 10), parseInt(m2[3], 10));
    const bn1 = calculateBirthNumber(parseInt(m1[1], 10));
    const bn2 = calculateBirthNumber(parseInt(m2[1], 10));

    const res = calculateCompatibility(lp1, lp2, n1, n2);
    setResult({
      name1: n1,
      name2: n2,
      dob1: d1,
      dob2: d2,
      lp1,
      lp2,
      bn1,
      bn2,
      ...res
    });
  };

  useEffect(() => {
    const c1n = searchParams.get('c1name');
    const c1d = searchParams.get('c1dob');
    const c2n = searchParams.get('c2name');
    const c2d = searchParams.get('c2dob');
    if (c1n && c1d && c2n && c2d) {
      setName1(c1n);
      setDob1(c1d);
      setName2(c2n);
      setDob2(c2d);
      handleCompute(c1n, c1d, c2n, c2d);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCompute(name1, dob1, name2, dob2);
  };

  const handleSaveReading = async () => {
    if (!result) return;
    try {
      await saveReading({
        type: 'Compatibility',
        title: `${result.name1} & ${result.name2} Harmony (${result.score}%)`,
        summary: `${result.verdict.label}: ${result.score}% affinity between Life Paths ${result.lp1} and ${result.lp2}.`,
        link: `/compatibility`
      });
      showToast('Compatibility analysis saved to archive');
    } catch (e) {
      showToast('Saved locally');
    }
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#B08A57] mb-2">
          DUAL SOUL RESONANCE
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F7F3EB] mb-4">
          Cosmic Harmony & Compatibility
        </h1>
        <p className="text-sm text-[#898276] leading-relaxed">
          Cross-examine two soul matrices through Life Path frequencies, Moolank temperaments, and Chaldean name harmonics.
        </p>
      </div>

      {/* Input Card */}
      <SpotlightCard className="max-w-2xl mx-auto p-6 sm:p-8 backdrop-blur-xl mb-12 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Soul 1 */}
          <div className="space-y-3 pb-4 border-b border-[#B08A57]/20">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57] flex items-center gap-2">
              <span>Primary Soul</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Soul 1 Full Name"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
              />
              <input
                type="text"
                placeholder="DOB (DD/MM/YYYY)"
                value={dob1}
                onChange={(e) => setDob1(formatDob(e.target.value))}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
              />
            </div>
          </div>

          {/* Soul 2 */}
          <div className="space-y-3 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#D4B58A] flex items-center gap-2">
              <span>◈</span>
              <span>Secondary Soul</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Soul 2 Full Name"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
              />
              <input
                type="text"
                placeholder="DOB (DD/MM/YYYY)"
                value={dob2}
                onChange={(e) => setDob2(formatDob(e.target.value))}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="font-mono text-xs text-[#d97706] tracking-wider">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#B08A57] hover:bg-[#c49e6a] text-[#0D0D0C] font-mono text-xs font-semibold tracking-widest uppercase rounded-sm transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(176,138,87,0.3)]"
          >
            Reveal Cosmic Affinity →
          </button>
        </form>
      </SpotlightCard>

      {/* Results */}
      {result && (
        <div className="space-y-10 animate-[fadeIn_0.35s_ease-out]">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#B08A57]/20 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A57]">
                Resonance Synthesis
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F7F3EB]">
                {result.name1} &amp; {result.name2}
              </h2>
            </div>
            <button
              onClick={handleSaveReading}
              className="px-4 py-2 bg-[#1B1915] hover:bg-[#B08A57]/20 border border-[#B08A57]/40 text-[#E8E0D2] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>⬡</span>
              <span>Save to Seeker Archive</span>
            </button>
          </div>

          {/* Central Compatibility Gauge */}
          <SpotlightCard className="p-8 text-center flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57] mb-2">
              Overall Affinity Score
            </span>
            <div className="w-28 h-28 my-3 flex items-center justify-center border-2 border-[#B08A57] rounded-full bg-[#0D0D0C] shadow-[0_0_30px_rgba(176,138,87,0.25)]">
              <span className="font-mono text-4xl font-bold text-[#F7F3EB]">
                <AnimatedNumber value={result.score} suffix="%" duration={1200} />
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#B08A57] mt-2 mb-3">
              {result.verdict.label}
            </h3>
            <p className="text-sm text-[#E8E0D2] max-w-xl leading-relaxed">
              {result.verdict.text}
            </p>
          </SpotlightCard>

          {/* Dual Profiles Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#B08A57]/15">
                <span className="font-serif text-lg font-bold text-[#F7F3EB]">{result.name1}</span>
                <span className="font-mono text-xs text-[#898276]">{result.dob1}</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-[#1B1915]">
                  <span className="text-[#898276]">Life Path (DN):</span>
                  <span className="text-[#B08A57] font-bold">
                    {result.lp1} ({PLANET_MAP[result.lp1]?.planet})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1B1915]">
                  <span className="text-[#898276]">Birth Number (BN):</span>
                  <span className="text-[#E8E0D2]">
                    {result.bn1} ({PLANET_MAP[result.bn1]?.planet})
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#898276]">Name Frequency:</span>
                  <span className="text-[#E8E0D2]">{result.nn1}</span>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#B08A57]/15">
                <span className="font-serif text-lg font-bold text-[#F7F3EB]">{result.name2}</span>
                <span className="font-mono text-xs text-[#898276]">{result.dob2}</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-[#1B1915]">
                  <span className="text-[#898276]">Life Path (DN):</span>
                  <span className="text-[#D4B58A] font-bold">
                    {result.lp2} ({PLANET_MAP[result.lp2]?.planet})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1B1915]">
                  <span className="text-[#898276]">Birth Number (BN):</span>
                  <span className="text-[#E8E0D2]">
                    {result.bn2} ({PLANET_MAP[result.bn2]?.planet})
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#898276]">Name Frequency:</span>
                  <span className="text-[#E8E0D2]">{result.nn2}</span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[#898276]">Aligning celestial matrix...</div>}>
      <CompatibilityContent />
    </Suspense>
  );
}
