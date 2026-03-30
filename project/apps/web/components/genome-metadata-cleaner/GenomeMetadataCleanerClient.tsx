"use client";

import { useMemo, useState } from 'react';
import { SectionCard } from '../SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';
import {
  analyzeSelectedWorkflowColumns,
  analyzeWorkflow,
  applySelectedProposals,
  buildDefaultPolicy,
  buildRecommendations,
  buildChangeLog,
  changeLogToCsv,
  changeLogToJson,
  exportCleanedContent,
  generateDiffProposals,
  linkageReportToJson,
  linkageRowsToCsv,
  parseCollectionDate,
  parseInputFile,
  type AnalysisResult,
  type DiffProposal,
  type FieldPolicy,
  type FieldProfile,
  type ParsedDataset,
  type ParsedRow,
  type SelectedColumnAnalysis,
  type SupportedField,
} from '../../lib/genome-metadata-cleaner';

type StepKey = 'upload' | 'columns' | 'resolve' | 'export';
type ResolveTab = 'safe' | 'review' | 'manual';

interface WorkflowState {
  analysis: AnalysisResult;
  policy: ReturnType<typeof analyzeWorkflow>['defaultPolicy'];
  linkageReport: ReturnType<typeof analyzeWorkflow>['linkageReport'];
}

function getText(_isKo: boolean) {
  return {
    title: 'Genome Metadata Cleaner',
    subtitle: 'Simplified into upload -> choose columns -> resolve changes -> export.',
    upload: '1. Upload',
    columns: '2. Choose columns',
    resolve: '3. Resolve changes',
    export: '4. Export',
    metadataFile: 'Metadata file',
    fastaFile: 'FASTA file',
    optional: 'Optional',
    selectedFile: 'Selected file',
    noFile: 'No file selected',
    startAnalysis: 'Start analysis',
    analyzeAgain: 'Analyze again',
    analyzing: 'Analyzing...',
    issueSummary: 'Issue summary',
    chooseColumns: 'Choose only the columns you want to clean. Deep analysis runs only for those columns.',
    inferredMeaning: 'Inferred field',
    confidence: 'Confidence',
    issues: 'Issues',
    outliers: 'Outliers',
    strategy: 'Strategy',
    continueToResolve: 'Review suggestions',
    totalSuggestions: 'Total suggestions',
    safe: 'Auto-fix ready',
    review: 'Needs review',
    invalid: 'Fix manually',
    apply: 'Apply',
    row: 'Row',
    field: 'Column',
    originalValue: 'Original value',
    suggestedValue: 'Suggested value',
    manualEdit: 'Manual edit',
    issue: 'Issue',
    reason: 'Reason',
    action: 'Suggested action',
    backToColumns: 'Back to columns',
    applySafe: 'Apply auto-fix ready items',
    applySelected: 'Apply selected changes',
    exportWithoutChanges: 'Export without changes',
    finishReview: 'Finish review and export',
    reviewOnlyNotice: 'The current items require review or manual input.',
    reviewGuide: 'These items are not safe auto-fixes. Review the reason first, then choose to keep the original value, accept the suggested value, or enter your own value.',
    whyReview: 'Why review is needed',
    reviewDecision: 'Decision',
    previewAfterDecision: 'Value after your decision',
    confirmApply: 'Apply the selected changes? Raw data will stay preserved.',
    currentData: 'Current data',
    exportCurrent: 'Download current metadata',
    exportCleaned: 'Download cleaned metadata',
    changeLog: 'Change log',
    linkageReport: 'FASTA linkage report',
    linkageView: 'Linkage-aware CSV',
    noFasta: 'No FASTA file uploaded, so the linkage table is empty.',
    name: 'name',
    fastaName: 'fasta_name',
    matchStatus: 'match_status',
    matchConfidence: 'confidence',
    matchedBy: 'matchedBy',
    noSuggestions: 'No cleanup items were found for the selected columns.',
    useSuggested: 'Use suggested',
    keepOriginal: 'Keep original',
    keepCurrentValue: 'Keep current value',
    enterReplacement: 'Enter replacement',
  };
}

function issueTotal(profile: FieldProfile) { return profile.issueCounts.reduce((sum, issue) => sum + issue.count, 0); }
function summarizeField(profile: FieldProfile) { return !profile.issueCounts.length ? 'No issues' : profile.issueCounts.slice(0, 3).map((issue) => `${issue.type} (${issue.count})`).join(', '); }

function downloadText(filename: string, data: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function linkageAwareViewCsv(dataset: ParsedDataset, rows: ParsedRow[], linkageReport: WorkflowState['linkageReport']) {
  const linkageByRow = new Map((linkageReport?.rows || []).map((row) => [row.rowIndex, row]));
  const headers = [...dataset.headers, 'name', 'fasta_name', 'name_match_status', 'name_match_confidence'];
  const lines = [headers.join(','), ...rows.map((row) => headers.map((header) => {
    if (header in row) return `"${String(row[header] ?? '').replace(/"/g, '""')}"`;
    const linkage = linkageByRow.get(row.__rowIndex);
    if (header === 'name') return `"${String(linkage?.name ?? '').replace(/"/g, '""')}"`;
    if (header === 'fasta_name') return `"${String(linkage?.fasta_name ?? '').replace(/"/g, '""')}"`;
    if (header === 'name_match_status') return `"${String(linkage?.name_match_status ?? '').replace(/"/g, '""')}"`;
    return `"${String(linkage?.name_match_confidence ?? '').replace(/"/g, '""')}"`;
  }).join(','))];
  return lines.join('\n');
}

function fallbackStatus(issueType: DiffProposal['issueType']): DiffProposal['status'] {
  if (['invalid-value', 'impossible-date', 'missing-value'].includes(issueType)) return 'invalid';
  if (['ambiguous-date', 'duplicate', 'likely-duplicate', 'controlled-vocab'].includes(issueType)) return 'review';
  return 'safe';
}

function normalizedLooseTextForMatch(value: string) {
  return value.trim().replace(/[_\-.\/]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function detectCaseStyleForMatch(value: string) {
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

function detectSeparatorStyleForMatch(value: string) {
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

function isLikelyOutlierValue(
  value: string,
  issueType: DiffProposal['issueType'],
  consensus?: SelectedColumnAnalysis['columnConsensus'][number],
) {
  const trimmed = value.trim();
  if (issueType === 'missing-value') return !trimmed;
  if (!trimmed) return false;
  if (issueType === 'whitespace') return value !== trimmed || /\s{2,}/.test(value);
  if (issueType === 'separator') {
    return /[_/]+/.test(trimmed) ||
      /\s-\s/.test(trimmed) ||
      (!!consensus?.dominantSeparator &&
        !['mixed', 'none'].includes(consensus.dominantSeparator) &&
        !['mixed', 'none'].includes(detectSeparatorStyleForMatch(trimmed)) &&
        detectSeparatorStyleForMatch(trimmed) !== consensus.dominantSeparator);
  }
  if (issueType === 'casing') {
    return !!consensus?.dominantCase &&
      !['mixed', 'other', 'numeric'].includes(consensus.dominantCase) &&
      !['other', 'numeric'].includes(detectCaseStyleForMatch(trimmed)) &&
      detectCaseStyleForMatch(trimmed) !== consensus.dominantCase;
  }
  if (issueType === 'mixed-date-format') return /[\/]/.test(trimmed);
  if (issueType === 'ambiguous-date') return parseCollectionDate(trimmed).kind === 'ambiguous';
  if (issueType === 'impossible-date') return parseCollectionDate(trimmed).kind === 'impossible';
  if (issueType === 'invalid-value') return parseCollectionDate(trimmed).kind === 'invalid';
  if (issueType === 'controlled-vocab') {
    if (!consensus?.canonicalValue) return true;
    return normalizedLooseTextForMatch(trimmed) !== normalizedLooseTextForMatch(consensus.canonicalValue);
  }
  return true;
}

function findRepresentativeRow(
  analysis: AnalysisResult,
  header: string,
  issueType: DiffProposal['issueType'],
  consensus?: SelectedColumnAnalysis['columnConsensus'][number],
) {
  return analysis.dataset.rows.find((row) => isLikelyOutlierValue(String(row[header] ?? ''), issueType, consensus));
}

function findMatchingRows(
  analysis: AnalysisResult,
  header: string,
  issueType: DiffProposal['issueType'],
  consensus?: SelectedColumnAnalysis['columnConsensus'][number],
) {
  return analysis.dataset.rows.filter((row) => isLikelyOutlierValue(String(row[header] ?? ''), issueType, consensus));
}

function buildGenericConsensusReviewProposals(
  analysis: AnalysisResult,
  selectedAnalysis: SelectedColumnAnalysis,
  existing: DiffProposal[],
  schemaByHeader: Record<string, SupportedField | undefined>,
) {
  const existingKeys = new Set(existing.map((proposal) => `${proposal.rowIndex}:${proposal.header}`));
  const fallback: DiffProposal[] = [];

  selectedAnalysis.columnConsensus.forEach((consensus) => {
    if (schemaByHeader[consensus.header]) return;
    if (!consensus.canonicalValue || (consensus.canonicalFrequency ?? 0) < 2) return;

    analysis.dataset.rows.forEach((row, index) => {
      const value = String(row[consensus.header] ?? '');
      const trimmed = value.trim();
      if (!trimmed) return;
      const key = `${row.__rowIndex}:${consensus.header}`;
      if (existingKeys.has(key)) return;
      if (!isLikelyOutlierValue(value, 'controlled-vocab', consensus) && !isLikelyOutlierValue(value, 'casing', consensus)) return;

      fallback.push({
        id: `generic-${consensus.header}-${row.__rowIndex}-${index}`,
        rowIndex: row.__rowIndex,
        header: consensus.header,
        field: undefined,
        originalValue: value,
        suggestedValue: consensus.canonicalValue,
        issueType: normalizedLooseTextForMatch(trimmed) === normalizedLooseTextForMatch(consensus.canonicalValue) ? 'casing' : 'controlled-vocab',
        reason: `This value differs from the dominant repeated value "${consensus.canonicalValue}" in the selected column and should be reviewed.`,
        confidence: normalizedLooseTextForMatch(trimmed) === normalizedLooseTextForMatch(consensus.canonicalValue) ? 0.94 : 0.7,
        status: 'review',
        apply: false,
      });
      existingKeys.add(key);
    });
  });

  return fallback;
}

function buildFallbackReviewProposals(analysis: AnalysisResult, selectedAnalysis: SelectedColumnAnalysis, existing: DiffProposal[]) {
  const existingKeys = new Set(existing.map((proposal) => `${proposal.rowIndex}:${proposal.header}:${proposal.issueType}`));
  const fallback: DiffProposal[] = [];
  selectedAnalysis.profiles.forEach((profile) => {
    const consensus = selectedAnalysis.columnConsensus.find((item) => item.header === profile.header);
    profile.issueCounts.forEach((issue, index) => {
      const rows = findMatchingRows(analysis, profile.header, issue.type, consensus).slice(0, 12);
      rows.forEach((row, rowOffset) => {
        const key = `${row.__rowIndex}:${profile.header}:${issue.type}`;
        if (existingKeys.has(key)) return;
        existingKeys.add(key);
        fallback.push({
          id: `fallback-${profile.header}-${issue.type}-${index}-${rowOffset}`,
          rowIndex: row.__rowIndex,
          header: profile.header,
          field: profile.field,
          originalValue: String(row[profile.header] ?? ''),
          suggestedValue: String(row[profile.header] ?? ''),
          issueType: issue.type,
          reason: `Detected ${issue.type} in the selected column. Review is needed.`,
          confidence: fallbackStatus(issue.type) === 'safe' ? 0.8 : fallbackStatus(issue.type) === 'review' ? 0.4 : 0.1,
          status: fallbackStatus(issue.type),
          apply: false,
        });
      });
    });
  });
  return fallback;
}

function dedupeProposals(proposals: DiffProposal[]) {
  const seen = new Set<string>();
  return proposals.filter((proposal) => {
    const key = `${proposal.rowIndex}:${proposal.header}:${proposal.issueType}:${proposal.suggestedValue}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeLooseText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function buildConsensusFallbackProposals(
  analysis: AnalysisResult,
  selectedAnalysis: SelectedColumnAnalysis,
  schemaByHeader: Record<string, SupportedField | undefined>,
): DiffProposal[] {
  const proposals: DiffProposal[] = [];

  selectedAnalysis.headers.forEach((header) => {
    const field = schemaByHeader[header];
    const profile = selectedAnalysis.profiles.find((item) => item.header === header);
    const consensus = selectedAnalysis.columnConsensus.find((item) => item.header === header);
    if (!profile) return;

    analysis.dataset.rows.forEach((row) => {
      const original = String(row[header] ?? '');
      const trimmed = original.trim();
      if (!trimmed) {
        proposals.push({
          id: `consensus-${row.__rowIndex}-${header}-missing`,
          rowIndex: row.__rowIndex,
          header,
          field,
          originalValue: original,
          suggestedValue: '',
          issueType: 'missing-value',
          reason: 'This selected cell is empty and needs a direct value.',
          confidence: 0.2,
          status: 'invalid',
          apply: false,
        });
        return;
      }

      const loose = normalizeLooseText(original);
      if (loose !== original) {
        proposals.push({
          id: `consensus-${row.__rowIndex}-${header}-whitespace`,
          rowIndex: row.__rowIndex,
          header,
          field,
          originalValue: original,
          suggestedValue: loose,
          issueType: 'whitespace',
          reason: 'Whitespace differs from the normalized column style.',
          confidence: 0.98,
          status: 'safe',
          apply: true,
        });
      }

      if (field === 'collection_date') {
        const parsed = parseCollectionDate(trimmed);
        if (parsed.kind === 'ambiguous') {
          proposals.push({
            id: `consensus-${row.__rowIndex}-${header}-ambiguous-date`,
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: original,
            issueType: 'ambiguous-date',
            reason: parsed.reason,
            confidence: 0.2,
            status: 'review',
            apply: false,
          });
        } else if (parsed.kind === 'impossible' || parsed.kind === 'invalid') {
          proposals.push({
            id: `consensus-${row.__rowIndex}-${header}-invalid-date`,
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: original,
            issueType: parsed.kind === 'impossible' ? 'impossible-date' : 'invalid-value',
            reason: parsed.reason,
            confidence: 0.1,
            status: 'invalid',
            apply: false,
          });
        } else if (parsed.normalized && parsed.normalized !== trimmed) {
          proposals.push({
            id: `consensus-${row.__rowIndex}-${header}-normalized-date`,
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: parsed.normalized,
            issueType: 'mixed-date-format',
            reason: 'This date can be normalized to the dominant format safely.',
            confidence: 0.98,
            status: 'safe',
            apply: true,
          });
        }
      }

      if (consensus?.canonicalValue) {
        const left = normalizeLooseText(trimmed).toLowerCase();
        const right = normalizeLooseText(consensus.canonicalValue).toLowerCase();
        if (left === right && trimmed !== consensus.canonicalValue) {
          proposals.push({
            id: `consensus-${row.__rowIndex}-${header}-canonical-case`,
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: consensus.canonicalValue,
            issueType: 'controlled-vocab',
            reason: 'This value matches the dominant canonical form but uses a different presentation.',
            confidence: 0.96,
            status: field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field) ? 'review' : 'safe',
            apply: !(field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field)),
          });
        }
      }
    });

    profile.duplicateGroups.forEach((group, groupIndex) => {
      group.rowIndices.forEach((rowIndex) => {
        const row = analysis.dataset.rows[rowIndex];
        if (!row) return;
        proposals.push({
          id: `consensus-${row.__rowIndex}-${header}-duplicate-${groupIndex}`,
          rowIndex: row.__rowIndex,
          header,
          field,
          originalValue: String(row[header] ?? ''),
          suggestedValue: String(row[header] ?? ''),
          issueType: group.values.length === 1 ? 'duplicate' : 'likely-duplicate',
          reason: `This value belongs to a duplicate group in the selected column: ${group.values.join(' / ')}.`,
          confidence: 0.3,
          status: 'review',
          apply: false,
        });
      });
    });

  });

  return proposals;
}

function suggestionLabel(proposal: DiffProposal, _isKo: boolean) {
  if (proposal.originalValue !== proposal.suggestedValue) return proposal.suggestedValue || '-';
  if (proposal.issueType === 'missing-value') return 'Manual value needed';
  if (proposal.issueType === 'duplicate' || proposal.issueType === 'likely-duplicate') return 'Review duplicate group';
  if (proposal.issueType === 'ambiguous-date') return 'Resolve date format manually';
  if (proposal.issueType === 'impossible-date' || proposal.issueType === 'invalid-value') return 'Replace with a valid value';
  if (proposal.issueType === 'controlled-vocab') return 'Choose a canonical term';
  return 'Review required';
}

function actionLabel(proposal: DiffProposal, _isKo: boolean) {
  if (proposal.issueType === 'missing-value') return 'Enter a replacement value.';
  if (proposal.issueType === 'duplicate' || proposal.issueType === 'likely-duplicate') return 'Review the duplicate group and choose the value to keep.';
  if (proposal.issueType === 'ambiguous-date') return 'Choose the intended date format manually.';
  if (proposal.issueType === 'impossible-date' || proposal.issueType === 'invalid-value') return 'Replace the value with a valid format.';
  if (proposal.issueType === 'controlled-vocab') return 'Choose the preferred canonical term.';
  return 'Review the issue and decide the next value.';
}

function displayRowNumber(rowIndex: number) {
  return rowIndex + 1;
}

function reviewTone(status: DiffProposal['status']) {
  if (status === 'safe') return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  if (status === 'invalid') return 'border-rose-200 bg-rose-50 text-rose-900';
  return 'border-amber-200 bg-amber-50 text-amber-900';
}

export function GenomeMetadataCleanerClient() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const text = getText(isKo);
  const [step, setStep] = useState<StepKey>('upload');
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [fastaFile, setFastaFile] = useState<File | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [resolveTab, setResolveTab] = useState<ResolveTab>('safe');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [manualEdits, setManualEdits] = useState<Record<string, string>>({});
  const [appliedRows, setAppliedRows] = useState<ParsedRow[] | null>(null);
  const [appliedLog, setAppliedLog] = useState<ReturnType<typeof buildChangeLog>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analysis = workflow?.analysis ?? null;
  const fallbackRecommendations = useMemo(() => (analysis ? buildRecommendations(analysis) : []), [analysis]);
  const recommendations = useMemo(() => {
    if (!analysis) return [];
    return analysis.recommendations.length ? analysis.recommendations : fallbackRecommendations;
  }, [analysis, fallbackRecommendations]);
  const policy = useMemo(() => {
    if (!analysis) return null;
    const existing = workflow?.policy;
    if (existing && Object.keys(existing.fieldPolicies || {}).length > 0) return existing;
    return buildDefaultPolicy({ ...analysis, recommendations });
  }, [analysis, recommendations, workflow?.policy]);
  const linkageReport = workflow?.linkageReport ?? null;

  const schemaByHeader = useMemo<Record<string, SupportedField | undefined>>(() => {
    if (!analysis) return {};
    return analysis.dataset.headers.reduce<Record<string, SupportedField | undefined>>((acc, header) => {
      acc[header] = analysis.schema.find((item) => item.header === header)?.field;
      return acc;
    }, {});
  }, [analysis]);

  const selectedAnalysis = useMemo(() => {
    if (!analysis || !selectedHeaders.length) return null;
    return analyzeSelectedWorkflowColumns({ ...analysis, recommendations }, selectedHeaders);
  }, [analysis, recommendations, selectedHeaders]);

  const proposals = useMemo(() => {
    if (!analysis || !policy || !selectedAnalysis) return [];
    const generated = generateDiffProposals(analysis.dataset, schemaByHeader, policy, {
      selectedHeaders,
      consensusProfiles: selectedAnalysis.columnConsensus,
      linkageReport: linkageReport || undefined,
    });
    const fallback = buildFallbackReviewProposals(analysis, selectedAnalysis, generated);
    const consensusFallback = buildConsensusFallbackProposals(analysis, selectedAnalysis, schemaByHeader);
    const genericFallback = buildGenericConsensusReviewProposals(analysis, selectedAnalysis, [...generated, ...fallback, ...consensusFallback], schemaByHeader);
    return dedupeProposals([...generated, ...fallback, ...consensusFallback, ...genericFallback]).map((proposal) => {
      const manualValue = manualEdits[proposal.id];
      const nextSuggested = manualValue && manualValue.trim() ? manualValue : proposal.suggestedValue;
      return { ...proposal, suggestedValue: nextSuggested, apply: overrides[proposal.id] ?? proposal.apply };
    });
  }, [analysis, policy, selectedAnalysis, schemaByHeader, selectedHeaders, linkageReport, manualEdits, overrides]);

  const resolverItems = useMemo(() => proposals, [proposals]);

  const safeItems = useMemo(() => resolverItems.filter((proposal) => proposal.status === 'safe' && proposal.originalValue !== proposal.suggestedValue), [resolverItems]);
  const reviewItems = useMemo(() => resolverItems.filter((proposal) => proposal.status === 'review'), [resolverItems]);
  const manualItems = useMemo(() => resolverItems.filter((proposal) => proposal.status === 'invalid'), [resolverItems]);
  const activeItems = useMemo(() => (resolveTab === 'safe' ? safeItems : resolveTab === 'review' ? reviewItems : manualItems), [manualItems, resolveTab, reviewItems, safeItems]);
  const currentRows = appliedRows ?? analysis?.dataset.rows ?? [];
  const actionableCount = useMemo(() => resolverItems.filter((proposal) => proposal.originalValue !== proposal.suggestedValue).length, [resolverItems]);

  async function handleAnalyze() {
    if (!metadataFile) return;
    setLoading(true);
    setError('');
    setAppliedRows(null);
    setAppliedLog([]);
    setOverrides({});
    setManualEdits({});
    try {
      const metadataDataset = await parseInputFile(metadataFile);
      const fastaDataset = fastaFile ? await parseInputFile(fastaFile) : null;
      const next = analyzeWorkflow(metadataDataset, fastaDataset);
      setWorkflow({
        analysis: next.analysis,
        policy: next.defaultPolicy,
        linkageReport: next.linkageReport,
      });
      const defaults = next.analysis.profiles.filter((profile) => issueTotal(profile) > 0).map((profile) => profile.header);
      setSelectedHeaders(defaults.length ? defaults : next.analysis.dataset.headers.slice(0, Math.min(4, next.analysis.dataset.headers.length)));
      setResolveTab('safe');
      setStep('columns');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze file.');
    } finally {
      setLoading(false);
    }
  }

  function resetWorkflow() {
    setWorkflow(null);
    setSelectedHeaders([]);
    setResolveTab('safe');
    setOverrides({});
    setManualEdits({});
    setAppliedRows(null);
    setAppliedLog([]);
    setStep('upload');
  }

  function toggleHeader(header: string) {
    setSelectedHeaders((current) => (current.includes(header) ? current.filter((item) => item !== header) : [...current, header]));
  }

  function updateFieldPolicy(header: string, patch: Partial<FieldPolicy>) {
    setWorkflow((current) => {
      if (!current) return current;
      const existing = current.policy.fieldPolicies[header];
      if (!existing) return current;
      return { ...current, policy: { ...current.policy, fieldPolicies: { ...current.policy.fieldPolicies, [header]: { ...existing, ...patch } } } };
    });
  }

  function setStrategy(header: string, strategy: FieldPolicy['strategy']) {
    const patch: Partial<FieldPolicy> = { strategy, enabled: strategy !== 'skip' };
    if (strategy === 'canonicalize-safe') {
      patch.applyControlledVocabulary = 'safe-only';
      patch.normalizeDates = 'normalize-unambiguous';
    } else if (strategy === 'canonicalize-with-review' || strategy === 'review-only') {
      patch.applyControlledVocabulary = 'with-review';
      patch.normalizeDates = 'review-ambiguous';
    } else if (strategy === 'skip' || strategy === 'preserve') {
      patch.applyControlledVocabulary = 'off';
      patch.normalizeDates = 'preserve';
    }
    updateFieldPolicy(header, patch);
  }

  function toggleProposal(id: string, checked: boolean) { setOverrides((current) => ({ ...current, [id]: checked })); }
  function setManualEdit(id: string, value: string) { setManualEdits((current) => ({ ...current, [id]: value })); }
  function goToResolve() { setResolveTab(safeItems.length ? 'safe' : reviewItems.length ? 'review' : 'manual'); setStep('resolve'); }

  function applyChanges(mode: 'safe' | 'selected') {
    if (!analysis) return;
    const chosen = resolverItems.map((proposal) => ({ ...proposal, apply: mode === 'safe' ? proposal.status === 'safe' && proposal.originalValue !== proposal.suggestedValue : proposal.apply }));
    if (!window.confirm(text.confirmApply)) return;
    const result = applySelectedProposals(analysis.dataset, chosen);
    setAppliedRows(result.rows);
    setAppliedLog(buildChangeLog(chosen));
    setStep('export');
  }

  function continueWithoutChanges() {
    setAppliedRows(null);
    setAppliedLog([]);
    setStep('export');
  }

  const steps: Array<{ key: StepKey; label: string }> = [
    { key: 'upload', label: text.upload },
    { key: 'columns', label: text.columns },
    { key: 'resolve', label: text.resolve },
    { key: 'export', label: text.export },
  ];

  function canEnterStep(target: StepKey) {
    if (target === 'upload') return true;
    if (target === 'columns') return !!analysis;
    if (target === 'resolve') return !!analysis && selectedHeaders.length > 0;
    if (target === 'export') return !!analysis;
    return false;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Genome Metadata Cleaner</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{text.title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{text.subtitle}</p>
      </div>

      <div className="sticky top-16 z-[5] mt-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {steps.map((item) => <button key={item.key} type="button" onClick={() => canEnterStep(item.key) && setStep(item.key)} disabled={!canEnterStep(item.key)} className={`rounded-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${step === item.key ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`}>{item.label}</button>)}
          </div>
          <button type="button" className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void handleAnalyze()} disabled={!metadataFile || loading}>
            {loading ? text.analyzing : workflow ? text.analyzeAgain : text.startAnalysis}
          </button>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.totalSuggestions}</p><p className="mt-1 text-xl font-semibold">{resolverItems.length}</p></div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-emerald-700">{text.safe}</p><p className="mt-1 text-xl font-semibold text-emerald-900">{safeItems.length}</p></div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-amber-700">{text.review}</p><p className="mt-1 text-xl font-semibold text-amber-900">{reviewItems.length}</p></div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-rose-700">{text.invalid}</p><p className="mt-1 text-xl font-semibold text-rose-900">{manualItems.length}</p></div>
        </div>
      </div>

      {step === 'upload' ? <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title={text.upload}>
          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block font-medium">{text.metadataFile}</label>
              <input type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="w-full rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => { setMetadataFile(event.target.files?.[0] ?? null); resetWorkflow(); }} />
              <p className="mt-2 text-xs text-slate-600">{text.selectedFile}: {metadataFile?.name ?? text.noFile}</p>
            </div>
            <div>
              <label className="mb-1 block font-medium">{text.fastaFile} <span className="text-slate-500">({text.optional})</span></label>
              <input type="file" accept=".fasta,.fa,.fna,.faa" className="w-full rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => { setFastaFile(event.target.files?.[0] ?? null); resetWorkflow(); }} />
              <p className="mt-2 text-xs text-slate-600">{text.selectedFile}: {fastaFile?.name ?? text.noFile}</p>
            </div>
            {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">{error}</p> : null}
          </div>
        </SectionCard>
        <SectionCard title={text.issueSummary}>
          {analysis ? <div className="space-y-2 text-sm">{analysis.profiles.slice(0, 8).map((profile) => <div key={profile.header} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><p className="font-medium">{profile.header}</p><p className="text-xs text-slate-600">{schemaByHeader[profile.header] ?? '-'}</p></div><p className="mt-1 text-xs text-slate-600">{summarizeField(profile)}</p></div>)}</div> : <p className="text-sm text-slate-600">{text.noFile}</p>}
        </SectionCard>
      </div> : null}

      {step === 'columns' ? <div className="mt-6"><SectionCard title={text.columns}>
        {analysis ? <div className="space-y-4"><p className="text-sm text-slate-600">{text.chooseColumns}</p><div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">{text.apply}</th><th className="px-3 py-2 text-left">{text.field}</th><th className="px-3 py-2 text-left">{text.inferredMeaning}</th><th className="px-3 py-2 text-left">{text.confidence}</th><th className="px-3 py-2 text-left">{text.issues}</th><th className="px-3 py-2 text-left">{text.outliers}</th><th className="px-3 py-2 text-left">{text.strategy}</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{analysis.dataset.headers.map((header) => { const profile = analysis.profiles.find((item) => item.header === header); const schema = analysis.schema.find((item) => item.header === header); const consensus = analysis.columnConsensus.find((item) => item.header === header); const recommendation = recommendations.find((item) => item.header === header); const fieldPolicy = policy?.fieldPolicies[header]; return <tr key={header}><td className="px-3 py-2 align-top"><input type="checkbox" checked={selectedHeaders.includes(header)} onChange={() => toggleHeader(header)} /></td><td className="px-3 py-2 align-top font-medium">{header}</td><td className="px-3 py-2 align-top">{schema?.field ?? '-'}</td><td className="px-3 py-2 align-top">{schema ? schema.confidence.toFixed(2) : '-'}</td><td className="px-3 py-2 align-top">{profile ? issueTotal(profile) : 0}</td><td className="px-3 py-2 align-top">{consensus?.outlierCount ?? 0}</td><td className="px-3 py-2 align-top">{fieldPolicy && recommendation ? <select value={fieldPolicy.strategy} onChange={(event) => setStrategy(header, event.target.value as FieldPolicy['strategy'])} className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-2">{recommendation.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select> : '-'}</td></tr>; })}</tbody></table></div><button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={goToResolve} disabled={!selectedHeaders.length}>{text.continueToResolve}</button></div> : <p className="text-sm text-slate-600">{text.noSuggestions}</p>}
      </SectionCard></div> : null}

      {step === 'resolve' ? <div className="mt-6 space-y-4"><SectionCard title={text.resolve}>
        <div className="space-y-4">
          <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-sm" onClick={() => setStep('columns')}>{text.backToColumns}</button>
          <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
            <div className="space-y-3">{([
              ['safe', text.safe, safeItems.length, 'border-emerald-200 bg-emerald-50 text-emerald-900'],
              ['review', text.review, reviewItems.length, 'border-amber-200 bg-amber-50 text-amber-900'],
              ['manual', text.invalid, manualItems.length, 'border-rose-200 bg-rose-50 text-rose-900'],
            ] as Array<[ResolveTab, string, number, string]>).map(([tabKey, label, count, tone]) => <button key={tabKey} type="button" onClick={() => setResolveTab(tabKey)} className={`w-full rounded-2xl border p-4 text-left ${resolveTab === tabKey ? tone : 'border-slate-200 bg-white'}`}><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{count}</p></button>)}</div>
            {activeItems.length ? <div className="space-y-2">{resolveTab === 'review' ? <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{text.reviewGuide}</div>
              <div className="space-y-3">{activeItems.slice(0, 400).map((proposal) => {
                const manualValue = manualEdits[proposal.id] ?? '';
                const effectiveValue = manualValue.trim() ? manualValue : proposal.suggestedValue;
                const canApply = effectiveValue !== proposal.originalValue;
                return <article key={proposal.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{proposal.header} · Row {displayRowNumber(proposal.rowIndex)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${reviewTone(proposal.status)}`}>{proposal.status}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{proposal.issueType}</span>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm">
                      <input type="checkbox" checked={proposal.apply} disabled={!canApply} onChange={(event) => toggleProposal(proposal.id, event.target.checked)} />
                      {text.apply}
                    </label>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.originalValue}</p>
                      <p className="mt-2 break-all text-sm text-slate-900">{proposal.originalValue || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{text.previewAfterDecision}</p>
                      <p className="mt-2 break-all text-sm font-medium text-cyan-950">{suggestionLabel({ ...proposal, suggestedValue: effectiveValue }, isKo)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.whyReview}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-800">{proposal.reason}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.action}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-800">{actionLabel(proposal, isKo)}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.reviewDecision}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {proposal.originalValue !== proposal.suggestedValue ? <button type="button" className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm text-cyan-900" onClick={() => { setManualEdit(proposal.id, proposal.suggestedValue); toggleProposal(proposal.id, true); }}>{text.useSuggested}</button> : null}
                        <button type="button" className="rounded-full border border-slate-300 px-3 py-2 text-sm" onClick={() => { setManualEdit(proposal.id, proposal.originalValue); toggleProposal(proposal.id, false); }}>{text.keepCurrentValue}</button>
                      </div>
                      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.enterReplacement}</label>
                      <input value={manualValue} onChange={(event) => { setManualEdit(proposal.id, event.target.value); if (event.target.value.trim() && event.target.value !== proposal.originalValue) toggleProposal(proposal.id, true); }} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={proposal.originalValue || '-'} />
                    </div>
                  </div>
                </article>;
              })}</div>
            </> : <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">{text.apply}</th><th className="px-3 py-2 text-left">{text.row}</th><th className="px-3 py-2 text-left">{text.field}</th><th className="px-3 py-2 text-left">{text.originalValue}</th><th className="px-3 py-2 text-left">{text.suggestedValue}</th><th className="px-3 py-2 text-left">{text.manualEdit}</th><th className="px-3 py-2 text-left">{text.issue}</th><th className="px-3 py-2 text-left">{text.reason}</th><th className="px-3 py-2 text-left">{text.action}</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{activeItems.slice(0, 400).map((proposal) => { const canApply = proposal.originalValue !== proposal.suggestedValue; return <tr key={proposal.id}><td className="px-3 py-2 align-top"><input type="checkbox" checked={proposal.apply} disabled={!canApply} onChange={(event) => toggleProposal(proposal.id, event.target.checked)} /></td><td className="px-3 py-2 align-top">{displayRowNumber(proposal.rowIndex)}</td><td className="px-3 py-2 align-top">{proposal.header}</td><td className="px-3 py-2 align-top">{proposal.originalValue || '-'}</td><td className="px-3 py-2 align-top">{suggestionLabel(proposal, isKo)}</td><td className="px-3 py-2 align-top"><div className="space-y-2"><input value={manualEdits[proposal.id] ?? ''} onChange={(event) => { setManualEdit(proposal.id, event.target.value); if (event.target.value.trim() && event.target.value !== proposal.originalValue) toggleProposal(proposal.id, true); }} className="min-w-[180px] rounded-lg border border-slate-300 px-2 py-1" placeholder={proposal.originalValue || '-'} />{proposal.status !== 'safe' ? <div className="flex flex-wrap gap-2">{proposal.originalValue !== proposal.suggestedValue ? <button type="button" className="rounded-full border border-slate-300 px-2 py-1 text-xs" onClick={() => { setManualEdit(proposal.id, proposal.suggestedValue); toggleProposal(proposal.id, true); }}>{text.useSuggested}</button> : null}<button type="button" className="rounded-full border border-slate-300 px-2 py-1 text-xs" onClick={() => { setManualEdit(proposal.id, proposal.originalValue); toggleProposal(proposal.id, false); }}>{text.keepOriginal}</button></div> : null}</div></td><td className="px-3 py-2 align-top"><div>{proposal.issueType}</div><div className="mt-1 text-xs text-slate-500">{proposal.status}</div></td><td className="px-3 py-2 align-top">{proposal.reason}</td><td className="px-3 py-2 align-top">{actionLabel(proposal, isKo)}</td></tr>; })}</tbody></table></div>}{activeItems.length > 400 ? <p className="text-xs text-slate-500">Showing the first 400 items. Narrow the selected columns to review the rest in smaller batches.</p> : null}</div> : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">{text.noSuggestions}</div>}
          </div>
          {resolverItems.length && actionableCount === 0 ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{text.reviewOnlyNotice}</p> : null}
          <div className="flex flex-wrap gap-2"><button type="button" className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => applyChanges('safe')} disabled={!safeItems.length}>{text.applySafe}</button><button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => applyChanges('selected')} disabled={actionableCount === 0}>{text.applySelected}</button><button type="button" className={`rounded-lg px-3 py-2 text-sm font-medium ${actionableCount === 0 ? 'bg-slate-900 text-white' : 'border border-slate-300'}`} onClick={continueWithoutChanges}>{actionableCount === 0 ? text.finishReview : text.exportWithoutChanges}</button></div>
        </div>
      </SectionCard>
      {linkageReport ? <SectionCard title={text.linkageReport}><div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">{text.row}</th><th className="px-3 py-2 text-left">{text.name}</th><th className="px-3 py-2 text-left">{text.fastaName}</th><th className="px-3 py-2 text-left">{text.matchStatus}</th><th className="px-3 py-2 text-left">{text.matchConfidence}</th><th className="px-3 py-2 text-left">{text.matchedBy}</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{linkageReport.rows.slice(0, 120).map((row) => <tr key={row.rowIndex}><td className="px-3 py-2">{displayRowNumber(row.rowIndex)}</td><td className="px-3 py-2">{row.name}</td><td className="px-3 py-2">{row.fasta_name}</td><td className="px-3 py-2">{row.name_match_status}</td><td className="px-3 py-2">{row.name_match_confidence.toFixed(2)}</td><td className="px-3 py-2">{row.matchedBy || '-'}</td></tr>)}</tbody></table></div></SectionCard> : null}</div> : null}

      {step === 'export' ? <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]"><SectionCard title={text.export}><div className="grid gap-2 sm:grid-cols-2">{analysis ? <><button type="button" className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white" onClick={() => downloadText(`${appliedRows ? 'cleaned' : 'current'}-${analysis.dataset.fileName}`, exportCleanedContent(analysis.dataset, currentRows))}>{appliedRows ? text.exportCleaned : text.exportCurrent}</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('change-log.csv', changeLogToCsv(appliedLog), 'text/csv;charset=utf-8')}>{text.changeLog} CSV</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('change-log.json', changeLogToJson(appliedLog), 'application/json;charset=utf-8')}>{text.changeLog} JSON</button>{linkageReport ? <><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('linkage-report.csv', linkageRowsToCsv(linkageReport.rows || []), 'text/csv;charset=utf-8')}>{text.linkageReport} CSV</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('linkage-report.json', linkageReportToJson(linkageReport), 'application/json;charset=utf-8')}>{text.linkageReport} JSON</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('linkage-view.csv', linkageAwareViewCsv(analysis.dataset, currentRows, linkageReport), 'text/csv;charset=utf-8')}>{text.linkageView}</button></> : null}</> : null}</div></SectionCard><SectionCard title={text.currentData}>{analysis ? <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr>{analysis.dataset.headers.slice(0, 6).map((header) => <th key={header} className="px-3 py-2 text-left">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-200 bg-white">{currentRows.slice(0, 10).map((row) => <tr key={row.__rowIndex}>{analysis.dataset.headers.slice(0, 6).map((header) => <td key={header} className="px-3 py-2">{String(row[header] ?? '')}</td>)}</tr>)}</tbody></table></div> : <p className="text-sm text-slate-600">{text.noFile}</p>}</SectionCard></div> : null}
    </section>
  );
}
