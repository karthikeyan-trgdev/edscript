import { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LenisContext = createContext(null);
export const useLenisInstance = () => useContext(LenisContext);

/**
 * Creates one Lenis instance driven by GSAP's ticker so Lenis smooth scroll
 * and ScrollTrigger stay in sync.
 */
export function useLenis() {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instance = new Lenis({
      lerp: reduced ? 1 : 0.09,
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    instance.on('scroll', ScrollTrigger.update);
    const raf = (time) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);
    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return lenis;
}
