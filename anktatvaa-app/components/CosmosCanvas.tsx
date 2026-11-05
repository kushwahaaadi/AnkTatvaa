'use client';

import React, { useEffect, useRef } from 'react';

export default function CosmosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    };

    resize();
    window.addEventListener('resize', resize);

    // Vedic color spectrum
    const STAR_COLORS = [
      [232, 224, 210],  // Warm Ivory (#E8E0D2)
      [176, 138, 87],   // Antique Bronze (#B08A57)
      [212, 181, 138],  // Muted Copper (#D4B58A)
      [247, 243, 235],  // Bright Ivory (#F7F3EB)
      [137, 130, 118],  // Stone Grey (#898276)
      [195, 160, 115],  // Mid Bronze
    ];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const rndI = (a: number, b: number) => (a + Math.random() * (b - a)) | 0;
    const randColor = () => STAR_COLORS[rndI(0, STAR_COLORS.length)];

    // Micro stars (Layer 1)
    const starsDeep = Array.from({ length: 220 }, () => {
      const [r, g, b] = randColor();
      return {
        x: Math.random(),
        y: Math.random(),
        r: rnd(0.3, 0.75),
        t: rnd(0, Math.PI * 2),
        sp: rnd(0.008, 0.024),
        vx: rnd(-0.00002, 0.00002),
        vy: rnd(-0.00001, 0.00001),
        r_: r, g_: g, b_: b
      };
    });

    // Medium stars (Layer 2)
    const starsMid = Array.from({ length: 60 }, () => {
      const [r, g, b] = randColor();
      return {
        x: Math.random(),
        y: Math.random(),
        r: rnd(0.75, 1.3),
        t: rnd(0, Math.PI * 2),
        sp: rnd(0.010, 0.028),
        vx: rnd(-0.00003, 0.00003),
        vy: rnd(-0.000015, 0.000015),
        r_: r, g_: g, b_: b
      };
    });

    // Radiant anchors (Layer 3)
    const starsBright = Array.from({ length: 16 }, () => {
      const [r, g, b] = randColor();
      return {
        x: Math.random(),
        y: Math.random(),
        r: rnd(1.3, 2.0),
        t: rnd(0, Math.PI * 2),
        sp: rnd(0.012, 0.024),
        r_: r, g_: g, b_: b,
        rot: rnd(0, Math.PI),
        rotSp: rnd(-0.0005, 0.0005)
      };
    });

    let animId: number;
    let clock = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const render = () => {
      clock += 0.002;
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;
      const px = mouseX - 0.5;
      const py = mouseY - 0.5;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Obsidian Base
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#090908');
      bg.addColorStop(0.5, '#0D0D0C');
      bg.addColorStop(1, '#13120F');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 2. Cosmic Bronze Atmospheric Glows
      const n1x = W * 0.5 + px * 14 + Math.sin(clock * 0.35) * 16;
      const n1y = H * 0.35 + py * 10 + Math.cos(clock * 0.28) * 14;
      const g1 = ctx.createRadialGradient(n1x, n1y, 0, n1x, n1y, Math.min(W, H) * 0.6);
      g1.addColorStop(0, 'rgba(176, 138, 87, 0.07)');
      g1.addColorStop(0.6, 'rgba(27, 25, 21, 0.02)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // 3. Layer 1: Micro Stars
      for (const s of starsDeep) {
        s.t += s.sp;
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x += 1;
        if (s.x > 1) s.x -= 1;
        if (s.y < 0) s.y += 1;
        if (s.y > 1) s.y -= 1;

        const a = 0.2 + 0.55 * Math.pow(Math.sin(s.t), 2);
        const sx = s.x * W + px * 6;
        const sy = s.y * H + py * 4;

        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'screen';

      // 4. Layer 2: Scintillating Stars with Glow
      for (const s of starsMid) {
        s.t += s.sp;
        const a = 0.3 + 0.5 * Math.pow(Math.sin(s.t), 2);
        const sx = s.x * W + px * 12;
        const sy = s.y * H + py * 9;

        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
        ctx.fill();

        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 2.5);
        halo.addColorStop(0, `rgba(${s.r_},${s.g_},${s.b_},${(a * 0.25).toFixed(2)})`);
        halo.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }

      // 5. Layer 3: Cross-Spike Astrological Anchors
      for (const s of starsBright) {
        s.t += s.sp;
        s.rot += s.rotSp;
        const a = 0.55 + 0.3 * Math.sin(s.t);
        const sx = s.x * W + px * 20;
        const sy = s.y * H + py * 15;

        // Core
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.r_},${s.g_},${s.b_},${a.toFixed(2)})`;
        ctx.fill();

        // Cross rays
        const arm = s.r * 3.4;
        const col = `rgba(${s.r_},${s.g_},${s.b_},${(a * 0.6).toFixed(2)})`;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(s.rot);
        ctx.lineWidth = 0.5;

        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(-arm, 0);
        ctx.lineTo(arm, 0);
        ctx.moveTo(0, -arm);
        ctx.lineTo(0, arm);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="cosmos"
      className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
    />
  );
}
