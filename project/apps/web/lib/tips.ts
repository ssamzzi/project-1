import type { CalculatorTip, TipTab, TipTrigger } from './types';

export type TipFieldSource = Record<string, unknown>;

export interface TipContext {
  values: TipFieldSource;
  computed: TipFieldSource;
}

export function matchesTrigger(trigger: TipTrigger, context: TipContext): boolean {
  const getValue = (path: string): unknown => {
    const direct = (context.values as Record<string, unknown>)[path];
    if (direct !== undefined) return direct;
    return (context.computed as Record<string, unknown>)[path];
  };

  const lhs = getValue(trigger.field);

  if (trigger.op === 'exists') {
    return lhs !== undefined && lhs !== null && lhs !== '';
  }

  const rhs = trigger.value;
  if (lhs === undefined || lhs === null) return false;

  if (typeof lhs === 'number' && (typeof rhs === 'number' || rhs === undefined)) {
    if (rhs === undefined) return false;
    if (trigger.op === '<') return lhs < rhs;
    if (trigger.op === '<=') return lhs <= rhs;
    if (trigger.op === '>') return lhs > rhs;
    if (trigger.op === '>=') return lhs >= rhs;
    if (trigger.op === '==') return lhs === rhs;
    if (trigger.op === '!=') return lhs !== rhs;
  }

  if (typeof lhs === 'string' && typeof rhs === 'string') {
    if (trigger.op === '==') return lhs === rhs;
    if (trigger.op === '!=') return lhs !== rhs;
  }

  return false;
}

export function applyTips(
  tips: CalculatorTip[],
  activeTab: TipTab,
  context: TipContext
): CalculatorTip[] {
  const base = tips.filter((tip) => tip.tab === activeTab && !tip.triggers?.length);
  const triggered = tips
    .filter((tip) => tip.tab === activeTab && !!tip.triggers?.length)
    .filter((tip) => tip.triggers!.every((trigger) => matchesTrigger(trigger, context)));

  const rank: Record<string, number> = { critical: 3, warn: 2, info: 1 };
  return [...base, ...triggered].sort((a, b) => rank[b.severity] - rank[a.severity]);
}
