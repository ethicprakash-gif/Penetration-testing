import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {FileText, Search, ExternalLink, Download, Library} from 'lucide-react';
import CategoryIcon from '@site/src/components/CategoryIcon';
import manifest from '@site/src/data/manifest.json';

type Pdf = {title: string; category: string; categorySlug: string; href: string; page: string; description: string};
type Category = {key: string; label: string};

const LABEL_TO_KEY = new Map((manifest.categories as Category[]).map((c) => [c.label, c.key]));

function PdfCard({p}: {p: Pdf}): React.JSX.Element {
  const url = useBaseUrl(p.href);
  return (
    <div className="pe-ref-row">
      <div className="pe-ref-row__icon" aria-hidden="true"><FileText size={20} /></div>
      <div className="pe-ref-row__body">
        <span className="pe-ref-row__title">{p.title}</span>
        <span className="pe-ref-row__sub">{p.category}</span>
      </div>
      <div className="pe-ref-row__actions">
        <a className="pe-btn pe-btn--primary pe-btn--sm" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.title}`}>
          <ExternalLink size={15} /> Open
        </a>
        <a className="pe-btn pe-btn--ghost pe-btn--sm" href={url} download aria-label={`Download ${p.title}`}>
          <Download size={15} />
        </a>
      </div>
    </div>
  );
}

export default function References(): React.JSX.Element {
  const pdfs = manifest.pdfs as Pdf[];
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? pdfs.filter((p) => (p.title + ' ' + p.category).toLowerCase().includes(q)) : pdfs;
    const map = new Map<string, Pdf[]>();
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [query, pdfs]);

  const total = pdfs.length;
  const shown = grouped.reduce((n, [, items]) => n + items.length, 0);

  return (
    <Layout title="Reference Library" description="Curated cybersecurity reference PDFs across every testing domain.">
      <header className="pe-reflib__hero">
        <div className="container">
          <div className="pe-reflib__badge"><Library size={15} /> {total} documents · {manifest.categories.length} domains</div>
          <h1 className="pe-reflib__title">Reference Library</h1>
          <p className="pe-reflib__sub">Every curated PDF in one place — open in a new tab or download for offline use.</p>
          <div className="pe-reflib__search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter references by title or domain…"
              aria-label="Filter references"
            />
            {query && <span className="pe-reflib__count">{shown} match{shown === 1 ? '' : 'es'}</span>}
          </div>
        </div>
      </header>

      <main className="container margin-vert--xl">
        {grouped.map(([category, items]) => (
          <section key={category} className="pe-reflib__section">
            <div className="pe-reflib__cat">
              <span className="pe-reflib__cat-icon"><CategoryIcon categoryKey={LABEL_TO_KEY.get(category) ?? ''} size={20} /></span>
              <h2 className="pe-reflib__cat-title">{category}</h2>
              <span className="pe-chip">{items.length}</span>
              {items[0]?.page && <Link className="pe-reflib__cat-link" to={items[0].page}>Open section →</Link>}
            </div>
            <div className="pe-grid pe-grid--2">
              {items.map((p) => <PdfCard key={p.href} p={p} />)}
            </div>
          </section>
        ))}
        {grouped.length === 0 && <p style={{textAlign: 'center', color: 'var(--pe-muted)'}}>No references match “{query}”.</p>}
      </main>
    </Layout>
  );
}
