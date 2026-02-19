"use client";
import { useLocale } from '../../lib/context/LocaleContext';
import { SectionCard } from '../../components/SectionCard';

export default function AboutPage() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={t('about.title')}>
        <p className="text-sm text-slate-700">{t('about.disclaimer')}</p>
        <p className="mt-2 text-sm text-slate-700">{t('about.contact')}: {t('about.placeholder')}</p>
        <p className="mt-2 text-sm text-slate-700">No data is stored. No login or database is used.</p>
      </SectionCard>
    </section>
  );
}
