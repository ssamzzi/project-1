"use client";

import { useEffect, useMemo, useState } from 'react';
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
  type FastaMatchReport,
  type FieldPolicy,
  type FieldProfile,
  type NormalizationPolicy,
  type ParsedDataset,
  type ParsedRow,
  type PresetRecord,
  type SupportedField,
} from '../../lib/genome-metadata-cleaner';

const PRESET_STORAGE_KEY = 'biolt-genome-metadata-cleaner-presets';

type StepKey = 'upload' | 'columns' | 'selected' | 'linkage' | 'review' | 'export';
type FilterMode = 'all' | 'safe' | 'review' | 'invalid';

interface WorkflowState {
  analysis: AnalysisResult;
  policy: NormalizationPolicy;
  linkageReport: FastaMatchReport | null;
}

function getText(isKo: boolean) {
  return isKo
    ? {
        title: 'Genome Metadata Cleaner',
        subtitle: '메타데이터를 먼저 분석하고, 컬럼을 선택한 뒤, 검토 가능한 변경안만 적용합니다.',
        upload: '업로드',
        columns: '컬럼 선택',
        selected: '선택 컬럼 분석',
        linkage: 'FASTA 이름 보기',
        review: '변경 검토',
        export: '내보내기',
        metadataFile: '메타데이터 파일',
        fastaFile: 'FASTA 파일',
        startAnalysis: '분석 시작',
        analyzeAgain: '다시 분석',
        selectedFile: '선택된 파일',
        noFile: '선택된 파일 없음',
        optional: '선택 사항',
        analyzing: '분석 중...',
        analysisComplete: '분석 완료',
        rows: '행',
        issues: '이슈',
        selectedCount: '선택 컬럼',
        visible: '표시 제안',
        format: '형식',
        columnsLabel: '열',
        issueSummary: '이슈 요약',
        inferredMeaning: '추정 의미',
        confidence: '신뢰도',
        dominantPattern: '우세 패턴',
        dominantCase: '우세 대소문자',
        dominantSeparator: '우세 구분자',
        outliers: '이상치 수',
        chooseColumns: '정제할 컬럼을 선택하세요.',
        selectedField: '선택한 필드',
        recommendedAction: '권장 전략',
        consensusSummary: '컬럼 합의',
        strategy: '전략',
        dateHandling: '날짜 처리',
        preserve: '보존',
        normalizeUnambiguous: '명확한 날짜만 정규화',
        reviewAmbiguous: '애매한 날짜는 검토',
        controlledVocabulary: '통제 어휘',
        off: '끄기',
        safeOnly: '안전한 것만',
        withReview: '검토 포함',
        customMapping: '사용자 매핑',
        originalValue: '원래 값',
        mappedValue: '변환 값',
        addMapping: '매핑 추가',
        selectedFieldActions: '필드 작업',
        includeField: '이 필드 포함',
        excludeField: '이 필드 제외',
        previousField: '이전 필드',
        nextField: '다음 필드',
        goToReview: '검토 단계로 이동',
        backToColumns: '컬럼 선택으로 돌아가기',
        previewCount: '미리보기 제안 수',
        activeMappings: '활성 매핑',
        noMappings: '아직 사용자 매핑이 없습니다.',
        remove: '삭제',
        noColumnsSelected: '선택된 컬럼이 없습니다.',
        linkageSummary: '메타데이터 이름과 FASTA 헤더 이름을 함께 보여줍니다.',
        noFasta: 'FASTA 파일이 없어서 name linkage view는 비어 있습니다.',
        name: 'name',
        fastaName: 'fasta_name',
        matchStatus: 'name_match_status',
        matchConfidence: 'name_match_confidence',
        matchedBy: 'matchedBy',
        reason: 'reason',
        noProposals: '표시할 변경 제안이 없습니다.',
        apply: '적용',
        row: '행',
        field: '필드',
        suggested: '제안값',
        issue: '이슈',
        applySafe: '안전 변경 적용',
        applySelected: '선택 변경 적용',
        skipVisible: '보이는 항목 건너뛰기',
        rawPreserved: '원본 데이터는 적용 전까지 유지됩니다.',
        appliedChanges: '적용된 변경 수',
        presetName: '프리셋 이름',
        savePreset: '프리셋 저장',
        savedPresets: '저장된 프리셋',
        cleanedFile: '정제된 메타데이터',
        changeLog: '변경 로그',
        linkageReport: '링키지 리포트',
        linkageView: '링키지 뷰',
        applyBeforeExport: '먼저 변경을 적용한 뒤 내보내세요.',
        resultSnapshot: '결과 미리보기',
        selectFieldPrompt: '왼쪽에서 필드를 선택하세요.',
        reviewFirst: '검토 단계에서 변경 제안을 먼저 확인하세요.',
        confirmApply: '선택한 변경을 적용할까요? 원본 데이터는 그대로 유지됩니다.',
      }
    : {
        title: 'Genome Metadata Cleaner',
        subtitle: 'Analyze metadata first, choose target columns, and only apply reviewable suggestions.',
        upload: 'Upload',
        columns: 'Column selection',
        selected: 'Selected-column analysis',
        linkage: 'FASTA-linked names',
        review: 'Review changes',
        export: 'Export',
        metadataFile: 'Metadata file',
        fastaFile: 'FASTA file',
        startAnalysis: 'Start analysis',
        analyzeAgain: 'Analyze again',
        selectedFile: 'Selected file',
        noFile: 'No file selected',
        optional: 'Optional',
        analyzing: 'Analyzing...',
        analysisComplete: 'Analysis completed',
        rows: 'Rows',
        issues: 'Issues',
        selectedCount: 'Selected columns',
        visible: 'Visible suggestions',
        format: 'Format',
        columnsLabel: 'Columns',
        issueSummary: 'Issue summary',
        inferredMeaning: 'Inferred meaning',
        confidence: 'Confidence',
        dominantPattern: 'Dominant pattern',
        dominantCase: 'Dominant case',
        dominantSeparator: 'Dominant separator',
        outliers: 'Outliers',
        chooseColumns: 'Choose which columns to clean.',
        selectedField: 'Selected field',
        selectedFieldActions: 'Field actions',
        recommendedAction: 'Recommended strategy',
        consensusSummary: 'Column consensus',
        strategy: 'Strategy',
        dateHandling: 'Date handling',
        preserve: 'Preserve',
        normalizeUnambiguous: 'Normalize unambiguous dates',
        reviewAmbiguous: 'Review ambiguous dates',
        controlledVocabulary: 'Controlled vocabulary',
        off: 'Off',
        safeOnly: 'Safe only',
        withReview: 'With review',
        customMapping: 'Custom mapping',
        originalValue: 'Original value',
        mappedValue: 'Mapped value',
        addMapping: 'Add mapping',
        includeField: 'Include this field',
        excludeField: 'Exclude this field',
        previousField: 'Previous field',
        nextField: 'Next field',
        goToReview: 'Go to review',
        backToColumns: 'Back to column selection',
        previewCount: 'Preview suggestions',
        activeMappings: 'Active mappings',
        noMappings: 'No custom mappings yet.',
        remove: 'Remove',
        noColumnsSelected: 'No columns selected.',
        linkageSummary: 'Compare metadata names and FASTA header names side by side.',
        noFasta: 'No FASTA file was uploaded, so the name linkage view is empty.',
        name: 'name',
        fastaName: 'fasta_name',
        matchStatus: 'name_match_status',
        matchConfidence: 'name_match_confidence',
        matchedBy: 'matchedBy',
        reason: 'reason',
        noProposals: 'No visible proposals.',
        apply: 'Apply',
        row: 'Row',
        field: 'Field',
        suggested: 'Suggested',
        issue: 'Issue',
        applySafe: 'Apply all safe',
        applySelected: 'Apply selected',
        skipVisible: 'Skip visible',
        rawPreserved: 'Raw data stays preserved until apply.',
        appliedChanges: 'Applied changes',
        presetName: 'Preset name',
        savePreset: 'Save preset',
        savedPresets: 'Saved presets',
        cleanedFile: 'Cleaned metadata',
        changeLog: 'Change log',
        linkageReport: 'Linkage report',
        linkageView: 'Linkage-aware view',
        applyBeforeExport: 'Apply changes before exporting.',
        resultSnapshot: 'Result snapshot',
        selectFieldPrompt: 'Select a field from the left.',
        reviewFirst: 'Review suggestions first.',
        confirmApply: 'Apply selected changes? Raw data stays preserved.',
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

function summarizeField(profile: FieldProfile, isKo: boolean) {
  if (!profile.issueCounts.length) {
    return isKo ? '문제가 발견되지 않았습니다.' : 'No issues detected.';
  }
  const summary = profile.issueCounts
    .slice(0, 3)
    .map((issue) => `${issue.type} (${issue.count})`)
    .join(', ');
  return isKo ? `총 ${issueTotal(profile)}건: ${summary}` : `${issueTotal(profile)} issues: ${summary}`;
}

function linkageAwareViewCsv(dataset: ParsedDataset, rows: ParsedRow[], linkageReport: FastaMatchReport | null) {
  const linkageByRow = new Map((linkageReport?.rows || []).map((row) => [row.rowIndex, row]));
  const headers = [...dataset.headers, 'name', 'fasta_name', 'name_match_status', 'name_match_confidence'];
  const lines = [
    headers.join(','),
    ...rows.map((row) => {
      const linkage = linkageByRow.get(row.__rowIndex);
      const values = headers.map((header) => {
        if (header in row) return `"${String(row[header] ?? '').replace(/"/g, '""')}"`;
        if (header === 'name') return `"${String(linkage?.name ?? '').replace(/"/g, '""')}"`;
        if (header === 'fasta_name') return `"${String(linkage?.fasta_name ?? '').replace(/"/g, '""')}"`;
        if (header === 'name_match_status') return `"${String(linkage?.name_match_status ?? '').replace(/"/g, '""')}"`;
        return `"${String(linkage?.name_match_confidence ?? '').replace(/"/g, '""')}"`;
      });
      return values.join(',');
    }),
  ];
  return lines.join('\n');
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
  const [selectedHeader, setSelectedHeader] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [appliedRows, setAppliedRows] = useState<ParsedRow[] | null>(null);
  const [appliedLog, setAppliedLog] = useState<ReturnType<typeof buildChangeLog>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [presets, setPresets] = useState<PresetRecord[]>([]);
  const [presetName, setPresetName] = useState('');
  const [mappingSource, setMappingSource] = useState('');
  const [mappingTarget, setMappingTarget] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch {
      setPresets([]);
    }
  }, []);

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

  const proposals = useMemo(() => {
    if (!analysis || !policy || !selectedAnalysis) return [];
    return generateDiffProposals(analysis.dataset, schemaByHeader, policy, {
      selectedHeaders,
      consensusProfiles: selectedAnalysis.columnConsensus,
      linkageReport: linkageReport || undefined,
    }).map((proposal) => ({
      ...proposal,
      apply: overrides[proposal.id] ?? proposal.apply,
    }));
  }, [analysis, policy, selectedAnalysis, schemaByHeader, selectedHeaders, linkageReport, overrides]);

  const visible = useMemo(() => filterDiffProposals(proposals, filter), [proposals, filter]);
  const currentRows = appliedRows ?? analysis?.dataset.rows ?? [];
  const currentProfile = selectedAnalysis?.profiles.find((item) => item.header === selectedHeader) ?? null;
  const currentRecommendation = selectedAnalysis?.recommendations.find((item) => item.header === selectedHeader) ?? null;
  const currentConsensus = selectedAnalysis?.columnConsensus.find((item) => item.header === selectedHeader) ?? null;
  const currentPolicy = selectedHeader && policy ? policy.fieldPolicies[selectedHeader] ?? null : null;
  const currentHeaderIndex = selectedHeaders.findIndex((header) => header === selectedHeader);
  const currentFieldProposalCount = visible.filter((proposal) => proposal.header === selectedHeader).length;

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

      const defaults = next.analysis.profiles
        .filter((profile) => profile.issueCounts.length || next.analysis.schema.some((item) => item.header === profile.header))
        .map((profile) => profile.header);
      const initialHeaders = defaults.length ? defaults : next.analysis.dataset.headers.slice(0, 4);
      setSelectedHeaders(initialHeaders);
      setSelectedHeader(initialHeaders[0] ?? '');
      setStep('columns');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze file.');
    } finally {
      setLoading(false);
    }
  }

  function resetWorkflowForNewFiles() {
    setWorkflow(null);
    setSelectedHeaders([]);
    setSelectedHeader('');
    setAppliedRows(null);
    setAppliedLog([]);
    setOverrides({});
    setStep('upload');
  }

  function toggleHeader(header: string) {
    setSelectedHeaders((current) => {
      const next = current.includes(header) ? current.filter((item) => item !== header) : [...current, header];
      if (next.length && !next.includes(selectedHeader)) {
        setSelectedHeader(next[0]);
      }
      if (!next.length) {
        setSelectedHeader('');
      }
      return next;
    });
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

  function addMapping() {
    if (!selectedHeader || !mappingSource.trim() || !mappingTarget.trim()) return;
    updateFieldPolicy(selectedHeader, {
      customMappings: {
        ...(currentPolicy?.customMappings ?? {}),
        [mappingSource.trim()]: mappingTarget.trim(),
      },
    });
    setMappingSource('');
    setMappingTarget('');
  }

  function removeMapping(source: string) {
    if (!selectedHeader || !currentPolicy) return;
    const nextMappings = { ...currentPolicy.customMappings };
    delete nextMappings[source];
    updateFieldPolicy(selectedHeader, { customMappings: nextMappings });
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
    const chosen = proposals.map((proposal) => ({
      ...proposal,
      apply: mode === 'safe' ? proposal.status === 'safe' : proposal.apply,
    }));
    if (!window.confirm(text.confirmApply)) return;
    const result = applySelectedProposals(analysis.dataset, chosen);
    setAppliedRows(result.rows);
    setAppliedLog(buildChangeLog(chosen));
    setStep('export');
  }

  function savePreset() {
    if (!policy || !presetName.trim()) return;
    const name = presetName.trim();
    const next = [...presets.filter((preset) => preset.name !== name), { name, createdAt: new Date().toISOString(), policy }];
    setPresets(next);
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
    setPresetName('');
  }

  function applyPreset(name: string) {
    const preset = presets.find((item) => item.name === name);
    if (!preset) return;
    setWorkflow((current) => (current ? { ...current, policy: preset.policy } : current));
  }

  function moveSelectedHeader(offset: -1 | 1) {
    if (!selectedHeaders.length) return;
    const baseIndex = currentHeaderIndex >= 0 ? currentHeaderIndex : 0;
    const nextIndex = baseIndex + offset;
    if (nextIndex < 0 || nextIndex >= selectedHeaders.length) return;
    setSelectedHeader(selectedHeaders[nextIndex]);
  }

  const steps: Array<{ key: StepKey; label: string }> = [
    { key: 'upload', label: `1. ${text.upload}` },
    { key: 'columns', label: `2. ${text.columns}` },
    { key: 'selected', label: `3. ${text.selected}` },
    { key: 'linkage', label: `4. ${text.linkage}` },
    { key: 'review', label: `5. ${text.review}` },
    { key: 'export', label: `6. ${text.export}` },
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void handleAnalyze()}
              disabled={!metadataFile || loading}
            >
              {workflow ? text.analyzeAgain : text.startAnalysis}
            </button>
            <button
              type="button"
              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => applyChanges('safe')}
              disabled={!analysis}
            >
              {text.applySafe}
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => applyChanges('selected')}
              disabled={!analysis}
            >
              {text.applySelected}
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.rows}</p>
            <p className="mt-1 text-xl font-semibold">{analysis?.dashboard.totalRows ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.issues}</p>
            <p className="mt-1 text-xl font-semibold">{analysis?.dashboard.totalIssues ?? 0}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-700">{text.selectedCount}</p>
            <p className="mt-1 text-xl font-semibold text-amber-900">{selectedHeaders.length}</p>
          </div>
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-700">{text.visible}</p>
            <p className="mt-1 text-xl font-semibold text-cyan-900">{visible.length}</p>
          </div>
        </div>
      </div>

      {step === 'upload' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
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
                    resetWorkflowForNewFiles();
                  }}
                />
                <p className="mt-2 text-xs text-slate-600">
                  {text.selectedFile}: {metadataFile?.name ?? text.noFile}
                </p>
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
                    resetWorkflowForNewFiles();
                  }}
                />
                <p className="mt-2 text-xs text-slate-600">
                  {text.selectedFile}: {fastaFile?.name ?? text.noFile}
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-cyan-700 px-3 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleAnalyze()}
                disabled={!metadataFile || loading}
              >
                {loading ? text.analyzing : workflow ? text.analyzeAgain : text.startAnalysis}
              </button>

              {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">{error}</p> : null}
              {workflow ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">{text.analysisComplete}</p> : null}
            </div>
          </SectionCard>

          <SectionCard title={text.issueSummary}>
            {analysis ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">{analysis.dataset.fileName}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {text.format}: {analysis.dataset.format.toUpperCase()} | {text.columnsLabel}: {analysis.dataset.headers.length} | {text.rows}: {analysis.dataset.rows.length}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">safe</p>
                    <p className="mt-1 text-2xl font-semibold">{analysis.dashboard.safeSuggestions}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-amber-700">review</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-900">{analysis.dashboard.reviewSuggestions}</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-rose-700">invalid</p>
                    <p className="mt-1 text-2xl font-semibold text-rose-900">{analysis.dashboard.invalidValues}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.reviewFirst}</p>
            )}
          </SectionCard>

          <SectionCard title={text.linkage}>
            {linkageReport ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">{text.linkageSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {text.rows}: {linkageReport.totalMetadataRows} | exact: {linkageReport.exactMatches} | normalized: {linkageReport.normalizedMatches} | review: {linkageReport.reviewMatches}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.noFasta}</p>
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
                        <th className="px-3 py-2 text-left">{text.issueSummary}</th>
                        <th className="px-3 py-2 text-left">{text.dominantPattern}</th>
                        <th className="px-3 py-2 text-left">{text.outliers}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {analysis.dataset.headers.map((header) => {
                        const profile = analysis.profiles.find((item) => item.header === header);
                        const schema = analysis.schema.find((item) => item.header === header);
                        const consensus = analysis.columnConsensus.find((item) => item.header === header);
                        return (
                          <tr key={header}>
                            <td className="px-3 py-2 align-top">
                              <input type="checkbox" checked={selectedHeaders.includes(header)} onChange={() => toggleHeader(header)} />
                            </td>
                            <td className="px-3 py-2 align-top font-medium">{header}</td>
                            <td className="px-3 py-2 align-top">{schema?.field ?? '-'}</td>
                            <td className="px-3 py-2 align-top">{schema ? schema.confidence.toFixed(2) : '-'}</td>
                            <td className="px-3 py-2 align-top">{profile ? issueTotal(profile) : 0}</td>
                            <td className="px-3 py-2 align-top">{consensus?.dominantPattern ?? '-'}</td>
                            <td className="px-3 py-2 align-top">{consensus?.outlierCount ?? 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onClick={() => setStep('selected')}
                    disabled={!selectedHeaders.length}
                  >
                    {text.selected}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                    onClick={() => setStep('review')}
                    disabled={!selectedHeaders.length}
                  >
                    {text.goToReview}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.reviewFirst}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'selected' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[300px_1fr]">
          <SectionCard title={text.columns}>
            {selectedAnalysis && selectedAnalysis.headers.length ? (
              <div className="space-y-2">
                {selectedAnalysis.headers.map((header) => {
                  const profile = selectedAnalysis.profiles.find((item) => item.header === header);
                  return (
                    <button
                      key={header}
                      type="button"
                      onClick={() => setSelectedHeader(header)}
                      className={`w-full rounded-xl border p-3 text-left ${
                        selectedHeader === header ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <p className="font-medium">{header}</p>
                      <p className={`mt-1 text-xs ${selectedHeader === header ? 'text-slate-200' : 'text-slate-500'}`}>
                        {profile ? summarizeField(profile, isKo) : text.noColumnsSelected}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.noColumnsSelected}</p>
            )}
          </SectionCard>

          <SectionCard title={text.selectedField}>
            {currentProfile && currentPolicy ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-xl font-semibold text-slate-900">{currentProfile.header}</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    {text.issueSummary}: {summarizeField(currentProfile, isKo)}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {text.recommendedAction}: {currentRecommendation?.recommendedReason ?? '-'}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {text.previewCount}: {currentFieldProposalCount}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${selectedHeaders.includes(selectedHeader) ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white'}`}
                    onClick={() => {
                      if (!selectedHeaders.includes(selectedHeader)) {
                        toggleHeader(selectedHeader);
                      }
                    }}
                  >
                    {text.includeField}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onClick={() => {
                      if (selectedHeaders.includes(selectedHeader)) {
                        toggleHeader(selectedHeader);
                      }
                    }}
                  >
                    {text.excludeField}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onClick={() => moveSelectedHeader(-1)}
                    disabled={currentHeaderIndex <= 0}
                  >
                    {text.previousField}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onClick={() => moveSelectedHeader(1)}
                    disabled={currentHeaderIndex < 0 || currentHeaderIndex >= selectedHeaders.length - 1}
                  >
                    {text.nextField}
                  </button>
                </div>

                {currentConsensus ? (
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.dominantPattern}</p>
                      <p className="mt-1 font-semibold">{currentConsensus.dominantPattern}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.dominantCase}</p>
                      <p className="mt-1 font-semibold">{currentConsensus.dominantCase}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.dominantSeparator}</p>
                      <p className="mt-1 font-semibold">{currentConsensus.dominantSeparator}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.outliers}</p>
                      <p className="mt-1 font-semibold">{currentConsensus.outlierCount}</p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">{text.strategy}</span>
                    <select
                      value={currentPolicy.strategy}
                      onChange={(event) => setStrategy(selectedHeader, event.target.value as FieldPolicy['strategy'])}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {(currentRecommendation?.options ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-medium">{text.dateHandling}</span>
                    <select
                      value={currentPolicy.normalizeDates}
                      onChange={(event) => updateFieldPolicy(selectedHeader, { normalizeDates: event.target.value as FieldPolicy['normalizeDates'] })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="preserve">{text.preserve}</option>
                      <option value="normalize-unambiguous">{text.normalizeUnambiguous}</option>
                      <option value="review-ambiguous">{text.reviewAmbiguous}</option>
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-medium">{text.controlledVocabulary}</span>
                    <select
                      value={currentPolicy.applyControlledVocabulary}
                      onChange={(event) =>
                        updateFieldPolicy(selectedHeader, {
                          applyControlledVocabulary: event.target.value as FieldPolicy['applyControlledVocabulary'],
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="off">{text.off}</option>
                      <option value="safe-only">{text.safeOnly}</option>
                      <option value="with-review">{text.withReview}</option>
                    </select>
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-medium">{text.customMapping}</p>
                    <div className="mt-3 grid gap-2">
                      <input
                        value={mappingSource}
                        onChange={(event) => setMappingSource(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder={text.originalValue}
                      />
                      <input
                        value={mappingTarget}
                        onChange={(event) => setMappingTarget(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder={text.mappedValue}
                      />
                      <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-white" onClick={addMapping}>
                        {text.addMapping}
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 font-medium">{text.activeMappings}</p>
                      {Object.entries(currentPolicy.customMappings ?? {}).length ? (
                        <div className="space-y-2">
                          {Object.entries(currentPolicy.customMappings ?? {}).map(([source, target]) => (
                            <div key={source} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">{source}</p>
                                <p className="truncate text-slate-600">{target}</p>
                              </div>
                              <button type="button" className="rounded-lg border border-slate-300 px-2 py-1 text-xs" onClick={() => removeMapping(source)}>
                                {text.remove}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600">{text.noMappings}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setStep('columns')}>
                    {text.backToColumns}
                  </button>
                  {linkageReport ? (
                    <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setStep('linkage')}>
                      {text.linkage}
                    </button>
                  ) : null}
                  <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={() => setStep('review')}>
                    {text.goToReview}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.selectFieldPrompt}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'linkage' ? (
        <div className="mt-6">
          <SectionCard title={text.linkage}>
            {linkageReport ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{text.linkageSummary}</p>
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
                        <th className="px-3 py-2 text-left">{text.reason}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {linkageReport.rows.slice(0, 200).map((row) => (
                        <tr key={row.rowIndex}>
                          <td className="px-3 py-2 align-top">{row.rowIndex}</td>
                          <td className="px-3 py-2 align-top">{row.name}</td>
                          <td className="px-3 py-2 align-top">{row.fasta_name}</td>
                          <td className="px-3 py-2 align-top">{row.name_match_status}</td>
                          <td className="px-3 py-2 align-top">{row.name_match_confidence.toFixed(2)}</td>
                          <td className="px-3 py-2 align-top">{row.matchedBy || '-'}</td>
                          <td className="px-3 py-2 align-top">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.noFasta}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'review' ? (
        <div className="mt-6">
          <SectionCard title={text.review}>
            {analysis ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
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
                    {text.skipVisible}
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
                          <th className="px-3 py-2 text-left">{text.suggested}</th>
                          <th className="px-3 py-2 text-left">{text.issue}</th>
                          <th className="px-3 py-2 text-left">{text.confidence}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {visible.slice(0, 300).map((proposal) => (
                          <tr key={proposal.id}>
                            <td className="px-3 py-2 align-top">
                              <input type="checkbox" checked={proposal.apply} onChange={(event) => toggleProposal(proposal.id, event.target.checked)} />
                            </td>
                            <td className="px-3 py-2 align-top">{proposal.rowIndex}</td>
                            <td className="px-3 py-2 align-top">{proposal.header}</td>
                            <td className="px-3 py-2 align-top">{proposal.originalValue}</td>
                            <td className="px-3 py-2 align-top">{proposal.suggestedValue}</td>
                            <td className="px-3 py-2 align-top">
                              <div>{proposal.issueType}</div>
                              <div className="mt-1 text-xs text-slate-500">{proposal.reason}</div>
                            </td>
                            <td className="px-3 py-2 align-top">{proposal.confidence.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">{text.noProposals}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">{text.reviewFirst}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {step === 'export' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title={text.export}>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">{text.rawPreserved}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {text.appliedChanges}: {appliedLog.length}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">{text.presetName}</label>
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder={isKo ? '예: 인플루엔자 표준' : 'e.g. Influenza standard'}
                  />
                  <button type="button" className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={savePreset} disabled={!policy}>
                    {text.savePreset}
                  </button>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium">{text.savedPresets}</p>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <button key={preset.name} type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => applyPreset(preset.name)}>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {analysis && appliedRows ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white"
                    onClick={() => downloadText(`cleaned-${analysis.dataset.fileName}`, exportCleanedContent(analysis.dataset, appliedRows))}
                  >
                    {text.cleanedFile}
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
                    onClick={() => downloadText('linkage-report.csv', linkageRowsToCsv(linkageReport?.rows || []), 'text/csv;charset=utf-8')}
                  >
                    {text.linkageReport} CSV
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('linkage-view.csv', linkageAwareViewCsv(analysis.dataset, appliedRows, linkageReport), 'text/csv;charset=utf-8')}
                  >
                    {text.linkageView} CSV
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
                    onClick={() => downloadText('linkage-report.json', linkageReportToJson(linkageReport || { totalMetadataRows: 0, totalFastaRows: 0, matchedRows: 0, unmatchedMetadataRows: 0, exactMatches: 0, normalizedMatches: 0, reviewMatches: 0, unmatchedRows: 0, candidates: [], rows: [] }), 'application/json;charset=utf-8')}
                  >
                    {text.linkageReport} JSON
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-600">{text.applyBeforeExport}</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title={text.resultSnapshot}>
            {analysis && currentRows.length ? (
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
            ) : (
              <p className="text-sm text-slate-600">{text.applyBeforeExport}</p>
            )}
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}
