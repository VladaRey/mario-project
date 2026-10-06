export function normalizeForSearch(s: string): string {
  return s
    .replace(/[łŁ]/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(label: string, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  return normalizeForSearch(label).includes(q);
}

export function orderOptions<T extends { value: string; label: string; disabled?: boolean }>(options: T[], selected: string[]): T[] {
  const rank = (o: T) => (selected.includes(o.value) ? 0 : o.disabled ? 2 : 1);
  return [...options].sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label, "pl"));
}
