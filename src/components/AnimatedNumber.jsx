import React, { useRef, useEffect, useState } from 'react';

// Safe, simple animated counter that tweens from old to new value on change.
const AnimatedNumber = ({ value, suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState(typeof value === 'number' ? value : 0);
  const rafRef     = useRef(null);
  const fromRef    = useRef(display);
  const targetRef  = useRef(display);
  const startTsRef = useRef(null);
  const DURATION   = 5000; // ms (Takes exactly 5 seconds to change the number smoothly)

  useEffect(() => {
    const numericVal = typeof value === 'number' && isFinite(value) ? value : 0;

    // Cancel previous animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Snapshot where we currently are
    fromRef.current = targetRef.current;
    targetRef.current = numericVal;
    startTsRef.current = null;

    const tick = (ts) => {
      if (!startTsRef.current) startTsRef.current = ts;
      const elapsed = ts - startTsRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(numericVal);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const safe = typeof display === 'number' && isFinite(display) ? display : 0;
  return <>{safe.toFixed(decimals)}{suffix}</>;
};

export default AnimatedNumber;
