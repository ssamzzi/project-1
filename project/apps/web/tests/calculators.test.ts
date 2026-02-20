import { describe, expect, it } from 'vitest';
import { calculateA260 } from '../lib/calc/a260';
import { calculateCellSeeding } from '../lib/calc/cellSeeding';
import { calculateCopyNumber } from '../lib/calc/copyNumber';
import { calculateHemocytometer } from '../lib/calc/hemocytometer';
import { calculateLigation } from '../lib/calc/ligation';
import { calculateMultiStockMix } from '../lib/calc/multiStockMix';
import { calculateReconstitution } from '../lib/calc/reconstitution';
import { calculateRcfRpm } from '../lib/calc/rcfRpm';
import { calculatePcrMasterMix } from '../lib/calc/pcrMasterMix';
import { calculateSerialDilution } from '../lib/calc/serialDilution';
import { calculateGelLoading } from '../lib/calc/gelLoading';

const num = (value: string | number): number => (typeof value === 'number' ? value : Number(value));

describe('PCR master mix calculator', () => {
  const pcrBase = {
    mode: 'endpoint' as const,
    reactionVolume: 20,
    reactionVolumeUnit: 'µL' as const,
    numberReactions: 10,
    includeTemplate: false,
    templateVolume: 0,
    masterMixType: 'two-x' as const,
    twoXMasterMixVolume: 10,
    primerStock: 10,
    primerStockUnit: 'µM' as const,
    primerFinal: 0.2,
    primerFinalUnit: 'µM' as const,
    dntpStock: 10,
    dntpStockUnit: 'mM' as const,
    dntpFinal: 0.2,
    dntpFinalUnit: 'mM' as const,
    mgcl2Stock: 50,
    mgcl2StockUnit: 'mM' as const,
    mgcl2Final: 3,
    mgcl2FinalUnit: 'mM' as const,
    polymeraseAndBufferVolume: 1,
  };

  it('adds overage reactions with 2x master mix mode', () => {
    const result = calculatePcrMasterMix({ ...pcrBase, numberReactions: 4, overageType: 'percent', overageValue: 10, templateVolume: 2, probeStock: 10, probeStockUnit: 'µM', probeFinal: 0.25, polymeraseAndBufferVolume: 0.5 });
    expect(result.values.totalReactions).toBe(5);
    expect(result.values.rows.some((r) => r.component.includes('Water'))).toBe(true);
  });

  it('warns when water would be negative', () => {
    const result = calculatePcrMasterMix({ ...pcrBase, numberReactions: 1, overageType: 'extra', overageValue: 0, twoXMasterMixVolume: 25 });

    expect(result.warnings.some((message) => message.code === 'water-negative')).toBe(true);
    const critical = result.warnings.filter((message) => message.severity === 'critical');
    expect(critical.length).toBeGreaterThan(0);
  });

  it('detects suspicious small mL volume', () => {
    const result = calculatePcrMasterMix({ ...pcrBase, reactionVolume: 0.02, reactionVolumeUnit: 'mL' as const, overageType: 'percent', overageValue: 10 });
    expect(result.warnings.some((message) => message.code === 'volume-ambiguity')).toBe(true);
  });

  it('supports percent, extra, and dead-volume overage modes', () => {
    const percent = calculatePcrMasterMix({ ...pcrBase, overageType: 'percent', overageValue: 25 });
    expect(percent.values.totalReactions).toBe(13);

    const extra = calculatePcrMasterMix({
      ...pcrBase,
      overageType: 'extra',
      overageValue: 2,
    });
    expect(extra.values.totalReactions).toBe(12);

    const dead = calculatePcrMasterMix({ ...pcrBase, overageType: 'dead', overageValue: 40 });
    expect(dead.values.totalReactions).toBe(12);
  });
});

describe('multi-stock mix calculator', () => {
  it('calculates solvent and component volume', () => {
    const result = calculateMultiStockMix({
      finalVolume: 50,
      finalVolumeUnit: 'µL',
      overagePercent: 10,
      solventName: 'water',
      components: [
        { id: '1', name: 'Primer F', stockValue: 10, stockUnit: 'µM', targetValue: 0.2, targetUnit: 'µM' },
        { id: '2', name: 'Primer R', stockValue: 10, stockUnit: 'µM', targetValue: 0.2, targetUnit: 'µM' },
      ],
    });
    expect(num(result.values.solventVolume)).toBeCloseTo(53);
    expect(result.warnings.some((message) => message.severity === 'critical')).toBe(false);
  });

  it('supports mass-to-molar with molecular weight', () => {
    const result = calculateMultiStockMix({
      finalVolume: 100,
      finalVolumeUnit: 'µL',
      overagePercent: 0,
      solventName: 'water',
      components: [
        { id: '1', name: 'Sample', stockValue: 100, stockUnit: 'ng/µL', targetValue: 10, targetUnit: 'ng/µL', molecularWeight: 1000 },
      ],
    });
    expect(num(result.values.rows[0].volume)).toBeCloseTo(10);
    expect(result.warnings.some((message) => message.code === 'volume-over')).toBe(false);
  });

  it('flags component volumes greater than final volume', () => {
    const result = calculateMultiStockMix({
      finalVolume: 100,
      finalVolumeUnit: 'µL',
      overagePercent: 0,
      solventName: 'water',
      components: [
        { id: '1', name: 'A', stockValue: 10, stockUnit: 'µM', targetValue: 8, targetUnit: 'µM' },
        { id: '2', name: 'B', stockValue: 10, stockUnit: 'µM', targetValue: 8, targetUnit: 'µM' },
      ],
    });
    expect(result.warnings.some((message) => message.code === 'volume-over')).toBe(true);
  });
});

describe('serial dilution calculator', () => {
  it('creates expected dilution table for tubes', () => {
    const result = calculateSerialDilution({
      mode: 'tubes',
      startConc: 1000,
      startUnit: 'nM',
      dilutionFactor: 10,
      steps: 3,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
      transferVolume: 10,
    });
    expect(result.values.rows.length).toBe(3);
    expect(num(result.values.rows[0].take)).toBeCloseTo(10);
    expect(result.values.rows[2].step).toBe(3);
  });

  it('warns when dilution factor is <= 1', () => {
    const result = calculateSerialDilution({
      mode: 'tubes',
      startConc: 100,
      startUnit: 'nM',
      dilutionFactor: 1,
      steps: 2,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
    });
    expect(result.warnings.some((message) => message.code === 'factor-invalid')).toBe(true);
  });

  it('adds plate-map entries for 96-well mode', () => {
    const result = calculateSerialDilution({
      mode: '96-well',
      startConc: 1000,
      startUnit: 'nM',
      dilutionFactor: 2,
      steps: 2,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
    });
    expect(result.values.plateMap).toHaveLength(2);
    expect(result.values.plateMap[0]).toContain('A1');
  });

  it('returns expected nM and µM display values', () => {
    const nm = calculateSerialDilution({
      mode: 'tubes',
      startConc: 1000,
      startUnit: 'nM',
      dilutionFactor: 10,
      steps: 1,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
      transferVolume: 10,
    });
    expect(nm.values.rows[0].concentration).toContain('100');

    const uM = calculateSerialDilution({
      mode: 'tubes',
      startConc: 1,
      startUnit: 'µM',
      dilutionFactor: 2,
      steps: 1,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
      transferVolume: 50,
    });
    expect(uM.values.rows[0].concentration).toContain('0.5');
  });

  it('returns expected mM and M display values', () => {
    const mM = calculateSerialDilution({
      mode: 'tubes',
      startConc: 500,
      startUnit: 'mM',
      dilutionFactor: 2,
      steps: 1,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
    });
    expect(mM.values.rows[0].concentration).toContain('250');

    const M = calculateSerialDilution({
      mode: 'tubes',
      startConc: 1,
      startUnit: 'M',
      dilutionFactor: 2,
      steps: 1,
      finalVolume: 100,
      finalVolumeUnit: 'µL',
    });
    expect(M.values.rows[0].concentration).toContain('0.5');
  });
});

describe('copy number calculator', () => {
  it('computes dsDNA copies from ng/µL', () => {
    const result = calculateCopyNumber({
      type: 'dsDNA',
      length: 1000,
      concentration: 10,
      concentrationUnit: 'ng/µL',
    });
    expect(result.values.copiesPerUl).toBeGreaterThan(0);
    expect(result.values.copiesPerMl).toBeCloseTo(9.124455697e12, -2);
  });

  it('accepts molar input directly', () => {
    const result = calculateCopyNumber({ type: 'RNA', length: 100, concentration: 2, concentrationUnit: 'µM' });
    expect(result.values.copiesPerUl).toBeCloseTo(1.2044281512e12, -4);
    expect(result.values.copiesPerMl).toBeCloseTo(result.values.copiesPerUl * 1000, 0);
  });

  it('suggests dilution when target is provided', () => {
    const result = calculateCopyNumber({ type: 'ssDNA', length: 500, concentration: 20, concentrationUnit: 'ng/µL', targetCopies: 1e10 });
    expect(result.values.copyDilutionFactor).toBeGreaterThan(1);
    expect(result.values.dilutionPlan.length).toBeGreaterThan(0);
  });

  it('builds 2-step dilution plan for large factors', () => {
    const result = calculateCopyNumber({
      type: 'dsDNA',
      length: 1000,
      concentration: 1000,
      concentrationUnit: 'ng/µL',
      targetCopies: 1e8,
    });
    expect(result.values.copyDilutionFactor).toBeGreaterThan(1000);
    expect(result.values.dilutionPlan.length).toBe(2);
    expect(result.values.dilutionPlan[0].mixVolume).toContain('1:');
    expect(result.values.dilutionPlan[1].mixVolume).toContain(':');
  });
});

describe('ligation setup calculator', () => {
  it('computes insert amount from vector amount', () => {
    const result = calculateLigation({
      vectorLength: 3000,
      insertLength: 1000,
      vectorAmountNg: 50,
      desiredRatio: 3,
      insertConcentrationNgPerUl: 10,
      vectorConcentration: 25,
      vectorVolume: 2,
    });
    expect(result.values.requiredInsertNg).toBeCloseTo(50);
    expect(result.values.requiredInsertVolume).toBeCloseTo(5);
    expect(result.values.requiredInsertFmol).toBeGreaterThan(0);
  });

  it('warns when neither vector amount nor concentration/volume is provided', () => {
    const result = calculateLigation({
      vectorLength: 3000,
      insertLength: 500,
      vectorAmountNg: 0,
      desiredRatio: 3,
    });
    expect(result.warnings.some((warning) => warning.code === 'vector-required')).toBe(true);
  });

  it('computes simple vector fmol value', () => {
    const result = calculateLigation({
      vectorLength: 1000,
      insertLength: 500,
      vectorAmountNg: 33.3,
      desiredRatio: 2,
    });
    expect(result.values.vectorFmol).toBeCloseTo(50, 0);
    expect(result.values.requiredInsertFmol).toBeCloseTo(101, 0);
  });
});

describe('A260 calculator', () => {
  it('converts A260 to dsDNA concentration', () => {
    const result = calculateA260({ a260: 0.2, dilution: 10, type: 'dsDNA' });
    expect(result.values.concentrationUgPerMl).toBeCloseTo(100);
    expect(result.values.concentrationNgPerUl).toBeCloseTo(100);
  });

  it('computes A260/A280 when provided', () => {
    const result = calculateA260({ a260: 0.2, dilution: 10, type: 'RNA', a280: 0.1 });
    expect(result.values.ratioA260A280).toBeCloseTo(2);
  });

  it('warns when oligo conversion uses approximation', () => {
    const result = calculateA260({ a260: 0.2, dilution: 10, type: 'oligo' });
    expect(result.warnings.some((warning) => warning.code === 'a260-oligo')).toBe(true);
  });
});

describe('cell seeding calculator', () => {
  it('calculates total volume and per-well volume', () => {
    const result = calculateCellSeeding({
      plateType: '96',
      wells: 96,
      customWellVolume: 0,
      customWellArea: 0.32,
      mode: 'cells/well',
      targetDensity: 1e5,
      cellConcentration: 1e6,
      overagePercent: 10,
    });
    expect(result.values.perWellVolumeUl).toBeCloseTo(100);
    expect(result.values.totalSuspensionVolumeUl).toBeCloseTo(10560);
  });

  it('supports cells/cm² mode with known plate area', () => {
    const result = calculateCellSeeding({
      plateType: '6',
      wells: 6,
      customWellVolume: 0,
      customWellArea: 9.5,
      mode: 'cells/cm²',
      targetDensity: 1e4,
      cellConcentration: 1e6,
      overagePercent: 0,
    });
    expect(result.values.totalCells).toBeGreaterThan(0);
    expect(result.values.perWellVolumeUl).toBeCloseTo(95);
  });

  it('warns when over capacity is likely', () => {
    const result = calculateCellSeeding({
      plateType: '96',
      wells: 96,
      customWellVolume: 0,
      customWellArea: 0.32,
      mode: 'cells/well',
      targetDensity: 1e8,
      cellConcentration: 1e6,
      overagePercent: 0,
    });
    expect(result.warnings.some((warning) => warning.code === 'well-capacity')).toBe(true);
  });
});

describe('hemocytometer calculator', () => {
  it('calculates viable and total cells from square counts', () => {
    const result = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [40, 50, 60],
      totalCounts: [50, 60, 70],
      dilution: 2,
      trypanBlueRatioMode: '1:1',
      sampleVolume: 500,
      sampleVolumeUnit: 'µL',
    });
    expect(result.values.viablePerMl).toBeCloseTo(2000000, 0);
    expect(result.values.totalPerMl).toBeCloseTo(2400000, 0);
  });

  it('warns when counts are not integers', () => {
    const result = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [10.5, 5],
      totalCounts: [12, 10],
      dilution: 2,
      trypanBlueRatioMode: '1:4',
      sampleVolumeUnit: 'µL',
    });
    expect(result.warnings.some((warning) => warning.code === 'count-format')).toBe(true);
  });

  it('reports total viable cells when sample volume is provided', () => {
    const result = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [50, 50],
      totalCounts: [55, 55],
      dilution: 10,
      trypanBlueRatioMode: 'custom',
      trypanBlueRatioText: '1:2',
      sampleVolume: 1000,
      sampleVolumeUnit: 'µL',
    });
    expect(result.values.totalViable).toBeGreaterThan(0);
  });

  it('applies Trypan ratio factor to concentration', () => {
    const ratio1 = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [40, 40],
      totalCounts: [50, 50],
      dilution: 10,
      trypanBlueRatioMode: '1:1',
      sampleVolumeUnit: 'µL',
    }).values.viablePerMl;

    const ratio4 = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [40, 40],
      totalCounts: [50, 50],
      dilution: 10,
      trypanBlueRatioMode: '1:4',
      sampleVolumeUnit: 'µL',
    }).values.viablePerMl;

    expect(ratio4).toBeGreaterThan(ratio1);
  });
});

describe('reconstitution helper', () => {
  it('computes solvent from mass and target concentration', () => {
    const result = calculateReconstitution({
      vialMassMg: 10,
      molecularWeight: 1000,
      targetConcentration: 1,
      targetConcentrationUnit: 'mg/mL',
    });
    expect(result.values.requiredSolventMl).toBeCloseTo(10, 3);
    expect(result.values.formula.length).toBeGreaterThan(1);
  });
});

describe('RCF / RPM calculator', () => {
  it('converts RPM to RCF and back', () => {
    const forward = calculateRcfRpm({
      direction: 'rcfFromRpm',
      radiusCm: 10,
      rpm: 12000,
    });
    expect(forward.values.rcf).toBeGreaterThan(1);

    const reverse = calculateRcfRpm({
      direction: 'rpmFromRcf',
      radiusCm: 10,
      rcf: forward.values.rcf,
    });
    expect(reverse.values.rpm).toBeCloseTo(12000, 0);
  });
});

describe('gel loading calculator', () => {
  it('calculates loading volume from target mass and concentration', () => {
    const result = calculateGelLoading({
      sampleConcentrationNgPerUl: 25,
      targetMassNg: 200,
      wellMaxVolumeUl: 20,
    });
    expect(result.values.requiredSampleVolumeUl).toBeCloseTo(8);
    expect(result.values.percentToMax).toBeCloseTo(40);
  });
});
