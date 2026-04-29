"use client";

import Link from 'next/link';
import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function AboutPage() {
  const { t, locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title="About BioLT">
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <p className="font-semibold text-slate-900">{isKo ? '짧게 소개하면' : 'Short version'}</p>
            <p className="mt-2">
              {isKo
                ? 'BioLT는 생물학 대학원생이 실제 실험 준비 중 반복해서 마주치는 계산, 기록, 해석 문제를 줄이기 위해 만든 실험 준비용 참고 사이트입니다.'
                : 'BioLT is a practical lab preparation reference built by a biology graduate student to reduce repeated calculation, documentation, and interpretation mistakes before experiments.'}
            </p>
          </div>
          <p>
            {isKo
              ? 'BioLT는 분자생물학과 세포생물학 실험 준비에 자주 필요한 계산, 예제, 워크플로 정리를 제공하는 실험실 보조 사이트입니다.'
              : 'BioLT is a lab support site that publishes calculators, explanatory guides, worked examples, and workflow references for molecular and cell biology work.'}
          </p>
          <p>
            {isKo
              ? '저는 생물학 분야에서 대학원 과정을 밟으며 PCR, qPCR, 세포 배양, 농도 계산, 희석 계획, 클로닝 준비처럼 매일 반복되는 작은 계산들이 실제 실험 품질에 큰 영향을 준다는 것을 자주 경험했습니다. 계산 자체는 복잡하지 않아 보여도 단위 하나, 희석 배수 하나, overage 하나를 놓치면 실험 전체를 다시 해야 하는 경우가 생깁니다.'
              : 'I built BioLT while working through graduate-level biology training, where routine tasks such as PCR setup, qPCR planning, cell culture, dilution design, cloning preparation, and concentration checks repeatedly showed how small calculation choices can affect an entire experiment.'}
          </p>
          <p>
            {isKo
              ? '이 사이트는 그런 반복적인 준비 과정을 조금 더 안전하고 재현 가능하게 만들기 위해 시작했습니다. 단순히 정답 숫자만 보여주는 계산기가 아니라, 왜 그 값을 확인해야 하는지, 어떤 control이 필요한지, 결과를 어떻게 기록해야 나중에 다시 검토할 수 있는지까지 함께 정리하는 것을 목표로 합니다.'
              : 'The site is meant to make those repeated preparation steps safer and more reproducible. Instead of showing only final numbers, it tries to explain why the values matter, which controls should be considered, and how the result can be documented for later review.'}
          </p>
          <p>
            {isKo
              ? '사이트의 목적은 실험 전에 필요한 값을 빠르게 검토하고 계산 결과의 가정과 주의점까지 함께 보여 주는 것입니다.'
              : 'The goal is to help users review setup values quickly while also documenting assumptions, common mistakes, and practical caveats around those values.'}
          </p>
          <p>
            {isKo
              ? 'BioLT는 단순한 계산기 목록이 아니라 실제 연구자가 벤치 전에 참고할 수 있는 설명형 자료와 검증 체크포인트를 함께 제공하는 것을 지향합니다.'
              : 'BioLT is intended to be more than a list of calculators. Each public page is meant to provide reusable context that a researcher can refer to before bench work.'}
          </p>
          <p>
            {isKo
              ? '계산 결과는 교육 및 준비 보조용이며 최종 실험 조건은 반드시 실험실 SOP, 키트 매뉴얼, 장비 제한, 지도자 검토를 통해 확정해야 합니다.'
              : 'Outputs are intended for educational support and experiment preparation. Final conditions must be confirmed with local SOPs, kit manuals, instrument limits, and supervisor review.'}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{isKo ? '계산' : 'Calculations'}</p>
              <p className="mt-1 text-xs leading-6">
                {isKo ? '반응 조성, 희석, copy number, 시딩 밀도처럼 자주 쓰는 값을 빠르게 확인합니다.' : 'Fast checks for reaction setup, dilution, copy number, and seeding density.'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{isKo ? '해석' : 'Interpretation'}</p>
              <p className="mt-1 text-xs leading-6">
                {isKo ? '숫자가 의미 있으려면 어떤 가정과 control이 필요한지 함께 정리합니다.' : 'Notes explain which assumptions and controls make a number meaningful.'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{isKo ? '기록' : 'Documentation'}</p>
              <p className="mt-1 text-xs leading-6">
                {isKo ? '실험 후 다시 검토할 수 있도록 입력값, 단위, 변경점을 남기는 방식을 강조합니다.' : 'The site emphasizes inputs, units, assumptions, and deviations that can be reviewed later.'}
              </p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900">{isKo ? '왜 이런 사이트가 필요한가' : 'Why this site exists'}</p>
            <p className="mt-2">
              {isKo
                ? '실험실에서는 큰 이론보다 작은 준비 실수가 시간을 더 많이 잡아먹을 때가 많습니다. template 농도를 잘못 옮겨 적거나, plate layout을 급하게 만들거나, control을 뒤늦게 추가하거나, 희석 시리즈의 최종 부피를 충분히 잡지 않으면 실험 결과가 애매해집니다. BioLT는 이런 실수를 줄이는 작은 안전장치가 되는 것을 목표로 합니다.'
                : 'In the lab, small preparation mistakes often consume more time than the theory itself. A copied concentration, rushed plate layout, missing control, or underplanned dilution series can make an experiment difficult to interpret. BioLT is intended to act as a small guardrail against those avoidable errors.'}
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">{isKo ? '운영 및 문의' : 'Operator and contact'}</p>
            <p>
              {isKo ? '문의 이메일' : 'Contact email'}:{' '}
              <a href={t('about.placeholder')} className="underline">
                kkgh6721255@naver.com
              </a>
            </p>
            <p>
              Instagram:{' '}
              <a href={t('about.instagramUrl')} target="_blank" rel="noreferrer" className="underline">
                {t('about.instagramLabel')}
              </a>
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">{isKo ? '정책 문서' : 'Policy pages'}</p>
            <p>
              <Link href="/privacy" className="underline">
                {isKo ? '개인정보처리방침' : 'Privacy Policy'}
              </Link>{' '}
              /{' '}
              <Link href="/terms" className="underline">
                {isKo ? '이용약관' : 'Terms'}
              </Link>{' '}
              /{' '}
              <Link href="/editorial" className="underline">
                {isKo ? '편집 정책' : 'Editorial Policy'}
              </Link>
            </p>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
