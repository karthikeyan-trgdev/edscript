import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import heroBg from '@assets/images/hero-bg-1.webp';
import preloaderBg from '@assets/images/preloader-bg.jpg';
import logoLight from '@assets/images/logo/ed-script-logo-light.png';
import '../styles/preloader.css';

// The brand rule, told as a countdown: story and craft first, AI after.
const BEATS = ['Story.', 'Craft.', 'Then AI.'];

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
    if (img.decode) img.decode().then(resolve, resolve);
  });

const pad = (n) => String(n).padStart(2, '0');

export default function Preloader({ onReveal, onDone }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const q = gsap.utils.selector(el);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Wait for the hero image and fonts, with an upper limit so a slow network never blocks the page.
    const assets = Promise.race([
      Promise.all([loadImage(heroBg), document.fonts ? document.fonts.ready : null]),
      new Promise((r) => setTimeout(r, 6000)),
    ]);

    let cancelled = false;
    const ctx = gsap.context(() => {
      const numEl = q('.pl__num')[0];
      const beatEl = q('.pl__beat')[0];
      const pctEl = q('.pl__pct')[0];
      const tcEl = q('.pl__tc')[0];
      const progress = { v: 0 };

      // Background: fade in once decoded, then a slow push-in for the whole intro
      gsap.set(q('.pl__bg'), { opacity: 0, scale: 1.2 });
      loadImage(preloaderBg).then(() => {
        if (cancelled) return;
        gsap.to(q('.pl__bg'), { opacity: 1, duration: 1.2, ease: 'power2.out' });
        gsap.to(q('.pl__bg'), { scale: 1.12, duration: 6, ease: 'power1.out' });
      });

      // Running 24fps timecode
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        tcEl.textContent = `00:00:${pad(Math.floor(t) % 60)}:${pad(Math.floor(t * 24) % 24)}`;
      };
      gsap.ticker.add(tick);

      const setProgress = () => {
        const v = Math.round(progress.v);
        pctEl.textContent = pad(v === 100 ? 100 : v);
        gsap.set(q('.pl__bar-fill'), { scaleX: progress.v / 100 });
      };

      // 1) Intro: frame the shot
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from(q('.pl__corner'), { opacity: 0, scale: 1.6, duration: 0.9, stagger: 0.06 })
        .from(q('.pl__hud-item'), { opacity: 0, y: 10, duration: 0.6, stagger: 0.06 }, '<0.15')
        .from(q('.pl__leader'), { opacity: 0, scale: 0.7, duration: 0.9 }, '<')
        .from(q('.pl__cross--h'), { scaleX: 0, duration: 0.9 }, '<0.1')
        .from(q('.pl__cross--v'), { scaleY: 0, duration: 0.9 }, '<0.05')
        .from(q('.pl__meter'), { opacity: 0, y: 14, duration: 0.6 }, '<0.2');

      // 2) Countdown 3 · 2 · 1 with a film-leader sweep
      const beatDur = reduced ? 0.35 : 0.78;
      BEATS.forEach((beat, i) => {
        tl.call(() => {
          numEl.textContent = String(3 - i);
          beatEl.textContent = beat;
        }, null, i === 0 ? '-=0.35' : '>')
          .fromTo(numEl, { opacity: 0, scale: 1.45 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }, '<')
          .fromTo(beatEl, { opacity: 0, yPercent: 80 }, { opacity: 1, yPercent: 0, duration: 0.45, ease: 'power3.out' }, '<')
          .fromTo(q('.pl__sweep'), { '--sweep': '0deg' }, { '--sweep': '360deg', duration: beatDur, ease: 'none' }, '<')
          .fromTo(q('.pl__leader'), { '--pulse': 1.04 }, { '--pulse': 1, duration: 0.4, ease: 'power2.out' }, '<');
      });
      tl.to(progress, { v: 86, duration: tl.duration() - 0.3, ease: 'power1.inOut', onUpdate: setProgress }, 0.3);

      // 3) Reveal — a separate timeline that starts once the countdown is done AND assets are loaded
      const outro = gsap.timeline({ paused: true });
      tl.eventCallback('onComplete', () => {
        assets.then(() => !cancelled && outro.play());
      });

      outro.to(progress, { v: 100, duration: 0.45, ease: 'power2.out', onUpdate: setProgress })
        .to([numEl, beatEl], { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.in' }, '<')
        .to(q('.pl__ring, .pl__sweep, .pl__cross'), { opacity: 0, scale: 0.6, duration: 0.5, ease: 'power3.in' }, '<0.05')
        // logo "slate" moment
        .fromTo(q('.pl__logo'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '>-0.1')
        // the logo wipes in left to right, like a slate being revealed
        .fromTo(q('.pl__logo-img'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power3.out' }, '<0.05')
        .to(q('.pl__hud, .pl__meter, .pl__corner'), { opacity: 0, duration: 0.4 }, '<0.3')
        .to(q('.pl__logo'), { opacity: 0, scale: 1.08, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in' }, '+=0.25')
        // shutter: a line of light, then the frame splits open
        .fromTo(q('.pl__seam'), { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.45, ease: 'expo.inOut' }, '<0.15')
        .call(() => onReveal && onReveal())
        .to(q('.pl__panel--top'), { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<0.35')
        .to(q('.pl__panel--bottom'), { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
        .to(q('.pl__seam'), { opacity: 0, scaleY: 6, duration: 0.5, ease: 'power2.out' }, '<0.05')
        .call(() => {
          gsap.ticker.remove(tick);
          onDone && onDone();
        });

      if (reduced) {
        tl.timeScale(1.8);
        outro.timeScale(1.8);
      }
      return () => gsap.ticker.remove(tick);
    }, el);

    return () => {
      cancelled = true;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pl" ref={root} role="status" aria-live="polite" aria-label="Loading EDSCRIPT">
      <div className="pl__panel pl__panel--top">
        <div className="pl__bg" style={{ backgroundImage: `url(${preloaderBg})` }} />
      </div>
      <div className="pl__panel pl__panel--bottom">
        <div className="pl__bg" style={{ backgroundImage: `url(${preloaderBg})` }} />
      </div>
      <div className="pl__grain" aria-hidden="true" />
      <div className="pl__seam" aria-hidden="true" />

      {/* viewfinder frame */}
      <span className="pl__corner pl__corner--tl" />
      <span className="pl__corner pl__corner--tr" />
      <span className="pl__corner pl__corner--bl" />
      <span className="pl__corner pl__corner--br" />

      <div className="pl__hud" aria-hidden="true">
        <div className="pl__hud-item pl__hud-item--tl">
          <span className="pl__rec" /> REC
        </div>
        <div className="pl__hud-item pl__hud-item--tr">SCENE 01 · TAKE 01</div>
        <div className="pl__hud-item pl__hud-item--bl pl__tc">00:00:00:00</div>
        <div className="pl__hud-item pl__hud-item--br">4K · 24 FPS · ISO 800</div>
      </div>

      {/* film leader */}
      <div className="pl__stage" aria-hidden="true">
        <span className="pl__cross pl__cross--h" />
        <span className="pl__cross pl__cross--v" />
        <div className="pl__leader">
          <div className="pl__sweep" />
          <div className="pl__ring pl__ring--outer" />
          <div className="pl__ring pl__ring--inner" />
          <span className="pl__num">3</span>
        </div>
        <div className="pl__beat-wrap">
          <span className="pl__beat">Story.</span>
        </div>

        <div className="pl__logo">
          <img className="pl__logo-img" src={logoLight} alt="" width="1000" height="298" />
        </div>
      </div>

      <div className="pl__meter" aria-hidden="true">
        <span className="pl__meter-label">Setting the scene</span>
        <span className="pl__bar"><span className="pl__bar-fill" /></span>
        <span className="pl__meter-pct"><span className="pl__pct">00</span>%</span>
      </div>
    </div>
  );
}
