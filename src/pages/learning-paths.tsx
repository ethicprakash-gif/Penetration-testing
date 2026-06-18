import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {ArrowRight, CheckCircle2} from 'lucide-react';
import CategoryIcon from '@site/src/components/CategoryIcon';

type Path = {
  title: string;
  summary: string;
  level: string;
  steps: {label: string; slug: string; categoryKey: string}[];
};

const PATHS: Path[] = [
  {
    title: 'Web Application Pentester',
    summary: 'A complete route from methodology and recon through the OWASP Top 10 and into reporting.',
    level: 'Beginner → Advanced',
    steps: [
      {label: 'Web App methodology & checklist', slug: '/web-application-pentesting', categoryKey: 'Web Application Pentesting'},
      {label: 'API testing (REST & GraphQL)', slug: '/api-pentesting', categoryKey: 'API Pentesting'},
      {label: 'Secure code review (SAST)', slug: '/secure-code-review', categoryKey: 'Secure Code Review'},
      {label: 'Configuration review', slug: '/configuration-review', categoryKey: 'Configuration Review'},
    ],
  },
  {
    title: 'Cloud & Infrastructure',
    summary: 'Assess cloud providers, containers and the surrounding infrastructure end to end.',
    level: 'Intermediate',
    steps: [
      {label: 'Cloud pentesting (AWS / Azure / GCP)', slug: '/cloud-pentesting', categoryKey: 'Cloud Pentesting'},
      {label: 'Container & Kubernetes assessment', slug: '/container-and-kubernetes-assessment', categoryKey: 'Container & Kubernetes  Assessment'},
      {label: 'Infrastructure security', slug: '/infrastucture-security', categoryKey: 'Infrastucture Security'},
      {label: 'Network pentesting', slug: '/network-pentesting', categoryKey: 'Network Pentesting'},
    ],
  },
  {
    title: 'Mobile Security',
    summary: 'Android and iOS application testing, from fundamentals to dynamic instrumentation.',
    level: 'Beginner → Intermediate',
    steps: [
      {label: 'Mobile pentesting overview', slug: '/mobile-pentesting', categoryKey: 'Mobile Pentesting'},
      {label: 'Thick client pentesting', slug: '/thick-client-pentesting', categoryKey: 'Thick Client Pentesting'},
      {label: 'Forensic fundamentals', slug: '/forensic', categoryKey: 'Forensic'},
    ],
  },
  {
    title: 'Red Team & Internal',
    summary: 'Active Directory, networks and the tradecraft for internal engagements.',
    level: 'Advanced',
    steps: [
      {label: 'Active Directory pentesting', slug: '/active-directory-pentesting', categoryKey: 'Active Directory Pentesting'},
      {label: 'Network pentesting', slug: '/network-pentesting', categoryKey: 'Network Pentesting'},
      {label: 'OSINT', slug: '/osint', categoryKey: 'OSINT'},
      {label: 'Phishing assessment', slug: '/phishing-assessment', categoryKey: 'Phishing Assessment'},
    ],
  },
  {
    title: 'AI / LLM Security',
    summary: 'Test modern AI systems: LLM applications and the Model Context Protocol.',
    level: 'Intermediate',
    steps: [
      {label: 'LLM security assessment', slug: '/llm-security-assessment', categoryKey: 'LLM Security Assessment'},
      {label: 'MCP security assessment', slug: '/mcp-security-assessment', categoryKey: 'MCP Security Assessment'},
    ],
  },
  {
    title: 'DevSecOps & Pipeline',
    summary: 'Shift security left across CI/CD, threat modeling and software composition.',
    level: 'Intermediate',
    steps: [
      {label: 'DevSecOps', slug: '/devsecops', categoryKey: 'DevSecOps'},
      {label: 'CI/CD pentesting', slug: '/ci-cd-pentesting', categoryKey: 'CI-CD Pentesting'},
      {label: 'Threat modeling', slug: '/threat-modeling', categoryKey: 'Threat Modeling'},
    ],
  },
];

export default function LearningPaths(): React.JSX.Element {
  return (
    <Layout title="Learning Paths" description="Structured routes through the PentestingEverything knowledge base for common engagements.">
      <div className="container margin-vert--xl">
        <div className="pe-section__head" style={{marginBottom: '2.5rem'}}>
          <div className="pe-eyebrow">Get started</div>
          <h1 className="pe-section__title">Learning Paths</h1>
          <p className="pe-section__sub">Curated routes through the material. Each step links into the knowledge base.</p>
        </div>
        <div className="pe-grid pe-grid--2">
          {PATHS.map((p) => (
            <div key={p.title} className="pe-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem'}}>
                <span className="pe-chip">{p.level}</span>
              </div>
              <h3 className="pe-card__title">{p.title}</h3>
              <p className="pe-card__desc" style={{marginBottom: '1rem'}}>{p.summary}</p>
              <ol style={{listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {p.steps.map((s, i) => (
                  <li key={s.slug + i}>
                    <Link to={s.slug} style={{display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'inherit', textDecoration: 'none'}}>
                      <span style={{flex: 'none', color: 'var(--ifm-color-primary)'}}><CategoryIcon categoryKey={s.categoryKey} size={18} /></span>
                      <span style={{flex: 1}}>{s.label}</span>
                      <ArrowRight size={15} style={{opacity: 0.5}} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
