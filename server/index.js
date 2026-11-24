import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { readFileSync, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIST = path.join(ROOT, 'client', 'dist');
const PORT = process.env.PORT || 5000;
// Vercel's filesystem is read-only except /tmp (which is not persistent): see README
const DATA_DIR = process.env.VERCEL ? '/tmp/edscript-data' : path.join(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

const loadContent = () =>
  JSON.parse(readFileSync(path.join(ROOT, 'shared', 'content.json'), 'utf8'));

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));

// ---- API ------------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'edscript' }));

// Site content (re-read on each request so edits show up without a restart)
app.get('/api/content', (_req, res) => res.json(loadContent()));
app.get('/api/content/:section', (req, res) => {
  const data = loadContent()[req.params.section];
  if (!data) return res.status(404).json({ error: 'Section not found' });
  res.json(data);
});

// ---- Form helpers -----------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;
const URL_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;
const clean = (v, max) => String(v ?? '').trim().slice(0, max);

// simple in-memory rate limit: max N submissions per IP per window, per form
function rateLimiter(max, windowMs) {
  const hits = new Map(); // ip -> timestamps
  return {
    blocked(ip, now) {
      const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
      hits.set(ip, recent);
      return recent.length >= max;
    },
    record(ip, now) { hits.get(ip).push(now); },
  };
}

// append a record to a JSON array file; writes are serialised so concurrent requests can't clobber each other
let writeQueue = Promise.resolve();
function appendRecord(file, record) {
  const job = writeQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    let list = [];
    try { list = JSON.parse(await readFile(file, 'utf8')); } catch { /* first record */ }
    list.push(record);
    await writeFile(file, JSON.stringify(list, null, 2));
  });
  writeQueue = job.catch(() => {}); // keep the queue alive after a failure
  return job;
}

const makeId = (now) => now.toString(36) + Math.random().toString(36).slice(2, 6);

// ---- Contact / enquiry form ------------------------------------------------
const enquiryLimit = rateLimiter(5, 10 * 60 * 1000);

app.post('/api/enquiry', async (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  if (enquiryLimit.blocked(ip, now)) {
    return res.status(429).json({ error: 'Too many messages. Please try again in a few minutes.' });
  }

  const body = req.body || {};
  if (body.website) return res.status(201).json({ ok: true }); // honeypot

  const enquiry = {
    name: clean(body.name, 100),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 20),
    message: clean(body.message, 2000),
  };

  const errors = {};
  if (enquiry.name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(enquiry.email)) errors.email = 'Please enter a valid email address.';
  if (enquiry.phone && !PHONE_RE.test(enquiry.phone)) errors.phone = 'Please enter a valid phone number.';
  if (enquiry.message.length < 5) errors.message = 'Please write a short message.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the form.', errors });

  enquiryLimit.record(ip, now);
  const record = { id: makeId(now), createdAt: new Date(now).toISOString(), ...enquiry };
  try {
    await appendRecord(ENQUIRIES_FILE, record);
    console.log('[enquiry]', record.id, record.email);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[enquiry] failed to save', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ---- Registration / application form -------------------------------------------
const applyLimit = rateLimiter(3, 10 * 60 * 1000);
const LEVELS = ['beginner', 'some', 'pro'];

app.post('/api/apply', async (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  if (applyLimit.blocked(ip, now)) {
    return res.status(429).json({ error: 'Too many applications. Please try again in a few minutes.' });
  }

  const body = req.body || {};
  if (body.website) return res.status(201).json({ ok: true, id: makeId(now) }); // honeypot

  const { pages, programs } = loadContent();
  const reg = pages.register;
  const app_ = {
    name: clean(body.name, 100),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 20),
    city: clean(body.city, 80),
    status: clean(body.status, 60),
    program: clean(body.program, 60),
    level: clean(body.level, 20),
    portfolio: clean(body.portfolio, 300),
    motivation: clean(body.motivation, 3000),
    source: clean(body.source, 60),
    scholarship: body.scholarship === true,
    consent: body.consent === true,
  };

  const errors = {};
  if (app_.name.length < 2) errors.name = 'Please enter your full name.';
  if (!EMAIL_RE.test(app_.email)) errors.email = 'Please enter a valid email address.';
  if (!PHONE_RE.test(app_.phone)) errors.phone = 'Please enter a valid phone number.';
  if (app_.city.length < 2) errors.city = 'Please enter your city.';
  if (!reg.statuses.includes(app_.status)) errors.status = 'Please choose one.';
  if (!programs.items.some((p) => p.slug === app_.program)) errors.program = 'Please choose a program.';
  if (!LEVELS.includes(app_.level)) errors.level = 'Please choose your experience level.';
  if (app_.portfolio && !URL_RE.test(app_.portfolio)) errors.portfolio = 'Please enter a valid link.';
  if (app_.motivation.length < 20) errors.motivation = 'Tell us a little more (at least 20 characters).';
  if (app_.source && !reg.sources.includes(app_.source)) app_.source = '';
  if (!app_.consent) errors.consent = 'Please confirm so we can contact you.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the highlighted fields.', errors });

  applyLimit.record(ip, now);
  const record = { id: makeId(now), createdAt: new Date(now).toISOString(), ...app_ };
  try {
    await appendRecord(APPLICATIONS_FILE, record);
    console.log('[apply]', record.id, record.email, record.program);
    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    console.error('[apply] failed to save', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ---- Static client (production) --------------------------------------------
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { maxAge: '7d', index: false }));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

// On Vercel the app is exported to a serverless function (api/index.js) instead of listening
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`EDSCRIPT server running on http://localhost:${PORT}`));
}

export default app;
