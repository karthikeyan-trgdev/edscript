import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import content from '@shared/content.json';
import logo from '@assets/images/logo/ed-script-logo.png';
import { useLocation } from 'react-router-dom';
import { useLenisInstance } from '../hooks/useLenis.js';
import { useGo } from '../lib/nav.jsx';
import '../styles/navbar.css';

export default function Navbar({ ready }) {
  const lenis = useLenisInstance();
  const navRef = useRef(null);
  const linksRef = useRef(null);
  const indicatorRef = useRef(null);
  const menuRef = useRef(null);
  const go = useGo();
  const { pathname } = useLocation();
  // the nav item whose page we're on ("/programs" stays active on "/programs/...")
  const active = content.nav.reduce((best, item) =>
    (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)) ? item.href : best, '');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wasOpen = useRef(false);

  // Move the underline under the active link
  const moveIndicator = useCallback((instant = false) => {
    const wrap = linksRef.current;
    const link = wrap?.querySelector(`[data-href="${active}"]`);
    if (!indicatorRef.current) return;
    if (!link) { gsap.to(indicatorRef.current, { width: 0, duration: instant ? 0 : 0.4, ease: 'expo.out' }); return; }
    gsap.to(indicatorRef.current, {
      x: link.offsetLeft,
      width: link.offsetWidth,
      duration: instant ? 0 : 0.6,
      ease: 'expo.out',
    });
  }, [active]);

  useLayoutEffect(() => moveIndicator(true), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => moveIndicator(), [moveIndicator]);
  useEffect(() => {
    const onResize = () => moveIndicator(true);
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [moveIndicator]);

  // Shrink the bar after scrolling
  useEffect(() => {
    if (!lenis) return;
    const onScroll = ({ scroll }) => setScrolled(scroll > 40);
    lenis.on('scroll', onScroll);
    return () => lenis.off('scroll', onScroll);
  }, [lenis]);

  // Intro animation once the preloader opens
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(navRef.current, { yPercent: -160, opacity: 0 });
    }, navRef);
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.35 })
        .to(navRef.current, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out' })
        .from('.nav__link, .nav__cta, .nav__burger', { y: -14, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out', clearProps: 'all' }, '<0.25');
    }, navRef);
    return () => ctx.revert();
  }, [ready]);

  // Mobile menu open / close
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (open) {
      lenis?.stop();
      gsap.set(menu, { display: 'block' });
      gsap.fromTo(menu, { opacity: 0, y: -12, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' });
      gsap.fromTo(menu.querySelectorAll('.nav__menu-item'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out', delay: 0.05 });
    } else if (wasOpen.current) {
      lenis?.start();
      gsap.to(menu, { opacity: 0, y: -8, scale: 0.98, duration: 0.25, ease: 'power2.in', onComplete: () => gsap.set(menu, { display: 'none' }) });
    }
    wasOpen.current = open;
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 960 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // close the mobile menu whenever the page changes
  useEffect(() => setOpen(false), [pathname]);

  const nav = (e, to) => {
    setOpen(false);
    go(e, to);
  };

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`} ref={navRef}>
      <div className="container">
        <nav className="nav__bar glass" aria-label="Primary">
          <span className="glass__fx" aria-hidden="true" />
          <a href="/" className="nav__brand" onClick={(e) => nav(e, '/')} aria-label={`${content.brand.name} home`}>
            <img className="nav__logo" src={logo} alt={`${content.brand.name} - ${content.brand.tagline}`} width="1000" height="298" />
          </a>

          <ul className="nav__links" ref={linksRef}>
            {content.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  data-href={item.href}
                  className={`nav__link ${active === item.href ? 'is-active' : ''}`}
                  aria-current={active === item.href ? 'page' : undefined}
                  onClick={(e) => nav(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="nav__indicator" ref={indicatorRef} aria-hidden="true" />
          </ul>

          <div className="nav__actions">
            <a href="/register" className="nav__cta btn btn--primary" onClick={(e) => nav(e, '/register')}>
              <span>Apply Now</span>
              <ArrowUpRight className="btn__arrow" size={20} strokeWidth={2.4} />
            </a>
            <button
              type="button"
              className="nav__burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        <div className="nav__menu glass" id="mobile-menu" ref={menuRef}>
          <span className="glass__fx" aria-hidden="true" />
          <ul className="nav__menu-list">
            {content.nav.map((item) => (
              <li className="nav__menu-item" key={item.href}>
                <a
                  href={item.href}
                  className={active === item.href ? 'is-active' : ''}
                  onClick={(e) => nav(e, item.href)}
                >
                  {item.label}
                  <ArrowUpRight size={18} />
                </a>
              </li>
            ))}
            <li className="nav__menu-item nav__menu-cta">
              <a href="/register" className="btn btn--primary" onClick={(e) => nav(e, '/register')}>
                Apply Now <ArrowUpRight className="btn__arrow" size={20} strokeWidth={2.4} />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
