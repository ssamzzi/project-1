import { suggestControlledVocabulary } from './controlledVocab';
import { detectSchema, fieldForHeader } from './schemaDetector';
import type {
  AnalysisResult,
  CaseStyle,
  ColumnConsensusProfile,
  DashboardSummary,
  DateParseResult,
  FieldProfile,
  FieldRecommendation,
  IssueCount,
  IssueType,
  ParsedDataset,
  ParsedRow,
  SelectedColumnAnalysis,
  SeparatorStyle,
  SupportedField,
} from './types';

function valueAt(row: ParsedRow, header: string) {
  return String(row[header] ?? '');
}

function normalizedDuplicateKey(value: string) {
  return value.toLowerCase().replace(/[\s._\-]+/g, '');
}

function isIdentityLikeColumn(header: string, field: SupportedField | undefined) {
  if (field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field)) return true;
  return /(?:^|[\s_])(id|segment[\s_]?id|accession)(?:$|[\s_])/i.test(header);
}

function shouldPreserveSeparators(header: string) {
  return /(location|lineage|clade|passage|history|source|genotype|publication|note|status|info|resistance|zip[_\s]?code)/i.test(header);
}

function normalizedLooseKey(value: string) {
  return value.toLowerCase().replace(/[_\-.\/]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function compactLooseKey(value: string) {
  return normalizedLooseKey(value).replace(/\s+/g, '');
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
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[left.length][right.length];
}

function uniqueExamples(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 5);
}

function detectCaseStyle(value: string): CaseStyle {
  const trimmed = value.trim();
  if (!trimmed) return 'other';
  if (/^[0-9._\-\/\s]+$/.test(trimmed)) return 'numeric';
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/i.test(trimmed)) return 'upper';
  if (trimmed === trimmed.toLowerCase() && /[A-Z]/i.test(trimmed)) return 'lower';
  const title = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  if (title === trimmed) return 'title';
  return 'mixed';
}

function detectSeparatorStyle(value: string): SeparatorStyle {
  const trimmed = value.trim();
  if (!trimmed) return 'none';
  const flags = [trimmed.includes(' '), trimmed.includes('-'), trimmed.includes('/'), trimmed.includes('_')];
  const count = flags.filter(Boolean).length;
  if (count === 0) return 'none';
  if (count > 1) return 'mixed';
  if (trimmed.includes(' ')) return 'space';
  if (trimmed.includes('-')) return 'hyphen';
  if (trimmed.includes('/')) return 'slash';
  return 'underscore';
}

function patternSignature(value: string, field: SupportedField | undefined) {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (field === 'collection_date') {
    const parsed = parseCollectionDate(trimmed);
    return parsed.kind;
  }
  if (field === 'subtype' && /^H\d{1,2}N\d{1,2}$/i.test(trimmed.replace(/[^A-Za-z0-9]/g, ''))) return 'subtype';
  if (/^[A-Z]{1,3}\d+$/i.test(trimmed)) return 'alpha-numeric';
  if (/^\d+$/.test(trimmed)) return 'numeric';
  if (/^[A-Za-z]+$/.test(trimmed.replace(/\s+/g, ''))) return 'letters';
  return 'mixed';
}

function mostCommonValue(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function countOccurrences(values: string[], target?: string) {
  if (!target) return 0;
  return values.filter((value) => value === target).length;
}

function buildConsensusProfile(header: string, field: SupportedField | undefined, rows: ParsedRow[]): ColumnConsensusProfile {
  const nonEmpty = rows.map((row) => valueAt(row, header).trim()).filter(Boolean);
  const caseValues = nonEmpty.map(detectCaseStyle);
  const separatorValues = nonEmpty.map(detectSeparatorStyle);
  const patternValues = nonEmpty.map((value) => patternSignature(value, field));
  const dominantPattern = mostCommonValue(patternValues) || 'empty';
  const dominantCase = (mostCommonValue(caseValues) || 'other') as CaseStyle;
  const dominantSeparator = (mostCommonValue(separatorValues) || 'none') as SeparatorStyle;
  const dominantDateKind = field === 'collection_date' ? (mostCommonValue(patternValues.filter((value) => value !== 'invalid')) as DateParseResult['kind'] | undefined) : undefined;

  const canonicalCandidates = nonEmpty
    .map((value) => {
      const suggestions = suggestControlledVocabulary(field, value);
      return suggestions[0]?.canonical || value;
    })
    .filter(Boolean);
  const canonicalValue = mostCommonValue(canonicalCandidates);
  const canonicalFrequency = countOccurrences(canonicalCandidates, canonicalValue);

  const outlierCount = nonEmpty.filter((value) => {
    const patternOutlier = patternSignature(value, field) !== dominantPattern;
    const caseOutlier = detectCaseStyle(value) !== dominantCase && dominantCase !== 'mixed';
    const separatorOutlier = detectSeparatorStyle(value) !== dominantSeparator && dominantSeparator !== 'mixed';
    const canonicalOutlier =
      !!canonicalValue &&
      !!field &&
      ['country', 'host', 'region', 'subtype', 'segment'].includes(field) &&
      (suggestControlledVocabulary(field, value)[0]?.canonical || value) !== canonicalValue;
    return patternOutlier || caseOutlier || separatorOutlier || canonicalOutlier;
  }).length;

  return {
    header,
    field,
    dominantPattern,
    dominantCase,
    dominantSeparator,
    dominantDateKind,
    canonicalValue,
    canonicalFrequency,
    outlierCount,
    examples: uniqueExamples(nonEmpty),
  };
}

export function parseCollectionDate(value: string): DateParseResult {
  const raw = value.trim();
  if (!raw) return { kind: 'invalid', reason: 'Empty date value.' };
  if (/^\d{4}$/.test(raw)) return { kind: 'year', normalized: raw, reason: 'Valid year-only date.' };
  if (/^\d{4}[-/]\d{1,2}$/.test(raw)) {
    const [year, month] = raw.split(/[-/]/).map(Number);
    if (month >= 1 && month <= 12) {
      return { kind: 'year-month', normalized: `${year.toString().padStart(4, '0')}-${String(month).padStart(2, '0')}`, reason: 'Valid year-month date.' };
    }
    return { kind: 'impossible', reason: 'Month is outside 1-12.' };
  }
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(raw)) {
    const [year, month, day] = raw.split(/[-/]/).map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    if (!valid) return { kind: 'impossible', reason: 'Day is invalid for the given month.' };
    return {
      kind: 'full',
      normalized: `${year.toString().padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      reason: 'Valid full date.',
    };
  }
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(raw)) {
    const [first, second] = raw.split(/[-/]/).map(Number);
    if (first <= 12 && second <= 12) return { kind: 'ambiguous', reason: 'Month/day order is ambiguous.' };
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    if (month < 1 || month > 12) return { kind: 'impossible', reason: 'Month is outside 1-12.' };
    const year = Number(raw.slice(-4));
    const date = new Date(Date.UTC(year, month - 1, day));
    const valid = date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    if (!valid) return { kind: 'impossible', reason: 'Day is invalid for the given month.' };
    return {
      kind: 'full',
      normalized: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      reason: 'Unambiguous day/month parsing was possible.',
    };
  }
  return { kind: 'invalid', reason: 'Date format is not supported.' };
}

function collectIssue(issueCounts: Map<IssueType, string[]>, type: IssueType, example: string) {
  const current = issueCounts.get(type) || [];
  current.push(example);
  issueCounts.set(type, current);
}

function detectFieldIssues(
  header: string,
  field: SupportedField | undefined,
  rows: ParsedRow[],
  consensus?: ColumnConsensusProfile,
): FieldProfile {
  const values = rows.map((row) => valueAt(row, header));
  const issueCounts = new Map<IssueType, string[]>();
  const nonEmpty = values.filter((value) => value.trim().length > 0);
  const duplicates = new Map<string, { rowIndices: number[]; values: string[] }>();
  const identityLikeColumn = isIdentityLikeColumn(header, field);
  const preserveSeparatorColumn = shouldPreserveSeparators(header);

  values.forEach((value, index) => {
    const trimmed = value.trim();
    if (!trimmed) {
      collectIssue(issueCounts, 'missing-value', value);
      return;
    }
    if (value !== trimmed || /\s{2,}/.test(value)) collectIssue(issueCounts, 'whitespace', value);
    const hasExplicitSeparatorIssue =
      !preserveSeparatorColumn &&
      !identityLikeColumn &&
      (/__+/.test(trimmed) || /--+/.test(trimmed) || /\s[/_-]\s/.test(trimmed) || /\/\//.test(trimmed));
    if (hasExplicitSeparatorIssue) collectIssue(issueCounts, 'separator', value);

    const caseStyle = detectCaseStyle(trimmed);
    if (
      field &&
      !identityLikeColumn &&
      ['country', 'host', 'region', 'subtype', 'segment'].includes(field) &&
      consensus?.dominantCase &&
      !['mixed', 'other', 'numeric'].includes(consensus.dominantCase) &&
      !['other', 'numeric'].includes(caseStyle) &&
      caseStyle !== consensus.dominantCase
    ) {
      collectIssue(issueCounts, 'casing', value);
    }

    const separatorStyle = detectSeparatorStyle(trimmed);
    if (
      !hasExplicitSeparatorIssue &&
      field &&
      !identityLikeColumn &&
      !preserveSeparatorColumn &&
      ['country', 'host', 'region', 'subtype', 'segment'].includes(field) &&
      consensus?.dominantSeparator &&
      !['mixed', 'none'].includes(consensus.dominantSeparator) &&
      !['mixed', 'none'].includes(separatorStyle) &&
      separatorStyle !== consensus.dominantSeparator
    ) {
      collectIssue(issueCounts, 'separator', value);
    }

    if (field === 'collection_date') {
      const parsed = parseCollectionDate(trimmed);
      if (parsed.kind === 'ambiguous') collectIssue(issueCounts, 'ambiguous-date', value);
      if (parsed.kind === 'impossible') collectIssue(issueCounts, 'impossible-date', value);
      if (parsed.kind === 'invalid') collectIssue(issueCounts, 'invalid-value', value);
      if (parsed.kind === 'full' && /[\/]/.test(trimmed)) collectIssue(issueCounts, 'mixed-date-format', value);
    }

    const suggestions = suggestControlledVocabulary(field, trimmed);
    if (suggestions.length) {
      if (suggestions.some((suggestion) => suggestion.canonical !== trimmed)) collectIssue(issueCounts, 'controlled-vocab', value);
    } else if (field && ['country', 'host', 'region', 'subtype', 'segment'].includes(field)) {
      const consensusCanonical = consensus?.canonicalValue;
      if (consensusCanonical) {
        const compactValue = compactLooseKey(trimmed);
        const compactCanonical = compactLooseKey(consensusCanonical);
        const distance = levenshteinDistance(compactValue, compactCanonical);
        if (compactValue && compactCanonical && compactValue !== compactCanonical && distance <= (compactCanonical.length >= 8 ? 2 : 1)) {
          collectIssue(issueCounts, 'controlled-vocab', value);
        } else {
          collectIssue(issueCounts, 'invalid-value', value);
        }
      } else {
        collectIssue(issueCounts, 'invalid-value', value);
      }
    } else if (consensus?.canonicalValue && field && ['country', 'host', 'region', 'subtype', 'segment'].includes(field)) {
      const normalizedValue = normalizedLooseKey(trimmed);
      const normalizedCanonical = normalizedLooseKey(consensus.canonicalValue);
      if (normalizedValue !== normalizedCanonical) {
        const distance = levenshteinDistance(compactLooseKey(trimmed), compactLooseKey(consensus.canonicalValue));
        if (distance <= (compactLooseKey(consensus.canonicalValue).length >= 8 ? 2 : 1)) {
          collectIssue(issueCounts, 'controlled-vocab', value);
        }
      }
    } else if (
      !field &&
      consensus?.canonicalValue &&
      (consensus.canonicalFrequency ?? 0) >= 2 &&
      consensus.canonicalValue !== trimmed
    ) {
      const normalizedValue = normalizedLooseKey(trimmed);
      const normalizedCanonical = normalizedLooseKey(consensus.canonicalValue);
      if (normalizedValue === normalizedCanonical) {
        collectIssue(issueCounts, 'casing', value);
      } else {
        const distance = levenshteinDistance(compactLooseKey(trimmed), compactLooseKey(consensus.canonicalValue));
        if (distance <= (compactLooseKey(consensus.canonicalValue).length >= 8 ? 2 : 1)) {
          collectIssue(issueCounts, 'controlled-vocab', value);
        }
      }
    }

    if (identityLikeColumn) {
      const key = normalizedDuplicateKey(trimmed);
      const existing = duplicates.get(key) || { rowIndices: [], values: [] };
      existing.rowIndices.push(index);
      existing.values.push(trimmed);
      duplicates.set(key, existing);
    }
  });

  const duplicateGroups = Array.from(duplicates.entries())
    .filter(([, group]) => group.rowIndices.length > 1)
    .map(([normalized, group]) => ({ normalized, rowIndices: group.rowIndices, values: Array.from(new Set(group.values)) }));

  duplicateGroups.forEach((group) => {
    if (group.values.length === 1) collectIssue(issueCounts, 'duplicate', group.values[0]);
    else collectIssue(issueCounts, 'likely-duplicate', group.values.join(' / '));
  });

  const issueList: IssueCount[] = Array.from(issueCounts.entries()).map(([type, examples]) => ({
    type,
    count: examples.length,
    examples: uniqueExamples(examples),
  }));

  return {
    header,
    field,
    totalRows: rows.length,
    nonEmptyRows: nonEmpty.length,
    uniqueValues: new Set(nonEmpty).size,
    issueCounts: issueList,
    duplicateGroups,
    distinctExamples: uniqueExamples(nonEmpty),
  };
}

function summarizeDashboard(profiles: FieldProfile[]): DashboardSummary {
  let totalIssues = 0;
  let safeSuggestions = 0;
  let reviewSuggestions = 0;
  let invalidValues = 0;
  profiles.forEach((profile) => {
    profile.issueCounts.forEach((issue) => {
      totalIssues += issue.count;
      if (['whitespace', 'casing', 'separator', 'mixed-date-format'].includes(issue.type)) safeSuggestions += issue.count;
      if (['ambiguous-date', 'duplicate', 'likely-duplicate', 'controlled-vocab'].includes(issue.type)) reviewSuggestions += issue.count;
      if (['invalid-value', 'impossible-date'].includes(issue.type)) invalidValues += issue.count;
    });
  });
  return {
    totalRows: profiles[0]?.totalRows || 0,
    totalIssues,
    safeSuggestions,
    reviewSuggestions,
    invalidValues,
  };
}

export function profileDataset(dataset: ParsedDataset): AnalysisResult {
  const schema = detectSchema(dataset);
  const columnConsensus = dataset.headers.map((header) => buildConsensusProfile(header, fieldForHeader(schema, header), dataset.rows));
  const profiles = dataset.headers.map((header) => {
    const match = schema.find((item) => item.header === header);
    const consensus = columnConsensus.find((item) => item.header === header);
    const profile = detectFieldIssues(header, fieldForHeader(schema, header), dataset.rows, consensus);
    if (match) profile.confidence = match.confidence;
    return profile;
  });
  return {
    dataset,
    schema,
    profiles,
    columnConsensus,
    recommendations: [],
    dashboard: summarizeDashboard(profiles),
  };
}

export function profileSelectedColumns(analysis: AnalysisResult, headers: string[], recommendations: FieldRecommendation[]): SelectedColumnAnalysis {
  const selectedHeaders = headers.filter((header) => analysis.dataset.headers.includes(header));
  const profiles = analysis.profiles.filter((profile) => selectedHeaders.includes(profile.header));
  const columnConsensus = analysis.columnConsensus.filter((profile) => selectedHeaders.includes(profile.header));
  return {
    dataset: analysis.dataset,
    headers: selectedHeaders,
    profiles,
    columnConsensus,
    recommendations: recommendations.filter((item) => selectedHeaders.includes(item.header)),
    dashboard: summarizeDashboard(profiles),
  };
}
