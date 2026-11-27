import { ArrowRight, ArrowUpRight, Building2, Laptop, Plus, Rocket, Video } from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/about-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import { SmartLink } from '../lib/nav.jsx';
import { programIcons } from '../lib/programs.js';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/career-paths.css';

const page = content.careerPaths;
const ROUTE_ICONS = { building: Building2, laptop: Laptop, rocket: Rocket };

// programmes that have a career-path block, in line-up order
const PATHS = content.programs.items
  .filter((p) => page.courses[p.slug])
  .map((p) => ({ ...p, ...page.courses[p.slug], name: content.courses[p.slug]?.name || p.title }));
const bySlug = Object.fromEntries(PATHS.map((p) => [p.slug, p]));

/** "AI & Digital Marketing" → ["AI & Digital", "Marketing"]: the last word takes the accent */
const splitName = (name) => {
  const words = name.split(' ');
  return [words.slice(0, -1).join(' '), words.at(-1)];
};

export default function CareerPathsPage({ ready }) {
  usePageTitle(page.title);

  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="06" crumb={page.title} {...page.hero}>
        <div className="cpindex" role="list" aria-label="Jump to a programme">
          {PATHS.map((p) => {
            const Icon = programIcons[p.icon] || Video;
            return (
              <SmartLink key={p.slug} to={`#${p.slug}`} className="cpindex__chip" role="listitem">
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                {p.track}
              </SmartLink>
            );
          })}
        </div>
      </PageHero>

      <section className="cpaths" aria-label="Career paths by programme">
        <div className="container">
          {PATHS.map((p, i) => {
            const Icon = programIcons[p.icon] || Video;
            const [lead, accent] = splitName(p.name);
            const roleCount = p.groups.reduce((n, g) => n + g.roles.length, 0);
            let roleNo = 0;
            return (
              <article className="cpath" id={p.slug} key={p.slug} aria-labelledby={`${p.slug}-cp-title`}>
                <div className="cpath__grid">
                  {/* ---- intro (sticky on desktop) ---- */}
                  <div className="cpath__intro">
                    <div className="cpath__sticky" data-aos="fade-up">
                      <div className="cpath__badge">
                        <span className="cpath__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.9} /></span>
                        <span className="cpath__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <p className="eyebrow">{p.track}</p>
                      <h2 className="cpath__title" id={`${p.slug}-cp-title`}>
                        {lead && <>{lead} </>}<span className="text-accent">{accent}</span>
                      </h2>
                      <p className="cpath__outcome">{p.outcome}</p>
                      <p className="cpath__count"><strong>{roleCount}</strong> roles you can move into</p>
                      <div className="cpath__actions">
                        <SmartLink to={`/programs/${p.slug}`} className="btn btn--outline">
                          <span>View programme</span>
                          <ArrowRight className="btn__arrow" size={18} strokeWidth={2.4} />
                        </SmartLink>
                        <SmartLink to={`/register?program=${p.slug}`} className="btn btn--primary">
                          <span>Apply</span>
                          <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
                        </SmartLink>
                      </div>
                    </div>
                  </div>

                  {/* ---- roles ---- */}
                  <div className="cpath__roles">
                    {p.groups.map((g) => (
                      <div className="cpath__group" key={g.title}>
                        <h3 className="cpath__group-title" data-aos="fade-up">
                          {g.title}
                          <span>{g.roles.length}</span>
                        </h3>
                        <ul className="cpath__list">
                          {g.roles.map((role, j) => {
                            roleNo += 1;
                            return (
                              <li className="crole glass" key={role.title} data-aos="fade-up" data-aos-delay={(j % 2) * 70}>
                                <span className="glass__fx" aria-hidden="true" />
                                <span className="crole__no" aria-hidden="true">{String(roleNo).padStart(2, '0')}</span>
                                <strong className="crole__title">{role.title}</strong>
                                <span className="crole__text">{role.text}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---- three routes ---- */}
                <div className="cpath__routes" data-aos="fade-up">
                  <p className="cpath__routes-label">Three routes</p>
                  <ul className="cpath__routes-list">
                    {page.routes.map((rt) => {
                      const RIcon = ROUTE_ICONS[rt.icon] || Rocket;
                      return (
                        <li className="croute" key={rt.key}>
                          <span className="croute__icon" aria-hidden="true"><RIcon size={20} strokeWidth={1.9} /></span>
                          <strong className="croute__label">{rt.label}</strong>
                          <p className="croute__text">{p.routes[rt.key]}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---- pairings ---- */}
      <section className="cpairs" aria-labelledby="cpairs-title">
        <div className="container">
          <header className="sec-head cpairs__head" data-aos="fade-up">
            <p className="eyebrow">{page.pairs.eyebrow}</p>
            <h2 className="sec-title" id="cpairs-title">
              {page.pairs.titleLine} <span className="text-accent">{page.pairs.titleAccent}</span>
            </h2>
            <p className="cpairs__desc">{page.pairs.description}</p>
          </header>
          <ul className="cpairs__grid">
            {page.pairs.items.map((pair, i) => {
              const A = bySlug[pair.a];
              const B = bySlug[pair.b];
              if (!A || !B) return null;
              const IconA = programIcons[A.icon] || Video;
              const IconB = programIcons[B.icon] || Video;
              return (
                <li className="cpair glass" key={pair.role} data-aos="fade-up" data-aos-delay={(i % 3) * 90}>
                  <span className="glass__fx" aria-hidden="true" />
                  <div className="cpair__combo">
                    <SmartLink to={`#${A.slug}`} className="cpair__chip"><IconA size={16} strokeWidth={2} aria-hidden="true" />{A.track.replace(' of Tomorrow', '')}</SmartLink>
                    <Plus className="cpair__plus" size={16} strokeWidth={2.6} aria-hidden="true" />
                    <SmartLink to={`#${B.slug}`} className="cpair__chip"><IconB size={16} strokeWidth={2} aria-hidden="true" />{B.track.replace(' of Tomorrow', '')}</SmartLink>
                  </div>
                  <span className="cpair__opens">Opens</span>
                  <strong className="cpair__role">{pair.role}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
