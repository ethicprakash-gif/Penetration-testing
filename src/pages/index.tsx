import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {ArrowRight, BookOpen, Search, ShieldCheck, FileText, Route, Github, Linkedin, Globe, Heart} from 'lucide-react';
import CategoryIcon from '@site/src/components/CategoryIcon';
import manifest from '@site/src/data/manifest.json';
import styles from './index.module.css';

type Category = {key: string; label: string; slug: string; docs: number; pdfs: number; platform: string};
type Contributor = {login: string; name: string; avatar: string; profile: string};

const MAINTAINER = {
  name: 'Madhurendra Kumar',
  handle: 'm14r41',
  avatar: 'https://github.com/m14r41.png',
  github: 'https://github.com/m14r41',
  linkedin: 'https://www.linkedin.com/in/m14r41',
  website: 'https://m14r41.in',
};
const REPO_URL = 'https://github.com/m14r41/PentestingEverything';

const LEARNING_PATHS = [
  {title: 'Web Application Security', desc: 'From recon to OWASP Top 10 exploitation and reporting.', slug: '/web-application-pentesting'},
  {title: 'Cloud & Containers', desc: 'AWS, Azure, GCP and Kubernetes assessment workflows.', slug: '/cloud-pentesting'},
  {title: 'Mobile & API', desc: 'Android, iOS, REST and GraphQL testing methodology.', slug: '/mobile-pentesting'},
];

function Hero(): React.JSX.Element {
  const {stats} = manifest;
  return (
    <header className={styles.hero}>
      <div className="container">
        <div className={styles.heroInner}>
          <span className={styles.badge}>
            <ShieldCheck size={15} /> Offensive security knowledge base
          </span>
          <h1 className={styles.title}>
            Pentest <span className={styles.gradient}>everything</span>.<br />
            Find it in seconds.
          </h1>
          <p className={styles.subtitle}>
            A curated, searchable reference covering web, cloud, mobile, network, API, AD and
            more — methodology, checklists, payloads and field-tested references, all in one place.
          </p>
          <div className={styles.actions}>
            <Link className="pe-btn pe-btn--primary" to="/overview">
              <BookOpen size={18} /> Browse the knowledge base
            </Link>
            <Link className="pe-btn pe-btn--ghost" to="/learning-paths">
              <Route size={18} /> Learning paths
            </Link>
          </div>
          <div className={styles.statsBar}>
            <div className={styles.stat}><div className={styles.statNum}>{stats.docs}</div><div className={styles.statLabel}>Documentation pages</div></div>
            <div className={styles.stat}><div className={styles.statNum}>{stats.pdfs}</div><div className={styles.statLabel}>Reference PDFs</div></div>
            <div className={styles.stat}><div className={styles.statNum}>{stats.categories}</div><div className={styles.statLabel}>Domains covered</div></div>
            <div className={styles.stat}><div className={styles.statNum}>{stats.topics}+</div><div className={styles.statLabel}>Total topics</div></div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Categories(): React.JSX.Element {
  const categories = manifest.categories as Category[];
  return (
    <section className="pe-section">
      <div className="container">
        <div className="pe-section__head">
          <div className="pe-eyebrow">Coverage</div>
          <h2 className="pe-section__title">Every major attack surface</h2>
          <p className="pe-section__sub">Jump straight into the domain you are testing today.</p>
        </div>
        <div className="pe-grid pe-grid--4">
          {categories.map((c) => (
            <Link key={c.key} className="pe-card" to={c.slug}>
              <div className="pe-card__icon"><CategoryIcon categoryKey={c.key} /></div>
              <h3 className="pe-card__title">{c.label}</h3>
              <p className="pe-card__desc">{c.platform} security testing</p>
              <div className="pe-card__meta">
                <span>{c.docs} docs</span>
                {c.pdfs > 0 && <span>{c.pdfs} PDFs</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features(): React.JSX.Element {
  const items = [
    {icon: <Search size={22} />, title: 'Instant local search', desc: 'Fully static, offline-capable search with Ctrl/Cmd + K, fuzzy matching and in-page highlighting.'},
    {icon: <FileText size={22} />, title: 'Reference library', desc: '100+ curated PDFs with clean download and open actions, cross-linked to written methodology.'},
    {icon: <BookOpen size={22} />, title: 'Reading-first design', desc: 'Reading progress, estimated time, comfortable typography, and dark/light themes.'},
  ];
  return (
    <section className={`pe-section ${styles.surface}`}>
      <div className="container">
        <div className="pe-section__head">
          <div className="pe-eyebrow">Why this site</div>
          <h2 className="pe-section__title">Built for fast, focused reference</h2>
        </div>
        <div className="pe-grid pe-grid--3">
          {items.map((f) => (
            <div key={f.title} className="pe-card">
              <div className="pe-card__icon">{f.icon}</div>
              <h3 className="pe-card__title">{f.title}</h3>
              <p className="pe-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Paths(): React.JSX.Element {
  return (
    <section className="pe-section">
      <div className="container">
        <div className="pe-section__head">
          <div className="pe-eyebrow">Get started</div>
          <h2 className="pe-section__title">Suggested learning paths</h2>
          <p className="pe-section__sub">Structured routes through the material for common engagements.</p>
        </div>
        <div className="pe-grid pe-grid--3">
          {LEARNING_PATHS.map((p) => (
            <Link key={p.title} className="pe-card" to={p.slug}>
              <div className="pe-card__icon"><Route size={22} /></div>
              <h3 className="pe-card__title">{p.title}</h3>
              <p className="pe-card__desc">{p.desc}</p>
              <div className="pe-card__meta"><span>Start path <ArrowRight size={13} style={{verticalAlign: '-2px'}} /></span></div>
            </Link>
          ))}
        </div>
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <Link className="pe-btn pe-btn--ghost" to="/learning-paths">See all learning paths <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

function Maintainers(): React.JSX.Element {
  const contributors = (manifest.contributors ?? []) as Contributor[];
  return (
    <section className={`pe-section ${styles.surface}`}>
      <div className="container">
        <div className="pe-section__head">
          <div className="pe-eyebrow">People</div>
          <h2 className="pe-section__title">Maintainer &amp; Contributors</h2>
          <p className="pe-section__sub">Built and maintained in the open by the security community.</p>
        </div>

        <div className="pe-people">
          {/* Maintainer */}
          <figure className="pe-people__maintainer">
            <img className="pe-people__avatar" src={MAINTAINER.avatar} alt={MAINTAINER.name} loading="lazy" width={96} height={96} />
            <figcaption className="pe-people__body">
              <span className="pe-people__badge">Project Maintainer</span>
              <p className="pe-people__name">{MAINTAINER.name}</p>
              <p className="pe-people__handle">@{MAINTAINER.handle}</p>
              <div className="pe-people__links">
                <a className="pe-iconbtn" href={MAINTAINER.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={18} /></a>
                <a className="pe-iconbtn" href={MAINTAINER.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
                <a className="pe-iconbtn" href={MAINTAINER.website} target="_blank" rel="noopener noreferrer" aria-label="Website"><Globe size={18} /></a>
              </div>
            </figcaption>
          </figure>

          {/* Contributors */}
          <div className="pe-people__contrib">
            <h3 className="pe-people__contrib-title">
              Contributors {contributors.length > 0 && <span className="pe-people__count">{contributors.length}</span>}
            </h3>
            {contributors.length > 0 ? (
              <ul className="pe-people__avatars">
                {contributors.map((c) => (
                  <li key={c.login}>
                    <a href={c.profile} target="_blank" rel="noopener noreferrer" title={c.name}>
                      <img src={c.avatar} alt={c.name} loading="lazy" width={56} height={56} />
                      <span>{(c.name || c.login).split(' ')[0]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pe-card__desc">This project welcomes contributions from the community.</p>
            )}
            <div className="pe-people__actions">
              <a className="pe-btn pe-btn--ghost pe-btn--sm" href={`${REPO_URL}/graphs/contributors`} target="_blank" rel="noopener noreferrer">
                <Github size={15} /> All contributors
              </a>
              <Link className="pe-btn pe-btn--primary pe-btn--sm" to="/contributing">
                <Heart size={15} /> Become a contributor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="Pentest Everything — Offensive Security Knowledge Base"
      description="A curated, searchable cybersecurity knowledge base covering web, cloud, mobile, network, API, Active Directory, OSINT and more.">
      <Hero />
      <main>
        <Categories />
        <Features />
        <Paths />
        <Maintainers />
      </main>
    </Layout>
  );
}
