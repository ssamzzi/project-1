"use client";

import { useMemo, useState } from 'react';
import { SectionCard } from '../SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';
import {
  analyzeSelectedWorkflowColumns,
  analyzeWorkflow,
  applySelectedProposals,
  buildChangeLog,
  changeLogToCsv,
  changeLogToJson,
  exportCleanedContent,
  filterDiffProposals,
  generateDiffProposals,
  linkageReportToJson,
  linkageRowsToCsv,
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

type StepKey = 'upload' | 'columns' | 'review' | 'export';
type FilterMode = 'all' | 'safe' | 'review' | 'invalid';

interface WorkflowState {
  analysis: AnalysisResult;
  policy: ReturnType<typeof analyzeWorkflow>['defaultPolicy'];
  linkageReport: ReturnType<typeof analyzeWorkflow>['linkageReport'];
}

function getText(isKo: boolean) {
  return isKo
    ? {
        title: 'Genome Metadata Cleaner',
        subtitle: '업로드 -> 컬럼 선택 -> 추천 검토 -> 적용/내보내기 흐름으로 정리했습니다.',
        upload: '1. 업로드',
        columns: '2. 컬럼 선택',
        review: '3. 추천 검토',
        export: '4. 내보내기',
        metadataFile: '메타데이터 파일',
        fastaFile: 'FASTA 파일',
        optional: '선택',
        selectedFile: '선택 파일',
        noFile: '선택된 파일 없음',
        startAnalysis: '분석 시작',
        analyzeAgain: '다시 분석',
        analyzing: '분석 중...',
        issueSummary: '이슈 요약',
        chooseColumns: '정제할 컬럼을 선택하고 바로 추천 변경사항으로 넘어가세요.',
        inferredMeaning: '추정 필드',
        confidence: '신뢰도',
        issues: '이슈 수',
        outliers: '이상치',
        strategy: '전략',
        generateSuggestions: '추천 변경사항 보기',
        noColumnsSelected: '선택된 컬럼이 없습니다.',
        visible: '표시 제안',
        safe: 'safe',
        reviewOnly: 'review',
        invalid: 'invalid',
        apply: '적용',
        row: '행',
        field: '컬럼',
        originalValue: '원본값',
        suggestedValue: '제안값',
        issue: '이슈',
        reason: '이유',
        noProposals: '선택한 컬럼에 대한 제안이 없습니다. 다른 컬럼을 선택하거나 그대로 내보낼 수 있습니다.',
        applySafe: '안전한 항목만 적용',
        applySelected: '선택 항목 적용',
        continueWithoutChanges: '변경 없이 내보내기',
        reviewOnlyNotice: '현재 보이는 항목은 검토용입니다. 자동으로 바뀌는 값은 없지만, 그대로 내보내거나 다른 컬럼을 선택할 수 있습니다.',
        clearVisible: '보이는 항목 해제',
        backToColumns: '컬럼 선택으로 돌아가기',
        confirmApply: '선택한 변경사항을 적용할까요? 원본 데이터는 그대로 유지됩니다.',
        currentData: '현재 데이터',
        exportCurrent: '현재 메타데이터 다운로드',
        exportCleaned: '정제된 메타데이터 다운로드',
        changeLog: '변경 로그',
        linkageReport: 'FASTA 연결 리포트',
        linkageView: '연결 보기 CSV',
        noFasta: 'FASTA 파일이 없어 연결 보기 표는 비어 있습니다.',
        name: 'name',
        fastaName: 'fasta_name',
        matchStatus: 'match_status',
        matchConfidence: 'confidence',
        matchedBy: 'matchedBy',
      }
    : {
        title: 'Genome Metadata Cleaner',
        subtitle: 'Simplified into upload -> choose columns -> review suggestions -> export.',
        upload: '1. Upload',
        columns: '2. Choose columns',
        review: '3. Review suggestions',
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
        chooseColumns: 'Choose the columns to clean and go straight to the suggestion review.',
        inferredMeaning: 'Inferred field',
        confidence: 'Confidence',
        issues: 'Issues',
        outliers: 'Outliers',
        strategy: 'Strategy',
        generateSuggestions: 'Review suggestions',
        noColumnsSelected: 'No columns selected.',
        visible: 'Visible suggestions',
        safe: 'safe',
        reviewOnly: 'review',
        invalid: 'invalid',
        apply: 'Apply',
        row: 'Row',
        field: 'Column',
        originalValue: 'Original value',
        suggestedValue: 'Suggested value',
        issue: 'Issue',
        reason: 'Reason',
        noProposals: 'No suggestions were generated for the selected columns. You can choose different columns or export the current dataset.',
        applySafe: 'Apply all safe',
        applySelected: 'Apply selected',
        continueWithoutChanges: 'Export without changes',
        reviewOnlyNotice: 'The current items are review-only. There are no direct value changes to apply, but you can export the current dataset or choose different columns.',
        clearVisible: 'Uncheck visible',
        backToColumns: 'Back to columns',
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
      };
}

function downloadText(filename: string, data: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function issueTotal(profile: FieldProfile) {
  return profile.issueCounts.reduce((sum, issue) => sum + issue.count, 0);
}

function summarizeField(profile: FieldProfile) {
  if (!profile.issueCounts.length) return 'No issues';
  return profile.issueCounts
    .slice(0, 3)
    .map((issue) => `${issue.type} (${issue.count})`)
    .join(', ');
}

function linkageAwareViewCsv(dataset: ParsedDataset, rows: ParsedRow[], linkageReport: WorkflowState['linkageReport']) {
  const linkageByRow = new Map((linkageReport?.rows || []).map((row) => [row.rowIndex, row]));
  const headers = [...dataset.headers, 'name', 'fasta_name', 'name_match_status', 'name_match_confidence'];
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          if (header in row) return `"${String(row[header] ?? '').replace(/"/g, '""')}"`;
          const linkage = linkageByRow.get(row.__rowIndex);
          if (header === 'name') return `"${String(linkage?.name ?? '').replace(/"/g, '""')}"`;
          if (header === 'fasta_name') return `"${String(linkage?.fasta_name ?? '').replace(/"/g, '""')}"`;
          if (header === 'name_match_status') return `"${String(linkage?.name_match_status ?? '').replace(/"/g, '""')}"`;
          return `"${String(linkage?.name_match_confidence ?? '').replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ];
  return lines.join('\n');
}

function fallbackStatus(issueType: DiffProposal['issueType']): DiffProposal['status'] {
  if (['invalid-value', 'impossible-date', 'missing-value'].includes(issueType)) return 'invalid';
  if (['ambiguous-date', 'duplicate', 'likely-duplicate', 'controlled-vocab'].includes(issueType)) return 'review';
  return 'safe';
}

function buildFallbackReviewProposals(analysis: AnalysisResult, selectedAnalysis: SelectedColumnAnalysis, existing: DiffProposal[]) {
  const existingKeys = new Set(existing.map((proposal) => `${proposal.header}:${proposal.issueType}`));
  const fallback: DiffProposal[] = [];

  selectedAnalysis.profiles.forEach((profile) => {
    profile.issueCounts.forEach((issue, index) => {
      const key = `${profile.header}:${issue.type}`;
      if (existingKeys.has(key)) return;
      const example = issue.examples[0] ?? '';
      const row =
        analysis.dataset.rows.find((item) => {
          const value = String(item[profile.header] ?? '');
          return issue.type === 'missing-value' ? !value.trim() : value === example || value.trim() === example.trim();
        }) ?? analysis.dataset.rows[0];
      if (!row) return;
      fallback.push({
        id: `fallback-${profile.header}-${issue.type}-${index}`,
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

function suggestedDisplay(proposal: DiffProposal, isKo: boolean) {
  if (proposal.originalValue !== proposal.suggestedValue) return proposal.suggestedValue || '-';
  if (proposal.issueType === 'missing-value') return isKo ? '수동으로 값 입력 필요' : 'Manual value needed';
  if (proposal.issueType === 'duplicate' || proposal.issueType === 'likely-duplicate') return isKo ? '중복 여부 검토 필요' : 'Review duplicate group';
  if (proposal.issueType === 'ambiguous-date') return isKo ? '날짜 형식 수동 결정' : 'Resolve date format manually';
  if (proposal.issueType === 'impossible-date' || proposal.issueType === 'invalid-value') return isKo ? '유효한 값으로 수정 필요' : 'Replace with a valid value';
  if (proposal.issueType === 'controlled-vocab') return isKo ? '표준 용어 선택 필요' : 'Choose a canonical term';
  return isKo ? '검토 필요' : 'Review required';
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
  const [filter, setFilter] = useState<FilterMode>('all');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [appliedRows, setAppliedRows] = useState<ParsedRow[] | null>(null);
  const [appliedLog, setAppliedLog] = useState<ReturnType<typeof buildChangeLog>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analysis = workflow?.analysis ?? null;
  const policy = workflow?.policy ?? null;
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
    return analyzeSelectedWorkflowColumns(analysis, selectedHeaders);
  }, [analysis, selectedHeaders]);

  const generatedProposals = useMemo(() => {
    if (!analysis || !policy || !selectedAnalysis) return [];
    const generated = generateDiffProposals(analysis.dataset, schemaByHeader, policy, {
      selectedHeaders,
      consensusProfiles: selectedAnalysis.columnConsensus,
      linkageReport: linkageReport || undefined,
    });
    const fallback = buildFallbackReviewProposals(analysis, selectedAnalysis, generated);
    return dedupeProposals([...generated, ...fallback]).map((proposal) => ({
      ...proposal,
      apply: overrides[proposal.id] ?? proposal.apply,
    }));
  }, [analysis, policy, selectedAnalysis, schemaByHeader, selectedHeaders, linkageReport, overrides]);

  const displayProposals = useMemo(() => {
    if (generatedProposals.length) return generatedProposals;
    if (!analysis || !selectedAnalysis) return [];
    return buildFallbackReviewProposals(analysis, selectedAnalysis, []).map((proposal) => ({
      ...proposal,
      apply: overrides[proposal.id] ?? proposal.apply,
    }));
  }, [analysis, selectedAnalysis, generatedProposals, overrides]);

  const visible = useMemo(() => filterDiffProposals(displayProposals, filter), [displayProposals, filter]);
  const currentRows = appliedRows ?? analysis?.dataset.rows ?? [];

  const counts = useMemo(
    () => ({
      safe: displayProposals.filter((proposal) => proposal.status === 'safe').length,
      review: displayProposals.filter((proposal) => proposal.status === 'review').length,
      invalid: displayProposals.filter((proposal) => proposal.status === 'invalid').length,
    }),
    [displayProposals],
  );
  const actionableCount = useMemo(
    () => displayProposals.filter((proposal) => proposal.originalValue !== proposal.suggestedValue).length,
    [displayProposals],
  );

  async function handleAnalyze() {
    if (!metadataFile) return;
    setLoading(true);
    setError('');
    setAppliedRows(null);
    setAppliedLog([]);
    setOverrides({});
    try {
      const metadataDataset = await parseInputFile(metadataFile);
      const fastaDataset = fastaFile ? await parseInputFile(fastaFile) : null;
      const next = analyzeWorkflow(metadataDataset, fastaDataset);
      setWorkflow(next);
      const defaults = next.analysis.profiles.filter((profile) => issueTotal(profile) > 0).map((profile) => profile.header);
      setSelectedHeaders(defaults.length ? defaults : next.analysis.dataset.headers.slice(0, Math.min(4, next.analysis.dataset.headers.length)));
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
    setAppliedRows(null);
    setAppliedLog([]);
    setOverrides({});
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
      return {
        ...current,
        policy: {
          ...current.policy,
          fieldPolicies: {
            ...current.policy.fieldPolicies,
            [header]: { ...existing, ...patch },
          },
        },
      };
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

  function toggleProposal(id: string, checked: boolean) {
    setOverrides((current) => ({ ...current, [id]: checked }));
  }

  function clearVisibleSelection() {
    setOverrides((current) => {
      const next = { ...current };
      visible.forEach((proposal) => {
        next[proposal.id] = false;
      });
      return next;
    });
  }

  function applyChanges(mode: 'safe' | 'selected') {
    if (!analysis) return;
    const chosen = displayProposals.map((proposal) => ({
      ...proposal,
      apply: mode === 'safe' ? proposal.status === 'safe' : proposal.apply,
    }));
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
    { key: 'review', label: text.review },
    { key: 'export', label: text.export },
  ];

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
            {steps.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStep(item.key)}
                className={`rounded-full px-3 py-2 text-sm ${step === item.key ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleAnalyze()}
            disabled={!metadataFile || loading}
          >
            {loading ? text.analyzing : workflow ? text.analyzeAgain : text.startAnalysis}
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.visible}</p>
            <p className="mt-1 text-xl font-semibold">{visible.length}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">{text.safe}</p>
            <p className="mt-1 text-xl font-semibold text-emerald-900">{counts.safe}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-700">{text.reviewOnly}</p>
            <p className="mt-1 text-xl font-semibold text-amber-900">{counts.review}</p>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-700">{text.invalid}</p>
            <p className="mt-1 text-xl font-semibold text-rose-900">{counts.invalid}</p>
          </div>
        </div>
      </div>

      {step === 'upload' ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SectionCard title={text.upload}>
            <div className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium">{text.metadataFile}</label>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  onChange={(event) => {
                    setMetadataFile(event.target.files?.[0] ?? null);
                    resetWorkflow();
                  }}
                />
                <p className="mt-2 text-xs text-slate-600">{text.selectedFile}: {metadataFile?.name ?? text.noFile}</p>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  {text.fastaFile} <span className="text-slate-500">({text.optional})</span>
                </label>
                <input
                  type="file"
                  accept=".fasta,.fa,.fna,.faa"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  onChange={(event) => {
                    setFastaFile(event.target.files?.[0] ?? null);
                    resetWorkflow();
                  }}
                />
                <p className="mt-2 text-xs text-slate-600">{text.selectedFile}: {fastaFile?.name ?? text.noFile}</p>
              </div>

              {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">{error}</p> : null}
            </div>
          </SectionCard>

          <SectionCard title={text.issueSummary}>
            {analysis ? (
              <div className="space-y-2 text-sm">
                {analysis.profiles.slice(0, 8).map((profile) => (
                  <div key={profile.header} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{profile.header}</p>
                      <p className="text-xs text-slate-600">{schemaByHeader[profile.header] ?? '-'}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{summarizeField(profile)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.noFile}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'columns' ? (
        <div className="mt-6">
          <SectionCard title={text.columns}>
            {analysis ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{text.chooseColumns}</p>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">{text.apply}</th>
                        <th className="px-3 py-2 text-left">{text.field}</th>
                        <th className="px-3 py-2 text-left">{text.inferredMeaning}</th>
                        <th className="px-3 py-2 text-left">{text.confidence}</th>
                        <th className="px-3 py-2 text-left">{text.issues}</th>
                        <th className="px-3 py-2 text-left">{text.outliers}</th>
                        <th className="px-3 py-2 text-left">{text.strategy}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {analysis.dataset.headers.map((header) => {
                        const profile = analysis.profiles.find((item) => item.header === header);
                        const schema = analysis.schema.find((item) => item.header === header);
                        const consensus = analysis.columnConsensus.find((item) => item.header === header);
                        const recommendation = analysis.recommendations.find((item) => item.header === header);
                        const fieldPolicy = policy?.fieldPolicies[header];
                        return (
                          <tr key={header}>
                            <td className="px-3 py-2 align-top">
                              <input type="checkbox" checked={selectedHeaders.includes(header)} onChange={() => toggleHeader(header)} />
                            </td>
                            <td className="px-3 py-2 align-top font-medium">{header}</td>
                            <td className="px-3 py-2 align-top">{schema?.field ?? '-'}</td>
                            <td className="px-3 py-2 align-top">{schema ? schema.confidence.toFixed(2) : '-'}</td>
                            <td className="px-3 py-2 align-top">{profile ? issueTotal(profile) : 0}</td>
                            <td className="px-3 py-2 align-top">{consensus?.outlierCount ?? 0}</td>
                            <td className="px-3 py-2 align-top">
                              {fieldPolicy && recommendation ? (
                                <select
                                  value={fieldPolicy.strategy}
                                  onChange={(event) => setStrategy(header, event.target.value as FieldPolicy['strategy'])}
                                  className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-2"
                                >
                                  {recommendation.options.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setStep('review')}
                  disabled={!selectedHeaders.length}
                >
                  {text.generateSuggestions}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.noColumnsSelected}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'review' ? (
        <div className="mt-6 space-y-4">
          <SectionCard title={text.review}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'safe', 'review', 'invalid'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`rounded-full px-3 py-1 text-sm ${filter === mode ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`}
                    onClick={() => setFilter(mode)}
                  >
                    {mode}
                  </button>
                ))}
                <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-sm" onClick={clearVisibleSelection}>
                  {text.clearVisible}
                </button>
                <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-sm" onClick={() => setStep('columns')}>
                  {text.backToColumns}
                </button>
              </div>

              {visible.length ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">{text.apply}</th>
                        <th className="px-3 py-2 text-left">{text.row}</th>
                        <th className="px-3 py-2 text-left">{text.field}</th>
                        <th className="px-3 py-2 text-left">{text.originalValue}</th>
                        <th className="px-3 py-2 text-left">{text.suggestedValue}</th>
                        <th className="px-3 py-2 text-left">{text.issue}</th>
                        <th className="px-3 py-2 text-left">{text.reason}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {visible.slice(0, 400).map((proposal) => (
                        <tr key={proposal.id}>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="checkbox"
                              checked={proposal.apply}
                              disabled={proposal.originalValue === proposal.suggestedValue}
                              onChange={(event) => toggleProposal(proposal.id, event.target.checked)}
                            />
                          </td>
                          <td className="px-3 py-2 align-top">{proposal.rowIndex}</td>
                          <td className="px-3 py-2 align-top">{proposal.header}</td>
                          <td className="px-3 py-2 align-top">{proposal.originalValue || '-'}</td>
                          <td className="px-3 py-2 align-top">{suggestedDisplay(proposal, isKo)}</td>
                          <td className="px-3 py-2 align-top">
                            <div>{proposal.issueType}</div>
                            <div className="mt-1 text-xs text-slate-500">{proposal.status}</div>
                          </td>
                          <td className="px-3 py-2 align-top">{proposal.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-600">{text.noProposals}</p>
              )}

              {visible.length && actionableCount === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{text.reviewOnlyNotice}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => applyChanges('safe')}
                  disabled={actionableCount === 0}
                >
                  {text.applySafe}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => applyChanges('selected')}
                  disabled={actionableCount === 0}
                >
                  {text.applySelected}
                </button>
                <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={continueWithoutChanges}>
                  {text.continueWithoutChanges}
                </button>
              </div>
            </div>
          </SectionCard>
          <SectionCard title={text.linkageReport}>
            {linkageReport ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{text.row}</th>
                      <th className="px-3 py-2 text-left">{text.name}</th>
                      <th className="px-3 py-2 text-left">{text.fastaName}</th>
                      <th className="px-3 py-2 text-left">{text.matchStatus}</th>
                      <th className="px-3 py-2 text-left">{text.matchConfidence}</th>
                      <th className="px-3 py-2 text-left">{text.matchedBy}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {linkageReport.rows.slice(0, 120).map((row) => (
                      <tr key={row.rowIndex}>
                        <td className="px-3 py-2">{row.rowIndex}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2">{row.fasta_name}</td>
                        <td className="px-3 py-2">{row.name_match_status}</td>
                        <td className="px-3 py-2">{row.name_match_confidence.toFixed(2)}</td>
                        <td className="px-3 py-2">{row.matchedBy || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.noFasta}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'export' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title={text.export}>
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis ? (
                <>
                  <button
                    type="button"
                    className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white"
                    onClick={() => downloadText(`${appliedRows ? 'cleaned' : 'current'}-${analysis.dataset.fileName}`, exportCleanedContent(analysis.dataset, currentRows))}
                  >
                    {appliedRows ? text.exportCleaned : text.exportCurrent}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('change-log.csv', changeLogToCsv(appliedLog), 'text/csv;charset=utf-8')}
                  >
                    {text.changeLog} CSV
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('change-log.json', changeLogToJson(appliedLog), 'application/json;charset=utf-8')}
                  >
                    {text.changeLog} JSON
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('linkage-report.csv', linkageRowsToCsv(linkageReport?.rows || []), 'text/csv;charset=utf-8')}
                  >
                    {text.linkageReport} CSV
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('linkage-report.json', linkageReportToJson(linkageReport || { totalMetadataRows: 0, totalFastaRows: 0, matchedRows: 0, unmatchedMetadataRows: 0, exactMatches: 0, normalizedMatches: 0, reviewMatches: 0, unmatchedRows: 0, candidates: [], rows: [] }), 'application/json;charset=utf-8')}
                  >
                    {text.linkageReport} JSON
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('linkage-view.csv', linkageAwareViewCsv(analysis.dataset, currentRows, linkageReport), 'text/csv;charset=utf-8')}
                  >
                    {text.linkageView}
                  </button>
                </>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title={text.currentData}>
            {analysis ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {analysis.dataset.headers.slice(0, 6).map((header) => (
                        <th key={header} className="px-3 py-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {currentRows.slice(0, 10).map((row) => (
                      <tr key={row.__rowIndex}>
                        {analysis.dataset.headers.slice(0, 6).map((header) => (
                          <td key={`${row.__rowIndex}-${header}`} className="px-3 py-2">
                            {String(row[header] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}
