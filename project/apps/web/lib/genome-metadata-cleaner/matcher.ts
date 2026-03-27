import type { FastaMatchCandidate, FastaMatchReport, MatchStatus, NameViewRow, ParsedDataset, ParsedRow } from './types';

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

function representativeName(row: ParsedRow) {
  const keys = ['sample_id', 'sequence_id', 'isolate_name', 'strain_name'];
  const key = keys.find((item) => rowValue(row, item));
  return {
    key: key || 'sample_id',
    value: key ? rowValue(row, key) : '',
  };
}

function classifyMatch(metadataValue: string, fastaValue: string, score: number): { status: MatchStatus; confidence: number; reason: string } {
  if (!metadataValue || !fastaValue) {
    return { status: 'unmatched', confidence: 0, reason: 'Missing metadata or FASTA name.' };
  }
  if (metadataValue === fastaValue) {
    return { status: 'exact', confidence: 1, reason: 'Exact metadata name to FASTA name match.' };
  }
  if (normalize(metadataValue) === normalize(fastaValue)) {
    return { status: 'normalized_match', confidence: 0.98, reason: 'Names match after normalization.' };
  }
  if (score >= 0.82) {
    return { status: 'review', confidence: score, reason: 'Possible FASTA linkage candidate needs review.' };
  }
  return { status: 'unmatched', confidence: score, reason: 'No reliable FASTA linkage candidate found.' };
}

export function matchMetadataToFasta(metadataRows: ParsedRow[], fastaDataset: ParsedDataset): FastaMatchReport {
  const keys = ['sample_id', 'isolate_name', 'strain_name', 'sequence_id'];
  const fastaRows = fastaDataset.rows;
  const candidates: FastaMatchCandidate[] = [];
  let matchedRows = 0;
  let exactMatches = 0;
  let normalizedMatches = 0;
  let reviewMatches = 0;
  const rows: NameViewRow[] = [];

  metadataRows.forEach((row) => {
    let best: FastaMatchCandidate | null = null;
    const metadataName = representativeName(row);

    keys.forEach((key) => {
      const metadataValue = rowValue(row, key);
      if (!metadataValue) return;
      fastaRows.forEach((fastaRow) => {
        const fastaValue = rowValue(fastaRow, key) || rowValue(fastaRow, 'fasta_header');
        const score = scorePair(metadataValue, fastaValue);
        if (score > 0.8 && (!best || score > best.score)) {
          const classified = classifyMatch(metadataValue, fastaValue, score);
          best = {
            metadataRowIndex: row.__rowIndex,
            fastaRowIndex: fastaRow.__rowIndex,
            metadataValue,
            fastaValue,
            score,
            key,
            status: classified.status,
            confidence: classified.confidence,
            reason: classified.reason,
          };
        }
      });
    });

    if (best && best.status !== 'unmatched') {
      matchedRows += 1;
      if (best.status === 'exact') exactMatches += 1;
      if (best.status === 'normalized_match') normalizedMatches += 1;
      if (best.status === 'review') reviewMatches += 1;
      candidates.push(best);
    }

    rows.push({
      rowIndex: row.__rowIndex,
      name: metadataName.value,
      raw_name: metadataName.value,
      fasta_name: best?.fastaValue || '',
      raw_fasta_name: best?.fastaValue || '',
      name_match_status: best?.status || 'unmatched',
      name_match_confidence: best?.confidence || 0,
      matchedBy: best?.key,
      reason: best?.reason || 'No FASTA linkage available.',
    });
  });

  return {
    totalMetadataRows: metadataRows.length,
    totalFastaRows: fastaRows.length,
    matchedRows,
    unmatchedMetadataRows: metadataRows.length - matchedRows,
    exactMatches,
    normalizedMatches,
    reviewMatches,
    unmatchedRows: metadataRows.length - matchedRows,
    candidates: candidates.sort((a, b) => b.score - a.score).slice(0, 200),
    rows,
  };
}
