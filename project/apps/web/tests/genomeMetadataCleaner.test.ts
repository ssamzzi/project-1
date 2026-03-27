import { describe, expect, it } from 'vitest';
import {
  applySelectedProposals,
  buildChangeLog,
  buildRecommendations,
  generateDiffProposals,
  parseCollectionDate,
  parseDelimitedText,
  profileDataset,
  suggestControlledVocabulary,
} from '../lib/genome-metadata-cleaner';
import type { AnalysisResult, NormalizationPolicy } from '../lib/genome-metadata-cleaner';

function buildAnalysis(csv: string): AnalysisResult {
  const dataset = parseDelimitedText(csv, 'metadata.csv', ',');
  const analysis = profileDataset(dataset);
  return { ...analysis, recommendations: buildRecommendations(analysis) };
}

describe('genome metadata cleaner date parsing', () => {
  it('normalizes unambiguous dates while preserving YYYY and YYYY-MM', () => {
    expect(parseCollectionDate('2024').normalized).toBe('2024');
    expect(parseCollectionDate('2024/3').normalized).toBe('2024-03');
    expect(parseCollectionDate('2024/03/07').normalized).toBe('2024-03-07');
  });

  it('flags ambiguous and impossible dates', () => {
    expect(parseCollectionDate('03/04/2024').kind).toBe('ambiguous');
    expect(parseCollectionDate('2024-02-31').kind).toBe('impossible');
  });
});

describe('genome metadata cleaner normalization', () => {
  it('applies whitespace and casing cleanup safely for host values', () => {
    const analysis = buildAnalysis('host\n  human  \n');
    const policy: NormalizationPolicy = {
      fieldPolicies: {
        host: {
          enabled: true,
          strategy: 'canonicalize-safe',
          trimWhitespace: true,
          collapseWhitespace: true,
          normalizeSeparators: true,
          normalizeCasing: true,
          normalizeDates: 'preserve',
          applyControlledVocabulary: 'safe-only',
          customMappings: {},
        },
      },
    };
    const schemaByHeader = { host: 'host' as const };
    const proposals = generateDiffProposals(analysis.dataset, schemaByHeader, policy);
    expect(proposals[0].suggestedValue).toBe('Human');
    expect(proposals[0].status).toBe('safe');
  });

  it('suggests controlled vocabulary canonicalization for countries', () => {
    const suggestions = suggestControlledVocabulary('country', 'USA');
    expect(suggestions[0].canonical).toBe('United States');
  });
});

describe('genome metadata cleaner duplicate detection', () => {
  it('finds likely duplicate identifiers', () => {
    const analysis = buildAnalysis('sample_id\nA-01\na_01\n');
    const profile = analysis.profiles.find((item) => item.header === 'sample_id');
    expect(profile?.issueCounts.some((issue) => issue.type === 'likely-duplicate')).toBe(true);
  });
});

describe('genome metadata cleaner rule selection and apply flow', () => {
  it('honors skip policy and keeps risky date issues for review', () => {
    const analysis = buildAnalysis('collection_date,country\n03/04/2024,USA\n');
    const policy: NormalizationPolicy = {
      fieldPolicies: {
        collection_date: {
          enabled: true,
          strategy: 'review-only',
          trimWhitespace: true,
          collapseWhitespace: true,
          normalizeSeparators: true,
          normalizeCasing: false,
          normalizeDates: 'review-ambiguous',
          applyControlledVocabulary: 'off',
          customMappings: {},
        },
        country: {
          enabled: false,
          strategy: 'skip',
          trimWhitespace: false,
          collapseWhitespace: false,
          normalizeSeparators: false,
          normalizeCasing: false,
          normalizeDates: 'preserve',
          applyControlledVocabulary: 'off',
          customMappings: {},
        },
      },
    };
    const proposals = generateDiffProposals(analysis.dataset, { collection_date: 'collection_date', country: 'country' } as const, policy);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].issueType).toBe('ambiguous-date');
    expect(proposals[0].status).toBe('review');
  });

  it('previews and applies selected changes while preserving originals', () => {
    const analysis = buildAnalysis('host,country\n human ,USA\n');
    const policy: NormalizationPolicy = {
      fieldPolicies: {
        host: {
          enabled: true,
          strategy: 'canonicalize-safe',
          trimWhitespace: true,
          collapseWhitespace: true,
          normalizeSeparators: true,
          normalizeCasing: true,
          normalizeDates: 'preserve',
          applyControlledVocabulary: 'safe-only',
          customMappings: {},
        },
        country: {
          enabled: true,
          strategy: 'canonicalize-safe',
          trimWhitespace: true,
          collapseWhitespace: true,
          normalizeSeparators: true,
          normalizeCasing: true,
          normalizeDates: 'preserve',
          applyControlledVocabulary: 'safe-only',
          customMappings: {},
        },
      },
    };
    const proposals = generateDiffProposals(analysis.dataset, { host: 'host', country: 'country' } as const, policy).map((proposal) => ({ ...proposal, apply: true }));
    const applied = applySelectedProposals(analysis.dataset, proposals);
    const log = buildChangeLog(proposals);

    expect(String(analysis.dataset.rows[0].host)).toBe(' human ');
    expect(String(applied.rows[0].host)).toBe('Human');
    expect(String(applied.rows[0].country)).toBe('United States');
    expect(log).toHaveLength(2);
  });
});
