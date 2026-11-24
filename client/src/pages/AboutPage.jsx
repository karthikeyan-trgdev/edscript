import {
  ArrowRight, BookOpen, Clapperboard, Compass, Eye, FolderOpen, Gem, Globe,
  GraduationCap, Rocket, Sparkles, Telescope, Zap,
} from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/preloader-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import About from '../components/About.jsx';
import Way from '../components/Way.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/about-page.css';

const page = content.pages.about;
const { about } = content;
const PRINCIPLE_ICONS = { story: BookOpen, craft: Gem, eye: Eye, work: FolderOpen };
const POINT_ICONS = { clapper: Clapperboard, sparkles: Sparkles, globe: Globe, cap: GraduationCap, zap: Zap, rocket: Rocket };

/** Vision / Mission card: icon badge with orbit ring, statement, three supporting points. */
function VmCard({ kind, num, Icon, data, text, delay = 0 }) {
  const dark = kind === 'mission';
  return (
    <article
      className={`vm__card vm__card--${kind}${dark ? '' : ' glass'}`}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {!dark && <span className="glass__fx" aria-hidden="true" />}
      <Icon className="vm__watermark" aria-hidden="true" strokeWidth={1} />
      <span className="vm__num" aria-hidden="true">{num}</span>

      <div className="vm__top">
        <span className="vm__icon" aria-hidden="true">
          <span className="vm__orbit" />
          <Icon size={28} strokeWidth={1.8} />
        </span>
        <div>
          <p className="vm__label">{data.label}</p>
          <p className="vm__kicker">{data.kicker}</p>
        </div>
      </div>

      <p className="vm__text">{text}</p>

      <ul className="vm__points">
        {data.points.map((pt) => {
          const P = POINT_ICONS[pt.icon] || Sparkles;
          return (
            <li key={pt.text}>
              <span className="vm__point-icon" aria-hidden="true"><P size={17} strokeWidth={2} /></span>
              <span>{pt.text}</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default function AboutPage({ ready }) {
  usePageTitle(page.title);
  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="02" crumb={page.title} {...page.hero} />

      <About showCta={false} extra={content.pages.about.story} icons={PRINCIPLE_ICONS} />

      {/* ---- vision & mission ---- */}
      <section className="vm" id="vision" aria-labelledby="vm-title">
        <div className="container">
          <header className="sec-head sec-head--center" data-aos="fade-up">
            <p className="eyebrow">{page.vm.eyebrow}</p>
            <h2 className="sec-title" id="vm-title">
              {page.vm.titleLine} <span className="text-accent">{page.vm.titleAccent}</span>
            </h2>
            {page.vm.description && <p className="sec-sub">{page.vm.description}</p>}
          </header>

          <div className="vm__grid">
            <VmCard
              kind="vision"
              num="01"
              Icon={Telescope}
              data={page.vm.vision}
              text={about.vision}
            />
            <span className="vm__link" aria-hidden="true" data-aos="zoom-in" data-aos-delay="200">
              <ArrowRight size={20} strokeWidth={2.2} />
            </span>
            <VmCard
              kind="mission"
              num="02"
              Icon={Compass}
              data={page.vm.mission}
              text={about.mission}
              delay={140}
            />
          </div>
        </div>
      </section>

      {/* ---- principles ---- */}
      <section className="principles" aria-labelledby="principles-title">
        <div className="container">
          <header className="sec-head" data-aos="fade-up">
            <p className="eyebrow">{page.principles.eyebrow}</p>
            <h2 className="sec-title" id="principles-title">
              {page.principles.titleLine} <span className="text-accent">{page.principles.titleAccent}</span>
            </h2>
          </header>
          <ul className="principles__grid">
            {page.principles.items.map((item, i) => {
              const Icon = PRINCIPLE_ICONS[item.icon] || BookOpen;
              return (
                <li className="principle glass" key={item.title} data-aos="fade-up" data-aos-delay={i * 90}>
                  <span className="glass__fx" aria-hidden="true" />
                  <span className="principle__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="principle__icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></span>
                  <h3 className="principle__title">{item.title}</h3>
                  <p className="principle__text">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Way />
      <CtaBanner />
    </>
  );
}
