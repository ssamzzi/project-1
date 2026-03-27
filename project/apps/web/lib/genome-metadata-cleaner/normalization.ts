import { suggestControlledVocabulary } from './controlledVocab';
import { parseCollectionDate } from './profiler';
import type { ColumnConsensusProfile, DiffProposal, FastaMatchReport, FieldPolicy, NormalizationPolicy, ParsedDataset, SupportedField } from './types';

function normalizeWhitespace(value: string, policy: FieldPolicy) {
  let next = value;
  if (policy.trimWhitespace) next = next.trim();
  if (policy.collapseWhitespace) next = next.replace(/\s+/g, ' ');
  return next;
}

function normalizeSeparators(value: string, field: SupportedField | undefined, policy: FieldPolicy) {
  if (!policy.normalizeSeparators) return value;
  if (field && ['sample_id', 'sequence_id'].includes(field)) return value;
  return value.replace(/[_]+/g, ' ').replace(/\s*\/\s*/g, '/').replace(/\s*-\s*/g, '-');
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCase(value: string, field: SupportedField | undefined, policy: FieldPolicy) {
  if (!policy.normalizeCasing) return value;
  if (!field) return value;
  if (field === 'segment' || field === 'subtype') return value.toUpperCase();
  if (field === 'country' || field === 'host' || field === 'region') return toTitleCase(value);
  return value;
}

function proposalStatus(confidence: number, unsafe: boolean): DiffProposal['status'] {
  if (confidence < 0.5) return 'invalid';
  if (unsafe || confidence < 0.95) return 'review';
  return 'safe';
}

function buildProposal(params: Omit<DiffProposal, 'id' | 'apply'>): DiffProposal {
  const id = `${params.rowIndex}-${params.header}-${params.issueType}-${params.suggestedValue}`;
  return { ...params, id, apply: params.status === 'safe' };
}

function customMappingFor(value: string, policy: FieldPolicy) {
  const direct = policy.customMappings[value];
  if (direct) return direct;
  const compact = Object.entries(policy.customMappings).find(([source]) => source.trim().toLowerCase() === value.trim().toLowerCase());
  return compact?.[1];
}

function consensusFor(header: string, consensusProfiles?: ColumnConsensusProfile[]) {
  return consensusProfiles?.find((item) => item.header === header);
}

function linkageFor(rowIndex: number, linkage?: FastaMatchReport) {
  return linkage?.rows.find((item) => item.rowIndex === rowIndex);
}

export function generateDiffProposals(
  dataset: ParsedDataset,
  schemaByHeader: Record<string, SupportedField | undefined>,
  policy: NormalizationPolicy,
  options?: { selectedHeaders?: string[]; consensusProfiles?: ColumnConsensusProfile[]; linkageReport?: FastaMatchReport },
): DiffProposal[] {
  const proposals: DiffProposal[] = [];
  dataset.rows.forEach((row) => {
    dataset.headers.forEach((header) => {
      if (options?.selectedHeaders && !options.selectedHeaders.includes(header)) return;
      const field = schemaByHeader[header];
      const original = String(row[header] ?? '');
      const fieldPolicy = policy.fieldPolicies[header];
      if (!fieldPolicy || !fieldPolicy.enabled || !original.trim()) return;
      const consensus = consensusFor(header, options?.consensusProfiles);
      const linkage = linkageFor(row.__rowIndex, options?.linkageReport);

      const custom = customMappingFor(original, fieldPolicy);
      if (custom && custom !== original) {
        proposals.push(
          buildProposal({
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: custom,
            issueType: 'controlled-vocab',
            reason: 'Custom mapping selected by the user.',
            confidence: 1,
            status: 'review',
          }),
        );
        return;
      }

      let next = original;
      const changeReasons: Array<{ issueType: DiffProposal['issueType']; reason: string; confidence: number; unsafe?: boolean }> = [];

      const whitespaceNormalized = normalizeWhitespace(next, fieldPolicy);
      if (whitespaceNormalized !== next) {
        changeReasons.push({ issueType: 'whitespace', reason: 'Whitespace can be normalized safely.', confidence: 0.99 });
        next = whitespaceNormalized;
      }

      const separatorNormalized = normalizeSeparators(next, field, fieldPolicy);
      if (separatorNormalized !== next) {
        const unsafe = !!(field && ['sample_id', 'isolate_name', 'strain_name'].includes(field));
        changeReasons.push({
          issueType: 'separator',
          reason: consensus?.dominantSeparator && consensus.dominantSeparator !== 'mixed'
            ? `Separator cleanup can align this value to the dominant ${consensus.dominantSeparator} style.`
            : 'Separator cleanup can make formatting consistent.',
          confidence: unsafe ? 0.72 : 0.97,
          unsafe,
        });
        next = separatorNormalized;
      }

      const caseNormalized = normalizeCase(next, field, fieldPolicy);
      if (caseNormalized !== next) {
        const unsafe = !!(field && ['sample_id', 'isolate_name', 'strain_name'].includes(field));
        changeReasons.push({
          issueType: 'casing',
          reason: consensus?.dominantCase && consensus.dominantCase !== 'mixed'
            ? `Case normalization can align this value to the dominant ${consensus.dominantCase} style.`
            : 'Case normalization can make the field more consistent.',
          confidence: unsafe ? 0.68 : 0.96,
          unsafe,
        });
        next = caseNormalized;
      }

      if (field === 'collection_date' && fieldPolicy.normalizeDates !== 'preserve') {
        const parsed = parseCollectionDate(next);
        if (parsed.kind === 'ambiguous') {
          proposals.push(
            buildProposal({
              rowIndex: row.__rowIndex,
              header,
              field,
              originalValue: original,
              suggestedValue: original,
              issueType: 'ambiguous-date',
              reason: parsed.reason,
              confidence: 0.2,
              status: 'review',
            }),
          );
          return;
        }
        if (parsed.kind === 'impossible' || parsed.kind === 'invalid') {
          proposals.push(
            buildProposal({
              rowIndex: row.__rowIndex,
              header,
              field,
              originalValue: original,
              suggestedValue: original,
              issueType: parsed.kind === 'impossible' ? 'impossible-date' : 'invalid-value',
              reason: parsed.reason,
              confidence: 0.1,
              status: 'invalid',
            }),
          );
          return;
        }
        if (parsed.normalized && parsed.normalized !== next) {
          changeReasons.push({ issueType: 'mixed-date-format', reason: parsed.reason, confidence: 0.99 });
          next = parsed.normalized;
        }
      }

      if (fieldPolicy.applyControlledVocabulary !== 'off') {
        const suggestions = suggestControlledVocabulary(field, next);
        const best = suggestions[0];
        if (best && best.canonical !== next) {
          const consensusCanonical = consensus?.canonicalValue;
          const consensusBoost = consensusCanonical && best.canonical === consensusCanonical ? 0.02 : 0;
          const unsafe = fieldPolicy.applyControlledVocabulary === 'with-review' && !best.safe;
          changeReasons.push({
            issueType: 'controlled-vocab',
            reason: consensusCanonical && best.canonical === consensusCanonical
              ? `${best.reason} This matches the dominant column canonical value.`
              : best.reason,
            confidence: Math.min(best.confidence + consensusBoost, 0.99),
            unsafe: unsafe || !best.safe,
          });
          next = consensusCanonical && best.canonical !== consensusCanonical && best.safe ? consensusCanonical : best.canonical;
        }
      }

      if (next !== original && changeReasons.length) {
        const strongest = changeReasons[changeReasons.length - 1];
        const identitySensitive = !!(field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field));
        const linkageUnsafe = identitySensitive && linkage && linkage.name_match_status !== 'exact';
        proposals.push(
          buildProposal({
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: next,
            issueType: strongest.issueType,
            reason: changeReasons.map((item) => item.reason).join(' ') + (linkageUnsafe ? ` FASTA linkage status is ${linkage.name_match_status}, so review is required.` : ''),
            confidence: strongest.confidence,
            status: proposalStatus(strongest.confidence, !!strongest.unsafe || linkageUnsafe),
          }),
        );
      }
    });
  });
  return proposals;
}
