export const guideMarkdownKo: Record<string, string> = {
  'a260-purity-ratios': `# A260 purity ratio 실전 해석

## 언제 사용하나
NanoDrop 같은 spectrophotometer로 핵산 농도와 purity ratio를 얻은 뒤 PCR, qPCR, cloning, sequencing, cleanup 진행 여부를 판단할 때 사용합니다.

## 왜 ratio가 중요한가
농도만으로 sample이 사용할 수 있는 상태인지 알 수 없습니다. 충분히 진해 보여도 protein, phenol, guanidine, salt 같은 오염물이 남아 있으면 효소 반응이나 증폭이 약해질 수 있습니다. A260/280과 A260/230은 완벽한 진단값은 아니지만, 민감한 assay 전에 더 확인해야 할 sample을 골라내는 빠른 신호입니다.

## 각 ratio가 말해 주는 것
- A260/280은 DNA와 RNA prep에서 protein contamination을 거칠게 확인할 때 자주 씁니다.
- A260/230은 salt, chaotropic agent, phenol carryover, cleanup 잔여물에 더 민감한 경우가 많습니다.
- 이 숫자는 purity certificate가 아니라 해석 보조값입니다. 농도, 추출법, 다음 assay의 민감도와 함께 봐야 합니다.

## 검토 체크리스트
1. blank가 sample buffer와 맞는지 확인합니다.
2. 농도와 두 purity ratio를 따로 보지 말고 함께 봅니다.
3. 다음 assay가 inhibitor, protein carryover, low input 중 무엇에 민감한지 생각합니다.
4. dilution, cleanup, fresh prep 중 가장 설명 가능한 다음 단계를 고릅니다.
5. 장비, blank, cleanup 판단을 기록합니다.

## 핵심
purity ratio의 가치는 숫자 자체보다 그 숫자가 돕는 결정에 있습니다. 진행해도 되는지, 먼저 cleanup할지, sample을 신뢰하지 않을지 판단하는 데 사용하세요.`,

  'aseptic-technique-basics': `# 무균 조작 기본

무균 조작은 세포 배양을 시작할 때 한 번 하는 행동이 아니라 contamination risk를 낮추는 작은 습관들의 묶음입니다.

## 작업 공간
재료를 열기 전에 작업 공간을 정리합니다. 불필요한 움직임을 줄이고, clean material이 waste나 사용한 tip 위를 지나가지 않게 합니다.

## 작업 순서
깨끗한 작업에서 덜 깨끗한 작업으로 이동합니다. waste, incubator handle, notebook, 비멸균 표면을 만진 뒤에는 glove를 바꾸거나 다시 닦기 전 sterile reagent로 돌아가지 않는 것이 안전합니다.

## bottle과 tube 다루기
뚜껑은 가능한 짧게 열어 둡니다. cap을 애매한 표면에 올려두지 말고, 안쪽 표면이나 pipette tip이 sterile path 밖의 물체에 닿지 않도록 합니다.

## 실전 습관
- 시작 전에 전체 순서를 머릿속으로 정리합니다.
- hood 안에는 필요한 물건만 둡니다.
- 필요할 때 bottle과 rack을 닦고 사용합니다.
- pipette tip이 어디를 지나가는지 봅니다.
- cell이나 reagent를 열기 전에 label을 명확히 합니다.

## contamination이 생겼을 때
reagent source, hood behavior, incubator condition, shared bottle, 최근 routine 변화를 함께 검토합니다. 한 지점만 탓하면 같은 문제가 반복될 수 있습니다.`,

  'buffer-ph-pka': `# Buffer pH와 pKa

## 언제 사용하나
extraction, enzyme reaction, cell handling, storage 조건을 위해 buffer를 선택하거나 문제를 점검할 때 사용합니다.

## compatibility가 중요한 이유
nominal pH가 비슷하다고 buffer가 서로 바뀔 수 있는 것은 아닙니다. buffer capacity는 working pH가 pKa와 얼마나 가까운지에 좌우되고, 생화학적 compatibility는 salt, chelator, detergent, temperature, downstream assay에 영향을 받습니다.

## 흔한 입력 실수
- target pH만 맞추고 pKa를 무시합니다.
- temperature에 따라 pH가 달라질 수 있다는 점을 놓칩니다.
- enzyme activity나 metal-sensitive assay에 맞지 않는 ion을 사용합니다.
- 여러 salt를 섞으며 osmolarity 변화를 보지 않습니다.

## 해석상 주의점
- 강한 buffer라도 pH range가 맞지 않으면 성능이 약할 수 있습니다.
- stock pH가 dilution 후 matrix 안에서도 그대로 유지된다는 보장은 없습니다.
- cell-based work는 nominal pH보다 osmolarity와 ionic composition 때문에 실패할 수 있습니다.

## 체크리스트
1. 실제 working temperature에서 target pH를 확인합니다.
2. buffer pKa가 intended working range와 가까운지 봅니다.
3. salt, detergent, chelator가 assay와 맞는지 검토합니다.
4. sample matrix에 희석된 뒤에도 compatibility가 유지되는지 확인합니다.
5. parent stock만이 아니라 final formulation을 기록합니다.`,

  'cell-seeding-density-planning': `# Cell seeding density 계획

## 언제 사용하나
plate-based assay에서 target confluence나 assay timing을 실제 cells-per-well 계획으로 바꿔야 할 때 사용합니다.

## density는 단일 숫자가 아니다
seeding density는 오늘 plate에 넣는 숫자만 의미하지 않습니다. attachment, growth phase, treatment timing, nutrient demand, assay reproducibility에 영향을 줍니다. 숫자는 맞아도 biological timing이 맞지 않으면 결과가 흔들릴 수 있습니다.

## 계산 전 질문
1. seeding 시점이 아니라 readout 시점의 confluence 목표는 무엇인가요?
2. 이 cell line은 passage 후 얼마나 빨리 회복하고 자라나요?
3. assay가 logarithmic growth, partial confluence, near-full coverage 중 무엇을 원하나요?
4. plate area가 assay format 때문에 고정되어 있나요?
5. suspension이 빨리 가라앉거나 clump를 만들 가능성이 있나요?

## 실전 요소
- plate format이 effective growth area를 바꿉니다.
- treatment까지의 시간이 starting count만큼 중요합니다.
- harvest 후 cell health가 count의 의미를 바꿉니다.
- mixed suspension quality가 well-to-well consistency를 좌우합니다.

## 핵심
seeding density planning은 사실 timing planning입니다. 먼저 biological target을 정하고, calculator로 그 목표를 plate preparation plan으로 바꾸세요.`,

  'cell-viability-interpretation': `# Cell viability 해석

cell viability는 단순한 percent가 아닙니다. counting method, staining timing, sample mixing, treatment condition, culture state가 함께 만든 측정값입니다.

## count quality
viability 값은 그 뒤의 count가 신뢰할 수 있을 때만 의미가 있습니다. 너무 적은 cell 수, clump, uneven chamber filling, inconsistent staining은 최종 percent를 흔듭니다.

## treatment context
treatment 후 낮은 viability는 예상된 biology일 수 있습니다. 하지만 untreated control의 viability가 낮다면 handling, culture health, counting 문제를 먼저 의심해야 합니다.

## timing
harvest, dissociation, staining, room-temperature handling 뒤 viability는 빠르게 바뀔 수 있습니다. collection 기준으로 언제 count했는지 기록하세요.

## 실전 해석
- untreated 또는 routine culture control과 비교합니다.
- harsh handling 후 dead cells가 과대표현되었는지 봅니다.
- count 후 같은 suspension을 seeding에 썼는지 확인합니다.
- passage number와 morphology를 viability와 함께 기록합니다.

## 반복해야 할 때
viability가 예상보다 낮거나 replicate count가 크게 다르거나, 긴 treatment나 비싼 assay를 결정하는 값이라면 count를 반복하는 편이 안전합니다.`,

  'centrifuge-rcf-vs-rpm': `# Centrifuge protocol에서 RCF와 RPM

## 언제 사용하나
protocol이 RCF 또는 g-force로 조건을 주는데 장비는 RPM을 표시하거나, 다른 rotor를 쓰는 protocol을 자기 장비에 맞출 때 사용합니다.

## 구분이 중요한 이유
RPM은 회전 속도일 뿐입니다. RCF는 sample이 실제로 받는 force이고 rotor radius에 따라 달라집니다. 같은 RPM이라도 instrument와 rotor가 다르면 effective force가 달라집니다.

## 흔한 실수
논문, kit manual, 다른 실험실 note의 RPM을 rotor geometry 확인 없이 복사하는 경우가 많습니다. 그러면 under-spinning, over-spinning, unnecessary heat exposure가 생길 수 있습니다.

## 안전한 결정 과정
1. source protocol이 RCF, RPM, 또는 둘 다 주는지 확인합니다.
2. 실제 사용할 rotor radius를 장비 문서에서 확인합니다.
3. 오늘 사용할 rotor 기준으로 force를 speed로 변환합니다.
4. temperature rise, pellet fragility, sample type이 허용 범위를 바꾸는지 봅니다.

## 핵심
protocol intent가 force라면 force 기준으로 계획하세요. RPM은 자기 rotor에 맞춘 machine-specific translation일 뿐입니다.`,

  'dna-sample-storage-handling': `# DNA sample 보관과 취급

DNA sample은 계산이 틀려서가 아니라 보관, label, freeze-thaw history가 바뀌어 downstream에서 실패하는 경우가 있습니다.

## labeling
좋은 label에는 sample name, concentration, buffer, date, owner 또는 project context가 들어갑니다. tube label은 짧아도 notebook이나 digital record에는 full detail을 남겨야 합니다.

## freeze-thaw 관리
반복 freeze-thaw는 sample quality를 낮출 수 있습니다. 특히 low-concentration 또는 precious sample에서는 aliquot이 반복 disturbance를 줄이고 troubleshooting을 쉽게 합니다.

## buffer context
water, TE, elution buffer, kit-specific buffer는 pH, chelation, downstream compatibility가 다릅니다. buffer 정보 없는 concentration 값은 불완전합니다.

## 사용 전 기록
- original concentration과 measurement method
- purity ratio 또는 quality note
- 가능한 경우 freeze-thaw 횟수
- dilution factor와 final working concentration
- intended downstream use

## 실전 습관
계산값은 특정 sample state에 묶여 있다고 생각하세요. sample이 diluted, cleaned up, evaporated, repeatedly thawed 상태라면 오래된 숫자를 믿기 전에 concentration을 다시 확인하는 것이 좋습니다.`,

  'experiment-notebook-standards': `# 실험노트 기록 기준

좋은 실험노트는 일기가 아니라 재사용 가능한 기록입니다. 무엇을 했고, 왜 했고, 무엇이 바뀌었고, 결과를 어떻게 해석했는지 설명해야 합니다.

## 계산 기록
input value, unit, stock concentration, dilution factor, overage assumption, final volume을 기록합니다. assumption이 없는 final table은 나중에 검토하기 어렵습니다.

## deviation
작은 deviation도 중요합니다. incubation time이 달라졌거나 reagent가 바뀌었거나 sample thawing 시간이 길어졌거나 control이 빠졌다면 적어 둡니다.

## observation과 interpretation 분리
"band present"는 observation입니다. "PCR succeeded"는 control, size, specificity, downstream purpose에 의존하는 interpretation입니다.

## 실전 구조
- goal
- sample과 reagent context
- calculation assumptions
- protocol summary
- deviations
- raw observation
- interpretation and next step

## 재사용 가치
좋은 notebook entry는 미래의 내가 기억에 의존하지 않고 같은 실험을 반복할 수 있게 해 줍니다.`,

  'gel-electrophoresis-troubleshooting': `# Gel electrophoresis troubleshooting

gel electrophoresis는 단순 readout처럼 보이지만 band quality는 sample amount, gel percentage, buffer condition, voltage, run time, loading technique에 영향을 받습니다.

## band shape
sharp band는 보통 sample amount와 running condition이 적절하다는 신호입니다. smear는 degraded template, overloaded DNA, salt contamination, excessive voltage, poor gel preparation에서 올 수 있습니다.

## ladder 선택
ladder는 expected product range와 맞아야 합니다. 너무 넓거나 sparse한 ladder는 PCR이 잘 되었어도 size 해석을 어렵게 합니다.

## loading amount
DNA를 많이 넣는 것이 항상 좋지는 않습니다. overloading은 band를 넓히고 background를 늘리며 가까운 product를 가릴 수 있습니다.

## voltage와 heat
high voltage는 run을 빠르게 하지만 gel을 데우고 band를 왜곡할 수 있습니다. gel이 따뜻해지거나 band가 휘면 voltage를 낮추고 시간을 늘립니다.

## 해석
한 lane이 나쁘다고 바로 PCR failure로 결론내리지 마세요. ladder와 control이 정상인지 먼저 확인해야 합니다.`,

  'hemocytometer-counting-quality': `# Hemocytometer counting quality check

## 언제 사용하나
manual cell counting에서 dilution error, chamber loading, square choice, clump judgment 때문에 생기는 variability를 줄이고 싶을 때 사용합니다.

## manual count에도 guide가 필요한 이유
manual counting은 작은 실험실, troubleshooting, automated counter를 믿기 어려운 상황에서 여전히 사용됩니다. 수식은 단순하지만 count quality는 sampling discipline에 달려 있습니다.

## error가 들어오는 지점
- loading 전 sample이 충분히 섞이지 않았습니다.
- trypan blue dilution이 잘못 기록되었습니다.
- chamber가 overfilled 또는 underfilled 되었습니다.
- 측정 density에 비해 너무 적은 square를 세었습니다.
- clump와 debris 판단 기준이 사용자마다 다릅니다.

## 더 좋은 routine
1. aliquot을 뜨기 직전에 suspension을 섞습니다.
2. stain dilution을 정확히 만들고 기록합니다.
3. overflow 없이 chamber를 load합니다.
4. 안정적인 평균을 위해 충분한 square를 셉니다.
5. boundary cell과 clump 기준을 일정하게 유지합니다.
6. live/dead cell을 하나로 합치지 말고 구분합니다.

## 핵심
좋은 hemocytometer 작업은 formula 암기가 아니라 formula 적용 전 bench variability를 줄이는 일입니다.`,

  'lab-calculation-documentation': `# 실험 계산 기록법

실험 계산은 나중에 검토할 수 있을 때만 유용합니다. 좋은 기록은 결과를 input, assumption, unit, experimental intent와 연결합니다.

## 필요한 context
stock concentration, target concentration, final volume, dilution factor, reaction count, overage, unit을 기록합니다. unit 누락은 반복 계산 실수의 가장 흔한 원인 중 하나입니다.

## assumption
molecular weight, DNA length, extinction coefficient, viable fraction, rotor radius, expected reaction count 같은 assumption은 보이게 남겨야 합니다.

## versioning
계산을 재사용한다면 날짜와 sample quality, reagent concentration, protocol version 변화를 기록합니다. cleanup, evaporation, thawing, stock replacement 뒤에는 옛 값이 틀릴 수 있습니다.

## 실전 기록 형식
- 계산 목적
- 단위가 포함된 input value
- assumption과 출처
- final table 또는 setup volume
- controls와 replicate count
- 누가 검토하거나 사용했는지

## 왜 중요한가
기록된 계산은 실험을 반복하기 쉽고, 검토하기 쉽고, 결과가 예상과 다를 때 troubleshooting하기 쉽습니다.`,

  'ligation-molar-ratio-planning': `# Ligation molar ratio 계획

## 언제 사용하나
cloning reaction에서 vector mass, fragment length, target insert-to-vector ratio를 알고 있으며 mass-ratio shortcut을 피하고 싶을 때 사용합니다.

## molar ratio가 중요한 이유
ligation은 nanogram이 아니라 molecule count에 의해 좌우됩니다. 짧은 insert와 긴 vector는 같은 mass라도 molecule number가 크게 다릅니다.

## 권장 planning sequence
1. final construct map과 vector/insert length를 확인합니다.
2. cleanup 후 실제 DNA amount를 정량합니다.
3. target molar ratio를 정합니다.
4. 너무 작은 pipetting volume이 나오면 intermediate dilution을 계획합니다.
5. total reaction volume 안에서 buffer, enzyme, DNA volume이 현실적인지 확인합니다.

## 흔한 실수
- mass ratio만 보고 ligation을 준비합니다.
- construct revision 후 fragment length를 업데이트하지 않습니다.
- sub-microliter volume을 억지로 pipetting합니다.
- vector-only control을 빠뜨립니다.

## 핵심
ligation planning은 DNA mass를 molecule logic으로 번역하는 과정입니다. 계산값이 실제 pipetting 가능한지도 함께 확인하세요.`,

  'media-buffer-prep-records': `# Media와 buffer preparation 기록

media, buffer, supplement, working stock은 준비 당시에는 단순해 보여도 나중에 품질 문제의 원인이 될 수 있습니다. 기록은 troubleshooting 비용을 줄입니다.

## 기록할 항목
- reagent name과 lot
- stock concentration과 target concentration
- solvent와 final volume
- pH, osmolarity, filtration 여부
- preparation date와 preparer
- storage condition과 review date

## labeling
tube나 bottle label에는 최소한 이름, 농도, 날짜, 보관 조건을 적습니다. 공간이 부족하면 notebook 또는 digital log와 연결되는 identifier를 사용합니다.

## supplement와 additive
빛, 온도, freeze-thaw에 민감한 물질은 preparation log에 주의사항을 남깁니다. working stock은 오래된 original stock보다 편하지만 storage history가 더 중요해집니다.

## 실전 기준
나중에 같은 buffer를 다시 만들 수 있고, 문제가 생겼을 때 어떤 lot와 조건을 썼는지 찾을 수 있으면 좋은 기록입니다.`,

  osmolarity: `# Osmolarity 정리

## 언제 사용하나
cell culture media, buffer, wash solution, storage solution을 준비하며 osmotic stress 가능성을 확인할 때 사용합니다.

## 왜 중요한가
cell-based work에서는 pH나 concentration이 맞아도 osmolarity가 크게 달라지면 cell stress, morphology change, viability drop이 생길 수 있습니다.

## 계산 전 확인
- 각 solute의 concentration과 dissociation behavior
- stock을 희석한 뒤 final concentration
- media나 buffer에 이미 들어 있는 salt
- supplement가 전체 osmolarity에 더하는 영향

## 흔한 실수
- 여러 stock을 더하면서 final osmolarity 변화를 보지 않습니다.
- mM와 mOsm을 같은 단위처럼 다룹니다.
- cell line이나 assay가 osmotic change에 얼마나 민감한지 확인하지 않습니다.

## 핵심
osmolarity는 단독 숫자보다 context가 중요합니다. 기존 medium이나 validated buffer와 얼마나 달라지는지 비교해서 해석하세요.`,

  'pcr-contamination-control': `# PCR contamination control

PCR contamination은 계산 문제가 아니라 setup behavior, template handling, amplified product movement가 겹쳐 생기는 경우가 많습니다.

## control의 의미
negative control은 형식적인 well이 아닙니다. no-template control이 증폭되면 reagent, water, primer, setup area, post-PCR product carryover를 의심해야 합니다.

## work area 분리
pre-PCR setup, template handling, post-PCR analysis를 물리적 또는 절차적으로 분리합니다. amplified product가 있던 공간과 pipette, rack, glove를 setup으로 되돌리지 않는 것이 중요합니다.

## 기록할 것
사용한 water aliquot, primer batch, polymerase mix, template dilution, setup bench area를 기록합니다. contamination이 나타났을 때 pattern을 찾을 수 있습니다.

## 실전 질문
- negative control이 expected size와 같은 band를 만들었나요?
- late, faint, inconsistent amplification인가요?
- primer를 post-PCR product 근처에서 열었나요?
- template dilution이 fresh인지 reused인지 확인했나요?

## 대응
모든 변수를 한 번에 바꾸지 마세요. water와 primer를 먼저 교체하고 clean setup area에서 반복한 뒤, pattern이 남으면 template dilution handling과 post-PCR movement를 검토합니다.`,

  'pipetting-error-reduction': `# Pipetting error 줄이기

수학적으로 맞는 계산도 실제 pipetting volume이 불안정하면 bench에서 실패할 수 있습니다. 좋은 계획은 exact number를 practical volume으로 바꿉니다.

## small volume
sub-microliter addition은 relative error가 큽니다. 가능하면 intermediate dilution을 만들거나 protocol이 허용하는 범위에서 master mix volume을 늘립니다.

## dead volume
dead volume은 tip, tube, reservoir, corner에 남는 물질입니다. overage는 특히 많은 well을 하나의 mix에서 채울 때 dead volume과 handling loss를 보완합니다.

## repeatability habit
replicate 사이에서 pipetting angle, depth, speed, touch-off behavior를 일정하게 유지합니다. 빠른 것보다 일관된 것이 중요합니다.

## 체크리스트
- 가능한 sub-microliter addition을 피합니다.
- master mix에는 overage를 넣습니다.
- stock을 섞고 pipetting합니다.
- volume에 맞는 pipette range를 사용합니다.
- intermediate dilution을 명확히 기록합니다.

## 핵심
pipetting error는 false biological difference, weak reaction, inconsistent control을 만들 수 있습니다. downstream 계산의 가치는 pipetting consistency에서 시작됩니다.`,

  'plate-layout-planning': `# Plate layout 계획

plate layout planning은 pipetting 전 혼란을 줄입니다. 좋은 layout은 control을 보호하고 edge effect를 줄이며 분석을 쉽게 만듭니다.

## control 먼저
sample을 모두 배치하기 전에 control 위치를 정합니다. control은 쉽게 찾을 수 있어야 하고 실수를 숨기는 layout 안에 묻히면 안 됩니다.

## edge effect
outer wells는 evaporation, temperature gradient, handling difference 때문에 다르게 보일 수 있습니다. edge effect가 가능하면 critical condition을 모두 edge에 두지 않습니다.

## balance와 randomization
가능하면 replicate를 한 구역에 몰지 말고 condition을 plate 전체에 균형 있게 배치합니다. location bias를 줄이는 데 도움이 됩니다.

## labeling
experiment 전에 layout table을 만듭니다. 분석 때 애매해질 handwritten abbreviation이나 기억에 의존하지 않습니다.

## 체크리스트
- control well을 먼저 확보합니다.
- replicate label을 일관되게 둡니다.
- ambiguous sample name을 피합니다.
- unused well도 기록합니다.
- pipetting 전 final layout을 저장합니다.`,

  'primer-design-checklist': `# Primer design checklist

primer design은 Tm 값만 맞추는 일이 아닙니다. primer pair는 specific, balanced, assay-compatible해야 하고 실패했을 때 troubleshooting이 가능해야 합니다.

## specificity
primer sequence가 unintended region에 붙을 수 있는지 확인합니다. qPCR에서는 작은 off-target product도 Ct와 melt curve 해석을 흔들 수 있습니다.

## pair balance
두 primer의 Tm과 GC content가 비슷해야 합니다. 차이가 크면 한 primer가 limiting처럼 행동하거나 compromise annealing temperature에서 non-specific amplification이 늘 수 있습니다.

## amplicon context
endpoint PCR에서는 gel resolution과 cloning 목적에 따라 amplicon length를 정합니다. qPCR에서는 보통 짧은 amplicon이 효율적이고 일관되게 증폭됩니다.

## dimer와 hairpin
3 prime end의 primer-dimer risk가 특히 중요합니다. 강한 3 prime interaction은 template가 없어도 signal을 만들 수 있습니다.

## 체크리스트
- primer orientation을 확인합니다.
- intended product length를 확인합니다.
- 같은 method로 두 primer Tm을 비교합니다.
- GC content와 3 prime stability를 봅니다.
- 가능한 경우 off-target을 확인합니다.
- primer version과 reference sequence를 기록합니다.`,

  'primer-tm': `# Primer Tm 정리

## 언제 사용하나
PCR 또는 qPCR primer pair를 고를 때 여러 Tm estimate를 비교하고 ordering 또는 validation 전 판단해야 할 때 사용합니다.

## Tm 정리가 중요한 이유
primer Tm은 장식용 숫자가 아닙니다. annealing temperature, specificity, mismatch tolerance, pair balance에 직접 영향을 줍니다. sequence만 보면 괜찮아도 salt model이 다르거나 두 primer의 Tm 차이가 크면 반응이 약해질 수 있습니다.

## 흔한 입력 실수
- sequence length와 GC content 차이를 무시합니다.
- salt assumption을 바꾸고 기록하지 않습니다.
- published Tm을 가져온 뒤 단위를 수동 변환합니다.
- 서로 다른 formula를 쓰는 calculator 결과를 같은 값처럼 비교합니다.

## 해석상 주의점
- algorithm마다 몇 도씩 차이날 수 있습니다.
- long primer, degenerate base, strong secondary structure는 별도 context가 필요합니다.
- 좋은 Tm이 dimer나 hairpin 부재를 보장하지 않습니다.
- vendor calculator는 해당 reagent system assumption을 반영할 수 있습니다.

## 체크리스트
1. primer length와 GC content를 먼저 확인합니다.
2. 두 primer를 같은 salt와 oligo assumption으로 다시 계산합니다.
3. primer pair의 Tm gap이 허용 가능한지 봅니다.
4. dimer와 hairpin risk는 Tm과 별도로 봅니다.
5. 사용한 calculator와 assumption을 protocol note에 남깁니다.`,

  'qpcr-control-design': `# qPCR control design

qPCR 해석은 fold-change math보다 control design에 먼저 의존합니다. reference gene, negative control, replicate structure가 질문을 지지해야 ddCt 값이 의미를 가집니다.

## core controls
- NTC: contamination과 primer-dimer signal을 확인합니다.
- No-RT: RNA workflow에서 genomic DNA carryover를 확인합니다.
- Positive control: primer, master mix, cycling condition이 target을 증폭할 수 있는지 확인합니다.
- Reference gene: sample input을 normalize하지만, 실제 조건에서 stable해야 합니다.

## replicate
technical replicate는 pipetting과 instrument consistency를 봅니다. biological replicate는 독립 sample variation을 봅니다. 둘은 서로 대체되지 않습니다.

## ddCt 계산 전
replicate spread, amplification curve shape, melt curve 또는 specificity 정보, detection limit 근처 Ct 여부를 확인합니다. 약한 upstream data에서 나온 fold-change는 결론이 아니라 warning sign입니다.

## 체크리스트
- plate design 전에 필요한 control을 정합니다.
- evaporation concern이 있으면 control을 edge에 몰지 않습니다.
- thresholding approach를 sample 사이에서 일정하게 유지합니다.
- excluded well은 이유와 함께 기록합니다.`,

  'qpcr-ddct-interpretation': `# qPCR ddCt 해석

## 언제 사용하나
Ct 값이 있고 dCt, ddCt, fold-change가 생물학적으로 해석 가능한지 또는 단순히 계산만 가능한지 판단할 때 사용합니다.

## 해석이 중요한 이유
ddCt workflow는 자동화하기 쉽지만 실수는 해석 단계에서 많이 생깁니다. fold-change가 깔끔해 보여도 unstable reference gene, poor replicate spread, assay limit에 가까운 Ct가 숨어 있을 수 있습니다.

## 최소 logic
- dCt는 같은 sample 안에서 target과 reference를 비교합니다.
- ddCt는 normalized value를 control condition과 비교합니다.
- fold change는 ddCt를 상대 발현량으로 바꿉니다.

## fold change를 믿기 전 확인
1. replicate consistency를 먼저 봅니다.
2. reference gene이 해당 context에서 stable한지 확인합니다.
3. final fold change뿐 아니라 absolute Ct range를 봅니다.
4. amplification efficiency가 비슷한지 검토합니다.
5. outlier handling rule이 미리 정해졌는지 확인합니다.

## 핵심
ddCt는 normalization strategy, replicate quality, Ct range가 모두 방어 가능할 때 가치가 있습니다. 조건이 약하면 숫자는 만들 수 있어도 자동으로 믿으면 안 됩니다.`,

  'replicate-planning': `# 반복수 계획

replicate planning은 통계와 실제 준비 모두에 영향을 줍니다. reagent를 녹이거나 plate를 채우기 전에 결정해야 합니다.

## technical replicate
technical replicate는 pipetting, instrument response, assay handling에서 오는 variation을 봅니다. local setup problem을 찾는 데 유용하지만 독립적인 biological evidence를 만들지는 않습니다.

## biological replicate
biological replicate는 독립 sample, culture, animal, donor, passage, experimental unit을 의미합니다. 대부분의 biological conclusion은 biological replicate에 기반합니다.

## control
control도 replicate planning의 일부입니다. sample well이 많아도 control이 약하면 숫자를 해석할 수 없습니다.

## volume planning
replicate는 필요한 volume을 곱합니다. dead volume, repeated dispensing, possible rerun을 위해 overage를 넣습니다.

## 체크리스트
- technical replicate와 biological replicate 수를 따로 정합니다.
- sample well이 layout을 다 차지하기 전에 control을 넣습니다.
- total reaction volume과 overage를 계획합니다.
- critical well을 vulnerable plate region에 몰지 않습니다.
- excluded replicate는 이유를 기록합니다.`,

  'rna-handling-quality': `# RNA handling quality guide

RNA는 DNA보다 degradation이 빠르고 조용히 일어날 수 있어 더 엄격한 습관이 필요합니다. concentration reading만으로 reverse transcription이나 expression analysis에 적합하다고 볼 수 없습니다.

## RNase control
clean consumables, dedicated reagents, careful bench habit을 사용합니다. RNase contamination은 눈에 보이는 실패보다 downstream performance inconsistency로 나타나는 경우가 많습니다.

## quality signals
purity ratio, gel 또는 instrument profile, downstream Ct behavior가 모두 단서입니다. RNA가 degraded되어도 qPCR 숫자는 나올 수 있지만 해석은 어려워질 수 있습니다.

## storage
freeze-thaw cycle을 최소화하고 room temperature handling 시간을 줄입니다. 여러 실험에서 사용할 sample은 aliquot이 유용합니다.

## reverse transcription context
RT step은 variability의 큰 원인입니다. RNA input, primer strategy, enzyme condition, genomic DNA removal 여부를 기록합니다.

## 체크리스트
- RNase-aware consumables를 사용합니다.
- sample handling time을 짧게 유지합니다.
- extraction date와 storage history를 기록합니다.
- genomic DNA carryover가 중요하면 no-RT control을 넣습니다.
- qPCR 결과를 RNA quality와 함께 해석합니다.`,

  'serial-dilution-error-propagation': `# Serial dilution error propagation

serial dilution은 개념적으로 단순하지만 실제 작업에서는 unforgiving합니다. 초기 단계의 작은 error가 뒤의 모든 tube에 전달됩니다.

## error가 누적되는 방식
첫 transfer가 부정확하면 두 번째 tube의 시작 농도부터 틀어집니다. 이후 tube는 그 오차를 계속 물려받습니다. 그래서 consistent transfer volume과 thorough mixing이 중요합니다.

## transfer volume
pipette이 안정적으로 다룰 수 있는 transfer volume을 선택합니다. 너무 작은 volume을 쓰는 dilution plan은 효율적으로 보이지만 reproducibility가 약할 수 있습니다.

## mixing
각 tube는 다음 transfer 전 충분히 섞어야 합니다. 약한 mixing은 concentration gradient를 만들고 다음 transfer가 tube average를 대표하지 못하게 합니다.

## labeling
시작 전에 tube를 label합니다. 반복 sequence에서는 수학은 맞아도 tube 순서가 틀리는 실수가 자주 생깁니다.

## 체크리스트
- transfer와 diluent volume을 일정하게 유지합니다.
- 각 step을 섞고 다음으로 이동합니다.
- contamination이나 carryover가 중요하면 tip을 교체합니다.
- replicate와 repeat에 충분한 final volume을 준비합니다.
- 각 tube의 dilution factor를 기록합니다.`,

  'statistical-test-chooser': `# 통계 검정 선택 가이드

## 언제 사용하나
paired design, independent group, multi-group comparison을 구분해 실험 데이터의 첫 통계 비교를 고를 때 사용합니다.

## 왜 틀리기 쉬운가
많은 분석은 software를 열기 전에 이미 실패합니다. repeated measurement를 independent sample처럼 다루거나, multiple endpoint를 correction 없이 검정하거나, graph가 "충분히 normal"해 보인다는 이유로 assumption을 무시하는 경우가 있습니다.

## 흔한 입력 실수
- paired data를 independent test로 분석합니다.
- normality나 variance equality 같은 assumption을 생략합니다.
- directional hypothesis 없이 one-tailed test를 씁니다.
- technical replicate를 biological replicate처럼 취급합니다.

## 해석상 주의점
- p-value는 effect size가 아닙니다.
- multiple testing은 false positive를 늘리므로 correction이 필요할 수 있습니다.
- small sample size에서는 assumption check가 불안정합니다.
- statistically significant라도 biologically trivial할 수 있습니다.

## 체크리스트
1. test를 고르기 전 experimental unit을 적습니다.
2. technical replicate와 biological replicate를 분리합니다.
3. group이 paired, repeated, independent 중 무엇인지 봅니다.
4. 두 group 비교인지 여러 group 비교인지 정합니다.
5. assumption check와 multiple-testing correction을 기록합니다.`,

  'troubleshooting-mindset': `# 실험 troubleshooting 사고법

troubleshooting은 가능한 원인을 범주로 나눌 때 가장 잘 됩니다. 한 설명으로 바로 뛰어들면 같은 실패가 반복될 수 있습니다.

## 네 가지 원인 그룹
- Sample: quality, concentration, degradation, contamination, storage, identity
- Reagent: lot, age, concentration, buffer, enzyme activity, compatibility
- Instrument: calibration, program, temperature, optics, rotor, plate reader settings
- Operator: setup order, pipetting, labeling, mixing, timing, documentation

## 한 번에 하나씩 바꾸기
모든 변수를 동시에 바꾸면 성공해도 원인을 알 수 없습니다. 구조적인 반복은 가장 가능성 높은 factor를 먼저 바꾸고 나머지는 유지합니다.

## control을 evidence로 사용
control은 형식이 아닙니다. system이 작동 가능한지, contamination이 있는지, sample만 약한지 알려 줍니다.

## troubleshooting note
suspected cause, evidence, change made, result를 적습니다. 이렇게 해야 반복되는 불확실성이 아니라 학습 기록이 됩니다.

## 멈춰야 할 때
방법이 계속 극단적인 조건을 요구한다면 optimization 문제가 아니라 design, primer pair, sample, assay choice 자체가 문제일 수 있습니다.`,
};
