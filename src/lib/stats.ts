// Server-only: live project stats, fetched at build time and revalidated daily (ISR).
// Never invents a number: a failed endpoint falls back to the last real snapshot, else null.

export type ProjectStats = { downloadsMonth: number | null; version: string | null; stars: number | null };

/** Last known-good numbers (from the old site's data/stats.json, 2026-07-02). */
const SNAPSHOT: Record<string, Partial<ProjectStats>> = {
  "confident-extract": { downloadsMonth: 190, version: "v0.1.0", stars: 1 },
};

const DAY = 86400;

async function json<T>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
  try {
    const res = await fetch(url, { headers, next: { revalidate: DAY }, signal: AbortSignal.timeout(4000) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function getStats(key: string, { pypi, github }: { pypi?: string; github?: string }): Promise<ProjectStats> {
  const gh: Record<string, string> = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const [dl, info, repo] = await Promise.all([
    pypi ? json<{ data?: { last_month?: number } }>(`https://pypistats.org/api/packages/${pypi}/recent`) : null,
    pypi ? json<{ info?: { version?: string } }>(`https://pypi.org/pypi/${pypi}/json`) : null,
    github ? json<{ stargazers_count?: number }>(`https://api.github.com/repos/${github}`, { Accept: "application/vnd.github+json", ...gh }) : null,
  ]);
  const snap = SNAPSHOT[key] ?? {};
  return {
    downloadsMonth: dl?.data?.last_month ?? snap.downloadsMonth ?? null,
    version: info?.info?.version ? `v${info.info.version}` : (snap.version ?? null),
    stars: repo?.stargazers_count ?? snap.stars ?? null,
  };
}
