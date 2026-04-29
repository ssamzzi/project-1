export const exampleKoText: Record<string, { title: string; summary: string; audience: string }> = {
  'pcr-master-mix-25ul': {
    title: '25 uL PCR 반응용 마스터믹스 예제',
    summary: 'overage와 control well을 포함해 25 uL endpoint PCR 반응을 세팅하는 worked example입니다.',
    audience: 'routine endpoint PCR 또는 초기 assay 검증을 준비하는 연구자',
  },
  'serial-dilution-10fold-standard-curve': {
    title: '표준곡선용 10배 연속 희석 예제',
    summary: 'carryover 실수 없이 표준곡선 희석 시리즈를 만드는 방법을 보여주는 예제입니다.',
    audience: 'qPCR standard, titration panel, assay 민감도 점검을 준비하는 사용자',
  },
  'cell-seeding-6well-example': {
    title: '6-well plate 세포 시딩 예제',
    summary: 'live cell count를 실제 6-well 실험용 시딩 계획으로 바꾸는 예제입니다.',
    audience: 'routine culture 또는 treatment assay를 위해 mammalian cell을 시딩하는 연구자',
  },
  'hemocytometer-trypan-blue-example': {
    title: '헤모사이토미터와 trypan blue 예제',
    summary: '수동 chamber count를 viable cell concentration과 viability로 변환하는 예제입니다.',
    audience: '수동 계수를 사용하며 계산 과정을 깔끔하게 확인하고 싶은 연구자',
  },
  'ligation-ratio-example': {
    title: 'insert와 vector 계획을 위한 ligation 비율 예제',
    summary: 'vector mass, fragment length, target molar ratio로 insert 양을 정하는 예제입니다.',
    audience: 'routine cloning reaction을 세팅하고 mass ratio 실수를 줄이고 싶은 연구자',
  },
  'ddct-interpretation-example': {
    title: 'qPCR ddCt 해석 예제',
    summary: 'Ct 값을 dCt, ddCt, fold-change로 바꾸고 해석 포인트를 확인하는 예제입니다.',
    audience: 'relative expression analysis를 사용하고 결과 해석 가능성을 점검하는 연구자',
  },
  'a260-purity-check-example': {
    title: 'PCR 전 A260 순도 점검 예제',
    summary: '핵산 prep이 downstream 실험에 충분한지, cleanup이 필요한지 판단하는 예제입니다.',
    audience: 'DNA 또는 RNA prep이 PCR, cloning, qPCR에 적합한지 확인하는 연구자',
  },
  'copy-number-standard-prep-example': {
    title: 'qPCR 표준 준비를 위한 copy number 예제',
    summary: 'DNA 질량을 copy number로 변환하고 replicate에 충분한 표준 시리즈를 계획하는 예제입니다.',
    audience: 'qPCR 또는 assay sensitivity check용 plasmid/amplicon standard를 준비하는 연구자',
  },
  'transformation-efficiency-example': {
    title: '클로닝 후 transformation efficiency 예제',
    summary: 'CFU per microgram을 계산하고 낮은 colony 결과의 원인을 해석하는 예제입니다.',
    audience: 'ligation 또는 control plasmid transformation 결과를 검토하는 연구자',
  },
  'rcf-rpm-conversion-example': {
    title: '새 rotor에서 RCF를 RPM으로 변환하는 예제',
    summary: '다른 rotor radius를 가진 원심분리기에서 published RCF 조건을 맞추는 예제입니다.',
    audience: '논문, kit, 다른 실험실의 centrifuge 조건을 자기 장비에 맞추는 연구자',
  },
  'pipetting-overage-planning-example': {
    title: 'pipetting overage 계획 예제',
    summary: 'dead volume과 반복 분주를 고려해 master mix를 얼마나 더 준비할지 정하는 예제입니다.',
    audience: 'PCR, qPCR, enzyme reaction, plate assay를 반복 분주로 준비하는 연구자',
  },
  'rna-no-rt-control-example': {
    title: 'RNA qPCR의 no-RT control 예제',
    summary: 'no-RT control로 cDNA 신호와 genomic DNA carryover를 구분하는 예제입니다.',
    audience: 'RNA sample로 expression analysis를 준비하는 연구자',
  },
  'gel-smear-troubleshooting-example': {
    title: 'gel smear 문제 해결 예제',
    summary: 'smear가 PCR 문제인지 sample quality 또는 전기영동 조건 문제인지 판단하는 예제입니다.',
    audience: 'endpoint PCR, cleanup product, extracted nucleic acid를 확인하는 연구자',
  },
  'cell-viability-plating-decision-example': {
    title: '세포 생존율 기반 plating 판단 예제',
    summary: 'viability가 예상보다 낮을 때 시딩, 재계수, 회복 중 무엇을 선택할지 판단하는 예제입니다.',
    audience: 'manual counting 후 treatment plate나 routine passage를 준비하는 연구자',
  },
  'buffer-working-stock-example': {
    title: 'buffer working stock 제조 예제',
    summary: 'working stock을 만들 때 농도, 라벨링, 보관 기록을 함께 관리하는 예제입니다.',
    audience: 'buffer, supplement, additive, routine working stock을 준비하는 연구자',
  },
  'plate-layout-edge-effect-example': {
    title: 'edge effect를 고려한 plate layout 예제',
    summary: 'plate 위치 효과가 생물학적 차이처럼 보이지 않도록 sample과 control을 배치하는 예제입니다.',
    audience: 'cell assay, qPCR plate, plate-reader 실험을 계획하는 연구자',
  },
};

export const exampleSectionHeadingKo: Record<string, string> = {
  Scenario: '상황',
  'Inputs to confirm': '확인할 입력값',
  'How a researcher would use the result': '연구자가 결과를 사용하는 방식',
  'How to use the output': '출력값을 사용하는 방식',
  'Why this is valuable': '이 예제가 유용한 이유',
  'Why this matters': '중요한 이유',
  'How the example helps': '예제가 도와주는 점',
  'Why this page adds value': '이 페이지의 가치',
  'How to use the result': '결과를 사용하는 방식',
  'Common failure points': '자주 생기는 실패 지점',
};

export function getExampleText(locale: 'en' | 'ko', example: { slug: string; title: string; summary: string; audience: string }) {
  if (locale !== 'ko') {
    return example;
  }
  const ko = exampleKoText[example.slug];
  return {
    ...example,
    title: ko?.title || example.title,
    summary: ko?.summary || example.summary,
    audience: ko?.audience || example.audience,
  };
}

export function getExampleSectionHeading(locale: 'en' | 'ko', heading: string) {
  return locale === 'ko' ? exampleSectionHeadingKo[heading] || heading : heading;
}
