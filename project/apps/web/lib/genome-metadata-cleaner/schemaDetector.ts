import { suggestControlledVocabulary } from './controlledVocab';
import type { ParsedDataset, ParsedRow, SchemaMatch, SupportedField } from './types';

const fieldPatterns: Record<SupportedField, RegExp[]> = {
  sample_id: [/^sample[\s_-]?id$/i, /^sample$/i, /^specimen[\s_-]?id$/i, /^sample[\s_-]?name$/i],
  isolate_name: [/^isolate[\s_-]?name$/i, /^isolate$/i, /^isolate[\s_-]?id$/i],
  collection_date: [/^collection[\s_-]?date$/i, /^date$/i, /^ymd$/i, /^collection[\s_-]?ymd$/i, /^sampling[\s_-]?date$/i],
  host: [/^host$/i, /^host[\s_-]?species$/i],
  country: [/^country$/i, /^country[\s_-]?name$/i, /^location[\s_-]?country$/i],
  region: [/^region$/i, /^state$/i, /^province$/i, /^division$/i, /^location[\s_-]?region$/i],
  subtype: [/^subtype$/i, /^ha[\s_-]?na$/i, /^influenza[\s_-]?subtype$/i],
  segment: [/^segment$/i, /^gene[\s_-]?segment$/i],
  strain_name: [/^strain[\s_-]?name$/i, /^strain$/i, /^virus[\s_-]?name$/i],
  sequence_id: [/^sequence[\s_-]?id$/i, /^accession$/i, /^seq[\s_-]?id$/i],
  fasta_header: [/^fasta[\s_-]?header$/i, /^header$/i],
};

function sampleValues(rows: ParsedRow[], header: string, limit = 24) {
  return rows
    .map((row) => String(row[header] ?? '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

function scoreHeader(header: string, field: SupportedField) {
  const matched = fieldPatterns[field].find((pattern) => pattern.test(header));
  if (!matched) return 0;
  return matched.source.includes('^') ? 0.99 : 0.9;
}

function looksLikeDate(value: string) {
  return (
    /^\d{4}$/.test(value) ||
    /^\d{4}[-/]\d{1,2}$/.test(value) ||
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value) ||
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(value)
  );
}

function subtypeLikeScore(values: string[]) {
  if (!values.length) return 0;
  const hits = values.filter((value) => /^H?\d{1,2}[\s/_-]?N\d{1,2}$/i.test(value.replace(/\s+/g, ''))).length;
  return hits / values.length;
}

function dateLikeScore(values: string[]) {
  if (!values.length) return 0;
  return values.filter(looksLikeDate).length / values.length;
}

function controlledScore(field: SupportedField, values: string[]) {
  if (!values.length) return 0;
  const hits = values.filter((value) => suggestControlledVocabulary(field, value).length > 0).length;
  return hits / values.length;
}

function idLikeScore(values: string[]) {
  if (!values.length) return 0;
  const tokenish = values.filter((value) => /^[A-Za-z0-9._/-]+$/.test(value)).length / values.length;
  const unique = new Set(values).size / values.length;
  return tokenish * 0.6 + unique * 0.4;
}

function contentScore(field: SupportedField, values: string[]) {
  if (!values.length) return 0;
  if (field === 'collection_date') return dateLikeScore(values) >= 0.65 ? 0.82 : 0;
  if (field === 'country') return controlledScore('country', values) >= 0.5 ? 0.8 : 0;
  if (field === 'host') return controlledScore('host', values) >= 0.45 ? 0.76 : 0;
  if (field === 'segment') return controlledScore('segment', values) >= 0.45 ? 0.76 : 0;
  if (field === 'subtype') return subtypeLikeScore(values) >= 0.5 ? 0.8 : 0;
  if (field === 'sequence_id' || field === 'sample_id') return idLikeScore(values) >= 0.78 ? 0.58 : 0;
  return 0;
}

function reasonFor(field: SupportedField, header: string, headerScore: number, valueScore: number) {
  if (headerScore >= 0.9) return `Header "${header}" matches a known ${field} alias.`;
  if (valueScore > 0) return `Column values are strongly consistent with ${field}.`;
  return `Column "${header}" was matched to ${field}.`;
}

export function detectSchema(dataset: ParsedDataset): SchemaMatch[] {
  return dataset.headers.flatMap((header) => {
    const values = sampleValues(dataset.rows, header);
    const candidates = (Object.keys(fieldPatterns) as SupportedField[])
      .map((field) => {
        const headerScore = scoreHeader(header, field);
        const valueScore = contentScore(field, values);
        const confidence = Math.max(headerScore, valueScore);
        if (confidence < 0.55) return null;
        return {
          header,
          field,
          confidence,
          reason: reasonFor(field, header, headerScore, valueScore),
        };
      })
      .filter(Boolean)
      .sort((left, right) => (right?.confidence ?? 0) - (left?.confidence ?? 0)) as SchemaMatch[];
    return candidates.slice(0, 1);
  });
}

export function fieldForHeader(schema: SchemaMatch[], header: string) {
  return schema.find((match) => match.header === header)?.field;
}
