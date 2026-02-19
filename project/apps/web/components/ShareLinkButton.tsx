"use client";
import { useMemo } from 'react';
import { encodeCalculatorState } from '../lib/share/url';

interface Props {
  state: Record<string, unknown>;
}

export function ShareLinkButton({ state }: Props) {
  const shareUrl = useMemo(() => encodeCalculatorState(state), [state]);

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <button
      type="button"
      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
      onClick={copy}
    >
      Share link
    </button>
  );
}
