import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Award, CheckCircle2, MessageCircle, Video } from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/about-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import Faq from '../components/Faq.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import { SmartLink } from '../lib/nav.jsx';
import { imageFor, programIcons } from '../lib/programs.js';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/programs-page.css';

gsap.registerPlugin(ScrollTrigger);

const page = content.pages.programs;
const { programs } = content;

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
                {p.title.split(/ (&|with) /)[0]}
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

                  <h3 className="prog__label" data-aos="fade-up" data-aos-delay="160">{page.learnLabel}</h3>
                  <ul className="prog__learn" data-aos="fade-up" data-aos-delay="200">
                    {p.learn.map((item) => (
                      <li key={item}><CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />{item}</li>
                    ))}
                  </ul>

                  <div className="prog__outcome glass" data-aos="fade-up" data-aos-delay="240">
                    <span className="glass__fx" aria-hidden="true" />
                    <Award size={22} strokeWidth={1.9} aria-hidden="true" />
                    <p><strong>{page.outcomeLabel}</strong>{p.outcome}</p>
                  </div>

                  <div className="prog__actions" data-aos="fade-up" data-aos-delay="280">
                    <SmartLink to={`/register?program=${p.slug}`} className="btn btn--primary">
                      <span>Apply for this program</span>
                      <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
                    </SmartLink>
                    <SmartLink to="/contact" className="btn btn--outline">
                      <MessageCircle size={17} strokeWidth={2.2} aria-hidden="true" />
                      <span>Ask a question</span>
                    </SmartLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Faq />
      <CtaBanner />
    </>
  );
}
