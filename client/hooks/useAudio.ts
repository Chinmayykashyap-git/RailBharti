import { useCallback, useRef } from "react";

export function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = () =>
    (ctxRef.current ??= new (window.AudioContext ||
      (window as any).webkitAudioContext)());

  const play = useCallback((freq = 880, duration = 0.12, volume = 0.03) => {
    try {
      const ctx = ensure();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = volume;
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  return play;
}
