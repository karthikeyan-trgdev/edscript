# EDSCRIPT — Career Accelerator Academy

React (Vite) frontend + Node (Express) backend.
Routing: React Router. Motion: GSAP + ScrollTrigger, Lenis smooth scroll, AOS.

## Run

```bash
npm run install:all   # first time only
npm run dev           # client → http://localhost:5173  (proxies /api → :5000)
```

Production:

```bash
npm run build         # builds client/dist
npm start             # Express serves the API + built site on http://localhost:5000
```

## Pages

| Route         | Page                                                                    |
|---------------|-------------------------------------------------------------------------|
| `/`           | Home: hero, about, programs, the way, FAQ, contact                      |
| `/about`      | About us: story, vision & mission, principles, the way, CTA             |
| `/programs`   | All five programs in detail (`/programs#<slug>` jumps to one)            |
| `/programs/<slug>` | Full course page, from `content.json → courses.<slug>` (5 courses)  |
| `/career-paths` | Roles and routes after each programme, plus two-course pairings |
| `/contact`    | Contact cards, enquiry form, FAQ                                        |
| `/register`   | Single-step application form (`/register?program=<slug>` preselects one) |
| anything else | 404 page                                                                |

Internal links go through `SmartLink` / `useGo()` (src/lib/nav.jsx): same-page `#hash` links
smooth-scroll with Lenis, other pages navigate with React Router, and `RouteEffects` (App.jsx)
scrolls to the top (or to the hash) once the new page renders.

## Structure

```
assets/images/          shared images, imported via the @assets alias
  programs/             program images, matched by file name in content.json → programs.items[].image
shared/content.json     all site copy (incl. pages.* for inner pages), used by client AND server
client/src/
  App.jsx               routes, preloader, Lenis, RouteEffects (scroll + refresh on page change)
  lib/nav.jsx           useGo() + SmartLink for routes / hashes
  lib/programs.js       program images + icons
  hooks/                useLenis (Lenis ↔ GSAP bridge), usePageTitle
  pages/                HomePage, AboutPage, ProgramsPage, CoursePage, CareerPathsPage, ContactPage, RegisterPage, NotFoundPage
  components/
    Preloader.jsx       "Director's viewfinder" intro: countdown → logo → shutter split
    Navbar.jsx          liquid-glass pill, active-page indicator, mobile menu
    PageHero.jsx        inner-page banner: viewfinder frame, breadcrumb, title reveal
    CtaBanner.jsx       dark "Ready to direct?" band
    Hero, About, Programs, Way, Faq, Contact, Footer   home sections (reused on inner pages)
    Field.jsx           floating-label input / textarea / select
    LiquidGlassFilter.jsx  SVG displacement filter for glass refraction
  styles/               one stylesheet per component/page + global, glass, forms
server/index.js         /api/health, /api/content[/:section], POST /api/enquiry, POST /api/apply
server/mailer.js        emails form submissions to the team (SMTP, see below)
server/data/            enquiries.json + applications.json (git-ignored, local copy)
```

## Liquid glass

Wrap content in `.glass` and add `<span className="glass__fx" aria-hidden="true" />` as the
first child. In Chromium the blur is also refracted through `#liquid-glass`; other browsers get frosted blur.

Don't put `mix-blend-mode` on anything inside a `.glass` element: Chrome then isolates the
element and the backdrop blur silently stops working.

## Breakpoints

| Width / orientation              | Layout                                          |
|----------------------------------|-------------------------------------------------|
| > 1100px                         | Desktop: full-bleed image, 4-column feature bar |
| ≤ 1100px                         | Feature bar becomes 2 × 2                       |
| ≤ 960px                          | Nav links collapse into the glass burger menu   |
| ≤ 860px or portrait ≤ 1180px     | Stacked: copy → image → feature bar             |
| ≤ 560px                          | Apply Now moves into the menu                   |
| ≤ 480px                          | Full-width CTAs, compact feature cards          |

## GSAP gotcha

If an element has a CSS `transition` on `transform`/`opacity` (e.g. for hover), animate it with
`gsap.fromTo(...)` + `clearProps`, not `gsap.from(...)`. Under React StrictMode the effect runs twice:
the revert gets animated by the CSS transition, and a second `from()` reads that half-shrunk state as
its end value, so the element stays frozen at the start.

## Form emails

Contact and application forms are validated in the browser and again on the server, then emailed
to karthikeyan@ and vinoth@toprockglobal.com (override with `MAIL_TO`). The visitor only sees
"sent" once the email has gone out. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in Vercel
(Project → Settings → Environment Variables) or in a local `.env` (see `.env.example`). Until they are set,
submissions are only logged and saved (on Vercel that storage is temporary), so set them before relying on the forms.
