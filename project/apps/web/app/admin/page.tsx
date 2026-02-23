"use client";

import { useMemo, useState } from 'react';
import { useAdmin } from '../../lib/context/AdminContext';
import { useLocale } from '../../lib/context/LocaleContext';
import { AI_TOKEN_STORAGE_KEY } from '../../lib/ai/config';

type CommentTab = 'advice' | 'questions';
type LegacyTab = 'protocol' | 'mistakes' | 'ranges' | 'troubleshooting' | 'comments';

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
  tab: CommentTab;
}

const FEEDBACK_KEY_PREFIX = 'biolt-tips-feedback-v1';
const COMMENT_TABS: CommentTab[] = ['advice', 'questions'];

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
      const parsed = JSON.parse(raw) as Partial<Record<CommentTab | LegacyTab, FeedbackItem[]>>;
      const advice = Array.isArray(parsed.advice)
        ? parsed.advice
        : [
            ...(Array.isArray(parsed.comments) ? parsed.comments : []),
            ...(Array.isArray(parsed.protocol) ? parsed.protocol : []),
            ...(Array.isArray(parsed.mistakes) ? parsed.mistakes : []),
            ...(Array.isArray(parsed.ranges) ? parsed.ranges : []),
            ...(Array.isArray(parsed.troubleshooting) ? parsed.troubleshooting : []),
          ];
      const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      advice.forEach((item) => rows.push({ ...item, calculatorId, tab: 'advice' }));
      questions.forEach((item) => rows.push({ ...item, calculatorId, tab: 'questions' }));
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
    const parsed = JSON.parse(raw) as Partial<Record<CommentTab | LegacyTab, FeedbackItem[]>>;
    const migratedAdvice = Array.isArray(parsed.advice)
      ? parsed.advice
      : [
          ...(Array.isArray(parsed.comments) ? parsed.comments : []),
          ...(Array.isArray(parsed.protocol) ? parsed.protocol : []),
          ...(Array.isArray(parsed.mistakes) ? parsed.mistakes : []),
          ...(Array.isArray(parsed.ranges) ? parsed.ranges : []),
          ...(Array.isArray(parsed.troubleshooting) ? parsed.troubleshooting : []),
        ];
    const migratedQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const normalized: Record<CommentTab, FeedbackItem[]> = {
      advice: migratedAdvice,
      questions: migratedQuestions,
    };
    const current: FeedbackItem[] = normalized[target.tab];
    const next = current
      .map((item) => (item.id === target.id ? updater(item) : item))
      .filter((item): item is FeedbackItem => item !== null);
    normalized[target.tab] = next;
    window.localStorage.setItem(key, JSON.stringify(normalized));
  } catch {
    // ignore
  }
}

export default function AdminPage() {
  const { isAdmin } = useAdmin();
  const { locale } = useLocale();
  const [rows, setRows] = useState<AdminRow[]>(() => parseRows());
  const [apiKey, setApiKey] = useState<string>(() => (typeof window === 'undefined' ? '' : window.localStorage.getItem(AI_TOKEN_STORAGE_KEY) || ''));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | CommentTab>('all');

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
            apiTitle: 'AI 설정',
            apiLabel: 'Hugging Face Token',
            apiSave: '저장',
            apiSaved: '저장됨',
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
            apiTitle: 'AI Settings',
            apiLabel: 'Hugging Face Token',
            apiSave: 'Save',
            apiSaved: 'Saved',
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
          onChange={(event) => setFilterTab(event.target.value as 'all' | CommentTab)}
        >
          <option value="all">{labels.all}</option>
          {COMMENT_TABS.map((tab) => (
            <option key={tab} value={tab}>
              {tab === 'advice' ? (locale === 'ko' ? '실험 조언' : 'Experimental Advice') : locale === 'ko' ? '문의사항' : 'Questions'}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded border border-slate-200 bg-white p-3">
        <h2 className="text-sm font-semibold">{labels.apiTitle}</h2>
        <label className="mt-2 block text-xs text-slate-600">
          {labels.apiLabel}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              className="h-10 min-w-[280px] rounded border border-slate-300 px-2"
              placeholder="hf_..."
            />
            <button
              className="rounded bg-slate-900 px-2 py-1.5 text-xs text-white"
              onClick={() => {
                try {
                  window.localStorage.setItem(AI_TOKEN_STORAGE_KEY, apiKey.trim());
                  window.dispatchEvent(new Event('biolt-ai-key-change'));
                } catch {
                  // ignore
                }
              }}
            >
              {labels.apiSave}
            </button>
          </div>
        </label>
        <p className="mt-1 text-[11px] text-slate-500">{labels.apiSaved}: {apiKey.trim() ? 'OK' : '-'}</p>
      </section>

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
