import type { ParsedDataset, SchemaMatch, SupportedField } from './types';

const fieldPatterns: Record<SupportedField, RegExp[]> = {
  sample_id: [/^sample[\s_-]?id$/i, /^sample$/i, /^specimen[\s_-]?id$/i],
  isolate_name: [/^isolate[\s_-]?name$/i, /^isolate$/i],
  collection_date: [/^collection[\s_-]?date$/i, /^date$/i, /^ymd$/i, /^collection[\s_-]?ymd$/i],
  host: [/^host$/i, /^host[\s_-]?species$/i],
  country: [/^country$/i, /^country[\s_-]?name$/i, /^location[\s_-]?country$/i],
  region: [/^region$/i, /^state$/i, /^province$/i, /^division$/i],
  subtype: [/^subtype$/i, /^ha[\s_-]?na$/i, /^influenza[\s_-]?subtype$/i],
  segment: [/^segment$/i, /^gene[\s_-]?segment$/i],
  strain_name: [/^strain[\s_-]?name$/i, /^strain$/i, /^virus[\s_-]?name$/i],
  sequence_id: [/^sequence[\s_-]?id$/i, /^accession$/i, /^seq[\s_-]?id$/i],
  fasta_header: [/^fasta[\s_-]?header$/i, /^header$/i],
};

export function detectSchema(dataset: ParsedDataset): SchemaMatch[] {
  return dataset.headers.flatMap((header) => {
    const candidates = Object.entries(fieldPatterns)
      .map(([field, patterns]) => {
        const matched = patterns.find((pattern) => pattern.test(header));
        if (!matched) return null;
        return {
          header,
          field: field as SupportedField,
          confidence: matched.source.includes('^') ? 0.99 : 0.88,
          reason: `Header "${header}" matches a known ${field} alias.`,
        };
      })
      .filter(Boolean) as SchemaMatch[];
    return candidates.slice(0, 1);
  });
}

export function fieldForHeader(schema: SchemaMatch[], header: string) {
  return schema.find((match) => match.header === header)?.field;
}
