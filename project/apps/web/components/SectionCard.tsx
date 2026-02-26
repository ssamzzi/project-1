interface Props {
  title: string;
  children: React.ReactNode;
}

export function SectionCard({ title, children }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm">
      <h2 className="mb-3 border-b border-slate-100 pb-2 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
