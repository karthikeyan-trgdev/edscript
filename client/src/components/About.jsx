import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import homeImg from '@assets/images/about.jpg'; // home page About section
import pageImg from '@assets/images/about-page-image.jpg'; // About page
import content from '@shared/content.json';
import { SmartLink } from '../lib/nav.jsx';
import '../styles/about.css';

gsap.registerPlugin(ScrollTrigger);

const { about } = content;

/**
 * @param extra  optional { paragraphs, highlights } shown on the About page (taller copy column,
 *               so the image card can grow to show the full square image)
 * @param icons  map of icon key -> lucide component for extra.highlights
 */
export default function About({ showCta = true, extra = null, icons = {} }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Image card opens from a smaller frame as it scrolls into view
        gsap.timeline({
          scrollTrigger: { trigger: '.about__media', start: 'top 82%', once: true },
          defaults: { ease: 'expo.out' },
        })
          .fromTo('.about__media',
            { clipPath: 'inset(14% 10% 14% 10% round 32px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.6, clearProps: 'clipPath' })
          .fromTo('.about__img', { scale: 1.18 }, { scale: 1.04, duration: 1.8 }, 0);

        // Slow parallax inside the card
        gsap.fromTo('.about__img-wrap', { yPercent: -4 }, {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });

        // Headline lines slide up from a mask
        gsap.from('.about__line-inner', {
          yPercent: 115,
          rotate: 2,
          duration: 1.2,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.about__title', start: 'top 85%', once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);


  return (
    <section className={extra ? 'about about--page' : 'about'} id="about" ref={root} aria-labelledby="about-title">
      <div className="about__glow" aria-hidden="true" />
      <div className="container about__grid">
        <figure className="about__media">
          <div className="about__img-wrap">
            <img
              className="about__img"
              src={extra ? pageImg : homeImg}
              alt="A creator looking up, surrounded by glowing panels for AI, audio, film and editing"
              width="2048"
              height="2048"
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="about__shade" aria-hidden="true" />
        </figure>

        <div className="about__content">
          <p className="eyebrow" data-aos="fade-up">{about.eyebrow}</p>

          <h2 className="about__title" id="about-title">
            <span className="about__line">
              <span className="about__line-inner">{about.titleLine}</span>
            </span>
            <span className="about__line">
              <span className="about__line-inner text-accent">{about.titleAccent}</span>
            </span>
          </h2>

          <p className="about__lead" data-aos="fade-up" data-aos-delay="100">{about.lead}</p>
          {about.paragraphs.map((p, i) => (
            <p className="about__text" key={i} data-aos="fade-up" data-aos-delay={180 + i * 80}>
              {p}
            </p>
          ))}

          {extra?.paragraphs?.map((p, i) => (
            <p className="about__text" key={`x${i}`} data-aos="fade-up" data-aos-delay={340 + i * 80}>
              {p}
            </p>
          ))}

          {extra?.highlights?.length > 0 && (
            <ul className="about__highlights">
              {extra.highlights.map((h, i) => {
                const Icon = icons[h.icon];
                return (
                  <li className="about__hl glass" key={h.title} data-aos="fade-up" data-aos-delay={420 + i * 90}>
                    <span className="glass__fx" aria-hidden="true" />
                    {Icon && (
                      <span className="about__hl-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.9} /></span>
                    )}
                    <span className="about__hl-body">
                      <strong>{h.title}</strong>
                      <span>{h.text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {showCta && (
          <div data-aos="fade-up" data-aos-delay="340">
            <SmartLink to={about.cta.href} className="btn btn--glass glass about__cta">
              <span className="glass__fx" aria-hidden="true" />
              <span>{about.cta.label}</span>
              <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
            </SmartLink>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
