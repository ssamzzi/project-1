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
import { GelLoadingCalculator } from './GelLoadingCalculator';
import { RcfRpmCalculator } from './RcfRpmCalculator';
import { ReconstitutionCalculator } from './ReconstitutionCalculator';
import { QpcrRelativeQuantCalculator } from './QpcrRelativeQuantCalculator';
import { CellDoublingTimeCalculator } from './CellDoublingTimeCalculator';
import { CloningHelperCalculator } from './CloningHelperCalculator';
import { AcidDilutionCalculator } from './AcidDilutionCalculator';
import { TransformationEfficiencyCalculator } from './TransformationEfficiencyCalculator';
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
      case 'rcf-rpm':
        return <RcfRpmCalculator locale={locale} tips={tips} toolName={title} />;
      case 'reconstitution':
        return <ReconstitutionCalculator locale={locale} tips={tips} toolName={title} />;
      case 'gel-loading':
        return <GelLoadingCalculator locale={locale} tips={tips} toolName={title} />;
      case 'qpcr-relative-quant':
        return <QpcrRelativeQuantCalculator locale={locale} tips={tips} toolName={title} />;
      case 'cell-doubling-time':
        return <CellDoublingTimeCalculator locale={locale} tips={tips} toolName={title} />;
      case 'cloning-helper':
        return <CloningHelperCalculator locale={locale} tips={tips} toolName={title} />;
      case 'acid-dilution':
        return <AcidDilutionCalculator locale={locale} tips={tips} toolName={title} />;
      case 'transformation-efficiency':
        return <TransformationEfficiencyCalculator locale={locale} tips={tips} toolName={title} />;
      default:
        return <div>{locale === 'ko' ? '도구를 찾을 수 없습니다.' : 'Tool not found.'}</div>;
    }
  }, [slug, tips, locale, title]);

  return <div>{content}</div>;
}
