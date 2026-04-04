import { Suspense } from 'react';
import { SearchClient } from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
