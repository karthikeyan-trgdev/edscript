import { ArrowUpRight, ClipboardCheck, MessagesSquare, Search } from 'lucide-react';
import content from '@shared/content.json';
import { SmartLink } from '../lib/nav.jsx';
import '../styles/admissions.css';

const { admissions } = content;
const ICONS = [Search, MessagesSquare, ClipboardCheck];

// "Admissions: 01 Find your programme · 02 Discuss your goals · 03 Review criteria"
export default function Admissions() {
  return (
    <section className="adm" aria-labelledby="adm-title">
      <div className="container adm__grid">
        <header className="adm__head" data-aos="fade-up">
          <p className="eyebrow">{admissions.eyebrow}</p>
          <h2 className="sec-title" id="adm-title">
            {admissions.title} <span className="text-accent">{admissions.titleAccent}</span>
          </h2>
          <SmartLink to="/register" className="btn btn--primary adm__cta">
            <span>Start your application</span>
            <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
          </SmartLink>
        </header>
        <ol className="adm__steps">
          {admissions.steps.map((s, i) => {
            const Icon = ICONS[i] || ClipboardCheck;
            return (
              <li className="adm__step glass" key={s.title} data-aos="fade-up" data-aos-delay={i * 100}>
                <span className="glass__fx" aria-hidden="true" />
                <span className="adm__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="adm__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.9} /></span>
                <h3 className="adm__title">{s.title}</h3>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
