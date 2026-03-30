import { describe, expect, it } from 'vitest';
import {
  analyzeSelectedWorkflowColumns,
  analyzeWorkflow,
  applySelectedProposals,
  buildChangeLog,
  buildRecommendations,
  changeLogToCsv,
  generateDiffProposals,
  linkageRowsToCsv,
  matchMetadataToFasta,
  parseCollectionDate,
  parseDelimitedText,
  parseFastaText,
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

describe('genome metadata cleaner consensus profiling', () => {
  it('infers a dominant case pattern and counts outliers', () => {
    const analysis = buildAnalysis('subtype\nH1N1\nH3N2\nh5n1\n');
    const consensus = analysis.columnConsensus.find((item) => item.header === 'subtype');
    expect(consensus?.dominantCase).toBe('upper');
    expect(consensus?.outlierCount).toBeGreaterThan(0);
  });

  it('flags casing issues against the dominant column pattern', () => {
    const analysis = buildAnalysis('subtype\nH1N1\nH3N2\nh5n1\n');
    const profile = analysis.profiles.find((item) => item.header === 'subtype');
    expect(profile?.issueCounts.some((issue) => issue.type === 'casing')).toBe(true);
  });

  it('tracks dominant date pattern for collection dates', () => {
    const analysis = buildAnalysis('collection_date\n2024-01-03\n2024-02-07\n2024/03/09\n');
    const consensus = analysis.columnConsensus.find((item) => item.header === 'collection_date');
    expect(consensus?.dominantPattern).toBe('full');
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
    const proposals = generateDiffProposals(analysis.dataset, { host: 'host' as const }, policy, {
      selectedHeaders: ['host'],
      consensusProfiles: analysis.columnConsensus,
    });
    expect(proposals[0].suggestedValue).toBe('Human');
    expect(proposals[0].status).toBe('safe');
  });

  it('keeps identity-sensitive sample id cleanup in review', () => {
    const analysis = buildAnalysis('sample_id\n a_01 \n');
    const policy: NormalizationPolicy = {
      fieldPolicies: {
        sample_id: {
          enabled: true,
          strategy: 'safe-clean',
          trimWhitespace: true,
          collapseWhitespace: true,
          normalizeSeparators: true,
          normalizeCasing: true,
          normalizeDates: 'preserve',
          applyControlledVocabulary: 'off',
          customMappings: {},
        },
      },
    };
    const proposals = generateDiffProposals(analysis.dataset, { sample_id: 'sample_id' as const }, policy, {
      selectedHeaders: ['sample_id'],
      consensusProfiles: analysis.columnConsensus,
    });
    expect(proposals[0].status).toBe('review');
  });

  it('suggests controlled vocabulary canonicalization for countries', () => {
    const suggestions = suggestControlledVocabulary('country', 'USA');
    expect(suggestions[0].canonical).toBe('United States');
  });

  it('surfaces typo-like outliers using the dominant column canonical value', () => {
    const analysis = buildAnalysis('host\nHuman\nHuman\nhumna\n');
    const workflow = analyzeWorkflow(analysis.dataset);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['host']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { host: 'host' as const },
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    expect(proposals.some((proposal) => proposal.originalValue === 'humna' && proposal.issueType === 'controlled-vocab')).toBe(true);
  });

  it('surfaces typo-like outliers even when the column header is unknown', () => {
    const analysis = buildAnalysis('site_name\nBusan\nBusan\nbusna\n');
    const workflow = analyzeWorkflow(analysis.dataset);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['site_name']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { site_name: undefined },
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    expect(proposals.some((proposal) => proposal.originalValue === 'busna')).toBe(true);
  });
});

describe('genome metadata cleaner duplicate detection', () => {
  it('finds likely duplicate identifiers', () => {
    const analysis = buildAnalysis('sample_id\nA-01\na_01\n');
    const profile = analysis.profiles.find((item) => item.header === 'sample_id');
    expect(profile?.issueCounts.some((issue) => issue.type === 'likely-duplicate')).toBe(true);
  });
});

describe('genome metadata cleaner FASTA linkage', () => {
  it('classifies exact and normalized matches', () => {
    const metadata = parseDelimitedText('sample_id\nA_01\nB-02\n', 'metadata.csv', ',');
    const fasta = parseFastaText('>A_01\nATGC\n>B 02\nATGC\n', 'seqs.fasta');
    const report = matchMetadataToFasta(metadata.rows, fasta);
    expect(report.rows[0].name_match_status).toBe('exact');
    expect(report.rows[1].name_match_status).toBe('normalized_match');
  });

  it('exports linkage rows as csv', () => {
    const metadata = parseDelimitedText('sample_id\nA_01\n', 'metadata.csv', ',');
    const fasta = parseFastaText('>A_01\nATGC\n', 'seqs.fasta');
    const report = matchMetadataToFasta(metadata.rows, fasta);
    expect(linkageRowsToCsv(report.rows)).toContain('name_match_status');
  });
});

describe('genome metadata cleaner workflow integration', () => {
  it('supports metadata upload -> selection -> suggestions -> apply -> export flow', () => {
    const metadata = parseDelimitedText('country,collection_date\nUSA,2024/03/07\nsouth korea,03/04/2024\n', 'metadata.csv', ',');
    const workflow = analyzeWorkflow(metadata);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['country', 'collection_date']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { country: 'country', collection_date: 'collection_date' } as const,
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    const applied = applySelectedProposals(
      workflow.analysis.dataset,
      proposals.map((proposal) => ({ ...proposal, apply: proposal.status === 'safe' })),
    );
    const log = buildChangeLog(proposals.map((proposal) => ({ ...proposal, apply: proposal.status === 'safe' })));

    expect(selected.headers).toEqual(['country', 'collection_date']);
    expect(proposals.some((proposal) => proposal.issueType === 'controlled-vocab')).toBe(true);
    expect(String(applied.rows[0].country)).toBe('United States');
    expect(changeLogToCsv(log)).toContain('rowIndex');
  });

  it('supports metadata + FASTA linkage analysis', () => {
    const metadata = parseDelimitedText('sample_id,isolate_name\nA_01,alpha\nB_02,beta\n', 'metadata.csv', ',');
    const fasta = parseFastaText('>A_01\nATGC\n>B-02\nATGC\n', 'seqs.fasta');
    const workflow = analyzeWorkflow(metadata, fasta);
    expect(workflow.linkageReport?.matchedRows).toBe(2);
    expect(workflow.linkageReport?.rows[1].name_match_status).toBe('normalized_match');
  });
});
