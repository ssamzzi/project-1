"use client";

import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';
import {
  applySelectedProposals,
  buildChangeLog,
  buildDefaultPolicy,
  buildRecommendations,
  changeLogToCsv,
  changeLogToJson,
  exportCleanedContent,
  filterDiffProposals,
  generateDiffProposals,
  matchMetadataToFasta,
  parseInputFile,
  profileDataset,
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

type TabKey = 'upload' | 'fields' | 'preview' | 'export';
type FilterMode = 'all' | 'safe' | 'review' | 'invalid';

function getText(isKo: boolean) {
  return isKo
    ? {
        title: '단계별 정제 워크스페이스',
        subtitle: '메타데이터와 FASTA를 먼저 올린 뒤, 분석 시작을 눌러 검토 가능한 정제 제안을 생성합니다.',
        upload: '업로드',
        fields: '필드 설정',
        preview: '미리보기',
        export: '내보내기',
        analyze: '분석 시작',
        reanalyze: '다시 분석',
        applySafe: '안전 변경 적용',
        applySelected: '선택 변경 적용',
        rows: '행',
        issues: '이슈',
        selected: '선택됨',
        visible: '표시 중',
        metadataFile: '메타데이터 파일',
        fastaReference: 'FASTA 참조 파일',
        metadataReady: '메타데이터 준비됨',
        fastaReady: 'FASTA 준비됨',
        optional: '선택 사항',
        analyzing: '분석 중...',
        uploadToBegin: '먼저 메타데이터 파일을 선택하세요.',
        format: '형식',
        columns: '열',
        summary: '요약',
        safeSuggestions: '안전 제안',
        reviewRequired: '검토 필요',
        invalidValues: '유효하지 않은 값',
        summaryAfterAnalysis: '분석 후 요약이 표시됩니다.',
        fastaMatching: 'FASTA 매칭',
        matchedRows: '매칭된 행',
        unmatchedRows: '매칭되지 않은 행',
        analysisRequired: '먼저 분석이 필요합니다.',
        fieldList: '필드 목록',
        selectedField: '선택한 필드',
        issueSummary: '이슈 요약',
        recommendedAction: '권장 처리',
        noRecommendation: '권장 사항 없음',
        strategy: '전략',
        dateHandling: '날짜 처리',
        preserve: '보존',
        normalizeUnambiguous: '명확한 날짜만 정규화',
        reviewAmbiguous: '애매한 날짜는 검토',
        controlledVocabulary: '통제 어휘',
        off: '끄기',
        safeOnly: '안전한 값만',
        withReview: '검토 포함',
        customMapping: '사용자 매핑',
        originalValue: '원래 값',
        mappedValue: '변환 값',
        addMapping: '매핑 추가',
        selectFieldPrompt: '왼쪽에서 필드를 선택하세요.',
        diffPreview: '변경 미리보기',
        noVisibleProposals: '표시할 제안이 없습니다.',
        apply: '적용',
        row: '행',
        field: '필드',
        suggested: '제안값',
        issue: '이슈',
        confidence: '신뢰도',
        applyAndExport: '적용 및 내보내기',
        rawPreserved: '원본 데이터는 세션 동안 그대로 유지됩니다.',
        appliedChanges: '적용된 변경',
        presetName: '프리셋 이름',
        savePreset: '프리셋 저장',
        savedPresets: '저장된 프리셋',
        cleanedFile: '정제된 파일',
        applyBeforeExport: '내보내기 전에 먼저 변경을 적용하세요.',
        resultSnapshot: '결과 미리보기',
        appliedRowsAppear: '적용 결과가 여기에 표시됩니다.',
        confirmApply: '선택한 변경을 적용할까요? 원본 데이터는 그대로 유지됩니다.',
        selectedFile: '선택된 파일',
        noFileSelected: '선택된 파일 없음',
        analysisComplete: '분석이 완료되었습니다.',
      }
    : {
        title: 'Step-based cleaning workspace',
        subtitle: 'Upload metadata and FASTA first, then start analysis to generate reviewable cleaning suggestions.',
        upload: 'Upload',
        fields: 'Fields',
        preview: 'Preview',
        export: 'Export',
        analyze: 'Start analysis',
        reanalyze: 'Analyze again',
        applySafe: 'Apply safe',
        applySelected: 'Apply selected',
        rows: 'Rows',
        issues: 'Issues',
        selected: 'Selected',
        visible: 'Visible',
        metadataFile: 'Metadata file',
        fastaReference: 'FASTA reference',
        metadataReady: 'Metadata ready',
        fastaReady: 'FASTA ready',
        optional: 'Optional',
        analyzing: 'Analyzing...',
        uploadToBegin: 'Select a metadata file to begin.',
        format: 'Format',
        columns: 'Columns',
        summary: 'Summary',
        safeSuggestions: 'Safe suggestions',
        reviewRequired: 'Review required',
        invalidValues: 'Invalid values',
        summaryAfterAnalysis: 'Summary appears after analysis.',
        fastaMatching: 'FASTA matching',
        matchedRows: 'Matched rows',
        unmatchedRows: 'Unmatched rows',
        analysisRequired: 'Analysis required first.',
        fieldList: 'Fields',
        selectedField: 'Selected field',
        issueSummary: 'Issue summary',
        recommendedAction: 'Recommended action',
        noRecommendation: 'No recommendation',
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
        selectFieldPrompt: 'Select a field from the left.',
        diffPreview: 'Diff preview',
        noVisibleProposals: 'No visible proposals.',
        apply: 'Apply',
        row: 'Row',
        field: 'Field',
        suggested: 'Suggested',
        issue: 'Issue',
        confidence: 'Confidence',
        applyAndExport: 'Apply and export',
        rawPreserved: 'Raw data stays preserved during this session.',
        appliedChanges: 'Applied changes',
        presetName: 'Preset name',
        savePreset: 'Save preset',
        savedPresets: 'Saved presets',
        cleanedFile: 'Cleaned file',
        applyBeforeExport: 'Apply changes before exporting.',
        resultSnapshot: 'Result snapshot',
        appliedRowsAppear: 'Applied rows appear here.',
        confirmApply: 'Apply selected changes? Raw data stays preserved.',
        selectedFile: 'Selected file',
        noFileSelected: 'No file selected',
        analysisComplete: 'Analysis completed.',
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

function totalIssues(profile: FieldProfile) {
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

  return isKo ? `총 ${totalIssues(profile)}건: ${summary}` : `${totalIssues(profile)} issues: ${summary}`;
}

export function GenomeMetadataCleanerClient() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const text = getText(isKo);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [policy, setPolicy] = useState<NormalizationPolicy | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('upload');
  const [selectedHeader, setSelectedHeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [appliedRows, setAppliedRows] = useState<ParsedRow[] | null>(null);
  const [appliedLog, setAppliedLog] = useState<ReturnType<typeof buildChangeLog>>([]);
  const [presets, setPresets] = useState<PresetRecord[]>([]);
  const [presetName, setPresetName] = useState('');
  const [mappingSource, setMappingSource] = useState('');
  const [mappingTarget, setMappingTarget] = useState('');
  const [referenceFasta, setReferenceFasta] = useState<ParsedDataset | null>(null);
  const [matchReport, setMatchReport] = useState<FastaMatchReport | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch {
      setPresets([]);
    }
  }, []);

  const schemaByHeader = useMemo<Record<string, SupportedField | undefined>>(() => {
    if (!analysis) return {};
    return analysis.dataset.headers.reduce<Record<string, SupportedField | undefined>>((acc, header) => {
      acc[header] = analysis.schema.find((item) => item.header === header)?.field;
      return acc;
    }, {});
  }, [analysis]);

  const generated = useMemo(() => {
    if (!analysis || !policy) return [];
    return generateDiffProposals(analysis.dataset, schemaByHeader, policy);
  }, [analysis, policy, schemaByHeader]);

  const proposals = useMemo(
    () => generated.map((proposal) => ({ ...proposal, apply: overrides[proposal.id] ?? proposal.apply })),
    [generated, overrides],
  );
  const visible = useMemo(() => filterDiffProposals(proposals, filter), [proposals, filter]);
  const selectedProfile = analysis?.profiles.find((item) => item.header === selectedHeader) ?? null;
  const selectedRecommendation = analysis?.recommendations.find((item) => item.header === selectedHeader) ?? null;
  const selectedPolicy = selectedHeader && policy ? policy.fieldPolicies[selectedHeader] ?? null : null;
  const rows = appliedRows ?? analysis?.dataset.rows ?? [];

  async function runAnalysis() {
    if (!metadataFile) return;

    setLoading(true);
    setError('');
    setAppliedRows(null);
    setAppliedLog([]);
    setOverrides({});
    setMatchReport(null);
    setAnalysis(null);
    setPolicy(null);

    try {
      const dataset = await parseInputFile(metadataFile);
      const fastaDataset = referenceFile ? await parseInputFile(referenceFile) : null;
      const base = profileDataset(dataset);
      const next = { ...base, recommendations: buildRecommendations(base) };

      setAnalysis(next);
      setPolicy(buildDefaultPolicy(next));
      setSelectedHeader(next.dataset.headers[0] ?? '');
      setReferenceFasta(fastaDataset);

      if (fastaDataset) {
        setMatchReport(matchMetadataToFasta(dataset.rows, fastaDataset));
      }

      setActiveTab('fields');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze file.');
    } finally {
      setLoading(false);
    }
  }

  function updateFieldPolicy(header: string, patch: Partial<FieldPolicy>) {
    setPolicy((current) => {
      if (!current) return current;
      const existing = current.fieldPolicies[header];
      if (!existing) return current;
      return {
        ...current,
        fieldPolicies: {
          ...current.fieldPolicies,
          [header]: {
            ...existing,
            ...patch,
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

  function applyNow(mode: 'safe' | 'selected') {
    if (!analysis) return;

    const chosen = proposals.map((proposal) => ({
      ...proposal,
      apply: mode === 'safe' ? proposal.status === 'safe' : proposal.apply,
    }));

    if (!window.confirm(text.confirmApply)) return;

    const result = applySelectedProposals(analysis.dataset, chosen);
    setAppliedRows(result.rows);
    setAppliedLog(buildChangeLog(chosen));
    setActiveTab('export');

    if (referenceFasta) {
      setMatchReport(matchMetadataToFasta(result.rows, referenceFasta));
    }
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
    if (preset) {
      setPolicy(preset.policy);
    }
  }

  function addMapping() {
    if (!selectedHeader || !mappingSource.trim() || !mappingTarget.trim()) return;

    updateFieldPolicy(selectedHeader, {
      customMappings: {
        ...(selectedPolicy?.customMappings ?? {}),
        [mappingSource.trim()]: mappingTarget.trim(),
      },
    });

    setMappingSource('');
    setMappingTarget('');
  }

  const tabLabels: Array<{ key: TabKey; label: string }> = [
    { key: 'upload', label: `1. ${text.upload}` },
    { key: 'fields', label: `2. ${text.fields}` },
    { key: 'preview', label: `3. ${text.preview}` },
    { key: 'export', label: `4. ${text.export}` },
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
            {tabLabels.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-2 text-sm ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void runAnalysis()}
              disabled={!metadataFile || loading}
            >
              {analysis ? text.reanalyze : text.analyze}
            </button>
            <button
              type="button"
              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => applyNow('safe')}
              disabled={!analysis}
            >
              {text.applySafe}
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => applyNow('selected')}
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
            <p className="text-xs uppercase tracking-[0.16em] text-amber-700">{text.selected}</p>
            <p className="mt-1 text-xl font-semibold text-amber-900">{proposals.filter((proposal) => proposal.apply).length}</p>
          </div>
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-700">{text.visible}</p>
            <p className="mt-1 text-xl font-semibold text-cyan-900">{visible.length}</p>
          </div>
        </div>
      </div>

      {activeTab === 'upload' ? (
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
                    const file = event.target.files?.[0] ?? null;
                    setMetadataFile(file);
                    setAnalysis(null);
                    setPolicy(null);
                    setAppliedRows(null);
                    setAppliedLog([]);
                    setMatchReport(null);
                    setActiveTab('upload');
                    setError('');
                  }}
                />
                <p className="mt-2 text-xs text-slate-600">
                  {text.selectedFile}: {metadataFile?.name ?? text.noFileSelected}
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  {text.fastaReference} <span className="text-slate-500">({text.optional})</span>
                </label>
                <input
                  type="file"
                  accept=".fasta,.fa,.fna,.faa"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setReferenceFile(file);
                    setReferenceFasta(null);
                    setMatchReport(null);
                    setError('');
                  }}
                />
                <p className="mt-2 text-xs text-slate-600">
                  {text.selectedFile}: {referenceFile?.name ?? text.noFileSelected}
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-cyan-700 px-3 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void runAnalysis()}
                disabled={!metadataFile || loading}
              >
                {loading ? text.analyzing : analysis ? text.reanalyze : text.analyze}
              </button>

              {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">{error}</p> : null}
              {!metadataFile && !loading ? <p className="text-sm text-slate-600">{text.uploadToBegin}</p> : null}
              {analysis ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">{text.analysisComplete}</p> : null}
            </div>
          </SectionCard>

          <SectionCard title={text.summary}>
            {analysis ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{text.safeSuggestions}</p>
                  <p className="mt-1 text-2xl font-semibold">{analysis.dashboard.safeSuggestions}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-amber-700">{text.reviewRequired}</p>
                  <p className="mt-1 text-2xl font-semibold text-amber-900">{analysis.dashboard.reviewSuggestions}</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-rose-700">{text.invalidValues}</p>
                  <p className="mt-1 text-2xl font-semibold text-rose-900">{analysis.dashboard.invalidValues}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.summaryAfterAnalysis}</p>
            )}
          </SectionCard>

          <SectionCard title={text.fastaMatching}>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">{text.metadataReady}</p>
                <p className="mt-1 text-xs text-slate-600">{metadataFile?.name ?? text.noFileSelected}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">{text.fastaReady}</p>
                <p className="mt-1 text-xs text-slate-600">{referenceFile?.name ?? text.noFileSelected}</p>
              </div>
              {referenceFasta && matchReport ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">{referenceFasta.fileName}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {text.matchedRows}: {matchReport.matchedRows} / {matchReport.totalMetadataRows}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {text.unmatchedRows}: {matchReport.unmatchedMetadataRows}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">{text.optional}</p>
              )}
            </div>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'fields' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[300px_1fr]">
          <SectionCard title={text.fieldList}>
            {analysis ? (
              <div className="space-y-2">
                {analysis.profiles.map((profile) => (
                  <button
                    key={profile.header}
                    type="button"
                    onClick={() => setSelectedHeader(profile.header)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      selectedHeader === profile.header ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="font-medium">{profile.header}</p>
                    <p className={`mt-1 text-xs ${selectedHeader === profile.header ? 'text-slate-200' : 'text-slate-500'}`}>
                      {summarizeField(profile, isKo)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.analysisRequired}</p>
            )}
          </SectionCard>

          <SectionCard title={text.selectedField}>
            {selectedProfile && selectedPolicy ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-xl font-semibold text-slate-900">{selectedProfile.header}</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    {text.issueSummary}: {summarizeField(selectedProfile, isKo)}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {text.recommendedAction}: {selectedRecommendation?.recommendedReason ?? text.noRecommendation}
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">{text.strategy}</span>
                    <select
                      value={selectedPolicy.strategy}
                      onChange={(event) => setStrategy(selectedHeader, event.target.value as FieldPolicy['strategy'])}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {(selectedRecommendation?.options ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-medium">{text.dateHandling}</span>
                    <select
                      value={selectedPolicy.normalizeDates}
                      onChange={(event) =>
                        updateFieldPolicy(selectedHeader, {
                          normalizeDates: event.target.value as FieldPolicy['normalizeDates'],
                        })
                      }
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
                      value={selectedPolicy.applyControlledVocabulary}
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

                    {selectedPolicy.customMappings && Object.keys(selectedPolicy.customMappings).length ? (
                      <div className="mt-3 space-y-2">
                        {Object.entries(selectedPolicy.customMappings).map(([source, target]) => (
                          <div key={`${source}-${target}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                            <span className="font-medium">{source}</span> {'->'} {target}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{text.selectFieldPrompt}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'preview' ? (
        <div className="mt-6">
          <SectionCard title={text.diffPreview}>
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
                        {visible.slice(0, 200).map((proposal) => (
                          <tr key={proposal.id}>
                            <td className="px-3 py-2 align-top">
                              <input
                                type="checkbox"
                                checked={proposal.apply}
                                onChange={(event) => toggleProposal(proposal.id, event.target.checked)}
                              />
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
                  <p className="text-sm text-slate-600">{text.noVisibleProposals}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">{text.analysisRequired}</p>
            )}
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'export' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title={text.applyAndExport}>
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
                  <button
                    type="button"
                    className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onClick={savePreset}
                    disabled={!policy}
                  >
                    {text.savePreset}
                  </button>
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium">{text.savedPresets}</p>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                        onClick={() => applyPreset(preset.name)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {analysis && appliedRows ? (
                <div className="grid gap-2 sm:grid-cols-3">
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
                    onClick={() => downloadText('change-log.json', changeLogToJson(appliedLog), 'application/json;charset=utf-8')}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => downloadText('change-log.csv', changeLogToCsv(appliedLog), 'text/csv;charset=utf-8')}
                  >
                    CSV
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-600">{text.applyBeforeExport}</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title={text.resultSnapshot}>
            {analysis && rows.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {analysis.dataset.headers.slice(0, 8).map((header) => (
                        <th key={header} className="px-3 py-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {rows.slice(0, 10).map((row) => (
                      <tr key={row.__rowIndex}>
                        {analysis.dataset.headers.slice(0, 8).map((header) => (
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
              <p className="text-sm text-slate-600">{text.appliedRowsAppear}</p>
            )}
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}
