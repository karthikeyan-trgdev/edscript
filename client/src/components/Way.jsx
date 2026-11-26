import { Fragment, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, Compass, Layers, Lightbulb, PenTool, Presentation, Rocket, Sparkles, Users } from 'lucide-react';
import content from '@shared/content.json';
import '../styles/way.css';

gsap.registerPlugin(ScrollTrigger);

const { way } = content;
const icons = {
  compass: Compass, layers: Layers, create: PenTool, present: Presentation, rocket: Rocket,
  sparkles: Sparkles, bulb: Lightbulb, users: Users, chart: BarChart3,
};

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
          // then the path draws across and the five steps land along it
          .fromTo('.way__line-fill', { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: 'power2.inOut', clearProps: 'transform' }, 0.4)
          .fromTo('.way__step', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.16, clearProps: 'transform,opacity' }, 0.45)
          .fromTo('.way__chip', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, clearProps: 'transform,opacity' }, 1.2);
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
          <li className="way__line" aria-hidden="true"><span className="way__line-fill" /></li>
          {way.steps.map((s, i) => {
            const Icon = icons[s.icon] || Sparkles;
            return (
              <li className="way__step" key={s.title}>
                <span className="way__node" aria-hidden="true">
                  <Icon size={26} strokeWidth={1.8} />
                </span>
                <div className="way__card glass">
                  <span className="glass__fx" aria-hidden="true" />
                  <span className="way__num">Step {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="way__step-title">{s.title}</h3>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="way__built">
          <p className="way__built-label">{way.builtIn.label}</p>
          <ul className="way__chips">
            {way.builtIn.items.map(({ icon, text }) => {
              const Icon = icons[icon] || Sparkles;
              return (
                <li className="way__chip" key={text}>
                  <Icon size={17} strokeWidth={2} aria-hidden="true" />
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
