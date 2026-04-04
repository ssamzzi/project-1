"use client";
import { useMemo, useState } from 'react';
import { encodeCalculatorState } from '../lib/share/url';

interface Props {
  state: Record<string, unknown>;
}

export function ShareLinkButton({ state }: Props) {
  const shareUrl = useMemo(() => encodeCalculatorState(state), [state]);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('success');
    } catch {
      setCopyState('error');
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
        onClick={copy}
      >
        Share link
      </button>
      {copyState === 'success' ? <p className="text-xs text-emerald-700">Link copied.</p> : null}
      {copyState === 'error' ? <p className="text-xs text-rose-700">Copy failed. Please copy the URL manually.</p> : null}
    </div>
  );
}
