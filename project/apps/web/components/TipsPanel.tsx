'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../lib/context/LocaleContext';
import { applyTips, type TipContext } from '../lib/tips';
import type { CalculatorTip, TipTab } from '../lib/types';

const tabs: TipTab[] = ['protocol', 'mistakes', 'ranges', 'troubleshooting'];

type SortMode = 'likes' | 'latest';

interface FeedbackItem {
  id: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: number;
}

const FEEDBACK_STORAGE_PREFIX = 'biolt-tips-feedback-v1';

function storageKey(calculatorId: string) {
  return `${FEEDBACK_STORAGE_PREFIX}:${calculatorId}`;
}

function loadFeedback(calculatorId: string): Record<TipTab, FeedbackItem[]> {
  try {
    const raw = window.localStorage.getItem(storageKey(calculatorId));
    if (!raw) return { protocol: [], mistakes: [], ranges: [], troubleshooting: [] };
    const parsed = JSON.parse(raw) as Partial<Record<TipTab, FeedbackItem[]>>;

    return {
      protocol: Array.isArray(parsed.protocol) ? parsed.protocol : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      ranges: Array.isArray(parsed.ranges) ? parsed.ranges : [],
      troubleshooting: Array.isArray(parsed.troubleshooting) ? parsed.troubleshooting : [],
    };
  } catch {
    return { protocol: [], mistakes: [], ranges: [], troubleshooting: [] };
  }
}

const fallbackStorage = { protocol: [], mistakes: [], ranges: [], troubleshooting: [] };

const tabLabelMap: Record<TipTab, keyof typeof fallbackStorage> = {
  protocol: 'protocol',
  mistakes: 'mistakes',
  ranges: 'ranges',
  troubleshooting: 'troubleshooting',
};

const tabTitleFallback = {
  protocol: 'Protocol quick steps',
  mistakes: 'Common mistakes',
  ranges: 'Recommended ranges',
  troubleshooting: 'Troubleshooting',
};

const tabTitleKoFallback = {
  protocol: '실험 절차 빠른 요약',
  mistakes: '자주 하는 실수',
  ranges: '권장 범위',
  troubleshooting: '문제 해결',
};

interface DisqusLikeWindow extends Window {
  DISQUS?: {
    reset: (options: { reload: boolean }) => void;
  };
  disqus_config?: () => void;
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
  const { t, locale } = useLocale();
  const [active, setActive] = useState<TipTab>('protocol');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<Record<TipTab, FeedbackItem[]>>(fallbackStorage);

  useEffect(() => {
    const initial = loadFeedback(calculatorId);
    setFeedback(initial);
  }, [calculatorId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(calculatorId), JSON.stringify(feedback));
    } catch {
      // no-op when storage unavailable
    }
  }, [calculatorId, feedback]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const pageUrl = window.location.href;
    const identifier = `${window.location.pathname}::${calculatorId}`;
    const disqusWindow = window as DisqusLikeWindow;

    disqusWindow.disqus_config = function () {
      const context = this as {
        page: {
          url: string;
          identifier: string;
        };
      };
      context.page.url = pageUrl;
      context.page.identifier = identifier;
    };

    if (!document.getElementById('biolt-disqus-embed')) {
      const script = document.createElement('script');
      script.id = 'biolt-disqus-embed';
      script.src = 'https://project-bio-lab-1.disqus.com/embed.js';
      script.setAttribute('data-timestamp', String(Date.now()));
      script.async = true;
      document.body.appendChild(script);
    } else if (disqusWindow.DISQUS) {
      disqusWindow.DISQUS.reset({ reload: true });
    }
  }, [calculatorId]);

  const tabTips = useMemo(() => {
    return applyTips(
      tips.filter((tip) => tip.calculatorId === calculatorId),
      active,
      context
    );
  }, [tips, active, context.values, context.computed]);

  const localeTabTitle = useMemo(() => {
    if (locale === 'ko') {
      return {
        protocol: t('global.tip.protocol') || tabTitleKoFallback.protocol,
        mistakes: t('global.tip.mistakes') || tabTitleKoFallback.mistakes,
        ranges: t('global.tip.ranges') || tabTitleKoFallback.ranges,
        troubleshooting: t('global.tip.troubleshooting') || tabTitleKoFallback.troubleshooting,
      };
    }

    return {
      protocol: t('global.tip.protocol') || tabTitleFallback.protocol,
      mistakes: t('global.tip.mistakes') || tabTitleFallback.mistakes,
      ranges: t('global.tip.ranges') || tabTitleFallback.ranges,
      troubleshooting: t('global.tip.troubleshooting') || tabTitleFallback.troubleshooting,
    };
  }, [locale, t]);

  const tabFeedback = useMemo(() => {
    const current = feedback[active] || [];
    const copy = [...current];
    if (sortMode === 'likes') {
      return copy.sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
    }
    return copy.sort((a, b) => b.createdAt - a.createdAt);
  }, [active, feedback, sortMode]);

  const handleAddFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }

    const next: FeedbackItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      likes: 0,
      dislikes: 0,
      createdAt: Date.now(),
    };

    setFeedback((prev) => ({
      ...prev,
      [active]: [next, ...prev[active]],
    }));
    setDraft('');
  };

  const toggleLike = (id: string) => {
    setFeedback((prev) => ({
      ...prev,
      [active]: prev[active].map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item)),
    }));
  };

  const toggleDislike = (id: string) => {
    setFeedback((prev) => ({
      ...prev,
      [active]: prev[active].map((item) => (item.id === id ? { ...item, dislikes: item.dislikes + 1 } : item)),
    }));
  };

  const tabTitle = (tab: TipTab) => localeTabTitle[tabLabelMap[tab]];
  const placeholder =
    locale === 'ko' ? `${localeTabTitle[active]}에 대한 의견을 남겨주세요` : `Add a note for ${localeTabTitle[active]}`;
  const noTipMessage = locale === 'ko' ? '이 탭에 등록된 팁이 없습니다.' : 'No tips for this tab yet.';
  const noFeedbackMessage = locale === 'ko' ? '아직 의견이 없습니다.' : 'No notes yet.';
  const submitLabel = locale === 'ko' ? '등록' : 'Add';

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold">Tips</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tabs.map((tab) => {
          const activeClass = tab === active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`rounded-md px-2 py-1.5 text-xs ${activeClass}`}
            >
              {tabTitle(tab)}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        {tabTips.map((tip) => {
          const color =
            tip.severity === 'critical'
              ? 'text-rose-900 bg-rose-50 border-rose-200'
              : tip.severity === 'warn'
              ? 'text-amber-900 bg-amber-50 border-amber-200'
              : 'text-sky-900 bg-sky-50 border-sky-200';
          return (
            <article key={tip.id} className={`rounded border p-2 ${color}`}>
              <p className="font-medium">{tip.title}</p>
              <p>{tip.body}</p>
              {tip.references?.length ? (
                <ul className="mt-2 list-disc pl-5">
                  {tip.references.map((r) => (
                    <li key={r.url}>
                      <a className="text-indigo-700 underline" href={r.url} target="_blank" rel="noreferrer">
                        {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
        {tabTips.length === 0 ? <p>{noTipMessage}</p> : null}
      </div>

      <section className="rounded border border-slate-200 bg-slate-50 p-2 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium">{t('tips.comments')}</h3>
          <label className="text-xs text-slate-600">
            {t('tips.sortLabel')}:
            <select
              className="ml-2 rounded border border-slate-300 bg-white px-2 py-1"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value === 'likes' ? 'likes' : 'latest')}
            >
              <option value="latest">{t('tips.sortLatest')}</option>
              <option value="likes">{t('tips.sortLikes')}</option>
            </select>
          </label>
        </div>

        <form className="mt-2 space-y-2" onSubmit={handleAddFeedback}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="min-h-[70px] w-full rounded border border-slate-300 px-2 py-1"
          />
          <button className="rounded bg-slate-900 px-2 py-1.5 text-xs text-white" type="submit">
            {submitLabel}
          </button>
        </form>

        <div className="mt-3 space-y-2">
          {tabFeedback.length === 0 ? <p className="text-slate-500">{noFeedbackMessage}</p> : null}
          {tabFeedback.map((item) => (
            <article key={item.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
              <p>{item.text}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="rounded bg-slate-100 px-2 py-1" onClick={() => toggleLike(item.id)}>
                  {t('tips.like')} {item.likes}
                </button>
                <button type="button" className="rounded bg-slate-100 px-2 py-1" onClick={() => toggleDislike(item.id)}>
                  {t('tips.dislike')} {item.dislikes}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div id="disqus_thread" className="mt-3"></div>
        <noscript>Enable JavaScript to view Disqus comments.</noscript>
      </section>
    </section>
  );
}
