'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PLANET_MAP,
  TRANSIT_ESSENCES,
  GRID_POSITIONS,
  calculateBirthNumber,
  calculateDestinyNumber,
  calculatePersonalTransits,
  calculateUniversalGrid,
  calculateMahadasha,
  calculateAntardasha,
  reduceToSingle,
  MahadashaPeriod,
  AntardashaPeriod
} from '@/lib/numerology';
import { saveReading } from '@/lib/firebase';
import { useToast } from '@/components/ToastProvider';

function NumerologyContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  // Result state
  const [birthNumber, setBirthNumber] = useState<number>(1);
  const [destinyNumber, setDestinyNumber] = useState<number>(1);
  const [transits, setTransits] = useState<{ personalYear: number; personalMonth: number; personalDay: number } | null>(null);
  const [gridData, setGridData] = useState<{ digitCounts: Record<number, number>; presentNums: number[]; missingNums: number[] } | null>(null);
  const [mahadasha, setMahadasha] = useState<MahadashaPeriod | null>(null);
  const [antardashaPeriods, setAntardashaPeriods] = useState<AntardashaPeriod[]>([]);
  const [currentAD, setCurrentAD] = useState<AntardashaPeriod | null>(null);
  const [adTableOpen, setAdTableOpen] = useState(false);

  // External JSON data
  const [pyOutcome, setPyOutcome] = useState<any>(null);
  const [adOutcome, setAdOutcome] = useState<any>(null);

  // Handle DOB input formatting
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = '';
    if (val.length > 0) formatted += val.slice(0, 2);
    if (val.length > 2) formatted += '/' + val.slice(2, 4);
    if (val.length > 4) formatted += '/' + val.slice(4, 8);
    setDob(formatted);
  };

  // Run calculation logic
  const performCalculation = (nameToUse: string, dobToUse: string) => {
    setErrorMsg('');

    if (!nameToUse.trim()) {
      setErrorMsg('◈ Please enter your full name');
      return;
    }

    // Clean & normalize DOB
    let cleanDob = dobToUse.trim().replace(/\./g, '/').replace(/-/g, '/');
    const parts = cleanDob.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        cleanDob = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      } else {
        cleanDob = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }

    const match = cleanDob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      setErrorMsg('◈ Please enter a valid date in DD/MM/YYYY format');
      return;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      setErrorMsg('◈ Please enter a valid calendar date');
      return;
    }

    // Calculations
    const bn = calculateBirthNumber(day);
    const dn = calculateDestinyNumber(day, month, year);
    const tr = calculatePersonalTransits(day, month);
    const gd = calculateUniversalGrid(day, month, year, bn, dn);
    const md = calculateMahadasha(bn, year);

    // Antardasha
    const mdStartDate = new Date(md.startYear, month - 1, day);
    const adList = calculateAntardasha(md.number, mdStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activeAd = adList[adList.length - 1];
    for (let i = 0; i < adList.length; i++) {
      if (today >= adList[i].startDate && today < adList[i].endDate) {
        activeAd = adList[i];
        break;
      }
    }

    setBirthNumber(bn);
    setDestinyNumber(dn);
    setTransits(tr);
    setGridData(gd);
    setMahadasha(md);
    setAntardashaPeriods(adList);
    setCurrentAD(activeAd);
    setIsCalculated(true);

    // Load Personal Year Outcome from JSON
    fetch('/data/personal_year_1_9_v2 (1).json')
      .then(res => res.json())
      .then(data => {
        const lookup = reduceToSingle(tr.personalYear);
        if (data[lookup]) setPyOutcome(data[lookup]);
      })
      .catch(() => {});

    // Load Mahadasha-Antardasha Outcome from JSON
    fetch('/data/mahadasha_antardasha_outcomes.json')
      .then(res => res.json())
      .then(outcomes => {
        const mdPlanet = PLANET_MAP[md.number]?.planet;
        const adPlanet = PLANET_MAP[activeAd.number]?.planet;
        const key = `${mdPlanet}-${adPlanet}`;
        if (outcomes[mdPlanet] && outcomes[mdPlanet][key]) {
          setAdOutcome({
            title: `${mdPlanet} Mahadasha · ${adPlanet} Antardasha`,
            ...outcomes[mdPlanet][key]
          });
        }
      })
      .catch(() => {});
  };

  // URL query parameter initialization
  useEffect(() => {
    const urlName = searchParams.get('name');
    const urlDob = searchParams.get('dob');
    if (urlName) setFullName(urlName);
    if (urlDob) {
      let formatted = urlDob;
      if (urlDob.includes('-')) {
        const p = urlDob.split('-');
        if (p.length === 3) formatted = `${p[2].padStart(2, '0')}/${p[1].padStart(2, '0')}/${p[0]}`;
      }
      setDob(formatted);
      if (urlName) {
        performCalculation(urlName, formatted);
      }
    }
  }, [searchParams]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCalculation(fullName, dob);
  };

  const handleSaveToDashboard = async () => {
    try {
      await saveReading({
        type: 'Vedic Numerology',
        title: `${fullName}'s Celestial Blueprint (BN ${birthNumber} · DN ${destinyNumber})`,
        summary: `Birth Number ${birthNumber} (${PLANET_MAP[birthNumber]?.planet}), Destiny Number ${destinyNumber} (${PLANET_MAP[destinyNumber]?.planet}), Personal Year ${transits?.personalYear}.`,
        link: `/numerology?name=${encodeURIComponent(fullName)}&dob=${encodeURIComponent(dob)}`
      });
      showToast('Reading saved to your Cosmic Dashboard');
    } catch (e) {
      showToast('Saved locally to device');
    }
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#B08A57] mb-2">
          SACRED VEDIC NUMEROLOGY
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F7F3EB] mb-4">
          Birth & Destiny Blueprint
        </h1>
        <p className="text-sm text-[#898276] leading-relaxed">
          Input your birth coordinates to generate your complete 3x3 Universal Grid, Personal Transits, and planetary Mahadasha cycles.
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto bg-[#161411]/90 border border-[#B08A57]/25 rounded-md p-6 sm:p-8 backdrop-blur-xl mb-12 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                Full Legal Name <span className="text-[#B08A57]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aditya Kushwaha"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57] transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                Date of Birth (DD/MM/YYYY) <span className="text-[#B08A57]">*</span>
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={dob}
                onChange={handleDobChange}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57] transition-colors"
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
            Reveal Celestial Report →
          </button>
        </form>
      </div>

      {/* RESULTS DISPLAY */}
      {isCalculated && (
        <div className="space-y-12 animate-[fadeIn_0.4s_ease-out]">
          {/* Seeker Header & Save Reading */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#B08A57]/20 gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#F7F3EB]">
                {fullName}&apos;s Cosmic Matrix
              </h2>
              <p className="font-mono text-xs text-[#898276] mt-1">
                Date of Birth: {dob}
              </p>
            </div>
            <button
              onClick={handleSaveToDashboard}
              className="px-4 py-2 bg-[#1B1915] hover:bg-[#B08A57]/20 border border-[#B08A57]/40 text-[#E8E0D2] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>✦</span>
              <span>Save to Seeker Archive</span>
            </button>
          </div>

          {/* Core Numbers (Birth Number & Destiny Number) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/30 rounded-sm flex items-center gap-6">
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center border border-[#B08A57]/50 rounded-full bg-[#0D0D0C]">
                <span className="font-mono text-4xl font-bold text-[#B08A57]">
                  {birthNumber}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276]">
                  Birth Number (Moolank)
                </span>
                <h3 className="font-serif text-xl font-bold text-[#F7F3EB] mt-0.5">
                  {PLANET_MAP[birthNumber]?.planet} {PLANET_MAP[birthNumber]?.symbol}
                </h3>
                <p className="text-xs text-[#898276] mt-1">
                  Defines your core temperament, natural talents, and raw psychic identity.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/30 rounded-sm flex items-center gap-6">
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center border border-[#D4B58A]/50 rounded-full bg-[#0D0D0C]">
                <span className="font-mono text-4xl font-bold text-[#D4B58A]">
                  {destinyNumber}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#898276]">
                  Destiny Number (Bhagyank)
                </span>
                <h3 className="font-serif text-xl font-bold text-[#F7F3EB] mt-0.5">
                  {PLANET_MAP[destinyNumber]?.planet} {PLANET_MAP[destinyNumber]?.symbol}
                </h3>
                <p className="text-xs text-[#898276] mt-1">
                  Represents your dharmic mission, life obstacles, and ultimate destiny trajectory.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Transits (Year, Month, Day) */}
          {transits && (
            <div className="p-6 bg-[#161411]/60 border border-[#B08A57]/20 rounded-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#B08A57]/15">
                <span className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2]">
                  ✦ Current Personal Transits
                </span>
                <span className="font-mono text-[11px] text-[#898276]">
                  Calculated for Today
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                <div className="p-4 bg-[#0D0D0C]/80 border border-[#B08A57]/20 rounded-sm">
                  <div className="font-mono text-2xl font-bold text-[#B08A57] mb-1">
                    {transits.personalYear}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#E8E0D2]">
                    Personal Year
                  </div>
                  <p className="text-[11px] text-[#898276] mt-2">
                    <strong>{TRANSIT_ESSENCES[transits.personalYear]?.title}</strong>: {TRANSIT_ESSENCES[transits.personalYear]?.desc}
                  </p>
                </div>

                <div className="p-4 bg-[#0D0D0C]/80 border border-[#B08A57]/20 rounded-sm">
                  <div className="font-mono text-2xl font-bold text-[#D4B58A] mb-1">
                    {transits.personalMonth}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#E8E0D2]">
                    Personal Month
                  </div>
                  <p className="text-[11px] text-[#898276] mt-2">
                    <strong>{TRANSIT_ESSENCES[transits.personalMonth]?.title}</strong>: {TRANSIT_ESSENCES[transits.personalMonth]?.desc}
                  </p>
                </div>

                <div className="p-4 bg-[#0D0D0C]/80 border border-[#B08A57]/20 rounded-sm">
                  <div className="font-mono text-2xl font-bold text-[#E8E0D2] mb-1">
                    {transits.personalDay}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#E8E0D2]">
                    Personal Day
                  </div>
                  <p className="text-[11px] text-[#898276] mt-2">
                    <strong>{TRANSIT_ESSENCES[transits.personalDay]?.title}</strong>: {TRANSIT_ESSENCES[transits.personalDay]?.desc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3x3 Universal Grid (Loshu-Vedic) */}
          {gridData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* The Matrix */}
              <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/25 rounded-sm">
                <span className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2] block mb-4">
                  ◈ 3x3 Celestial Grid Matrix
                </span>
                <div className="grid grid-cols-3 gap-2 max-w-[320px] mx-auto">
                  {GRID_POSITIONS.map((pos) => {
                    const count = gridData.digitCounts[pos] || 0;
                    return (
                      <div
                        key={pos}
                        className={`h-24 flex flex-col items-center justify-center border rounded-sm transition-all ${
                          count > 0
                            ? 'bg-[#1B1915] border-[#B08A57]/50 text-[#F7F3EB]'
                            : 'bg-[#0D0D0C]/60 border-[#B08A57]/15 text-[#5C5549]'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-[#898276]">{pos}</span>
                        <span className="font-mono text-lg font-bold text-[#B08A57]">
                          {count > 0 ? String(pos).repeat(count) : '·'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Present vs Missing Numbers Analysis */}
              <div className="space-y-6">
                <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/25 rounded-sm">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57] block mb-3">
                    ✦ Present Planetary Frequencies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {gridData.presentNums.map((num) => (
                      <div
                        key={num}
                        className="px-3.5 py-1.5 bg-[#1B1915] border border-[#B08A57]/40 rounded-sm font-mono text-xs text-[#F7F3EB] flex items-center gap-2"
                      >
                        <span className="text-[#B08A57] font-bold">{num}</span>
                        <span className="text-[11px] text-[#898276]">
                          {PLANET_MAP[num]?.planet} {PLANET_MAP[num]?.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-[#161411]/80 border border-[#B08A57]/25 rounded-sm">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#898276] block mb-3">
                    ◈ Missing Numbers (Karmic Focus Areas)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {gridData.missingNums.length > 0 ? (
                      gridData.missingNums.map((num) => (
                        <div
                          key={num}
                          className="px-3.5 py-1.5 bg-[#0D0D0C] border border-[#5C5549]/40 rounded-sm font-mono text-xs text-[#898276] flex items-center gap-2"
                        >
                          <span className="text-[#898276] font-bold">{num}</span>
                          <span className="text-[11px] text-[#5C5549]">
                            {PLANET_MAP[num]?.planet} {PLANET_MAP[num]?.symbol}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[#898276] font-mono">
                        All planetary frequencies represented!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Year Detailed Outcome (Loaded from JSON) */}
          {pyOutcome && (
            <div className="p-6 sm:p-8 bg-[#161411]/90 border border-[#B08A57]/30 rounded-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#B08A57]/20">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57]">
                  ✦ Personal Year {transits?.personalYear} Synthesis
                </span>
                <span className="font-mono text-xs text-[#E8E0D2]">
                  {pyOutcome.theme}
                </span>
              </div>
              <p className="text-sm text-[#E8E0D2] leading-relaxed">
                {pyOutcome.description}
              </p>

              {pyOutcome.positive_highlights && pyOutcome.positive_highlights.length > 0 && (
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#B08A57] block mb-2">
                    Positive Catalysts
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pyOutcome.positive_highlights.map((h: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[#1B1915] border border-[#B08A57]/30 rounded-sm text-xs text-[#E8E0D2]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pyOutcome.precautions && pyOutcome.precautions.length > 0 && (
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#898276] block mb-2">
                    Karmic Precautions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pyOutcome.precautions.map((p: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[#0D0D0C] border border-[#5C5549]/40 rounded-sm text-xs text-[#898276]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mahadasha & Antardasha Section */}
          {mahadasha && currentAD && (
            <div className="p-6 sm:p-8 bg-[#161411]/90 border border-[#B08A57]/30 rounded-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#B08A57]/20">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A57] block">
                    ACTIVE PLANETARY PERIOD
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#F7F3EB]">
                    {PLANET_MAP[mahadasha.number]?.planet} Mahadasha · {PLANET_MAP[currentAD.number]?.planet} Antardasha
                  </h3>
                </div>
                <div className="text-right font-mono text-xs text-[#898276]">
                  Cycle: {mahadasha.startYear} — {mahadasha.endYear}
                </div>
              </div>

              {/* Mahadasha Outcome Description from JSON */}
              {adOutcome && (
                <div className="p-5 bg-[#0D0D0C]/80 border border-[#B08A57]/20 rounded-sm space-y-2">
                  {adOutcome.hindi && (
                    <p className="font-serif text-base text-[#D4B58A] italic">
                      &quot;{adOutcome.hindi}&quot;
                    </p>
                  )}
                  <p className="text-xs text-[#E8E0D2] leading-relaxed">
                    {adOutcome.description}
                  </p>
                </div>
              )}

              {/* Antardasha Timeline Toggle */}
              <div>
                <button
                  onClick={() => setAdTableOpen(!adTableOpen)}
                  className="font-mono text-xs uppercase tracking-wider text-[#B08A57] hover:text-[#F7F3EB] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>{adTableOpen ? '▼ Hide' : '► View'} Complete 9-Cycle Antardasha Timeline</span>
                </button>

                {adTableOpen && (
                  <div className="mt-4 overflow-x-auto border border-[#B08A57]/20 rounded-sm">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#1B1915] text-[#898276] uppercase text-[10px] tracking-wider border-b border-[#B08A57]/20">
                        <tr>
                          <th className="p-3">Num</th>
                          <th className="p-3">Planet</th>
                          <th className="p-3">Duration (Days)</th>
                          <th className="p-3">Start Date</th>
                          <th className="p-3">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1B1915]">
                        {antardashaPeriods.map((period, idx) => {
                          const isActive = period.number === currentAD.number;
                          return (
                            <tr
                              key={idx}
                              className={isActive ? 'bg-[#B08A57]/15 text-[#F7F3EB] font-bold' : 'text-[#898276]'}
                            >
                              <td className="p-3">
                                {isActive && <span className="text-[#B08A57] mr-1">✦</span>}
                                {period.number}
                              </td>
                              <td className="p-3">
                                {PLANET_MAP[period.number]?.planet} {PLANET_MAP[period.number]?.symbol}
                              </td>
                              <td className="p-3">{period.durationDays}</td>
                              <td className="p-3">
                                {period.startDate.toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-3">
                                {period.endDate.toLocaleDateString('en-GB')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NumerologyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[#898276]">Aligning celestial matrix...</div>}>
      <NumerologyContent />
    </Suspense>
  );
}
