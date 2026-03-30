import type { AppliedResult, ChangeLogEntry, DiffProposal, ParsedDataset, ParsedRow } from './types';

export function applySelectedProposals(dataset: ParsedDataset, proposals: DiffProposal[]): AppliedResult {
  const proposalMap = new Map<string, DiffProposal>();
  proposals.filter((proposal) => proposal.apply && proposal.originalValue !== proposal.suggestedValue).forEach((proposal) => {
    proposalMap.set(`${proposal.rowIndex}:${proposal.header}`, proposal);
  });

  const rows: ParsedRow[] = dataset.rows.map((row) => {
    const next: ParsedRow = { ...row };
    dataset.headers.forEach((header) => {
      const proposal = proposalMap.get(`${row.__rowIndex}:${header}`);
      if (proposal) next[header] = proposal.suggestedValue;
    });
    return next;
  });

  return { rows, appliedProposals: proposals.filter((proposal) => proposal.apply && proposal.originalValue !== proposal.suggestedValue) };
}

export function buildChangeLog(proposals: DiffProposal[]): ChangeLogEntry[] {
  return proposals
    .filter((proposal) => proposal.apply && proposal.originalValue !== proposal.suggestedValue)
    .map((proposal) => ({
      rowIndex: proposal.rowIndex + 1,
      header: proposal.header,
      field: proposal.field,
      originalValue: proposal.originalValue,
      newValue: proposal.suggestedValue,
      issueType: proposal.issueType,
      reason: proposal.reason,
      confidence: proposal.confidence,
      status: proposal.status,
    }));
}
