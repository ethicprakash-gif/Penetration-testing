import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {FileText, Search} from 'lucide-react';
import manifest from '@site/src/data/manifest.json';

type Pdf = {title: string; category: string; href: string; page: string; description: string};

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

  return (
    <Layout title="Reference Library" description="Curated cybersecurity reference PDFs across every testing domain.">
      <div className="container margin-vert--xl">
        <div className="pe-section__head" style={{marginBottom: '2rem'}}>
          <div className="pe-eyebrow">Library</div>
          <h1 className="pe-section__title">Reference Library</h1>
          <p className="pe-section__sub">{pdfs.length} curated PDF references across {manifest.categories.length} domains.</p>
        </div>

        <div className="pe-pdf" style={{padding: '0.6rem 1rem', alignItems: 'center', maxWidth: '34rem', margin: '0 auto 2.5rem'}}>
          <Search size={18} style={{flex: 'none', opacity: 0.6}} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter references…"
            aria-label="Filter references"
            style={{flex: 1, border: 'none', background: 'transparent', outline: 'none', font: 'inherit', color: 'inherit'}}
          />
        </div>

        {grouped.map(([category, items]) => (
          <section key={category} style={{marginBottom: '2.5rem'}}>
            <h2 style={{fontSize: '1.25rem', borderBottom: '1px solid var(--pe-border)', paddingBottom: '0.4rem'}}>
              {category} <span style={{color: 'var(--pe-muted)', fontWeight: 400, fontSize: '0.9rem'}}>({items.length})</span>
            </h2>
            <div className="pe-grid pe-grid--3">
              {items.map((p) => (
                <Link key={p.page} className="pe-card" to={p.page}>
                  <div className="pe-card__icon"><FileText size={22} /></div>
                  <h3 className="pe-card__title" style={{fontSize: '0.98rem'}}>{p.title}</h3>
                  <p className="pe-card__desc">Reference PDF</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {grouped.length === 0 && <p style={{textAlign: 'center', color: 'var(--pe-muted)'}}>No references match “{query}”.</p>}
      </div>
    </Layout>
  );
}
