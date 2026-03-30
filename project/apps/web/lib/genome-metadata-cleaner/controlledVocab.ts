import type { ControlledSuggestion, SupportedField } from './types';

const countryAliases: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'u s a': 'United States',
  'united states of america': 'United States',
  uk: 'United Kingdom',
  'republic of korea': 'South Korea',
  'south korea': 'South Korea',
  'north korea': 'North Korea',
  'viet nam': 'Vietnam',
};

const hostAliases: Record<string, string> = {
  human: 'Human',
  'homo sapiens': 'Human',
  swine: 'Swine',
  pig: 'Swine',
  avian: 'Avian',
  bird: 'Avian',
  chicken: 'Chicken',
  'gallus gallus': 'Chicken',
  duck: 'Duck',
  canine: 'Dog',
  dog: 'Dog',
  feline: 'Cat',
  cat: 'Cat',
  bovine: 'Cattle',
  cattle: 'Cattle',
  cow: 'Cattle',
  mouse: 'Mouse',
  'mus musculus': 'Mouse',
};

const segmentAliases: Record<string, string> = {
  pb2: 'PB2',
  pb1: 'PB1',
  pa: 'PA',
  ha: 'HA',
  np: 'NP',
  na: 'NA',
  mp: 'MP',
  m: 'MP',
  ns: 'NS',
};

function normalizeLookupKey(value: string) {
  return value.toLowerCase().replace(/[_\-./]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function compactLookupKey(value: string) {
  return normalizeLookupKey(value).replace(/\s+/g, '');
}

function levenshteinDistance(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const matrix = Array.from({ length: left.length + 1 }, () => new Array<number>(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[left.length][right.length];
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeSubtype(value: string): ControlledSuggestion[] {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = compact.match(/^H(\d{1,2})N(\d{1,2})$/);
  if (!match) return [];
  return [
    {
      value,
      canonical: `H${match[1]}N${match[2]}`,
      confidence: 0.99,
      reason: 'Recognized influenza subtype pattern.',
      safe: true,
    },
  ];
}

function suggestFromAliasMap(value: string, aliases: Record<string, string>, reasonLabel: string): ControlledSuggestion[] {
  const key = normalizeLookupKey(value);
  const canonical = aliases[key];
  if (canonical) {
    return [
      {
        value,
        canonical,
        confidence: 0.99,
        reason: `${reasonLabel} alias matched known controlled vocabulary.`,
        safe: canonical.toLowerCase() !== value.toLowerCase(),
      },
    ];
  }

  const compactKey = compactLookupKey(value);
  let bestCandidate: { alias: string; canonical: string; distance: number } | null = null;
  Object.entries(aliases).forEach(([alias, nextCanonical]) => {
    const aliasCompact = compactLookupKey(alias);
    const distance = levenshteinDistance(compactKey, aliasCompact);
    const maxDistance = compactKey.length >= 8 ? 2 : 1;
    if (distance > maxDistance) return;
    if (!bestCandidate || distance < bestCandidate.distance) {
      bestCandidate = { alias, canonical: nextCanonical, distance };
    }
  });

  if (!bestCandidate) return [];
  return [
    {
      value,
      canonical: bestCandidate.canonical,
      confidence: bestCandidate.distance === 1 ? 0.78 : 0.66,
      reason: `${reasonLabel} value is close to the known term "${bestCandidate.alias}" and may be a typo.`,
      safe: false,
    },
  ];
}

function suggestGenericTitleCase(value: string, reasonLabel: string): ControlledSuggestion[] {
  const canonical = titleCase(normalizeLookupKey(value));
  if (!canonical || canonical === value) return [];
  return [
    {
      value,
      canonical,
      confidence: 0.78,
      reason: `${reasonLabel} casing and separator cleanup could produce a cleaner canonical form.`,
      safe: false,
    },
  ];
}

export function suggestControlledVocabulary(field: SupportedField | undefined, value: string): ControlledSuggestion[] {
  if (!field || !value.trim()) return [];
  if (field === 'country') return suggestFromAliasMap(value, countryAliases, 'Country');
  if (field === 'host') return suggestFromAliasMap(value, hostAliases, 'Host');
  if (field === 'segment') {
    const canonical = segmentAliases[normalizeLookupKey(value)];
    return canonical
      ? [{ value, canonical, confidence: 0.99, reason: 'Influenza segment name matched a canonical segment symbol.', safe: canonical !== value }]
      : [];
  }
  if (field === 'subtype') return normalizeSubtype(value);
  if (field === 'region') return suggestGenericTitleCase(value, 'Region');
  return [];
}
