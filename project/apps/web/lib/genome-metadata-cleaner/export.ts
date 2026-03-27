import type { ChangeLogEntry, FastaMatchReport, NameViewRow, ParsedDataset, ParsedRow } from './types';

function escapeCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function rowsToDelimitedText(headers: string[], rows: ParsedRow[], delimiter: ',' | '\t' = ',') {
  const lines = [
    headers.join(delimiter),
    ...rows.map((row) => headers.map((header) => escapeCell(String(row[header] ?? ''))).join(delimiter)),
  ];
  return lines.join('\n');
}

function buildNormalizedFastaHeader(record: ParsedRow) {
  const orderedKeys = ['sequence_id', 'sample_id', 'isolate_name', 'collection_date', 'host', 'country', 'region', 'subtype', 'segment', 'strain_name'];
  const sequenceId = String(record.sequence_id || record.sample_id || 'sequence').trim();
  const parts = orderedKeys
    .filter((key) => key !== 'sequence_id' && String(record[key] ?? '').trim())
    .map((key) => `${key}=${String(record[key] ?? '').trim()}`);
  return `>${[sequenceId, ...parts].join(' | ')}`;
}

export function exportCleanedContent(dataset: ParsedDataset, rows: ParsedRow[]) {
  if (dataset.format === 'fasta' && dataset.fastaRecords) {
    const byRow = new Map(rows.map((row) => [row.__rowIndex, row]));
    return dataset.fastaRecords
      .map((record) => {
        const row = byRow.get(record.rowIndex);
        const header = row ? buildNormalizedFastaHeader(row) : `>${record.originalHeader}`;
        return `${header}\n${record.sequence}`;
      })
      .join('\n');
  }

  const delimiter = dataset.delimiter || ',';
  return rowsToDelimitedText(dataset.headers, rows, delimiter);
}

export function changeLogToJson(changeLog: ChangeLogEntry[]) {
  return JSON.stringify(changeLog, null, 2);
}

export function changeLogToCsv(changeLog: ChangeLogEntry[]) {
  const headers = ['rowIndex', 'header', 'field', 'originalValue', 'newValue', 'issueType', 'reason', 'confidence', 'status'];
  const lines = [
    headers.join(','),
    ...changeLog.map((entry) =>
      headers
        .map((header) => escapeCell(String(entry[header as keyof ChangeLogEntry] ?? '')))
        .join(','),
    ),
  ];
  return lines.join('\n');
}

export function linkageReportToJson(report: FastaMatchReport) {
  return JSON.stringify(report, null, 2);
}

export function linkageRowsToCsv(rows: NameViewRow[]) {
  const headers = ['rowIndex', 'name', 'raw_name', 'fasta_name', 'raw_fasta_name', 'name_match_status', 'name_match_confidence', 'matchedBy', 'reason'];
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(String(row[header as keyof NameViewRow] ?? ''))).join(',')),
  ];
  return lines.join('\n');
}
