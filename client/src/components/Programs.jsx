import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Video } from 'lucide-react';
import content from '@shared/content.json';
import programsBg from '@assets/images/about-bg.jpg';
import { imageFor, programIcons } from '../lib/programs.js';
import cardFilm from '@assets/images/program-new-1.webp';
import cardPodcast from '@assets/images/program-new-2.webp';
import cardBrand from '@assets/images/program-new-3.webp';
import cardMarketing from '@assets/images/program-new-4.webp';
import cardSocial from '@assets/images/program-new-5.webp';

// home page course cards use their own images (other pages keep content.json's programs.items[].image)
const HOME_CARD_IMAGES = {
  'ai-filmmaking': cardFilm,
  podcasting: cardPodcast,
  'brand-storytelling': cardBrand,
  'digital-marketing': cardMarketing,
  'social-media-content-creation': cardSocial,
};
import { SmartLink } from '../lib/nav.jsx';
import '../styles/programs.css';

gsap.registerPlugin(ScrollTrigger);

const { programs, courses = {} } = content;
// programs with a full course page link there; the rest jump to their row on /programs
const hrefFor = (slug) => (courses[slug] ? `/programs/${slug}` : `/programs#${slug}`);

const icons = programIcons;

export default function Programs() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.programs__line-inner', {
          yPercent: 115,
          rotate: 2,
          duration: 1.2,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.programs__title', start: 'top 85%', once: true },
        });

        // Cards rise in, row by row, as they reach the viewport
        gsap.set('.program', { y: 70, opacity: 0, scale: 0.96 });
        ScrollTrigger.batch('.program', {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.1,
              stagger: 0.12,
              ease: 'expo.out',
              clearProps: 'transform,opacity',
            }),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Subtle 3D tilt that follows the pointer (pointer devices only)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = root.current.querySelectorAll('.program__card');
    const cleanups = [...cards].map((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const move = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 7);
        rx(py * -7);
      };
      const leave = () => { rx(0); ry(0); };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      return () => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="programs" id="programs" ref={root} aria-labelledby="programs-title">
      <div className="programs__bg" aria-hidden="true">
        <img src={programsBg} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <header className="programs__head">
          <div>
            <p className="eyebrow" data-aos="fade-up">{programs.eyebrow}</p>
            <h2 className="programs__title" id="programs-title">
              <span className="programs__line">
                <span className="programs__line-inner">{programs.titleLine}</span>
              </span>{' '}
              <span className="programs__line">
                <span className="programs__line-inner text-accent">{programs.titleAccent}</span>
              </span>
            </h2>
          </div>
          <p className="programs__desc" data-aos="fade-up" data-aos-delay="150">
            {programs.description}
          </p>
        </header>

        <ul className="programs__grid">
          {programs.items.map((p) => {
            const Icon = icons[p.icon] || Video;
            return (
              <li className="program" key={p.slug}>
                <SmartLink className="program__card glass" to={hrefFor(p.slug)} aria-label={p.title}>
                  <span className="glass__fx" aria-hidden="true" />
                  <span className="program__media">
                    <img src={HOME_CARD_IMAGES[p.slug] || imageFor(p.image)} alt="" width="1672" height="941" loading="lazy" decoding="async" />
                    <span className="program__shade" aria-hidden="true" />
                    <span className="program__icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.8} />
                    </span>
                  </span>
                  <span className="program__body">
                    <span className="program__title">{p.title}</span>
                    <span className="program__arrow" aria-hidden="true">
                      <ArrowRight size={18} strokeWidth={2.4} />
                    </span>
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
