import { useState, useEffect, useRef } from 'react';

// Lerps a numeric value to a target over durationMs using rAF.
export function useLerpValue(targetValue, durationMs = 2500) {
  const [displayValue, setDisplayValue] = useState(targetValue);

  const rafRef = useRef(null);
  const startValRef = useRef(targetValue);
  const startTimeRef = useRef(null);
  const targetRef = useRef(targetValue);

  useEffect(() => {
    // Skip animation if the value hasn't changed meaningfully
    if (Math.abs(targetValue - targetRef.current) < 0.001) return;

    targetRef.current = targetValue;

    // Cancel any in-flight animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Snapshot current display value to start from
    setDisplayValue(prev => {
      startValRef.current = prev;
      return prev;
    });
    startTimeRef.current = null; // Reset so we grab fresh timestamp on first frame

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = t * (2 - t); // ease-out quad
      const next = startValRef.current + (targetRef.current - startValRef.current) * eased;
      setDisplayValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetRef.current);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetValue, durationMs]);

  return displayValue;
}
