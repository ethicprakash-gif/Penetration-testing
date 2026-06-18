# Migration Report — PentestingEverything → Docusaurus

This report summarizes the production-safe migration of the **PentestingEverything**
repository into a modern, static Docusaurus knowledge base. The migration preserves the
original repository as the **source of truth** and layers a documentation site on top of
it — no original documentation, PDF, image, or asset was modified, renamed, or deleted.

---

## 1. Architecture (the one decision that drives everything)

The original content folders at the repo root are treated as **immutable source**. A
deterministic, re-runnable script (`scripts/migrate.ts`) reads them and **generates** the
Docusaurus `docs/` tree, PDF reference pages, category metadata, and search/stat data.

```
Original folders (untouched, git-tracked)  ──►  scripts/migrate.ts  ──►  docs/  +  static/pdfs/  +  src/data/*.json
        (source of truth)                          (deterministic)              (generated, git-ignored, rebuilt in CI)
```

**Why:** it preserves git history and raw-file URLs perfectly, never risks the originals,
and makes future additions automatic — drop a new `.md` into any content folder and it
appears on the site on the next build with generated frontmatter, slug, tags, and metadata.
`docs/` and `static/pdfs/` are git-ignored build artifacts (CI runs `migrate → build`).

---

## 2. By the numbers

| Metric | Count |
|---|---|
| Top-level domains (sidebar sections) | 24 |
| Markdown documentation pages migrated | 93 |
| PDF reference pages generated | 104 |
| PDF binaries published | 104 |
| Total static HTML pages built | 327 |
| Original files modified | **0** |
| Build status | ✅ Passing |
| TypeScript typecheck | ✅ Clean |

---

## 3. Files added

**Project scaffold**
- `package.json`, `tsconfig.json`, `docusaurus.config.ts`, `sidebars.ts`, `.gitignore`

**Migration engine**
- `scripts/migrate.ts` — content walker, frontmatter generator, markdown normalizer,
  PDF reference generator, category builder, case-collision de-duplicator, empty-dir pruner

**React components (reusable)**
- `src/components/PdfRef.tsx` — PDF reference card (Open / Download actions, metadata)
- `src/components/CategoryIcon.tsx` — single-family Lucide icon map for all 24 domains

**Pages**
- `src/pages/index.tsx` (+ `index.module.css`) — homepage (hero, stats, domain grid,
  features, learning-path teasers)
- `src/pages/references.tsx` — searchable reference library grouped by domain
- `src/pages/learning-paths.tsx` — six curated structured paths

**Theme (non-ejecting swizzles)**
- `src/theme/Root.tsx` — global reading-progress bar + back-to-top button
- `src/theme/DocItem/Content/index.tsx` — per-page metadata bar (reading time, difficulty, platform)

**Design + assets**
- `src/css/custom.css` — full design system (light/dark, typography, cards, tables, code, chips)
- `static/img/logo.svg`, `static/img/favicon.svg`, `static/img/social-card.svg`
- `static/robots.txt`

**CI/CD**
- `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to `main`

**Generated at build time (git-ignored)**
- `docs/**`, `static/pdfs/**`, `src/data/manifest.json`, `src/data/docmeta.json`

## 4. Files modified / moved / deleted

- **Modified original content:** none.
- **Moved:** none (originals stay in place; `docs/` is a generated mirror).
- **Deleted:** one stray **empty** `Plans/` directory at the repo root (untracked, not part
  of the upstream repo, produced an empty category). The migration script now also prunes
  any empty generated directories automatically.

---

## 5. Content normalization applied (non-destructive, formatting only)

Per page, the migration script:
- Generates frontmatter: `title`, `sidebar_label`, `sidebar_position`, `description`,
  `slug`, `tags`, `keywords`, `custom_edit_url`, and git-derived `last_update`.
- Extracts the first H1 as the page title and removes the duplicate in-body heading.
- Normalizes spacing (collapses 3+ blank lines, trims trailing whitespace).
- Derives a clean URL slug while **preserving the folder structure** — display labels are
  controlled via `_category_.json`, so folders are never renamed on disk.
- Generates per-page metadata (reading time, difficulty heuristic, platform) into
  `docmeta.json`, rendered as a metadata bar — **no technical meaning is altered**.

## 6. Consolidation & fixes

- **Case-collision de-duplication:** the source contains `Computer Networking.pdf` and
  `Computer networking.pdf` (differ only by case) which collide on GitHub Pages / case-
  insensitive hosts. The engine now de-collides every emitted route and asset path
  deterministically.
- **Polished display labels** (display only — folders unchanged): `Infrastucture` →
  *Infrastructure*, `Cheack Llist` → *Checklist & Exploitation*, `Artibtray Cookies Flag`
  → *Arbitrary Cookie Flags*, `Outdate TLS Version` → *Outdated TLS Version*, etc.
- **Broken-link repair:** scheme-less external links (e.g. `ctf.example.info`) are rewritten
  to `https://` (conservatively, never touching relative `.md` links).
- **Clean category URLs:** README-less folders (e.g. Cloud Pentesting) get a generated
  index pinned to the clean slug (`/cloud-pentesting`) instead of `/category/...`.

---

## 7. Components created

| Component | Purpose |
|---|---|
| `PdfRef` | Reference card with Open/Download buttons and metadata |
| `CategoryIcon` | Consistent Lucide icon per domain (no emoji, one icon family) |
| `Root` (swizzle) | Reading-progress bar + back-to-top |
| `DocItem/Content` (swizzle) | Per-page metadata bar |
| `Home` / `References` / `LearningPaths` | Top-level pages |

## 8. Plugins installed

| Package | Why |
|---|---|
| `@docusaurus/preset-classic` | Docs, theme, sitemap, SEO |
| `@easyops-cn/docusaurus-search-local` | Fully static local search (Ctrl/Cmd+K, fuzzy, highlight) — **no Algolia** |
| `lucide-react` | Open-source SVG icon system |
| `prism-react-renderer` | Syntax highlighting (20+ languages) |

All packages are actively maintained and compatible with Docusaurus 3.x. No deprecated plugins.

---

## 9. Spec coverage

✅ Local static search · automatic sidebar from structure · breadcrumbs · TOC · prev/next ·
copy-heading-links · collapsible sections · sidebar state memory · reading progress · reading
time · dark/light · responsive · SEO (sitemap, OG/Twitter cards, canonical, robots) · PDF
reference pages · SVG icon system · GitHub "edit this page" (per-file `custom_edit_url`) ·
footer · GitHub Actions deploy · reusable components · scalable architecture.

---

## 10. Remaining manual tasks

1. **Enable GitHub Pages:** in the repo, set **Settings → Pages → Source = "GitHub Actions"**.
   The first push to `main` then builds and deploys automatically.
2. **Social card (optional):** `static/img/social-card.svg` is used for OG/Twitter. Some
   platforms (notably X/Twitter) prefer PNG — export a 1200×630 PNG if social previews matter.
3. **Three benign source warnings** (build still passes — they reflect upstream content):
   - `CONTRIBUTING.md` links to `./LICENSE` (a non-doc file).
   - The README's all-contributors table references two anchors that don't render
     (`#tool-KurozyOS`, `#translation-shps951023`).
4. **Custom domain (optional):** add a `CNAME` and adjust `url`/`baseUrl` (or the CI env
   vars `SITE_URL`/`BASE_URL`) if hosting on a custom domain.

## 11. Recommendations for future improvements

- Add a lightweight **CI link-check** step (`docusaurus build` already surfaces them) and
  optionally flip `onBrokenLinks` to `throw` once the source links are cleaned.
- Introduce **tag landing pages** curation (tags already auto-generate) for cross-topic
  discovery (e.g. all "IDOR", "SSRF" content across domains).
- Consider **MDX admonitions** (`:::tip`, `:::warning`) for high-value callouts in
  frequently-read pages — additive, no restructuring needed.
- Add **Open Graph PNG generation** to CI so every page gets a per-page social image.

---

*Generated as part of the Docusaurus migration. Re-run the migration any time with
`bun run migrate`; rebuild the site with `bun run build`; preview locally with `bun start`.*
