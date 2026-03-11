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
python3 -m http.server 4173
```

Then open:

- `http://127.0.0.1:4173/`
- `http://127.0.0.1:4173/en/`

## Tests

Marketing tests validate SEO + CTA + proof assets:

```bash
python3 -m unittest -v tests/test_marketing_site.py
```

## Deploy

Deployment uses GitHub Pages via Actions with manual promotion.

1. Open PR to `main` (validation + Lighthouse run automatically).
2. Merge to `main` once approved.
3. Run workflow **Deploy GitHub Pages** manually with:
   - `ref=main`
   - `deploy_to_public=true`
4. (Recommended) Configure `github-pages` environment reviewers in repo settings to require manual approval before deploy.

## Monitoring

- Workflow **Monitor Public Website** runs every 30 minutes and checks:
  - `https://briefpro.de/`
  - `https://briefpro.de/en/`
- On failure, it opens/updates an incident issue with label `website-monitor`.

## Custom domain

The `CNAME` file pins the site to `briefpro.de`.
