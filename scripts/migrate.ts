#!/usr/bin/env bun
/**
 * PentestingEverything — Migration Engine
 * ----------------------------------------
 * Reads the repository's ORIGINAL content folders (the source of truth, left
 * untouched) and generates a clean Docusaurus `docs/` tree plus supporting data.
 *
 * Design goals:
 *   - Deterministic + re-runnable: `bun scripts/migrate.ts` always reproduces the
 *     same output, so new files dropped into any content folder appear on the next
 *     build with zero manual wiring.
 *   - Non-destructive: originals are never modified, moved, or deleted.
 *   - Structure-faithful: the website navigation mirrors the repo folders exactly;
 *     only display labels are polished (typo fixes, spacing) — folders are not renamed.
 *
 * Outputs (all git-ignored, rebuilt in CI):
 *   docs/**                  migrated markdown + generated PDF reference pages
 *   docs/** /_category_.json  per-folder sidebar label / order / collapse
 *   static/pdfs/**           copied PDF binaries served by the site
 *   src/data/manifest.json   stats + category + pdf index (homepage / references page)
 *   src/data/docmeta.json    per-page reading time / difficulty / platform (meta bar)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const PDF_OUT = path.join(ROOT, 'static', 'pdfs');
const DATA = path.join(ROOT, 'src', 'data');

const GH_ORG = process.env.GH_ORG ?? 'bugs76-beep';
const GH_REPO = process.env.GH_REPO ?? 'PentestingEverything';
const GH_BRANCH = process.env.GH_BRANCH ?? 'main';
const RAW_BASE = `https://github.com/${GH_ORG}/${GH_REPO}/blob/${GH_BRANCH}`;

// Repo entries that are NOT source content (the Docusaurus project itself + meta).
const EXCLUDE = new Set([
  'node_modules', 'build', '.docusaurus', '.git', '.github', 'docs', 'src',
  'static', 'scripts', '.cache-loader',
]);
const EXCLUDE_FILES = new Set([
  'package.json', 'tsconfig.json', 'docusaurus.config.ts', 'sidebars.ts',
  '.gitignore', '.all-contributorsrc', 'action.sh', 'update.sh', 'LICENSE',
  'NOTICE.md', 'MIGRATION_REPORT.md',
]);

// Polished display labels (display ONLY — folders on disk are never renamed).
const LABEL_FIXES: Record<string, string> = {
  'Infrastucture Security': 'Infrastructure Security',
  'Cheack Llist and Exploit': 'Checklist & Exploitation',
  'Artibtray Cookies Flag': 'Arbitrary Cookie Flags',
  'Outdate TLS Version': 'Outdated TLS Version',
  'Container & Kubernetes  Assessment': 'Container & Kubernetes Assessment',
  'CheckList and methodology': 'Checklist & Methodology',
  'Advance Hacking': 'Advanced Techniques',
  'Basics Learn': 'Fundamentals',
  'Learn Basics': 'Fundamentals',
};

// Top-level category ordering for a sensible learning flow. Unlisted → alphabetical after.
const TOP_ORDER = [
  'Web Application Pentesting', 'API Pentesting', 'Network Pentesting',
  'Active Directory Pentesting', 'Cloud Pentesting', 'Container & Kubernetes  Assessment',
  'Mobile Pentesting', 'Thick Client Pentesting', 'IoT Pentesting', 'Wi-Fi Pentesting',
  'BlockChain Pentesting', 'LLM Security Assessment', 'MCP Security Assessment',
  'OSINT', 'Phishing Assessment', 'Secure Code Review', 'Configuration Review',
  'DevSecOps', 'CI-CD Pentesting', 'Threat Modeling', 'Firewall Penetration',
  'Infrastucture Security', 'Forensic',
];

// Platform tag inferred from the top-level category.
const PLATFORM: Record<string, string> = {
  'Web Application Pentesting': 'Web', 'API Pentesting': 'API',
  'Network Pentesting': 'Network', 'Active Directory Pentesting': 'Windows / AD',
  'Cloud Pentesting': 'Cloud', 'Container & Kubernetes  Assessment': 'Kubernetes',
  'Mobile Pentesting': 'Mobile', 'Thick Client Pentesting': 'Desktop',
  'IoT Pentesting': 'IoT', 'Wi-Fi Pentesting': 'Wireless',
  'BlockChain Pentesting': 'Blockchain', 'LLM Security Assessment': 'AI / LLM',
  'MCP Security Assessment': 'AI / LLM', 'OSINT': 'OSINT',
  'Phishing Assessment': 'Social Eng.', 'Secure Code Review': 'Source Code',
  'Configuration Review': 'Config', 'DevSecOps': 'DevSecOps',
  'CI-CD Pentesting': 'CI/CD', 'Threat Modeling': 'Design',
  'Firewall Penetration': 'Network', 'Infrastucture Security': 'Infrastructure',
  'Forensic': 'Forensics',
};

type DocMeta = {readingTime: number; difficulty: string; platform: string; tags: string[]; words: number};
type PdfEntry = {title: string; category: string; href: string; page: string; description: string};

// Case-insensitive uniqueness guards. The source repo contains paths that differ
// only by letter case (e.g. "Computer Networking.pdf" vs "Computer networking.pdf"),
// which collide on GitHub Pages and case-insensitive filesystems. We de-collide them
// deterministically so every emitted route and asset path is unique.
const usedSlugs = new Set<string>();
const usedStatic = new Set<string>();

function uniqueSlug(slug: string): string {
  let candidate = slug;
  let n = 2;
  while (usedSlugs.has(candidate.toLowerCase())) candidate = `${slug}-${n++}`;
  usedSlugs.add(candidate.toLowerCase());
  return candidate;
}

function uniqueStatic(relPath: string): string {
  const ext = path.extname(relPath);
  const stem = relPath.slice(0, relPath.length - ext.length);
  let candidate = relPath;
  let n = 2;
  while (usedStatic.has(candidate.toLowerCase())) candidate = `${stem}-${n++}${ext}`;
  usedStatic.add(candidate.toLowerCase());
  return candidate;
}

const docmeta: Record<string, DocMeta> = {};
const pdfs: PdfEntry[] = [];
const categoryCounts: Record<string, {docs: number; pdfs: number; label: string; slug: string}> = {};
const report = {docsWritten: 0, pdfsCopied: 0, categories: 0, indexPages: 0, pdfPages: 0};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[&]/g, ' and ')
    .replace(/[()]/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function prettyLabel(name: string): string {
  if (LABEL_FIXES[name]) return LABEL_FIXES[name];
  return name.replace(/\s+/g, ' ').trim();
}

function yamlString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').trim() + '"';
}

function gitDate(absPath: string): string | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', absPath], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function isReadme(name: string): boolean {
  return /^readme\.md$/i.test(name);
}

/** Light, safe markdown normalization. Code fences are preserved verbatim. */
function normalize(raw: string): {title: string | null; body: string; description: string; words: number} {
  let text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');

  // Pull the first H1 to use as the page title and remove it from the body so the
  // Docusaurus-rendered title is not duplicated.
  let title: string | null = null;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+?)\s*#*\s*$/);
    if (m && lines.slice(0, i).every((l) => l.trim() === '')) {
      title = m[1].replace(/[`*_]/g, '').trim();
      lines.splice(i, 1);
      // drop one blank line left behind
      if (lines[i] !== undefined && lines[i].trim() === '') lines.splice(i, 1);
      break;
    }
  }
  text = lines.join('\n');

  // Collapse 3+ blank lines, trim trailing spaces per line.
  text = text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';

  // Repair scheme-less external links (e.g. `](ctf.example.info)`), skipping code
  // fences. Conservative: only rewrites bare hosts ending in a known TLD so that
  // relative links like `](file.md)` are never touched.
  text = text
    .split(/(```[\s\S]*?```)/g)
    .map((seg, i) =>
      i % 2 === 1
        ? seg
        : seg.replace(
            /\]\((?!https?:\/\/|\/|\.\/|\.\.\/|#|mailto:|tel:)([a-z0-9.-]+\.(?:com|org|net|io|info|dev|app|gov|edu|co|me|ai|xyz)(?:\/[^)\s]*)?)\)/gi,
            '](https://$1)',
          ),
    )
    .join('');

  // Build a plain-text description from the first real paragraph (outside code/headings).
  const inCode = {v: false};
  let desc = '';
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) {inCode.v = !inCode.v; continue;}
    if (inCode.v) continue;
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('<') || t.startsWith('|') ||
        t.startsWith('-') || t.startsWith('*') || t.startsWith('>') || t.startsWith('![')) continue;
    desc = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_#>]/g, '').trim();
    if (desc.length > 30) break;
  }
  if (desc.length > 157) desc = desc.slice(0, 154).replace(/\s+\S*$/, '') + '…';

  const words = text.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
  return {title, body: text, description: desc, words};
}

function difficultyFor(name: string, body: string): string {
  const hay = (name + ' ' + body.slice(0, 400)).toLowerCase();
  if (/\b(basic|fundamental|intro|introduction|learn|getting started|beginner)\b/.test(hay)) return 'Beginner';
  if (/\b(advance|advanced|exploit|bypass|chain|privilege escalation|evasion)\b/.test(hay)) return 'Advanced';
  return 'Intermediate';
}

function deriveTags(topCategory: string, segments: string[], name: string): string[] {
  const set = new Set<string>();
  const plat = PLATFORM[topCategory];
  if (plat) set.add(plat);
  for (const seg of segments) {
    const label = prettyLabel(seg);
    if (label && label.length <= 28) set.add(label);
  }
  return Array.from(set).slice(0, 6);
}

function ensureDir(p: string) {fs.mkdirSync(p, {recursive: true});}

/** Recursively remove directories that ended up with no content (e.g. empty source folders). */
function pruneEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  let entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const e of entries) {
    if (e.isDirectory()) pruneEmpty(path.join(dir, e.name));
  }
  entries = fs.readdirSync(dir);
  // A lone _category_.json with no sibling docs is also "empty" for our purposes.
  const meaningful = entries.filter((n) => n !== '_category_.json');
  if (meaningful.length === 0) {
    fs.rmSync(dir, {recursive: true, force: true});
    return true;
  }
  return false;
}

function writeCategory(dir: string, label: string, position: number, description?: string, slug?: string) {
  const cat: Record<string, unknown> = {
    label,
    position,
    collapsible: true,
    collapsed: true,
  };
  if (description) {
    cat.link = {type: 'generated-index', description, title: label, ...(slug ? {slug} : {})};
  }
  fs.writeFileSync(path.join(dir, '_category_.json'), JSON.stringify(cat, null, 2));
}

// ---------------------------------------------------------------------------
// Core walk
// ---------------------------------------------------------------------------
function processFolder(srcDir: string, outDir: string, segments: string[], topCategory: string) {
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  ensureDir(outDir);

  const mdFiles = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md') && !EXCLUDE_FILES.has(e.name));
  const pdfFiles = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.pdf'));
  const imgFiles = entries.filter((e) => e.isFile() && /\.(png|jpe?g|gif|svg|webp)$/i.test(e.name));
  const subDirs = entries.filter((e) => e.isDirectory() && !EXCLUDE.has(e.name));

  const readme = mdFiles.find((e) => isReadme(e.name));
  const topLabel = prettyLabel(segments[segments.length - 1] ?? topCategory);

  // Copy any local images alongside content so relative refs keep working.
  for (const img of imgFiles) {
    const dest = path.join(outDir, img.name);
    fs.copyFileSync(path.join(srcDir, img.name), dest);
  }

  // --- Folder index (from README) ---
  let indexSlug = '/' + segments.map(slugify).join('/');
  if (segments.length === 0) indexSlug = '/overview';
  indexSlug = uniqueSlug(indexSlug);
  if (readme) {
    const abs = path.join(srcDir, readme.name);
    const {title, body, description, words} = normalize(fs.readFileSync(abs, 'utf8'));
    const finalTitle = title || topLabel;
    const tags = deriveTags(topCategory, segments, readme.name);
    const meta: DocMeta = {
      readingTime: Math.max(1, Math.round(words / 200)),
      difficulty: difficultyFor(topLabel, body),
      platform: PLATFORM[topCategory] ?? 'General',
      tags, words,
    };
    docmeta[indexSlug] = meta;
    const fm = buildFrontmatter({
      title: finalTitle, label: topLabel, slug: indexSlug,
      description: description || `${topLabel} — methodology, techniques, and references.`,
      tags, editUrl: ghEdit(abs), lastUpdate: gitDate(abs), sidebarPos: 0,
    });
    fs.writeFileSync(path.join(outDir, 'index.md'), fm + '\n' + body);
    report.indexPages++;
    report.docsWritten++;
    bumpCategory(topCategory, topLabel, 'docs');
  } else if (mdFiles.length > 0 || pdfFiles.length > 0 || subDirs.length > 0) {
    // Folder with content but no README → generated index so the category is clickable,
    // pinned to the clean folder slug (e.g. /cloud-pentesting) rather than /category/...
    writeCategory(outDir, topLabel, topPosition(topCategory, segments), `Documentation and references for ${topLabel}.`, indexSlug);
    usedSlugs.add(indexSlug.toLowerCase());
  }

  // --- _category_.json for ordering/label (when an index.md exists, no link needed) ---
  if (readme) writeCategory(outDir, topLabel, topPosition(topCategory, segments));

  // --- Non-README markdown docs ---
  let pos = 1;
  for (const md of mdFiles) {
    if (isReadme(md.name)) continue;
    const abs = path.join(srcDir, md.name);
    const {title, body, description, words} = normalize(fs.readFileSync(abs, 'utf8'));
    const base = md.name.replace(/\.md$/i, '');
    const finalTitle = title || prettyLabel(base);
    const docSlug = uniqueSlug(indexSlug + '/' + slugify(base));
    const docFile = docSlug.split('/').pop()! + '.md';
    const tags = deriveTags(topCategory, segments, base);
    const meta: DocMeta = {
      readingTime: Math.max(1, Math.round(words / 200)),
      difficulty: difficultyFor(base + ' ' + finalTitle, body),
      platform: PLATFORM[topCategory] ?? 'General',
      tags, words,
    };
    docmeta[docSlug] = meta;
    const fm = buildFrontmatter({
      title: finalTitle, label: prettyLabel(base), slug: docSlug,
      description: description || `${finalTitle} — ${topLabel}.`,
      tags, editUrl: ghEdit(abs), lastUpdate: gitDate(abs), sidebarPos: pos++,
    });
    fs.writeFileSync(path.join(outDir, docFile), fm + '\n' + body);
    report.docsWritten++;
    bumpCategory(topCategory, topLabel, 'docs');
  }

  // --- PDFs → copy binary + generate a reference page (.mdx) ---
  for (const pdf of pdfFiles) {
    const abs = path.join(srcDir, pdf.name);
    const relPdf = uniqueStatic(path.join(...segments.map(slugify), pdf.name));
    const destPdf = path.join(PDF_OUT, relPdf);
    ensureDir(path.dirname(destPdf));
    fs.copyFileSync(abs, destPdf);
    report.pdfsCopied++;

    const base = pdf.name.replace(/\.pdf$/i, '');
    const title = prettyLabel(base);
    const pdfSlug = uniqueSlug(indexSlug + '/ref-' + slugify(base));
    const pdfFile = pdfSlug.split('/').pop()! + '.mdx';
    const publicPath = '/pdfs/' + relPdf.split(path.sep).map(encodeURIComponent).join('/');
    const sizeKb = Math.round(fs.statSync(abs).size / 1024);
    const tags = deriveTags(topCategory, segments, base);
    const description = `Reference PDF: ${title} (${topLabel}).`;

    pdfs.push({title, category: topLabel, href: publicPath, page: pdfSlug, description});
    bumpCategory(topCategory, topLabel, 'pdfs');

    const fm = buildFrontmatter({
      title, label: title + ' (PDF)', slug: pdfSlug, description,
      tags, editUrl: ghEdit(abs), lastUpdate: gitDate(abs), sidebarPos: 50 + pos++,
    });
    const mdx = `${fm}
import PdfRef from '@site/src/components/PdfRef';

<PdfRef
  title=${JSON.stringify(title)}
  category=${JSON.stringify(topLabel)}
  href=${JSON.stringify(publicPath)}
  sizeKb={${sizeKb}}
  tags={${JSON.stringify(tags)}}
/>

## Reference notes

This page indexes a reference PDF that ships with the **${topLabel}** knowledge base.
Use the buttons above to open it in a new tab or download it for offline use.

> Looking for the written walkthrough? See the **${topLabel}** section in the sidebar for hands-on methodology covering the same material.
`;
    fs.writeFileSync(path.join(outDir, pdfFile), mdx);
    report.pdfPages++;
  }

  // --- Recurse ---
  for (const sub of subDirs) {
    processFolder(
      path.join(srcDir, sub.name),
      path.join(outDir, slugify(sub.name)),
      [...segments, sub.name],
      topCategory,
    );
  }
}

// ---------------------------------------------------------------------------
// Frontmatter + small utilities
// ---------------------------------------------------------------------------
function buildFrontmatter(o: {
  title: string; label: string; slug: string; description: string;
  tags: string[]; editUrl: string; lastUpdate: string | null; sidebarPos: number;
}): string {
  const lines = ['---'];
  lines.push(`title: ${yamlString(o.title)}`);
  lines.push(`sidebar_label: ${yamlString(o.label)}`);
  lines.push(`sidebar_position: ${o.sidebarPos}`);
  lines.push(`description: ${yamlString(o.description)}`);
  lines.push(`slug: ${yamlString(o.slug)}`);
  if (o.tags.length) lines.push(`tags: [${o.tags.map((t) => yamlString(t)).join(', ')}]`);
  if (o.tags.length) lines.push(`keywords: [${o.tags.map((t) => yamlString(t)).join(', ')}, "pentesting", "security"]`);
  lines.push(`custom_edit_url: ${yamlString(o.editUrl)}`);
  if (o.lastUpdate) {
    lines.push('last_update:');
    lines.push(`  date: ${yamlString(o.lastUpdate)}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function ghEdit(abs: string): string {
  const rel = path.relative(ROOT, abs).split(path.sep).map(encodeURIComponent).join('/');
  return `${RAW_BASE}/${rel}`;
}

function topPosition(topCategory: string, segments: string[]): number {
  if (segments.length > 1) return 1; // sub-folder; order handled locally
  const idx = TOP_ORDER.indexOf(topCategory);
  return idx === -1 ? 900 : idx + 1;
}

function bumpCategory(top: string, label: string, kind: 'docs' | 'pdfs') {
  const key = top;
  if (!categoryCounts[key]) categoryCounts[key] = {docs: 0, pdfs: 0, label: prettyLabel(label), slug: slugify(top)};
  categoryCounts[key][kind]++;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log('▶ PentestingEverything migration starting…');
  // Clean generated outputs (never touches originals).
  fs.rmSync(DOCS, {recursive: true, force: true});
  fs.rmSync(PDF_OUT, {recursive: true, force: true});
  ensureDir(DOCS);
  ensureDir(PDF_OUT);
  ensureDir(DATA);

  const rootEntries = fs.readdirSync(ROOT, {withFileTypes: true});
  const topDirs = rootEntries
    .filter((e) => e.isDirectory() && !EXCLUDE.has(e.name) && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort((a, b) => topPosition(a, [a]) - topPosition(b, [b]));

  for (const dir of topDirs) {
    report.categories++;
    processFolder(path.join(ROOT, dir), path.join(DOCS, slugify(dir)), [dir], dir);
  }

  // Root-level standalone markdown (README hub, help) → an "Overview" section.
  const overviewDir = path.join(DOCS, 'overview');
  ensureDir(overviewDir);
  writeCategory(overviewDir, 'Overview', 0);
  for (const f of ['README.md', 'help.md', 'CONTRIBUTING.md']) {
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) continue;
    const {title, body, description, words} = normalize(fs.readFileSync(abs, 'utf8'));
    const base = f.replace(/\.md$/i, '');
    const isIndex = /readme/i.test(base);
    const finalTitle = isIndex ? 'About PentestingEverything' : (title || prettyLabel(base));
    const slug = isIndex ? '/overview' : '/overview/' + slugify(base);
    docmeta[slug] = {readingTime: Math.max(1, Math.round(words / 200)), difficulty: 'Beginner', platform: 'General', tags: ['Overview'], words};
    const fm = buildFrontmatter({
      title: finalTitle, label: isIndex ? 'About' : prettyLabel(base), slug,
      description: description || 'About the PentestingEverything knowledge base.',
      tags: ['Overview'], editUrl: ghEdit(abs), lastUpdate: gitDate(abs), sidebarPos: isIndex ? 0 : 5,
    });
    fs.writeFileSync(path.join(overviewDir, isIndex ? 'index.md' : slugify(base) + '.md'), fm + '\n' + body);
    report.docsWritten++;
  }

  // Manifests consumed by homepage + references page.
  const categories = Object.entries(categoryCounts)
    .map(([key, v]) => ({key, label: v.label, slug: '/' + v.slug, docs: v.docs, pdfs: v.pdfs, platform: PLATFORM[key] ?? 'General'}))
    .sort((a, b) => topPosition(a.key, [a.key]) - topPosition(b.key, [b.key]));

  const stats = {
    docs: report.docsWritten,
    pdfs: report.pdfsCopied,
    categories: categories.length,
    topics: report.docsWritten + report.pdfsCopied,
  };

  // Drop any directories that produced no pages (defends against empty source folders).
  for (const d of fs.readdirSync(DOCS)) pruneEmpty(path.join(DOCS, d));

  fs.writeFileSync(path.join(DATA, 'manifest.json'), JSON.stringify({stats, categories, pdfs: pdfs.sort((a, b) => a.title.localeCompare(b.title))}, null, 2));
  fs.writeFileSync(path.join(DATA, 'docmeta.json'), JSON.stringify(docmeta, null, 2));

  console.log('✔ Migration complete');
  console.table({
    'Categories': report.categories,
    'Docs written': report.docsWritten,
    'Index pages': report.indexPages,
    'PDF pages': report.pdfPages,
    'PDFs copied': report.pdfsCopied,
  });
}

main();
