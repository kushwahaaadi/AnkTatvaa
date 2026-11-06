'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { reduceToSingle } from '@/lib/numerology';
import AnimatedNumber from '@/components/AnimatedNumber';
import SpotlightCard from '@/components/SpotlightCard';

export default function HomePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dailyNumber, setDailyNumber] = useState(1);
  const [dailyText, setDailyText] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Auto-format DOB input (DD/MM/YYYY)
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = '';
    if (val.length > 0) formatted += val.slice(0, 2);
    if (val.length > 2) formatted += '/' + val.slice(2, 4);
    if (val.length > 4) formatted += '/' + val.slice(4, 8);
    setDob(formatted);
  };

  // Compute Universal Day number
  useEffect(() => {
    const DAY_MEANINGS: Record<number, string> = {
      1: 'A day of new beginnings & bold initiative — plant the seeds of your desires today.',
      2: 'A day of harmony, partnerships & divine patience — collaborate and listen deeply.',
      3: 'A day of creative expression & cosmic joy — let your voice and art flow freely.',
      4: 'A day of discipline, structure & earthly work — build with steady cosmic intention.',
      5: 'A day of freedom, change & adventure — embrace the unexpected gifts of the cosmos.',
      6: 'A day of love, family & cosmic responsibility — nurture those around you with grace.',
      7: 'A day of spiritual reflection & inner wisdom — meditate, seek truth, go within.',
      8: 'A day of power, abundance & karmic balance — take decisive action toward your goals.',
      9: 'A day of completion, compassion & universal love — release what no longer serves you.',
    };

    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = String(today.getFullYear()).split('').reduce((a, c) => a + Number(c), 0);
    const raw = reduceToSingle(d) + reduceToSingle(m) + y;
    const universalDay = reduceToSingle(raw);

    setDailyNumber(universalDay);
    setDailyText(DAY_MEANINGS[universalDay] || DAY_MEANINGS[1]);
    setCurrentDateStr(today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() && !dob.trim()) {
      router.push('/numerology');
      return;
    }

    if (!fullName.trim() || !dob.trim()) {
      setErrorMsg('◈ Please enter both your full name and date of birth');
      return;
    }

    const params = new URLSearchParams();
    params.set('name', fullName.trim());
    params.set('dob', dob.trim());
    if (phone.trim()) params.set('phone', phone.trim());
    if (challenge.trim()) params.set('challenge', challenge.trim());

    router.push(`/numerology?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen">
      {/* ── HERO SECTION ── */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Decorative Geometric Glyph */}
        <div className="w-16 h-16 mb-6 flex items-center justify-center border border-[#B08A57]/30 rounded-full bg-[#1B1915]/60 backdrop-blur-md">
          <span className="text-2xl text-[#B08A57]">✦</span>
        </div>

        {/* Eyebrow */}
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#B08A57] mb-4">
          VEDIC NUMEROLOGICAL ARCHITECTURE · CHALDEAN FREQUENCIES
        </p>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F7F3EB] max-w-4xl leading-[1.1] mb-6">
          The Universe Speaks <br className="hidden sm:inline" />
          <span className="text-[#B08A57] italic">In Numbers.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="font-sans text-base sm:text-lg text-[#898276] max-w-2xl leading-relaxed mb-12">
          Discover your cosmic blueprint, Life Path frequency, planetary Mahadasha cycles, and Chaldean name resonance through ancient Vedic mathematical principles.
        </p>

        {/* ── HERO INPUT CARD ── */}
        <SpotlightCard className="w-full max-w-2xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] text-left mb-16">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#B08A57]/20">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E8E0D2] flex items-center gap-2">
              <span className="text-[#B08A57]">◈</span>
              <span>Seeker Blueprint Calculation</span>
            </span>
            <span className="font-mono text-[11px] text-[#898276]">
              Instant Celestial Synthesis
            </span>
          </div>

          <form onSubmit={handleHeroSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                  Full Name <span className="text-[#B08A57]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aditya Kushwaha"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0D0D0C]/90 border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57] transition-colors"
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
                  className="w-full bg-[#0D0D0C]/90 border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0D0D0C]/90 border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                  Area of Guidance (Optional)
                </label>
                <select
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  className="w-full bg-[#0D0D0C]/90 border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] focus:outline-none focus:border-[#B08A57] transition-colors"
                >
                  <option value="">General Life Path Analysis</option>
                  <option value="career">Career & Financial Expansion</option>
                  <option value="relationships">Relationship Harmony</option>
                  <option value="health">Vitality & Planetary Balance</option>
                  <option value="spiritual">Spiritual Awakening & Purpose</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <p className="font-mono text-xs text-[#d97706] tracking-wider">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#B08A57] hover:bg-[#c49e6a] text-[#0D0D0C] font-mono text-xs font-semibold tracking-widest uppercase rounded-sm transition-all duration-200 shadow-[0_4px_24px_rgba(176,138,87,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Vedic Matrix</span>
              <span>→</span>
            </button>
          </form>
        </SpotlightCard>

        {/* ── DAILY COSMIC VIBRATION BANNER ── */}
        <SpotlightCard className="w-full max-w-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row items-center gap-5 text-left mb-20">
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border border-[#B08A57]/40 rounded-full bg-[#0D0D0C]">
            <span className="font-mono text-3xl font-bold text-[#B08A57]">
              <AnimatedNumber value={dailyNumber} duration={1000} />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08A57]">
                Universal Daily Vibration
              </span>
              <span className="text-xs text-[#898276]">·</span>
              <span className="text-[11px] font-mono text-[#898276]">
                {currentDateStr || 'Today'}
              </span>
            </div>
            <p className="text-xs text-[#E8E0D2] leading-relaxed">
              {dailyText}
            </p>
          </div>
        </SpotlightCard>
      </section>

      {/* ── TOOLS DIRECTORY ── */}
      <section id="features" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto border-t border-[#B08A57]/20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#B08A57] mb-2">
            THE SACRED PENTAD
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F7F3EB] mb-4">
            Five Pillars of Vedic Insight
          </h2>
          <p className="text-sm text-[#898276]">
            Every dimension of your life carries distinct numerical signatures. Explore the dedicated calculation suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool 1 */}
          <Link href="/numerology" className="group">
            <SpotlightCard className="h-full p-6 hover:border-[#B08A57]/60">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#B08A57]">01 · ☉ / ☽</span>
                <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F7F3EB] group-hover:text-[#B08A57] transition-colors mb-2">
                Vedic Numerology & Mahadasha
              </h3>
              <p className="text-xs text-[#898276] leading-relaxed">
                Calculates your Birth Number (Moolank), Destiny Number (Bhagyank), 3x3 Universal Grid, and planetary Mahadasha & Antardasha timelines.
              </p>
            </SpotlightCard>
          </Link>

          {/* Tool 2 */}
          <Link href="/name-vibration" className="group">
            <SpotlightCard className="h-full p-6 hover:border-[#B08A57]/60">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#B08A57]">02 · ☿</span>
                <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F7F3EB] group-hover:text-[#B08A57] transition-colors mb-2">
                Name Vibration & Shadow Matrix
              </h3>
              <p className="text-xs text-[#898276] leading-relaxed">
                Unveil your compound letter frequency using authentic Chaldean values and calculate your hidden Inverted Pyramid Shadow Number.
              </p>
            </SpotlightCard>
          </Link>

          {/* Tool 3 */}
          <Link href="/compatibility" className="group">
            <SpotlightCard className="h-full p-6 hover:border-[#B08A57]/60">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#B08A57]">03 · ♀</span>
                <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F7F3EB] group-hover:text-[#B08A57] transition-colors mb-2">
                Dual Profile Compatibility
              </h3>
              <p className="text-xs text-[#898276] leading-relaxed">
                Cross-examine two souls through Life Path frequencies and Name numbers to evaluate twin-flame, soulmate, or karmic resonance.
              </p>
            </SpotlightCard>
          </Link>

          {/* Tool 4 */}
          <Link href="/health-tendencies" className="group">
            <SpotlightCard className="h-full p-6 hover:border-[#B08A57]/60">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#B08A57]">04 · ♃</span>
                <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F7F3EB] group-hover:text-[#B08A57] transition-colors mb-2">
                Planetary Vitality & Health
              </h3>
              <p className="text-xs text-[#898276] leading-relaxed">
                Understand constitutional predispositions and lifestyle balance techniques associated with your governing planetary ruler.
              </p>
            </SpotlightCard>
          </Link>

          {/* Tool 5 */}
          <Link href="/phone-vibration" className="group">
            <SpotlightCard className="h-full p-6 hover:border-[#B08A57]/60">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#B08A57]">05 · ♄</span>
                <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F7F3EB] group-hover:text-[#B08A57] transition-colors mb-2">
                Phone Number Vibration
              </h3>
              <p className="text-xs text-[#898276] leading-relaxed">
                Analyze whether your mobile digits harmonize with your Birth and Destiny numbers or generate conflicting planetary friction.
              </p>
            </SpotlightCard>
          </Link>

          {/* Seeker Dashboard Portal */}
          <Link href="/dashboard" className="group">
            <SpotlightCard className="h-full p-6 hover:border-[#B08A57]/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-[#B08A57]">✦ CLOUD VAULT</span>
                  <span className="text-xs text-[#898276] group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#F7F3EB] group-hover:text-[#B08A57] transition-colors mb-2">
                  Seeker Dashboard & Storage
                </h3>
                <p className="text-xs text-[#898276] leading-relaxed">
                  Access your archived readings, export full PDF records to free Firebase Cloud Storage, and manage your seeker profile.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#B08A57]/15 text-[11px] font-mono text-[#B08A57]">
                Firebase Spark Powered · 5GB Free Cloud Archive
              </div>
            </SpotlightCard>
          </Link>
        </div>
      </section>
    </div>
  );
}
