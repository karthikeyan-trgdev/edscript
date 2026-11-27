import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, MapPin, Phone } from 'lucide-react';
import content from '@shared/content.json';
import footerBg from '@assets/images/footer-bg.webp';
import logoLight from '@assets/images/logo/ed-script-logo-light.png';
import { useGo } from '../lib/nav.jsx';
import { SOCIAL_ICONS } from './SocialIcons.jsx';
import '../styles/footer.css';

const { brand, footer } = content;

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
