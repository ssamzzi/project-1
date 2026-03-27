import { suggestControlledVocabulary } from './controlledVocab';
import { detectSchema, fieldForHeader } from './schemaDetector';
import type { AnalysisResult, DashboardSummary, DateParseResult, FieldProfile, IssueCount, IssueType, ParsedDataset, ParsedRow, SupportedField } from './types';

function valueAt(row: ParsedRow, header: string) {
  return String(row[header] ?? '');
}

function normalizedDuplicateKey(value: string) {
  return value.toLowerCase().replace(/[\s._\-]+/g, '');
}

function uniqueExamples(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 5);
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

function detectFieldIssues(header: string, field: SupportedField | undefined, rows: ParsedRow[]): FieldProfile {
  const values = rows.map((row) => valueAt(row, header));
  const issueCounts = new Map<IssueType, string[]>();
  const nonEmpty = values.filter((value) => value.trim().length > 0);
  const duplicates = new Map<string, { rowIndices: number[]; values: string[] }>();

  values.forEach((value, index) => {
    const trimmed = value.trim();
    if (!trimmed) {
      collectIssue(issueCounts, 'missing-value', value);
      return;
    }
    if (value !== trimmed || /\s{2,}/.test(value)) collectIssue(issueCounts, 'whitespace', value);
    if (/[_/]+/.test(trimmed) || /\s-\s/.test(trimmed)) collectIssue(issueCounts, 'separator', value);

    const lowered = trimmed.toLowerCase();
    if (field && ['country', 'host', 'region', 'subtype', 'segment'].includes(field) && trimmed !== lowered && trimmed !== trimmed.toUpperCase()) {
      collectIssue(issueCounts, 'casing', value);
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
    } else if (field && ['country', 'host', 'subtype', 'segment'].includes(field)) {
      collectIssue(issueCounts, 'invalid-value', value);
    }

    if (field && ['sample_id', 'isolate_name', 'strain_name', 'sequence_id'].includes(field)) {
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
  const profiles = dataset.headers.map((header) => {
    const match = schema.find((item) => item.header === header);
    const profile = detectFieldIssues(header, fieldForHeader(schema, header), dataset.rows);
    if (match) profile.confidence = match.confidence;
    return profile;
  });
  return {
    dataset,
    schema,
    profiles,
    recommendations: [],
    dashboard: summarizeDashboard(profiles),
  };
}
