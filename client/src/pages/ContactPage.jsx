import { ArrowUpRight, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/lets-talk-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import Contact from '../components/Contact.jsx';
import Admissions from '../components/Admissions.jsx';
import Faq from '../components/Faq.jsx';
import { SOCIAL_ICONS, whatsappHref } from '../components/SocialIcons.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/contact-page.css';

const page = content.pages.contact;
const info = content.footer.contact;
const { socials } = content.footer;

// keyless Google Maps embed; change footer.contact.mapQuery in content.json to move the pin
const mapQuery = info.mapQuery || info.location;
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

const WhatsAppIcon = () => SOCIAL_ICONS.WhatsApp;

const CARDS = [
  { icon: Mail, label: 'Email us', value: info.email, href: `mailto:${info.email}`, action: 'Write to us' },
  { icon: Phone, label: 'Call us', value: info.phone, href: `tel:${info.phone.replace(/\s/g, '')}`, action: 'Call now' },
  { icon: WhatsAppIcon, label: 'WhatsApp', value: info.whatsapp, href: whatsappHref(), action: 'Chat now', external: true, wa: true },
  { icon: MapPin, label: 'Visit us', value: info.location, href: MAP_LINK, action: 'Get directions', external: true },
];

export default function ContactPage({ ready }) {
  usePageTitle(page.title);
  const connect = page.connect;
  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="04" crumb={page.title} {...page.hero} />

      <section className="cinfo" aria-label="Contact details">
        <div className="container">
          <ul className="cinfo__grid">
            {CARDS.map(({ icon: Icon, label, value, href, action, external, wa }, i) => (
              <li key={label} data-aos="fade-up" data-aos-delay={i * 90}>
                <a
                  className="cinfo__card glass"
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="glass__fx" aria-hidden="true" />
                  <span className={`cinfo__icon ${wa ? 'cinfo__icon--wa' : ''}`} aria-hidden="true">
                    {wa ? <Icon /> : <Icon size={24} strokeWidth={1.8} />}
                  </span>
                  <span className="cinfo__label">{label}</span>
                  <span className="cinfo__value">{value}</span>
                  <span className="cinfo__action">
                    {action} <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- map + social ---- */}
      <section className="cfind" aria-labelledby="cfind-title">
        <div className="container cfind__grid">
          <div className="cfind__map glass" data-aos="fade-up">
            <span className="glass__fx" aria-hidden="true" />
            <iframe
              title={`Map: ${info.location}`}
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="cfind__pin glass">
              <span className="glass__fx" aria-hidden="true" />
              <span className="cfind__pin-icon" aria-hidden="true"><MapPin size={20} strokeWidth={2} /></span>
              <span className="cfind__pin-text">
                <small>{connect.eyebrow}</small>
                <strong>{info.location}</strong>
              </span>
              <a className="cfind__pin-go" href={MAP_LINK} target="_blank" rel="noopener noreferrer">
                <Navigation size={15} strokeWidth={2.4} aria-hidden="true" />
                Open in Google Maps
              </a>
            </div>
          </div>

          <aside className="cfind__social" data-aos="fade-up" data-aos-delay="120">
            <p className="eyebrow">{connect.eyebrow}</p>
            <h2 className="cfind__title" id="cfind-title">
              {connect.titleLine} <span className="text-accent">{connect.titleAccent}</span>
            </h2>
            <h3 className="cfind__social-title">{connect.socialTitle}</h3>
            <p className="cfind__social-text">{connect.socialText}</p>
            <ul className="cfind__list">
              {socials.map((s) => (
                <li key={s.name}>
                  <a className={`cfind__link cfind__link--${s.name.toLowerCase()}`} href={s.href} target="_blank" rel="noopener noreferrer">
                    <span className="cfind__link-icon" aria-hidden="true">{SOCIAL_ICONS[s.name]}</span>
                    <span className="cfind__link-text">
                      <strong>{s.name}</strong>
                      {s.handle && <small>{s.handle}</small>}
                    </span>
                    <ArrowUpRight className="cfind__link-arrow" size={17} strokeWidth={2.4} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <Contact />
      <Admissions />
      <Faq />
    </>
  );
}
