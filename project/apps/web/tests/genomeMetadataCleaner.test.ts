import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

function buildAnalysisFromFixture(relativePath: string): AnalysisResult {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const fixturePath = path.resolve(currentDir, '../../../genome-cleaner-fixtures', relativePath);
  const csv = readFileSync(fixturePath, 'utf8');
  const dataset = parseDelimitedText(csv, path.basename(fixturePath), ',');
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

  it('accepts common country names and influenza subtype prefixes without marking them invalid', () => {
    const analysis = buildAnalysis('country,subtype\nAustralia,A/H3N2\n');
    const workflow = analyzeWorkflow(analysis.dataset);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['country', 'subtype']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { country: 'country', subtype: 'subtype' } as const,
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    expect(proposals.some((proposal) => proposal.header === 'country' && proposal.issueType === 'invalid-value')).toBe(false);
    expect(proposals.some((proposal) => proposal.header === 'subtype' && proposal.issueType === 'invalid-value')).toBe(false);
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

  it('skips preserve-heavy GISAID style fields by default', () => {
    const analysis = buildAnalysis(
      'Isolate_Name,Location,Submitting_Sample_Id,Collection_Date,Subtype\n' +
      'A/Japan/001/2025,Asia / Japan / Okinawa,24/25-1065,2025-01-06,A / H3N2\n' +
      'A/Japan/002/2025,Asia / Japan,24/25-1066,2025-01-07,A / H3N2\n',
    );
    const recommendations = buildRecommendations(analysis);
    expect(recommendations.find((item) => item.header === 'Isolate_Name')?.recommendedStrategy).toBe('skip');
    expect(recommendations.find((item) => item.header === 'Location')?.recommendedStrategy).toBe('skip');
    expect(recommendations.find((item) => item.header === 'Submitting_Sample_Id')?.recommendedStrategy).toBe('skip');
    expect(recommendations.find((item) => item.header === 'Collection_Date')?.recommendedStrategy).toBe('canonicalize-safe');
  });

  it('does not treat underscore-only differences as separator cleanup targets by default', () => {
    const analysis = buildAnalysis('sample_name\nA_B_C\nA_B_D\n');
    const workflow = analyzeWorkflow(analysis.dataset);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['sample_name']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { sample_name: undefined } as const,
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    expect(proposals.some((proposal) => proposal.issueType === 'separator')).toBe(false);
  });

  it('does not surface subtype spacing-only normalization as a suggestion', () => {
    const analysis = buildAnalysis('Subtype\nA / H3N2\nA / H3N2\n');
    const workflow = analyzeWorkflow(analysis.dataset);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['Subtype']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { Subtype: 'subtype' } as const,
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    expect(proposals.length).toBe(0);
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

describe('genome metadata cleaner raw GISAID preset regression', () => {
  it('detects the GISAID raw preset on raw influenza exports', () => {
    const metadata = buildAnalysisFromFixture('raw/gisaid/japan-gisaid-raw.csv');
    const workflow = analyzeWorkflow(metadata.dataset);
    expect(workflow.defaultPolicy.presetName).toBe('gisaid-influenza-raw');
  });

  it('skips preserve-heavy columns by default on Japan raw fixture', () => {
    const metadata = buildAnalysisFromFixture('raw/gisaid/japan-gisaid-raw.csv');
    const workflow = analyzeWorkflow(metadata.dataset);
    expect(workflow.defaultPolicy.fieldPolicies.Location?.strategy).toBe('skip');
    expect(workflow.defaultPolicy.fieldPolicies.Isolate_Name?.strategy).toBe('skip');
    expect(workflow.defaultPolicy.fieldPolicies.Submitting_Sample_Id?.strategy).toBe('skip');
    expect(workflow.defaultPolicy.fieldPolicies.Collection_Date?.strategy).toBe('canonicalize-safe');
  });

  it('does not auto-select preserve-heavy columns from the Japan raw fixture', () => {
    const metadata = buildAnalysisFromFixture('raw/gisaid/japan-gisaid-raw.csv');
    const workflow = analyzeWorkflow(metadata.dataset);
    const selected = workflow.analysis.profiles
      .filter((profile) => {
        const recommendation = workflow.analysis.recommendations.find((item) => item.header === profile.header);
        const consensus = workflow.analysis.columnConsensus.find((item) => item.header === profile.header);
        if (!recommendation) return false;
        if (recommendation.recommendedStrategy === 'skip') return false;
        const totalIssues = profile.issueCounts.reduce((sum, issue) => sum + issue.count, 0);
        if (!totalIssues) return false;
        if (profile.field) return true;
        return (consensus?.outlierCount ?? 0) > 0;
      })
      .map((profile) => profile.header);

    expect(selected).not.toContain('Location');
    expect(selected).not.toContain('Isolate_Name');
    expect(selected).not.toContain('Submitting_Sample_Id');
  });

  it('suppresses subtype formatting-only suggestions on the Australia raw fixture', () => {
    const metadata = buildAnalysisFromFixture('raw/gisaid/australia-gisaid-raw.csv');
    const workflow = analyzeWorkflow(metadata.dataset);
    const selected = analyzeSelectedWorkflowColumns(workflow.analysis, ['Subtype']);
    const proposals = generateDiffProposals(
      workflow.analysis.dataset,
      { Subtype: 'subtype' } as const,
      workflow.defaultPolicy,
      { selectedHeaders: selected.headers, consensusProfiles: selected.columnConsensus },
    );
    expect(proposals.some((proposal) => proposal.header === 'Subtype' && ['separator', 'casing'].includes(proposal.issueType))).toBe(false);
  });
});
