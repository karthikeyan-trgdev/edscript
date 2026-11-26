import { ArrowUpRight, MessageCircle } from 'lucide-react';
import content from '@shared/content.json';
import ctaBg from '@assets/images/footer-bg.webp';
import { SmartLink } from '../lib/nav.jsx';
import '../styles/cta-banner.css';

const { cta } = content.pages;

// Dark teal closing band near the end of inner pages; course pages pass their own heading
export default function CtaBanner({ titleLine = cta.titleLine, titleAccent = cta.titleAccent }) {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta-band__card" data-aos="zoom-in-up">
          <img className="cta-band__bg" src={ctaBg} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <span className="cta-band__ring cta-band__ring--a" aria-hidden="true" />
          <span className="cta-band__ring cta-band__ring--b" aria-hidden="true" />
          <div className="cta-band__copy">
            <h2 className="cta-band__title" id="cta-title">
              {titleLine} <span>{titleAccent}</span>
            </h2>
            <p className="cta-band__text">{cta.text}</p>
          </div>
          <div className="cta-band__actions">
            <SmartLink to={cta.primary.href} className="btn btn--primary btn--lg">
              <span>{cta.primary.label}</span>
              <ArrowUpRight className="btn__arrow" size={20} strokeWidth={2.4} />
            </SmartLink>
            <SmartLink to={cta.secondary.href} className="btn btn--lg cta-band__ghost">
              <MessageCircle size={18} strokeWidth={2.2} aria-hidden="true" />
              <span>{cta.secondary.label}</span>
            </SmartLink>
          </div>
        </div>
      </div>
    </section>
  );
}
