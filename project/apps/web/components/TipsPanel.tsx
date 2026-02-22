'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../lib/context/LocaleContext';
import { useAdmin } from '../lib/context/AdminContext';
import { applyTips, type TipContext } from '../lib/tips';
import type { CalculatorTip, TipTab } from '../lib/types';

const TABS: TipTab[] = ['protocol', 'mistakes', 'ranges', 'troubleshooting'];
type TabWithComments = TipTab | 'comments';

type SortMode = 'likes' | 'latest';
type VoteType = 'like' | 'dislike';

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

interface FeedbackDraft {
  nickname: string;
  password: string;
  text: string;
}

type FeedbackState = Record<TabWithComments, FeedbackItem[]>;
type VoteState = Record<string, VoteType>;

const FEEDBACK_KEY_PREFIX = 'biolt-tips-feedback-v1';
const VOTES_KEY_PREFIX = 'biolt-tips-votes-v1';
const TABS_WITH_COMMENTS: TabWithComments[] = [...TABS, 'comments'];

const EMPTY_FEEDBACK: FeedbackState = {
  protocol: [],
  mistakes: [],
  ranges: [],
  troubleshooting: [],
  comments: [],
};

function feedbackKey(calculatorId: string) {
  return `${FEEDBACK_KEY_PREFIX}:${calculatorId}`;
}

function votesKey(calculatorId: string) {
  return `${VOTES_KEY_PREFIX}:${calculatorId}`;
}

function isValid4DigitPassword(value: string) {
  return /^\d{4}$/.test(value);
}

function loadFeedback(calculatorId: string): FeedbackState {
  if (typeof window === 'undefined') {
    return EMPTY_FEEDBACK;
  }
  try {
    const raw = window.localStorage.getItem(feedbackKey(calculatorId));
    if (!raw) return EMPTY_FEEDBACK;
  const parsed = JSON.parse(raw) as Partial<FeedbackState>;
    return {
      protocol: Array.isArray(parsed.protocol) ? parsed.protocol : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      ranges: Array.isArray(parsed.ranges) ? parsed.ranges : [],
      troubleshooting: Array.isArray(parsed.troubleshooting) ? parsed.troubleshooting : [],
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    };
  } catch {
    return EMPTY_FEEDBACK;
  }
}

function loadVotes(calculatorId: string): VoteState {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(votesKey(calculatorId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VoteState;
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function toLocaleDate(ts: number, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function getTabLabel(tab: TipTab) {
  return {
    protocol: 'protocol',
    mistakes: 'mistakes',
    ranges: 'ranges',
    troubleshooting: 'troubleshooting',
  }[tab];
}

export function TipsPanel({
  calculatorId,
  tips,
  context,
}: {
  calculatorId: string;
  tips: CalculatorTip[];
  context: TipContext;
}) {
  const { locale, t } = useLocale();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabWithComments>('protocol');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);
  const [votes, setVotes] = useState<VoteState>({});
  const [draft, setDraft] = useState<FeedbackDraft>({ nickname: '', password: '', text: '' });
  const [submitError, setSubmitError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editPasswordById, setEditPasswordById] = useState<Record<string, string>>({});
  const [deletePasswordById, setDeletePasswordById] = useState<Record<string, string>>({});
  const [rowErrorById, setRowErrorById] = useState<Record<string, string>>({});

  useEffect(() => {
    setFeedback(loadFeedback(calculatorId));
    setVotes(loadVotes(calculatorId));
    setEditingId(null);
    setEditingText('');
    setEditPasswordById({});
    setDeletePasswordById({});
    setRowErrorById({});
    setSubmitError('');
  }, [calculatorId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(feedbackKey(calculatorId), JSON.stringify(feedback));
    } catch {
      // ignore
    }
  }, [calculatorId, feedback]);

  useEffect(() => {
    try {
      window.localStorage.setItem(votesKey(calculatorId), JSON.stringify(votes));
    } catch {
      // ignore
    }
  }, [calculatorId, votes]);

  const activeIsComments = activeTab === 'comments';
  const tabTips = useMemo(() => {
    if (activeIsComments) {
      return [];
    }
    return applyTips(
      tips.filter((tip) => tip.calculatorId === calculatorId),
      activeTab,
      context
    );
  }, [activeIsComments, tips, activeTab, context.values, context.computed]);

  const tabLabels = useMemo(() => {
    return {
      protocol: t('global.tip.protocol') || 'Protocol quick steps',
      mistakes: t('global.tip.mistakes') || 'Common mistakes',
      ranges: t('global.tip.ranges') || 'Recommended ranges',
      troubleshooting: t('global.tip.troubleshooting') || 'Troubleshooting',
      comments: t('tips.commentSection') || 'Comments',
    };
  }, [t]);

  const tabEntries = useMemo(() => {
    return [...feedback[activeTab]].sort((a, b) => {
      if (sortMode === 'likes') {
        return b.likes - a.likes || b.createdAt - a.createdAt;
      }
      return b.createdAt - a.createdAt;
    });
  }, [activeTab, feedback, sortMode]);

  const setVote = (id: string, type: VoteType) => {
    const previous = votes[id];
    let next = feedback[activeTab].map((item) => {
      if (item.id !== id) {
        return item;
      }

      if (previous === type) {
        return {
          ...item,
          likes: type === 'like' ? item.likes - 1 : item.likes,
          dislikes: type === 'dislike' ? item.dislikes - 1 : item.dislikes,
        };
      }

      if (previous === 'like' && type === 'dislike') {
        return { ...item, likes: item.likes - 1, dislikes: item.dislikes + 1 };
      }
      if (previous === 'dislike' && type === 'like') {
        return { ...item, likes: item.likes + 1, dislikes: item.dislikes - 1 };
      }

      return {
        ...item,
        likes: type === 'like' ? item.likes + 1 : item.likes,
        dislikes: type === 'dislike' ? item.dislikes + 1 : item.dislikes,
      };
    });

    setFeedback((prev) => ({ ...prev, [activeTab]: next }));
    setVotes((prev) => {
      const nextVotes = { ...prev };
      if (previous === type) {
        delete nextVotes[id];
      } else {
        nextVotes[id] = type;
      }
      return nextVotes;
    });
  };

  const canAct = (inputPassword: string, savedPassword: string) => isAdmin || inputPassword === savedPassword;

  const submitErrorText = submitError || '';

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nickname = draft.nickname.trim();
    const password = draft.password.trim();
    const text = draft.text.trim();

    if (!nickname) {
      setSubmitError(t('tips.commentDraftRequired') || 'Please enter nickname.');
      return;
    }
    if (!isValid4DigitPassword(password)) {
      setSubmitError(t('tips.passwordRequired') || 'Password must be 4 digits.');
      return;
    }
    if (!text) {
      setSubmitError(t('tips.commentDraftRequired') || 'Please enter a note.');
      return;
    }

    const item: FeedbackItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      nickname,
      password,
      text,
      likes: 0,
      dislikes: 0,
      createdAt: Date.now(),
    };

    setFeedback((prev) => ({ ...prev, [activeTab]: [item, ...prev[activeTab]] }));
    setDraft({ nickname: '', password: '', text: '' });
    setSubmitError('');
  };

  const saveEdit = (id: string, savedPassword: string) => {
    const text = editingText.trim();
    const password = (editPasswordById[id] || '').trim();
    if (!canAct(password, savedPassword)) {
      setRowErrorById((prev) => ({ ...prev, [id]: t('tips.passwordRequired') || 'Password required.' }));
      return;
    }
    if (!text) {
      setRowErrorById((prev) => ({ ...prev, [id]: t('tips.commentDraftRequired') || 'Please enter a note.' }));
      return;
    }

    setFeedback((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) => (item.id === id ? { ...item, text, updatedAt: Date.now() } : item)),
    }));
    setEditingId(null);
    setEditingText('');
    setRowErrorById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const removeComment = (id: string, savedPassword: string) => {
    const password = isAdmin ? 'admin' : (deletePasswordById[id] || '').trim();
    if (!canAct(password, savedPassword)) {
      setRowErrorById((prev) => ({ ...prev, [id]: t('tips.passwordRequired') || 'Password required.' }));
      return;
    }

    setFeedback((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }));
    setVotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRowErrorById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setDeletePasswordById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold">Tips</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TABS_WITH_COMMENTS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-2 py-1.5 text-xs ${
              activeTab === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        {!activeIsComments ? (
          <>
        {tabTips.map((tip) => (
          <article
            key={tip.id}
            className={`rounded border p-2 ${
              tip.severity === 'critical'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : tip.severity === 'warn'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-sky-200 bg-sky-50 text-sky-900'
            }`}
          >
            <p className="font-medium">{tip.title}</p>
            <p>{tip.body}</p>
            {tip.references?.length ? (
              <ul className="mt-2 list-disc pl-5">
                {tip.references.map((reference) => (
                  <li key={reference.url}>
                    <a href={reference.url} target="_blank" rel="noreferrer" className="underline">
                      {reference.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
            {tabTips.length === 0 ? <p>{locale === 'ko' ? '이 탭에 등록된 팁이 없습니다.' : 'No tips for this tab yet.'}</p> : null}
          </>
        ) : null}
      </div>

      {activeIsComments ? (
        <section className="rounded border border-slate-200 bg-slate-50 p-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">{t('tips.commentSection') || 'Comments'}</h3>
            <label className="text-xs text-slate-600">
              {t('tips.sortLabel') || 'Sort notes'}:
              <select
                className="ml-2 rounded border border-slate-300 bg-white px-2 py-1"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value === 'likes' ? 'likes' : 'latest')}
              >
                <option value="latest">{t('tips.sortLatest') || 'Latest'}</option>
                <option value="likes">{t('tips.sortLikes') || 'Most liked'}</option>
              </select>
            </label>
          </div>

          <form className="mt-2 space-y-2" onSubmit={handleAdd}>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-slate-600">
                {t('tips.nickname') || 'Nickname'}
                <input
                  value={draft.nickname}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      nickname: event.target.value.slice(0, 20),
                    }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  placeholder={t('tips.nickname') || 'Nickname'}
                />
              </label>
              <label className="text-xs text-slate-600">
                {t('tips.passwordLabel') || 'Password'}
                <input
                  value={draft.password}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      password: event.target.value.replace(/[^0-9]/g, '').slice(0, 4),
                    }))
                  }
                  type="password"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  inputMode="numeric"
                  placeholder={t('tips.passwordPlaceholder') || '1234'}
                />
              </label>
            </div>
            <textarea
              value={draft.text}
              onChange={(event) => setDraft((prev) => ({ ...prev, text: event.target.value }))}
              placeholder={`${t('tips.comments') || 'Comment'}: ${tabLabels[activeTab]}`}
              className="min-h-[80px] w-full rounded border border-slate-300 px-2 py-1"
            />
            {submitErrorText ? <p className="text-xs text-rose-600">{submitErrorText}</p> : null}
            <button
              className="rounded bg-slate-900 px-2 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={draft.nickname.trim().length === 0 || !isValid4DigitPassword(draft.password) || draft.text.trim().length === 0}
              type="submit"
            >
              {t('tips.addComment') || 'Add'}
            </button>
          </form>

          <div className="mt-3 space-y-2">
            {tabEntries.length === 0 ? <p className="text-slate-500">{locale === 'ko' ? '아직 의견이 없습니다.' : 'No notes yet.'}</p> : null}
            {tabEntries.map((item) => (
              <article key={item.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                <div className="mb-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-600">
                  <span className="font-medium">{item.nickname}</span>
                  <span>{toLocaleDate(item.createdAt, locale)}</span>
                  {item.updatedAt ? <span>(edited {toLocaleDate(item.updatedAt, locale)})</span> : null}
                </div>
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                    <label className="text-xs text-slate-600">
                      {t('tips.passwordLabel') || 'Password'}
                      <input
                        value={editPasswordById[item.id] || ''}
                        onChange={(event) =>
                          setEditPasswordById((prev) => ({
                            ...prev,
                            [item.id]: event.target.value.replace(/[^0-9]/g, '').slice(0, 4),
                          }))
                        }
                        type="password"
                        className="ml-2 rounded border border-slate-300 px-2 py-1"
                        inputMode="numeric"
                        placeholder={t('tips.passwordPlaceholder') || '1234'}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded bg-slate-900 px-2 py-1 text-white"
                        onClick={() => saveEdit(item.id, item.password)}
                      >
                        {t('tips.edit') || 'Save'}
                      </button>
                      <button
                        type="button"
                        className="rounded bg-slate-100 px-2 py-1"
                        onClick={() => {
                          setEditingId(null);
                          setEditingText('');
                          setRowErrorById((prev) => {
                            const next = { ...prev };
                            delete next[item.id];
                            return next;
                          });
                        }}
                      >
                        {t('tips.cancel') || 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{item.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button type="button" className="rounded bg-slate-100 px-2 py-1" onClick={() => setVote(item.id, 'like')}>
                        {t('tips.like') || 'Like'} {item.likes}
                      </button>
                      <button type="button" className="rounded bg-slate-100 px-2 py-1" onClick={() => setVote(item.id, 'dislike')}>
                        {t('tips.dislike') || 'Dislike'} {item.dislikes}
                      </button>
                      <button type="button" className="rounded bg-slate-100 px-2 py-1" onClick={() => setEditingId(item.id)}>
                        {t('tips.edit') || 'Edit'}
                      </button>
                      <button
                        type="button"
                        className="rounded bg-slate-100 px-2 py-1 text-rose-700"
                        onClick={() => removeComment(item.id, item.password)}
                      >
                        {t('tips.delete') || 'Delete'}
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="text-[11px] text-slate-500">
                        {t('tips.commentDeleteHint') || 'Password required to edit/delete'}
                        <input
                          value={deletePasswordById[item.id] || ''}
                          onChange={(event) =>
                            setDeletePasswordById((prev) => ({
                              ...prev,
                              [item.id]: event.target.value.replace(/[^0-9]/g, '').slice(0, 4),
                            }))
                          }
                          type="password"
                          className="ml-2 rounded border border-slate-300 px-2 py-1"
                          inputMode="numeric"
                          placeholder={t('tips.passwordPlaceholder') || '1234'}
                        />
                      </label>
                    </div>
                  </>
                )}
                {rowErrorById[item.id] ? <p className="mt-1 text-xs text-rose-600">{rowErrorById[item.id]}</p> : null}
              </article>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {t('tips.authorOnly') || 'Editing and deleting a comment needs the writer password. Admin can delete any comment.'}
          </p>
        </section>
      ) : null}
    </section>
  );
}
