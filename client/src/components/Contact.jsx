import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, Award, CheckCircle2, ClipboardCheck, GraduationCap, Loader2, RotateCcw } from 'lucide-react';
import content from '@shared/content.json';
import Field from './Field.jsx';
import '../styles/contact.css';

const { contact, programs } = content;
const INTERESTS = [...programs.items.map((p) => [p.slug, p.title]), ['not-sure', contact.notSure]];

// What people usually write in about (mirrors the description copy)
const TOPICS = [
  { icon: GraduationCap, label: 'Programs', text: 'Which path fits you, curriculum and outcomes.' },
  { icon: Award, label: 'Scholarships', text: 'Eligibility and how to apply.' },
  { icon: ClipboardCheck, label: 'Admissions', text: 'Intakes, process and next steps.' },
];

const EMPTY = { name: '', email: '', phone: '', interest: '', message: '', website: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;

const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u; // letters, spaces, . ' -
const validPhone = (v) => PHONE_RE.test(v) && v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 15;

// mirrors the server's checks (server/index.js)
function validate(v) {
  const e = {};
  if (v.name.trim().length < 2 || !NAME_RE.test(v.name.trim())) e.name = 'Please enter your name (letters only).';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.phone.trim() && !validPhone(v.phone.trim())) e.phone = 'Please enter a valid phone number (10–15 digits).';
  if (!INTERESTS.some(([slug]) => slug === v.interest)) e.interest = 'Please choose an option.';
  if (v.message.trim().length < 10) e.message = 'Please write a short message (at least 10 characters).';
  return e;
}

export default function Contact() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.contact__title-inner',
          { yPercent: 115, rotate: 2 },
          {
            yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: '.contact__title', start: 'top 85%', once: true },
          });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  const update = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStatus('sent');
      setValues(EMPTY);
    } catch (err) {
      setStatus('error');
      setServerError(err.message === 'Failed to fetch' ? 'Could not reach the server. Please try again.' : err.message);
    }
  };

  return (
    <section className="contact" id="contact" ref={root} aria-labelledby="contact-title">
      <div className="contact__blob contact__blob--a" aria-hidden="true" />
      <div className="contact__blob contact__blob--b" aria-hidden="true" />
      <div className="container contact__grid">
        <div className="contact__intro">
          <p className="eyebrow">{contact.eyebrow}</p>
          <h2 className="contact__title" id="contact-title">
            <span className="contact__title-inner text-accent">{contact.title}</span>
          </h2>
          <p className="contact__desc" data-aos="fade-up" data-aos-delay="100">{contact.description}</p>
          <ul className="contact__topics">
            {TOPICS.map(({ icon: Icon, label, text }, i) => (
              <li className="contact__topic" key={label} data-aos="fade-up" data-aos-delay={180 + i * 80}>
                <span className="contact__topic-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                <span>
                  <strong>{label}</strong>
                  <span>{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact__card glass" data-aos="fade-up" data-aos-delay="150">
          <span className="glass__fx" aria-hidden="true" />
          <h3 className="contact__card-title">Send us a message</h3>

      {status === 'sent' ? (
        <div className="contact__success" role="status">
          <CheckCircle2 size={44} strokeWidth={1.8} aria-hidden="true" />
          <h3>{contact.successTitle}</h3>
          <p>{contact.successText}</p>
          <button type="button" className="btn btn--outline" onClick={() => setStatus('idle')}>
            <RotateCcw size={16} strokeWidth={2.2} aria-hidden="true" /> Send another
          </button>
        </div>
      ) : (
        <form className="contact__form" onSubmit={submit} noValidate>
          <div className="contact__row">
            <Field id="name" label="Your Name" autoComplete="name" value={values.name} onChange={update} error={errors.name} />
            <Field id="email" label="Your Email" type="email" autoComplete="email" value={values.email} onChange={update} error={errors.email} />
          </div>
          <div className="contact__row">
            <Field id="phone" label="Phone Number (optional)" type="tel" autoComplete="tel" value={values.phone} onChange={update} error={errors.phone} />
            <Field id="interest" label={contact.interestLabel} as="select" value={values.interest} onChange={update} error={errors.interest}>
              <option value="" disabled>Choose one</option>
              {INTERESTS.map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}
            </Field>
          </div>
          <Field id="message" label="Your Message" as="textarea" rows={4} value={values.message} onChange={update} error={errors.message} />

          {/* honeypot: hidden from people, bots fill it in */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
          </div>

          {status === 'error' && <p className="contact__error" role="alert">{serverError}</p>}

          <button type="submit" className="btn btn--primary contact__submit" disabled={status === 'sending'}>
            {status === 'sending' ? (
              <><Loader2 className="contact__spin" size={18} aria-hidden="true" /> Sending…</>
            ) : (
              <>{contact.submitLabel} <ArrowUpRight className="btn__arrow" size={18} strokeWidth={2.4} /></>
            )}
          </button>
        </form>
      )}
        </div>
      </div>
    </section>
  );
}
