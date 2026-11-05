'use client';

import React, { useState, useEffect } from 'react';
import { calculateNameFrequency, CHALDEAN_MAP, reduceToSingle } from '@/lib/numerology';
import { saveReading } from '@/lib/firebase';
import { useToast } from '@/components/ToastProvider';

export default function NameVibrationPage() {
  const { showToast } = useToast();
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);
  const [interpretations, setInterpretations] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/data/compound-interpretations.json')
      .then(res => res.json())
      .then(data => setInterpretations(data))
      .catch(() => {});
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const lettersOnly = nameInput.replace(/[^A-Za-z]/g, '');
    if (!lettersOnly || lettersOnly.length === 0) {
      setErrorMsg('◈ Please enter a name with at least one letter');
      return;
    }

    const calculated = calculateNameFrequency(nameInput.trim());
    setResult(calculated);
  };

  const handleSaveReading = async () => {
    if (!result) return;
    try {
      await saveReading({
        type: 'Name Vibration',
        title: `${result.originalName} (Compound ${result.compoundNumber} · Shadow ${result.shadowNumber})`,
        summary: `Chaldean vibration ${result.compoundNumber} reduced to ${result.singleNumber}. Inverted pyramid shadow vibration ${result.shadowNumber}.`,
        link: `/name-vibration`
      });
      showToast('Name vibration saved to your Seeker Archive');
    } catch (e) {
      showToast('Saved locally');
    }
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#B08A57] mb-2">
          CHALDEAN FREQUENCY ARCHITECTURE
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F7F3EB] mb-4">
          Name Vibration & Shadow Matrix
        </h1>
        <p className="text-sm text-[#898276] leading-relaxed">
          In ancient Chaldean numerology, every letter resonates at a distinct celestial frequency. Decode your compound vibration and inverted shadow pyramid.
        </p>
      </div>

      {/* Input Card */}
      <div className="max-w-xl mx-auto bg-[#161411]/90 border border-[#B08A57]/25 rounded-md p-6 backdrop-blur-xl mb-12 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
              Full Name or Moniker <span className="text-[#B08A57]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ADITYA KUSHWAHA"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm uppercase text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57] transition-colors"
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
            Compute Frequency Matrix →
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-10 animate-[fadeIn_0.35s_ease-out]">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#B08A57]/20 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A57]">
                Analyzed Moniker
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F7F3EB] uppercase">
                {result.originalName}
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

          {/* Letter Value Breakdown */}
          <div className="p-6 bg-[#161411]/70 border border-[#B08A57]/20 rounded-sm">
            <span className="font-mono text-xs uppercase tracking-widest text-[#898276] block mb-4">
              Chaldean Letter-by-Letter Decomposition
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {result.letterData.map((item: any, idx: number) => {
                if (item.type === 'space') {
                  return <div key={idx} className="w-4" />;
                }
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center w-11 h-14 bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm"
                  >
                    <span className="font-mono text-xs font-bold text-[#F7F3EB]">{item.letter}</span>
                    <span className="font-mono text-[11px] text-[#B08A57] mt-0.5">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compound & Shadow Numbers Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/30 rounded-sm flex items-center gap-6">
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center border border-[#B08A57]/50 rounded-full bg-[#0D0D0C]">
                <span className="font-mono text-3xl font-bold text-[#B08A57]">
                  {result.compoundNumber}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276]">
                  Compound Frequency
                </span>
                <h3 className="font-serif text-xl font-bold text-[#F7F3EB] mt-0.5">
                  Single Digit: {result.singleNumber}
                </h3>
                <p className="text-xs text-[#898276] mt-1">
                  The primary outer vibrational force projected into society and career.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/30 rounded-sm flex items-center gap-6">
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center border border-[#D4B58A]/50 rounded-full bg-[#0D0D0C]">
                <span className="font-mono text-3xl font-bold text-[#D4B58A]">
                  {result.shadowNumber}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276]">
                  Inverted Shadow Number
                </span>
                <h3 className="font-serif text-xl font-bold text-[#F7F3EB] mt-0.5">
                  Hidden Harmonic
                </h3>
                <p className="text-xs text-[#898276] mt-1">
                  The deep subconscious resonance operating under karmic pressure.
                </p>
              </div>
            </div>
          </div>

          {/* Compound Interpretation from JSON */}
          {interpretations[String(result.compoundNumber)] && (
            <div className="p-6 sm:p-8 bg-[#161411]/90 border border-[#B08A57]/30 rounded-sm space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57] block">
                ✦ Interpretation · Compound Frequency {result.compoundNumber}
              </span>
              <p className="text-sm text-[#E8E0D2] leading-relaxed">
                {interpretations[String(result.compoundNumber)]}
              </p>
            </div>
          )}

          {/* Inverted Pyramid Visualizer */}
          <div className="p-6 sm:p-8 bg-[#161411]/80 border border-[#B08A57]/20 rounded-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#B08A57]/15">
              <span className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2]">
                ◈ Inverted Pyramid Reduction Steps
              </span>
              <span className="font-mono text-[11px] text-[#898276]">
                {result.steps.length} Reduction Tiers
              </span>
            </div>

            <div className="overflow-x-auto py-4 flex flex-col items-center gap-2">
              {result.steps.map((tier: number[], tIdx: number) => (
                <div key={tIdx} className="flex gap-1.5 justify-center">
                  {tier.map((val: number, vIdx: number) => {
                    const isLastTier = tIdx === result.steps.length - 1;
                    return (
                      <span
                        key={vIdx}
                        className={`w-7 h-7 flex items-center justify-center font-mono text-xs rounded-sm ${
                          isLastTier
                            ? 'bg-[#B08A57] text-[#0D0D0C] font-bold shadow-[0_0_12px_rgba(176,138,87,0.5)]'
                            : 'bg-[#0D0D0C] border border-[#B08A57]/20 text-[#898276]'
                        }`}
                      >
                        {val}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
