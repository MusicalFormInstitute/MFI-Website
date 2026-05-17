# MFI-Website Project Notes

> **STALE NOTICE (2026-05-17): the newsletter ESP is now Brevo, not Kit.** Every mention of Kit, Kit form 6544140898, `app.kit.com`, or Kit double opt-in below is obsolete. The footer signup form on all pages posts to the `api/subscribe.js` Vercel function which calls Brevo double opt-in server-side; new signups go to Brevo list #4. Submit lands on `/thanks`, email-confirm on `/confirmed`. Also: this repo must stay PUBLIC on GitHub or Vercel Hobby cannot deploy it. See `~/Desktop/MFI/SESSION_HANDOFF_2026-05-17.md` for the full current picture. The design system, brand voice, and structure notes below remain accurate; only the ESP/Kit specifics are wrong.

This is the handoff document. Read this FIRST in any new Claude Code session before touching this project. It captures everything that is not obvious from the code or commit history.

## What this project is

The new musicalform.org website. Static HTML, deployed to Vercel from this private GitHub repo. Replaced the existing Squarespace site at musicalform.org via DNS cutover at Porkbun (~April 2026).

The Public Registry at registry.musicalform.org is a separate project (`MFI-Registry` repo, also on Vercel). This project is the marketing/institutional site that sits in front of it.

## Current live URLs

| URL | What it is | Status |
|---|---|---|
| https://www.musicalform.org | New Vercel-hosted site (this project) | LIVE since DNS cutover ~April 2026 |
| https://mfi-website-eta.vercel.app | Vercel preview URL for this project | Still works as a staging/preview URL |
| ~~Squarespace site at musicalform.org~~ | Old site | DECOMMISSIONED — replaced by Vercel project |
| https://registry.musicalform.org | Public Registry (separate Vercel project) | Live, untouched by this work |
| https://github.com/MusicalFormInstitute/MFI-Website | Source repo, private | Owner: jeffrey@musicalform.org |

## Site map (14 pages)

- `/` — Homepage
- `/about` — About + founder bio
- `/standards` — Both certification standards with PDF download buttons
- `/submit` — Chooser page (CSF or CEP)
- `/csf-submission` — CSF form (3 fields, posts JSON to Railway worker)
- `/cep-submission` — CEP form (5 fields + WAV upload, 3-step S3 presigned URL flow)
- `/labels` — B2B page for labels
- `/news` — News index
- `/news/langer-conference-2026` — Susanne K. Langer Conference article
- `/faq` — Native HTML accordion of 15 Q&As
- `/contact` — Three contact-method cards
- `/privacy` — Privacy Policy (effective April 26, 2026)
- `/terms-of-use` — Terms of Use (effective April 26, 2026)
- `/thanks` — Kit redirect target after newsletter signup

## File structure

```
MFI-Website/
  index.html               <- homepage
  styles.css               <- shared CSS for every page
  consent.js               <- GDPR cookie banner + GA loader
  README.md
  NOTES.md                 <- this file
  .gitignore
  about/index.html         <- folder pattern for clean URLs
  cep-submission/index.html
  contact/index.html
  csf-submission/index.html
  faq/index.html
  labels/index.html
  news/index.html
  news/langer-conference-2026/index.html
  privacy/index.html
  standards/index.html
  submit/index.html
  terms-of-use/index.html
  thanks/index.html
  img/
    mfi-logo-horizontal.png            <- header
    mfi-logo-horizontal-inverted.png   <- footer (white version)
    csf-badge.png                      <- standards page CSF badge
    cep-badge.png                      <- standards page CEP badge
    jeffrey-anthony.jpg                <- founder photo (compressed to 247 KB)
    news/
      kuppelsaal-tu-wien.jpg           <- Langer article hero (CC BY-SA 3.0, Peter Haas, compressed to 400 KB)
  landing-mocks/                       <- early Mock A/B/C designs, not deployed
```

Rule: every page is a folder with `index.html`. Vercel serves `/about/index.html` at the URL `/about`. Do not name pages `about.html` — keeps the structure consistent.

## Brand system

### Colors (use ONLY these four)

```css
--vintage-blue: #5D92CD       /* CEP, secondary actions, links */
--retro-orange: #DF693B       /* CSF, primary CTA, accents */
--black: #000000              /* text, dark surfaces (footer) */
--white: #FFFFFF              /* backgrounds */
```

Plus muted neutrals (`#FAFAF7` off-white, `#1A1A1A` text, `#555` secondary text, `#E5E5E2` rule lines). NO other colors. The cookie banner uses `#29C46A` green for the "Live" pulse dot — that is the only accepted exception (it is a UI convention, not brand).

### Font

Poppins, weights 300-800. No other fonts.

### Voice rules — IMPORTANT, the user enforces these strictly

- **No em dashes anywhere.** Use periods, commas, or restructure.
- **No trademark symbols** (™, ®). Removed sitewide April 26, 2026.
- **No invented copy** — use the user's actual verbiage from existing pages or what they explicitly approve.
- **No marketing fluff.** Institutional tone: measured, factual, confident, not aspirational or salesy.
- **Pricing language**: "Currently free." NOT "Free during public beta" or "Free during introductory period."
- **No periods at end of headers** (h1, h2, h3). Stripped sitewide.
- **No "Arizona" references** for Muse Foundry LLC unless legally necessary (kept in legal docs jurisdiction clauses, removed from About page identity language).
- **No "Education" section on the homepage** — credentials live on `/about` only. Education credentials ARE included on `/about` (MPA Arizona, B.M. Studio Music Miami).

### Logos

- Source assets in user's `~/Desktop/MFI/brand/mfi-logos/`, `~/Desktop/MFI/brand/cep-cert-logos/`, `~/Desktop/MFI/brand/csf-cert-logos/` folders. (Was previously under `Spotify Audit/github work/` before the late-April 2026 workspace reorg.)
- Already copied into `img/`. If the user updates source files, re-copy.

## Cross-page UX patterns

These are recurring conventions used in multiple pages. Maintain consistency when adding similar prompts elsewhere.

### Label portal access prompt (prefilled mailto)

Used wherever a visitor with a multi-track / album / catalog use case might land. The mailto opens a fresh email with the subject already filled in.

**Canonical URL:**
```
mailto:certifications@musicalform.org?subject=Label%20Portal%20Access%20Request
```

**Where it currently appears:**
- `/labels` — primary CTA button "Request Portal Access"
- `/submit` (chooser) — comparison-table reference + "Learn About the Label Portal" section
- `/contact` — instructions card with subject hint
- `/faq` — two Q&As (whole-album submissions, labels with multiple recordings)
- `/cep-submission` — secondary cross-link in the info column ("Submitting a full album, EP, or label catalog?")

**When adding to a new page:** use the exact URL above for subject consistency. Don't add a `&body=...` parameter unless you also update the existing `/labels` button to match (currently no body prefill anywhere).

**Why it matters:** Subject string `Label Portal Access Request` is used as a triage signal in the inbox. Changing the subject text breaks that filter.

## Production integrations

### Supabase (live registry data)

- URL: `https://vqydcmpraydbepckczzd.supabase.co`
- Anon key is hardcoded in JS on every page (safe to expose, RLS handles auth)
- Used for live counts on homepage, /labels, and the marquee tiles
- Same Supabase project as the registry, no changes needed

### Railway worker (form submissions)

- URL: `https://mfi-worker-production.up.railway.app`
- Repo: `MusicalFormInstitute/mfi-worker` (separate repo)
- CSF form posts JSON to `/csf/public/submit`
- CEP form posts JSON to `/cep/public/submit`, gets presigned S3 URL back, uploads to S3, then posts case_number to `/cep/public/upload-complete`
- CORS allowlist hardcoded in `mfi-worker/main.py` `_REQUIRED_ORIGINS`. Currently includes `https://musicalform.org`. **No change needed for cutover** — site moves to musicalform.org, which is already allowed.

### Kit (newsletter)

- Form ID: **6544140898**
- Form action: `https://app.kit.com/forms/6544140898/subscriptions`
- Footer signup form on every page submits here
- Kit redirects to `https://musicalform.org/thanks` after subscription (the new `/thanks` page on this site)
- Kit account: `musicalform.kit.com` (no custom domain configured, none needed)
- Display name: "Musical Form Institute" (user updated from "Muse Foundry")
- From email: `jeffrey@musicalform.org`
- Double opt-in: ON
- Confirmation email subject: "Confirm your subscription to The Musical Form Institute"

### Google Analytics + Google Ads

- GA Measurement ID: `G-VLH6Y1FM16` (same as registry — they roll up to the same GA property). Pulled from Squarespace's Developer Tools > External API Keys on Apr 27 after a wrong ID was found baked into the code. The wrong ID `G-3KDMLQS97C` was returning 404 from googletagmanager.com — never use it.
- Google Ads ID: `AW-8028324232` (account ID matches Customer ID)
- Both loaded via `consent.js` using Google Consent Mode v2 (one gtag.js load services both)
- All four consent dimensions (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) default to `denied` and upgrade together when the user clicks Accept on the cookie banner
- Reject keeps everything denied; GPC signal also forces denied without showing the banner
- `anonymize_ip` enabled on GA
- Privacy Policy section 2.1, 3.4, 4, and 7 disclose Google Ads usage (updated April 26, 2026)

### Google Ads conversions tracked

- **Page view of `/cep-submission`** — fires automatically once AW tag is loaded (URL-match conversion)
- **Page view of `/beta`** — Vercel rewrite (in `vercel.json`) serves the `/submit` page (chooser between CSF and CEP) at the `/beta` URL. The browser bar stays `/beta`, so the URL-match conversion configured in Google Ads still fires. Tried building a dedicated stripped-down `/beta/index.html` landing page on Apr 26, 2026 but reverted — `/submit` is the page we want ads to land on.
- **"Musical Form Inst Webform Submit"** (form_submit event) — GA4-imported conversion (Source: Google Analytics (GA4)). Both form pages already fire `gtag('event', 'form_submit', ...)` on submit success (`csf-submission/index.html` line ~316, `cep-submission/index.html` line ~402). GA4 receives the event and auto-syncs to Google Ads. No standalone AW label needed and no extra code required.

### Vercel Web Analytics

- Script tag `<script defer src="/_vercel/insights/script.js"></script>` is on every page
- Web Analytics needs to be ENABLED in Vercel dashboard for data to start flowing (Analytics tab → Enable). Free on Hobby plan.

### Email infrastructure

- Google Workspace handles all `@musicalform.org` email
- DNS for email (MX records) lives at Porkbun and is independent of website hosting
- DNS cutover for the website does NOT affect email

## Outstanding tasks

### Blocking (must do before launch)

1. **Reinstate Kit subscription** — currently scheduled to cancel August 31, 2026. Banner at top of Kit dashboard has the "billing settings" link.
2. **Import 20 new subscribers from Squarespace** — CSV is at `~/Desktop/kit-import.csv`. Drag into Kit Subscribers → Import.
3. ~~**DNS cutover at Porkbun**~~ — **DONE ~April 2026.** Apex and www records now point at Vercel. musicalform.org serves this project. Procedure kept below for reference.

### Non-blocking (nice to have)

1. **Enable Vercel Web Analytics** in dashboard (Analytics tab → Enable). Script is already in place.
2. **Cancel Squarespace** after DNS verifies (48 hr to be safe).
3. **Update CLAUDE.md** at `/Users/jeffreyanthony/Desktop/MFI/CLAUDE.md` if anything in the worker setup changes. (Was previously at `Spotify Audit/Script/CLAUDE.md` before the workspace reorg in late April 2026.)

## DNS cutover sequence (COMPLETED ~April 2026 — kept for historical reference)

This is the actual procedure. Do it in order.

### Step 1 — Vercel: add the custom domain

1. Vercel dashboard → mfi-website project → Settings → Domains
2. Click **Add Domain**, enter `musicalform.org`
3. Repeat for `www.musicalform.org`
4. Vercel will display the exact DNS records to add. Usually:
   - For apex (musicalform.org): `A` record(s) pointing at Vercel IPs (e.g., `76.76.21.21` — but use what Vercel actually shows, IPs change)
   - For www: `CNAME` pointing at `cname.vercel-dns.com`

### Step 2 — Porkbun: add the records

1. Porkbun → musicalform.org → DNS Records
2. **Find existing A record(s)** for the apex (currently pointing at Squarespace IPs). Either:
   - **Edit them** to use the new Vercel IPs (cleanest — preserves the same record), OR
   - Delete the Squarespace ones first, then add the Vercel ones
3. **For www**: add the CNAME pointing at `cname.vercel-dns.com`. Replace any existing www record.
4. **Do NOT touch MX records** (Google Workspace email — leave them alone).
5. **Do NOT touch the existing CNAME for `registry.musicalform.org`** (it points at the registry Vercel project, which is separate).

### Step 3 — Wait for propagation

5 to 10 minutes typically at Porkbun. Up to 48 hours worst case. Verify with:

```bash
dig musicalform.org +short    # Should return Vercel's IP
dig www.musicalform.org +short # Should return cname.vercel-dns.com
```

Or just visit `musicalform.org` in an incognito window and see if the new site loads.

### Step 4 — Verify after cutover

Test these end-to-end on the live `musicalform.org` URL:

- Homepage loads, marquee scrolls, live stats update
- `/standards` PDF download buttons work (PDFs are now hosted in this repo at `MFI-Website/s/`, served from `/s/...`)
- `/csf-submission` test submission with own email — should land in Supabase + trigger email
- `/cep-submission` test with a small WAV file — should land in S3, return SHA-256, trigger analyst email
- Footer newsletter form — submit own email, should land in Kit, redirect to `/thanks`
- Cookie banner appears in incognito window, both Accept and Reject work, choice persists in localStorage

### Step 5 — Cancel Squarespace

After 48 hours of verified Vercel traffic and the email signup test confirms list growth in Kit, cancel the Squarespace subscription.

## Squarespace URL redirects (preserve SEO equity)

`vercel.json` includes 301 redirects from old Squarespace URLs that had been earning Google Search impressions/clicks. Without these, organic equity built on the prior site would be lost when Google crawls the new site and finds 404s. Map (added Apr 26, 2026 from Search Console data covering Mar 27 to Apr 23):

| Old Squarespace URL | New URL | Reason |
|---|---|---|
| `/about-jeffrey-anthony` | `/about` | Founder bio merged into single About page |
| `/founder` | `/about` | Same |
| `/news-events` | `/news` | News index renamed |
| `/get-certified` | `/submit` | Certification chooser renamed |
| `/apply-for-certification` | `/submit` | Same |
| `/certificate-of-embodied-production-cep` | `/standards` | Per-cert pages consolidated into shared Standards page |
| `/certified-significant-form` | `/standards` | Same |
| `/why-it-matters` | `/about` | Explainer rolled into About page |

If new old-URL paths come back from Search Console later, add them to `vercel.json` `redirects[]` with `permanent: true` (301).

## Standards PDFs

The Standards page (and homepage program cards) link to:

- `/s/CSF_Public_Standard_v2_0_March_31_2026.pdf`
- `/s/CEP_Public_Standard_v1_2_March_31_2026.pdf`

These PDFs live in this repo at `MFI-Website/s/` and are served by Vercel. Migrated out of Squarespace's `/s/` path on Apr 26, 2026. Links use relative paths (`/s/...`) so they work on both the Vercel preview URL and the production URL after DNS cutover. To swap a standard for a new version: drop the new PDF into `s/`, update the filename in the four references in `index.html` and `standards/index.html`, push.

## Recent commits worth knowing about

(Read `git log --oneline` for full list. Most recent commits at top.)

- `4d685dd` — Add Vercel Web Analytics script to every page
- `ccce09a` — Footer logo: bump from 60px to 75px (+25%) per user feedback
- `ff20603` — Pre-launch sizing tweaks: bigger logos and utility bar
- `05c7dd5` — Add Kit newsletter signup to footer + /thanks confirmation page
- `1a54358` — Compress oversized hero images for faster page loads
- `deda87a` — Langer conference article: add Vienna image with CC BY-SA 3.0 attribution
- `e044940` — Add Susanne K. Langer Conference 2026 news article + article styles
- `977ac4d` — News: drop the standards republication card, make Langer card actually clickable
- `9ccba5c` — Strip trailing period from every h1, h2, h3 across all pages
- `d8d625a` — Standards page badges: 25% larger, no background, blend into white
- `7cfa537` — Add Google Analytics + GDPR cookie consent banner sitewide
- `4bc5a4c` — Privacy Policy: replace with rewritten version dated April 26, 2026
- `0727515` — Port Privacy Policy and Terms of Use verbatim from Squarespace
- `e640efe` — Terms of Use: replace with rewritten v2 dated April 26, 2026
- `e39d1e3` — CEP submission: replace placeholder with the working v2 flow
- `536f209` — Move all assets to local /img/ folder, drop Squarespace CDN dependencies

## Anti-patterns to avoid

Things prior Claude sessions did wrong that the user explicitly corrected:

1. **Do not run scripts that send to ACRCloud or YouTube.** The user runs those in their own terminal. Reading from Supabase via REST is fine. Writing to Supabase requires explicit confirmation per request.
2. **Do not add em dashes.** Use periods or commas.
3. **Do not invent copy.** If the user has not provided text for a section, ask. Do not write "certified human craft" or other made-up phrases.
4. **Do not use class names that collide with global classes.** A scoped form's inner sections were named `.section`, which inherited the global `.section { padding: 72px 0 }` rule and broke layout. Always namespace scoped components (e.g., `.form-section` not `.section` inside `.mfi-cep-form`).
5. **Do not use Squarespace CDN URLs for images.** All images must live in `img/` and be referenced as `/img/...`. The Squarespace dependency goes away when Squarespace is canceled.
6. **Do not write/edit the database without confirming.** The user said "you always check with me first before you do anything with touching the database."

## Quick session bootstrap

Next session, after reading this file:

1. Read `git log --oneline -30` for recent commits
2. Visit `https://mfi-website-eta.vercel.app/` to see current live state
3. Check `https://github.com/MusicalFormInstitute/MFI-Website` for any commits not in local
4. Confirm with user: status of DNS cutover, status of Squarespace cancellation, any new requests

That's enough context to be productive immediately.
