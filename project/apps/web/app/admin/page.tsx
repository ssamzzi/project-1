"use client";

import { useMemo, useState } from 'react';
import { useAdmin } from '../../lib/context/AdminContext';
import { useLocale } from '../../lib/context/LocaleContext';

type TabWithComments = 'protocol' | 'mistakes' | 'ranges' | 'troubleshooting' | 'comments';

interface FeedbackItem {
  id: string;
  text: string;
  nickname: string;
  password: string;
  likes: number;
  dislikes: number;
  createdAt: number;
  updatedAt?: number;
}

interface AdminRow extends FeedbackItem {
  calculatorId: string;
  tab: TabWithComments;
}

const FEEDBACK_KEY_PREFIX = 'biolt-tips-feedback-v1';
const TABS: TabWithComments[] = ['protocol', 'mistakes', 'ranges', 'troubleshooting', 'comments'];

function toDate(ts: number, locale: 'en' | 'ko') {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(ts));
}

function parseRows(): AdminRow[] {
  if (typeof window === 'undefined') return [];
  const rows: AdminRow[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(`${FEEDBACK_KEY_PREFIX}:`)) continue;
    const calculatorId = key.slice(`${FEEDBACK_KEY_PREFIX}:`.length);
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Partial<Record<TabWithComments, FeedbackItem[]>>;
      TABS.forEach((tab) => {
        const list = Array.isArray(parsed[tab]) ? parsed[tab] : [];
        list.forEach((item) => rows.push({ ...item, calculatorId, tab }));
      });
    } catch {
      // ignore malformed local item
    }
  }
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

function updateStorageRow(target: AdminRow, updater: (item: FeedbackItem) => FeedbackItem | null) {
  const key = `${FEEDBACK_KEY_PREFIX}:${target.calculatorId}`;
  const raw = window.localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<Record<TabWithComments, FeedbackItem[]>>;
    const current: FeedbackItem[] = Array.isArray(parsed[target.tab]) ? (parsed[target.tab] as FeedbackItem[]) : [];
    const next = current
      .map((item) => (item.id === target.id ? updater(item) : item))
      .filter((item): item is FeedbackItem => item !== null);
    parsed[target.tab] = next;
    window.localStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export default function AdminPage() {
  const { isAdmin } = useAdmin();
  const { locale } = useLocale();
  const [rows, setRows] = useState<AdminRow[]>(() => parseRows());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | TabWithComments>('all');

  const labels = useMemo(
    () =>
      locale === 'ko'
        ? {
            title: '관리자 창',
            blocked: '관리자 로그인 후 접근 가능합니다.',
            reload: '새로고침',
            all: '전체',
            empty: '의견이 없습니다.',
            save: '저장',
            cancel: '취소',
            edit: '수정',
            remove: '삭제',
            tab: '탭',
            tool: '도구',
            created: '작성',
            updated: '수정',
          }
        : {
            title: 'Admin Panel',
            blocked: 'Admin login is required.',
            reload: 'Reload',
            all: 'All',
            empty: 'No comments.',
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            remove: 'Delete',
            tab: 'Tab',
            tool: 'Tool',
            created: 'Created',
            updated: 'Updated',
          },
    [locale]
  );

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{labels.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{labels.blocked}</p>
      </section>
    );
  }

  const filtered = rows.filter((row) => filterTab === 'all' || row.tab === filterTab);

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{labels.title}</h1>
        <button className="rounded border border-slate-300 px-2 py-1 text-sm" onClick={() => setRows(parseRows())}>
          {labels.reload}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label>{labels.tab}</label>
        <select
          className="rounded border border-slate-300 px-2 py-1"
          value={filterTab}
          onChange={(event) => setFilterTab(event.target.value as 'all' | TabWithComments)}
        >
          <option value="all">{labels.all}</option>
          {TABS.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? <p className="text-sm text-slate-600">{labels.empty}</p> : null}
        {filtered.map((row) => (
          <article key={`${row.calculatorId}-${row.tab}-${row.id}`} className="rounded border border-slate-200 bg-white p-3 text-sm">
            <div className="mb-2 flex flex-wrap gap-3 text-xs text-slate-600">
              <span>
                {labels.tool}: <strong>{row.calculatorId}</strong>
              </span>
              <span>
                {labels.tab}: <strong>{row.tab}</strong>
              </span>
              <span>
                {labels.created}: {toDate(row.createdAt, locale)}
              </span>
              {row.updatedAt ? (
                <span>
                  {labels.updated}: {toDate(row.updatedAt, locale)}
                </span>
              ) : null}
            </div>
            <p className="mb-2 text-xs text-slate-600">{row.nickname}</p>
            {editingId === row.id ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="min-h-[90px] w-full rounded border border-slate-300 px-2 py-1"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
                    onClick={() => {
                      const nextText = editingText.trim();
                      if (!nextText) return;
                      updateStorageRow(row, (item) => ({ ...item, text: nextText, updatedAt: Date.now() }));
                      setRows(parseRows());
                      setEditingId(null);
                      setEditingText('');
                    }}
                  >
                    {labels.save}
                  </button>
                  <button
                    className="rounded bg-slate-100 px-2 py-1 text-xs"
                    onClick={() => {
                      setEditingId(null);
                      setEditingText('');
                    }}
                  >
                    {labels.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>{row.text}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded bg-slate-100 px-2 py-1 text-xs"
                    onClick={() => {
                      setEditingId(row.id);
                      setEditingText(row.text);
                    }}
                  >
                    {labels.edit}
                  </button>
                  <button
                    className="rounded bg-slate-100 px-2 py-1 text-xs text-rose-700"
                    onClick={() => {
                      updateStorageRow(row, () => null);
                      setRows(parseRows());
                    }}
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
