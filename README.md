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

## Local human-approval flow before commit

Use this to preview first, approve second, commit third:

```bash
git add index.html en/index.html styles.css tests/test_marketing_site.py
node tools/site-tool.mjs build --dir _site
node tools/site-tool.mjs validate --dir _site
node tools/site-tool.mjs serve --dir _site --port 4173
# review in browser, then stop server (Ctrl+C)
node tools/site-tool.mjs approve --by "Your Name" --note "Looks good"
node tools/site-tool.mjs commit -m "Your commit message"
git push origin main
```

How it works:

- `approve` stores a snapshot hash of the staged tree in `.site-approval.json`.
- `commit` only proceeds if staged content still matches the approved snapshot.
- Any staged change after approval forces a new approval step.

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
