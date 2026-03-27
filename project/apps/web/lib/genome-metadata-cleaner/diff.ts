import type { DiffProposal } from './types';

export function filterDiffProposals(proposals: DiffProposal[], filter: 'all' | 'safe' | 'review' | 'invalid') {
  if (filter === 'all') return proposals;
  return proposals.filter((proposal) => proposal.status === filter);
}
