# Contributing to briefpro-website

**This repository is PUBLIC.** Everything committed here is visible to anyone.

## What belongs here

- Marketing copy (DE + EN)
- CSS styles and animations
- JavaScript for interactivity
- Static assets (images, fonts, favicons)
- SEO metadata (meta tags, structured data, sitemap)

## What does NOT belong here

Never commit the following to this repo:

| Category | Examples |
| -------- | -------- |
| Infrastructure details | Cloud provider names, region names, VPC/network config |
| Compliance specifics | AVV drafts, TOMs, DPIA content, subprocessor lists |
| Security architecture | Encryption details, auth implementation, penetration test results |
| Internal roadmap | Certification timelines, vendor names, legal advisor details |
| Business terms | Pricing structures, contract terms, customer names |

These belong in the **private `briefpro` repo** under `docs/`.

## Safe to publish

General trust signals are fine on the public website:

- "DSGVO-konform" ✓
- "EU-Datenhaltung, Frankfurt" ✓  
- "Audit-Trail" ✓
- "No long-term audio storage" ✓
- "Human-in-the-loop approval" ✓
- Certification roadmap as high-level status only ✓

## Before pushing

Run `git diff HEAD` and read it as if you were an unknown outside party seeing it for the first time. If it reveals how the system is built internally, don't push it.
