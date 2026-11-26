import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, MapPin, Phone } from 'lucide-react';
import content from '@shared/content.json';
import footerBg from '@assets/images/footer-bg.webp';
import logoLight from '@assets/images/logo/ed-script-logo-light.png';
import { useGo } from '../lib/nav.jsx';
import '../styles/footer.css';

const { brand, footer } = content;

// lucide no longer ships brand logos, so these are drawn inline
const SOCIAL_ICONS = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3.3 9h3.4v11.5H3.3V9Zm5.6 0h3.3v1.6h.05c.46-.87 1.58-1.8 3.26-1.8 3.5 0 4.14 2.3 4.14 5.3v6.4h-3.4v-5.7c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.18 1.48-2.18 3v5.8H8.9V9Z" />
    </svg>
  ),
};

export default function Footer() {
  const go = useGo();
  const root = useRef(null);

  // background drifts slightly slower than the page
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.footer__bg img',
          { yPercent: -8 },
          { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, []);


  const LinkCol = ({ col, delay }) => (
    <nav className="footer__col" aria-label={col.title} data-aos="fade-up" data-aos-delay={delay}>
      <h3 className="footer__heading">{col.title}</h3>
      <ul className="footer__links">
        {col.items.map((l) => (
          <li key={l.label}><a href={l.href} onClick={(e) => go(e, l.href)}>{l.label}</a></li>
        ))}
      </ul>
    </nav>
  );

  const { contact } = footer;

  return (
    <footer className="footer" ref={root}>
      <div className="footer__bg" aria-hidden="true">
        <img src={footerBg} alt="" loading="lazy" decoding="async" />
      </div>

      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand" data-aos="fade-up">
            <a href="/" className="footer__logo" onClick={(e) => go(e, '/')} aria-label={`${brand.name} home`}>
              <img className="footer__mark" src={logoLight} alt={`${brand.name} - ${brand.tagline}`} width="1000" height="298" loading="lazy" />
            </a>
            <p className="footer__tagline">{footer.tagline}</p>
            <ul className="footer__socials">
              {footer.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} className="footer__social" aria-label={s.name} target="_blank" rel="noopener noreferrer">
                    {SOCIAL_ICONS[s.name]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <LinkCol col={footer.quickLinks} delay={80} />
          <LinkCol col={footer.programs} delay={160} />

          <div className="footer__col" data-aos="fade-up" data-aos-delay="240">
            <h3 className="footer__heading">{contact.title}</h3>
            <ul className="footer__contact">
              <li>
                <Mail size={22} strokeWidth={1.7} aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <Phone size={22} strokeWidth={1.7} aria-hidden="true" />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </li>
              <li>
                <MapPin size={22} strokeWidth={1.7} aria-hidden="true" />
                <span>{contact.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} {footer.copyright}</p>
          <ul className="footer__legal">
            {footer.legal.map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
