import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { readFileSync, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mailConfigured, sendSubmission } from './mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
// local secrets (SMTP login) live in the git-ignored .env; on Vercel they come from project settings
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env */ }
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
const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u; // letters, spaces, . ' -
const digits = (v) => v.replace(/\D/g, '').length;
const validPhone = (v) => PHONE_RE.test(v) && digits(v) >= 10 && digits(v) <= 15;
const validName = (v) => v.length >= 2 && NAME_RE.test(v);
const istTime = (ms) => new Date(ms).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// After validation: email the team (the real delivery), then keep a local copy (best effort).
// Until the SMTP settings exist the submission is only logged + saved (on Vercel /tmp is
// temporary), so forms keep working; once they're set, every submission is emailed and a
// failed send is reported to the visitor.
async function deliver({ file, record, mail, tag }) {
  if (mailConfigured()) {
    await sendSubmission(mail);
  } else {
    console.warn(`[${tag}] SMTP not configured: NOT emailed`, JSON.stringify(record));
  }
  try { await appendRecord(file, record); } catch (err) { console.error(`[${tag}] local save failed`, err); }
}
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
    interest: clean(body.interest, 60),
    message: clean(body.message, 2000),
  };

  const errors = {};
  if (!validName(enquiry.name)) errors.name = 'Please enter your name (letters only).';
  if (!EMAIL_RE.test(enquiry.email)) errors.email = 'Please enter a valid email address.';
  if (enquiry.phone && !validPhone(enquiry.phone)) errors.phone = 'Please enter a valid phone number (10–15 digits).';
  const interests = [...loadContent().programs.items.map((p) => p.slug), 'not-sure'];
  if (!interests.includes(enquiry.interest)) errors.interest = 'Please choose an option.';
  if (enquiry.message.length < 10) errors.message = 'Please write a short message (at least 10 characters).';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the form.', errors });

  const { programs, contact } = loadContent();
  const interest = programs.items.find((p) => p.slug === enquiry.interest)?.title || contact.notSure;
  const record = { id: makeId(now), createdAt: new Date(now).toISOString(), ...enquiry };
  try {
    await deliver({
      file: ENQUIRIES_FILE,
      record,
      tag: 'enquiry',
      mail: {
        subject: `New enquiry: ${enquiry.name} (${interest})`,
        heading: 'New enquiry from the EDSCRIPT website',
        replyTo: { name: enquiry.name, address: enquiry.email },
        rows: [
          ['Name', enquiry.name],
          ['Email', enquiry.email],
          ['Phone', enquiry.phone],
          ['Interested in', interest],
          ['Message', enquiry.message],
          ['Received', istTime(now)],
        ],
      },
    });
    enquiryLimit.record(ip, now);
    console.log('[enquiry]', record.id, record.email);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[enquiry] delivery failed', err);
    res.status(502).json({ error: 'Sorry, we couldn’t send your message just now. Please try again, or email us directly.' });
  }
});

// ---- Registration / application form -------------------------------------------
const applyLimit = rateLimiter(3, 10 * 60 * 1000);

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
    status: clean(body.status, 60),
    program: clean(body.program, 60),
    message: clean(body.message, 3000),
    scholarship: body.scholarship === true,
  };

  const errors = {};
  if (!validName(app_.name)) errors.name = 'Please enter your full name (letters only).';
  if (!EMAIL_RE.test(app_.email)) errors.email = 'Please enter a valid email address.';
  if (!validPhone(app_.phone)) errors.phone = 'Please enter a valid phone number (10–15 digits).';
  if (!reg.statuses.includes(app_.status)) errors.status = 'Please choose one.';
  if (!programs.items.some((p) => p.slug === app_.program)) errors.program = 'Please choose a programme.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the highlighted fields.', errors });

  const programme = programs.items.find((p) => p.slug === app_.program).title;
  const record = { id: makeId(now), createdAt: new Date(now).toISOString(), ...app_ };
  try {
    await deliver({
      file: APPLICATIONS_FILE,
      record,
      tag: 'apply',
      mail: {
        subject: `New application: ${app_.name} (${programme})`,
        heading: `New application: ${programme}`,
        replyTo: { name: app_.name, address: app_.email },
        rows: [
          ['Reference', record.id.toUpperCase()],
          ['Programme', programme],
          ['Name', app_.name],
          ['Email', app_.email],
          ['Phone', app_.phone],
          ['Describes them', app_.status],
          ['Scholarship', app_.scholarship ? 'Yes, wants to be considered' : 'No'],
          ['Message', app_.message],
          ['Received', istTime(now)],
        ],
      },
    });
    applyLimit.record(ip, now);
    console.log('[apply]', record.id, record.email, record.program);
    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    console.error('[apply] delivery failed', err);
    res.status(502).json({ error: 'Sorry, we couldn’t send your application just now. Please try again, or email us directly.' });
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
