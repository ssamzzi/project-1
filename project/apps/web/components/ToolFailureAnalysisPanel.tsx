"use client";

import { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { ValidationMessage } from '../lib/types';
import { useAdmin } from '../lib/context/AdminContext';
import { AI_DEBUG_STORAGE_KEY, AI_MODEL_STORAGE_KEY, AI_TOKEN_STORAGE_KEY, HF_MODEL } from '../lib/ai/config';

interface CauseItem {
  id: string;
  score: number;
  titleEn: string;
  titleKo: string;
  checkEn: string;
  checkKo: string;
  actionEn: string;
  actionKo: string;
  confidence: number;
  evidenceEn: string;
  evidenceKo: string;
}

interface AiCauseItem {
  priority: 'high' | 'medium' | 'low';
  cause: string;
  check: string;
  action: string;
}
interface HuggingFaceInferencePayload {
  generated_text?: string;
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
}
interface HuggingFaceErrorPayload {
  error?: string | { message?: string };
  estimated_time?: number;
}

function includesAny(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function addOrUpdate(map: Map<string, CauseItem>, item: CauseItem) {
  const existing = map.get(item.id);
  if (!existing || item.score > existing.score) {
    map.set(item.id, item);
    return;
  }
  map.set(item.id, { ...existing, score: Math.max(existing.score, item.score) });
}

function getPcrCauses(values: Record<string, unknown>, computed: Record<string, unknown>, observed: string): CauseItem[] {
  const causes = new Map<string, CauseItem>();
  const primerFinal = Number(values.primerFinal ?? 0);
  const reactionVolume = Number(values.reactionVolume ?? 0);
  const overageValue = Number(values.overageValue ?? 0);
  const includeTemplate = Boolean(values.includeTemplate ?? false);
  const waterNegative = Boolean(computed.waterNegative ?? false);

  if (waterNegative) {
    addOrUpdate(causes, {
      id: 'pcr-water-negative',
      score: 95,
      titleEn: 'Master mix composition overflow',
      titleKo: 'Master mix 조성 부피 초과',
      checkEn: 'Confirm summed component volumes do not exceed reaction volume.',
      checkKo: '각 component 부피 합이 reaction volume을 넘지 않는지 확인하세요.',
      actionEn: 'Reduce primer/probe volume or increase reaction volume.',
      actionKo: 'primer/probe 부피를 줄이거나 reaction volume을 늘리세요.',
      confidence: 92,
      evidenceEn: 'Calculated total component volume exceeded configured reaction volume.',
      evidenceKo: '계산된 component 총량이 설정된 reaction volume을 초과했습니다.',
    });
  }
  if (primerFinal > 0.8) {
    addOrUpdate(causes, {
      id: 'pcr-primer-high',
      score: 82,
      titleEn: 'Primer concentration too high',
      titleKo: 'Primer 농도가 높음',
      checkEn: 'Verify final primer concentration in each reaction.',
      checkKo: '반응당 최종 primer 농도를 확인하세요.',
      actionEn: 'Lower primer concentration and raise annealing temperature.',
      actionKo: 'primer 농도를 낮추고 annealing temperature를 높이세요.',
      confidence: 82,
      evidenceEn: 'Final primer concentration is above practical range.',
      evidenceKo: '최종 primer 농도가 실무 권장 범위를 초과했습니다.',
    });
  }
  if (!includeTemplate) {
    addOrUpdate(causes, {
      id: 'pcr-template-missing',
      score: 90,
      titleEn: 'Template not included in reaction setup',
      titleKo: 'Template 미포함',
      checkEn: 'Check whether template volume was excluded in setup.',
      checkKo: 'setup에서 template volume이 빠졌는지 확인하세요.',
      actionEn: 'Include template and re-run with a positive control.',
      actionKo: 'template을 포함하고 positive control과 함께 다시 실행하세요.',
      confidence: 88,
      evidenceEn: 'Template inclusion flag is disabled in current setup.',
      evidenceKo: '현재 설정에서 template 포함 옵션이 꺼져 있습니다.',
    });
  }
  if (overageValue <= 0) {
    addOrUpdate(causes, {
      id: 'pcr-overage-low',
      score: 70,
      titleEn: 'No overage for pipetting loss',
      titleKo: 'pipetting loss 보정 없음',
      checkEn: 'Check if overage was set to zero.',
      checkKo: 'overage를 0으로 설정했는지 확인하세요.',
      actionEn: 'Use 10-20% overage to stabilize reaction consistency.',
      actionKo: '10-20% overage를 적용해 반응 일관성을 높이세요.',
      confidence: 70,
      evidenceEn: 'No overage margin detected for pipetting variability.',
      evidenceKo: 'pipetting 변동 대비 overage 보정이 없습니다.',
    });
  }
  if (reactionVolume > 0 && reactionVolume < 10) {
    addOrUpdate(causes, {
      id: 'pcr-low-volume',
      score: 66,
      titleEn: 'Reaction volume too small for stable pipetting',
      titleKo: 'reaction volume이 너무 작음',
      checkEn: 'Review whether critical components are below 1 µL.',
      checkKo: '핵심 component가 1 µL 미만인지 확인하세요.',
      actionEn: 'Increase reaction volume or use more concentrated stocks.',
      actionKo: 'reaction volume을 늘리거나 stock 농도를 조정하세요.',
      confidence: 66,
      evidenceEn: 'Critical pipetting volumes likely below stable handling range.',
      evidenceKo: '핵심 분주량이 안정적인 취급 범위보다 작을 가능성이 큽니다.',
    });
  }

  if (includesAny(observed, ['no band', '밴드 없음', 'no amplification', '증폭 안'])) {
    addOrUpdate(causes, {
      id: 'pcr-no-amplification',
      score: 88,
      titleEn: 'Thermal condition or template quality issue',
      titleKo: '열순환 조건 또는 template 품질 문제',
      checkEn: 'Check annealing temperature and template integrity.',
      checkKo: 'annealing temperature와 template integrity를 확인하세요.',
      actionEn: 'Run gradient PCR and include positive control template.',
      actionKo: 'gradient PCR를 실행하고 positive control template을 포함하세요.',
      confidence: 80,
      evidenceEn: 'Observed notes indicate no amplification pattern.',
      evidenceKo: '관찰 기록에 증폭 실패 패턴이 포함되어 있습니다.',
    });
  }
  return [...causes.values()];
}

function getLigationCauses(values: Record<string, unknown>, observed: string): CauseItem[] {
  const causes = new Map<string, CauseItem>();
  const ratio = Number(values.ratio ?? 0);
  const vectorLength = Number(values.vectorLength ?? 0);
  const insertLength = Number(values.insertLength ?? 0);

  if (ratio < 1 || ratio > 8) {
    addOrUpdate(causes, {
      id: 'lig-ratio',
      score: 88,
      titleEn: 'Insert:vector molar ratio outside common range',
      titleKo: 'Insert:vector molar ratio 범위 이탈',
      checkEn: 'Confirm ratio target is within 3:1 to 5:1 for standard ligation.',
      checkKo: '표준 ligation에서 ratio가 3:1~5:1인지 확인하세요.',
      actionEn: 'Set ratio to 3:1 or 5:1 and compare colony yield.',
      actionKo: 'ratio를 3:1 또는 5:1로 설정해 colony yield를 비교하세요.',
      confidence: 84,
      evidenceEn: 'Input molar ratio is outside common ligation window.',
      evidenceKo: '입력된 molar ratio가 일반적인 ligation 범위를 벗어났습니다.',
    });
  }
  if (vectorLength <= 0 || insertLength <= 0) {
    addOrUpdate(causes, {
      id: 'lig-length',
      score: 92,
      titleEn: 'Invalid DNA length input',
      titleKo: 'DNA length 입력 오류',
      checkEn: 'Check vector/insert length values and unit (bp).',
      checkKo: 'vector/insert length 값과 단위(bp)를 확인하세요.',
      actionEn: 'Use exact construct sizes from sequence files.',
      actionKo: 'sequence 파일의 정확한 길이로 재입력하세요.',
      confidence: 90,
      evidenceEn: 'Vector or insert length input is missing/invalid.',
      evidenceKo: 'vector 또는 insert length 입력값이 누락되었거나 유효하지 않습니다.',
    });
  }
  if (includesAny(observed, ['no colony', '콜로니 없음', 'few colony', '콜로니 적'])) {
    addOrUpdate(causes, {
      id: 'lig-efficiency',
      score: 90,
      titleEn: 'Ligation efficiency or transform competency issue',
      titleKo: 'ligation 효율 또는 transformation competency 문제',
      checkEn: 'Check ligase/buffer freshness and competent cell efficiency.',
      checkKo: 'ligase/buffer 상태와 competent cell 효율을 확인하세요.',
      actionEn: 'Increase insert ratio and include vector-only control.',
      actionKo: 'insert ratio를 높이고 vector-only control을 함께 사용하세요.',
      confidence: 82,
      evidenceEn: 'Observed result mentions colony failure pattern.',
      evidenceKo: '관찰 결과에 colony 실패 패턴이 포함되어 있습니다.',
    });
  }
  return [...causes.values()];
}

function getCellSeedingCauses(values: Record<string, unknown>, observed: string): CauseItem[] {
  const causes = new Map<string, CauseItem>();
  const targetDensity = Number(values.targetDensity ?? 0);
  const cellConcentration = Number(values.cellConcentration ?? 0);
  const overagePercent = Number(values.overagePercent ?? 0);
  const mode = String(values.mode ?? 'cells/well');

  if (cellConcentration <= 0) {
    addOrUpdate(causes, {
      id: 'cell-conc',
      score: 95,
      titleEn: 'Invalid starting cell concentration',
      titleKo: '시작 cell concentration 오류',
      checkEn: 'Verify cell count and dilution factor before seeding.',
      checkKo: 'seeding 전 cell count와 dilution factor를 확인하세요.',
      actionEn: 'Recount with hemocytometer and rebuild seeding mix.',
      actionKo: 'hemocytometer로 재계수 후 seeding mix를 다시 구성하세요.',
      confidence: 91,
      evidenceEn: 'Starting cell concentration is zero or invalid.',
      evidenceKo: '시작 cell concentration 값이 0이거나 유효하지 않습니다.',
    });
  }
  if (mode === 'cells/cm²' && (targetDensity < 1e3 || targetDensity > 5e5)) {
    addOrUpdate(causes, {
      id: 'cell-density-cm2',
      score: 80,
      titleEn: 'Target density is likely out of practical range',
      titleKo: 'target density가 실무 범위를 벗어남',
      checkEn: 'Review recommended cell density for your specific cell line.',
      checkKo: '해당 cell line 권장 density 범위를 확인하세요.',
      actionEn: 'Adjust density and re-plate with matched growth phase cells.',
      actionKo: 'density를 조정하고 growth phase가 맞는 세포로 재시딩하세요.',
      confidence: 78,
      evidenceEn: 'Target density appears outside practical range for cells/cm² mode.',
      evidenceKo: 'cells/cm² 모드에서 target density가 실무 범위를 벗어납니다.',
    });
  }
  if (overagePercent < 5) {
    addOrUpdate(causes, {
      id: 'cell-overage',
      score: 68,
      titleEn: 'Low overage can cause final volume shortage',
      titleKo: '낮은 overage로 최종 volume 부족 가능',
      checkEn: 'Check if suspension ended before finishing all wells.',
      checkKo: '모든 well 분주 전에 현탁액이 부족했는지 확인하세요.',
      actionEn: 'Set overage to at least 10%.',
      actionKo: 'overage를 최소 10%로 설정하세요.',
      confidence: 68,
      evidenceEn: 'Low overage increases risk of final suspension shortage.',
      evidenceKo: 'overage가 낮아 최종 현탁액 부족 위험이 큽니다.',
    });
  }
  if (includesAny(observed, ['clump', '뭉침', 'uneven', '불균일', 'edge'])) {
    addOrUpdate(causes, {
      id: 'cell-distribution',
      score: 86,
      titleEn: 'Cell distribution issue during plating',
      titleKo: '분주 중 cell 분포 문제',
      checkEn: 'Check whether suspension was mixed immediately before plating.',
      checkKo: '분주 직전 현탁액을 충분히 혼합했는지 확인하세요.',
      actionEn: 'Mix gently before every dispense and settle plate with cross motion.',
      actionKo: '매 분주 전에 부드럽게 혼합하고 plate를 십자 방향으로 정리하세요.',
      confidence: 80,
      evidenceEn: 'Observed notes indicate clumping/uneven distribution.',
      evidenceKo: '관찰 기록에 뭉침/불균일 분포가 포함되어 있습니다.',
    });
  }
  return [...causes.values()];
}

function getGenericCauses(calculatorId: string, validations: ValidationMessage[], observed: string): CauseItem[] {
  const causes = new Map<string, CauseItem>();
  const normalizedObserved = observed.toLowerCase();
  if (validations.length > 0) {
    addOrUpdate(causes, {
      id: 'generic-validation',
      score: 80,
      titleEn: 'Input/constraint warnings were detected',
      titleKo: '입력값/제약조건 경고가 감지됨',
      checkEn: validations.map((v) => `${v.code}: ${v.message}`).slice(0, 2).join(' | '),
      checkKo: validations.map((v) => `${v.code}: ${v.message}`).slice(0, 2).join(' | '),
      actionEn: 'Resolve warnings first, then re-run with one-variable change.',
      actionKo: '경고를 먼저 해소한 뒤 변수 하나만 바꿔 재실행하세요.',
      confidence: 78,
      evidenceEn: 'Validation layer reported input constraints/warnings.',
      evidenceKo: 'Validation 단계에서 입력 제약/경고가 감지되었습니다.',
    });
  }
  if (includesAny(normalizedObserved, ['no band', '밴드 없음', 'no signal', '신호 없음', 'no colony', '콜로니 없음'])) {
    addOrUpdate(causes, {
      id: 'generic-no-result',
      score: 78,
      titleEn: 'Expected experimental signal was not detected',
      titleKo: '예상 실험 신호가 검출되지 않음',
      checkEn: 'Check positive control and critical reagent integrity/expiry.',
      checkKo: 'positive control과 핵심 reagent의 상태/유효기간을 확인하세요.',
      actionEn: 'Re-run with positive/negative controls and fresh key reagents.',
      actionKo: 'positive/negative control과 새 핵심 reagent로 재실행하세요.',
      confidence: 74,
      evidenceEn: 'Observed notes indicate missing expected signal output.',
      evidenceKo: '관찰 기록에서 예상 신호 미검출 패턴이 확인됩니다.',
    });
  }
  if (includesAny(normalizedObserved, ['smear', 'smeared', '끌림', '번짐', 'noisy', '노이즈'])) {
    addOrUpdate(causes, {
      id: 'generic-quality',
      score: 72,
      titleEn: 'Signal quality or loading condition issue',
      titleKo: '신호 품질 또는 로딩 조건 문제',
      checkEn: 'Verify sample quality, loading amount, and instrument/runtime condition.',
      checkKo: 'sample quality, loading 양, 장비/런 조건을 확인하세요.',
      actionEn: 'Reduce load, standardize runtime conditions, and repeat with controls.',
      actionKo: '로딩량을 줄이고 런 조건을 표준화해 control과 함께 반복하세요.',
      confidence: 70,
      evidenceEn: 'Observed notes indicate smear/noise quality issue.',
      evidenceKo: '관찰 기록에서 smear/noise 품질 문제가 확인됩니다.',
    });
  }
  if (causes.size === 0) {
    addOrUpdate(causes, {
      id: `generic-${calculatorId}`,
      score: 65,
      titleEn: 'General setup mismatch likely',
      titleKo: '일반적인 setup 불일치 가능성',
      checkEn: 'Compare current setup against SOP checklist and control setup.',
      checkKo: '현재 setup을 SOP 체크리스트 및 control setup과 비교하세요.',
      actionEn: 'Change one variable at a time and capture run conditions in log.',
      actionKo: '변수를 한 번에 하나만 변경하고 실행 조건을 로그로 남기세요.',
      confidence: 65,
      evidenceEn: 'No strong pattern found; generic setup mismatch is plausible.',
      evidenceKo: '강한 패턴이 없어 일반 setup 불일치 가능성이 있습니다.',
    });
  }
  return [...causes.values()];
}

function getPriorityLabel(score: number, locale: 'en' | 'ko') {
  if (score >= 88) return locale === 'ko' ? '높음' : 'High';
  if (score >= 72) return locale === 'ko' ? '중간' : 'Medium';
  return locale === 'ko' ? '낮음' : 'Low';
}

function scoreFromPriority(priority: string) {
  if (priority === 'high') return 90;
  if (priority === 'medium') return 78;
  return 60;
}

function confidenceFromScore(score: number) {
  return Math.max(50, Math.min(95, Math.round(score)));
}

function safeParseAiResult(raw: string): AiCauseItem[] {
  let parsed: { causes?: AiCauseItem[] } | null = null;
  try {
    parsed = JSON.parse(raw) as { causes?: AiCauseItem[] };
  } catch {
    return [];
  }
  if (!parsed) return [];
  if (!parsed.causes || !Array.isArray(parsed.causes)) return [];
  return parsed.causes
    .filter((c) => c && typeof c.cause === 'string' && typeof c.check === 'string' && typeof c.action === 'string')
    .slice(0, 5);
}

function parsePartialJsonAiResult(raw: string): AiCauseItem[] {
  const compact = raw.replace(/\s+/g, ' ').trim();
  if (!compact.includes('"causes"') && !compact.includes("'causes'")) return [];
  const entries: AiCauseItem[] = [];
  const chunks = compact.split(/\{(?=\s*"priority"\s*:)/g).slice(1);
  for (const chunk of chunks) {
    const text = `{${chunk}`;
    const priorityMatch = text.match(/"priority"\s*:\s*"(high|medium|low)"/i);
    const causeMatch = text.match(/"cause"\s*:\s*"([^"]+)/i);
    const checkMatch = text.match(/"check"\s*:\s*"([^"]+)/i);
    const actionMatch = text.match(/"action"\s*:\s*"([^"]+)/i);
    const cause = (causeMatch?.[1] || '').trim();
    if (!cause) continue;
    entries.push({
      priority: (priorityMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      cause,
      check: (checkMatch?.[1] || '').trim(),
      action: (actionMatch?.[1] || '').trim(),
    });
  }
  return entries.slice(0, 5);
}

function parsePlainTextAiResult(raw: string, locale: 'en' | 'ko'): AiCauseItem[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, ''))
    .map((line) => line.replace(/[{}[\]"]/g, '').trim())
    .filter((line) => line.length > 8 && !/^\s*(priority|cause|check|action|causes)\s*[:=]/i.test(line));
  if (!lines.length) return [];
  const top = lines.slice(0, 3);
  const checkText =
    locale === 'ko' ? 'control sample과 setup 기록으로 해당 원인을 확인하세요.' : 'Confirm this issue with control samples and setup logs.';
  const actionText =
    locale === 'ko' ? '변수를 하나만 바꿔서 control과 함께 재실행하세요.' : 'Apply one variable change and re-run with control.';
  return top.map((line) => ({
    priority: 'medium',
    cause: line.slice(0, 180),
    check: checkText,
    action: actionText,
  }));
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

function extractHfText(payload: unknown): string {
  if (Array.isArray(payload)) {
    const first = payload[0] as HuggingFaceInferencePayload | undefined;
    return first?.generated_text || '';
  }
  const one = payload as HuggingFaceInferencePayload | HuggingFaceErrorPayload;
  if ('choices' in one && Array.isArray(one.choices)) {
    const firstChoice = one.choices[0];
    const content = firstChoice?.message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      const joined = content
        .map((part) => (typeof part?.text === 'string' ? part.text : ''))
        .filter(Boolean)
        .join('\n')
        .trim();
      if (joined) return joined;
    }
  }
  if ('generated_text' in one && typeof one.generated_text === 'string') return one.generated_text;
  return '';
}

function extractHfError(payload: unknown): { message: string; estimatedTimeSec?: number } | null {
  if (!payload || typeof payload !== 'object') return null;
  const maybe = payload as HuggingFaceErrorPayload;
  let message = '';
  if (typeof maybe.error === 'string') {
    message = maybe.error;
  } else if (maybe.error && typeof maybe.error === 'object' && typeof maybe.error.message === 'string') {
    message = maybe.error.message;
  }
  if (!message.trim()) return null;
  const time = typeof maybe.estimated_time === 'number' ? maybe.estimated_time : undefined;
  return { message: message.trim(), estimatedTimeSec: time };
}

function parseJsonSafe(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function toErrorMessage(status: number, detail: string, locale: 'en' | 'ko') {
  if (status === 401 || status === 403) {
    return locale === 'ko'
      ? `Hugging Face Token 권한 오류(${status}): Inference 권한이 있는지 확인하세요. ${detail}`
      : `Hugging Face token permission error (${status}): check Inference access. ${detail}`;
  }
  if (status === 429) {
    return locale === 'ko'
      ? `요청 제한(429): 잠시 후 다시 시도하세요. ${detail}`
      : `Rate limited (429): try again later. ${detail}`;
  }
  if (status === 503) {
    return locale === 'ko'
      ? `모델 준비 중(503): 잠시 후 다시 시도하세요. ${detail}`
      : `Model is loading (503): try again shortly. ${detail}`;
  }
  return locale === 'ko' ? `AI 호출 실패(${status}): ${detail}` : `AI call failed (${status}): ${detail}`;
}

function toNetworkErrorMessage(locale: 'en' | 'ko') {
  return locale === 'ko'
    ? '네트워크 호출 실패(Failed to fetch): 브라우저 확장프로그램(광고/추적 차단), 회사/학교 방화벽, 또는 CORS 차단 가능성이 큽니다. 다른 브라우저/시크릿 모드로 다시 시도하세요.'
    : 'Network request failed (Failed to fetch): likely blocked by browser extension, firewall, or CORS policy. Retry in another browser or incognito mode.';
}

function decodeHeaderPreview(value: string | null) {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function ToolFailureAnalysisPanel({
  calculatorId,
  locale,
  context,
  validations,
}: {
  calculatorId: string;
  locale: 'en' | 'ko';
  context: { values: Record<string, unknown>; computed: Record<string, unknown> };
  validations: ValidationMessage[];
}) {
  const { isAdmin } = useAdmin();
  const [observed, setObserved] = useState('');
  const [attemptedFix, setAttemptedFix] = useState('');
  const [results, setResults] = useState<CauseItem[]>([]);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(HF_MODEL);
  const [debugMode, setDebugMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisDebug, setAnalysisDebug] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AI_TOKEN_STORAGE_KEY) || '';
      setApiKey(stored);
      setModel(window.localStorage.getItem(AI_MODEL_STORAGE_KEY) || HF_MODEL);
      setDebugMode(window.localStorage.getItem(AI_DEBUG_STORAGE_KEY) === 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const syncKey = () => {
      try {
        const stored = window.localStorage.getItem(AI_TOKEN_STORAGE_KEY) || '';
        setApiKey(stored);
        setModel(window.localStorage.getItem(AI_MODEL_STORAGE_KEY) || HF_MODEL);
        setDebugMode(window.localStorage.getItem(AI_DEBUG_STORAGE_KEY) === 'true');
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', syncKey);
    window.addEventListener('biolt-ai-key-change', syncKey);
    return () => {
      window.removeEventListener('storage', syncKey);
      window.removeEventListener('biolt-ai-key-change', syncKey);
    };
  }, []);

  const labels =
    locale === 'ko'
      ? {
          title: 'AI 실패 원인분석',
          observed: '관찰된 실패 결과',
          attempted: '이미 시도한 수정',
          run: '원인분석 실행',
          empty: '실패 결과를 입력하면 원인 후보를 제안합니다.',
          priority: '우선순위',
          check: '확인할 항목',
          action: '즉시 수정안',
          confidence: '신뢰도',
          evidence: '근거',
          checklist: '재실행 체크리스트',
          lastRun: '마지막 분석',
          apiKeyMissing: '토큰이 없습니다. 관리자 토큰 또는 서버 환경변수(HF_API_TOKEN)를 설정해 주세요.',
          aiError: 'AI 호출 실패, 규칙기반 분석 결과로 대체했습니다.',
        }
      : {
          title: 'AI Failure Analysis',
          observed: 'Observed failed result',
          attempted: 'Fixes already attempted',
          run: 'Run analysis',
          empty: 'Enter failed outcomes to get probable causes.',
          priority: 'Priority',
          check: 'Check',
          action: 'Immediate action',
          confidence: 'Confidence',
          evidence: 'Evidence',
          checklist: 'Rerun checklist',
          lastRun: 'Last analysis',
          apiKeyMissing: 'No token found. Set admin token or server env HF_API_TOKEN.',
          aiError: 'AI call failed. Showing rule-based fallback.',
        };

  const validationHints = useMemo(() => validations.map((v) => `${v.code} ${v.message}`).join(' | '), [validations]);

  const runAnalysis = async (event: FormEvent) => {
    event.preventDefault();
    const combined = `${observed}\n${attemptedFix}\n${validationHints}`.trim();
    const trimmedKey = apiKey.trim();
    const trimmedModel = model.trim() || HF_MODEL;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisDebug('');
    try {
      const systemPrompt =
        locale === 'ko'
          ? '당신은 분자생물학/세포생물학 실험 실패 원인을 분석하는 도우미입니다. 과장 없이 간결하게, 재현 가능한 점검 항목을 제시하세요.'
          : 'You analyze molecular/cell biology experiment failures. Be concise and actionable, and provide reproducible checks.';
      const userPayload = {
        calculatorId,
        observedFailure: observed,
        attemptedFix,
        validationHints,
        calculatorValues: context.values,
        computedSignals: context.computed,
        responseLocale: locale,
      };

      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: trimmedKey,
          model: trimmedModel,
          payload: {
            inputs:
              `${systemPrompt}\n` +
              `${locale === 'ko' ? '다음 데이터를 바탕으로 실패 원인분석을 해주세요.' : 'Analyze likely failure causes from this data.'}\n` +
              `${locale === 'ko' ? '반드시 JSON만 출력:' : 'Return JSON only:'} {"causes":[{"priority":"high|medium|low","cause":"...","check":"...","action":"..."}]}\n` +
              JSON.stringify(userPayload),
            parameters: {
              max_new_tokens: 700,
              temperature: 0.2,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
              use_cache: false,
            },
          },
        }),
      });
      const rawResponse = await response.text();
      const payload = parseJsonSafe(rawResponse);
      const usedModel = response.headers.get('x-biolt-ai-model') || HF_MODEL;
      const upstreamStatus = response.headers.get('x-biolt-upstream-status') || String(response.status);
      const upstreamPreview = decodeHeaderPreview(response.headers.get('x-biolt-ai-preview'));
      if (!response.ok) {
        const hfError = extractHfError(payload);
        const detail = hfError
          ? hfError.estimatedTimeSec
            ? `${hfError.message} (estimated ${Math.ceil(hfError.estimatedTimeSec)}s)`
            : hfError.message
          : rawResponse.slice(0, 220) || 'Unknown response';
        throw new Error(toErrorMessage(response.status, detail, locale));
      }
      if (!payload) {
        throw new Error(locale === 'ko' ? 'AI 응답 파싱 실패: JSON 형식이 아닙니다.' : 'AI response parse failed: not valid JSON.');
      }
      const rawText = extractHfText(payload);
      const text = extractJsonText(rawText);
      let aiCauses = safeParseAiResult(text);
      if (!aiCauses.length) {
        aiCauses = parsePartialJsonAiResult(rawText);
      }
      if (!aiCauses.length) {
        aiCauses = parsePlainTextAiResult(rawText, locale);
      }
      if (!aiCauses.length) {
        throw new Error('AI_PARSE');
      }
      const normalized = aiCauses.map((item, index) => ({
        id: `ai-${index}-${item.priority}`,
        score: scoreFromPriority(item.priority),
        titleEn: item.cause,
        titleKo: item.cause,
        checkEn: item.check,
        checkKo: item.check,
        actionEn: item.action,
        actionKo: item.action,
        confidence: confidenceFromScore(scoreFromPriority(item.priority)),
        evidenceEn: `Observed: ${observed || 'n/a'} | Validation: ${validationHints || 'n/a'}`,
        evidenceKo: `관찰: ${observed || 'n/a'} | 검증: ${validationHints || 'n/a'}`,
      }));
      setResults(normalized);
      if (debugMode && isAdmin) {
        setAnalysisDebug(`model=${usedModel} status=${upstreamStatus} preview=${upstreamPreview.slice(0, 220)}`);
      }
    } catch (error) {
      let causes: CauseItem[] = [];
      if (calculatorId === 'pcr-master-mix') causes = getPcrCauses(context.values, context.computed, combined);
      else if (calculatorId === 'ligation') causes = getLigationCauses(context.values, combined);
      else if (calculatorId === 'cell-seeding') causes = getCellSeedingCauses(context.values, combined);
      else causes = getGenericCauses(calculatorId, validations, combined);
      causes.sort((a, b) => b.score - a.score);
      setResults(causes.slice(0, 5));
      if (error instanceof TypeError && /failed to fetch/i.test(error.message)) {
        setAnalysisError(toNetworkErrorMessage(locale));
      } else if (error instanceof Error && /Missing Hugging Face token/i.test(error.message)) {
        setAnalysisError(labels.apiKeyMissing);
      } else if (error instanceof Error && error.message.startsWith('AI_PARSE')) {
        setAnalysisError(labels.aiError);
      } else if (error instanceof Error && error.message) {
        setAnalysisError(error.message);
      } else {
        setAnalysisError(labels.aiError);
      }
      if (debugMode && isAdmin) {
        const fallbackMessage = error instanceof Error ? error.message : 'Unknown error';
        setAnalysisDebug(`fallback=true model=${trimmedModel} error=${fallbackMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
    setLastAnalyzedAt(Date.now());
  };

  return (
    <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-medium">{labels.title}</h3>
      <form className="space-y-2" onSubmit={runAnalysis}>
        <label className="block text-xs text-slate-700">
          {labels.observed}
          <textarea
            value={observed}
            onChange={(event) => setObserved(event.target.value)}
            className="mt-1 min-h-[72px] w-full rounded border border-slate-300 px-2 py-1"
            placeholder={locale === 'ko' ? '예: 밴드가 없고 negative control에도 약한 신호가 나옴' : 'e.g. no band and weak signal in negative control'}
          />
        </label>
        <label className="block text-xs text-slate-700">
          {labels.attempted}
          <textarea
            value={attemptedFix}
            onChange={(event) => setAttemptedFix(event.target.value)}
            className="mt-1 min-h-[56px] w-full rounded border border-slate-300 px-2 py-1"
            placeholder={locale === 'ko' ? '예: annealing temperature +2C, primer 농도 감소' : 'e.g. +2C annealing temp, lower primer concentration'}
          />
        </label>
        <button type="submit" className="rounded bg-slate-900 px-2 py-1.5 text-xs text-white" disabled={isAnalyzing}>
          {isAnalyzing ? (locale === 'ko' ? '분석 중...' : 'Analyzing...') : labels.run}
        </button>
      </form>
      {analysisError ? <p className="text-xs text-amber-600">{analysisError}</p> : null}
      {analysisDebug && debugMode && isAdmin ? <p className="text-[11px] text-slate-500">{analysisDebug}</p> : null}
      {lastAnalyzedAt ? (
        <p className="text-[11px] text-slate-500">
          {labels.lastRun}: {new Date(lastAnalyzedAt).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      ) : null}
      {results.length === 0 ? <p className="text-xs text-slate-500">{labels.empty}</p> : null}
      <div className="space-y-2">
        {results.map((item) => (
          <article key={item.id} className="rounded border border-slate-200 p-2 text-xs">
            <p className="font-medium text-slate-800">{locale === 'ko' ? item.titleKo : item.titleEn}</p>
            <p className="mt-1 text-slate-600">
              {labels.priority}: {getPriorityLabel(item.score, locale)}
            </p>
            <p className="mt-1 text-slate-600">
              {labels.confidence}: {item.confidence}%
            </p>
            <p className="mt-1 text-slate-600">
              {labels.evidence}: {locale === 'ko' ? item.evidenceKo : item.evidenceEn}
            </p>
            <p className="mt-1 text-slate-600">
              {labels.check}: {locale === 'ko' ? item.checkKo : item.checkEn}
            </p>
            <p className="mt-1 text-slate-600">
              {labels.action}: {locale === 'ko' ? item.actionKo : item.actionEn}
            </p>
            <p className="mt-1 text-slate-600">
              {labels.checklist}: 1) {locale === 'ko' ? item.checkKo : item.checkEn} 2) {locale === 'ko' ? item.actionKo : item.actionEn} 3){' '}
              {locale === 'ko' ? 'control과 함께 재실행' : 'Re-run with controls'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
