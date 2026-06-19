import React, {type ReactElement} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {Github, Linkedin, Globe, ListChecks} from 'lucide-react';
import styles from './styles.module.css';

interface FooterLinkItem {
  label: string;
  to?: string;
  href?: string;
}
interface FooterColumn {
  title: string;
  items: FooterLinkItem[];
}

const MAINTAINER = {
  name: 'm14r41',
  github: 'https://github.com/m14r41',
  linkedin: 'https://www.linkedin.com/in/m14r41',
  website: 'https://m14r41.in',
};
const CHECKLIST_URL = 'https://checklist.m14r41.in/';

function FooterLink({item}: {item: FooterLinkItem}): ReactElement {
  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {item.label}
      </a>
    );
  }
  return <Link to={item.to ?? '#'}>{item.label}</Link>;
}

/**
 * Custom footer (swizzled). Replaces the default link grid with a branded layout:
 * a brand/description block with social + companion links, the configured link
 * columns, and a meta bar with a dynamic copyright year.
 */
export default function Footer(): ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const logo = useBaseUrl('img/brand.svg');
  const themeFooter = (
    siteConfig.themeConfig as {
      footer?: {links?: FooterColumn[]; copyright?: string};
    }
  ).footer;
  const columns = themeFooter?.links ?? [];
  const copyright = themeFooter?.copyright;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>
              <img src={logo} alt="" width={30} height={30} />
              <span>{siteConfig.title}</span>
            </div>
            <p className={styles.brandDesc}>
              An open-source, searchable penetration-testing knowledge base
              covering methodology, payloads, commands, and field references
              across 23 security domains.
            </p>
            <div className={styles.social}>
              <a
                className={styles.iconBtn}
                href={MAINTAINER.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub">
                <Github size={18} />
              </a>
              <a
                className={styles.iconBtn}
                href={MAINTAINER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a
                className={styles.iconBtn}
                href={MAINTAINER.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website">
                <Globe size={18} />
              </a>
              <a
                className={styles.iconBtn}
                href={CHECKLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PentestingChecklist">
                <ListChecks size={18} />
              </a>
            </div>
          </div>

          <div className={styles.columns}>
            {columns.map((col) => (
              <div key={col.title} className={styles.column}>
                <h3>{col.title}</h3>
                <ul>
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.meta}>
          {copyright ? (
            <span dangerouslySetInnerHTML={{__html: copyright}} />
          ) : (
            <span>
              © {new Date().getFullYear()} {siteConfig.title}
            </span>
          )}
          <span className={styles.metaRight}>
            Built for the security community
          </span>
        </div>
      </div>
    </footer>
  );
}
