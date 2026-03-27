import type { Metadata } from 'next';
import { GenomeMetadataCleanerClient } from '../../components/genome-metadata-cleaner/GenomeMetadataCleanerClient';

export const metadata: Metadata = {
  title: 'Genome Metadata Cleaner | BioLT',
  description: 'Analyze, normalize, review, and export genome metadata files with explicit user control.',
  alternates: {
    canonical: '/genome-metadata-cleaner',
  },
};

export default function GenomeMetadataCleanerPage() {
  return <GenomeMetadataCleanerClient />;
}
