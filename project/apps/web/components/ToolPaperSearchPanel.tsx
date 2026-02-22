"use client";

import { FormEvent, useMemo, useState } from 'react';

interface EuropePmcResult {
  id?: string;
  title?: string;
  pubYear?: string;
  journalTitle?: string;
  authorString?: string;
  doi?: string;
  pmid?: string;
}

interface EuropePmcResponse {
  resultList?: {
    result?: EuropePmcResult[];
  };
}

interface OpenAlexWork {
  id?: string;
  display_name?: string;
  publication_year?: number;
  primary_location?: {
    source?: {
      display_name?: string;
    };
  };
  authorships?: Array<{
    author?: {
      display_name?: string;
    };
  }>;
  ids?: {
    doi?: string;
  };
}

interface OpenAlexResponse {
  results?: OpenAlexWork[];
}

interface PaperResult {
  id: string;
  title: string;
  year: string;
  journal: string;
  authors: string;
  url: string;
}

const QUERY_HINTS: Record<string, string[]> = {
  'pcr-master-mix': ['PCR', 'qPCR', 'master mix'],
  'multi-stock-mix': ['solution preparation', 'concentration calculation', 'dilution'],
  'serial-dilution': ['serial dilution', 'dilution series'],
  'copy-number': ['copy number', 'nucleic acid quantification'],
  ligation: ['DNA ligation', 'insert vector ratio'],
  a260: ['A260', 'UV absorbance', 'nucleic acid purity'],
  'cell-seeding': ['cell seeding', 'cell density'],
  hemocytometer: ['hemocytometer', 'cell counting', 'trypan blue'],
  'rcf-rpm': ['centrifuge', 'RCF', 'RPM'],
  reconstitution: ['reconstitution', 'dissolve', 'target concentration'],
  'gel-loading': ['agarose gel electrophoresis', 'DNA loading dye'],
  'qpcr-relative-quant': ['qPCR', 'delta delta Ct', 'relative quantification'],
  'cell-doubling-time': ['cell doubling time', 'growth rate'],
  'cloning-helper': ['DNA length', 'protein molecular weight', 'kDa'],
  'acid-dilution': ['molarity', 'percentage solution', 'acid dilution'],
  'transformation-efficiency': ['bacterial transformation', 'transformation efficiency', 'CFU'],
};

function sanitizeKeyword(keyword: string): string[] {
  return keyword
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^\w\-_.가-힣]/g, ''))
    .filter(Boolean);
}

function resolveOpenAlexUrl(work: OpenAlexWork): string {
  if (work.ids?.doi) return work.ids.doi;
  if (work.id) return work.id;
  return 'https://openalex.org';
}

export function ToolPaperSearchPanel({ calculatorId, locale, toolTitle }: { calculatorId: string; locale: 'en' | 'ko'; toolTitle: string }) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<PaperResult[]>([]);

  const searchTerms = QUERY_HINTS[calculatorId] ?? [toolTitle];
  const aiQuery = useMemo(() => {
    const extra = sanitizeKeyword(keyword);
    return [...searchTerms, ...extra].join(' ');
  }, [keyword, searchTerms]);

  const pubmedUrl = useMemo(
    () => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(aiQuery)}`,
    [aiQuery]
  );
  const europePmcUrl = useMemo(
    () => `https://europepmc.org/search?query=${encodeURIComponent(aiQuery)}`,
    [aiQuery]
  );

  const labels = locale === 'ko'
    ? {
        title: 'AI 논문 검색',
        keyword: '추가 키워드',
        query: 'AI Query',
        submit: '검색',
        loading: '논문 검색 중...',
        empty: '결과가 없습니다.',
        error: '내장 검색 연결에 실패했습니다. 아래 링크로 바로 검색해 주세요.',
        year: '연도',
        journal: '저널',
        authors: '저자',
        quickLinks: '바로 검색',
        pubmed: 'PubMed 열기',
        europePmc: 'Europe PMC 열기',
      }
    : {
        title: 'AI Paper Search',
        keyword: 'Extra keywords',
        query: 'AI Query',
        submit: 'Search',
        loading: 'Searching papers...',
        empty: 'No results.',
        error: 'Embedded search failed. Use direct links below.',
        year: 'Year',
        journal: 'Journal',
        authors: 'Authors',
        quickLinks: 'Direct search',
        pubmed: 'Open PubMed',
        europePmc: 'Open Europe PMC',
      };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = `https://api.openalex.org/works?search=${encodeURIComponent(aiQuery)}&per-page=8&sort=relevance_score:desc`;
      const response = await fetch(endpoint, { method: 'GET' });
      if (!response.ok) throw new Error(`OpenAlex ${response.status}`);
      const payload = (await response.json()) as OpenAlexResponse;
      const works = payload.results ?? [];
      setRows(
        works.map((work, index) => ({
          id: `${work.id || index}`,
          title: work.display_name || '(No title)',
          year: work.publication_year ? String(work.publication_year) : '-',
          journal: work.primary_location?.source?.display_name || '-',
          authors: work.authorships?.map((a) => a.author?.display_name).filter(Boolean).join(', ') || '-',
          url: resolveOpenAlexUrl(work),
        }))
      );
    } catch {
      setRows([]);
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-medium">{labels.title}</h3>
      <form className="space-y-2" onSubmit={onSubmit}>
        <label className="block text-xs text-slate-700">
          {labels.keyword}
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="mt-1 h-10 w-full rounded border border-slate-300 px-2"
            placeholder={locale === 'ko' ? '예: influenza PBMC cytokine' : 'e.g. influenza PBMC cytokine'}
          />
        </label>
        <div>
          <p className="text-[11px] text-slate-600">{labels.query}</p>
          <p className="rounded border border-slate-200 bg-slate-50 p-1 text-[11px] text-slate-700">{aiQuery}</p>
        </div>
        <button type="submit" className="rounded bg-slate-900 px-2 py-1.5 text-xs text-white" disabled={loading}>
          {labels.submit}
        </button>
      </form>

      {loading ? <p className="text-xs text-slate-600">{labels.loading}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? <p className="text-xs text-slate-500">{labels.empty}</p> : null}
      <div className="rounded border border-slate-200 bg-slate-50 p-2">
        <p className="text-[11px] font-medium text-slate-700">{labels.quickLinks}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <a href={pubmedUrl} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-700 underline">
            {labels.pubmed}
          </a>
          <a href={europePmcUrl} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-700 underline">
            {labels.europePmc}
          </a>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-2 text-xs">
            <a href={row.url} target="_blank" rel="noreferrer" className="font-medium text-indigo-700 underline">
              {row.title}
            </a>
            <p className="mt-1 text-slate-600">
              {labels.year}: {row.year}
            </p>
            <p className="text-slate-600">
              {labels.journal}: {row.journal}
            </p>
            <p className="text-slate-600">
              {labels.authors}: {row.authors}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
