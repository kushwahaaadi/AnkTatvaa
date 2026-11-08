'use client';

import React, { useState, useEffect } from 'react';
import { PLANET_MAP, calculateBirthNumber } from '@/lib/numerology';

interface HealthItem {
  title: string;
  description: string;
}

interface MoolankHealth {
  moolank: number;
  dob: string[];
  health_tendencies: HealthItem[];
}

export default function HealthTendenciesPage() {
  const [selectedMoolank, setSelectedMoolank] = useState<number>(1);
  const [dobInput, setDobInput] = useState('');
  const [allData, setAllData] = useState<MoolankHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/moolank-health-tendencies.json')
      .then(res => res.json())
      .then((data: MoolankHealth[]) => {
        setAllData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load health tendencies:', err);
        setLoading(false);
      });
  }, []);

  const handleDobCalculate = (val: string) => {
    setDobInput(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 2) {
      const day = parseInt(clean.slice(0, 2), 10);
      if (day >= 1 && day <= 31) {
        const bn = calculateBirthNumber(day);
        setSelectedMoolank(bn);
      }
    }
  };

  const currentData = allData.find(d => d.moolank === selectedMoolank) || (allData.length > 0 ? allData[0] : null);

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#B08A57] mb-2">
          PLANETARY VITALITY & CONSTITUTION
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F7F3EB] mb-4">
          Health Tendencies by Moolank
        </h1>
        <p className="text-sm text-[#898276] leading-relaxed">
          Traditional Vedic numerology maps the governing planetary energies to physical constitutional tendencies and balance practices.
        </p>
      </div>

      {/* Selector & DOB Lookup */}
      <div className="max-w-2xl mx-auto bg-[#161411]/90 border border-[#B08A57]/25 rounded-md p-6 backdrop-blur-xl mb-12 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
              Enter Your Birth Day or Full Date of Birth
            </label>
            <input
              type="text"
              placeholder="e.g. 19 or 19/10/1998"
              value={dobInput}
              onChange={(e) => handleDobCalculate(e.target.value)}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
          </div>

          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-2">
              Or Select Moolank Directly:
            </span>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedMoolank(num)}
                  className={`px-4 py-2 rounded-sm font-mono text-xs transition-all cursor-pointer ${
                    selectedMoolank === num
                      ? 'bg-[#B08A57] text-[#0D0D0C] font-bold shadow-[0_0_15px_rgba(176,138,87,0.4)]'
                      : 'bg-[#1B1915] border border-[#B08A57]/20 text-[#898276] hover:text-[#E8E0D2]'
                  }`}
                >
                  Moolank {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Moolank Health Overview */}
      {currentData && (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
          <div className="p-6 sm:p-8 bg-[#161411]/90 border border-[#B08A57]/30 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border border-[#B08A57]/50 rounded-full bg-[#0D0D0C]">
                <span className="font-mono text-3xl font-bold text-[#B08A57]">
                  {selectedMoolank}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A57]">
                  Planetary Governor
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#F7F3EB]">
                  {PLANET_MAP[selectedMoolank]?.planet} {PLANET_MAP[selectedMoolank]?.symbol}
                </h2>
                <p className="text-xs font-mono text-[#898276] mt-0.5">
                  Governs birth dates: {currentData.dob.join(', ')} of any month
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-[#898276] border-l border-[#B08A57]/20 pl-4 hidden sm:block">
              Total Recorded Patterns: {currentData.health_tendencies.length}
            </div>
          </div>

          {/* Tendencies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentData.health_tendencies.map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#161411]/80 border border-[#B08A57]/20 rounded-sm space-y-2 hover:border-[#B08A57]/45 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#B08A57] font-serif">॥</span>
                  <h3 className="font-serif text-base font-bold text-[#F7F3EB]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-[#898276] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Medical Disclaimer Alert */}
          <div className="p-5 bg-[#0D0D0C] border border-[#5C5549]/40 rounded-sm flex items-start gap-4 text-xs font-mono text-[#898276]">
            <span className="text-base text-[#B08A57]">◈</span>
            <p className="leading-relaxed">
              <strong className="text-[#E8E0D2]">Holistic Heritage Disclaimer:</strong> Numerological health observations reflect ancient astrological and elemental archetypes. They are provided solely for cultural, historical, and self-reflective awareness, and are not intended as medical diagnosis, clinical treatment, or established pathology.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
