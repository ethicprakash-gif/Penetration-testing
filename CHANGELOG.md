# Changelog

All notable changes to PentestingEverything are documented here.

## v2.0.0

### From a raw repository to a structured knowledge base

Before this release, PentestingEverything was a collection of markdown folders you
browsed directly on GitHub. The content was valuable, but it was unstructured, hard
to search, slow to navigate, and the reference PDFs were scattered across folders.

v2.0.0 turns the same material into a fast, searchable website at
**[pentest.m14r41.in](https://pentest.m14r41.in)**: 108 documentation pages, 104
reference PDFs, and 212+ topics across 23 security domains, organized for real use
during an engagement.

### What the website brings (vs. the old GitHub-only project)

- **Readable, structured pages**: every domain folder is now a proper, navigable
  documentation section instead of a long raw README.
- **Instant local search**: fully static, offline-capable search with Ctrl/Cmd + K,
  fuzzy matching, and in-page highlighting. No external service.
- **Reference Library**: all 104 PDFs in one place, grouped by domain, filterable by
  title or domain, with clean open and download actions.
- **Learning Paths**: curated routes through the material for common engagements
  (web, cloud, mobile, red team, AI/LLM, DevSecOps).
- **Reading-first design**: comfortable typography, dark and light themes, breadcrumbs,
  and a table of contents on every page.
- **Domain landing page**: a homepage that surfaces every attack surface, live counts,
  and the PentestingChecklist companion.

### Added in this release

- **Animated statistics**: the homepage number boxes (Documentation pages, Reference
  PDFs, Domains, Topics) now have a staggered entrance and an interactive hover.
- **PentestingChecklist companion** section now links to both the live website and the
  GitHub repository, so readers can open whichever they need.
- **Professional footer**: a branded footer with project description, social and
  companion links, structured columns, and a meta bar.
- **README overhaul**: a clear header with the live website linked first for visibility,
  quick links, and status badges.
- **Live GitHub stars and forks** in the navigation bar.

### Improvements

- Cleaner, consistent design system across the homepage, References, and Learning Paths.
- Copy polished for a plain, professional tone.

### Bug fixes

- Resolved a build collision between the dev server and the migration step.
- Fixed inconsistent punctuation in user-facing copy.

## v1.0.0

- Initial public knowledge base: penetration-testing methodology, payloads, commands,
  and reference material across 23 security domains, maintained on GitHub.
