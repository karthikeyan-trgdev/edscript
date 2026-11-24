import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronRight } from 'lucide-react';
import { SmartLink } from '../lib/nav.jsx';
import '../styles/page-hero.css';

/**
 * Banner at the top of every inner page.
 * A camera viewfinder (corner brackets + REC + scene/take) frames the headline,
 * echoing the preloader, so each page feels like a new "scene".
 */
export default function PageHero({ ready, eyebrow, titleLine, titleAccent, description, crumb, image, scene = '01', compact = false, children }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('.phero__line-inner', { yPercent: 115, rotate: 2 });
        gsap.set('.phero__fade', { y: 22, opacity: 0 });
        gsap.set('.phero__corner', { scale: 0.4, opacity: 0 });
        gsap.set('.phero__bg img', { scale: 1.2 });
        if (!ready) return;
        gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 })
          .to('.phero__bg img', { scale: 1.08, duration: 2.2, ease: 'power3.out' }, 0)
          .to('.phero__corner', { scale: 1, opacity: 1, duration: 1, stagger: 0.06 }, 0.1)
          .to('.phero__line-inner', { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.12 }, 0.25)
          .to('.phero__fade', { y: 0, opacity: 1, duration: 1, stagger: 0.08, clearProps: 'transform' }, 0.45);
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className={`phero ${compact ? 'phero--compact' : ''}`} ref={root} aria-labelledby="page-title">
      <div className="phero__bg" aria-hidden="true">
        {image && <img src={image} alt="" decoding="async" />}
      </div>
      <div className="phero__orb" aria-hidden="true" />

      <div className="container">
        <div className="phero__frame">
          <span className="phero__corner phero__corner--tl" aria-hidden="true" />
          <span className="phero__corner phero__corner--tr" aria-hidden="true" />
          <span className="phero__corner phero__corner--bl" aria-hidden="true" />
          <span className="phero__corner phero__corner--br" aria-hidden="true" />
          <span className="phero__hud phero__hud--rec phero__fade" aria-hidden="true"><i /> REC</span>
          <span className="phero__hud phero__hud--scene phero__fade" aria-hidden="true">SCENE {scene} · TAKE 01</span>

          <nav className="phero__crumbs glass phero__fade" aria-label="Breadcrumb">
            <span className="glass__fx" aria-hidden="true" />
            <SmartLink to="/">Home</SmartLink>
            <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
            <span aria-current="page">{crumb}</span>
          </nav>

          <p className="eyebrow phero__fade">{eyebrow}</p>
          <h1 className="phero__title" id="page-title">
            <span className="phero__line"><span className="phero__line-inner">{titleLine}</span></span>
            <span className="phero__line"><span className="phero__line-inner text-accent">{titleAccent}</span></span>
          </h1>
          {description && <p className="phero__desc phero__fade">{description}</p>}
          {children && <div className="phero__actions phero__fade">{children}</div>}
        </div>
      </div>
    </section>
  );
}
