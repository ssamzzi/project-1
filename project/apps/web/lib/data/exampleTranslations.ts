import type { ExampleMeta } from './examples';

type ExampleKo = {
  title: string;
  summary: string;
  audience: string;
  sections: ExampleMeta['sections'];
};

export const exampleKoText: Record<string, ExampleKo> = {
  'pcr-master-mix-25ul': {
    title: '25 uL PCR 반응용 마스터믹스 예제',
    summary: '10개 반응을 준비할 때 control과 overage를 포함해 PCR master mix를 계산하는 예제입니다.',
    audience: 'endpoint PCR을 처음 세팅하거나 반복 반응을 준비하는 학습자',
    sections: [
      { heading: '상황', body: ['시료 8개, positive control 1개, no-template control 1개를 각각 25 uL로 준비한다고 가정합니다.', '이 예제의 핵심은 시약을 녹이기 전에 총 반응 수, control, overage를 먼저 확정하는 것입니다.'] },
      { heading: '확인할 입력값', body: ['총 반응 수는 10개입니다.', '마스터믹스 준비 중 손실을 줄이기 위해 10-15% 정도의 overage를 더합니다.', 'primer 농도와 polymerase 조건이 사용하려는 kit 설명서와 맞는지 확인합니다.'] },
      { heading: '결과 활용법', body: ['계산 결과로 하나의 공통 master mix를 만든 뒤 각 tube나 well에 같은 부피로 분주합니다.', '최종 시약 표를 기록해 두면 같은 조건을 다시 준비할 때 재계산 실수를 줄일 수 있습니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['control을 총 반응 수에 넣지 않는 경우가 많습니다.', '총 부피는 맞지만 stock 농도가 예시와 다른 경우 결과가 틀어집니다.', 'master mix가 완전히 맞춰지기 전에 template를 넣으면 반응 간 차이가 커질 수 있습니다.'] },
    ],
  },
  'serial-dilution-10fold-standard-curve': {
    title: '표준곡선용 10배 연속 희석 예제',
    summary: 'qPCR standard curve를 만들 때 carryover와 부피 부족을 피하는 희석 계획 예제입니다.',
    audience: 'qPCR standard, titration panel, assay sensitivity check를 준비하는 사용자',
    sections: [
      { heading: '상황', body: ['농축 stock에서 10배씩 6단계 희석한 표준곡선 시리즈를 준비합니다.', '각 단계의 transfer volume을 일정하게 유지하고 replicate에 충분한 최종 부피를 남기는 것이 중요합니다.'] },
      { heading: '확인할 입력값', body: ['목표 희석 배수와 각 단계에서 옮길 부피를 먼저 정합니다.', '각 tube가 replicate와 재측정을 감당할 만큼 충분한 부피를 갖는지 확인합니다.', '반복 작업 중 tube 순서를 헷갈리지 않도록 시작 전에 라벨을 붙입니다.'] },
      { heading: '왜 유용한가', body: ['희석 배수 개념은 쉬워 보여도 실제 준비에서는 부피, 혼합, tube 순서에서 실수가 자주 생깁니다.', '이 페이지는 단순 희석 계산을 표준곡선 준비 절차로 바꿔 줍니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['tip을 재사용해 낮은 농도 tube가 오염되는 경우가 있습니다.', '각 단계에서 충분히 섞지 않으면 다음 tube 농도가 틀어집니다.', 'replicate 계획을 늦게 넣으면 마지막 농도에서 부피가 부족해질 수 있습니다.'] },
    ],
  },
  'cell-seeding-6well-example': {
    title: '6-well plate 세포 시딩 예제',
    summary: 'live cell count를 실제 6-well plate 시딩 계획으로 바꾸는 예제입니다.',
    audience: '세포 배양이나 treatment assay를 준비하는 학습자',
    sections: [
      { heading: '상황', body: ['세포를 회수해 count한 뒤 6-well plate에 일정한 밀도로 seeding해야 합니다.', '중요한 것은 최종 숫자뿐 아니라 count, viability 확인, 계산, 분주의 순서를 지키는 것입니다.'] },
      { heading: '확인할 입력값', body: ['최근 count에서 얻은 초기 세포 농도를 사용합니다.', 'assay 설계에 따라 well당 세포 수 또는 면적당 세포 수를 정합니다.', 'well당 최종 부피와 dead volume을 고려한 overage를 함께 넣습니다.'] },
      { heading: '결과 활용법', body: ['well마다 따로 계산하지 말고 하나의 mixed suspension을 준비합니다.', '세포가 가라앉지 않도록 분주 직전에 다시 섞습니다.', 'passage number와 morphology 관찰도 함께 기록합니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['count 후 시간이 지나 suspension이 가라앉은 상태로 plating하는 경우가 있습니다.', 'plate format마다 growth area가 다르다는 점을 잊기 쉽습니다.', 'total count와 viable count를 같은 값처럼 취급하면 seeding density가 달라집니다.'] },
    ],
  },
  'hemocytometer-trypan-blue-example': {
    title: 'Hemocytometer와 trypan blue 예제',
    summary: '수동 chamber count를 viable cell concentration과 viability로 바꾸는 예제입니다.',
    audience: '수동 세포 계수를 사용하며 계산 과정을 확인하려는 사용자',
    sections: [
      { heading: '상황', body: ['세포 suspension을 trypan blue와 섞고 hemocytometer의 여러 칸을 세었다고 가정합니다.', '이 예제는 count 값을 cells per mL와 viability로 변환하는 흐름을 보여 줍니다.'] },
      { heading: '확인할 입력값', body: ['count한 square 수와 dilution factor를 확인합니다.', 'live cell과 dead cell을 따로 기록해야 합니다.', 'sampling noise를 줄이기 위해 충분한 square를 세는 것이 좋습니다.'] },
      { heading: '중요한 이유', body: ['수동 계수는 작은 실험실이나 troubleshooting 상황에서 여전히 자주 사용됩니다.', '예제가 있으면 단위와 희석 배수 실수가 seeding 단계까지 이어지는 것을 줄일 수 있습니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['너무 적은 square만 세어 평균이 불안정해집니다.', 'clump를 하나로 볼지 여러 세포로 볼지 기준이 흔들립니다.', 'dilution factor가 농도와 viability 해석 모두에 영향을 준다는 점을 놓치기 쉽습니다.'] },
    ],
  },
  'ligation-ratio-example': {
    title: 'Insert와 vector ligation ratio 예제',
    summary: 'vector mass, fragment length, target molar ratio로 insert 양을 정하는 예제입니다.',
    audience: 'cloning reaction에서 mass ratio 실수를 줄이고 싶은 사용자',
    sections: [
      { heading: '상황', body: ['vector 양과 insert/vector 길이를 알고 있으며 실제 ligation 계획을 세워야 합니다.', '이 예제는 최종 부피보다 molar ratio 논리를 먼저 다룹니다.'] },
      { heading: '확인할 입력값', body: ['최종 construct map에서 vector와 insert 길이를 확인합니다.', 'cleanup 또는 정량 후 실제로 사용할 수 있는 DNA mass를 확인합니다.', '목표 molar ratio와 sub-microliter pipetting을 피하기 위한 중간 희석 필요성을 검토합니다.'] },
      { heading: '예제가 도와주는 점', body: ['DNA 길이, DNA mass, 반응 설계를 연결해 볼 수 있습니다.', 'cloning workflow와 함께 보면 ligation이 전체 과정에서 어디에 위치하는지 이해하기 쉽습니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['molar ratio 대신 mass ratio만 사용합니다.', 'construct 수정 후 fragment length를 업데이트하지 않습니다.', '너무 진한 stock 때문에 실제 분주 가능 부피가 지나치게 작아집니다.'] },
    ],
  },
  'ddct-interpretation-example': {
    title: 'qPCR ddCt 해석 예제',
    summary: 'Ct 값을 dCt, ddCt, fold-change로 바꾸고 해석상 주의점을 확인하는 예제입니다.',
    audience: 'relative expression analysis 결과가 해석 가능한지 점검하는 사용자',
    sections: [
      { heading: '상황', body: ['sample과 control의 target/reference gene Ct 값이 있습니다.', '이 예제는 raw Ct에서 fold-change까지의 흐름과 해석이 흔들리는 지점을 함께 보여 줍니다.'] },
      { heading: '확인할 입력값', body: ['sample과 control 각각의 target Ct와 reference Ct가 필요합니다.', 'reference gene이 해당 생물학적 조건에서 안정적인지 확인해야 합니다.', '결과를 요약하기 전에 replicate spread가 허용 가능한지 봅니다.'] },
      { heading: '왜 유용한가', body: ['계산기는 답을 빠르게 주지만, 예제는 그 답을 언제 믿지 말아야 하는지 알려 줍니다.', '이 차이가 페이지를 단순 계산기가 아니라 교육 자료로 만들어 줍니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['불안정한 reference gene을 사용합니다.', '검출 한계에 가까운 높은 Ct 값을 과해석합니다.', 'replicate consistency를 보기 전에 fold-change만 해석합니다.'] },
    ],
  },
  'a260-purity-check-example': {
    title: 'PCR 전 A260 purity check 예제',
    summary: '핵산 prep이 downstream 실험에 충분한지, cleanup이 필요한지 판단하는 예제입니다.',
    audience: 'DNA/RNA prep을 PCR, cloning, qPCR에 쓰기 전 점검하는 사용자',
    sections: [
      { heading: '상황', body: ['spectrophotometer에서 concentration, A260/280, A260/230 값을 얻었습니다.', '이 예제는 proceed, dilute, cleanup 중 어떤 결정을 할지에 초점을 둡니다.'] },
      { heading: '확인할 입력값', body: ['기본값처럼 물로 blank하지 말고 sample buffer와 맞는 blank를 사용합니다.', 'sample이 genomic DNA, plasmid DNA, RNA인지 기록합니다.', 'cleanup 후에도 필요한 최종 농도가 남는지 확인합니다.'] },
      { heading: '결과 활용법', body: ['purity ratio를 독립적인 pass/fail 숫자가 아니라 context로 해석합니다.', 'borderline sample은 다음 단계의 민감도와 함께 판단하고, 무조건 cleanup을 반복하지 않습니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['농도가 좋다는 이유로 purity 문제를 무시합니다.', '모든 낮은 ratio를 같은 contamination 문제로 취급합니다.', '희석이나 cleanup 후 재확인을 건너뜁니다.'] },
    ],
  },
  'copy-number-standard-prep-example': {
    title: 'qPCR standard 준비용 copy number 예제',
    summary: 'DNA mass를 copy number로 바꾸고 replicate에 충분한 standard series를 계획하는 예제입니다.',
    audience: 'plasmid 또는 amplicon standard를 준비하는 사용자',
    sections: [
      { heading: '상황', body: ['정량된 DNA standard가 있고 희석 시리즈를 만들기 전에 copy number를 추정해야 합니다.', 'copy 계산과 dilution plan은 따로가 아니라 함께 기록되어야 합니다.'] },
      { heading: '확인할 입력값', body: ['template length는 실제 standard molecule과 맞아야 합니다.', '이전 prep 값이 아니라 이번 batch에서 측정한 농도를 사용합니다.', 'standard series가 몇 개의 replicate와 rerun을 감당해야 하는지 정합니다.'] },
      { heading: '결과 활용법', body: ['먼저 mass concentration을 copies per volume으로 바꾸고 목표 copy range에서 거꾸로 희석 시리즈를 설계합니다.', 'molecule length, 계산 날짜, target copy range를 한 줄로 남기면 나중에 결과를 설명하기 쉽습니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['cloning이나 linearization 후 fragment length가 바뀌었는데 예전 길이를 씁니다.', '시작 농도가 희석 시리즈를 감당할 수 있는지 보지 않습니다.', '검출 한계 근처에서 replicate 보호 없이 series를 운영합니다.'] },
    ],
  },
  'transformation-efficiency-example': {
    title: 'Cloning 후 transformation efficiency 예제',
    summary: 'CFU per microgram을 계산하고 colony 수가 낮은 원인을 해석하는 예제입니다.',
    audience: 'ligation 또는 control plasmid transformation 결과를 검토하는 사용자',
    sections: [
      { heading: '상황', body: ['transformed cells를 plating하고 dilution별 colony를 세었습니다.', '단순 성공/실패보다 DNA input, recovery volume, plated fraction과 연결해 해석하는 것이 목표입니다.'] },
      { heading: '확인할 입력값', body: ['competent cells에 넣은 DNA mass를 확인합니다.', '최종 recovery volume, plated fraction, plating 전 dilution을 확인합니다.', 'plate가 ligation product인지 positive-control plasmid인지 구분합니다.'] },
      { heading: '결과 활용법', body: ['계산된 efficiency로 ligation 문제와 competent-cell batch 문제를 분리해서 생각합니다.', '하나의 숫자만 보지 말고 control transformation과 비교합니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['plated fraction 보정을 잊습니다.', 'DNA input 기준 없이 colony count만 보고합니다.', '서로 다른 recovery/plating 조건의 ligation plate와 control plate를 직접 비교합니다.'] },
    ],
  },
  'rcf-rpm-conversion-example': {
    title: '새 rotor에서 RCF를 RPM으로 변환하는 예제',
    summary: '다른 rotor radius를 가진 centrifuge에서 published RCF 조건을 맞추는 예제입니다.',
    audience: '논문, kit, 다른 실험실의 spin 조건을 자기 장비에 맞추는 사용자',
    sections: [
      { heading: '상황', body: ['논문에는 RCF가 적혀 있지만 centrifuge display는 RPM이고 rotor radius도 다릅니다.', '다른 장비의 숫자를 그대로 복사하지 않고 조건을 변환하는 방법을 보여 줍니다.'] },
      { heading: '확인할 입력값', body: ['protocol에 나온 target RCF를 확인합니다.', '다른 모델의 추정값이 아니라 실제 사용할 rotor radius를 확인합니다.', 'under-spinning이나 heat에 민감한 protocol인지 봅니다.'] },
      { heading: '중요한 이유', body: ['published RPM은 다른 rotor에 그대로 옮길 수 없습니다.', '예제는 formula만 보여 주는 것보다 protocol adaptation 과정을 분명하게 만듭니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['다른 rotor에서 사용한 RPM을 그대로 복사합니다.', 'rotor radius 측정 지점을 잘못 잡습니다.', '긴 spin에서 sample heating 가능성을 무시합니다.'] },
    ],
  },
  'pipetting-overage-planning-example': {
    title: 'Pipetting overage 계획 예제',
    summary: 'dead volume과 반복 분주를 고려해 master mix를 얼마나 더 만들지 정하는 예제입니다.',
    audience: 'PCR, qPCR, enzyme reaction, plate assay를 반복 분주로 준비하는 사용자',
    sections: [
      { heading: '상황', body: ['24 wells에 필요한 reaction mix를 계산했지만 tip retention, tube dead volume, transfer loss를 고려하면 여유가 없습니다.', 'overage를 임의의 퍼센트가 아니라 실제 준비 결정을 위한 값으로 다룹니다.'] },
      { heading: '확인할 입력값', body: ['reaction 수와 reaction당 최종 부피를 정합니다.', 'mix를 tube, strip, reservoir 중 어디에서 분주할지 확인합니다.', 'limiting reagent가 extra volume을 감당할 수 있는지 봅니다.'] },
      { heading: '결과 활용법', body: ['정확한 최소 필요량을 계산한 뒤 규모에 따라 10% 또는 한 반응분 같은 규칙을 더합니다.', 'prepared volume이 수학적 최소값보다 큰 이유를 기록합니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['정확히 필요한 양만 만들어 마지막 well에서 부족해집니다.', '비싼 enzyme이나 희귀 sample에 overage를 과하게 넣습니다.', 'plate마다 overage 규칙을 바꾸면서 이유를 기록하지 않습니다.'] },
    ],
  },
  'rna-no-rt-control-example': {
    title: 'RNA qPCR의 no-RT control 예제',
    summary: 'no-RT control로 cDNA signal과 genomic DNA carryover를 구분하는 예제입니다.',
    audience: 'RNA sample로 expression analysis를 준비하는 사용자',
    sections: [
      { heading: '상황', body: ['target이 reverse-transcribed sample과 no-RT control 모두에서 증폭됩니다.', 'signal을 해석해도 되는지, sample preparation을 먼저 검토해야 하는지 판단합니다.'] },
      { heading: '확인할 입력값', body: ['RT-positive reaction과 no-RT reaction의 Ct 값을 확인합니다.', 'primer가 exon junction을 걸치는지 같은 primer design context를 확인합니다.', 'DNase treatment 또는 genomic DNA removal이 수행되었는지 봅니다.'] },
      { heading: '결과 활용법', body: ['fold change를 계산하기 전에 no-RT signal과 실제 sample signal을 비교합니다.', 'no-RT Ct가 sample Ct와 가깝다면 expression 해석을 조심하고 RNA cleanup 또는 primer design을 검토합니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['sample Ct가 좋아 보인다는 이유로 no-RT amplification을 무시합니다.', 'genomic DNA sensitivity를 보지 않고 reference gene을 사용합니다.', 'DNase treatment가 항상 완벽하다고 가정합니다.'] },
    ],
  },
  'gel-smear-troubleshooting-example': {
    title: 'Gel smear troubleshooting 예제',
    summary: 'smear가 PCR, sample quality, electrophoresis 조건 중 어디에서 왔는지 판단하는 예제입니다.',
    audience: 'endpoint PCR, cleanup product, extracted nucleic acid를 점검하는 사용자',
    sections: [
      { heading: '상황', body: ['expected band가 약하고 sample lane에 넓은 smear가 보입니다.', 'PCR만 탓하기 전에 loading amount, salt, degraded template, voltage를 함께 검토합니다.'] },
      { heading: '확인할 입력값', body: ['lane당 DNA loading amount를 확인합니다.', 'gel percentage와 running voltage를 봅니다.', 'ladder와 controls가 정상적으로 분리되었는지 확인합니다.'] },
      { heading: '결과 활용법', body: ['먼저 ladder와 control로 gel system이 정상인지 확인합니다.', '한 sample만 smear가 있다면 전체 PCR program을 바꾸기 전에 sample quality와 loading amount를 봅니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['lane을 overloading하고 smear를 template degradation으로 해석합니다.', 'expected size range에 맞지 않는 gel percentage를 사용합니다.', '너무 높은 voltage로 gel이 뜨거워져 band가 왜곡됩니다.'] },
    ],
  },
  'cell-viability-plating-decision-example': {
    title: 'Cell viability 기반 plating 판단 예제',
    summary: 'viability가 낮을 때 seed, recount, recover 중 무엇을 선택할지 판단하는 예제입니다.',
    audience: 'manual counting 후 treatment plate나 routine passage를 준비하는 사용자',
    sections: [
      { heading: '상황', body: ['총 cell 수는 충분하지만 viability가 평소보다 낮습니다.', 'count가 plating을 지지할 수 있는지, culture condition을 먼저 봐야 하는지 판단합니다.'] },
      { heading: '확인할 입력값', body: ['total count가 아니라 live/dead count를 따로 확인합니다.', 'harvest, staining, counting, plating 사이 시간을 기록합니다.', 'untreated culture morphology가 이미 stress를 보였는지 확인합니다.'] },
      { heading: '결과 활용법', body: ['seeding 계산에는 total cells가 아니라 viable cell concentration을 사용합니다.', 'viability가 예상보다 낮으면 실험을 지연, 반복, 또는 compromised setup으로 기록할지 판단합니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['viability가 낮은데 total cell count로 seeding합니다.', 'live/dead count를 왜곡하는 clump를 무시합니다.', 'stressed cells를 healthy control culture와 같은 조건으로 해석합니다.'] },
    ],
  },
  'buffer-working-stock-example': {
    title: 'Buffer working stock 준비 예제',
    summary: 'working stock을 만들 때 농도, 라벨, 보관 기록을 함께 남기는 예제입니다.',
    audience: 'buffer, supplement, additive, routine working stock을 준비하는 사용자',
    sections: [
      { heading: '상황', body: ['농축 reagent에서 낮은 농도의 working stock을 준비합니다.', 'source, dilution factor, solvent, storage condition을 기록해 나중에도 쓸 수 있게 만드는 것이 목적입니다.'] },
      { heading: '확인할 입력값', body: ['source stock concentration과 solvent를 확인합니다.', 'target working concentration과 final volume을 정합니다.', 'storage temperature, light sensitivity, expiration 또는 review date를 기록합니다.'] },
      { heading: '결과 활용법', body: ['source volume과 diluent volume을 계산하고 예상 사용량에 맞게 적절한 양만 준비합니다.', 'tube에 concentration과 date를 표시하고 계산 가정을 preparation log에 남깁니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['희석은 맞지만 solvent나 concentration 라벨을 빠뜨립니다.', 'storage history를 확인하지 않고 오래된 working stock을 씁니다.', 'thawing이나 dilution 후 불안정해지는 additive 특성을 잊습니다.'] },
    ],
  },
  'plate-layout-edge-effect-example': {
    title: 'Edge effect를 고려한 plate layout 예제',
    summary: 'plate 위치 효과가 생물학적 차이처럼 보이지 않도록 sample과 control을 배치하는 예제입니다.',
    audience: 'cell assay, qPCR plate, plate-reader experiment를 계획하는 사용자',
    sections: [
      { heading: '상황', body: ['plate-based assay에서 한쪽 가장자리 well의 signal이 더 강하게 보입니다.', 'layout planning으로 location effect가 treatment effect처럼 보일 위험을 줄입니다.'] },
      { heading: '확인할 입력값', body: ['condition, control, replicate 수를 확인합니다.', 'outer wells가 이 assay에서 다르게 행동하는지 봅니다.', 'sample order를 plate region 전체에 균형 있게 배치할 수 있는지 검토합니다.'] },
      { heading: '결과 활용법', body: ['control을 의도적으로 배치하고 replicate를 한 구역에 몰아넣지 않습니다.', '명확한 plate map을 남기면 나중에 pattern이 biology 때문인지 position 때문인지 판단하기 쉽습니다.'] },
      { heading: '자주 생기는 실패 지점', body: ['모든 control을 한 corner에 둡니다.', '분석 때 헷갈리는 약어를 사용합니다.', 'empty well이나 edge well을 무시한 채 condition을 비교합니다.'] },
    ],
  },
};

export function getExampleText(locale: 'en' | 'ko', example: ExampleMeta) {
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

export function getExampleSections(locale: 'en' | 'ko', example: ExampleMeta) {
  return locale === 'ko' ? exampleKoText[example.slug]?.sections || example.sections : example.sections;
}
