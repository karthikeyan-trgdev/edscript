import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Award, BadgePercent, CalendarDays, CheckCircle2, MessageCircle, Video } from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/about-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import Faq from '../components/Faq.jsx';
import Admissions from '../components/Admissions.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import { SmartLink } from '../lib/nav.jsx';
import { inr, afterScholarship, scholarships, topPct } from '../lib/fees.js';
import { imageFor, programIcons } from '../lib/programs.js';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/programs-page.css';

gsap.registerPlugin(ScrollTrigger);

const page = content.pages.programs;
const { programs, courses = {}, courseCommon } = content;

/** One-line format for the row's callout, from whatever course details are confirmed. */
const formatLine = (d) => [d.durationShort, d.hours && `${d.hours} live`, courseCommon.mode].filter(Boolean).join(' · ');

export default function ProgramsPage({ ready }) {
  usePageTitle(page.title);
  const root = useRef(null);

  // images drift inside their frames as you scroll
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.prog__media img').forEach((img) => {
          gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
            yPercent: 6,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: { trigger: img.closest('.prog__media'), start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="03" crumb={page.title} {...page.hero}>
        <div className="pindex" role="list" aria-label="Jump to a program">
          {programs.items.map((p) => {
            const Icon = programIcons[p.icon] || Video;
            return (
              <SmartLink key={p.slug} to={`#${p.slug}`} className="pindex__chip" role="listitem">
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                {p.title}
              </SmartLink>
            );
          })}
        </div>
      </PageHero>

      <section className="plist" ref={root} aria-label="All programs">
        <div className="container">
          {programs.items.map((p, i) => {
            const Icon = programIcons[p.icon] || Video;
            const num = String(i + 1).padStart(2, '0');
            const course = courses[p.slug];
            const list = course ? course.create.map((c) => c.text) : p.learn;
            return (
              <article className={`prog ${i % 2 ? 'prog--flip' : ''}`} id={p.slug} key={p.slug} aria-labelledby={`${p.slug}-title`}>
                <div className="prog__media" data-aos={i % 2 ? 'fade-left' : 'fade-right'}>
                  <img src={imageFor(p.image)} alt="" width="1672" height="941" loading="lazy" decoding="async" />
                  <span className="prog__shade" aria-hidden="true" />
                  <span className="prog__badge glass" aria-hidden="true">
                    <span className="glass__fx" />
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                  <span className="prog__num" aria-hidden="true">{num}</span>
                </div>

                <div className="prog__body">
                  <p className="eyebrow" data-aos="fade-up">Program {num}</p>
                  <h2 className="prog__title" id={`${p.slug}-title`} data-aos="fade-up" data-aos-delay="60">{p.title}</h2>
                  <p className="prog__summary" data-aos="fade-up" data-aos-delay="120">{p.summary}</p>

                  <h3 className="prog__label" data-aos="fade-up" data-aos-delay="160">{course ? 'What you’ll create' : page.learnLabel}</h3>
                  <ul className="prog__learn" data-aos="fade-up" data-aos-delay="200">
                    {list.map((item) => (
                      <li key={item}><CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />{item}</li>
                    ))}
                  </ul>

                  <div className="prog__outcome glass" data-aos="fade-up" data-aos-delay="240">
                    <span className="glass__fx" aria-hidden="true" />
                    {course ? <CalendarDays size={22} strokeWidth={1.9} aria-hidden="true" /> : <Award size={22} strokeWidth={1.9} aria-hidden="true" />}
                    {course
                      ? (
                        <div>
                          <p><strong>Format</strong>{formatLine(course.details)}</p>
                          <p className="prog__fee"><strong>Fee</strong>{inr(course.fee)} + GST · {inr(afterScholarship(course.fee, topPct))} with a {topPct}% scholarship</p>
                        </div>
                      )
                      : <p><strong>{page.outcomeLabel}</strong>{p.outcome}</p>}
                  </div>

                  <div className="prog__actions" data-aos="fade-up" data-aos-delay="280">
                    {course ? (
                      <>
                        <SmartLink to={`/programs/${p.slug}`} className="btn btn--outline">
                          <span>View Detail</span>
                          <ArrowRight className="btn__arrow" size={18} strokeWidth={2.4} />
                        </SmartLink>
                        <SmartLink to={`/register?program=${p.slug}`} className="btn btn--primary">
                          <span>Apply for this program</span>
                          <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
                        </SmartLink>
                      </>
                    ) : (
                      <>
                        <SmartLink to={`/register?program=${p.slug}`} className="btn btn--primary">
                          <span>Apply for this program</span>
                          <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
                        </SmartLink>
                        <SmartLink to="/contact" className="btn btn--outline">
                          <MessageCircle size={17} strokeWidth={2.2} aria-hidden="true" />
                          <span>Ask a question</span>
                        </SmartLink>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pfees" id="fees" aria-labelledby="fees-title">
        <div className="container">
          <header className="sec-head" data-aos="fade-up">
            <p className="eyebrow">Fees &amp; scholarships</p>
            <h2 className="sec-title" id="fees-title">Clear fees. <span className="text-accent">Real support.</span></h2>
          </header>

          <div className="pfees__table glass" role="table" aria-label="Programme fees" data-aos="fade-up">
            <span className="glass__fx" aria-hidden="true" />
            <div className="pfees__row pfees__row--head" role="row">
              <span role="columnheader">#</span>
              <span role="columnheader">Programme</span>
              <span role="columnheader">Duration</span>
              <span role="columnheader">Fee*</span>
              <span role="columnheader">With {topPct}% scholarship</span>
            </div>
            {programs.items.map((p, i) => {
              const c = courses[p.slug];
              const d = c.details;
              return (
                <SmartLink to={`/programs/${p.slug}`} className="pfees__row" role="row" key={p.slug}>
                  <span className="pfees__num" role="cell">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pfees__name" role="cell">{c.name}</span>
                  <span className="pfees__dur" role="cell" data-label="Duration">{[d.durationShort, d.hours && d.hours.replace(' hours', ' hrs')].filter(Boolean).join(' · ')}</span>
                  <span className="pfees__fee" role="cell" data-label="Fee*">{inr(c.fee)}</span>
                  <span className="pfees__sch" role="cell" data-label={`With ${topPct}% scholarship`}>{inr(afterScholarship(c.fee, topPct))}</span>
                </SmartLink>
              );
            })}
          </div>
          <p className="pfees__foot" data-aos="fade-up">*{courseCommon.feeNote}</p>

          <div className="pfees__sch-block" id="scholarships">
            <div className="pfees__sch-copy" data-aos="fade-up">
              <span className="pfees__sch-icon" aria-hidden="true"><BadgePercent size={26} strokeWidth={1.8} /></span>
              <p className="eyebrow">{scholarships.eyebrow}</p>
              <h3 className="pfees__sch-title">{scholarships.title}</h3>
              <p className="pfees__sch-text">{scholarships.text}</p>
            </div>
            <ul className="pfees__tiers">
              {scholarships.tiers.map((t, i) => (
                <li className="pfees__tier glass" key={t.name} data-aos="fade-up" data-aos-delay={i * 90}>
                  <span className="glass__fx" aria-hidden="true" />
                  <strong className="pfees__tier-pct">{t.pct}%</strong>
                  <span className="pfees__tier-name">{t.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="pfees__note" data-aos="fade-up">{scholarships.note} {courseCommon.feeDisclaimer}</p>
        </div>
      </section>

      <Admissions />
      <Faq />
      <CtaBanner />
    </>
  );
}
