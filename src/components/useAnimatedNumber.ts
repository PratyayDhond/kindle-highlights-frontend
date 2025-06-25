import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const raf = useRef<number>();

  useEffect(() => {
    const start = value;
    const change = target - start;
    if (change === 0) return;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(start + change * progress));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    }

    raf.current = requestAnimationFrame(animate);
    return () => raf.current && cancelAnimationFrame(raf.current);
    // eslint-disable-next-line
  }, [target]);

  return value;
}