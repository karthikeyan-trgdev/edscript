import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisContext, useLenis } from './hooks/useLenis.js';
import { NAV_OFFSET } from './lib/nav.jsx';
import LiquidGlassFilter from './components/LiquidGlassFilter.jsx';
import Preloader from './components/Preloader.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProgramsPage from './pages/ProgramsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

/** On every page change: jump to the top (or to the #hash), then re-measure GSAP + AOS. */
function RouteEffects({ lenis, preloading }) {
  const { pathname, hash } = useLocation();

  // jump to the top before the new page paints
  useLayoutEffect(() => {
    if (!hash) {
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, lenis]);

  useEffect(() => {
    if (preloading) return undefined;
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      AOS.refreshHard();
      const el = hash && document.querySelector(hash);
      if (el) lenis?.scrollTo(el, { offset: NAV_OFFSET, duration: 1.3 });
    }, 120);
    return () => clearTimeout(t);
  }, [pathname, hash, lenis, preloading]);

  return null;
}

export default function App() {
  const lenis = useLenis();
  const { pathname } = useLocation();
  const [revealed, setRevealed] = useState(false); // preloader shutter has started opening
  const [preloading, setPreloading] = useState(true); // preloader still mounted

  // Lock scrolling while the preloader is on screen
  useEffect(() => {
    if (!lenis) return;
    if (preloading) lenis.stop();
    else lenis.start();
  }, [lenis, preloading]);

  // AOS for everything below the first screen
  useEffect(() => {
    if (!revealed) return;
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    ScrollTrigger.refresh();
  }, [revealed]);

  // Glass specular highlight follows the pointer
  useEffect(() => {
    const onMove = (e) => {
      const glass = e.target.closest?.('.glass');
      if (!glass) return;
      const r = glass.getBoundingClientRect();
      glass.style.setProperty('--mx', `${e.clientX - r.left}px`);
      glass.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setPreloading(false), []);

  return (
    <LenisContext.Provider value={lenis}>
      <LiquidGlassFilter />
      {preloading && <Preloader onReveal={handleReveal} onDone={handleDone} />}
      <RouteEffects lenis={lenis} preloading={preloading} />
      <Navbar ready={revealed} />
      {/* keyed by path so each page plays its entrance */}
      <main className="page" key={pathname}>
        <Routes>
          <Route path="/" element={<HomePage ready={revealed} />} />
          <Route path="/about" element={<AboutPage ready={revealed} />} />
          <Route path="/programs" element={<ProgramsPage ready={revealed} />} />
          <Route path="/contact" element={<ContactPage ready={revealed} />} />
          <Route path="/register" element={<RegisterPage ready={revealed} />} />
          <Route path="*" element={<NotFoundPage ready={revealed} />} />
        </Routes>
      </main>
      <Footer />
    </LenisContext.Provider>
  );
}
