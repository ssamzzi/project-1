"use client";

import { useMemo } from 'react';
import { useLocale } from '../../lib/context/LocaleContext';
import { toolMetas } from '../../lib/data/tools';
import { PcrMasterMixCalculator } from './PcrMasterMixCalculator';
import { MultiStockMixCalculator } from './MultiStockMixCalculator';
import { SerialDilutionCalculator } from './SerialDilutionCalculator';
import { CopyNumberCalculator } from './CopyNumberCalculator';
import { LigationCalculator } from './LigationCalculator';
import { A260Calculator } from './A260Calculator';
import { CellSeedingCalculator } from './CellSeedingCalculator';
import { HemocytometerCalculator } from './HemocytometerCalculator';
import type { CalculatorTip } from '../../lib/types';
import enTipsRaw from '../../content/tips/en.json';
import koTipsRaw from '../../content/tips/ko.json';

const enTips = enTipsRaw as CalculatorTip[];
const koTips = koTipsRaw as CalculatorTip[];

export function ToolCalculatorClient({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const tool = toolMetas.find((x) => x.slug === slug);
  const tips = locale === 'ko' ? koTips : enTips;

  const title = locale === 'ko' ? (tool?.nameKo || slug) : (tool?.nameEn || slug);

  const content = useMemo(() => {
    switch (slug) {
      case 'pcr-master-mix':
        return <PcrMasterMixCalculator locale={locale} tips={tips} toolName={title} />;
      case 'multi-stock-mix':
        return <MultiStockMixCalculator locale={locale} tips={tips} toolName={title} />;
      case 'serial-dilution':
        return <SerialDilutionCalculator locale={locale} tips={tips} toolName={title} />;
      case 'copy-number':
        return <CopyNumberCalculator locale={locale} tips={tips} toolName={title} />;
      case 'ligation':
        return <LigationCalculator locale={locale} tips={tips} toolName={title} />;
      case 'a260':
        return <A260Calculator locale={locale} tips={tips} toolName={title} />;
      case 'cell-seeding':
        return <CellSeedingCalculator locale={locale} tips={tips} toolName={title} />;
      case 'hemocytometer':
        return <HemocytometerCalculator locale={locale} tips={tips} toolName={title} />;
      default:
        return <div>Tool not found</div>;
    }
  }, [slug, tips, locale, title]);

  return <div>{content}</div>;
}
