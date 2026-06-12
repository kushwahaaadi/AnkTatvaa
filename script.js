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

// ── LAYER 1: 150 tiny distant stars ──
const starsDeep = Array.from({ length: 150 }, () => {
  const [r, g, b] = randColor();
  return { x: Math.random(), y: Math.random(), r: rnd(0.3, 0.85),
           t: rnd(0, Math.PI * 2), sp: rnd(0.004, 0.010), r_: r, g_: g, b_: b };
});

// ── LAYER 2: 70 medium twinkling stars ──
const starsMid = Array.from({ length: 70 }, () => {
  const [r, g, b] = randColor();
  return { x: Math.random(), y: Math.random(), r: rnd(0.9, 1.8),
           t: rnd(0, Math.PI * 2), sp: rnd(0.007, 0.018), r_: r, g_: g, b_: b };
});

// ── LAYER 3: 20 bright stars with glint crosses ──
const starsBright = Array.from({ length: 20 }, () => {
  const [r, g, b] = randColor();
  return { x: Math.random(), y: Math.random(), r: rnd(1.6, 2.8),
           t: rnd(0, Math.PI * 2), sp: rnd(0.010, 0.022),
           r_: r, g_: g, b_: b, glint: Math.random() < 0.5 };
});

// ── Milky Way band: 80 micro-stars on a diagonal ──
const milkyWay = Array.from({ length: 80 }, () => {
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

// ── Mouse parallax tracking ──
let mouseX = 0.5, mouseY = 0.5;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

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

  // Parallax offsets
  const px = (mouseX - 0.5) * 15;
  const py = (mouseY - 0.5) * 10;

  // Milky Way band
  for (const m of milkyWay) {
    ctx.beginPath();
    ctx.arc(m.x * W + px * 0.3, m.y * H + py * 0.3, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,210,255,${m.a})`;
    ctx.fill();
  }

  // Nebula clouds (with parallax)
  for (const n of nebulae) {
    n.t += n.sp;
    const nx = n.x * W + Math.sin(n.t * 1.2) * W * 0.03 + px * 0.8;
    const ny = n.y * H + Math.cos(n.t)       * H * 0.025 + py * 0.6;
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
    ctx.arc(s.x * W + px * 0.15, s.y * H + py * 0.1, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();
  }

  // LAYER 2 — medium twinkling stars
  for (const s of starsMid) {
    s.t += s.sp;
    const a = 0.55 + 0.45 * Math.abs(Math.sin(s.t));
    ctx.beginPath();
    ctx.arc(s.x * W + px * 0.35, s.y * H + py * 0.25, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();
  }

  // LAYER 3 — bright stars with halo + optional glint cross
  for (const s of starsBright) {
    s.t += s.sp;
    const a  = 0.8 + 0.2 * Math.abs(Math.sin(s.t));
    const sx = s.x * W + px * 0.5, sy = s.y * H + py * 0.35;

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
   SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════
   NAVBAR SCROLL SHADOW
══════════════════════════════════════ */
(function initNavScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ══════════════════════════════════════
   BUTTON RIPPLE EFFECT
══════════════════════════════════════ */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.submit-btn, .btn-hero-primary, .btn-nav-signup');
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

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
   NUMBER ESSENCE LOOKUP TABLE
══════════════════════════════════════ */
const NUMBER_ESSENCE = {
  1: { keyword: 'The Leader', planet: 'Sun', symbol: '☉', color: '#f59e0b', desc: 'You are born to lead, innovate, and pioneer. Number 1 carries the energy of the Sun — independence, ambition, and the courage to forge new paths. You are a natural initiator who inspires others through sheer willpower and vision.' },
  2: { keyword: 'The Diplomat', planet: 'Moon', symbol: '☽', color: '#a5f3fc', desc: 'You are the cosmic peacemaker, guided by the Moon. Number 2 embodies sensitivity, intuition, and the gift of harmony. Your strength lies in collaboration, emotional intelligence, and the ability to see both sides of every situation.' },
  3: { keyword: 'The Creative', planet: 'Jupiter', symbol: '♃', color: '#818cf8', desc: 'Blessed by Jupiter, you are a vessel of creative expression and joy. Number 3 radiates optimism, artistic talent, and magnetic communication. You inspire and uplift everyone around you with your natural charisma.' },
  4: { keyword: 'The Builder', planet: 'Rahu', symbol: '☊', color: '#6ee7b7', desc: 'Under the shadow planet Rahu, you are the cosmic architect. Number 4 brings discipline, determination, and the ability to manifest grand visions into reality. Your karmic path demands hard work, but rewards are immense.' },
  5: { keyword: 'The Explorer', planet: 'Mercury', symbol: '☿', color: '#00d4ff', desc: 'Mercury gifts you with restless intelligence and the spirit of adventure. Number 5 craves freedom, change, and diverse experiences. You are a natural communicator, adaptable and quick-witted, thriving on variety.' },
  6: { keyword: 'The Nurturer', planet: 'Venus', symbol: '♀', color: '#f9a8d4', desc: 'Venus blesses you with love, beauty, and cosmic responsibility. Number 6 is the caretaker of the zodiac — devoted to family, harmony, and aesthetic perfection. Your heart is your greatest compass.' },
  7: { keyword: 'The Mystic', planet: 'Ketu', symbol: '☋', color: '#c084fc', desc: 'The shadow planet Ketu guides your path of spiritual depth and inner wisdom. Number 7 is the seeker of truth — introspective, analytical, and drawn to life\'s deeper mysteries. Solitude is where your power regenerates.' },
  8: { keyword: 'The Powerhouse', planet: 'Saturn', symbol: '♄', color: '#38bdf8', desc: 'Saturn shapes you through karma, discipline, and material mastery. Number 8 carries the energy of authority, abundance, and cosmic justice. Your challenges forge you into an unstoppable force of transformation.' },
  9: { keyword: 'The Humanitarian', planet: 'Mars', symbol: '♂', color: '#f87171', desc: 'Mars empowers you with courage, passion, and universal compassion. Number 9 is the number of completion and selfless service. You are a warrior of light, destined to leave a lasting impact on the world.' },
  11: { keyword: 'The Illuminator', planet: 'Moon (Master)', symbol: '☽✦', color: '#a855f7', desc: 'Master Number 11 carries heightened intuition and spiritual illumination. You are a cosmic channel, deeply psychic and sensitive. Your life purpose is to inspire and awaken others through your elevated consciousness.' },
  22: { keyword: 'The Master Builder', planet: 'Rahu (Master)', symbol: '☊✦', color: '#00d4ff', desc: 'Master Number 22 is the most powerful number in numerology — the Master Builder. You have the vision of the 11 combined with the practical ability of the 4. You can literally reshape reality on a grand scale.' },
  33: { keyword: 'The Master Teacher', planet: 'Jupiter (Master)', symbol: '♃✦', color: '#818cf8', desc: 'Master Number 33 is the Master Teacher — the rarest and most spiritually evolved number. You embody unconditional love and healing. Your presence alone elevates the consciousness of those around you.' },
};

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
   MAIN READING FUNCTION (EXPANDED)
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
  const essence = NUMBER_ESSENCE[lp] || NUMBER_ESSENCE[reduceNum(lp, false)];

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
- Ruling Planet: ${essence.planet} (${essence.symbol})

Provide a HIGHLY SPECIFIC, deeply personal numerological reading. Focus on what is CURRENTLY going wrong or challenging in their life and WHY, based on the numerological analysis. Reference dharma, karma, yugas, chakras and Vedic concepts naturally.

Respond ONLY with a valid JSON object (no markdown, no extra text) with exactly these eight keys:

{
  "current_situation": "3-4 sentences. Be very specific about what the combination of their Life Path ${lp} and Personal Year ${py} reveals about their current struggles, obstacles and why this period feels difficult.",
  "phone_influence": "2-3 sentences. Explain how their phone vibration number ${pn} interacts with their name number ${nn} — is it harmonious or discordant? How does this affect their daily energy, decisions and relationships?",
  "present_cycle": "2-3 sentences. Explain the Personal Year ${py} cycle they are in during ${currentYear} — what karmic lessons, transitions or tests this year is bringing, and when the energy will shift.",
  "planetary_ruler": "3-4 sentences. Explain how their ruling planet ${essence.planet} (${essence.symbol}) shapes their personality, career path, and relationships. What are the gifts and challenges of being ruled by this planet? How should they harness this planetary energy right now?",
  "chakra_block": "2 sentences. Identify the specific chakra most affected by their Life Path ${lp} and current Personal Year ${py}. Name the physical and emotional symptoms this blockage produces in daily life.",
  "lucky_elements": {"day": "specific day of the week", "color": "specific color", "gemstone": "specific gemstone name", "direction": "compass direction", "metal": "specific metal"},
  "year_forecast": "3-4 sentences. Give a concise forecast for the remainder of ${currentYear} — what months will be powerful, when to take action vs. retreat, and what the closing energy of the year holds for them.",
  "remedy": "4 sentences. Give precise, actionable Vedic remedies — include: a specific mantra to chant with number of repetitions, a gemstone or crystal, a colour to wear on a specific day, and a simple daily ritual aligned to their numbers."
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
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
        planetary_ruler:   `Your ruling planet ${essence.planet} shapes your core identity with the energy of ${essence.keyword}. This planetary influence gives you remarkable ${lp <= 5 ? 'drive and mental acuity' : 'depth and resilience'}, but can also create periods of intense internal pressure when its energy is blocked or misdirected. Right now, ${essence.planet}'s transit is asking you to realign your daily habits with your soul's true calling.`,
        chakra_block:      "Your heart chakra shows significant restriction, manifesting as emotional guardedness, difficulty receiving support, and a subtle sense of isolation. This blockage is also suppressing the natural flow of abundance and meaningful connection into your life.",
        lucky_elements:    { day: "Sunday", color: "Gold", gemstone: "Ruby", direction: "East", metal: "Gold" },
        year_forecast:     `The remainder of ${currentYear} brings a gradual shift from turbulence to clarity. The months of August and October will be particularly powerful for new beginnings and decisive action. By November, much of the karmic fog will lift, revealing clearer paths forward. Close the year with gratitude rituals to seal the positive energy.`,
        remedy:            "Chant 'Om Namah Shivaya' 108 times each morning before sunrise to clear karmic residue. Wear deep indigo or violet on Saturdays to strengthen your intuitive faculties. Place an amethyst crystal at your workspace to neutralise discordant phone vibrations. Each evening, light a ghee lamp and sit in silence for 9 minutes — this simple ritual will begin to restore your chakra balance within 21 days."
      };
    }

    clearInterval(loadInterval);
    document.getElementById('loadingDiv').style.display = 'none';
    document.getElementById('res-name').textContent = name;

    // Number badges
    document.getElementById('res-numbers').innerHTML = `
      <div class="num-badge"><div class="num-val">${lp}</div><div class="num-label">Life Path</div></div>
      <div class="num-badge"><div class="num-val">${nn}</div><div class="num-label">Name Number</div></div>
      <div class="num-badge"><div class="num-val">${pn}</div><div class="num-label">Phone Vibration</div></div>
      <div class="num-badge"><div class="num-val">${py}</div><div class="num-label">Personal Year</div></div>
    `;

    // Build the rich result HTML
    let resultHTML = '';

    // Essence card
    resultHTML += `
      <div class="essence-card">
        <div class="essence-number">${lp}</div>
        <div class="essence-keyword">✦ ${essence.keyword} ✦</div>
        <p class="essence-desc">${essence.desc}</p>
      </div>
    `;

    // Planetary ruler card
    resultHTML += `
      <div class="planetary-ruler-card">
        <span class="planetary-symbol" style="color:${essence.color}">${essence.symbol}</span>
        <p class="planetary-name">Ruled by ${essence.planet}</p>
        <p class="planetary-desc">${reading.planetary_ruler || ''}</p>
      </div>
    `;

    // Lucky elements grid
    const lucky = reading.lucky_elements || {};
    resultHTML += `
      <div class="reading-divider">
        <div class="reading-divider-line"></div>
        <span class="reading-divider-label">✦ Your Lucky Elements ✦</span>
        <div class="reading-divider-line"></div>
      </div>
      <div class="lucky-elements-grid">
        <div class="lucky-card"><span class="lucky-icon">📅</span><p class="lucky-label">Lucky Day</p><p class="lucky-value">${lucky.day || 'Sunday'}</p></div>
        <div class="lucky-card"><span class="lucky-icon">🎨</span><p class="lucky-label">Lucky Color</p><p class="lucky-value">${lucky.color || 'Gold'}</p></div>
        <div class="lucky-card"><span class="lucky-icon">💎</span><p class="lucky-label">Gemstone</p><p class="lucky-value">${lucky.gemstone || 'Ruby'}</p></div>
        <div class="lucky-card"><span class="lucky-icon">🧭</span><p class="lucky-label">Direction</p><p class="lucky-value">${lucky.direction || 'East'}</p></div>
        <div class="lucky-card"><span class="lucky-icon">⚙️</span><p class="lucky-label">Metal</p><p class="lucky-value">${lucky.metal || 'Gold'}</p></div>
      </div>
    `;

    // Reading blocks divider
    resultHTML += `
      <div class="reading-divider">
        <div class="reading-divider-line"></div>
        <span class="reading-divider-label">✦ Your Cosmic Reading ✦</span>
        <div class="reading-divider-line"></div>
      </div>
    `;

    // Reading sections
    const sections = [
      { title: "◈ What Is Currently Afflicting You",  key: "current_situation" },
      { title: "✦ Your Phone's Hidden Influence",     key: "phone_influence"   },
      { title: "◉ Your Present Cosmic Cycle",         key: "present_cycle"     },
      { title: "⚡ Chakra Blockage Revealed",         key: "chakra_block"      },
      { title: "🔮 Year Ahead Forecast",              key: "year_forecast"     },
      { title: "☽ Vedic Remedies Prescribed For You", key: "remedy"            },
    ];

    resultHTML += sections.map(s => `
      <div class="reading-block">
        <p class="reading-title">${s.title}</p>
        <p class="reading-text">${reading[s.key] || ''}</p>
      </div>
    `).join('');

    document.getElementById('res-reading').innerHTML = resultHTML;

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

  let base = 60;
  if (COMPAT_TABLE.harmonious.has(key) || COMPAT_TABLE.harmonious.has(keyR)) base = 82;
  if (COMPAT_TABLE.challenging.has(key) || COMPAT_TABLE.challenging.has(keyR)) base = 44;

  if (lp1 === lp2) base = Math.min(base + 10, 96);

  const nnDiff = Math.abs(nn1 - nn2);
  if (nnDiff === 0) base = Math.min(base + 8, 98);
  else if (nnDiff <= 2) base = Math.min(base + 4, 98);
  else if (nnDiff >= 6) base = Math.max(base - 6, 20);

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

  // Animate arc
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
