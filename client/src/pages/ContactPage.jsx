import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/lets-talk-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import Contact from '../components/Contact.jsx';
import Admissions from '../components/Admissions.jsx';
import Faq from '../components/Faq.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/contact-page.css';

const page = content.pages.contact;
const info = content.footer.contact;

const CARDS = [
  { icon: Mail, label: 'Email us', value: info.email, href: `mailto:${info.email}`, action: 'Write to us' },
  { icon: Phone, label: 'Call us', value: info.phone, href: `tel:${info.phone.replace(/\s/g, '')}`, action: 'Call now' },
  {
    icon: MapPin,
    label: 'Visit us',
    value: info.location,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.location)}`,
    action: 'Get directions',
    external: true,
  },
];

export default function ContactPage({ ready }) {
  usePageTitle(page.title);
  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="04" crumb={page.title} {...page.hero} />

      <section className="cinfo" aria-label="Contact details">
        <div className="container">
          <ul className="cinfo__grid">
            {CARDS.map(({ icon: Icon, label, value, href, action, external }, i) => (
              <li key={label} data-aos="fade-up" data-aos-delay={i * 90}>
                <a
                  className="cinfo__card glass"
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="glass__fx" aria-hidden="true" />
                  <span className="cinfo__icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></span>
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

      <Contact />
      <Admissions />
      <Faq />
    </>
  );
}
