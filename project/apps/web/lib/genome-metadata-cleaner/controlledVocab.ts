import type { ControlledSuggestion, SupportedField } from './types';

const countryAliases: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'u s a': 'United States',
  'united states of america': 'United States',
  uk: 'United Kingdom',
  korea: 'South Korea',
  'republic of korea': 'South Korea',
  'south korea': 'South Korea',
  'north korea': 'North Korea',
  viet nam: 'Vietnam',
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
  if (!canonical) return [];
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
  if (field === 'country') return [...suggestFromAliasMap(value, countryAliases, 'Country'), ...suggestGenericTitleCase(value, 'Country')];
  if (field === 'host') return [...suggestFromAliasMap(value, hostAliases, 'Host'), ...suggestGenericTitleCase(value, 'Host')];
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
