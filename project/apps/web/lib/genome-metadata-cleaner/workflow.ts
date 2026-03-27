import { buildDefaultPolicy } from './policy';
import { buildRecommendations } from './recommender';
import { matchMetadataToFasta } from './matcher';
import { profileDataset, profileSelectedColumns } from './profiler';
import type { AnalysisResult, FastaMatchReport, NormalizationPolicy, ParsedDataset, SelectedColumnAnalysis } from './types';

export interface WorkflowAnalysisResult {
  analysis: AnalysisResult;
  defaultPolicy: NormalizationPolicy;
  linkageReport: FastaMatchReport | null;
}

export function analyzeWorkflow(metadataDataset: ParsedDataset, fastaDataset?: ParsedDataset | null): WorkflowAnalysisResult {
  const base = profileDataset(metadataDataset);
  const analysis: AnalysisResult = {
    ...base,
    recommendations: buildRecommendations(base),
  };
  return {
    analysis,
    defaultPolicy: buildDefaultPolicy(analysis),
    linkageReport: fastaDataset ? matchMetadataToFasta(metadataDataset.rows, fastaDataset) : null,
  };
}

export function analyzeSelectedWorkflowColumns(
  analysis: AnalysisResult,
  selectedHeaders: string[],
): SelectedColumnAnalysis {
  return profileSelectedColumns(analysis, selectedHeaders, analysis.recommendations);
}
