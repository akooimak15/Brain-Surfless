import { useEffect, useRef, useState } from 'react';

// Web の DeviceMotionEvent で「伏せたか」をざっくり判定する。
// - 最初に十分大きい z を観測したときの符号を基準（= 表向きの仮定）にする
// - z の符号が反転し、かつ一定以上なら「伏せ」扱い
const Z_THRESHOLD = 5; // m/s^2 くらい

export function useSensor() {
  const [isFaceDown, setIsFaceDown] = useState(false);
  const baselineSignRef = useRef<1 | -1 | null>(null);

  useEffect(() => {
    const win: any = globalThis as any;
    if (!win?.addEventListener) {
      return;
    }

    const handleMotion = (event: any) => {
      try {
        // Debug: log raw event occasionally to help diagnose white-screen on face-down
        // (will be visible in browser console)
        // console.debug(event);
      } catch (e) {
        // ignore logging errors
      }
      const z: unknown = event?.accelerationIncludingGravity?.z;
      if (typeof z !== 'number' || !Number.isFinite(z)) {
        return;
      }

      const absZ = Math.abs(z);
      if (absZ < 0.01) {
        return;
      }

      const sign = z >= 0 ? 1 : -1;

      if (!baselineSignRef.current && absZ >= Z_THRESHOLD) {
        baselineSignRef.current = sign;
        setIsFaceDown(false);
        return;
      }

      const baselineSign = baselineSignRef.current;
      if (!baselineSign) {
        return;
      }

      const nextFaceDown = sign !== baselineSign && absZ >= Z_THRESHOLD;
      try {
        // Log transitions for debugging on mobile browser
        if (nextFaceDown !== (baselineSignRef.current === -sign)) {
          // occasional log
          console.debug('[useSensor] z=', z, 'absZ=', absZ, 'sign=', sign, 'baseline=', baselineSign, 'faceDown=', nextFaceDown);
        }
      } catch (e) {
        // ignore console errors
      }
      setIsFaceDown(nextFaceDown);
    };

    win.addEventListener('devicemotion', handleMotion, { passive: true });
    return () => win.removeEventListener('devicemotion', handleMotion);
  }, []);

  return { isFaceDown };
}
