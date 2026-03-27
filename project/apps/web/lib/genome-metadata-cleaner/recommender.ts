import type { AnalysisResult, FieldRecommendation, FieldProfile, StrategyOption } from './types';

function strategyOptions(field?: string): StrategyOption[] {
  const base: StrategyOption[] = [
    { id: 'safe-clean', label: 'Safe cleanup only', description: 'Trim whitespace, normalize safe separators, and keep meaning unchanged.' },
    { id: 'review-only', label: 'Review risky changes only', description: 'Keep risky proposals in preview without auto-applying them.' },
    { id: 'skip', label: 'Skip this field', description: 'Ignore this field for the current run.' },
  ];
  if (field && ['country', 'host', 'subtype', 'segment', 'region'].includes(field)) {
    base.splice(1, 0, {
      id: 'canonicalize-with-review',
      label: 'Canonicalize with review',
      description: 'Use canonical vocabulary suggestions and send lower-confidence cases to review.',
    });
  }
  if (field === 'collection_date') {
    base.splice(1, 0, {
      id: 'canonicalize-safe',
      label: 'Normalize unambiguous dates',
      description: 'Normalize YYYY, YYYY-MM, and unambiguous full dates while holding ambiguous dates for review.',
    });
  }
  return base;
}

function recommendedStrategyForProfile(profile: FieldProfile): Pick<FieldRecommendation, 'recommendedStrategy' | 'recommendedReason' | 'risky'> {
  const types = profile.issueCounts.map((issue) => issue.type);
  if (types.includes('ambiguous-date') || types.includes('duplicate') || types.includes('likely-duplicate')) {
    return {
      recommendedStrategy: 'review-only',
      recommendedReason: 'This field contains ambiguous or identity-like changes that should be explicitly reviewed.',
      risky: true,
    };
  }
  if (profile.field === 'collection_date') {
    return {
      recommendedStrategy: 'canonicalize-safe',
      recommendedReason: 'Collection dates can be normalized safely only when the format is unambiguous.',
      risky: types.includes('ambiguous-date') || types.includes('impossible-date'),
    };
  }
  if (profile.field && ['country', 'host', 'subtype', 'segment', 'region'].includes(profile.field)) {
    return {
      recommendedStrategy: 'canonicalize-with-review',
      recommendedReason: 'Controlled vocabulary cleanup is useful here, but lower-confidence mappings should be reviewed.',
      risky: true,
    };
  }
  return {
    recommendedStrategy: 'safe-clean',
    recommendedReason: 'Whitespace, casing, and separator cleanup can be proposed without changing core semantics.',
    risky: false,
  };
}

export function buildRecommendations(analysis: AnalysisResult): FieldRecommendation[] {
  return analysis.profiles.map((profile) => {
    const consensus = analysis.columnConsensus.find((item) => item.header === profile.header);
    const recommended = recommendedStrategyForProfile(profile);
    const consensusSummary = consensus
      ? `Dominant pattern: ${consensus.dominantPattern}; case: ${consensus.dominantCase}; outliers: ${consensus.outlierCount}.`
      : undefined;
    return {
      header: profile.header,
      field: profile.field,
      recommendedStrategy: recommended.recommendedStrategy,
      recommendedReason: consensusSummary ? `${recommended.recommendedReason} ${consensusSummary}` : recommended.recommendedReason,
      options: strategyOptions(profile.field),
      risky: recommended.risky,
      consensusSummary,
    };
  });
}
