export type SupportedFormat = 'csv' | 'tsv' | 'xlsx' | 'fasta';

export type SupportedField =
  | 'sample_id'
  | 'isolate_name'
  | 'collection_date'
  | 'host'
  | 'country'
  | 'region'
  | 'subtype'
  | 'segment'
  | 'strain_name'
  | 'sequence_id'
  | 'fasta_header';

export type IssueType =
  | 'whitespace'
  | 'casing'
  | 'separator'
  | 'controlled-vocab'
  | 'invalid-value'
  | 'mixed-date-format'
  | 'ambiguous-date'
  | 'impossible-date'
  | 'duplicate'
  | 'likely-duplicate'
  | 'missing-value';

export type ProposalStatus = 'safe' | 'review' | 'invalid';

export interface ParsedRow {
  __rowIndex: number;
  [key: string]: string | number;
}

export interface FastaRecord {
  rowIndex: number;
  originalHeader: string;
  sequence: string;
  sequenceId: string;
}

export interface ParsedDataset {
  fileName: string;
  format: SupportedFormat;
  delimiter?: ',' | '\t';
  headers: string[];
  rows: ParsedRow[];
  fastaRecords?: FastaRecord[];
}

export interface SchemaMatch {
  header: string;
  field: SupportedField;
  confidence: number;
  reason: string;
}

export interface IssueCount {
  type: IssueType;
  count: number;
  examples: string[];
}

export interface FieldProfile {
  header: string;
  field?: SupportedField;
  confidence?: number;
  totalRows: number;
  nonEmptyRows: number;
  uniqueValues: number;
  issueCounts: IssueCount[];
  duplicateGroups: Array<{ normalized: string; rowIndices: number[]; values: string[] }>;
  distinctExamples: string[];
}

export interface DashboardSummary {
  totalRows: number;
  totalIssues: number;
  safeSuggestions: number;
  reviewSuggestions: number;
  invalidValues: number;
}

export interface StrategyOption {
  id: string;
  label: string;
  description: string;
}

export interface FieldRecommendation {
  header: string;
  field?: SupportedField;
  recommendedStrategy: string;
  recommendedReason: string;
  options: StrategyOption[];
  risky: boolean;
}

export interface ControlledSuggestion {
  value: string;
  canonical: string;
  confidence: number;
  reason: string;
  safe: boolean;
}

export interface DateParseResult {
  kind: 'year' | 'year-month' | 'full' | 'ambiguous' | 'impossible' | 'invalid';
  normalized?: string;
  reason: string;
}

export interface FieldPolicy {
  enabled: boolean;
  strategy:
    | 'skip'
    | 'safe-clean'
    | 'canonicalize-safe'
    | 'canonicalize-with-review'
    | 'review-only'
    | 'preserve';
  trimWhitespace: boolean;
  collapseWhitespace: boolean;
  normalizeSeparators: boolean;
  normalizeCasing: boolean;
  normalizeDates: 'preserve' | 'normalize-unambiguous' | 'review-ambiguous';
  applyControlledVocabulary: 'off' | 'safe-only' | 'with-review';
  customMappings: Record<string, string>;
}

export interface NormalizationPolicy {
  fieldPolicies: Record<string, FieldPolicy>;
  presetName?: string;
}

export interface DiffProposal {
  id: string;
  rowIndex: number;
  header: string;
  field?: SupportedField;
  originalValue: string;
  suggestedValue: string;
  issueType: IssueType;
  reason: string;
  confidence: number;
  status: ProposalStatus;
  apply: boolean;
}

export interface AnalysisResult {
  dataset: ParsedDataset;
  schema: SchemaMatch[];
  profiles: FieldProfile[];
  recommendations: FieldRecommendation[];
  dashboard: DashboardSummary;
}

export interface AppliedResult {
  rows: ParsedRow[];
  appliedProposals: DiffProposal[];
}

export interface ChangeLogEntry {
  rowIndex: number;
  header: string;
  field?: SupportedField;
  originalValue: string;
  newValue: string;
  issueType: IssueType;
  reason: string;
  confidence: number;
  status: ProposalStatus;
}

export interface PresetRecord {
  name: string;
  createdAt: string;
  policy: NormalizationPolicy;
}

export interface FastaMatchCandidate {
  metadataRowIndex: number;
  fastaRowIndex: number;
  metadataValue: string;
  fastaValue: string;
  score: number;
  key: string;
}

export interface FastaMatchReport {
  totalMetadataRows: number;
  totalFastaRows: number;
  matchedRows: number;
  unmatchedMetadataRows: number;
  candidates: FastaMatchCandidate[];
}
