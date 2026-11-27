import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, ArrowUpRight, Award, BarChart3, Briefcase, CalendarDays, ChevronDown, ChevronRight,
  Clapperboard, Clock, FileText, Film, GraduationCap, Layers, LayoutTemplate, MapPin, Megaphone,
  MessageCircle, Mic, Palette, PenLine, Quote, Rocket, Scissors, ShieldCheck, Smartphone, Sparkles,
  Store, Target, TrendingUp, Users, Video, Wrench,
} from 'lucide-react';
import content from '@shared/content.json';
import CtaBanner from '../components/CtaBanner.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { SmartLink } from '../lib/nav.jsx';
import { imageFor, programIcons } from '../lib/programs.js';
import { useLenisInstance } from '../hooks/useLenis.js';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/course.css';

gsap.registerPlugin(ScrollTrigger);

const { programs, courses = {}, courseCommon: common, scholarships } = content;

const ICONS = {
  clapper: Clapperboard, pen: PenLine, palette: Palette, briefcase: Briefcase, mic: Mic, cap: GraduationCap,
  rocket: Rocket, trending: TrendingUp, target: Target, sparkles: Sparkles, store: Store, users: Users,
  film: Film, layers: Layers, file: FileText, award: Award, scissors: Scissors, layout: LayoutTemplate,
  megaphone: Megaphone, chart: BarChart3, smartphone: Smartphone,
};

const SECTIONS = [
  ['overview', 'Overview'],
  ['audience', 'Who it’s for'],
  ['curriculum', 'Curriculum'],
  ['create', 'What you’ll create'],
  ['details', 'Course details'],
  ['careers', 'Careers'],
  ['faqs', 'FAQs'],
];
const SUBNAV_OFFSET = -170; // fixed navbar + sticky section nav
// old course URLs that still get shared around
const RENAMED = { 'influencer-creator-marketing': 'social-media-content-creation' };

export default function CoursePage({ ready }) {
  const { slug } = useParams();
  if (RENAMED[slug]) return <Navigate to={`/programs/${RENAMED[slug]}`} replace />;
  const course = courses[slug];
  const index = programs.items.findIndex((p) => p.slug === slug);
  if (!course || index < 0) return <NotFoundPage ready={ready} />;
  return <Course key={slug} course={course} program={programs.items[index]} index={index} ready={ready} />;
}

function Course({ course, program, index, ready }) {
  usePageTitle(course.name);
  const root = useRef(null);
  const lenis = useLenisInstance();
  const [active, setActive] = useState('overview');
  const d = course.details;
  const ProgramIcon = programIcons[program.icon] || Video;
  const num = String(index + 1).padStart(2, '0');
  const rule = course.rule || common.rule;
  const [audLead, audAccent] = course.audienceHeading || ['Built for people who', 'make things.'];

  // split the name so its last word takes the accent colour
  const words = course.name.split(' ');
  const nameLead = words.slice(0, -1).join(' ');
  const nameAccent = words.at(-1);

  const facts = [
    d.durationShort && { icon: CalendarDays, label: 'Duration', value: d.durationShort },
    { icon: Clock, label: 'Sessions', value: d.sessionsShort || '3 a week, 2 hrs' },
    d.hours && { icon: Video, label: 'Live learning', value: d.hours },
    { icon: MapPin, label: 'Mode', value: 'Offline, in-centre' },
  ].filter(Boolean);

  const spec = [
    ['Duration', d.duration],
    ['Sessions', d.sessions || common.sessionFormat],
    ['Live learning hours', d.hours],
    ['Mode', common.mode],
    ['Approach', common.approach],
    ['Level', d.level],
    ['Eligibility', d.eligibility],
  ].filter(([, v]) => v);

  const others = programs.items.filter((p) => p.slug !== program.slug && courses[p.slug]);

  // ---- motion ----
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // hero intro, once the preloader has opened
        gsap.set('.chero__line-inner', { yPercent: 115, rotate: 2 });
        gsap.set('.chero__fade', { y: 24, opacity: 0 });
        gsap.set('.chero__media', { clipPath: 'inset(12% 10% 12% 10% round 32px)' });
        gsap.set('.chero__media img', { scale: 1.25 });
        if (ready) {
          gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
            .to('.chero__media', { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.6, clearProps: 'clipPath' }, 0)
            .to('.chero__media img', { scale: 1.08, duration: 2 }, 0)
            .to('.chero__line-inner', { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.12 }, 0.2)
            .to('.chero__fade', { y: 0, opacity: 1, duration: 1, stagger: 0.07, clearProps: 'transform' }, 0.4);
        }

        // hero image drifts as you scroll away
        gsap.fromTo('.chero__media img', { yPercent: 0 }, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '.chero', start: 'top top', end: 'bottom top', scrub: true },
        });

        // curriculum line fills as you read down the modules
        gsap.fromTo('.cmods__fill', { scaleY: 0 }, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.cmods', start: 'top 70%', end: 'bottom 60%', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  // highlight the section in view
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // the section nav gets a frosted backdrop once it sticks under the navbar
  const subRef = useRef(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = subRef.current;
    if (!el) return undefined;
    const check = () => {
      const top = parseFloat(getComputedStyle(el).top) || 0;
      setStuck(el.getBoundingClientRect().top <= top + 1);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // keep the active chip in view in the (scrollable) sub-nav on small screens
  useEffect(() => {
    const chip = root.current?.querySelector(`.csub__link[data-id="${active}"]`);
    const track = chip?.parentElement;
    if (!chip || !track || track.scrollWidth <= track.clientWidth) return;
    track.scrollTo({ left: chip.offsetLeft - track.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  const jump = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: SUBNAV_OFFSET, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + SUBNAV_OFFSET, behavior: 'smooth' });
  };

  return (
    <div className="course" ref={root}>
      {/* ================= hero ================= */}
      <section className="chero" aria-labelledby="course-title">
        <div className="chero__orb" aria-hidden="true" />
        <div className="container chero__grid">
          <div className="chero__copy">
            <nav className="chero__crumbs glass chero__fade" aria-label="Breadcrumb">
              <span className="glass__fx" aria-hidden="true" />
              <SmartLink to="/">Home</SmartLink>
              <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
              <SmartLink to="/programs">Programs</SmartLink>
              <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
              <span aria-current="page">{course.name}</span>
            </nav>

            <p className="eyebrow chero__fade">Program {num}{d.durationShort ? ` · ${d.durationShort}` : ''}</p>
            <h1 className="chero__title" id="course-title">
              {nameLead && <span className="chero__line"><span className="chero__line-inner">{nameLead}</span></span>}
              <span className="chero__line"><span className="chero__line-inner text-accent">{nameAccent}.</span></span>
            </h1>
            <p className="chero__headline chero__fade">{course.headline}</p>

            <div className="chero__actions chero__fade">
              <SmartLink to={`/register?program=${program.slug}`} className="btn btn--primary btn--lg">
                <span>Apply for this course</span>
                <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
              </SmartLink>
              <SmartLink to="/contact" className="btn btn--glass glass btn--lg">
                <span className="glass__fx" aria-hidden="true" />
                <MessageCircle size={17} strokeWidth={2.2} aria-hidden="true" />
                <span>Talk to us</span>
              </SmartLink>
            </div>

            <ul className="chero__facts">
              {facts.map(({ icon: Icon, label, value }) => (
                <li className="chero__fact glass chero__fade" key={label}>
                  <span className="glass__fx" aria-hidden="true" />
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  <span><small>{label}</small>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="chero__media">
            <img src={imageFor(program.image)} alt="" width="1672" height="941" decoding="async" />
            <span className="chero__shade" aria-hidden="true" />
            <span className="chero__corner chero__corner--tl" aria-hidden="true" />
            <span className="chero__corner chero__corner--tr" aria-hidden="true" />
            <span className="chero__corner chero__corner--bl" aria-hidden="true" />
            <span className="chero__corner chero__corner--br" aria-hidden="true" />
            {program.slug === 'ai-filmmaking' && <span className="chero__rec" aria-hidden="true"><i /> REC</span>}
            <figcaption className="chero__badge glass">
              <span className="glass__fx" aria-hidden="true" />
              <span className="chero__badge-icon" aria-hidden="true"><ProgramIcon size={22} strokeWidth={1.9} /></span>
              <span><small>The EDSCRIPT rule</small>{rule}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= sticky section nav ================= */}
      <nav className={`csub ${stuck ? 'is-stuck' : ''}`} ref={subRef} aria-label="On this page">
        <div className="container">
          <div className="csub__bar glass">
            <span className="glass__fx" aria-hidden="true" />
            <div className="csub__track">
              {SECTIONS.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  data-id={id}
                  className={`csub__link ${active === id ? 'is-active' : ''}`}
                  aria-current={active === id ? 'true' : undefined}
                  onClick={(e) => jump(e, id)}
                >
                  {label}
                </a>
              ))}
            </div>
            <SmartLink to={`/register?program=${program.slug}`} className="csub__apply">
              Apply <ArrowUpRight size={15} strokeWidth={2.4} aria-hidden="true" />
            </SmartLink>
          </div>
        </div>
      </nav>

      {/* ================= overview ================= */}
      <section className="csec cover" id="overview" aria-labelledby="overview-title">
        <div className="container cover__grid">
          <div className="cover__lead" data-aos="fade-up">
            <p className="eyebrow">Overview</p>
            <h2 className="sec-title" id="overview-title">{course.motto ? <>{course.motto[0]} <span className="text-accent">{course.motto[1]}</span></> : <>Why this <span className="text-accent">program.</span></>}</h2>
            <blockquote className="cover__quote">
              <Quote className="cover__quote-mark" size={44} strokeWidth={1.4} aria-hidden="true" />
              <p>{course.overview[0]}</p>
            </blockquote>
          </div>
          <div className="cover__body">
            {course.overview.slice(1).map((p, i) => (
              <p className="cover__text" key={i} data-aos="fade-up" data-aos-delay={80 + i * 80}>{p}</p>
            ))}
            <div className="cover__rule" data-aos="fade-up" data-aos-delay="240">
              <ShieldCheck size={26} strokeWidth={1.8} aria-hidden="true" />
              <p><strong>The EDSCRIPT rule</strong>{rule}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= audience ================= */}
      <section className="csec caud" id="audience" aria-labelledby="audience-title">
        <div className="container">
          <header className="sec-head" data-aos="fade-up">
            <p className="eyebrow">Who it’s for</p>
            <h2 className="sec-title" id="audience-title">{audLead} <span className="text-accent">{audAccent}</span></h2>
          </header>
          <ul className="caud__grid">
            {course.audience.map((a, i) => {
              const Icon = ICONS[a.icon] || Sparkles;
              return (
                <li className="caud__card glass" key={a.text} data-aos="fade-up" data-aos-delay={i * 90}>
                  <span className="glass__fx" aria-hidden="true" />
                  <span className="caud__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="caud__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.9} /></span>
                  <p>{a.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ================= curriculum ================= */}
      <section className="csec ccur" id="curriculum" aria-labelledby="curriculum-title">
        <div className="container ccur__grid">
          <div className="ccur__intro">
            <div className="ccur__sticky" data-aos="fade-up">
              <p className="eyebrow">What you will learn</p>
              <h2 className="sec-title" id="curriculum-title">
                {course.modules.length} modules. <span className="text-accent">One real project.</span>
              </h2>
              <p className="ccur__desc">{common.approach}.</p>
              <ul className="ccur__stats">
                <li><strong>{String(course.modules.length).padStart(2, '0')}</strong><span>Modules</span></li>
                {d.durationShort && <li><strong>{d.durationShort.split(' ')[0]}</strong><span>Weeks</span></li>}
                {d.hours && <li><strong>{d.hours.split(' ')[0]}</strong><span>Live hours</span></li>}
              </ul>
            </div>
          </div>

          <ol className="cmods">
            <span className="cmods__line" aria-hidden="true"><span className="cmods__fill" /></span>
            {course.modules.map((m, i) => (
              <li className="cmod" key={m.title} data-aos="fade-up" data-aos-delay={(i % 3) * 60}>
                <span className="cmod__dot" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="cmod__card glass">
                  <span className="glass__fx" aria-hidden="true" />
                  <h3 className="cmod__title">{m.title}</h3>
                  <p className="cmod__text">{m.covers}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= what you'll create ================= */}
      <section className="csec ccreate" id="create" aria-labelledby="create-title">
        <div className="container">
          <div className="ccreate__panel">
            <div className="ccreate__bg" aria-hidden="true">
              <img src={imageFor(program.image)} alt="" loading="lazy" decoding="async" />
            </div>
            <header className="ccreate__head" data-aos="fade-up">
              <p className="eyebrow">What you will create</p>
              <h2 className="ccreate__title" id="create-title">You leave with <span>work, not notes.</span></h2>
            </header>
            <ul className="ccreate__grid">
              {course.create.map((c, i) => {
                const Icon = ICONS[c.icon] || Award;
                return (
                  <li className="ccreate__item" key={c.text} data-aos="fade-up" data-aos-delay={i * 90}>
                    <span className="ccreate__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.9} /></span>
                    <span className="ccreate__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <p>{c.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= course details ================= */}
      <section className="csec cdet" id="details" aria-labelledby="details-title">
        <div className="container">
          <header className="sec-head" data-aos="fade-up">
            <p className="eyebrow">Course details</p>
            <h2 className="sec-title" id="details-title">The <span className="text-accent">fine print.</span></h2>
          </header>
          <div className="cdet__grid">
            <dl className="cdet__sheet glass" data-aos="fade-up">
              <span className="glass__fx" aria-hidden="true" />
              {spec.map(([k, v]) => (
                <div className="cdet__row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              {d.tools && (
                <div className="cdet__row">
                  <dt>Key tools</dt>
                  <dd>
                    <ul className="cdet__tools">
                      {d.tools.map((t) => <li key={t}><Wrench size={13} strokeWidth={2.2} aria-hidden="true" />{t}</li>)}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            <aside className="cdet__cta" data-aos="fade-up" data-aos-delay="120">
              <span className="cdet__cta-icon" aria-hidden="true"><ProgramIcon size={26} strokeWidth={1.8} /></span>
              <p className="cdet__cta-label">{scholarships.eyebrow}</p>
              <p className="cdet__cta-title">{scholarships.title}</p>
              <ul className="cdet__tiers">
                {scholarships.tiers.map((t) => (
                  <li key={t.name}>
                    <span className="cdet__tier-name">{t.name}</span>
                    <strong>{t.pct}%</strong>
                  </li>
                ))}
              </ul>
              <p className="cdet__cta-text">Talk to us about batches, scholarships and whether {course.name} is the right fit for you.</p>
              <p className="cdet__cta-note">{scholarships.note}</p>
              <div className="cdet__cta-actions">
                <SmartLink to={`/register?program=${program.slug}`} className="btn btn--light">
                  <span>Apply now</span>
                  <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
                </SmartLink>
                <SmartLink to="/contact" className="btn btn--ghost-light">
                  <MessageCircle size={17} strokeWidth={2.2} aria-hidden="true" />
                  <span>Enquire</span>
                </SmartLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ================= careers ================= */}
      <section className="csec ccar" id="careers" aria-labelledby="careers-title">
        <div className="container ccar__grid">
          <header className="sec-head ccar__head" data-aos="fade-up">
            <p className="eyebrow">Career and business applications</p>
            <h2 className="sec-title" id="careers-title">Where this <span className="text-accent">can take you.</span></h2>
            <p className="ccar__note">{common.careersNote}</p>
            {content.careerPaths?.courses?.[program.slug] && (
              <SmartLink to={`/career-paths#${program.slug}`} className="btn btn--outline ccar__more">
                <span>See every role and route</span>
                <ArrowRight className="btn__arrow" size={18} strokeWidth={2.4} />
              </SmartLink>
            )}
          </header>
          <ul className="ccar__list">
            {course.careers.map((c, i) => (
              <li className="ccar__chip glass" key={c} data-aos="fade-up" data-aos-delay={i * 60}>
                <span className="glass__fx" aria-hidden="true" />
                <Briefcase size={17} strokeWidth={2} aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= faqs ================= */}
      <section className="csec cfaq" id="faqs" aria-labelledby="faqs-title">
        <div className="container cfaq__grid">
          <header className="sec-head" data-aos="fade-up">
            <p className="eyebrow">FAQs</p>
            <h2 className="sec-title" id="faqs-title">Questions about <span className="text-accent">{course.name}.</span></h2>
            <SmartLink to="/contact" className="btn btn--outline cfaq__ask">
              <span>Ask us anything</span>
              <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
            </SmartLink>
          </header>
          <Accordion items={course.faqs} />
        </div>
      </section>

      {/* ================= other programs ================= */}
      <section className="csec cmore" aria-labelledby="more-title">
        <div className="container">
          <header className="cmore__head" data-aos="fade-up">
            <h2 className="cmore__title" id="more-title">Explore other programs</h2>
            <SmartLink to="/programs" className="cmore__all">All programs <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" /></SmartLink>
          </header>
          <ul className="cmore__grid">
            {others.map((p, i) => {
              const Icon = programIcons[p.icon] || Video;
              return (
                <li key={p.slug} data-aos="fade-up" data-aos-delay={i * 80}>
                  <SmartLink to={`/programs/${p.slug}`} className="cmore__card glass">
                    <span className="glass__fx" aria-hidden="true" />
                    <span className="cmore__media">
                      <img src={imageFor(p.image)} alt="" loading="lazy" decoding="async" />
                      <span className="cmore__icon" aria-hidden="true"><Icon size={18} strokeWidth={2} /></span>
                    </span>
                    <span className="cmore__body">
                      <span className="cmore__name">{courses[p.slug].name}</span>
                      <span className="cmore__meta">{courses[p.slug].details.durationShort || 'Offline, in-centre'}</span>
                    </span>
                    <ArrowUpRight className="cmore__arrow" size={18} strokeWidth={2.4} aria-hidden="true" />
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBanner titleLine={course.cta?.[0]} titleAccent={course.cta?.[1]} />
    </div>
  );
}

/** FAQ accordion. Open state lives in data-open (not className) so AOS classes survive re-renders. */
function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <ul className="cfaq__list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li className="cfaq__item glass" key={item.q} data-open={isOpen} data-aos="fade-up" data-aos-delay={i * 70}>
            <span className="glass__fx" aria-hidden="true" />
            <h3>
              <button
                type="button"
                className="cfaq__q"
                id={`${id}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <ChevronDown className="cfaq__chevron" size={20} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </h3>
            <div className="cfaq__panel" id={`${id}-a${i}`} role="region" aria-labelledby={`${id}-q${i}`}>
              <div><p className="cfaq__a">{item.a}</p></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
