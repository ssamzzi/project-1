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
  if (field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field)) return value;
  return value.replace(/\s*\/\s*/g, '/').replace(/\s*-\s*/g, '-');
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

function normalizedDuplicateKey(value: string) {
  return value.toLowerCase().replace(/[\s._\-]+/g, '');
}

function shouldRequireValue(header: string, field: SupportedField | undefined) {
  if (field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field)) return true;
  return /(?:^|[\s_])(sample|isolate|sequence|accession)[_\s-]*id(?:$|[\s_])/i.test(header);
}

function shouldPreserveDescriptiveColumn(header: string, field: SupportedField | undefined) {
  if (field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field)) return true;
  return /(location|lineage|clade|passage|history|source|genotype|publication|note|status|info|resistance|zip[_\s]?code)/i.test(header);
}

function normalizeLooseText(value: string) {
  return value.trim().replace(/[_\-.\/]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function compactLooseText(value: string) {
  return normalizeLooseText(value).replace(/\s+/g, '');
}

function looksPlausibleControlledValue(field: SupportedField | undefined, value: string, consensus?: ColumnConsensusProfile) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (field === 'country' && /^[A-Za-z][A-Za-z\s.'()-]+$/.test(trimmed)) return true;
  if (field === 'subtype' && (/^[AB]\s*\/\s*H\d{1,2}N\d{1,2}$/i.test(trimmed) || /^H\d{1,2}N\d{1,2}$/i.test(trimmed))) return true;
  if (field === 'host' && /^[A-Za-z][A-Za-z\s.'()-]+$/.test(trimmed)) return true;
  if (consensus?.canonicalValue && normalizeLooseText(trimmed) === normalizeLooseText(consensus.canonicalValue)) return true;
  return false;
}

function shouldTreatControlledValueAsInvalid(field: SupportedField | undefined, value: string) {
  const trimmed = value.trim();
  if (!trimmed || !field) return false;
  if (field === 'segment') return true;
  if (field === 'subtype') {
    return /[0-9]/.test(trimmed) && !/^[AB]?\s*\/?\s*H\d{1,2}N\d{1,2}$/i.test(trimmed.replace(/\s+/g, ''));
  }
  if (field === 'country' || field === 'host' || field === 'region') {
    return /[0-9]/.test(trimmed) || /[^A-Za-z\s.'()\/-]/.test(trimmed);
  }
  return false;
}

function levenshteinDistance(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const matrix = Array.from({ length: left.length + 1 }, () => new Array<number>(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[left.length][right.length];
}

function humanRowNumbers(indices: number[]) {
  return indices.map((index) => index + 1).join(', ');
}

function consensusSuggestion(field: SupportedField | undefined, value: string, consensus?: ColumnConsensusProfile) {
  if (!consensus?.canonicalValue) return null;
  if (field && !['country', 'host', 'region', 'subtype', 'segment'].includes(field)) return null;
  if (!field && (consensus.canonicalFrequency ?? 0) < 2) return null;
  const normalizedValue = normalizeLooseText(value);
  const normalizedCanonical = normalizeLooseText(consensus.canonicalValue);
  if (!normalizedValue || !normalizedCanonical || normalizedValue === normalizedCanonical) {
    if (value !== consensus.canonicalValue && normalizedValue === normalizedCanonical) {
      return {
        canonical: consensus.canonicalValue,
        confidence: field === 'subtype' || field === 'segment' ? 0.98 : field ? 0.96 : 0.94,
        reason: 'This value matches the dominant canonical form in the selected column but uses a different presentation.',
        safe: !!field && !['country', 'host', 'region'].includes(field),
      };
    }
    return null;
  }

  const compactValue = compactLooseText(value);
  const compactCanonical = compactLooseText(consensus.canonicalValue);
  const distance = levenshteinDistance(compactValue, compactCanonical);
  const maxDistance = compactCanonical.length >= 8 ? 2 : 1;
  if (distance > maxDistance) return null;

  return {
    canonical: consensus.canonicalValue,
    confidence: distance === 1 ? 0.78 : 0.66,
    reason: 'This value is close to the dominant canonical form in the selected column and may be a typo.',
    safe: false,
  };
}

export function generateDiffProposals(
  dataset: ParsedDataset,
  schemaByHeader: Record<string, SupportedField | undefined>,
  policy: NormalizationPolicy,
  options?: { selectedHeaders?: string[]; consensusProfiles?: ColumnConsensusProfile[]; linkageReport?: FastaMatchReport },
): DiffProposal[] {
  const proposals: DiffProposal[] = [];
  const duplicateIndexByHeader = new Map<string, Map<string, number[]>>();

  dataset.headers.forEach((header) => {
    const field = schemaByHeader[header];
    if (!field || !['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field)) return;
    const groups = new Map<string, number[]>();
    dataset.rows.forEach((row) => {
      const original = String(row[header] ?? '').trim();
      if (!original) return;
      const key = normalizedDuplicateKey(original);
      groups.set(key, [...(groups.get(key) || []), row.__rowIndex]);
    });
    duplicateIndexByHeader.set(header, groups);
  });

  dataset.rows.forEach((row) => {
    dataset.headers.forEach((header) => {
      if (options?.selectedHeaders && !options.selectedHeaders.includes(header)) return;
      const field = schemaByHeader[header];
      const original = String(row[header] ?? '');
      const fieldPolicy = policy.fieldPolicies[header];
      if (!fieldPolicy || !fieldPolicy.enabled) return;
      const consensus = consensusFor(header, options?.consensusProfiles);
      const linkage = linkageFor(row.__rowIndex, options?.linkageReport);
      const trimmedOriginal = original.trim();
      const duplicateGroup = duplicateIndexByHeader.get(header)?.get(normalizedDuplicateKey(trimmedOriginal)) || [];
      const requireValue = shouldRequireValue(header, field);

      if (!trimmedOriginal) {
        if (requireValue) {
          proposals.push(
            buildProposal({
              rowIndex: row.__rowIndex,
              header,
              field,
              originalValue: original,
              suggestedValue: original,
              issueType: 'missing-value',
              reason: 'This selected field is empty for this row and needs review before export.',
              confidence: 0.1,
              status: 'invalid',
            }),
          );
        }
        return;
      }

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
      } else if (field === 'collection_date' && trimmedOriginal) {
        const parsed = parseCollectionDate(trimmedOriginal);
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
      }

      if (fieldPolicy.applyControlledVocabulary !== 'off') {
        const suggestions = suggestControlledVocabulary(field, next);
        const best = suggestions[0] || consensusSuggestion(field, next, consensus);
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
        if (
          !best &&
          field &&
          ['country', 'host', 'subtype', 'segment', 'region'].includes(field) &&
          trimmedOriginal &&
          !looksPlausibleControlledValue(field, next, consensus) &&
          shouldTreatControlledValueAsInvalid(field, next)
        ) {
          proposals.push(
            buildProposal({
              rowIndex: row.__rowIndex,
              header,
              field,
              originalValue: original,
              suggestedValue: original,
              issueType: 'invalid-value',
              reason: 'No plausible controlled vocabulary candidate was found for this value.',
              confidence: 0.1,
              status: 'invalid',
            }),
          );
          return;
        }
      }

      if (!field && !shouldPreserveDescriptiveColumn(header, field) && consensus?.canonicalValue && (consensus.canonicalFrequency ?? 0) >= 2) {
        const consensusBest = consensusSuggestion(undefined, next, consensus);
        if (consensusBest && consensusBest.canonical !== next) {
          changeReasons.push({
            issueType: normalizeLooseText(next) === normalizeLooseText(consensusBest.canonical) ? 'casing' : 'controlled-vocab',
            reason: consensusBest.reason,
            confidence: consensusBest.confidence,
            unsafe: !consensusBest.safe,
          });
          next = consensusBest.canonical;
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
        return;
      }

      if (field && ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'].includes(field) && duplicateGroup.length > 1) {
        proposals.push(
          buildProposal({
            rowIndex: row.__rowIndex,
            header,
            field,
            originalValue: original,
            suggestedValue: original,
            issueType: duplicateGroup.every((index) => String(dataset.rows[index]?.[header] ?? '').trim() === trimmedOriginal) ? 'duplicate' : 'likely-duplicate',
            reason: `This value shares the same normalized identity with rows ${humanRowNumbers(duplicateGroup)} and should be reviewed before any merge or rename.`,
            confidence: 0.35,
            status: 'review',
          }),
        );
        return;
      }

      if (consensus && trimmedOriginal && field && ['country', 'host', 'region', 'subtype', 'segment'].includes(field)) {
        const parsedSuggestions = suggestControlledVocabulary(field, trimmedOriginal);
        const likelyCanonical = parsedSuggestions[0]?.canonical || trimmedOriginal;
        if (consensus.canonicalValue && likelyCanonical !== consensus.canonicalValue) {
          proposals.push(
            buildProposal({
              rowIndex: row.__rowIndex,
              header,
              field,
              originalValue: original,
              suggestedValue: original,
              issueType: 'controlled-vocab',
              reason: 'This value disagrees with the dominant canonical form in the selected column and should be reviewed.',
              confidence: 0.45,
              status: 'review',
            }),
          );
        }
      }
    });
  });
  return proposals;
}
