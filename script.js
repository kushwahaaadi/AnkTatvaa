/* ══════════════════════════════════════
   COSMOS CANVAS — ULTRA-CRISP REAL GALAXY
══════════════════════════════════════ */
const canvas = document.getElementById('cosmos');
const ctx    = canvas ? canvas.getContext('2d') : null;
let W = 0, H = 0;
let dpr = 1;

function resize() {
  if (!canvas || !ctx) return;
  // High-DPI Retina scaling (eliminates blurriness on 1080p/4K/Retina displays)
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
}
if (canvas) {
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  resize();
  window.addEventListener('resize', resize);
}

// ── Background Galaxy Image ──
const cosmosBgImg = new Image();
let cosmosImgLoaded = false;
cosmosBgImg.src = 'cosmos-bg.jpg';
cosmosBgImg.onload = () => {
  cosmosImgLoaded = true;
};
cosmosBgImg.onerror = () => {
  cosmosBgImg.src = 'assets/images/cosmos-bg.jpg';
};

// ── Helpers ──
const rnd  = (a, b) => a + Math.random() * (b - a);
const rndI = (a, b) => (a + Math.random() * (b - a)) | 0;

// Ancient Vedic celestial spectrum: warm ivory, antique bronze, muted copper, soft stone stellar accents
const STAR_COLORS = [
  [232, 224, 210],  // Warm Ivory (#E8E0D2)
  [176, 138, 87],   // Antique Bronze (#B08A57)
  [212, 181, 138],  // Muted Copper (#D4B58A)
  [247, 243, 235],  // Bright Ivory Highlight (#F7F3EB)
  [137, 130, 118],  // Stone Grey (#898276)
  [195, 160, 115],  // Ancient Bronze Midtone
];
const randColor = () => STAR_COLORS[rndI(0, STAR_COLORS.length)];

// ── LAYER 1: 300 Pin-sharp micro-stars (sub-pixel deep space) ──
const starsDeep = Array.from({ length: 300 }, () => {
  const [r, g, b] = randColor();
  return {
    x: Math.random(),
    y: Math.random(),
    r: rnd(0.25, 0.75),
    t: rnd(0, Math.PI * 2),
    sp: rnd(0.008, 0.024),
    vx: rnd(-0.000025, 0.000025),
    vy: rnd(-0.000015, 0.000015),
    r_: r, g_: g, b_: b
  };
});

// ── LAYER 2: 80 Medium scintillating stars with soft atmospheric halos ──
const starsMid = Array.from({ length: 80 }, () => {
  const [r, g, b] = randColor();
  return {
    x: Math.random(),
    y: Math.random(),
    r: rnd(0.75, 1.35),
    t: rnd(0, Math.PI * 2),
    sp: rnd(0.010, 0.028),
    vx: rnd(-0.000035, 0.000035),
    vy: rnd(-0.000020, 0.000020),
    r_: r, g_: g, b_: b
  };
});

// ── LAYER 3: 20 Primary Astrological Anchors with crystal cross-diffraction spikes ──
const starsBright = Array.from({ length: 20 }, () => {
  const [r, g, b] = randColor();
  return {
    x: Math.random(),
    y: Math.random(),
    r: rnd(1.4, 2.1),
    t: rnd(0, Math.PI * 2),
    sp: rnd(0.012, 0.026),
    r_: r, g_: g, b_: b,
    rot: rnd(0, Math.PI),
    rotSp: rnd(-0.0005, 0.0005)
  };
});

// ── Shooting Stars / Rare High-Altitude Meteors ──
const shoots = [];
function spawnShoot() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const angle = rnd(0.35, 0.55);
  shoots.push({
    x: rnd(0.12, 0.85),
    y: rnd(0.02, 0.30),
    len: rnd(0.08, 0.16),
    spd: rnd(0.006, 0.012),
    angle,
    life: 1.0,
    decay: rnd(0.015, 0.025),
    width: rnd(0.8, 1.4)
  });
}
// Infrequent, rare and elegant cosmic occurrences
setInterval(spawnShoot, 11000);
setTimeout(spawnShoot, 2500);

// ── Interactive Stardust (Subtle Champagne Embers) ──
const stardust = [];
let targetMouseX = 0.5, targetMouseY = 0.5;
let mouseX = 0.5, mouseY = 0.5;
let lastMoveTime = 0;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = e.clientY / window.innerHeight;

    const now = performance.now();
    if (now - lastMoveTime > 45 && stardust.length < 24) {
      lastMoveTime = now;
      stardust.push({
        x: e.clientX,
        y: e.clientY,
        vx: rnd(-0.35, 0.35),
        vy: rnd(-0.5, 0.2),
        size: rnd(0.6, 1.4),
        life: 1.0,
        decay: rnd(0.020, 0.035),
        r: 176, g: 138, b: 87
      });
    }
  }, { passive: true });
}

// ── Master Clock for Celestial Float ──
let cosmosClock = 0;
const sacredCircleEl = document.querySelector('.sacred-circle');

/* ══════════════════════════════════════
   MAIN COSMOS RENDER LOOP
══════════════════════════════════════ */
function drawCosmos() {
  if (!canvas || !ctx) return;
  cosmosClock += 0.0016;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768 || isTouchDevice;

  // Smooth mouse interpolation (disabled on mobile / reduced motion)
  if (!isMobile && !prefersReduced) {
    mouseX += (targetMouseX - mouseX) * 0.035;
    mouseY += (targetMouseY - mouseY) * 0.035;
  } else {
    mouseX = 0.5;
    mouseY = 0.5;
  }

  const px = (mouseX - 0.5);
  const py = (mouseY - 0.5);

  // Subtle Parallax Response on Vedic Sacred Geometry in Hero
  if (sacredCircleEl && !isMobile && !prefersReduced) {
    const tiltX = (px * -14).toFixed(1);
    const tiltY = (py * -10).toFixed(1);
    sacredCircleEl.style.transform = `translate(-50%, -50%) translate3d(${tiltX}px, ${tiltY}px, 0)`;
  }

  // Clear full canvas buffer
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Apply retina dpr scaling for razor-sharp rendering
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Base Obsidian Black & Dark Bronze (#0D0D0C / #1B1915)
  const baseGrd = ctx.createLinearGradient(0, 0, 0, H);
  baseGrd.addColorStop(0,    '#0A0A09');
  baseGrd.addColorStop(0.35, '#0D0D0C');
  baseGrd.addColorStop(0.70, '#151410');
  baseGrd.addColorStop(1,    '#0A0A09');
  ctx.fillStyle = baseGrd;
  ctx.fillRect(0, 0, W, H);

  // 2. Ancient Observatory Warm Atmospheric Lighting (Subtle Bronze & Copper Depth)
  // Atmospheric Aura 1: Antique Bronze Warmth
  const n1x = W * 0.45 + (px * 16) + Math.sin(cosmosClock * 0.35) * 22;
  const n1y = H * 0.32 + (py * 12) + Math.cos(cosmosClock * 0.28) * 18;
  const n1r = Math.min(W, H) * 0.65;
  const neb1 = ctx.createRadialGradient(n1x, n1y, 0, n1x, n1y, n1r);
  neb1.addColorStop(0, 'rgba(176, 138, 87, 0.08)');
  neb1.addColorStop(0.5, 'rgba(27, 25, 21, 0.03)');
  neb1.addColorStop(1, 'transparent');
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, W, H);

  // Atmospheric Aura 2: Muted Copper Subtle Warmth
  const n2x = W * 0.78 + (px * 22) - Math.cos(cosmosClock * 0.30) * 26;
  const n2y = H * 0.62 + (py * 16) - Math.sin(cosmosClock * 0.22) * 22;
  const n2r = Math.min(W, H) * 0.58;
  const neb2 = ctx.createRadialGradient(n2x, n2y, 0, n2x, n2y, n2r);
  neb2.addColorStop(0, 'rgba(212, 181, 138, 0.06)');
  neb2.addColorStop(0.5, 'rgba(27, 25, 21, 0.02)');
  neb2.addColorStop(1, 'transparent');
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, W, H);

  // Atmospheric Aura 3: Dark Bronze Ambient Depth
  const n3x = W * 0.18 + (px * 18) + Math.cos(cosmosClock * 0.20) * 18;
  const n3y = H * 0.76 + (py * 14) + Math.sin(cosmosClock * 0.26) * 16;
  const n3r = Math.min(W, H) * 0.50;
  const neb3 = ctx.createRadialGradient(n3x, n3y, 0, n3x, n3y, n3r);
  neb3.addColorStop(0, 'rgba(176, 138, 87, 0.05)');
  neb3.addColorStop(0.5, 'rgba(27, 25, 21, 0.02)');
  neb3.addColorStop(1, 'transparent');
  ctx.fillStyle = neb3;
  ctx.fillRect(0, 0, W, H);

  // 3. Subtle Photo-Nebula Integration (if image exists, screen blended softly)
  if (cosmosImgLoaded && cosmosBgImg.naturalWidth) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.08;

    const imgW = cosmosBgImg.naturalWidth;
    const imgH = cosmosBgImg.naturalHeight;
    const zoom = 1.012 + Math.sin(cosmosClock * 0.25) * 0.006;
    const driftX = Math.sin(cosmosClock * 0.18) * 0.005;
    const driftY = Math.cos(cosmosClock * 0.15) * 0.004;

    const totalOffX = (px * 0.018 + driftX);
    const totalOffY = (py * 0.014 + driftY);
    const scale = Math.max(W / imgW, H / imgH) * zoom;
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = Math.round((W - destW) * 0.5 + (totalOffX * W));
    const destY = Math.round((H - destH) * 0.5 + (totalOffY * H));

    ctx.drawImage(cosmosBgImg, destX, destY, destW, destH);
    ctx.restore();
  }

  // 4. LAYER 1: 300 Pin-sharp needlepoint micro-stars
  for (const s of starsDeep) {
    if (!prefersReduced) {
      s.t += s.sp;
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x += 1;
      if (s.x > 1) s.x -= 1;
      if (s.y < 0) s.y += 1;
      if (s.y > 1) s.y -= 1;
    }
    const a = 0.18 + 0.56 * Math.pow(Math.sin(s.t), 2);
    const sx = Math.round(s.x * W + px * 7);
    const sy = Math.round(s.y * H + py * 5);

    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();
  }

  // 5. Additive Blending for Radiant Foreground Stars
  ctx.globalCompositeOperation = 'screen';

  // LAYER 2: 80 Medium scintillating stars with soft diamond glow
  for (const s of starsMid) {
    if (!prefersReduced) {
      s.t += s.sp;
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x += 1;
      if (s.x > 1) s.x -= 1;
      if (s.y < 0) s.y += 1;
      if (s.y > 1) s.y -= 1;
    }
    const a = 0.32 + 0.52 * Math.pow(Math.sin(s.t), 2);
    const sx = s.x * W + px * 15;
    const sy = s.y * H + py * 11;

    // Star core
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();

    // Soft diamond glow halo
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 2.6);
    halo.addColorStop(0, `rgba(${s.r_},${s.g_},${s.b_},${(a * 0.32).toFixed(2)})`);
    halo.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(sx, sy, s.r * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();
  }

  // LAYER 3: 20 Primary Astrological Anchors with crystal cross-diffraction spikes
  for (const s of starsBright) {
    if (!prefersReduced) {
      s.t += s.sp;
      s.rot += s.rotSp;
    }
    const a = 0.58 + 0.32 * Math.sin(s.t);
    const sx = s.x * W + px * 24;
    const sy = s.y * H + py * 18;

    // Radiant halo
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3.8);
    halo.addColorStop(0, `rgba(${s.r_},${s.g_},${s.b_},${(a * 0.42).toFixed(2)})`);
    halo.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(sx, sy, s.r * 3.8, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Core star
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
    ctx.fill();

    // Delicate 4-point cross diffraction spikes (lineWidth = 0.6)
    const arm = s.r * (3.2 + 0.8 * Math.sin(s.t * 0.7));
    const col = `rgba(${s.r_},${s.g_},${s.b_},${(a * 0.65).toFixed(2)})`;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(s.rot);
    ctx.lineWidth = 0.6;
    ctx.lineCap   = 'round';

    // Horizontal ray
    const hg = ctx.createLinearGradient(-arm, 0, arm, 0);
    hg.addColorStop(0, 'transparent');
    hg.addColorStop(0.5, col);
    hg.addColorStop(1, 'transparent');
    ctx.strokeStyle = hg;
    ctx.beginPath();
    ctx.moveTo(-arm, 0);
    ctx.lineTo(arm, 0);
    ctx.stroke();

    // Vertical ray
    const vg = ctx.createLinearGradient(0, -arm, 0, arm);
    vg.addColorStop(0, 'transparent');
    vg.addColorStop(0.5, col);
    vg.addColorStop(1, 'transparent');
    ctx.strokeStyle = vg;
    ctx.beginPath();
    ctx.moveTo(0, -arm);
    ctx.lineTo(0, arm);
    ctx.stroke();

    ctx.restore();
  }

  // 6. Interactive Stardust Trails (Subtle Champagne Embers)
  for (let i = stardust.length - 1; i >= 0; i--) {
    const p = stardust[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) {
      stardust.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${(p.life * 0.55).toFixed(2)})`;
    ctx.fill();
  }

  // 7. Rare Cosmic Meteors
  for (let i = shoots.length - 1; i >= 0; i--) {
    const s = shoots[i];
    s.x   += s.spd;
    s.y   += s.spd * s.angle;
    s.life -= s.decay;

    if (s.life <= 0) {
      shoots.splice(i, 1);
      continue;
    }

    const x1 = s.x * W;
    const y1 = s.y * H;
    const x2 = (s.x - s.len) * W;
    const y2 = (s.y - s.len * s.angle) * H;

    const sg = ctx.createLinearGradient(x2, y2, x1, y1);
    sg.addColorStop(0,   'transparent');
    sg.addColorStop(0.6, `rgba(212,181,138,${(s.life * 0.45).toFixed(2)})`);
    sg.addColorStop(1,   `rgba(232,224,210,${(s.life * 0.80).toFixed(2)})`);

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = sg;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x1, y1, s.width * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(247,243,235,${(s.life * 0.85).toFixed(2)})`;
    ctx.fill();
  }

  // Restore regular composite mode and coordinate system
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  requestAnimationFrame(drawCosmos);
}

if (canvas && getComputedStyle(canvas).display !== 'none') {
  drawCosmos();
}

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
   NAVIGATION CONTROLLER (DESKTOP & MOBILE)
══════════════════════════════════════ */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('navHamburger');
  if (!menu || !btn) return;
  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    menu.classList.add('open');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('navHamburger');
  if (menu) menu.classList.remove('open');
  if (btn) {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  }
  document.body.classList.remove('menu-open');
}

function toggleMobileSubmenu(btn) {
  if (!btn) return;
  const wrap = btn.closest('.mobile-submenu-wrap');
  if (!wrap) return;
  const submenu = wrap.querySelector('.mobile-submenu');
  if (!submenu) return;
  const isExpanded = btn.classList.contains('expanded');
  if (isExpanded) {
    btn.classList.remove('expanded');
    btn.setAttribute('aria-expanded', 'false');
    submenu.classList.remove('open');
  } else {
    btn.classList.add('expanded');
    btn.setAttribute('aria-expanded', 'true');
    submenu.classList.add('open');
  }
}

// Ensure functions are available globally for onclick attributes
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleMobileSubmenu = toggleMobileSubmenu;

(function initNavigationSystem() {
  // 1. Sticky Navbar Scroll Effect
  const nav = document.querySelector('.navbar');
  if (nav) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 20) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    if (window.scrollY > 20) nav.classList.add('scrolled');
  }

  // 2. Desktop Dropdown Accessibility & Click/Keyboard Toggle
  const dropdownTrigger = document.querySelector('.nav-dropdown-trigger');
  const dropdownWrap = document.querySelector('.nav-dropdown');

  if (dropdownTrigger && dropdownWrap) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdownWrap.classList.contains('open');
      if (isOpen) {
        dropdownWrap.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      } else {
        dropdownWrap.classList.add('open');
        dropdownTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!dropdownWrap.contains(e.target)) {
        dropdownWrap.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Keyboard support: Escape closes dropdown / mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dropdownWrap.classList.contains('open')) {
          dropdownWrap.classList.remove('open');
          dropdownTrigger.setAttribute('aria-expanded', 'false');
          dropdownTrigger.focus();
        }
        closeMobileMenu();
      }
    });
  }

  // Close mobile menu on resize to desktop (width > 900px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeMobileMenu();
    }
  });
})();

/* ══════════════════════════════════════
   SCROLL REVEAL & INTERACTION SYSTEM
   ══════════════════════════════════════ */
(function initScrollRevealSystem() {
  // Check reduced-motion preference
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    // Graceful degradation: content remains immediately visible
    return;
  }

  // Safe activation: add class to enable reveal transitions in CSS
  document.body.classList.add('reveal-init');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Auto-observe all .reveal and .reveal-stagger elements
  function observeRevealElements() {
    const targets = document.querySelectorAll('.reveal, .reveal-stagger');
    targets.forEach(el => {
      // If already in viewport upon page load, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeRevealElements);
  } else {
    observeRevealElements();
  }
})();

/* ══════════════════════════════════════
   REFINED NUMERICAL REVEAL ENGINE
   ══════════════════════════════════════ */
function animateNumber(element, start, end, duration = 900, suffix = '') {
  if (!element) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    element.textContent = end + suffix;
    element.classList.add('num-settled');
    return;
  }

  const target = Number(end);
  if (isNaN(target)) {
    element.textContent = end + suffix;
    return;
  }

  const initial = Number(start) || 0;
  const isFloat = !Number.isInteger(target);
  const diff = target - initial;
  const startTime = performance.now();

  // Smooth luxury deceleration curve (ease-out quartic)
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  element.classList.remove('num-settled');

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);
    const current = initial + diff * eased;

    element.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = end + suffix;
      element.classList.add('num-settled');
    }
  }

  element.textContent = initial + suffix;
  requestAnimationFrame(step);
}
window.animateNumber = animateNumber;

/* ══════════════════════════════════════
   BUTTON ARROW MICRO-INTERACTIONS
   ══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Wrap any raw '→' in buttons with .btn-arrow span for smooth glide
  const buttons = document.querySelectorAll('.btn-primary, .submit-btn, .btn-hero-primary, .btn-nav-signup, .btn-secondary, .btn-hero-secondary, .btn-tertiary');
  buttons.forEach(btn => {
    if (!btn.querySelector('.btn-arrow') && btn.innerHTML.includes('→')) {
      btn.innerHTML = btn.innerHTML.replace('→', '<span class="btn-arrow" aria-hidden="true">→</span>');
    }
  });
});

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
   READINGS PERSISTENCE & TOAST HELPER
   ══════════════════════════════════════ */
function showToast(message) {
  let toast = document.getElementById('reportToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'reportToast';
    toast.className = 'report-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span>✦</span><span>' + message + '</span>';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
if (typeof window !== 'undefined') window.showToast = showToast;

function saveReadingRecord(type, title, summary, link) {
  try {
    const list = JSON.parse(localStorage.getItem('ank_saved_readings') || '[]');
    const record = {
      id: 'rd_' + Date.now(),
      type: type || 'Numerology',
      title: title || 'Celestial Reading',
      summary: summary || '',
      link: link || window.location.href,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: Date.now()
    };
    list.unshift(record);
    localStorage.setItem('ank_saved_readings', JSON.stringify(list.slice(0, 40)));
    showToast('Analysis saved to your Cosmic Dashboard');
    return true;
  } catch (e) {
    console.error('Could not save reading:', e);
    showToast('Failed to save reading locally');
    return false;
  }
}
if (typeof window !== 'undefined') window.saveReadingRecord = saveReadingRecord;

// Check user login state to update navbar
(function checkNavAuth() {
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const user = JSON.parse(localStorage.getItem('ank_user') || 'null');
      if (user && user.loggedIn) {
        document.querySelectorAll('.btn-nav-login, .btn-mobile-secondary').forEach(btn => {
          btn.textContent = 'Dashboard';
          btn.href = 'dashboard.html';
        });
      }
    } catch (e) {}
  });
})();

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
  1: { keyword: 'The Leader', planet: 'Sun', symbol: '☉', color: '#B08A57', desc: 'You are born to lead, innovate, and pioneer. Number 1 carries the energy of the Sun — independence, ambition, and the courage to forge new paths. You are a natural initiator who inspires others through sheer willpower and vision.' },
  2: { keyword: 'The Diplomat', planet: 'Moon', symbol: '☽', color: '#E8E0D2', desc: 'You are the cosmic peacemaker, guided by the Moon. Number 2 embodies sensitivity, intuition, and the gift of harmony. Your strength lies in collaboration, emotional intelligence, and the ability to see both sides of every situation.' },
  3: { keyword: 'The Creative', planet: 'Jupiter', symbol: '♃', color: '#D4B58A', desc: 'Blessed by Jupiter, you are a vessel of creative expression and joy. Number 3 radiates optimism, artistic talent, and magnetic communication. You inspire and uplift everyone around you with your natural charisma.' },
  4: { keyword: 'The Builder', planet: 'Rahu', symbol: '☊', color: '#898276', desc: 'Under the shadow planet Rahu, you are the cosmic architect. Number 4 brings discipline, determination, and the ability to manifest grand visions into reality. Your karmic path demands hard work, but rewards are immense.' },
  5: { keyword: 'The Explorer', planet: 'Mercury', symbol: '☿', color: '#C49E6A', desc: 'Mercury gifts you with restless intelligence and the spirit of adventure. Number 5 craves freedom, change, and diverse experiences. You are a natural communicator, adaptable and quick-witted, thriving on variety.' },
  6: { keyword: 'The Nurturer', planet: 'Venus', symbol: '♀', color: '#E8E0D2', desc: 'Venus blesses you with love, beauty, and cosmic responsibility. Number 6 is the caretaker of the zodiac — devoted to family, harmony, and aesthetic perfection. Your heart is your greatest compass.' },
  7: { keyword: 'The Mystic', planet: 'Ketu', symbol: '☋', color: '#B08A57', desc: 'The shadow planet Ketu guides your path of spiritual depth and inner wisdom. Number 7 is the seeker of truth — introspective, analytical, and drawn to life\'s deeper mysteries. Solitude is where your power regenerates.' },
  8: { keyword: 'The Powerhouse', planet: 'Saturn', symbol: '♄', color: '#9A7646', desc: 'Saturn shapes you through karma, discipline, and material mastery. Number 8 carries the energy of authority, abundance, and cosmic justice. Your challenges forge you into an unstoppable force of transformation.' },
  9: { keyword: 'The Humanitarian', planet: 'Mars', symbol: '♂', color: '#B08A57', desc: 'Mars empowers you with courage, passion, and universal compassion. Number 9 is the number of completion and selfless service. You are a warrior of light, destined to leave a lasting impact on the world.' },
  11: { keyword: 'The Illuminator', planet: 'Moon (Master)', symbol: '☽✦', color: '#D4B58A', desc: 'Master Number 11 carries heightened intuition and spiritual illumination. You are a cosmic channel, deeply psychic and sensitive. Your life purpose is to inspire and awaken others through your elevated consciousness.' },
  22: { keyword: 'The Master Builder', planet: 'Rahu (Master)', symbol: '☊✦', color: '#B08A57', desc: 'Master Number 22 is the most powerful number in numerology — the Master Builder. You have the vision of the 11 combined with the practical ability of the 4. You can literally reshape reality on a grand scale.' },
  33: { keyword: 'The Master Teacher', planet: 'Jupiter (Master)', symbol: '♃✦', color: '#D4B58A', desc: 'Master Number 33 is the Master Teacher — the rarest and most spiritually evolved number. You embody unconditional love and healing. Your presence alone elevates the consciousness of those around you.' },
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
   MAIN READING FUNCTION (REDIRECT & REPORT)
══════════════════════════════════════ */
async function doReading() {
  const name      = (document.getElementById('fname') ? document.getElementById('fname').value : '').trim();
  const dob       = document.getElementById('fdob') ? document.getElementById('fdob').value : '';
  const phone     = (document.getElementById('fphone') ? document.getElementById('fphone').value : '').trim();
  const challenge = (document.getElementById('fchallenge') ? document.getElementById('fchallenge').value : '').trim();
  const errEl     = document.getElementById('errMsg');

  if (errEl) errEl.textContent = '';

  // If clicked completely blank, redirect straight to the full Numerology portal
  if (!name && !dob) {
    window.location.href = 'numerology.html';
    return;
  }

  if (!name || !dob) {
    if (errEl) errEl.textContent = '◈ Please enter your full name and date of birth';
    return;
  }

  const btn = document.getElementById('submitBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '◈ Aligning your celestial matrix...';
  }

  const params = new URLSearchParams();
  params.set('name', name);
  params.set('dob', dob);
  if (phone) params.set('phone', phone);
  if (challenge) params.set('challenge', challenge);

  window.location.href = `numerology.html?${params.toString()}`;
}

/* ══════════════════════════════════════
   DAILY COSMIC NUMBER
══════════════════════════════════════ */
(function initDailyCosmicNumber() {
  const DAY_MEANINGS = {
    1: { color: '#B08A57', msg: 'A day of new beginnings & bold initiative — plant the seeds of your desires today.' },
    2: { color: '#E8E0D2', msg: 'A day of harmony, partnerships & divine patience — collaborate and listen deeply.' },
    3: { color: '#D4B58A', msg: 'A day of creative expression & cosmic joy — let your voice and art flow freely.' },
    4: { color: '#898276', msg: 'A day of discipline, structure & earthly work — build with steady cosmic intention.' },
    5: { color: '#C49E6A', msg: 'A day of freedom, change & adventure — embrace the unexpected gifts of the cosmos.' },
    6: { color: '#E8E0D2', msg: 'A day of love, family & cosmic responsibility — nurture those around you with grace.' },
    7: { color: '#B08A57', msg: 'A day of spiritual reflection & inner wisdom — meditate, seek truth, go within.' },
    8: { color: '#9A7646', msg: 'A day of power, abundance & karmic balance — take decisive action toward your goals.' },
    9: { color: '#B08A57', msg: 'A day of completion, compassion & universal love — release what no longer serves you.' },
    11: { color: '#D4B58A', msg: 'A Master Number day — heightened intuition and spiritual illumination surround you.' },
    22: { color: '#B08A57', msg: 'A Master Builder day — your dreams have cosmic backing to be made manifest today.' },
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
    numEl.style.background = 'linear-gradient(135deg, #B08A57, #D4B58A)';
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
      label: '✦ Twin Flame Resonance',
      color: '#B08A57',
      text: `${name1} and ${name2} share an extraordinarily rare cosmic bond. Your Life Paths ${lp1} and ${lp2} create a sacred harmonic — the universe deliberately wove your souls together. This connection carries deep karmic completion and mutual spiritual acceleration.`
    };
  } else if (score >= 72) {
    return {
      label: '✦ Soulmate Alignment',
      color: '#D4B58A',
      text: `${name1} and ${name2} hold a powerful soulmate vibration. Your numbers complement each other beautifully, supporting growth, trust and shared dharmic purpose. The stars smile upon this union.`
    };
  } else if (score >= 58) {
    return {
      label: '◈ Magnetic Connection',
      color: '#38bdf8',
      text: `${name1} and ${name2} generate genuine magnetic energy together. There are areas of natural flow and areas that will challenge you to grow. With conscious effort and understanding of each other's cosmic blueprint, this bond strengthens over time.`
    };
  } else if (score >= 40) {
    return {
      label: '◈ Karmic Lesson Bond',
      color: '#f59e0b',
      text: `${name1} and ${name2} share a karmic lesson relationship. The friction between your numbers is not random — the universe has brought you together for mutual spiritual growth. Understanding each other's Life Path is the key to transformation.`
    };
  } else {
    return {
      label: '◈ Cosmic Growth Challenge',
      color: '#f87171',
      text: `${name1} and ${name2} carry strongly contrasting cosmic energies. This bond will require significant patience and spiritual maturity. However, great souls forge great lessons — and such unions, when navigated with awareness, can be profoundly transformative.`
    };
  }
}

function checkCompatibility() {
  const name1 = (document.getElementById('c1name') ? document.getElementById('c1name').value : '').trim();
  const dob1  = document.getElementById('c1dob') ? document.getElementById('c1dob').value : '';
  const name2 = (document.getElementById('c2name') ? document.getElementById('c2name').value : '').trim();
  const dob2  = document.getElementById('c2dob') ? document.getElementById('c2dob').value : '';
  const errEl = document.getElementById('compatErr');

  if (errEl) errEl.textContent = '';

  // If clicked without filling any fields, navigate directly to full Compatibility portal
  if (!name1 && !dob1 && !name2 && !dob2) {
    window.location.href = 'compatibility.html';
    return;
  }

  if (!name1 || !dob1 || !name2 || !dob2) {
    if (errEl) errEl.textContent = '◈ Please fill all four fields for both souls';
    return;
  }

  const btn = document.getElementById('compatBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '◈ Decrypting cosmic bond...';
  }

  const params = new URLSearchParams({
    c1name: name1,
    c1dob: dob1,
    c2name: name2,
    c2dob: dob2
  });

  window.location.href = `compatibility.html?${params.toString()}`;
}
