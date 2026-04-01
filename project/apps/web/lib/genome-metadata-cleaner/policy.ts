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

function isGisaidLikeHeader(header: string) {
  return /(isolate[_\s]?id|isolate[_\s]?name|subtype|location|host|collection[_\s]?date|submitting[_\s]?sample[_\s]?id|originating[_\s]?sample[_\s]?id|passage[_\s]?history|lineage|clade|segment[_\s]?id)/i.test(header);
}

function detectPresetName(analysis: AnalysisResult) {
  const matched = analysis.dataset.headers.filter((header) => isGisaidLikeHeader(header)).length;
  if (matched >= 8) return 'gisaid-influenza-raw';
  return undefined;
}

function applyPresetAdjustments(header: string, policy: FieldPolicy, presetName?: string): FieldPolicy {
  if (presetName !== 'gisaid-influenza-raw') return policy;
  if (/(location|lineage|clade|passage|history|source|genotype|publication|note|status|info|resistance|zip[_\s]?code|isolate[_\s]?name|submitting[_\s]?sample[_\s]?id|originating[_\s]?sample[_\s]?id|isolate[_\s]?submitter|segment[_\s]?id)/i.test(header)) {
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
  if (/(host[_\s]?age|age[_\s]?unit|host[_\s]?gender|patient[_\s]?status|vaccinated|outbreak)/i.test(header)) {
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
