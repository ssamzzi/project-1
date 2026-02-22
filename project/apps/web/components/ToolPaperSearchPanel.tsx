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

interface CrossrefItem {
  DOI?: string;
  title?: string[];
  issued?: { 'date-parts'?: number[][] };
  'container-title'?: string[];
  author?: Array<{ given?: string; family?: string; name?: string }>;
}

interface CrossrefResponse {
  message?: {
    items?: CrossrefItem[];
  };
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

function resolvePaperUrl(result: EuropePmcResult): string {
  if (result.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`;
  if (result.doi) return `https://doi.org/${result.doi}`;
  if (result.id) return `https://europepmc.org/article/MED/${result.id}`;
  return 'https://europepmc.org';
}

export function ToolPaperSearchPanel({ calculatorId, locale, toolTitle }: { calculatorId: string; locale: 'en' | 'ko'; toolTitle: string }) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<PaperResult[]>([]);

  const searchTerms = QUERY_HINTS[calculatorId] ?? [toolTitle];
  const aiQuery = useMemo(() => {
    const base = `(${searchTerms.map((term) => `"${term}"`).join(' OR ')})`;
    const extra = sanitizeKeyword(keyword);
    const extraClause = extra.length ? `(${extra.map((term) => `"${term}"`).join(' AND ')})` : '';
    return [base, extraClause].filter(Boolean).join(' AND ');
  }, [keyword, searchTerms]);

  const labels = locale === 'ko'
    ? {
        title: 'AI 논문 검색',
        keyword: '추가 키워드',
        query: 'AI Query',
        submit: '검색',
        loading: '논문 검색 중...',
        empty: '결과가 없습니다.',
        error: '논문 검색 중 오류가 발생했습니다.',
        year: '연도',
        journal: '저널',
        authors: '저자',
      }
    : {
        title: 'AI Paper Search',
        keyword: 'Extra keywords',
        query: 'AI Query',
        submit: 'Search',
        loading: 'Searching papers...',
        empty: 'No results.',
        error: 'Paper search failed.',
        year: 'Year',
        journal: 'Journal',
        authors: 'Authors',
      };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const query = aiQuery;
    try {
      const endpoint = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=8&sort=RELEVANCE&query=${encodeURIComponent(
        aiQuery
      )}`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const payload = (await response.json()) as EuropePmcResponse;
        const results = payload.resultList?.result ?? [];
        setRows(
          results.map((item, index) => ({
            id: `${item.id || item.pmid || index}`,
            title: item.title || '(No title)',
            year: item.pubYear || '-',
            journal: item.journalTitle || '-',
            authors: item.authorString || '-',
            url: resolvePaperUrl(item),
          }))
        );
      } else {
        throw new Error(`EuropePMC ${response.status}`);
      }
    } catch {
      try {
        const fallback = `https://api.crossref.org/works?rows=8&query=${encodeURIComponent(query)}`;
        const response = await fetch(fallback);
        if (!response.ok) throw new Error(`Crossref ${response.status}`);
        const payload = (await response.json()) as CrossrefResponse;
        const items = payload.message?.items ?? [];
        setRows(
          items.map((item, index) => ({
            id: `${item.DOI || index}`,
            title: item.title?.[0] || '(No title)',
            year: String(item.issued?.['date-parts']?.[0]?.[0] ?? '-'),
            journal: item['container-title']?.[0] || '-',
            authors:
              item.author?.map((a) => a.name || [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean).join(', ') || '-',
            url: item.DOI ? `https://doi.org/${item.DOI}` : 'https://api.crossref.org',
          }))
        );
      } catch {
        setRows([]);
        setError(labels.error);
      }
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
