#!/usr/bin/env bun
/**
 * Source restructure — consolidate reference documents.
 * ------------------------------------------------------
 * For every top-level category folder, move ALL PDF documents (found at any depth)
 * into a single `References/` folder directly under the category, then delete any
 * sub-folder that becomes empty as a result. Folders that still contain Markdown
 * (e.g. `Vulnerabilities/*`) or images are always preserved.
 *
 * Uses `git mv` so history follows each file. Run with `--dry` to preview.
 *
 *   bun scripts/restructure-source.ts --dry   # preview (no changes)
 *   bun scripts/restructure-source.ts         # apply
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const REF_DIR = 'References';

// Project / non-content entries to leave untouched.
const EXCLUDE = new Set([
  'node_modules', 'build', '.docusaurus', '.git', '.github', 'docs', 'src',
  'static', 'scripts', '.cache-loader',
]);

const plan = {moved: [] as string[], deleted: [] as string[], skipped: [] as string[]};

function git(args: string[]) {
  if (DRY) return;
  execFileSync('git', args, {cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe']});
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

/** Is the file tracked by git? (Untracked files are moved with fs.rename.) */
function isTracked(rel: string): boolean {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', rel], {cwd: ROOT, stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

function move(srcAbs: string, destAbs: string) {
  const srcRel = path.relative(ROOT, srcAbs);
  const destRel = path.relative(ROOT, destAbs);
  plan.moved.push(`${srcRel}  →  ${destRel}`);
  if (DRY) return;
  fs.mkdirSync(path.dirname(destAbs), {recursive: true});
  if (isTracked(srcRel)) git(['mv', '-f', srcRel, destRel]);
  else fs.renameSync(srcAbs, destAbs);
}

/**
 * Predict (and, when not dry, perform) deletion of folders that become empty once all
 * PDFs are moved out. A folder is removable if every file in it is a PDF being moved and
 * all its sub-folders are themselves removable. Markdown/image folders are never touched.
 * Returned deepest-first so removal is safe bottom-up.
 */
function emptyAfterMove(catDir: string): string[] {
  const removable: string[] = [];
  const visit = (dir: string): boolean => {
    if (path.basename(dir) === REF_DIR) return false; // the destination folder stays
    let allGone = true;
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!visit(p)) allGone = false;
      } else if (!/\.pdf$/i.test(e.name)) {
        allGone = false; // a non-PDF file (markdown, image) keeps the folder alive
      }
    }
    if (dir !== catDir && allGone) removable.push(dir);
    return allGone;
  };
  visit(catDir);
  return removable;
}

function uniqueDest(refDir: string, name: string, used: Set<string>): string {
  const ext = path.extname(name);
  const stem = name.slice(0, name.length - ext.length);
  let candidate = name;
  let n = 2;
  while (used.has(candidate.toLowerCase())) candidate = `${stem} (${n++})${ext}`;
  used.add(candidate.toLowerCase());
  return path.join(refDir, candidate);
}

function main() {
  console.log(`▶ Source restructure ${DRY ? '(DRY RUN — no changes)' : '(APPLYING)'}\n`);
  const topDirs = fs.readdirSync(ROOT, {withFileTypes: true})
    .filter((e) => e.isDirectory() && !EXCLUDE.has(e.name) && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort();

  for (const cat of topDirs) {
    const catDir = path.join(ROOT, cat);
    const refDir = path.join(catDir, REF_DIR);
    const allPdfs = walkFiles(catDir).filter((p) => /\.pdf$/i.test(p));
    // PDFs not already sitting in the category's References folder.
    const toMove = allPdfs.filter((p) => path.dirname(p) !== refDir);
    if (toMove.length === 0) {
      plan.skipped.push(`${cat} (no PDFs to consolidate)`);
      continue;
    }
    // Compute deletions BEFORE moving (predict which folders empty out).
    const toDelete = emptyAfterMove(catDir);
    const used = new Set<string>(
      fs.existsSync(refDir) ? fs.readdirSync(refDir).map((n) => n.toLowerCase()) : [],
    );
    for (const pdf of toMove) move(pdf, uniqueDest(refDir, path.basename(pdf), used));
    for (const d of toDelete) {
      plan.deleted.push(path.relative(ROOT, d));
      if (!DRY && fs.existsSync(d) && fs.readdirSync(d).length === 0) fs.rmdirSync(d);
    }
  }

  console.log(`Moved ${plan.moved.length} PDFs into per-category References/ folders:`);
  for (const m of plan.moved) console.log(`  ${m}`);
  console.log(`\nDeleted ${plan.deleted.length} now-empty folders:`);
  for (const d of plan.deleted) console.log(`  ${d}`);
  console.log(`\nSkipped categories: ${plan.skipped.length}`);
  for (const s of plan.skipped) console.log(`  ${s}`);
  console.log(DRY ? '\n(DRY RUN — nothing was changed. Re-run without --dry to apply.)' : '\n✔ Restructure applied.');
}

main();
