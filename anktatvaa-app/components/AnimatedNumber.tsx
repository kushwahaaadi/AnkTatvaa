'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  start?: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 900,
  start = 0,
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState<string>(
    decimals > 0 ? start.toFixed(decimals) : Math.round(start).toString()
  );
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayValue(decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString());
      return;
    }

    const startTime = performance.now();
    const startVal = start;
    const diff = value - startVal;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = startVal + diff * eased;

      setDisplayValue(decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString());

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString());
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration, start, decimals]);

  return (
    <span className={`tabular-nums ${className}`}>
      {displayValue}
      {suffix}
    </span>
  );
}

