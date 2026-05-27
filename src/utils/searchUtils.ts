/**
 * Search utilities
 */

/**
 * Simple fuzzy search — returns true if all query tokens appear in the target
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const queryTokens = query.toLowerCase().trim().split(/\s+/);
  const targetLower = target.toLowerCase();
  return queryTokens.every(token => targetLower.includes(token));
}

/**
 * Score a search match (higher = better match)
 */
export function searchScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();

  // Exact match
  if (t === q) return 100;

  // Starts with query
  if (t.startsWith(q)) return 90;

  // Contains full query
  if (t.includes(q)) return 70;

  // Token match
  const tokens = q.split(/\s+/);
  const matched = tokens.filter(token => t.includes(token)).length;
  return (matched / tokens.length) * 50;
}

/**
 * Rank items by search relevance
 */
export function rankByRelevance<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] {
  if (!query.trim()) return items;

  return items
    .map(item => ({
      item,
      score: searchScore(query, getSearchableText(item)),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Highlight matching text by wrapping in markers
 */
export function highlightMatch(text: string, query: string): { text: string; isHighlighted: boolean }[] {
  if (!query.trim()) return [{ text, isHighlighted: false }];

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  return parts.map(part => ({
    text: part,
    isHighlighted: regex.test(part),
  }));
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
