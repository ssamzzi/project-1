import type { ValidationMessage } from '../lib/types';

export function ValidationBanner({ messages }: { messages: ValidationMessage[] }) {
  if (!messages.length) return null;
  const critical = messages.filter((m) => m.severity === 'critical');
  const warn = messages.filter((m) => m.severity === 'warn');
  const info = messages.filter((m) => m.severity === 'info');

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      {critical.length > 0 ? (
        <section className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-900">
          <p className="text-sm font-medium">Blocking issues</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {critical.map((m) => (
              <li key={m.code}>{m.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {warn.length > 0 ? (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <p className="text-sm font-medium">Warnings</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {warn.map((m) => (
              <li key={m.code}>{m.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {info.length > 0 ? (
        <section className="rounded-lg border border-sky-300 bg-sky-50 p-3 text-sky-900">
          <p className="text-sm font-medium">Notes</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {info.map((m) => (
              <li key={m.code}>{m.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
