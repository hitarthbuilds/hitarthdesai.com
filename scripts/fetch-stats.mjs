// AUTOMATE.md §C — live-metrics fetcher. Pulls REAL numbers from public APIs and
// writes data/stats.json (consumed by the site at build time). Never invents a
// number: any endpoint that fails or is missing simply drops that stat.
//
// Run: node scripts/fetch-stats.mjs   (optional: GITHUB_TOKEN env for higher rate limit)
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'data', 'stats.json');

// (name, pypi package, github repo) — mirror of profile.json projects.
const PROJECTS = [
  { name: 'confident-extract', pypi: 'confident-extract', repo: 'hitarthbuilds/confident-extract' },
  { name: 'promptcrucible', pypi: 'promptcrucible', repo: 'hitarthbuilds/promptcrucible' },
];

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function getJSON(url, headers = {}) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function humanCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

async function fetchProject(p) {
  const out = {};

  // PyPI monthly downloads
  const dl = await getJSON(`https://pypistats.org/api/packages/${p.pypi}/recent`);
  if (dl?.data?.last_month != null) {
    out.downloadsMonth = dl.data.last_month;
    out.downloadsLabel = `${humanCount(dl.data.last_month)} downloads/mo`;
  }

  // PyPI latest version
  const pypi = await getJSON(`https://pypi.org/pypi/${p.pypi}/json`);
  if (pypi?.info?.version) out.version = `v${pypi.info.version}`;

  // GitHub stars + last push
  const gh = await getJSON(`https://api.github.com/repos/${p.repo}`, GH_HEADERS);
  if (gh && !gh.message) {
    if (typeof gh.stargazers_count === 'number' && gh.stargazers_count > 0) out.stars = gh.stargazers_count;
    if (gh.pushed_at) out.lastPush = gh.pushed_at.slice(0, 10);
  }

  return Object.keys(out).length ? out : null;
}

async function main() {
  const projects = {};
  for (const p of PROJECTS) {
    const stats = await fetchProject(p);
    if (stats) projects[p.name] = stats;
    console.log(`  ${p.name}: ${stats ? JSON.stringify(stats) : 'no stats — omitted'}`);
  }
  // generatedAt is passed in via env so re-runs with no data change produce no diff
  // when pinned; default to a fixed marker when absent.
  const generatedAt = process.env.STATS_TIMESTAMP || null;
  const payload = { generatedAt, projects };
  await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n');
  console.log(`\nWrote ${OUT}`);
}

main();
