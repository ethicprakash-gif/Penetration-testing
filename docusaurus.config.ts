import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// --- Deployment identity -----------------------------------------------------
// Published to the custom domain pentesting.m14r41.in (CNAME in static/). The
// canonical project links/edit URLs point at the maintainer's repository.
// Everything is env-overridable for forks or alternate hosting.
const ORG = process.env.GH_ORG ?? 'm14r41';
const REPO = process.env.GH_REPO ?? 'PentestingEverything';
const SITE_URL = process.env.SITE_URL ?? 'https://pentesting.m14r41.in';
const BASE_URL = process.env.BASE_URL ?? '/';
const GITHUB_URL = `https://github.com/${ORG}/${REPO}`;

const config: Config = {
  title: 'PentestingEverything',
  tagline: 'A practical, searchable knowledge base for offensive security',
  favicon: 'img/favicon.svg',

  url: SITE_URL,
  baseUrl: BASE_URL,

  organizationName: ORG,
  projectName: REPO,
  trailingSlash: false,
  deploymentBranch: 'gh-pages',

  // Messy upstream markdown — warn rather than fail so the build always completes,
  // while still surfacing issues in CI logs for incremental cleanup.
  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  onDuplicateRoutes: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // CommonMark-leaning parsing keeps the large body of hand-written markdown
  // (raw <details>, task lists, stray angle brackets) from breaking the build,
  // while still allowing real .mdx pages to use full MDX.
  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    [
      // Fully static, build-time local search. No Algolia / external service.
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 12,
        searchResultContextMaxLength: 60,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/', // docs ARE the site
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          // Per-page `custom_edit_url` (emitted by the migration script) points each
          // page at its true original source file in the repo.
          editUrl: undefined,
          breadcrumbs: true,
          sidebarCollapsible: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: 'meta',
      attributes: {name: 'robots', content: 'index, follow'},
    },
    {
      tagName: 'meta',
      attributes: {name: 'theme-color', content: '#0ea5e9'},
    },
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    metadata: [
      {name: 'keywords', content: 'pentesting, penetration testing, cybersecurity, offensive security, web security, cloud security, mobile security, OSINT, red team, bug bounty'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    navbar: {
      title: 'PentestingEverything',
      logo: {
        alt: 'PentestingEverything',
        src: 'img/logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Knowledge Base',
        },
        {to: '/references', label: 'References', position: 'left'},
        {to: '/learning-paths', label: 'Learning Paths', position: 'left'},
        {to: '/contributing', label: 'Contribute', position: 'left'},
        {
          href: GITHUB_URL,
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Project',
          items: [
            {label: 'Knowledge Base', to: '/'},
            {label: 'Learning Paths', to: '/learning-paths'},
            {label: 'References', to: '/references'},
          ],
        },
        {
          title: 'Contribute',
          items: [
            {label: 'GitHub', href: GITHUB_URL},
            {label: 'Contributing Guide', to: '/contributing'},
            {label: 'Open an Issue', href: `${GITHUB_URL}/issues`},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'License', href: `${GITHUB_URL}/blob/main/LICENSE`},
            {label: 'Original Repository', href: 'https://github.com/m14r41/PentestingEverything'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} PentestingEverything · Maintained by <a href="${GITHUB_URL.replace('/PentestingEverything', '')}" target="_blank" rel="noopener noreferrer">Madhurendra Kumar (m14r41)</a> · Content licensed under the repository <a href="${GITHUB_URL}/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">LICENSE</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'bash', 'powershell', 'python', 'php', 'ruby', 'java', 'go', 'rust',
        'sql', 'json', 'yaml', 'docker', 'nginx', 'http', 'markup-templating',
        'csharp', 'kotlin', 'swift', 'toml', 'ini', 'diff',
      ],
      magicComments: [
        {className: 'theme-code-block-highlighted-line', line: 'highlight-next-line', block: {start: 'highlight-start', end: 'highlight-end'}},
      ],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
