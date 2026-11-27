import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Play } from 'lucide-react';
import heroFilm from '@assets/images/new-images/hero-bg.webp';
import heroPodcast from '@assets/images/new-images/hero-bg-2.webp';
import heroBrand from '@assets/images/new-images/hero-bg-3.webp';
import heroInfluencer from '@assets/images/hero-bg-4.webp';
import heroMarketing from '@assets/images/hero-bg-5.webp';
import content from '@shared/content.json';
import { FeatureIcon } from './Icons.jsx';
import { useLenisInstance } from '../hooks/useLenis.js';
import '../styles/hero.css';

gsap.registerPlugin(ScrollTrigger);

const { hero, features } = content;

// One image per programme, in line-up order.
// x = horizontal crop anchor; in images 2-5 the person sits at the right edge, so anchor there.
// fade = where the image starts fading in behind the copy (later on the busier images).
const SLIDES = [
  { src: heroFilm, x: '100%', fade: '30%' },
  { src: heroPodcast, x: '100%', fade: '34%' },
  { src: heroBrand, x: '100%', fade: '34%' },
  { src: heroMarketing, x: '100%', fade: '34%' },
  { src: heroInfluencer, x: '100%', fade: '34%' },
];
const HOLD = 6; // seconds each background stays before the next one opens

export default function Hero({ ready }) {
  const root = useRef(null);
  const intro = useRef(null);
  const lenis = useLenisInstance();

  // Build the intro timeline (paused) before first paint so nothing flashes.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

      tl.fromTo('.hero__slide:first-child .hero__img', { scale: 1.22, filter: 'blur(10px) saturate(0.6)' }, { scale: 1, filter: 'blur(0px) saturate(1)', duration: 2.2, clearProps: 'filter' }, 0)
        .from('.hero__swoosh', { opacity: 0, x: 80, duration: 1.8, stagger: 0.15 }, 0.2)
        .from('.hero__eyebrow-char', { opacity: 0, y: 14, stagger: 0.025, duration: 0.7, ease: 'power3.out' }, 0.45)
        .from('.hero__line-inner', { yPercent: 118, rotate: 2.5, duration: 1.25, stagger: 0.12 }, 0.5)
        .from('.hero__desc', { opacity: 0, y: 26, duration: 1.1 }, 0.95)
        .from('.hero__actions > *', { opacity: 0, y: 24, scale: 0.94, duration: 1, stagger: 0.1 }, 1.05)
        .from('.features', { opacity: 0, y: 50, duration: 1.2 }, 1.1)
        .from('.feature', { opacity: 0, y: 24, duration: 0.9, stagger: 0.09, ease: 'power3.out' }, 1.25);

      intro.current = tl;

      // Scroll: content drifts up & fades, background slowly parallaxes.
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.hero__content', {
          y: -90,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to('.hero__media', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (ready) intro.current?.play();
  }, [ready]);

  // Background slideshow. The next image dissolves in over the current one while one slow
  // zoom carries it from a slight push-in to rest, so an image always covers the hero.
  // Kept cheap on purpose so the hand-over never stutters:
  //  - every slide stays painted (opacity only, never visibility/display) and all images are
  //    decoded up front, so the first frame of a fade has nothing new to prepare
  //  - one transform tween per slide, no CSS filters (a blurred full-screen layer went black)
  //  - the 01-04 tracker is updated straight in the DOM, so React doesn't re-render the hero
  const goTo = useRef(() => {});
  useEffect(() => {
    if (!ready) return undefined;
    const slides = gsap.utils.toArray('.hero__slide', root.current);
    const dots = gsap.utils.toArray('.hero__dot', root.current);
    const count = root.current.querySelector('.hero__dots-count');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer;
    let busy = false;

    slides.forEach((sl) => sl.querySelector('.hero__img').decode?.().catch(() => {}));

    const mark = (i) => {
      dots.forEach((d, j) => {
        d.classList.toggle('is-active', j === i);
        d.setAttribute('aria-pressed', String(j === i));
      });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
    };
    const zoom = (slide, from) => {
      if (reduce) return;
      gsap.fromTo(slide, { scale: from }, { scale: 1, duration: HOLD + 2.5, ease: 'power1.out', overwrite: 'auto' });
    };
    const schedule = () => {
      timer?.kill();
      timer = gsap.delayedCall(HOLD, () => go((current + 1) % slides.length));
    };

    const go = (next) => {
      if (busy || next === current) return;
      busy = true;
      const prev = slides[current];
      const incoming = slides[next];
      current = next;
      mark(next);
      schedule();
      gsap.set(slides, { zIndex: 0 });
      gsap.set(prev, { zIndex: 1 });
      gsap.set(incoming, { zIndex: 2 });
      zoom(incoming, 1.1);
      gsap.fromTo(incoming, { opacity: 0 }, {
        opacity: 1,
        duration: reduce ? 1.2 : 1.8,
        ease: 'sine.inOut',
        onComplete: () => {
          gsap.set(prev, { opacity: 0 }); // only once it's fully covered
          busy = false;
        },
      });
    };

    gsap.set(slides, { opacity: 0, zIndex: 0 });
    gsap.set(slides[0], { opacity: 1, zIndex: 1 });
    zoom(slides[0], 1.07);
    schedule();
    goTo.current = go;

    return () => {
      timer?.kill();
      goTo.current = () => {};
      gsap.killTweensOf(slides);
    };
  }, [ready]);

  // Pointer parallax on the background (pointer devices only)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = root.current;
    const layer = el.querySelector('.hero__media-parallax');
    const swooshes = el.querySelector('.hero__swooshes');
    const xTo = gsap.quickTo(layer, 'x', { duration: 1.2, ease: 'power3.out' });
    const yTo = gsap.quickTo(layer, 'y', { duration: 1.2, ease: 'power3.out' });
    const sxTo = gsap.quickTo(swooshes, 'x', { duration: 1.6, ease: 'power3.out' });
    const syTo = gsap.quickTo(swooshes, 'y', { duration: 1.6, ease: 'power3.out' });
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo(nx * -18); yTo(ny * -12);
      sxTo(nx * 30); syTo(ny * 20);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  // Magnetic CTA buttons
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const btns = root.current.querySelectorAll('[data-magnetic]');
    const cleanups = [...btns].map((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      const move = (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      };
      const leave = () => { xTo(0); yTo(0); };
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', leave);
      return () => {
        btn.removeEventListener('pointermove', move);
        btn.removeEventListener('pointerleave', leave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const scrollTo = (e, href) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis?.scrollTo(target, { offset: -110, duration: 1.4 });
  };

  return (
    <section className="hero" id="home" ref={root} aria-labelledby="hero-title">
      {/* Background */}
      <div className="hero__media" aria-hidden="true">
        <div className="hero__media-parallax">
          {SLIDES.map(({ src, x, fade }, i) => (
            <div className="hero__slide" key={src} style={{ '--pos-x': x, '--fade': fade }}>
              <img
                className="hero__img"
                src={src}
                alt=""
                width="2025"
                height="941"
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      {/* white wash from the left, over every slide, so the copy always reads cleanly */}
      <div className="hero__wash" aria-hidden="true" />

      {/* slideshow tracker: 01-04, the active bar fills over HOLD seconds */}
      <div className="hero__dots" style={{ '--hold': `${HOLD}s` }}>
        <span className="hero__dots-count" aria-hidden="true">01</span>
        {SLIDES.map(({ src }, i) => (
          <button
            type="button"
            key={src}
            className={`hero__dot ${i === 0 ? 'is-active' : ''}`}
            aria-label={`Show background ${i + 1} of ${SLIDES.length}`}
            aria-pressed={i === 0}
            onClick={() => goTo.current(i)}
          >
            <span className="hero__dot-fill" />
          </button>
        ))}
        <span className="hero__dots-count hero__dots-count--total" aria-hidden="true">{String(SLIDES.length).padStart(2, '0')}</span>
      </div>

      {/* Decorative liquid-glass ribbons */}
      <div className="hero__swooshes" aria-hidden="true">
        <svg className="hero__swoosh hero__swoosh--right" viewBox="0 0 600 900" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <linearGradient id="sw-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#c9fff7" stopOpacity="0.12" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path d="M600 600C470 640 370 740 330 900h80c40-130 110-210 190-246Z" fill="url(#sw-a)" stroke="rgba(255,255,255,.6)" strokeWidth="1.2" />
        </svg>
        <svg className="hero__swoosh hero__swoosh--left" viewBox="0 0 700 320" preserveAspectRatio="xMinYMax slice">
          <path d="M0 60C150 170 340 250 700 300V320H0Z" fill="rgba(255,255,255,.38)" />
          <path d="M0 60C150 170 340 250 700 300" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.2" />
        </svg>
      </div>

      <div className="hero__inner container">
        <div className="hero__content">
          <p className="hero__eyebrow" aria-label={hero.eyebrow}>
            {hero.eyebrow.split('').map((c, i) => (
              <span className="hero__eyebrow-char" aria-hidden="true" key={i}>
                {c === ' ' ? ' ' : c}
              </span>
            ))}
          </p>

          <h1 className="hero__title" id="hero-title">
            {/* the accent word shares the last line: "Turn Creativity / into a Career." */}
            {hero.titleLines.map((line, i) => (
              <span className="hero__line" key={line}>
                <span className="hero__line-inner">
                  {line}
                  {i === hero.titleLines.length - 1 && <> <span className="hero__accent">{hero.titleAccent}</span></>}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero__desc">{hero.description}</p>

          <div className="hero__actions">
            <a
              href={hero.primaryCta.href}
              className="btn btn--primary btn--lg"
              data-magnetic
              onClick={(e) => scrollTo(e, hero.primaryCta.href)}
            >
              <span>{hero.primaryCta.label}</span>
              <ArrowUpRight className="btn__arrow" size={22} strokeWidth={2.4} />
            </a>
            <a
              href={hero.secondaryCta.href}
              className="btn btn--glass btn--lg glass"
              data-magnetic
              onClick={(e) => scrollTo(e, hero.secondaryCta.href)}
            >
              <span className="glass__fx" aria-hidden="true" />
              <span className="btn__play">
                <Play size={14} strokeWidth={0} fill="currentColor" />
              </span>
              <span>{hero.secondaryCta.label}</span>
            </a>
          </div>
        </div>

        <div className="features glass">
          <span className="glass__fx" aria-hidden="true" />
          <ul className="features__list" aria-label="Why EDSCRIPT">
          {features.map((f) => (
            <li className="feature" key={f.title}>
              <FeatureIcon name={f.icon} className="feature__icon" />
              <div>
                <h3 className="feature__title">{f.title}</h3>
                <p className="feature__text">{f.text}</p>
              </div>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
