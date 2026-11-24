import { Fragment, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, GraduationCap, Layers, Sparkles } from 'lucide-react';
import content from '@shared/content.json';
import '../styles/way.css';

gsap.registerPlugin(ScrollTrigger);

const { way } = content;
const icons = { learn: GraduationCap, create: Layers, lead: Sparkles };

export default function Way() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
          defaults: { ease: 'expo.out' },
        });
        tl.from('.way__eyebrow', { opacity: 0, y: 14, duration: 0.8 })
          // the three words land one after another: learn → create → lead
          .from('.way__word-inner', { yPercent: 115, rotate: 3, duration: 1.1, stagger: 0.14 }, 0.1)
          // then the path: card, arrow, card, arrow, card
          .fromTo('.way__step', { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.22, clearProps: 'transform,opacity' }, 0.45)
          .from('.way__arrow', { opacity: 0, duration: 0.8, stagger: 0.22, clearProps: 'opacity' }, 0.75)
          .fromTo('.way__icon',
            { scale: 0.4, rotate: -20, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1, duration: 0.9, stagger: 0.22, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 0.65);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="way" id="way" ref={root} aria-labelledby="way-title">
      <div className="way__bg" aria-hidden="true">
        <svg className="way__wave way__wave--left" viewBox="0 0 600 300" preserveAspectRatio="none">
          <path d="M0 120C120 60 260 70 380 150S560 260 600 300H0Z" />
        </svg>
        <svg className="way__wave way__wave--right" viewBox="0 0 600 300" preserveAspectRatio="none">
          <path d="M600 40C470 70 380 150 300 210S120 290 0 300H600Z" />
        </svg>
      </div>

      <div className="container">
        <header className="way__head">
          <p className="eyebrow way__eyebrow">{way.eyebrow}</p>
          <h2 className="way__title" id="way-title">
            {way.title.map((w, i) => (
              <Fragment key={w.text}>
                <span className="way__word">
                  <span className={`way__word-inner ${w.accent ? 'text-accent' : ''}`}>{w.text}</span>
                </span>
                {i < way.title.length - 1 && ' '}
              </Fragment>
            ))}
          </h2>
        </header>

        <ol className="way__steps">
          {way.steps.map((s, i) => {
            const Icon = icons[s.icon] || Sparkles;
            return (
              <Fragment key={s.title}>
                <li className="way__step glass">
                  <span className="glass__fx" aria-hidden="true" />
                  <span className="way__icon" aria-hidden="true">
                    <Icon size={34} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 className="way__step-title">{s.title}</h3>
                    <p className="way__step-text">{s.text}</p>
                  </div>
                </li>
                {i < way.steps.length - 1 && (
                  <li className="way__arrow" aria-hidden="true">
                    <ArrowRight size={26} strokeWidth={1.8} />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
