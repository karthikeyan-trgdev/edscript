import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, Loader2, Mail, MessageCircle, Send, Video,
} from 'lucide-react';
import content from '@shared/content.json';
import heroBg from '@assets/images/preloader-bg.jpg';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import { SmartLink } from '../lib/nav.jsx';
import { programIcons } from '../lib/programs.js';
import { useLenisInstance } from '../hooks/useLenis.js';
import usePageTitle from '../hooks/usePageTitle.js';
import '../styles/register.css';

const page = content.pages.register;
const { programs } = content;
const PROGRAM_SLUGS = programs.items.map((p) => p.slug);

const EMPTY = {
  name: '', email: '', phone: '', city: '', status: '',
  program: '', level: '', portfolio: '',
  motivation: '', source: '', scholarship: false, consent: false,
  website: '', // honeypot
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;
const URL_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

// which fields live on which step (used for validation + jumping back on server errors)
const STEP_FIELDS = [
  ['name', 'email', 'phone', 'city', 'status'],
  ['program', 'level', 'portfolio'],
  ['motivation', 'source', 'consent'],
];

function validateStep(step, v) {
  const e = {};
  if (step === 0) {
    if (v.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
    if (!PHONE_RE.test(v.phone.trim())) e.phone = 'Please enter a valid phone number.';
    if (v.city.trim().length < 2) e.city = 'Please enter your city.';
    if (!v.status) e.status = 'Please choose one.';
  }
  if (step === 1) {
    if (!PROGRAM_SLUGS.includes(v.program)) e.program = 'Please choose a program.';
    if (!v.level) e.level = 'Please choose your experience level.';
    if (v.portfolio.trim() && !URL_RE.test(v.portfolio.trim())) e.portfolio = 'Please enter a valid link.';
  }
  if (step === 2) {
    if (v.motivation.trim().length < 20) e.motivation = 'Tell us a little more (at least 20 characters).';
    if (!v.consent) e.consent = 'Please confirm so we can contact you.';
  }
  return e;
}

export default function RegisterPage({ ready }) {
  usePageTitle(page.title);
  const lenis = useLenisInstance();
  const [params] = useSearchParams();
  const preset = params.get('program');

  const [values, setValues] = useState(() => ({ ...EMPTY, program: PROGRAM_SLUGS.includes(preset) ? preset : '' }));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');
  const [refId, setRefId] = useState('');
  const card = useRef(null);
  const panel = useRef(null);
  const firstRender = useRef(true);

  // slide the new step in, and bring the card top into view
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (panel.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(panel.current, { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out', clearProps: 'transform,opacity' });
    }
    const top = card.current?.getBoundingClientRect().top ?? 0;
    if (top < 90 || top > window.innerHeight * 0.5) lenis?.scrollTo(card.current, { offset: -120, duration: 0.9 });
  }, [step, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  const focusFirst = (found) => {
    const first = Object.keys(found)[0];
    requestAnimationFrame(() => document.querySelector(`[name="${first}"]`)?.focus({ preventScroll: false }));
  };

  const next = () => {
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length) return focusFirst(found);
    setStep((s) => s + 1);
  };
  const back = () => { setErrors({}); setStep((s) => Math.max(0, s - 1)); };

  const submit = async (e) => {
    e.preventDefault();
    if (step < 2) return next();
    const found = validateStep(2, values);
    setErrors(found);
    if (Object.keys(found).length) return focusFirst(found);

    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          const bad = STEP_FIELDS.findIndex((f) => f.some((name) => data.errors[name]));
          if (bad > -1 && bad !== step) setStep(bad);
        }
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setRefId(data.id || '');
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setServerError(err.message === 'Failed to fetch' ? 'Could not reach the server. Please try again.' : err.message);
    }
  };

  const restart = () => {
    setValues(EMPTY);
    setErrors({});
    setStep(0);
    setStatus('idle');
  };

  const chosen = programs.items.find((p) => p.slug === values.program);

  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="05" crumb={page.title} compact {...page.hero} />

      <section className="reg" aria-label="Application form">
        <div className="container reg__grid">
          {/* ---- side panel ---- */}
          <aside className="reg__aside">
            <ol className="reg__steps" aria-label="Application steps">
              {page.steps.map((label, i) => {
                const state = status === 'sent' || i < step ? 'done' : i === step ? 'current' : 'todo';
                return (
                  <li className="reg__step" data-state={state} key={label} aria-current={state === 'current' ? 'step' : undefined}>
                    <span className="reg__step-dot">{state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}</span>
                    <span className="reg__step-text">
                      <small>Step {i + 1}</small>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="reg__next glass">
              <span className="glass__fx" aria-hidden="true" />
              <h2 className="reg__aside-title">{page.next.title}</h2>
              <ol>
                {page.next.items.map((item, i) => (
                  <li key={item.title}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="reg__help">
              <p>Not sure which program fits?</p>
              <div>
                <SmartLink to="/contact" className="reg__help-link"><MessageCircle size={16} aria-hidden="true" /> Talk to us</SmartLink>
                <a href={`mailto:${content.footer.contact.email}`} className="reg__help-link"><Mail size={16} aria-hidden="true" /> {content.footer.contact.email}</a>
              </div>
            </div>
          </aside>

          {/* ---- form card ---- */}
          <div className="reg__card glass" ref={card}>
            <span className="glass__fx" aria-hidden="true" />

            {status === 'sent' ? (
              <div className="reg__success" role="status" ref={panel}>
                <span className="reg__success-icon"><CheckCircle2 size={40} strokeWidth={1.8} aria-hidden="true" /></span>
                <h2>{page.successTitle}</h2>
                <p>{page.successText}</p>
                {refId && <p className="reg__ref">Reference: <strong>{refId.toUpperCase()}</strong></p>}
                <div className="reg__success-actions">
                  <SmartLink to="/programs" className="btn btn--primary">
                    <span>Explore programs</span>
                    <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} />
                  </SmartLink>
                  <button type="button" className="btn btn--outline" onClick={restart}>Submit another</button>
                </div>
              </div>
            ) : (
              <form className="reg__form" onSubmit={submit} noValidate>
                <header className="reg__head">
                  <p className="reg__count">Step {step + 1} of {page.steps.length}</p>
                  <h2 className="reg__title">{page.steps[step]}</h2>
                  <div className="reg__bar" aria-hidden="true">
                    <span style={{ width: `${((step + 1) / page.steps.length) * 100}%` }} />
                  </div>
                </header>

                <div className="reg__panel" ref={panel}>
                  {step === 0 && (
                    <>
                      <div className="reg__row">
                        <Field id="name" label="Full Name" autoComplete="name" value={values.name} onChange={update} error={errors.name} />
                        <Field id="email" label="Email Address" type="email" autoComplete="email" value={values.email} onChange={update} error={errors.email} />
                      </div>
                      <div className="reg__row">
                        <Field id="phone" label="Phone Number" type="tel" autoComplete="tel" value={values.phone} onChange={update} error={errors.phone} />
                        <Field id="city" label="City" autoComplete="address-level2" value={values.city} onChange={update} error={errors.city} />
                      </div>
                      <Field id="status" label="What best describes you?" as="select" value={values.status} onChange={update} error={errors.status}>
                        <option value="" disabled>Choose one</option>
                        {page.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Field>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <fieldset className="reg__fieldset">
                        <legend className="reg__legend">Choose your program</legend>
                        <div className="reg__programs">
                          {programs.items.map((p) => {
                            const Icon = programIcons[p.icon] || Video;
                            return (
                              <label className="choice" key={p.slug} data-checked={values.program === p.slug}>
                                <input type="radio" name="program" value={p.slug} checked={values.program === p.slug} onChange={update} />
                                <span className="choice__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.9} /></span>
                                <span className="choice__title">{p.title}</span>
                                <span className="choice__check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                              </label>
                            );
                          })}
                        </div>
                        {errors.program && <span className="field__error" role="alert">{errors.program}</span>}
                      </fieldset>

                      <fieldset className="reg__fieldset">
                        <legend className="reg__legend">Your experience level</legend>
                        <div className="reg__levels">
                          {page.levels.map((l) => (
                            <label className="choice choice--level" key={l.value} data-checked={values.level === l.value}>
                              <input type="radio" name="level" value={l.value} checked={values.level === l.value} onChange={update} />
                              <span className="choice__title">{l.label}</span>
                              <span className="choice__hint">{l.hint}</span>
                              <span className="choice__check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                            </label>
                          ))}
                        </div>
                        {errors.level && <span className="field__error" role="alert">{errors.level}</span>}
                      </fieldset>

                      <Field id="portfolio" label="Portfolio, showreel or social link (optional)" type="url" inputMode="url" value={values.portfolio} onChange={update} error={errors.portfolio} />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      {chosen && (
                        <p className="reg__chosen">
                          Applying for <strong>{chosen.title}</strong>
                          <button type="button" onClick={() => setStep(1)}>Change</button>
                        </p>
                      )}
                      <Field
                        id="motivation"
                        label="Why do you want to join? What do you want to make?"
                        as="textarea"
                        rows={5}
                        value={values.motivation}
                        onChange={update}
                        error={errors.motivation}
                      />
                      <Field id="source" label="How did you hear about us? (optional)" as="select" value={values.source} onChange={update}>
                        <option value="">Choose one</option>
                        {page.sources.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Field>

                      <label className="check">
                        <input type="checkbox" name="scholarship" checked={values.scholarship} onChange={update} />
                        <span className="check__box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                        <span>I’d like to be considered for a scholarship.</span>
                      </label>
                      <label className={`check ${errors.consent ? 'has-error' : ''}`}>
                        <input type="checkbox" name="consent" checked={values.consent} onChange={update} aria-invalid={!!errors.consent} />
                        <span className="check__box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                        <span>I agree that EDScript can contact me about my application.</span>
                      </label>
                      {errors.consent && <span className="field__error" role="alert">{errors.consent}</span>}
                    </>
                  )}
                </div>

                {/* honeypot: hidden from people, bots fill it in */}
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="reg-website">Website</label>
                  <input id="reg-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
                </div>

                {status === 'error' && <p className="reg__error" role="alert">{serverError}</p>}

                <div className="reg__nav">
                  {step > 0 ? (
                    <button type="button" className="btn btn--outline reg__back" onClick={back}>
                      <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" /> Back
                    </button>
                  ) : <span />}
                  {step < 2 ? (
                    <button type="submit" className="btn btn--primary reg__go">
                      Continue <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="submit" className="btn btn--primary reg__go" disabled={status === 'sending'}>
                      {status === 'sending'
                        ? (<><Loader2 className="reg__spin" size={18} aria-hidden="true" /> Submitting…</>)
                        : (<>Submit Application <Send size={17} strokeWidth={2.2} aria-hidden="true" /></>)}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
