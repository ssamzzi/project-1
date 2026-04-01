import type { AnalysisResult } from './types';

export const GISAID_RAW_PRESET = 'gisaid-influenza-raw';

export function isGisaidLikeHeader(header: string) {
  return /(isolate[_\s]?id|isolate[_\s]?name|subtype|location|host|collection[_\s]?date|submitting[_\s]?sample[_\s]?id|originating[_\s]?sample[_\s]?id|passage[_\s]?history|lineage|clade|segment[_\s]?id)/i.test(header);
}

export function isPreserveHeavyHeader(header: string) {
  return /(location|lineage|clade|passage|history|source|genotype|publication|note|status|info|resistance|zip[_\s]?code|isolate[_\s]?name|submitting[_\s]?sample[_\s]?id|originating[_\s]?sample[_\s]?id|isolate[_\s]?submitter|segment[_\s]?id)/i.test(header);
}

export function isDemographicHeader(header: string) {
  return /(host[_\s]?age|age[_\s]?unit|host[_\s]?gender|patient[_\s]?status|vaccinated|outbreak|zip[_\s]?code)/i.test(header);
}

export function detectPresetName(analysis: AnalysisResult) {
  const matched = analysis.dataset.headers.filter((header) => isGisaidLikeHeader(header)).length;
  if (matched >= 8) return GISAID_RAW_PRESET;
  return undefined;
}

export function isPresetPreservedHeader(header: string, presetName?: string) {
  if (presetName !== GISAID_RAW_PRESET) return false;
  return isPreserveHeavyHeader(header) || isDemographicHeader(header);
}
