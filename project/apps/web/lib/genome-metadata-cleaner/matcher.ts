import type { FastaMatchCandidate, FastaMatchReport, ParsedDataset, ParsedRow } from './types';

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s._\-|/]+/g, '');
}

function scorePair(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.82;
  let overlap = 0;
  for (const char of new Set(na.split(''))) {
    if (nb.includes(char)) overlap += 1;
  }
  return overlap / Math.max(new Set(na.split('')).size, new Set(nb.split('')).size, 1);
}

function rowValue(row: ParsedRow, key: string) {
  return String(row[key] ?? '').trim();
}

export function matchMetadataToFasta(metadataRows: ParsedRow[], fastaDataset: ParsedDataset): FastaMatchReport {
  const keys = ['sample_id', 'isolate_name', 'strain_name', 'sequence_id'];
  const fastaRows = fastaDataset.rows;
  const candidates: FastaMatchCandidate[] = [];
  let matchedRows = 0;

  metadataRows.forEach((row) => {
    let best: FastaMatchCandidate | null = null;
    keys.forEach((key) => {
      const metadataValue = rowValue(row, key);
      if (!metadataValue) return;
      fastaRows.forEach((fastaRow) => {
        const fastaValue = rowValue(fastaRow, key) || rowValue(fastaRow, 'fasta_header');
        const score = scorePair(metadataValue, fastaValue);
        if (score > 0.8 && (!best || score > best.score)) {
          best = {
            metadataRowIndex: row.__rowIndex,
            fastaRowIndex: fastaRow.__rowIndex,
            metadataValue,
            fastaValue,
            score,
            key,
          };
        }
      });
    });
    if (best) {
      matchedRows += 1;
      candidates.push(best);
    }
  });

  return {
    totalMetadataRows: metadataRows.length,
    totalFastaRows: fastaRows.length,
    matchedRows,
    unmatchedMetadataRows: metadataRows.length - matchedRows,
    candidates: candidates.sort((a, b) => b.score - a.score).slice(0, 200),
  };
}
