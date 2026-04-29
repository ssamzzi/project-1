"use client";

import Link from 'next/link';
import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function AboutPage() {
  const { t, locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? 'BioLT 소개' : 'About BioLT'}>
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <p className="font-semibold text-slate-900">{isKo ? '짧게 소개하면' : 'Short version'}</p>
            <p className="mt-2">
              {isKo
                ? 'BioLT는 생물학 대학원 과정을 밟고 있는 학생이 문헌, 수업, 프로토콜을 공부하며 자주 마주치는 계산과 기록 문제를 정리하기 위해 만든 학습형 참고 사이트입니다.'
                : 'BioLT is a practical biology reference built by a graduate student to organize recurring calculation, documentation, and interpretation questions encountered while studying protocols and life-science coursework.'}
            </p>
          </div>

          <p>
            {isKo
              ? 'BioLT는 분자생물학과 세포생물학을 공부할 때 자주 등장하는 계산기, 해설 가이드, 예제, 워크플로 정리를 제공하는 생명과학 학습 보조 사이트입니다.'
              : 'BioLT publishes calculators, explanatory guides, worked examples, and workflow references for studying molecular and cell biology concepts.'}
          </p>

          <p>
            {isKo
              ? '저는 현재 생물학 관련 대학원 과정을 밟고 있으며, 아직 직접 실험을 수행한 경험이 있는 연구자는 아닙니다. 대신 수업 자료, 논문, 키트 매뉴얼, 공개 프로토콜을 공부하면서 PCR, qPCR, 세포 배양, 농도 계산, 희석 계획, 클로닝 준비처럼 반복적으로 등장하는 계산이 생각보다 쉽게 헷갈린다는 점을 느꼈습니다.'
              : 'I am currently in graduate-level biology training, but I am not presenting this site as the work of an experienced bench researcher. I built BioLT while studying coursework, papers, kit manuals, and public protocols, where topics such as PCR, qPCR, cell culture, dilution planning, cloning preparation, and concentration checks repeatedly raised practical calculation questions.'}
          </p>

          <p>
            {isKo
              ? '그래서 이 사이트는 “내가 직접 검증한 실험 노하우”를 주장하기보다, 초보자가 공부 과정에서 놓치기 쉬운 단위, 희석 배수, overage, control, 기록 방식 같은 항목을 차분히 정리하는 방향으로 만들었습니다. 계산 결과만 보여 주는 것이 아니라 왜 그 값을 확인해야 하는지, 어떤 가정이 들어가는지, 나중에 검토하려면 무엇을 남겨야 하는지도 함께 설명하려고 합니다.'
              : 'For that reason, BioLT does not claim to be a collection of personally validated bench tricks. It is designed as a careful learning reference that organizes units, dilution factors, overage, controls, and documentation habits that beginners can easily miss while studying.'}
          </p>

          <p>
            {isKo
              ? '사이트의 목적은 실험 전 학습과 준비 단계에서 필요한 값을 빠르게 검토하고, 계산 결과의 가정과 주의점까지 함께 보여 주는 것입니다.'
              : 'The goal is to help users review setup values quickly while also documenting assumptions, common mistakes, and practical caveats around those values.'}
          </p>

          <p>
            {isKo
              ? 'BioLT는 단순한 계산기 목록이 아니라, 생명과학을 배우는 사람이 계산의 맥락을 이해하고 참고할 수 있는 설명형 자료실이 되는 것을 목표로 합니다.'
              : 'BioLT is intended to be more than a list of calculators. Each public page is meant to provide reusable context for learners who want to understand the calculation behind a protocol.'}
          </p>

          <p>
            {isKo
              ? '계산 결과는 교육 및 준비 보조용이며 최종 실험 조건은 반드시 실험실 SOP, 키트 매뉴얼, 장비 제한, 지도자 또는 담당 연구자의 검토를 통해 확정해야 합니다.'
              : 'Outputs are intended for educational support and experiment preparation. Final conditions must be confirmed with local SOPs, kit manuals, instrument limits, and supervisor review.'}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{isKo ? '계산' : 'Calculations'}</p>
              <p className="mt-1 text-xs leading-6">
                {isKo
                  ? '반응 조성, 희석, copy number, seeding density처럼 자주 등장하는 값을 빠르게 확인합니다.'
                  : 'Fast checks for reaction setup, dilution, copy number, and seeding density.'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{isKo ? '해석' : 'Interpretation'}</p>
              <p className="mt-1 text-xs leading-6">
                {isKo
                  ? '숫자가 의미 있으려면 어떤 가정과 control이 필요한지 함께 정리합니다.'
                  : 'Notes explain which assumptions and controls make a number meaningful.'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{isKo ? '기록' : 'Documentation'}</p>
              <p className="mt-1 text-xs leading-6">
                {isKo
                  ? '나중에 다시 검토할 수 있도록 입력값, 단위, 가정, 변경점을 남기는 방식을 강조합니다.'
                  : 'The site emphasizes inputs, units, assumptions, and deviations that can be reviewed later.'}
              </p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900">{isKo ? '이 사이트가 필요한 이유' : 'Why this site exists'}</p>
            <p className="mt-2">
              {isKo
                ? '생명과학을 공부하다 보면 이론은 이해했는데 계산 단위, 희석 단계, control 구성, 기록 방식에서 막히는 경우가 많습니다. BioLT는 그런 지점을 한곳에 모아 초보자도 계산의 흐름을 따라가고, 더 경험 있는 사람에게 확인받기 전에 스스로 점검할 수 있게 돕는 것을 목표로 합니다.'
                : 'When studying life science, it is common to understand the theory but still get stuck on units, dilution steps, controls, or documentation. BioLT collects those practical checkpoints so beginners can follow the logic and review their setup before asking a more experienced person to confirm it.'}
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
