# MFI Website

Marketing site for The Musical Form Institute.

**Live**: TBD (currently musicalform.org runs on Squarespace)
**Staging**: TBD (Vercel preview URL once deployed)
**Public registry**: https://registry.musicalform.org/ (separate repo: MFI-Registry)

## Stack

Static HTML + CSS + vanilla JS. No build step. Deployed to Vercel.

Live data (registry stats, recently certified tracks) is fetched directly
from the public Supabase REST API using the anon key, same as MFI-Registry.

## Local development

Just open the HTML files in a browser. Or run a tiny local server if you
want clean URLs:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Pushes to `main` auto-deploy to Vercel. Branch deploys are auto-created
for any other branch.

## Pages

| Page | Path | Status |
|---|---|---|
| Homepage | `/` (index.html) | Mockup landed |
| About | `/about` | TBD |
| Standards | `/standards` | TBD |
| News | `/news` | TBD |
| FAQ | `/faq` | TBD |
| Contact | `/contact` | TBD |
| Submit chooser | `/submit` | TBD |
| For Labels | `/labels` | TBD |
| Privacy | `/privacy` | TBD |
| Terms of Use | `/terms-of-use` | TBD |

The submission forms (`/csf-submission`, `/cep-submission`) will be either
embedded code blocks on Squarespace OR migrated here once the rest of the
site cuts over.

## DNS

Domain registered at Porkbun. Email hosting is Google Workspace (separate
from web hosting via MX records — DNS cutover for the website does not
affect email).

## Brand colors

- Vintage Blue: `#5D92CD`
- Retro Orange: `#DF693B`
- Black: `#000000`
- White: `#FFFFFF`

## Brand font

Poppins (300, 400, 500, 600, 700, 800).
