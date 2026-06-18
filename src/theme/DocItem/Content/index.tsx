import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Clock, Layers, Signal} from 'lucide-react';
import docmeta from '@site/src/data/docmeta.json';

type Props = WrapperProps<typeof ContentType>;
type Meta = {readingTime: number; difficulty: string; platform: string; tags: string[]; words: number};
const META = docmeta as Record<string, Meta>;

/**
 * Prepends a compact metadata bar (reading time, difficulty, platform) to every
 * doc page. Data comes from src/data/docmeta.json, keyed by the page permalink and
 * produced by the migration script — so no custom frontmatter keys are required.
 */
export default function ContentWrapper(props: Props): React.JSX.Element {
  const {metadata} = useDoc();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  // `permalink` is baseUrl-prefixed (e.g. /PentestingEverything/...); docmeta keys
  // are baseUrl-relative slugs, so strip the prefix before lookup.
  const raw = metadata.permalink ?? '';
  let key = raw;
  if (baseUrl && baseUrl !== '/' && raw.startsWith(baseUrl)) key = '/' + raw.slice(baseUrl.length);
  key = key.replace(/\/+$/, '') || '/';
  const meta = META[key] ?? META[key + '/'];

  return (
    <>
      {meta && (
        <div className="pe-metabar">
          <span className="pe-chip"><Clock size={13} /> {meta.readingTime} min read</span>
          <span className={`pe-chip pe-chip--diff-${meta.difficulty}`}><Signal size={13} /> {meta.difficulty}</span>
          {meta.platform && meta.platform !== 'General' && (
            <span className="pe-chip"><Layers size={13} /> {meta.platform}</span>
          )}
        </div>
      )}
      <Content {...props} />
    </>
  );
}
