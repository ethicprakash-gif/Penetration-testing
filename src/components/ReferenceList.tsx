import React from 'react';
import {FileText, Download, ExternalLink} from 'lucide-react';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface RefItem {title: string; href: string; sizeKb?: number}
interface Group {label: string; items: RefItem[]}

function fmtSize(kb?: number): string {
  if (!kb) return 'PDF';
  return kb > 1024 ? `PDF · ${(kb / 1024).toFixed(1)} MB` : `PDF · ${kb} KB`;
}

function Row({item}: {item: RefItem}): React.JSX.Element {
  const url = useBaseUrl(item.href);
  return (
    <div className="pe-ref-row">
      <div className="pe-ref-row__icon" aria-hidden="true"><FileText size={20} /></div>
      <div className="pe-ref-row__body">
        <span className="pe-ref-row__title">{item.title}</span>
        <span className="pe-ref-row__sub">{fmtSize(item.sizeKb)}</span>
      </div>
      <div className="pe-ref-row__actions">
        <a className="pe-btn pe-btn--primary pe-btn--sm" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title}`}>
          <ExternalLink size={15} /> Open
        </a>
        <a className="pe-btn pe-btn--ghost pe-btn--sm" href={url} download aria-label={`Download ${item.title}`}>
          <Download size={15} />
        </a>
      </div>
    </div>
  );
}

/**
 * Renders all of a category's reference documents on a single page, grouped by
 * sub-area. Replaces the previous one-page-per-PDF layout to keep the sidebar clean.
 */
export default function ReferenceList({groups}: {groups: Group[]}): React.JSX.Element {
  return (
    <div className="pe-ref-list">
      {groups.map((g) => (
        <section key={g.label} className="pe-ref-group">
          {groups.length > 1 || g.label !== 'General' ? <h3 className="pe-ref-group__title">{g.label}</h3> : null}
          <div className="pe-ref-group__rows">
            {g.items.map((it) => (
              <Row key={it.href} item={it} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
