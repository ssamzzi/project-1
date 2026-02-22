import { SearchClient } from './SearchClient';

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const initialQuery = typeof searchParams?.q === 'string' ? searchParams.q : '';
  return <SearchClient initialQuery={initialQuery} />;
}
