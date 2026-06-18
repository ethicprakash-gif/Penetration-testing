import React from 'react';
import {FileText, Download, ExternalLink} from 'lucide-react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export interface PdfRefProps {
  title: string;
  category: string;
  href: string;
  sizeKb?: number;
  tags?: string[];
}

/**
 * Reference card for a PDF document. Rendered at the top of every generated
 * PDF reference page. Provides "Open" (new tab) and "Download" actions plus
 * lightweight metadata — no PDF is embedded by default to keep pages fast.
 */
export default function PdfRef({title, category, href, sizeKb, tags = []}: PdfRefProps): React.JSX.Element {
  const url = useBaseUrl(href);
  const size = sizeKb && sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : sizeKb ? `${sizeKb} KB` : undefined;
  return (
    <div className="pe-pdf">
      <div className="pe-pdf__icon" aria-hidden="true">
        <FileText size={28} strokeWidth={1.75} />
      </div>
      <div className="pe-pdf__body">
        <p className="pe-pdf__title">{title}</p>
        <p className="pe-pdf__sub">
          {category}
          {size ? ` · PDF · ${size}` : ' · PDF'}
        </p>
        <div className="pe-pdf__actions">
          <a className="pe-btn pe-btn--primary" href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} /> Open PDF
          </a>
          <a className="pe-btn pe-btn--ghost" href={url} download>
            <Download size={16} /> Download
          </a>
        </div>
        {tags.length > 0 && (
          <div className="pe-pdf__actions" style={{marginTop: '0.75rem'}}>
            {tags.map((t) => (
              <span key={t} className="pe-chip">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
