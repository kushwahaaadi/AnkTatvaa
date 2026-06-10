/* ══════════════════════════════════════
   COSMOS CANVAS — DEEP SPACE STARFIELD
══════════════════════════════════════ */
const canvas = document.getElementById('cosmos');
const ctx    = canvas.getContext('2d');
let W, H;
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

// ── Helpers ──
const rnd  = (a, b) => a + Math.random() * (b - a);
const rndI = (a, b) => (a + Math.random() * (b - a)) | 0;

// Star colour presets [r, g, b]
const STAR_COLORS = [
  [255, 255, 255],  // pure white
  [220, 240, 255],  // ice blue-white
  [200, 225, 255],  // pale blue
  [255, 245, 210],  // warm white
  [180, 210, 255],  // steel blue
  [255, 220, 160],  // golden amber (rare)
];
const randColor = () => STAR_COLORS[Math.random() < 0.08 ? 5 : rndI(0, 5)];

// ── LAYER 1: 400 tiny distant stars ──
const starsDeep = Array.from({ length: 400 }, () => {
  const [r, g, b] = randColor();
  return { x: Math.random(), y: Math.random(), r: rnd(0.3, 0.85),
           t: rnd(0, Math.PI * 2), sp: rnd(0.004, 0.010), r_: r, g_: g, b_: b };
});

// ── LAYER 2: 180 medium twinkling stars ──
const starsMid = Array.from({ length: 180 }, () => {
  const [r, g, b] = randColor();
  return { x: Math.random(), y: Math.random(), r: rnd(0.9, 1.8),
           t: rnd(0, Math.PI * 2), sp: rnd(0.007, 0.018), r_: r, g_: g, b_: b };
});

// ── LAYER 3: 55 bright stars with glint crosses ──
const starsBright = Array.from({ length: 55 }, () => {
  const [r, g, b] = randColor();
  return { x: Math.random(), y: Math.random(), r: rnd(1.6, 2.8),
           t: rnd(0, Math.PI * 2), sp: rnd(0.010, 0.022),
           r_: r, g_: g, b_: b, glint: Math.random() < 0.5 };
});

// ── Milky Way band: 200 micro-stars on a diagonal ──
const milkyWay = Array.from({ length: 200 }, () => {
  const along = Math.random(), off = rnd(-0.07, 0.07);
  return { x: along * 1.3 - 0.1 + off * 0.4, y: along * 0.55 + 0.2 + off,
           r: rnd(0.15, 0.55), a: rnd(0.07, 0.28) };
});

// ── Nebula clouds ──
const nebulae = [
  { x: 0.12, y: 0.18, r: 0.42, c: '0,100,200',   a: 0.07, t: 0,   sp: 0.00025 },
  { x: 0.80, y: 0.58, r: 0.35, c: '120,30,180',  a: 0.08, t: 1.4, sp: 0.00018 },
  { x: 0.50, y: 0.04, r: 0.30, c: '0,180,220',   a: 0.06, t: 0.7, sp: 0.00030 },
  { x: 0.28, y: 0.80, r: 0.28, c: '80,0,160',    a: 0.07, t: 2.0, sp: 0.00022 },
  { x: 0.88, y: 0.12, r: 0.24, c: '20,120,255',  a: 0.06, t: 0.3, sp: 0.00020 },
  { x: 0.60, y: 0.85, r: 0.22, c: '160,0,255',   a: 0.05, t: 1.1, sp: 0.00028 },
  { x: 0.38, y: 0.42, r: 0.18, c: '0,60,160',    a: 0.04, t: 0.5, sp: 0.00015 },
  { x: 0.70, y: 0.30, r: 0.16, c: '60,0,200',    a: 0.04, t: 1.8, sp: 0.00032 },
];

// ── Shooting stars ──
const shoots = [];
function spawnShoot() {
  const angle = Math.random() < 0.7 ? 0.45 : rnd(0.15, 0.65);
  shoots.push({ x: rnd(0, 0.75), y: rnd(0, 0.45), len: rnd(0.07, 0.15),
                spd: rnd(0.004, 0.008), angle, life: 1,
                decay: rnd(0.013, 0.022), width: rnd(1, 2) });
}
setInterval(() => spawnShoot(), 2500);
setTimeout(spawnShoot, 600);
setTimeout(spawnShoot, 2000);

/* ── Main draw loop ── */
function drawCosmos() {
  ctx.clearRect(0, 0, W, H);

  // Deep space gradient background
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0,   '#020812');
  grd.addColorStop(0.5, '#050a18');
  grd.addColorStop(1,   '#02050f');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Milky Way band
  for (const m of milkyWay) {
    ctx.beginPath();
    ctx.arc(m.x * W, m.y * H, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,210,255,${m.a})`;
    ctx.fill();
  }

  // Nebula clouds
  for (const n of nebulae) {
    n.t += n.sp;
    const nx = n.x * W + Math.sin(n.t * 1.2) * W * 0.03;
    const ny = n.y * H + Math.cos(n.t)       * H * 0.025;
    const gr = ctx.createRadialGradient(nx, ny, 0, nx, ny, W * n.r);
    gr.addColorStop(0,   `rgba(${n.c},${n.a})`);
    gr.addColorStop(0.5, `rgba(${n.c},${+(n.a * 0.4).toFixed(3)})`);
    gr.addColorStop(1,   'transparent');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }

  // LAYER 1 — tiny distant stars
  for (const s of starsDeep) {
    s.t += s.sp;
    const a = 0.4 + 0.55 * Math.abs(Math.sin(s.t));
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();
  }

  // LAYER 2 — medium twinkling stars
  for (const s of starsMid) {
    s.t += s.sp;
    const a = 0.55 + 0.45 * Math.abs(Math.sin(s.t));
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();
  }

  // LAYER 3 — bright stars with halo + optional glint cross
  for (const s of starsBright) {
    s.t += s.sp;
    const a  = 0.8 + 0.2 * Math.abs(Math.sin(s.t));
    const sx = s.x * W, sy = s.y * H;

    // Soft glow halo
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 5);
    halo.addColorStop(0, `rgba(${s.r_},${s.g_},${s.b_},${(a * 0.4).toFixed(2)})`);
    halo.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(sx, sy, s.r * 5, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();

    // 4-point sparkle cross
    if (s.glint) {
      const arm = s.r * (4 + 2 * Math.abs(Math.sin(s.t * 0.4)));
      const ga  = (a * 0.65).toFixed(2);
      const col = `rgba(${s.r_},${s.g_},${s.b_},${ga})`;
      ctx.lineWidth = 0.7;
      ctx.lineCap   = 'round';
      const hg = ctx.createLinearGradient(sx - arm, sy, sx + arm, sy);
      hg.addColorStop(0, 'transparent'); hg.addColorStop(0.5, col); hg.addColorStop(1, 'transparent');
      ctx.strokeStyle = hg;
      ctx.beginPath(); ctx.moveTo(sx - arm, sy); ctx.lineTo(sx + arm, sy); ctx.stroke();
      const vg = ctx.createLinearGradient(sx, sy - arm, sx, sy + arm);
      vg.addColorStop(0, 'transparent'); vg.addColorStop(0.5, col); vg.addColorStop(1, 'transparent');
      ctx.strokeStyle = vg;
      ctx.beginPath(); ctx.moveTo(sx, sy - arm); ctx.lineTo(sx, sy + arm); ctx.stroke();
    }
  }

  // Shooting stars
  for (let i = shoots.length - 1; i >= 0; i--) {
    const s = shoots[i];
    s.x   += s.spd;
    s.y   += s.spd * s.angle;
    s.life -= s.decay;
    if (s.life <= 0) { shoots.splice(i, 1); continue; }
    const x1 = s.x * W, y1 = s.y * H;
    const x2 = (s.x - s.len) * W, y2 = (s.y - s.len * s.angle) * H;
    const sg = ctx.createLinearGradient(x2, y2, x1, y1);
    sg.addColorStop(0,   'transparent');
    sg.addColorStop(0.6, `rgba(180,230,255,${(s.life * 0.55).toFixed(2)})`);
    sg.addColorStop(1,   `rgba(240,250,255,${(s.life * 0.95).toFixed(2)})`);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x1, y1);
    ctx.strokeStyle = sg; ctx.lineWidth = s.width; ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x1, y1, s.width * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,250,255,${(s.life * 0.9).toFixed(2)})`;
    ctx.fill();
  }

  requestAnimationFrame(drawCosmos);
}
drawCosmos();

/* ══════════════════════════════════════
   NUMEROLOGY CALCULATIONS
══════════════════════════════════════ */

const CHALDEAN = {
  A:1, B:2, C:3, D:4, E:5, F:8, G:3, H:5, I:1, J:1, K:2,
  L:3, M:4, N:5, O:7, P:8, Q:1, R:2, S:3, T:4, U:6, V:6,
  W:6, X:5, Y:1, Z:7
};

function reduceNum(n, preserveMaster = true) {
  if (preserveMaster && (n === 11 || n === 22 || n === 33)) return n;
  if (n < 10) return n;
  const next = String(n).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceNum(next, preserveMaster);
}

function lifePathNumber(dob) {
  const d   = new Date(dob);
  const day = d.getDate();
  const mon = d.getMonth() + 1;
  const yr  = String(d.getFullYear()).split('').reduce((a, c) => a + parseInt(c, 10), 0);
  return reduceNum(reduceNum(day) + reduceNum(mon) + yr);
}

function nameNumber(name) {
  const cleaned = name.toUpperCase().replace(/[^A-Z]/g, '');
  const sum = cleaned.split('').reduce((a, c) => a + (CHALDEAN[c] || 0), 0);
  return reduceNum(sum);
}

function phoneNumber(ph) {
  const digits = ph.replace(/\D/g, '');
  const sum    = digits.split('').reduce((a, c) => a + parseInt(c, 10), 0);
  return reduceNum(sum);
}

function personalYearNumber(dob) {
  const d      = new Date(dob);
  const currYr = new Date().getFullYear();
  const yrDigs = String(currYr).split('').reduce((a, c) => a + parseInt(c, 10), 0);
  return reduceNum(reduceNum(d.getDate()) + reduceNum(d.getMonth() + 1) + yrDigs);
}

/* ══════════════════════════════════════
   LOADING MESSAGE CYCLING
══════════════════════════════════════ */
const LOADING_MSGS = [
  "Aligning the constellations...",
  "Calculating your stellar blueprint...",
  "Scanning the star chart...",
  "Mapping planetary positions...",
  "Decoding your cosmic coordinates...",
  "Consulting the celestial archives...",
  "Reading the orbital patterns...",
  "Charting your galactic path..."
];
let loadIdx = 0;

function cycleLoading() {
  const el = document.getElementById('loadingText');
  if (el) el.textContent = LOADING_MSGS[loadIdx % LOADING_MSGS.length];
  loadIdx++;
}

/* ══════════════════════════════════════
   MAIN READING FUNCTION
══════════════════════════════════════ */
async function doReading() {
  const name      = document.getElementById('fname').value.trim();
  const dob       = document.getElementById('fdob').value;
  const phone     = document.getElementById('fphone').value.trim();
  const challenge = document.getElementById('fchallenge').value.trim();
  const errEl     = document.getElementById('errMsg');

  errEl.textContent = '';

  if (!name || !dob || !phone) {
    errEl.textContent = '◈ Please fill your name, date of birth and phone number';
    return;
  }
  if (phone.replace(/\D/g, '').length < 6) {
    errEl.textContent = '◈ Please enter a valid phone number (minimum 6 digits)';
    return;
  }

  const lp = lifePathNumber(dob);
  const nn = nameNumber(name);
  const pn = phoneNumber(phone);
  const py = personalYearNumber(dob);

  document.getElementById('submitBtn').disabled = true;
  document.getElementById('loadingDiv').style.display = 'block';
  document.getElementById('result-section').style.display = 'none';
  const loadInterval = setInterval(cycleLoading, 1800);

  try {
    const currentYear = new Date().getFullYear();

    const prompt = `You are an ancient Vedic numerology sage with mastery of Chaldean numerology, Pythagorean methods, Vedic astro-numerology, and Sanskrit sacred texts. A seeker has approached you.

Seeker's Details:
- Full Name: ${name}
- Date of Birth: ${dob}
- Phone Number: ${phone}
- Their stated current challenge: ${challenge || 'general life reading — reveal what is currently causing them difficulty'}

Calculated Sacred Numbers:
- Life Path Number: ${lp}
- Chaldean Name Number: ${nn}
- Phone Vibration Number: ${pn}
- Personal Year Number (${currentYear}): ${py}

Provide a HIGHLY SPECIFIC, deeply personal numerological reading. Focus on what is CURRENTLY going wrong or challenging in their life and WHY, based on the numerological analysis. Reference dharma, karma, yugas, chakras and Vedic concepts naturally.

Respond ONLY with a valid JSON object (no markdown, no extra text) with exactly these five keys:

{
  "current_situation": "3-4 sentences. Be very specific about what the combination of their Life Path ${lp} and Personal Year ${py} reveals about their current struggles, obstacles and why this period feels difficult.",
  "phone_influence": "2-3 sentences. Explain how their phone vibration number ${pn} interacts with their name number ${nn} — is it harmonious or discordant? How does this affect their daily energy, decisions and relationships?",
  "present_cycle": "2-3 sentences. Explain the Personal Year ${py} cycle they are in during ${currentYear} — what karmic lessons, transitions or tests this year is bringing, and when the energy will shift.",
  "chakra_block": "2 sentences. Identify the specific chakra most affected by their Life Path ${lp} and current Personal Year ${py}. Name the physical and emotional symptoms this blockage produces in daily life.",
  "remedy": "4 sentences. Give precise, actionable Vedic remedies — include: a specific mantra to chant with number of repetitions, a gemstone or crystal, a colour to wear on a specific day, and a simple daily ritual aligned to their numbers."
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data    = await response.json();
    const rawText = data.content.map(item => item.text || "").join("");
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let reading;
    try {
      reading = JSON.parse(cleaned);
    } catch (_) {
      reading = {
        current_situation: "Your Life Path number reveals a powerful confluence of karmic energies demanding your attention this cycle. The universe has positioned specific tests along your path to accelerate your soul's evolution. Current difficulties are not random — they are precisely calibrated to dissolve the old patterns that no longer serve your dharmic purpose.",
        phone_influence:   "Your phone number carries a vibrational dissonance with your name number, subtly draining your mental clarity and decision-making energy each day. This discordant frequency may be contributing to misunderstandings in communication and delayed outcomes in matters you initiate.",
        present_cycle:     "Your current Personal Year places you in a period of deep transformation and inner reckoning. Old structures in your career and relationships must dissolve before new ones aligned with your true dharma can emerge. This cycle demands surrender rather than force.",
        chakra_block:      "Your heart chakra shows significant restriction, manifesting as emotional guardedness, difficulty receiving support, and a subtle sense of isolation. This blockage is also suppressing the natural flow of abundance and meaningful connection into your life.",
        remedy:            "Chant 'Om Namah Shivaya' 108 times each morning before sunrise to clear karmic residue. Wear deep indigo or violet on Saturdays to strengthen your intuitive faculties. Place an amethyst crystal at your workspace to neutralise discordant phone vibrations. Each evening, light a ghee lamp and sit in silence for 9 minutes — this simple ritual will begin to restore your chakra balance within 21 days."
      };
    }

    clearInterval(loadInterval);
    document.getElementById('loadingDiv').style.display = 'none';
    document.getElementById('res-name').textContent = name;
    document.getElementById('res-numbers').innerHTML = `
      <div class="num-badge"><div class="num-val">${lp}</div><div class="num-label">Life Path</div></div>
      <div class="num-badge"><div class="num-val">${nn}</div><div class="num-label">Name Number</div></div>
      <div class="num-badge"><div class="num-val">${pn}</div><div class="num-label">Phone Vibration</div></div>
      <div class="num-badge"><div class="num-val">${py}</div><div class="num-label">Personal Year</div></div>
    `;

    const sections = [
      { title: "◈ What Is Currently Afflicting You",  key: "current_situation" },
      { title: "✦ Your Phone's Hidden Influence",     key: "phone_influence"   },
      { title: "◉ Your Present Cosmic Cycle",         key: "present_cycle"     },
      { title: "⚡ Chakra Blockage Revealed",         key: "chakra_block"      },
      { title: "☽ Vedic Remedies Prescribed For You", key: "remedy"            },
    ];

    document.getElementById('res-reading').innerHTML = sections.map(s => `
      <div class="reading-block">
        <p class="reading-title">${s.title}</p>
        <p class="reading-text">${reading[s.key] || ''}</p>
      </div>
    `).join('');

    document.getElementById('result-section').style.display = 'block';
    setTimeout(() => {
      document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } catch (error) {
    clearInterval(loadInterval);
    document.getElementById('loadingDiv').style.display = 'none';
    document.getElementById('errMsg').textContent = '◈ The cosmic connection wavered — please try again';
    console.error('Reading error:', error);
  }

  document.getElementById('submitBtn').disabled = false;
}

/* ══════════════════════════════════════
   DAILY COSMIC NUMBER
══════════════════════════════════════ */
(function initDailyCosmicNumber() {
  const DAY_MEANINGS = {
    1: { color: '#f59e0b', msg: 'A day of new beginnings & bold initiative — plant the seeds of your desires today.' },
    2: { color: '#a5f3fc', msg: 'A day of harmony, partnerships & divine patience — collaborate and listen deeply.' },
    3: { color: '#f9a8d4', msg: 'A day of creative expression & cosmic joy — let your voice and art flow freely.' },
    4: { color: '#6ee7b7', msg: 'A day of discipline, structure & earthly work — build with steady cosmic intention.' },
    5: { color: '#00d4ff', msg: 'A day of freedom, change & adventure — embrace the unexpected gifts of the cosmos.' },
    6: { color: '#c084fc', msg: 'A day of love, family & cosmic responsibility — nurture those around you with grace.' },
    7: { color: '#818cf8', msg: 'A day of spiritual reflection & inner wisdom — meditate, seek truth, go within.' },
    8: { color: '#f87171', msg: 'A day of power, abundance & karmic balance — take decisive action toward your goals.' },
    9: { color: '#fbbf24', msg: 'A day of completion, compassion & universal love — release what no longer serves you.' },
    11: { color: '#00d4ff', msg: 'A Master Number day — heightened intuition and spiritual illumination surround you.' },
    22: { color: '#a855f7', msg: 'A Master Builder day — your dreams have cosmic backing to be made manifest today.' },
  };

  const today = new Date();
  const d = today.getDate();
  const m = today.getMonth() + 1;
  const y = String(today.getFullYear()).split('').reduce((a, c) => a + +c, 0);
  const raw = reduceNum(d) + reduceNum(m) + y;
  const universalDay = reduceNum(raw);

  const meaning = DAY_MEANINGS[universalDay] || DAY_MEANINGS[reduceNum(universalDay)];
  const numEl = document.getElementById('dailyNum');
  const msgEl = document.getElementById('dailyMsg');

  if (numEl) {
    numEl.textContent = universalDay;
    numEl.style.background = `linear-gradient(135deg, ${meaning.color}, #a855f7)`;
    numEl.style.webkitBackgroundClip = 'text';
    numEl.style.webkitTextFillColor = 'transparent';
    numEl.style.backgroundClip = 'text';
  }
  if (msgEl) msgEl.textContent = meaning.msg;
})();

/* ══════════════════════════════════════
   COMPATIBILITY CHECKER
══════════════════════════════════════ */
const COMPAT_TABLE = {
  // [lp1][lp2] → base score 0-100
  harmonious: new Set([
    '1-5','5-1','1-3','3-1','2-6','6-2','2-4','4-2','3-9','9-3',
    '4-8','8-4','6-9','9-6','7-11','11-7','1-9','9-1','2-8','8-2'
  ]),
  challenging: new Set([
    '1-8','8-1','2-7','7-2','3-6','6-3','4-5','5-4','5-7','7-5'
  ]),
};

function compatScore(lp1, lp2, nn1, nn2) {
  const key = `${lp1}-${lp2}`;
  const keyR = `${lp2}-${lp1}`;

  let base = 60; // neutral start
  if (COMPAT_TABLE.harmonious.has(key) || COMPAT_TABLE.harmonious.has(keyR)) base = 82;
  if (COMPAT_TABLE.challenging.has(key) || COMPAT_TABLE.challenging.has(keyR)) base = 44;

  // Same life path — deep resonance
  if (lp1 === lp2) base = Math.min(base + 10, 96);

  // Name number harmony — add ±8
  const nnDiff = Math.abs(nn1 - nn2);
  if (nnDiff === 0) base = Math.min(base + 8, 98);
  else if (nnDiff <= 2) base = Math.min(base + 4, 98);
  else if (nnDiff >= 6) base = Math.max(base - 6, 20);

  // Keep between 20–98 for realism
  return Math.max(20, Math.min(98, base));
}

function verdictText(score, lp1, lp2, name1, name2) {
  if (score >= 85) {
    return {
      label: '✨ Twin Flame Resonance',
      color: '#a855f7',
      text: `${name1} and ${name2} share an extraordinarily rare cosmic bond. Your Life Paths ${lp1} and ${lp2} create a sacred harmonic — the universe deliberately wove your souls together. This connection carries deep karmic completion and mutual spiritual acceleration.`
    };
  } else if (score >= 72) {
    return {
      label: '🌟 Soulmate Alignment',
      color: '#00d4ff',
      text: `${name1} and ${name2} hold a powerful soulmate vibration. Your numbers complement each other beautifully, supporting growth, trust and shared dharmic purpose. The stars smile upon this union.`
    };
  } else if (score >= 58) {
    return {
      label: '⚡ Magnetic Connection',
      color: '#38bdf8',
      text: `${name1} and ${name2} generate genuine magnetic energy together. There are areas of natural flow and areas that will challenge you to grow. With conscious effort and understanding of each other's cosmic blueprint, this bond strengthens over time.`
    };
  } else if (score >= 40) {
    return {
      label: '🌀 Karmic Lesson Bond',
      color: '#f59e0b',
      text: `${name1} and ${name2} share a karmic lesson relationship. The friction between your numbers is not random — the universe has brought you together for mutual spiritual growth. Understanding each other's Life Path is the key to transformation.`
    };
  } else {
    return {
      label: '🔥 Cosmic Growth Challenge',
      color: '#f87171',
      text: `${name1} and ${name2} carry strongly contrasting cosmic energies. This bond will require significant patience and spiritual maturity. However, great souls forge great lessons — and such unions, when navigated with awareness, can be profoundly transformative.`
    };
  }
}

function checkCompatibility() {
  const name1 = document.getElementById('c1name').value.trim();
  const dob1  = document.getElementById('c1dob').value;
  const name2 = document.getElementById('c2name').value.trim();
  const dob2  = document.getElementById('c2dob').value;
  const errEl = document.getElementById('compatErr');

  errEl.textContent = '';

  if (!name1 || !dob1 || !name2 || !dob2) {
    errEl.textContent = '◈ Please fill all four fields for both souls';
    return;
  }

  const lp1 = lifePathNumber(dob1);
  const lp2 = lifePathNumber(dob2);
  const nn1 = nameNumber(name1);
  const nn2 = nameNumber(name2);
  const score = compatScore(lp1, lp2, nn1, nn2);
  const verdict = verdictText(score, lp1, lp2, name1, name2);

  // Show result
  const resultEl = document.getElementById('compatResult');
  resultEl.classList.add('visible');

  // Animate score counter
  const scoreEl = document.getElementById('compatScore');
  let current = 0;
  const step = Math.ceil(score / 60);
  const counter = setInterval(() => {
    current = Math.min(current + step, score);
    scoreEl.textContent = current;
    if (current >= score) clearInterval(counter);
  }, 20);

  // Animate arc — circumference = 2π × 52 ≈ 327
  const arc = document.getElementById('compatArc');
  setTimeout(() => {
    const offset = 327 - (327 * score / 100);
    arc.style.strokeDashoffset = offset;
  }, 100);

  // Details grid
  const details = document.getElementById('compatDetails');
  details.innerHTML = `
    <div class="compat-detail-card">
      <span class="compat-detail-icon">🌟</span>
      <p class="compat-detail-title">${name1.split(' ')[0]}'s Life Path</p>
      <p class="compat-detail-val">${lp1}</p>
    </div>
    <div class="compat-detail-card">
      <span class="compat-detail-icon">🌙</span>
      <p class="compat-detail-title">${name2.split(' ')[0]}'s Life Path</p>
      <p class="compat-detail-val">${lp2}</p>
    </div>
    <div class="compat-detail-card">
      <span class="compat-detail-icon">✨</span>
      <p class="compat-detail-title">${name1.split(' ')[0]}'s Name Number</p>
      <p class="compat-detail-val">${nn1}</p>
    </div>
    <div class="compat-detail-card">
      <span class="compat-detail-icon">⭐</span>
      <p class="compat-detail-title">${name2.split(' ')[0]}'s Name Number</p>
      <p class="compat-detail-val">${nn2}</p>
    </div>
    <div class="compat-verdict" style="grid-column:1/-1">
      <p class="compat-verdict-title" style="color:${verdict.color}">${verdict.label}</p>
      <p class="compat-verdict-text">${verdict.text}</p>
    </div>
  `;

  // Smooth scroll to result
  setTimeout(() => {
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 150);
}
