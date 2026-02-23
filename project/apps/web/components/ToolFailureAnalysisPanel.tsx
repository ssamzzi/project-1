"use client";

import { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { ValidationMessage } from '../lib/types';

type SupportedCalculatorId = 'pcr-master-mix' | 'ligation' | 'cell-seeding';

interface CauseItem {
  id: string;
  score: number;
  titleEn: string;
  titleKo: string;
  checkEn: string;
  checkKo: string;
  actionEn: string;
  actionKo: string;
}

interface AiCauseItem {
  priority: 'high' | 'medium' | 'low';
  cause: string;
  check: string;
  action: string;
}

const OPENAI_KEY_STORAGE_KEY = 'biolt-openai-key';
const OPENAI_MODEL = 'gpt-4.1-mini';

function isSupported(id: string): id is SupportedCalculatorId {
  return id === 'pcr-master-mix' || id === 'ligation' || id === 'cell-seeding';
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

function safeParseAiResult(raw: string): AiCauseItem[] {
  const parsed = JSON.parse(raw) as { causes?: AiCauseItem[] };
  if (!parsed.causes || !Array.isArray(parsed.causes)) return [];
  return parsed.causes
    .filter((c) => c && typeof c.cause === 'string' && typeof c.check === 'string' && typeof c.action === 'string')
    .slice(0, 5);
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
  if (!isSupported(calculatorId)) return null;

  const [observed, setObserved] = useState('');
  const [attemptedFix, setAttemptedFix] = useState('');
  const [results, setResults] = useState<CauseItem[]>([]);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(OPENAI_KEY_STORAGE_KEY) || '';
      setApiKey(stored);
    } catch {
      // ignore
    }
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
          lastRun: '마지막 분석',
          apiKeyLabel: 'OpenAI API Key',
          apiKeyHint: '브라우저 localStorage에만 저장됩니다.',
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
          lastRun: 'Last analysis',
          apiKeyLabel: 'OpenAI API Key',
          apiKeyHint: 'Stored only in browser localStorage.',
          aiError: 'AI call failed. Showing rule-based fallback.',
        };

  const validationHints = useMemo(() => validations.map((v) => `${v.code} ${v.message}`).join(' | '), [validations]);

  const runAnalysis = async (event: FormEvent) => {
    event.preventDefault();
    const combined = `${observed}\n${attemptedFix}\n${validationHints}`.trim();
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        throw new Error('NO_API_KEY');
      }
      try {
        window.localStorage.setItem(OPENAI_KEY_STORAGE_KEY, trimmedKey);
      } catch {
        // ignore
      }
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

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          input: [
            { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text:
                    `${locale === 'ko' ? '다음 데이터를 바탕으로 실패 원인분석을 해주세요.' : 'Analyze likely failure causes from this data.'}\n` +
                    `${locale === 'ko' ? '반드시 JSON만 출력:' : 'Return JSON only:'} {"causes":[{"priority":"high|medium|low","cause":"...","check":"...","action":"..."}]}\n` +
                    JSON.stringify(userPayload),
                },
              ],
            },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`OPENAI_${response.status}`);
      }
      const payload = (await response.json()) as { output_text?: string };
      const text = payload.output_text || '';
      const aiCauses = safeParseAiResult(text);
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
      }));
      setResults(normalized);
    } catch {
      let causes: CauseItem[] = [];
      if (calculatorId === 'pcr-master-mix') {
        causes = getPcrCauses(context.values, context.computed, combined);
      } else if (calculatorId === 'ligation') {
        causes = getLigationCauses(context.values, combined);
      } else if (calculatorId === 'cell-seeding') {
        causes = getCellSeedingCauses(context.values, combined);
      }
      causes.sort((a, b) => b.score - a.score);
      setResults(causes.slice(0, 5));
      setAnalysisError(labels.aiError);
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
          {labels.apiKeyLabel}
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            className="mt-1 h-10 w-full rounded border border-slate-300 px-2"
            placeholder="sk-..."
          />
          <span className="mt-1 block text-[11px] text-slate-500">{labels.apiKeyHint}</span>
        </label>
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
              {labels.check}: {locale === 'ko' ? item.checkKo : item.checkEn}
            </p>
            <p className="mt-1 text-slate-600">
              {labels.action}: {locale === 'ko' ? item.actionKo : item.actionEn}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
