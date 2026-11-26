import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowUpRight, Check, CheckCircle2, Loader2, Mail, MessageCircle, Send, Video } from 'lucide-react';
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
  name: '', email: '', phone: '', status: '', program: '', message: '',
  scholarship: false,
  website: '', // honeypot
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;

const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u; // letters, spaces, . ' -
const validPhone = (v) => PHONE_RE.test(v) && v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 15;

// mirrors the server's checks (server/index.js); the order here is the focus order
function validate(v) {
  const e = {};
  if (!PROGRAM_SLUGS.includes(v.program)) e.program = 'Please choose a programme.';
  if (v.name.trim().length < 2 || !NAME_RE.test(v.name.trim())) e.name = 'Please enter your full name (letters only).';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (!validPhone(v.phone.trim())) e.phone = 'Please enter a valid phone number (10–15 digits).';
  if (!v.status) e.status = 'Please choose one.';
  return e;
}

export default function RegisterPage({ ready }) {
  usePageTitle(page.title);
  const lenis = useLenisInstance();
  const [params] = useSearchParams();
  const preset = params.get('program');

  const [values, setValues] = useState(() => ({ ...EMPTY, program: PROGRAM_SLUGS.includes(preset) ? preset : '' }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');
  const [refId, setRefId] = useState('');
  const card = useRef(null);
  const panel = useRef(null);

  // once sent, fade the thank-you in and bring it into view
  useEffect(() => {
    if (status !== 'sent') return;
    if (panel.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(panel.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', clearProps: 'transform,opacity' });
    }
    lenis?.scrollTo(card.current, { offset: -120, duration: 0.9 });
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const focusFirst = (found) => {
    const first = Object.keys(found)[0];
    requestAnimationFrame(() => document.querySelector(`[name="${first}"]`)?.focus({ preventScroll: false }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
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
        if (data.errors) { setErrors(data.errors); focusFirst(data.errors); }
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
    setStatus('idle');
  };

  return (
    <>
      <PageHero ready={ready} image={heroBg} scene="05" crumb={page.title} compact {...page.hero} />

      <section className="reg" aria-label="Application form">
        <div className="container reg__grid">
          {/* ---- side panel ---- */}
          <aside className="reg__aside">
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
              <p>Not sure which programme fits?</p>
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
                  <h2 className="reg__title">{page.formTitle}</h2>
                  <p className="reg__note">{page.formNote}</p>
                </header>

                <fieldset className="reg__fieldset">
                  <legend className="reg__legend">Choose your programme</legend>
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

                <div className="reg__row">
                  <Field id="name" label="Full Name" autoComplete="name" value={values.name} onChange={update} error={errors.name} />
                  <Field id="email" label="Email Address" type="email" autoComplete="email" value={values.email} onChange={update} error={errors.email} />
                </div>
                <div className="reg__row">
                  <Field id="phone" label="Phone Number" type="tel" autoComplete="tel" value={values.phone} onChange={update} error={errors.phone} />
                  <Field id="status" label="What best describes you?" as="select" value={values.status} onChange={update} error={errors.status}>
                    <option value="" disabled>Choose one</option>
                    {page.statuses.map((x) => <option key={x} value={x}>{x}</option>)}
                  </Field>
                </div>
                <Field id="message" label="Anything you’d like us to know? (optional)" as="textarea" rows={3} value={values.message} onChange={update} />

                <div className="reg__checks">
                  <label className="check">
                    <input type="checkbox" name="scholarship" checked={values.scholarship} onChange={update} />
                    <span className="check__box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                    <span>I’d like to be considered for a scholarship.</span>
                  </label>
                </div>

                {/* honeypot: hidden from people, bots fill it in */}
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="reg-website">Website</label>
                  <input id="reg-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
                </div>

                {status === 'error' && <p className="reg__error" role="alert">{serverError}</p>}

                <button type="submit" className="btn btn--primary reg__submit" disabled={status === 'sending'}>
                  {status === 'sending'
                    ? (<><Loader2 className="reg__spin" size={18} aria-hidden="true" /> Submitting…</>)
                    : (<>Submit Application <Send size={17} strokeWidth={2.2} aria-hidden="true" /></>)}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
