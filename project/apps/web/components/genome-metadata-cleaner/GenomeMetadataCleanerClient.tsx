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
  type NormalizationPolicy,
  type ParsedDataset,
  type ParsedRow,
  type PresetRecord,
  type SupportedField,
} from '../../lib/genome-metadata-cleaner';

const PRESET_STORAGE_KEY = 'biolt-genome-metadata-cleaner-presets';

function downloadText(filename: string, data: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function issueSummary(issues: AnalysisResult['profiles'][number]['issueCounts']) {
  if (!issues.length) return 'No issues detected';
  return issues.map((issue) => `${issue.type} (${issue.count})`).join(', ');
}

export function GenomeMetadataCleanerClient() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [policy, setPolicy] = useState<NormalizationPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'review' | 'invalid'>('all');
  const [proposalOverrides, setProposalOverrides] = useState<Record<string, boolean>>({});
  const [appliedRows, setAppliedRows] = useState<ParsedRow[] | null>(null);
  const [appliedLog, setAppliedLog] = useState<ReturnType<typeof buildChangeLog>>([]);
  const [presets, setPresets] = useState<PresetRecord[]>([]);
  const [presetName, setPresetName] = useState('');
  const [customMappingField, setCustomMappingField] = useState('');
  const [customMappingSource, setCustomMappingSource] = useState('');
  const [customMappingTarget, setCustomMappingTarget] = useState('');
  const [referenceFasta, setReferenceFasta] = useState<ParsedDataset | null>(null);
  const [matchReport, setMatchReport] = useState<FastaMatchReport | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  const generatedProposals = useMemo(() => {
    if (!analysis || !policy) return [];
    return generateDiffProposals(analysis.dataset, schemaByHeader, policy);
  }, [analysis, policy, schemaByHeader]);

  const proposals = useMemo(
    () =>
      generatedProposals.map((proposal) => ({
        ...proposal,
        apply: proposalOverrides[proposal.id] ?? proposal.apply,
      })),
    [generatedProposals, proposalOverrides],
  );

  const visibleProposals = useMemo(() => filterDiffProposals(proposals, filter), [proposals, filter]);

  async function handleUpload(file: File) {
    setIsLoading(true);
    setError('');
    setAppliedRows(null);
    setAppliedLog([]);
    setProposalOverrides({});
    try {
      const dataset = await parseInputFile(file);
      const base = profileDataset(dataset);
      const next: AnalysisResult = { ...base, recommendations: buildRecommendations(base) };
      setAnalysis(next);
      setPolicy(buildDefaultPolicy(next));
      setCustomMappingField(next.dataset.headers[0] || '');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze file.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReferenceUpload(file: File) {
    setIsLoading(true);
    try {
      const dataset = await parseInputFile(file);
      setReferenceFasta(dataset);
      const rows = appliedRows || analysis?.dataset.rows;
      if (rows?.length) setMatchReport(matchMetadataToFasta(rows, dataset));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze reference FASTA.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateFieldPolicy(header: string, patch: Partial<FieldPolicy>) {
    setPolicy((current) => {
      if (!current) return current;
      return {
        ...current,
        fieldPolicies: {
          ...current.fieldPolicies,
          [header]: {
            ...current.fieldPolicies[header],
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
    } else if (strategy === 'canonicalize-with-review') {
      patch.applyControlledVocabulary = 'with-review';
      patch.normalizeDates = 'review-ambiguous';
    } else if (strategy === 'review-only') {
      patch.applyControlledVocabulary = 'with-review';
      patch.normalizeDates = 'review-ambiguous';
    } else {
      patch.applyControlledVocabulary = 'off';
      patch.normalizeDates = 'preserve';
    }
    updateFieldPolicy(header, patch);
  }

  function toggleProposal(id: string, checked: boolean) {
    setProposalOverrides((current) => ({ ...current, [id]: checked }));
  }

  function addCustomMapping() {
    if (!customMappingField || !customMappingSource || !customMappingTarget) return;
    updateFieldPolicy(customMappingField, {
      customMappings: {
        ...(policy?.fieldPolicies[customMappingField]?.customMappings || {}),
        [customMappingSource]: customMappingTarget,
      },
    });
    setCustomMappingSource('');
    setCustomMappingTarget('');
  }

  function savePreset() {
    if (!policy || !presetName.trim()) return;
    const nextPreset: PresetRecord = { name: presetName.trim(), createdAt: new Date().toISOString(), policy };
    const nextPresets = [...presets.filter((preset) => preset.name !== nextPreset.name), nextPreset];
    setPresets(nextPresets);
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(nextPresets));
    setPresetName('');
  }

  function applyPreset(name: string) {
    const preset = presets.find((item) => item.name === name);
    if (preset) setPolicy(preset.policy);
  }

  function applyNow(mode: 'safe' | 'selected') {
    if (!analysis) return;
    const chosen = proposals.map((proposal) => ({
      ...proposal,
      apply: mode === 'safe' ? proposal.status === 'safe' : proposal.apply,
    }));
    if (!window.confirm(isKo ? '선택한 변경을 적용할까요? 원본 행은 현재 세션에서 그대로 보존됩니다.' : 'Apply the selected changes? Raw rows will remain preserved in the current session.')) return;
    const result = applySelectedProposals(analysis.dataset, chosen);
    const changeLog = buildChangeLog(chosen);
    setAppliedRows(result.rows);
    setAppliedLog(changeLog);
    if (referenceFasta) setMatchReport(matchMetadataToFasta(result.rows, referenceFasta));
  }

  const currentRows = appliedRows || analysis?.dataset.rows || [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Genome Metadata Cleaner</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {isKo ? '먼저 분석하고, 명시적으로 선택한 뒤 정규화하세요' : 'Analyze first, then normalize with explicit control'}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-700">
          {isKo
            ? '이 워크플로는 어떤 값도 바꾸기 전에 메타데이터를 먼저 프로파일링하고, 안전한 수정과 위험한 수정을 분리해서 보여주며, CSV/TSV/XLSX/FASTA를 지원하고, 내보낼 수 있는 감사 로그를 남깁니다.'
            : 'This workflow profiles metadata before changing anything, separates safe fixes from risky ones, supports CSV/TSV/XLSX/FASTA, and preserves an exportable audit trail.'}
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <SectionCard title={isKo ? '업로드' : 'Upload'}>
          <div className="space-y-3 text-sm">
            <div>
              <label className="mb-1 block font-medium">{isKo ? '기본 메타데이터 파일' : 'Primary metadata file'}</label>
              <input
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,.xls,.fasta,.fa,.fna,.faa"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              <p className="mt-1 text-xs text-slate-500">
                {isKo
                  ? 'XLSX는 첫 번째 시트를 사용합니다. FASTA는 헤더 메타데이터를 추출해 정규화와 내보내기에 사용합니다.'
                  : 'XLSX uses the first worksheet. FASTA imports header metadata for normalization and export.'}
              </p>
            </div>
            <div>
              <label className="mb-1 block font-medium">{isKo ? '메타데이터-FASTA 매칭용 선택 FASTA' : 'Optional FASTA for metadata-to-FASTA matching'}</label>
              <input
                type="file"
                accept=".fasta,.fa,.fna,.faa"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleReferenceUpload(file);
                }}
              />
            </div>
            {isLoading ? <p className="rounded-lg bg-slate-50 px-3 py-2">{isKo ? '분석 중...' : 'Analyzing...'}</p> : null}
            {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">{error}</p> : null}
            {analysis ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">{analysis.dataset.fileName}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {isKo ? '형식' : 'Format'}: {analysis.dataset.format.toUpperCase()} | {isKo ? '컬럼' : 'Columns'}: {analysis.dataset.headers.length} | {isKo ? '행' : 'Rows'}: {analysis.dataset.rows.length}
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title={isKo ? '이슈 요약 대시보드' : 'Issue Summary Dashboard'}>
          {analysis ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{isKo ? '전체 행' : 'Total rows'}</p>
                <p className="mt-1 text-2xl font-semibold">{analysis.dashboard.totalRows}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{isKo ? '전체 이슈' : 'Total issues'}</p>
                <p className="mt-1 text-2xl font-semibold">{analysis.dashboard.totalIssues}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">{isKo ? '안전한 제안' : 'Safe suggestions'}</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-900">{analysis.dashboard.safeSuggestions}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-amber-700">{isKo ? '검토 필요' : 'Review required'}</p>
                <p className="mt-1 text-2xl font-semibold text-amber-900">{analysis.dashboard.reviewSuggestions}</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-rose-700">{isKo ? '유효하지 않음' : 'Invalid values'}</p>
                <p className="mt-1 text-2xl font-semibold text-rose-900">{analysis.dashboard.invalidValues}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">{isKo ? '분석 후 대시보드 지표가 표시됩니다.' : 'Dashboard metrics appear after analysis.'}</p>
          )}
        </SectionCard>

        <SectionCard title={isKo ? '프리셋과 내보내기' : 'Presets and Export'}>
          <div className="space-y-3 text-sm">
            <div>
              <label className="mb-1 block font-medium">{isKo ? '프리셋 이름' : 'Preset name'}</label>
              <input value={presetName} onChange={(event) => setPresetName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder={isKo ? '예: 인플루엔자 실험실 표준' : 'Influenza lab standard'} />
              <button type="button" className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-white" onClick={savePreset} disabled={!policy}>
                {isKo ? '프리셋 저장' : 'Save preset'}
              </button>
            </div>
            {presets.length ? (
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button key={preset.name} type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => applyPreset(preset.name)}>
                    {preset.name}
                  </button>
                ))}
              </div>
            ) : null}
            {analysis && appliedRows ? (
              <div className="space-y-2">
                <button type="button" className="w-full rounded-lg bg-cyan-700 px-3 py-2 text-white" onClick={() => downloadText(`cleaned-${analysis.dataset.fileName}`, exportCleanedContent(analysis.dataset, appliedRows))}>
                  {isKo ? '정리된 파일 내보내기' : 'Export cleaned file'}
                </button>
                <button type="button" className="w-full rounded-lg border border-slate-300 px-3 py-2" onClick={() => downloadText('change-log.json', changeLogToJson(appliedLog), 'application/json;charset=utf-8')}>
                  {isKo ? '변경 로그 JSON 내보내기' : 'Export change log JSON'}
                </button>
                <button type="button" className="w-full rounded-lg border border-slate-300 px-3 py-2" onClick={() => downloadText('change-log.csv', changeLogToCsv(appliedLog), 'text/csv;charset=utf-8')}>
                  {isKo ? '변경 로그 CSV 내보내기' : 'Export change log CSV'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">{isKo ? '변경을 명시적으로 적용한 뒤 내보내기를 사용할 수 있습니다.' : 'Exports unlock after changes are explicitly applied.'}</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <SectionCard title={isKo ? '스키마 탐지' : 'Schema Detection'}>
          {analysis ? (
            <div className="space-y-2 text-sm">
              {analysis.dataset.headers.map((header) => {
                const schema = analysis.schema.find((item) => item.header === header);
                return (
                  <div key={header} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium">{header}</p>
                    <p className="mt-1 text-slate-600">{schema ? `${schema.field} (${Math.round(schema.confidence * 100)}%)` : isKo ? '뚜렷한 매칭 없음' : 'No strong match detected'}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-600">{isKo ? '탐지된 필드 의미가 여기 표시됩니다.' : 'Detected field meanings will be shown here.'}</p>
          )}
        </SectionCard>

        <SectionCard title={isKo ? '사용자 매핑 편집기' : 'Custom Mapping Editor'}>
          {analysis && policy ? (
            <div className="space-y-3 text-sm">
              <select value={customMappingField} onChange={(event) => setCustomMappingField(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {analysis.dataset.headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <input value={customMappingSource} onChange={(event) => setCustomMappingSource(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder={isKo ? '원래 값' : 'Original value'} />
              <input value={customMappingTarget} onChange={(event) => setCustomMappingTarget(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder={isKo ? '매핑할 값' : 'Mapped value'} />
              <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-white" onClick={addCustomMapping}>
                {isKo ? '매핑 추가' : 'Add mapping'}
              </button>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                {Object.entries(policy.fieldPolicies[customMappingField]?.customMappings || {}).length ? (
                  Object.entries(policy.fieldPolicies[customMappingField]?.customMappings || {}).map(([source, target]) => <p key={`${source}-${target}`}>{source} -> {target}</p>)
                ) : (
                  <p>{isKo ? '아직 사용자 매핑이 없습니다.' : 'No custom mappings yet.'}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">{isKo ? '분석 후 사용자 매핑을 설정할 수 있습니다.' : 'Mappings become available after analysis.'}</p>
          )}
        </SectionCard>

        <SectionCard title={isKo ? '메타데이터-FASTA 매칭' : 'Metadata-to-FASTA Matching'}>
          {referenceFasta && matchReport ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">{referenceFasta.fileName}</p>
                <p className="mt-1 text-xs text-slate-600">{isKo ? '매칭된 행' : 'Matched rows'}: {matchReport.matchedRows} / {matchReport.totalMetadataRows}</p>
                <p className="mt-1 text-xs text-slate-600">{isKo ? '미매칭 행' : 'Unmatched rows'}: {matchReport.unmatchedMetadataRows}</p>
              </div>
              <div className="max-h-64 space-y-2 overflow-auto">
                {matchReport.candidates.slice(0, 12).map((candidate) => (
                  <div key={`${candidate.metadataRowIndex}-${candidate.fastaRowIndex}`} className="rounded-lg border border-slate-200 p-2 text-xs">
                    <p className="font-medium">{isKo ? '메타데이터 행' : 'Metadata row'} {candidate.metadataRowIndex} via {candidate.key}</p>
                    <p>{isKo ? '메타데이터' : 'Metadata'}: {candidate.metadataValue}</p>
                    <p>FASTA: {candidate.fastaValue}</p>
                    <p className="text-slate-500">{isKo ? '점수' : 'Score'}: {candidate.score.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">{isKo ? '정리된 메타데이터 ID를 FASTA 헤더와 비교하려면 FASTA 파일을 업로드하세요.' : 'Upload a FASTA file to compare cleaned metadata IDs against FASTA headers.'}</p>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title={isKo ? '필드별 권장 설정 카드' : 'Per-Field Recommendation Cards'}>
          {analysis && policy ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {analysis.profiles.map((profile) => {
                const recommendation = analysis.recommendations.find((item) => item.header === profile.header);
                const fieldPolicy = policy.fieldPolicies[profile.header];
                return (
                  <article key={profile.header} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{profile.header}</h3>
                        <p className="mt-1 text-sm text-slate-600">{isKo ? '탐지된 필드' : 'Detected field'}: {profile.field || (isKo ? '알 수 없음' : 'unknown')} | {profile.nonEmptyRows}/{profile.totalRows} {isKo ? '채워진 행' : 'populated rows'}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${recommendation?.risky ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {recommendation?.risky ? (isKo ? '위험 변경 포함' : 'Risky changes present') : isKo ? '대체로 안전' : 'Mostly safe'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{isKo ? '이슈 요약' : 'Issue summary'}: {issueSummary(profile.issueCounts)}</p>
                    <p className="mt-2 text-sm text-slate-700">{isKo ? '권장 처리' : 'Recommended action'}: {recommendation?.recommendedReason || (isKo ? '권장안이 없습니다.' : 'No recommendation available.')}</p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">{isKo ? '전략' : 'Strategy'}</span>
                        <select value={fieldPolicy?.strategy || 'skip'} onChange={(event) => setStrategy(profile.header, event.target.value as FieldPolicy['strategy'])} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                          {recommendation?.options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                          {recommendation?.options.find((option) => option.id === fieldPolicy?.strategy)?.description || (isKo ? '이 필드의 정규화 방식을 선택하세요.' : 'Choose the normalization behavior for this field.')}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        ['trimWhitespace', isKo ? '앞뒤 공백 제거' : 'Trim whitespace'],
                        ['collapseWhitespace', isKo ? '연속 공백 축약' : 'Collapse repeated spaces'],
                        ['normalizeSeparators', isKo ? '구분자 정규화' : 'Normalize separators'],
                        ['normalizeCasing', isKo ? '대소문자 정규화' : 'Normalize casing'],
                      ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={Boolean(fieldPolicy?.[key as keyof FieldPolicy])} onChange={(event) => updateFieldPolicy(profile.header, { [key]: event.target.checked } as Partial<FieldPolicy>)} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">{isKo ? '날짜 처리' : 'Date handling'}</span>
                        <select value={fieldPolicy?.normalizeDates || 'preserve'} onChange={(event) => updateFieldPolicy(profile.header, { normalizeDates: event.target.value as FieldPolicy['normalizeDates'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                          <option value="preserve">{isKo ? '보존' : 'Preserve'}</option>
                          <option value="normalize-unambiguous">{isKo ? '명확한 값만 정규화' : 'Normalize unambiguous'}</option>
                          <option value="review-ambiguous">{isKo ? '애매한 값 검토' : 'Review ambiguous'}</option>
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">{isKo ? '제어 어휘' : 'Controlled vocabulary'}</span>
                        <select value={fieldPolicy?.applyControlledVocabulary || 'off'} onChange={(event) => updateFieldPolicy(profile.header, { applyControlledVocabulary: event.target.value as FieldPolicy['applyControlledVocabulary'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                          <option value="off">{isKo ? '끄기' : 'Off'}</option>
                          <option value="safe-only">{isKo ? '안전한 값만' : 'Safe only'}</option>
                          <option value="with-review">{isKo ? '검토 포함' : 'With review'}</option>
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-600">{isKo ? '분석 후 필드별 권장 카드가 표시됩니다.' : 'Field recommendation cards will appear after analysis.'}</p>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title={isKo ? '변경 미리보기 표' : 'Diff Preview Table'}>
          {analysis ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(['all', 'safe', 'review', 'invalid'] as const).map((mode) => (
                  <button key={mode} type="button" className={`rounded-full px-3 py-1 text-sm ${filter === mode ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`} onClick={() => setFilter(mode)}>
                    {mode}
                  </button>
                ))}
                <button type="button" className="rounded-full bg-emerald-700 px-3 py-1 text-sm text-white" onClick={() => applyNow('safe')}>
                  {isKo ? '안전한 변경 모두 적용' : 'Apply all safe'}
                </button>
                <button type="button" className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white" onClick={() => applyNow('selected')}>
                  {isKo ? '선택 항목 적용' : 'Apply selected'}
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{isKo ? '적용' : 'Apply'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '행' : 'Row'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '필드' : 'Field'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '원본' : 'Original'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '제안값' : 'Suggested'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '이슈' : 'Issue'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '사유' : 'Reason'}</th>
                      <th className="px-3 py-2 text-left">{isKo ? '신뢰도' : 'Confidence'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {visibleProposals.slice(0, 400).map((proposal) => (
                      <tr key={proposal.id}>
                        <td className="px-3 py-2 align-top">
                          <input type="checkbox" checked={proposal.apply} onChange={(event) => toggleProposal(proposal.id, event.target.checked)} />
                        </td>
                        <td className="px-3 py-2 align-top">{proposal.rowIndex}</td>
                        <td className="px-3 py-2 align-top">{proposal.header}</td>
                        <td className="px-3 py-2 align-top">{proposal.originalValue}</td>
                        <td className="px-3 py-2 align-top">{proposal.suggestedValue}</td>
                        <td className="px-3 py-2 align-top">
                          <span className={`rounded-full px-2 py-1 text-xs ${proposal.status === 'safe' ? 'bg-emerald-100 text-emerald-900' : proposal.status === 'review' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>
                            {proposal.issueType}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top text-slate-600">{proposal.reason}</td>
                        <td className="px-3 py-2 align-top">{proposal.confidence.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleProposals.length > 400 ? <p className="mt-2 text-xs text-slate-500">{isKo ? '처음 400개 제안만 표시합니다. 프리셋이나 필드 규칙으로 검토 범위를 줄여보세요.' : 'Showing the first 400 proposals. Use presets or field-level rules to narrow the review set.'}</p> : null}
            </>
          ) : (
            <p className="text-sm text-slate-600">{isKo ? '규칙 선택 후 변경 제안이 여기에 표시됩니다.' : 'Suggested changes will appear here after rule selection.'}</p>
          )}
        </SectionCard>
      </div>

      {analysis && appliedRows ? (
        <div className="mt-6">
          <SectionCard title={isKo ? '적용 결과 미리보기' : 'Applied Result Snapshot'}>
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
                  {currentRows.slice(0, 10).map((row) => (
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
            <p className="mt-2 text-xs text-slate-500">{isKo ? '적용된 변경 수' : 'Applied changes'}: {appliedLog.length}. {isKo ? '원본 행은 세션이 끝날 때까지 원래 분석 객체에 그대로 남아 있습니다.' : 'Raw rows remain untouched inside the original analysis object until the session ends.'}</p>
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}
