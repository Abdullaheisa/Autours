const CATEGORY_NAME_ORDER = [
  'Mini',
  'Small',
  'Standard',
  'Economy',
  'Full Size',
  'Compact SUV',
  'SUV',
  'VAN',
  'Family',
  'Luxury',
];

function categoryRank(name: string): number {
  const lower = name.toLowerCase().trim();
  const idx = CATEGORY_NAME_ORDER.findIndex(
    (label) => lower === label.toLowerCase() || lower.includes(label.toLowerCase())
  );
  return idx === -1 ? CATEGORY_NAME_ORDER.length : idx;
}

export function sortCategoriesByName<T extends { name: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => categoryRank(a.name) - categoryRank(b.name));
}
