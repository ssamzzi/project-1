import type { AnalysisResult, FieldPolicy, NormalizationPolicy } from './types';

function defaultFieldPolicy(strategy: FieldPolicy['strategy']): FieldPolicy {
  return {
    enabled: strategy !== 'skip',
    strategy,
    trimWhitespace: true,
    collapseWhitespace: true,
    normalizeSeparators: true,
    normalizeCasing: strategy !== 'preserve',
    normalizeDates: strategy === 'canonicalize-safe' ? 'normalize-unambiguous' : strategy === 'review-only' ? 'review-ambiguous' : 'preserve',
    applyControlledVocabulary: strategy === 'canonicalize-safe' ? 'safe-only' : strategy === 'canonicalize-with-review' ? 'with-review' : 'off',
    customMappings: {},
  };
}

export function buildDefaultPolicy(analysis: AnalysisResult): NormalizationPolicy {
  const fieldPolicies: Record<string, FieldPolicy> = {};
  analysis.recommendations.forEach((recommendation) => {
    fieldPolicies[recommendation.header] = defaultFieldPolicy(recommendation.recommendedStrategy as FieldPolicy['strategy']);
  });
  return { fieldPolicies };
}
