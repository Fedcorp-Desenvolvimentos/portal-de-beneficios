import { useEffect, useRef, useState } from 'react';

function normalizeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export function useCountUp(value, animate = true, duration = 900) {
  const safeValue = normalizeNumber(value);

  const [display, setDisplay] = useState(animate ? 0 : safeValue);

  const rafRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!animate) {
      setDisplay(safeValue);
      fromRef.current = safeValue;
      return undefined;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const from = fromRef.current;
    const to = safeValue;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;

      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [safeValue, animate, duration]);

  return display;
}