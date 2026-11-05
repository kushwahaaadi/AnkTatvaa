'use client';

import React, { useState } from 'react';
import { calculatePhoneVibration, PLANET_MAP, RELATION_MATRIX } from '@/lib/numerology';
import { saveReading } from '@/lib/firebase';
import { useToast } from '@/components/ToastProvider';

export default function PhoneVibrationPage() {
  const { showToast } = useToast();
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
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

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      setErrorMsg('◈ Please enter a valid date in DD/MM/YYYY format');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 5) {
      setErrorMsg('◈ Please enter a valid phone number');
      return;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    const calc = calculatePhoneVibration(day, month, year, cleanMobile);
    setResult({
      dob,
      mobile,
      ...calc
    });
  };

  const handleSaveReading = async () => {
    if (!result) return;
    try {
      await saveReading({
        type: 'Phone Vibration',
        title: `Mobile Frequency (${result.mobile}) · Status: ${result.finalStatus}`,
        summary: `Mobile number frequency ${result.mn} checked against Birth Number ${result.bn} and Destiny Number ${result.dn}.`,
        link: `/phone-vibration`
      });
      showToast('Phone analysis saved to your Seeker Archive');
    } catch (e) {
      showToast('Saved locally');
    }
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#B08A57] mb-2">
          ELECTROMAGNETIC HARMONICS
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F7F3EB] mb-4">
          Phone Number Vibration
        </h1>
        <p className="text-sm text-[#898276] leading-relaxed">
          Your phone number is dialed hundreds of times each year. Discover if its cumulative frequency harmonizes with your planetary blueprint or creates friction.
        </p>
      </div>

      {/* Input Form */}
      <div className="max-w-xl mx-auto bg-[#161411]/90 border border-[#B08A57]/25 rounded-md p-6 sm:p-8 backdrop-blur-xl mb-12 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
              Your Date of Birth (DD/MM/YYYY) <span className="text-[#B08A57]">*</span>
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={dob}
              onChange={(e) => setDob(formatDob(e.target.value))}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
              Mobile Phone Number <span className="text-[#B08A57]">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
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
            Calculate Phone Vibration →
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-8 animate-[fadeIn_0.35s_ease-out]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#B08A57]/20 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A57]">
                Analyzed Digits: {result.mobile}
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F7F3EB]">
                Vibrational Alignment: <span className="uppercase text-[#B08A57]">{result.finalStatus}</span>
              </h2>
            </div>
            <button
              onClick={handleSaveReading}
              className="px-4 py-2 bg-[#1B1915] hover:bg-[#B08A57]/20 border border-[#B08A57]/40 text-[#E8E0D2] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>✦</span>
              <span>Save to Seeker Archive</span>
            </button>
          </div>

          {/* Triad of Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/25 rounded-sm text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276] block mb-2">
                Birth Number (BN)
              </span>
              <span className="font-mono text-4xl font-bold text-[#B08A57]">
                {result.bn}
              </span>
              <p className="text-xs font-mono text-[#898276] mt-2">
                {PLANET_MAP[result.bn]?.planet} {PLANET_MAP[result.bn]?.symbol}
              </p>
            </div>

            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/25 rounded-sm text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276] block mb-2">
                Destiny Number (DN)
              </span>
              <span className="font-mono text-4xl font-bold text-[#D4B58A]">
                {result.dn}
              </span>
              <p className="text-xs font-mono text-[#898276] mt-2">
                {PLANET_MAP[result.dn]?.planet} {PLANET_MAP[result.dn]?.symbol}
              </p>
            </div>

            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/25 rounded-sm text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276] block mb-2">
                Mobile Number (MN)
              </span>
              <span className="font-mono text-4xl font-bold text-[#F7F3EB]">
                {result.mn}
              </span>
              <p className="text-xs font-mono text-[#898276] mt-2">
                {PLANET_MAP[result.mn]?.planet} {PLANET_MAP[result.mn]?.symbol}
              </p>
            </div>
          </div>

          {/* Planetary Affinity Matrix */}
          <div className="p-6 sm:p-8 bg-[#161411]/90 border border-[#B08A57]/30 rounded-sm space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57] block">
              ◈ Vedic Affinity Matrix
            </span>

            <p className="text-sm text-[#E8E0D2] leading-relaxed">
              {result.finalStatus === 'suitable' ? (
                <>Your mobile frequency ({result.mn}) aligns harmoniously with your governing celestial rulers. It supports career growth, clear communication, and positive incoming opportunities.</>
              ) : result.finalStatus === 'neutral' ? (
                <>Your mobile frequency ({result.mn}) is in neutral relationship with your planetary blueprint. It does not actively generate friction nor impart special acceleration.</>
              ) : (
                <>Your mobile frequency ({result.mn}) carries planetary friction against your Birth Number ({result.bn}) or Destiny Number ({result.dn}). Consider choosing a phone number whose sum reduces to a friendly planetary frequency.</>
              )}
            </p>

            <div className="pt-4 border-t border-[#B08A57]/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#0D0D0C] rounded-sm">
                <span className="text-[#B08A57] font-bold block mb-1">Friendly Frequencies for BN {result.bn}:</span>
                <span className="text-[#898276]">
                  {RELATION_MATRIX[result.bn]?.friendly.join(', ')}
                </span>
              </div>
              <div className="p-3 bg-[#0D0D0C] rounded-sm">
                <span className="text-[#898276] font-bold block mb-1">Conflicting Frequencies for BN {result.bn}:</span>
                <span className="text-[#5C5549]">
                  {RELATION_MATRIX[result.bn]?.enemy.join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
