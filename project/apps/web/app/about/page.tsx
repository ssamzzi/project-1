"use client";
import { useLocale } from '../../lib/context/LocaleContext';
import { SectionCard } from '../../components/SectionCard';
import Link from 'next/link';

export default function AboutPage() {
  const { t, locale } = useLocale();
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={t('about.title')}>
        <p className="text-sm text-slate-700">{t('about.disclaimer')}</p>
        <p className="mt-2 text-sm text-slate-700">
          {t('about.contact')}: <a href={t('about.placeholder')} className="underline">
            kkgh6721255@naver.com
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Instagram:{' '}
          <a href={t('about.instagramUrl')} target="_blank" rel="noreferrer" className="underline">
            {t('about.instagramLabel')}
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-700">{t('about.privacy')}</p>
        <p className="mt-2 text-sm text-slate-700">
          <Link href="/privacy" className="underline">
            {locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="underline">
            {locale === 'ko' ? '이용약관' : 'Terms'}
          </Link>{' '}
          ·{' '}
          <Link href="/editorial" className="underline">
            {locale === 'ko' ? '콘텐츠 원칙' : 'Editorial Policy'}
          </Link>
        </p>
      </SectionCard>
    </section>
  );
}
