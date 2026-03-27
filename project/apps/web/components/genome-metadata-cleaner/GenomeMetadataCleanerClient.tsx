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

function issueSummary(analysis: AnalysisResult | null, header: string) {
  const profile = analysis?.profiles.find((item) => item.header === header);
  if (!profile?.issueCounts.length) return 'No issues';
  return profile.issueCounts.map((issue) => `${issue.type} (${issue.count})`).join(', ');
}

export function GenomeMetadataCleanerClient() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [policy, setPolicy] = useState<NormalizationPolicy | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'fields' | 'preview' | 'export'>('upload');
  const [selectedHeader, setSelectedHeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'review' | 'invalid'>('all');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [appliedRows, setAppliedRows] = useState<ParsedRow[] | null>(null);
  const [appliedLog, setAppliedLog] = useState<ReturnType<typeof buildChangeLog>>([]);
  const [presets, setPresets] = useState<PresetRecord[]>([]);
  const [presetName, setPresetName] = useState('');
  const [mappingSource, setMappingSource] = useState('');
  const [mappingTarget, setMappingTarget] = useState('');
  const [referenceFasta, setReferenceFasta] = useState<ParsedDataset | null>(null);
  const [matchReport, setMatchReport] = useState<FastaMatchReport | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch {}
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

  const proposals = useMemo(() => generated.map((proposal) => ({ ...proposal, apply: overrides[proposal.id] ?? proposal.apply })), [generated, overrides]);
  const visible = useMemo(() => filterDiffProposals(proposals, filter), [proposals, filter]);
  const selectedProfile = analysis?.profiles.find((item) => item.header === selectedHeader);
  const selectedRecommendation = analysis?.recommendations.find((item) => item.header === selectedHeader);
  const selectedPolicy = selectedHeader && policy ? policy.fieldPolicies[selectedHeader] : null;
  const rows = appliedRows || analysis?.dataset.rows || [];

  async function handleUpload(file: File) {
    setLoading(true);
    setError('');
    setAppliedRows(null);
    setAppliedLog([]);
    setOverrides({});
    try {
      const dataset = await parseInputFile(file);
      const base = profileDataset(dataset);
      const next = { ...base, recommendations: buildRecommendations(base) };
      setAnalysis(next);
      setPolicy(buildDefaultPolicy(next));
      setSelectedHeader(next.dataset.headers[0] || '');
      setActiveTab('fields');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze file.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReferenceUpload(file: File) {
    try {
      const dataset = await parseInputFile(file);
      setReferenceFasta(dataset);
      if (rows.length) setMatchReport(matchMetadataToFasta(rows, dataset));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to analyze reference FASTA.');
    }
  }

  function updateFieldPolicy(header: string, patch: Partial<FieldPolicy>) {
    setPolicy((current) => current ? { ...current, fieldPolicies: { ...current.fieldPolicies, [header]: { ...current.fieldPolicies[header], ...patch } } } : current);
  }

  function setStrategy(header: string, strategy: FieldPolicy['strategy']) {
    const patch: Partial<FieldPolicy> = { strategy, enabled: strategy !== 'skip' };
    if (strategy === 'canonicalize-safe') {
      patch.applyControlledVocabulary = 'safe-only';
      patch.normalizeDates = 'normalize-unambiguous';
    } else if (strategy === 'canonicalize-with-review' || strategy === 'review-only') {
      patch.applyControlledVocabulary = 'with-review';
      patch.normalizeDates = 'review-ambiguous';
    } else {
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
    const chosen = proposals.map((proposal) => ({ ...proposal, apply: mode === 'safe' ? proposal.status === 'safe' : proposal.apply }));
    if (!window.confirm(isKo ? '선택한 변경을 적용할까요? 원본 데이터는 유지됩니다.' : 'Apply selected changes? Raw data stays preserved.')) return;
    const result = applySelectedProposals(analysis.dataset, chosen);
    setAppliedRows(result.rows);
    setAppliedLog(buildChangeLog(chosen));
    setActiveTab('export');
    if (referenceFasta) setMatchReport(matchMetadataToFasta(result.rows, referenceFasta));
  }

  function savePreset() {
    if (!policy || !presetName.trim()) return;
    const next = [...presets.filter((preset) => preset.name !== presetName.trim()), { name: presetName.trim(), createdAt: new Date().toISOString(), policy }];
    setPresets(next);
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
    setPresetName('');
  }

  function applyPreset(name: string) {
    const preset = presets.find((item) => item.name === name);
    if (preset) setPolicy(preset.policy);
  }

  function addMapping() {
    if (!selectedHeader || !mappingSource || !mappingTarget) return;
    updateFieldPolicy(selectedHeader, { customMappings: { ...(selectedPolicy?.customMappings || {}), [mappingSource]: mappingTarget } });
    setMappingSource('');
    setMappingTarget('');
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Genome Metadata Cleaner</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{isKo ? '단계형 정리 워크스페이스' : 'Step-based cleaning workspace'}</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{isKo ? '긴 단일 페이지 대신 탭형 작업공간으로 정리했습니다.' : 'The workflow is now split into compact tabs instead of one long page.'}</p>
      </div>

      <div className="sticky top-16 z-[5] mt-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(['upload', 'fields', 'preview', 'export'] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-3 py-2 text-sm ${activeTab === tab ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`}>
                {tab === 'upload' ? (isKo ? '1. 업로드' : '1. Upload') : tab === 'fields' ? (isKo ? '2. 필드 설정' : '2. Fields') : tab === 'preview' ? (isKo ? '3. 미리보기' : '3. Preview') : isKo ? '4. 내보내기' : '4. Export'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white" onClick={() => applyNow('safe')} disabled={!analysis}>{isKo ? '안전한 변경 적용' : 'Apply safe'}</button>
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={() => applyNow('selected')} disabled={!analysis}>{isKo ? '선택 항목 적용' : 'Apply selected'}</button>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{isKo ? '행' : 'Rows'}</p><p className="mt-1 text-xl font-semibold">{analysis?.dashboard.totalRows ?? 0}</p></div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{isKo ? '전체 이슈' : 'Issues'}</p><p className="mt-1 text-xl font-semibold">{analysis?.dashboard.totalIssues ?? 0}</p></div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-amber-700">{isKo ? '선택된 변경' : 'Selected'}</p><p className="mt-1 text-xl font-semibold text-amber-900">{proposals.filter((proposal) => proposal.apply).length}</p></div>
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-cyan-700">{isKo ? '보이는 제안' : 'Visible'}</p><p className="mt-1 text-xl font-semibold text-cyan-900">{visible.length}</p></div>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <SectionCard title={isKo ? '파일 업로드' : 'Upload'}>
            <div className="space-y-3 text-sm">
              <div><label className="mb-1 block font-medium">{isKo ? '메타데이터 파일' : 'Metadata file'}</label><input type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.fasta,.fa,.fna,.faa" className="w-full rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file); }} /></div>
              <div><label className="mb-1 block font-medium">{isKo ? 'FASTA 참조 파일' : 'FASTA reference'}</label><input type="file" accept=".fasta,.fa,.fna,.faa" className="w-full rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleReferenceUpload(file); }} /></div>
              {loading ? <p className="rounded-lg bg-slate-50 px-3 py-2">{isKo ? '분석 중...' : 'Analyzing...'}</p> : null}
              {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">{error}</p> : null}
              {analysis ? <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="font-medium">{analysis.dataset.fileName}</p><p className="mt-1 text-xs text-slate-600">{isKo ? '형식' : 'Format'}: {analysis.dataset.format.toUpperCase()} | {isKo ? '컬럼' : 'Columns'}: {analysis.dataset.headers.length} | {isKo ? '행' : 'Rows'}: {analysis.dataset.rows.length}</p></div> : <p className="text-sm text-slate-600">{isKo ? '먼저 파일을 업로드하세요.' : 'Upload a file to begin.'}</p>}
            </div>
          </SectionCard>
          <SectionCard title={isKo ? '요약' : 'Summary'}>
            {analysis ? <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{isKo ? '안전한 제안' : 'Safe suggestions'}</p><p className="mt-1 text-2xl font-semibold">{analysis.dashboard.safeSuggestions}</p></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs uppercase tracking-[0.16em] text-amber-700">{isKo ? '검토 필요' : 'Review required'}</p><p className="mt-1 text-2xl font-semibold text-amber-900">{analysis.dashboard.reviewSuggestions}</p></div><div className="rounded-lg border border-rose-200 bg-rose-50 p-3 sm:col-span-2"><p className="text-xs uppercase tracking-[0.16em] text-rose-700">{isKo ? '유효하지 않음' : 'Invalid values'}</p><p className="mt-1 text-2xl font-semibold text-rose-900">{analysis.dashboard.invalidValues}</p></div></div> : <p className="text-sm text-slate-600">{isKo ? '분석 후 요약이 표시됩니다.' : 'Summary appears after analysis.'}</p>}
          </SectionCard>
          <SectionCard title={isKo ? 'FASTA 매칭' : 'FASTA matching'}>
            {referenceFasta && matchReport ? <div className="space-y-3 text-sm"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="font-medium">{referenceFasta.fileName}</p><p className="mt-1 text-xs text-slate-600">{isKo ? '매칭된 행' : 'Matched rows'}: {matchReport.matchedRows} / {matchReport.totalMetadataRows}</p><p className="mt-1 text-xs text-slate-600">{isKo ? '미매칭 행' : 'Unmatched rows'}: {matchReport.unmatchedMetadataRows}</p></div></div> : <p className="text-sm text-slate-600">{isKo ? '선택 사항입니다.' : 'Optional.'}</p>}
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'fields' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[280px_1fr]">
          <SectionCard title={isKo ? '필드 목록' : 'Fields'}>
            {analysis ? <div className="space-y-2">{analysis.profiles.map((profile) => <button key={profile.header} type="button" onClick={() => setSelectedHeader(profile.header)} className={`w-full rounded-xl border p-3 text-left ${selectedHeader === profile.header ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}><p className="font-medium">{profile.header}</p><p className={`mt-1 text-xs ${selectedHeader === profile.header ? 'text-slate-200' : 'text-slate-500'}`}>{issueCount(profile)} issues</p></button>)}</div> : <p className="text-sm text-slate-600">{isKo ? '분석이 필요합니다.' : 'Analysis required.'}</p>}
          </SectionCard>
          <SectionCard title={isKo ? '선택 필드' : 'Selected field'}>
            {selectedProfile && selectedPolicy ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-xl font-semibold text-slate-900">{selectedProfile.header}</h3>
                  <p className="mt-2 text-sm text-slate-700">{isKo ? '이슈 요약' : 'Issue summary'}: {issueSummary(analysis, selectedHeader)}</p>
                  <p className="mt-2 text-sm text-slate-700">{isKo ? '권장 처리' : 'Recommended action'}: {selectedRecommendation?.recommendedReason || (isKo ? '권장안 없음' : 'No recommendation')}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm"><span className="mb-1 block font-medium">{isKo ? '전략' : 'Strategy'}</span><select value={selectedPolicy.strategy} onChange={(event) => setStrategy(selectedHeader, event.target.value as FieldPolicy['strategy'])} className="w-full rounded-lg border border-slate-300 px-3 py-2">{selectedRecommendation?.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                  <label className="text-sm"><span className="mb-1 block font-medium">{isKo ? '날짜 처리' : 'Date handling'}</span><select value={selectedPolicy.normalizeDates} onChange={(event) => updateFieldPolicy(selectedHeader, { normalizeDates: event.target.value as FieldPolicy['normalizeDates'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2"><option value="preserve">{isKo ? '보존' : 'Preserve'}</option><option value="normalize-unambiguous">{isKo ? '명확한 값만 정규화' : 'Normalize unambiguous'}</option><option value="review-ambiguous">{isKo ? '애매한 값 검토' : 'Review ambiguous'}</option></select></label>
                  <label className="text-sm"><span className="mb-1 block font-medium">{isKo ? '제어 어휘' : 'Controlled vocabulary'}</span><select value={selectedPolicy.applyControlledVocabulary} onChange={(event) => updateFieldPolicy(selectedHeader, { applyControlledVocabulary: event.target.value as FieldPolicy['applyControlledVocabulary'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2"><option value="off">{isKo ? '끄기' : 'Off'}</option><option value="safe-only">{isKo ? '안전한 값만' : 'Safe only'}</option><option value="with-review">{isKo ? '검토 포함' : 'With review'}</option></select></label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><p className="font-medium">{isKo ? '사용자 매핑' : 'Custom mapping'}</p><div className="mt-3 grid gap-2"><input value={mappingSource} onChange={(event) => setMappingSource(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder={isKo ? '원래 값' : 'Original value'} /><input value={mappingTarget} onChange={(event) => setMappingTarget(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder={isKo ? '바꿀 값' : 'Mapped value'} /><button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-white" onClick={addMapping}>{isKo ? '매핑 추가' : 'Add mapping'}</button></div></div>
                </div>
              </div>
            ) : <p className="text-sm text-slate-600">{isKo ? '왼쪽에서 필드를 선택하세요.' : 'Select a field on the left.'}</p>}
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'preview' ? (
        <div className="mt-6">
          <SectionCard title={isKo ? '변경 미리보기' : 'Diff preview'}>
            {analysis ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {(['all', 'safe', 'review', 'invalid'] as const).map((mode) => <button key={mode} type="button" className={`rounded-full px-3 py-1 text-sm ${filter === mode ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`} onClick={() => setFilter(mode)}>{mode}</button>)}
                </div>
                {visible.length ? <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">{isKo ? '적용' : 'Apply'}</th><th className="px-3 py-2 text-left">{isKo ? '행' : 'Row'}</th><th className="px-3 py-2 text-left">{isKo ? '필드' : 'Field'}</th><th className="px-3 py-2 text-left">{isKo ? '원본' : 'Original'}</th><th className="px-3 py-2 text-left">{isKo ? '제안값' : 'Suggested'}</th><th className="px-3 py-2 text-left">{isKo ? '이슈' : 'Issue'}</th><th className="px-3 py-2 text-left">{isKo ? '신뢰도' : 'Confidence'}</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{visible.slice(0, 200).map((proposal) => <tr key={proposal.id}><td className="px-3 py-2 align-top"><input type="checkbox" checked={proposal.apply} onChange={(event) => toggleProposal(proposal.id, event.target.checked)} /></td><td className="px-3 py-2 align-top">{proposal.rowIndex}</td><td className="px-3 py-2 align-top">{proposal.header}</td><td className="px-3 py-2 align-top">{proposal.originalValue}</td><td className="px-3 py-2 align-top">{proposal.suggestedValue}</td><td className="px-3 py-2 align-top">{proposal.issueType}</td><td className="px-3 py-2 align-top">{proposal.confidence.toFixed(2)}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-600">{isKo ? '표시할 제안이 없습니다.' : 'No visible proposals.'}</p>}
              </>
            ) : <p className="text-sm text-slate-600">{isKo ? '먼저 분석이 필요합니다.' : 'Analysis required first.'}</p>}
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'export' ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title={isKo ? '적용과 내보내기' : 'Apply and export'}>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-700">{isKo ? '원본 데이터는 세션 동안 유지됩니다.' : 'Raw data stays preserved in the session.'}</p><p className="mt-2 text-sm text-slate-700">{isKo ? '적용된 변경 수' : 'Applied changes'}: {appliedLog.length}</p></div>
              <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-medium">{isKo ? '프리셋 이름' : 'Preset name'}</label><input value={presetName} onChange={(event) => setPresetName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder={isKo ? '예: 인플루엔자 표준' : 'e.g. Influenza standard'} /><button type="button" className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={savePreset} disabled={!policy}>{isKo ? '프리셋 저장' : 'Save preset'}</button></div><div><p className="mb-1 text-sm font-medium">{isKo ? '저장된 프리셋' : 'Saved presets'}</p><div className="flex flex-wrap gap-2">{presets.map((preset) => <button key={preset.name} type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => applyPreset(preset.name)}>{preset.name}</button>)}</div></div></div>
              {analysis && appliedRows ? <div className="grid gap-2 sm:grid-cols-3"><button type="button" className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white" onClick={() => downloadText(`cleaned-${analysis.dataset.fileName}`, exportCleanedContent(analysis.dataset, appliedRows))}>{isKo ? '정리된 파일' : 'Cleaned file'}</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('change-log.json', changeLogToJson(appliedLog), 'application/json;charset=utf-8')}>JSON</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => downloadText('change-log.csv', changeLogToCsv(appliedLog), 'text/csv;charset=utf-8')}>CSV</button></div> : <p className="text-sm text-slate-600">{isKo ? '변경 적용 후 내보내기를 사용할 수 있습니다.' : 'Apply changes before exporting.'}</p>}
            </div>
          </SectionCard>
          <SectionCard title={isKo ? '결과 스냅샷' : 'Result Snapshot'}>
            {analysis && rows.length ? <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr>{analysis.dataset.headers.slice(0, 8).map((header) => <th key={header} className="px-3 py-2 text-left">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-200 bg-white">{rows.slice(0, 10).map((row) => <tr key={row.__rowIndex}>{analysis.dataset.headers.slice(0, 8).map((header) => <td key={`${row.__rowIndex}-${header}`} className="px-3 py-2">{String(row[header] ?? '')}</td>)}</tr>)}</tbody></table></div> : <p className="text-sm text-slate-600">{isKo ? '적용 결과가 여기에 표시됩니다.' : 'Applied rows appear here.'}</p>}
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}
