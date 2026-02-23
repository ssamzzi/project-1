"use client";

import { useEffect, useMemo, useState } from 'react';
import { encodeCalculatorState } from '../lib/share/url';

interface RecentCalculationItem {
  id: string;
  calculatorId: string;
  url: string;
  createdAt: number;
}

const RECENT_CALCULATIONS_KEY = 'biolt-recent-calculations-v1';
const MAX_RECENT_ITEMS = 60;
const PAGE_SIZE = 5;

function loadItems(): RecentCalculationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_CALCULATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentCalculationItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.calculatorId === 'string' &&
        typeof item.url === 'string' &&
        typeof item.createdAt === 'number'
    );
  } catch {
    return [];
  }
}

function saveItems(items: RecentCalculationItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_CALCULATIONS_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

function formatDate(ts: number, locale: 'en' | 'ko') {
  try {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export function RecentCalculationsPanel({
  calculatorId,
  shareState,
  locale,
}: {
  calculatorId: string;
  shareState: Record<string, unknown>;
  locale: 'en' | 'ko';
}) {
  const [items, setItems] = useState<RecentCalculationItem[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setItems(loadItems());
  }, []);

  useEffect(() => {
    const onStorage = () => setItems(loadItems());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const labels =
    locale === 'ko'
      ? {
          title: '최근 계산',
          save: '현재 계산 저장',
          load: '불러오기',
          prev: '이전',
          next: '다음',
          page: '페이지',
          empty: '저장된 계산 기록이 없습니다.',
        }
      : {
          title: 'Recent Calculations',
          save: 'Save current calculation',
          load: 'Load',
          prev: 'Prev',
          next: 'Next',
          page: 'Page',
          empty: 'No saved calculations yet.',
        };

  const filtered = useMemo(
    () =>
      items
        .filter((item) => item.calculatorId === calculatorId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [items, calculatorId]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSaveCurrent = () => {
    const url = encodeCalculatorState(shareState);
    const nextItem: RecentCalculationItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      calculatorId,
      url,
      createdAt: Date.now(),
    };
    const current = loadItems();
    const deduped = current.filter((item) => !(item.calculatorId === calculatorId && item.url === url));
    const next = [nextItem, ...deduped].slice(0, MAX_RECENT_ITEMS);
    saveItems(next);
    setItems(next);
    setPage(1);
  };

  return (
    <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{labels.title}</h3>
        <button type="button" className="rounded bg-slate-900 px-2 py-1.5 text-xs text-white" onClick={handleSaveCurrent}>
          {labels.save}
        </button>
      </div>
      {filtered.length === 0 ? <p className="text-xs text-slate-500">{labels.empty}</p> : null}
      <ul className="space-y-2">
        {paged.map((item) => (
          <li key={item.id} className="rounded border border-slate-200 p-2 text-xs">
            <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>{formatDate(item.createdAt, locale)}</span>
              <button
                type="button"
                className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-800"
                onClick={() => {
                  window.location.href = item.url;
                }}
              >
                {labels.load}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-end gap-2 text-xs text-slate-600">
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            {labels.prev}
          </button>
          <span>
            {labels.page} {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {labels.next}
          </button>
        </div>
      ) : null}
    </section>
  );
}
