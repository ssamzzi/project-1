import type { AnalysisResult, FieldPolicy, NormalizationPolicy } from './types';
import { detectPresetName, GISAID_RAW_PRESET, isDemographicHeader, isImportantIdentifierHeader, isPreserveHeavyHeader } from './presets';

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

function applyPresetAdjustments(header: string, policy: FieldPolicy, presetName?: string): FieldPolicy {
  if (presetName !== GISAID_RAW_PRESET) return policy;
  if (isImportantIdentifierHeader(header)) {
    return {
      ...policy,
      enabled: true,
      strategy: 'review-only',
      normalizeSeparators: false,
      normalizeCasing: false,
      normalizeDates: 'preserve',
      applyControlledVocabulary: 'off',
    };
  }
  if (isPreserveHeavyHeader(header)) {
    return {
      ...policy,
      enabled: false,
      strategy: 'skip',
      normalizeSeparators: false,
      normalizeCasing: false,
      normalizeDates: 'preserve',
      applyControlledVocabulary: 'off',
    };
  }
  if (/subtype/i.test(header)) {
    return {
      ...policy,
      normalizeSeparators: false,
      normalizeCasing: false,
    };
  }
  if (isDemographicHeader(header)) {
    return {
      ...policy,
      enabled: false,
      strategy: 'skip',
      normalizeSeparators: false,
      normalizeCasing: false,
      normalizeDates: 'preserve',
      applyControlledVocabulary: 'off',
    };
  }
  return policy;
}

export function buildDefaultPolicy(analysis: AnalysisResult): NormalizationPolicy {
  const fieldPolicies: Record<string, FieldPolicy> = {};
  const presetName = detectPresetName(analysis);
  analysis.recommendations.forEach((recommendation) => {
    const base = defaultFieldPolicy(recommendation.recommendedStrategy as FieldPolicy['strategy']);
    fieldPolicies[recommendation.header] = applyPresetAdjustments(recommendation.header, base, presetName);
  });
  return { fieldPolicies, presetName };
}
