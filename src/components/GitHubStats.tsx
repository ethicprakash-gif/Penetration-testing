import React, {useEffect, useState} from 'react';
import {Star, GitFork} from 'lucide-react';

/**
 * Navbar widget: GitHub icon + live star and fork counts for the project repo.
 * Counts are fetched client-side from the GitHub API and cached in localStorage
 * (6h TTL) so they stay current without refetching on every page view, and without
 * any build-time network dependency. Falls back to a dash until the first fetch.
 */
const REPO = 'm14r41/PentestingEverything';
const CACHE_KEY = 'pe-gh-stats-v1';
const TTL = 6 * 60 * 60 * 1000;

type Stats = {stars: number; forks: number; t: number};

function fmt(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return (v >= 10 ? Math.round(v).toString() : v.toFixed(1).replace(/\.0$/, '')) + 'k';
  }
  return String(n);
}

export default function GitHubStats(): React.JSX.Element {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as Stats | null;
      if (cached && Date.now() - cached.t < TTL) {
        setStats(cached);
        return;
      }
    } catch {
      /* ignore */
    }
    let alive = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        const s: Stats = {stars: d.stargazers_count ?? 0, forks: d.forks_count ?? 0, t: Date.now()};
        setStats(s);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(s));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      className="navbar__item pe-ghstats"
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`GitHub repository — ${stats ? `${stats.stars} stars, ${stats.forks} forks` : 'stars and forks'}`}>
      <span className="pe-ghstats__icon" aria-hidden="true" />
      <span className="pe-ghstats__stat" title="Stars">
        <Star size={14} strokeWidth={2} /> {stats ? fmt(stats.stars) : '—'}
      </span>
      <span className="pe-ghstats__sep" aria-hidden="true" />
      <span className="pe-ghstats__stat" title="Forks">
        <GitFork size={14} strokeWidth={2} /> {stats ? fmt(stats.forks) : '—'}
      </span>
    </a>
  );
}
