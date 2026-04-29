export const workflowMarkdownKo: Record<string, string> = {
  'cell-culture': `# Cell culture routine

이 workflow는 manual count, viability check, seeding calculation, media handling을 하나의 준비 흐름으로 연결합니다.

## 1. 시작 상태 확인
cell morphology, passage number, recent handling history를 먼저 봅니다. count 숫자만으로 culture 상태를 판단하지 않습니다.

## 2. count와 viability
hemocytometer 또는 다른 counting method로 live/dead count를 확인합니다. viability가 낮으면 seeding 계산 전에 culture stress나 staining/counting error를 먼저 검토합니다.

## 3. seeding plan
target density, plate format, final volume, overage를 정하고 하나의 mixed suspension을 준비합니다. well마다 따로 보정하면 variation이 커질 수 있습니다.

## 4. 기록
passage number, count time, viability, seeding density, media lot, morphology note를 함께 남깁니다.

## 검토 지점
- count 후 plating까지 시간이 길지 않았나요?
- suspension을 분주 직전에 다시 섞었나요?
- target confluence가 readout timing과 맞나요?`,

  'pcr-qpcr': `# PCR과 qPCR setup

이 workflow는 master mix 계산, control planning, template handling, 결과 기록을 하나로 묶어 PCR/qPCR 준비 실수를 줄이기 위한 흐름입니다.

## 1. 반응 목적 정리
endpoint PCR인지 qPCR인지, screening인지 quantification인지 먼저 구분합니다. 목적에 따라 control과 replicate 설계가 달라집니다.

## 2. reaction count 확정
sample, positive control, negative control, no-template control, replicate를 모두 포함해 총 reaction 수를 계산합니다. 그 뒤 overage를 더합니다.

## 3. master mix 계산
primer, probe, enzyme mix, buffer, water, template volume을 확인합니다. stock concentration이 kit default와 다르면 반드시 바꿔 넣습니다.

## 4. control 확인
NTC는 contamination과 primer-dimer를 확인하고, qPCR RNA workflow에서는 no-RT control이 genomic DNA carryover를 확인합니다.

## 5. 기록
final reagent table, primer batch, template dilution, cycling condition, excluded well rule을 기록합니다.`,

  cloning: `# Molecular cloning workflow

cloning workflow는 vector/insert 준비, ligation ratio 계산, transformation 이후 review까지 이어지는 흐름입니다.

## 1. construct 확인
final map, vector length, insert length, restriction/assembly strategy를 먼저 확인합니다. map이 바뀌면 계산도 바뀝니다.

## 2. DNA 상태 확인
cleanup 후 concentration과 purity를 확인합니다. 너무 진한 stock은 sub-microliter pipetting을 만들 수 있어 intermediate dilution이 필요할 수 있습니다.

## 3. ligation 계획
mass ratio가 아니라 molar ratio를 기준으로 insert amount를 계산합니다. vector-only control 같은 control도 함께 준비합니다.

## 4. transformation과 review
colony count는 DNA input, recovery volume, plated fraction과 연결해 transformation efficiency로 해석합니다.

## 5. 기록
fragment length, concentration source, molar ratio, reaction volume, colony count, control result를 남깁니다.`,

  'dna-quant-to-pcr': `# DNA 정량에서 PCR setup까지

이 workflow는 DNA concentration과 purity readout을 PCR 준비 가능한 값으로 바꾸는 과정입니다.

## 1. sample readout 확인
concentration, A260/280, A260/230, blank condition을 함께 봅니다. 농도만 좋다고 바로 사용하지 않습니다.

## 2. 사용 가능성 판단
purity ratio가 좋지 않다면 dilution으로 충분한지, cleanup이 필요한지, fresh prep이 나은지 판단합니다.

## 3. target input으로 희석
PCR에 필요한 template input을 정하고 serial dilution 또는 single dilution을 계획합니다. final volume이 충분한지 확인합니다.

## 4. PCR mix 연결
template dilution이 정해지면 master mix 계산에 연결합니다. control과 overage를 포함합니다.

## 5. 기록
measurement method, blank, cleanup decision, dilution factor, final PCR setup을 한 흐름으로 남깁니다.`,

  'qpcr-standard-curve-prep': `# qPCR standard curve 준비

standard curve는 copy number assumption, dilution accuracy, replicate volume이 모두 맞아야 해석 가능합니다.

## 1. standard molecule 정의
plasmid, amplicon, synthetic fragment 중 무엇인지 확인하고 실제 molecule length를 기록합니다.

## 2. copy number 계산
measured concentration과 molecule length로 copies per volume을 계산합니다. 이전 batch 값이 아니라 사용할 batch 값을 씁니다.

## 3. dilution series 설계
target copy range에서 거꾸로 생각해 희석 단계를 정합니다. 각 tube는 replicate와 rerun을 감당할 final volume이 있어야 합니다.

## 4. qPCR plate 연결
standard, sample, NTC, replicate를 plate layout 안에서 함께 계획합니다.

## 5. 기록
standard length, concentration source, dilution factor, copy range, plate map을 남깁니다.`,

  'ligation-to-transformation': `# Ligation에서 transformation까지

이 workflow는 ligation setup이 transformation 결과 해석까지 이어지도록 연결합니다.

## 1. ligation input 확인
vector와 insert의 length, mass, molar ratio를 확인합니다. 가능한 경우 vector-only control과 positive control도 계획합니다.

## 2. practical volume 검토
계산된 DNA volume이 너무 작으면 intermediate dilution을 만듭니다. 효소와 buffer volume이 final reaction 안에서 맞는지 봅니다.

## 3. transformation 조건 기록
competent cell batch, DNA input, recovery volume, plated volume, dilution을 기록합니다.

## 4. colony 결과 해석
colony count만 보지 말고 plated fraction과 DNA input으로 transformation efficiency를 계산합니다.

## 5. 원인 분리
ligation plate가 약하고 control plasmid가 좋으면 ligation 쪽을, 둘 다 약하면 competent cell이나 handling 쪽을 먼저 봅니다.`,

  'manual-count-to-plating': `# Manual count에서 plating plan까지

manual count 값은 바로 plating 숫자가 아니라 quality check를 거쳐 seeding plan으로 바뀌어야 합니다.

## 1. count 품질 확인
sample mixing, dilution factor, counted square 수, clump 여부를 확인합니다. spread가 크면 count를 반복합니다.

## 2. viable concentration 계산
total cell이 아니라 live cell 기준으로 concentration을 계산합니다. viability가 낮으면 plating 여부를 다시 판단합니다.

## 3. target density 결정
plate format, growth area, assay timing에 따라 well당 target cell 수를 정합니다.

## 4. suspension 준비
well마다 따로 계산하지 말고 하나의 mixed suspension을 준비하고 overage를 포함합니다.

## 5. 기록
count time, viability, dilution factor, target density, final suspension volume, morphology를 남깁니다.`,

  'rna-to-qpcr': `# RNA handling에서 qPCR 해석까지

이 workflow는 RNA quality, reverse transcription, qPCR control, Ct interpretation을 연결합니다.

## 1. RNA 상태 확인
concentration뿐 아니라 purity, storage history, freeze-thaw, degradation signal을 함께 봅니다.

## 2. genomic DNA 관리
DNase treatment 여부와 no-RT control 필요성을 확인합니다. no-RT signal이 sample signal과 가까우면 expression 해석이 약해집니다.

## 3. reverse transcription 기록
RNA input, primer strategy, enzyme condition, reaction volume을 기록합니다. RT step은 variability가 큰 단계입니다.

## 4. qPCR control 설계
reference gene, NTC, no-RT, technical replicate를 plate design 전에 확정합니다.

## 5. ddCt 해석
fold-change 계산 전 replicate spread, Ct range, reference gene stability를 확인합니다.`,

  'gel-check-to-cleanup': `# Gel 확인에서 cleanup 결정까지

gel 결과는 단순히 band 유무만 보는 단계가 아니라 다음 action을 고르는 decision point입니다.

## 1. gel system 확인
ladder와 control이 정상적으로 분리되었는지 먼저 봅니다. gel system이 흔들리면 sample 해석도 약해집니다.

## 2. band와 smear 해석
expected band, nonspecific band, smear, background를 분리해서 봅니다. smear는 PCR 문제뿐 아니라 loading amount, salt, voltage, sample degradation에서도 올 수 있습니다.

## 3. 다음 단계 선택
band가 명확하면 proceed 또는 excise를 고려합니다. purity가 걱정되면 cleanup과 A260 check를 연결합니다. pattern이 이상하면 PCR 또는 sample quality를 다시 봅니다.

## 4. 기록
gel percentage, voltage, run time, loading amount, ladder, lane map, cleanup decision을 남깁니다.`,

  'cell-treatment-plate-plan': `# Cell treatment plate planning

treatment plate는 seeding, treatment timing, control, viability, layout이 함께 맞아야 해석 가능합니다.

## 1. biological question 정의
무엇을 비교하는지, readout 시점은 언제인지, treatment duration은 얼마인지 먼저 정합니다.

## 2. seeding과 timing
target confluence를 readout 기준으로 생각합니다. treatment 시작 시점에 cell state가 조건 사이에서 비교 가능해야 합니다.

## 3. control과 replicate
untreated, vehicle, positive control, technical/biological replicate를 plate layout 전에 배치합니다.

## 4. edge effect 관리
critical condition을 edge에 몰지 않고, replicate를 plate 전체에 균형 있게 배치합니다.

## 5. 기록
plate map, seeding density, treatment concentration, timing, viability note, excluded well reason을 남깁니다.`,

  'buffer-media-prep': `# Buffer와 media preparation workflow

buffer와 media 준비는 pH, osmolarity, supplement, label, storage record가 함께 맞아야 재사용 가능합니다.

## 1. formulation 확인
target concentration, final volume, solvent, pH, osmolarity requirement를 먼저 확인합니다.

## 2. stock과 additive 검토
stock concentration, lot, storage condition, light sensitivity, freeze-thaw sensitivity를 확인합니다.

## 3. 계산과 조제
reconstitution 또는 multi-stock mix 계산으로 source volume과 diluent volume을 정합니다. final formulation을 기준으로 기록합니다.

## 4. label과 storage
name, concentration, date, preparer, storage condition, review/expiration date를 label과 log에 남깁니다.

## 5. 사용 전 확인
침전, 색 변화, contamination sign, storage history를 확인하고 필요하면 새로 준비합니다.`,

  'experiment-review-cycle': `# 실험 검토와 troubleshooting cycle

이 workflow는 계산, control, observation, deviation을 다음 실험에 쓸 수 있는 review loop로 바꾸기 위한 구조입니다.

## 1. 준비 전 계산 기록
input, unit, assumption, overage, final setup table을 기록합니다. 계산 결과만 남기면 나중에 검토하기 어렵습니다.

## 2. control 확인
positive/negative control, replicate, reference condition이 질문을 지지하는지 봅니다.

## 3. observation과 interpretation 분리
raw observation과 conclusion을 구분합니다. 예를 들어 "band가 있다"와 "PCR이 성공했다"는 같은 말이 아닙니다.

## 4. deviation 기록
시간, 온도, reagent substitution, sample handling 변화처럼 작아 보이는 차이도 기록합니다.

## 5. 다음 action
sample, reagent, instrument, operator 원인 그룹으로 나눠 가장 가능성 높은 하나부터 바꿉니다.`,
};
