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

Open `index.html` directly in a browser.

## Tests

Marketing tests validate SEO + CTA + proof assets:

```bash
python3 -m unittest -v tests/test_marketing_site.py
```

## Deploy

Deployment uses GitHub Pages via Actions.

- Push to `main`
- GitHub Actions builds and publishes the `./` folder to Pages

## Custom domain

The `CNAME` file pins the site to `briefpro.de`.
