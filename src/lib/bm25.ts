/**
 * Tiny BM25 index for "Ask the Roadie". Built at compile time (scripts/build-index.ts) and only
 * ever loaded on the server, so the chunks never ship in a client bundle.
 */

export type Chunk = { id: string; title: string; url: string; text: string };
export type Index = { chunks: Chunk[]; tf: Record<string, number>[]; len: number[]; df: Record<string, number>; avgdl: number };
export type Hit = Chunk & { score: number };

const STOP = new Set(
  "a an and are as at be but by can do does for from has have he his how i if in into is it its me my of on or our she so than that the their them then there these they this to was we were what when where which who why will with you your about just more most also any all not no yes".split(" "),
);

export function tokenize(s: string) {
  return (s.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]*[a-z0-9+#]|[a-z0-9]/g) ?? []).filter((t) => !STOP.has(t));
}

export function buildIndex(chunks: Chunk[]): Index {
  const tf = chunks.map((c) => {
    const m: Record<string, number> = {};
    for (const t of tokenize(`${c.title} ${c.title} ${c.text}`)) m[t] = (m[t] ?? 0) + 1;
    return m;
  });
  const len = tf.map((m) => Object.values(m).reduce((a, b) => a + b, 0));
  const df: Record<string, number> = {};
  for (const m of tf) for (const t of Object.keys(m)) df[t] = (df[t] ?? 0) + 1;
  return { chunks, tf, len, df, avgdl: len.reduce((a, b) => a + b, 0) / Math.max(1, len.length) };
}

export function search(index: Index, query: string, k = 5, k1 = 1.2, b = 0.75): Hit[] {
  const q = [...new Set(tokenize(query))];
  const N = index.chunks.length;
  const scored = index.chunks.map((c, i) => {
    let s = 0;
    for (const t of q) {
      const f = index.tf[i][t];
      if (!f) continue;
      const idf = Math.log(1 + (N - index.df[t] + 0.5) / (index.df[t] + 0.5));
      s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * index.len[i]) / index.avgdl)));
    }
    return { ...c, score: s };
  });
  return scored.filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}
