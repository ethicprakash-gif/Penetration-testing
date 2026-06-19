import React, {useEffect, useState} from 'react';
import {ArrowUp} from 'lucide-react';

/**
 * Wraps the whole app (non-ejecting swizzle). Adds two global reading aids:
 *   - a top scroll-progress bar
 *   - a back-to-top button that appears after scrolling
 * Both are purely client-side and respect prefers-reduced-motion via CSS.
 */
export default function Root({children}: {children: React.ReactNode}): React.JSX.Element {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
        setProgress(pct);
        setShowTop(el.scrollTop > 600);
        // Keep the active item visible inside the sticky right-hand TOC: Docusaurus
        // highlights it but does not scroll the TOC, so on long pages the highlight
        // drifts out of view. Nudge only the TOC's own scroll, never the page.
        const toc = document.querySelector('.theme-doc-toc-desktop');
        if (toc) {
          const actives = toc.querySelectorAll('.table-of-contents__link--active');
          const active = actives[actives.length - 1] as HTMLElement | undefined;
          if (active) {
            const t = toc.getBoundingClientRect();
            const a = active.getBoundingClientRect();
            const margin = 48;
            if (a.top < t.top + margin) {
              toc.scrollTop -= t.top + margin - a.top;
            } else if (a.bottom > t.bottom - margin) {
              toc.scrollTop += a.bottom - (t.bottom - margin);
            }
          }
        }
      });
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="pe-reading-progress" style={{width: `${progress}%`}} aria-hidden="true" />
      {children}
      <button
        type="button"
        className={`pe-back-to-top${showTop ? ' is-visible' : ''}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
        <ArrowUp size={20} />
      </button>
    </>
  );
}
