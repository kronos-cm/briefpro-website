# BriefPro Website

Static website for BriefPro.

## Decisions (canonical)

- Website: `https://briefpro.de` (GitHub Pages)
- App: `https://app.briefpro.de`
- DNS authority: GCP Cloud DNS (Strato remains registrar)
- Languages: DE default at `/`, EN at `/en/`

These decisions are documented canonically in the app repo:

- `briefpro/docs/architecture/architecture.md` → **Architecture Decisions (Canonical)**

## Local preview

```bash
node tools/site-tool.mjs build --dir _site
node tools/site-tool.mjs validate --dir _site
node tools/site-tool.mjs serve --dir _site --port 4173
```

Open:

- `http://127.0.0.1:4173/`
- `http://127.0.0.1:4173/en/`

## Local review-first workflow

Use this sequence for every website change:

```bash
git add index.html en/index.html styles.css tests/test_marketing_site.py
node tools/site-tool.mjs build --dir _site
node tools/site-tool.mjs validate --dir _site
node tools/site-tool.mjs serve --dir _site --port 4173
# review in browser, then stop server (Ctrl+C) and approve content
git commit -m "Your commit message"
git push origin main
```

Operational rule:
- Do not push until local preview is reviewed and approved.

## Tests

Marketing tests validate SEO + CTA + proof assets:

```bash
python3 -m unittest -v tests/test_marketing_site.py
```

## Deploy

Deployment uses GitHub Pages via Actions and auto-deploys from `main`.

1. Open PR to `main` (validation + Lighthouse run automatically).
2. Review locally using the local preview workflow above.
3. Merge/push to `main` once approved.
4. Pages deploy runs automatically.

## Monitoring

- Workflow **Monitor Public Website** runs every 30 minutes and checks:
  - `https://briefpro.de/`
  - `https://briefpro.de/en/`
- On failure, it opens/updates an incident issue with label `website-monitor`.

## Custom domain

The `CNAME` file pins the site to `briefpro.de`.
