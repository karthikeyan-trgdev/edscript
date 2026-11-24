import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import content from '@shared/content.json';
import faqBg from '@assets/images/lets-talk-bg.jpg';
import { SmartLink } from '../lib/nav.jsx';
import '../styles/faq.css';

const { faq } = content;

export default function Faq() {
  const root = useRef(null);
  const panels = useRef([]);
  const [open, setOpen] = useState(0);
  const uid = useId();
  const first = useRef(true);

  // Headline lines slide up as the section scrolls in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.faq__line-inner',
          { yPercent: 115, rotate: 2 },
          {
            yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out',
            scrollTrigger: { trigger: '.faq__title', start: 'top 85%', once: true },
          });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // NOTE: open state lives in data-open, not className. AOS adds its own classes to
  // these items, and a changing className from React would wipe them (hiding the item).
  // Open/close panels by animating their height
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panels.current.forEach((panel, i) => {
      if (!panel) return;
      const target = i === open ? 'auto' : 0;
      if (first.current || reduced) gsap.set(panel, { height: target });
      else gsap.to(panel, { height: target, duration: 0.55, ease: 'power3.inOut', overwrite: true });
    });
    first.current = false;
  }, [open]);

  return (
    <section className="faq" id="faq" ref={root} aria-labelledby="faq-title">
      <div className="faq__bg" aria-hidden="true">
        <img src={faqBg} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="faq__blob" aria-hidden="true" />
      <div className="container faq__grid">
        <div className="faq__intro">
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2 className="faq__title" id="faq-title">
            <span className="faq__line"><span className="faq__line-inner">{faq.titleLines[0]}</span></span>
            <span className="faq__line">
              <span className="faq__line-inner">
                {faq.titleLines[1]} <span className="text-accent">{faq.titleAccent}</span>
              </span>
            </span>
          </h2>
          <p className="faq__desc" data-aos="fade-up" data-aos-delay="100">{faq.description}</p>
          <div data-aos="fade-up" data-aos-delay="200">
            <SmartLink to={faq.cta.href} className="btn btn--outline faq__cta">
              <span>{faq.cta.label}</span>
              <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
            </SmartLink>
          </div>
        </div>

        <ul className="faq__list">
          {faq.items.map((item, i) => {
            const isOpen = i === open;
            const btnId = `${uid}-q${i}`;
            const panelId = `${uid}-a${i}`;
            return (
              <li
                className="faq__item glass"
                data-open={isOpen}
                key={item.q}
                data-aos="fade-up"
                data-aos-delay={i * 70}
              >
                <span className="glass__fx" aria-hidden="true" />
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <ChevronDown className="faq__chevron" size={20} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="faq__panel"
                  role="region"
                  aria-labelledby={btnId}
                  ref={(el) => { panels.current[i] = el; }}
                >
                  <p className="faq__a">{item.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
