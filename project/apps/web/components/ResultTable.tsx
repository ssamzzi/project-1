"use client";

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  rows: Record<string, unknown>[];
}

export function ResultTable({ columns, rows }: Props) {
  const copy = async () => {
    const header = columns.map((c) => c.label).join('\t');
    const body = rows
      .map((r) =>
        columns
          .map((c) => String((r as Record<string, unknown>)[c.key] ?? ''))
          .join('\t')
      )
      .join('\n');
    const tsv = `${header}\n${body}`;
    await navigator.clipboard.writeText(tsv);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[420px] text-sm" aria-label="result table">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th className="p-2 text-left text-xs font-medium text-slate-600" key={col.key}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-100">
                {columns.map((col) => (
                  <td className="p-2" key={col.key}>
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={copy}
        className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
      >
        Copy table (TSV)
      </button>
    </div>
  );
}
