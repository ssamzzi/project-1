import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { FastaRecord, ParsedDataset, ParsedRow, SupportedFormat } from './types';

function inferDelimiter(text: string): ',' | '\t' {
  const firstLines = text.split(/\r?\n/).slice(0, 5).join('\n');
  const tabs = (firstLines.match(/\t/g) || []).length;
  const commas = (firstLines.match(/,/g) || []).length;
  return tabs > commas ? '\t' : ',';
}

function toRows(headers: string[], matrix: string[][]): ParsedRow[] {
  return matrix.map((row, index) => {
    const entry: ParsedRow = { __rowIndex: index };
    headers.forEach((header, colIndex) => {
      entry[header] = String(row[colIndex] ?? '');
    });
    return entry;
  });
}

export function detectFormatFromFileName(fileName: string): SupportedFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.tsv') || lower.endsWith('.txt')) return 'tsv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.fasta') || lower.endsWith('.fa') || lower.endsWith('.fna') || lower.endsWith('.faa')) return 'fasta';
  return 'csv';
}

export function parseDelimitedText(text: string, fileName: string, delimiter?: ',' | '\t'): ParsedDataset {
  const actualDelimiter = delimiter || inferDelimiter(text);
  const parsed = Papa.parse<string[]>(text, {
    delimiter: actualDelimiter,
    skipEmptyLines: 'greedy',
  });
  const rows = (parsed.data as string[][]).filter((row) => row.some((cell) => String(cell ?? '').trim().length > 0));
  const headers = (rows.shift() || []).map((value, index) => String(value || `column_${index + 1}`).trim() || `column_${index + 1}`);
  return {
    fileName,
    format: actualDelimiter === '\t' ? 'tsv' : 'csv',
    delimiter: actualDelimiter,
    headers,
    rows: toRows(headers, rows),
  };
}

export function parseXlsxBuffer(buffer: ArrayBuffer, fileName: string): ParsedDataset {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false, cellText: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as string[][];
  const headers = (matrix.shift() || []).map((value, index) => String(value || `column_${index + 1}`).trim() || `column_${index + 1}`);
  return {
    fileName,
    format: 'xlsx',
    headers,
    rows: toRows(headers, matrix),
  };
}

function parseHeaderTokens(headerText: string) {
  const tokens = headerText.split('|').map((token) => token.trim()).filter(Boolean);
  const result: Record<string, string> = {};
  tokens.slice(1).forEach((token) => {
    const parts = token.split(/[=:]/, 2);
    if (parts.length === 2) result[parts[0].trim()] = parts[1].trim();
  });
  return result;
}

export function parseFastaText(text: string, fileName: string): ParsedDataset {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const records: FastaRecord[] = [];
  const headers = new Set<string>(['sequence_id', 'fasta_header', 'strain_name']);
  let currentHeader = '';
  let currentSequence = '';
  let rowIndex = -1;

  function pushRecord() {
    if (!currentHeader) return;
    rowIndex += 1;
    const headerText = currentHeader.replace(/^>/, '').trim();
    const sequenceId = headerText.split(/\s+/)[0]?.split('|')[0] || `seq_${rowIndex + 1}`;
    records.push({ rowIndex, originalHeader: headerText, sequence: currentSequence, sequenceId });
    currentSequence = '';
  }

  for (const line of lines) {
    if (line.startsWith('>')) {
      pushRecord();
      currentHeader = line;
    } else if (currentHeader) {
      currentSequence += line.trim();
    }
  }
  pushRecord();

  const parsedRows: ParsedRow[] = records.map((record) => {
    const tokenFields = parseHeaderTokens(record.originalHeader);
    Object.keys(tokenFields).forEach((key) => headers.add(key));
    return {
      __rowIndex: record.rowIndex,
      sequence_id: record.sequenceId,
      fasta_header: record.originalHeader,
      strain_name: record.originalHeader,
      ...tokenFields,
    };
  });

  return {
    fileName,
    format: 'fasta',
    headers: Array.from(headers),
    rows: parsedRows,
    fastaRecords: records,
  };
}

export async function parseInputFile(file: File): Promise<ParsedDataset> {
  const format = detectFormatFromFileName(file.name);
  if (format === 'xlsx') return parseXlsxBuffer(await file.arrayBuffer(), file.name);
  const text = await file.text();
  if (format === 'fasta') return parseFastaText(text, file.name);
  return parseDelimitedText(text, file.name, format === 'tsv' ? '\t' : ',');
}
