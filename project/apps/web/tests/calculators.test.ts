import { describe, expect, it } from 'vitest';
import { calculateA260 } from '../lib/calc/a260';
import { calculateCellSeeding } from '../lib/calc/cellSeeding';
import { calculateCopyNumber } from '../lib/calc/copyNumber';
import { calculateHemocytometer } from '../lib/calc/hemocytometer';
import { calculateLigation } from '../lib/calc/ligation';
import { calculateMultiStockMix } from '../lib/calc/multiStockMix';
import { calculatePcrMasterMix } from '../lib/calc/pcrMasterMix';
import { calculateSerialDilution } from '../lib/calc/serialDilution';

const num = (value: string | number): number => (typeof value === 'number' ? value : Number(value));

describe('PCR master mix calculator', () => {
  it('adds overage reactions with 2x master mix mode', () => {
    const result = calculatePcrMasterMix({
      mode: 'endpoint',
      reactionVolume: 20,
      reactionVolumeUnit: 'µL',
      numberReactions: 4,
      overageType: 'percent',
      overageValue: 10,
      includeTemplate: false,
      templateVolume: 2,
      masterMixType: 'two-x',
      twoXMasterMixVolume: 10,
      primerStock: 10,
      primerStockUnit: 'µM',
      primerFinal: 0.2,
      probeStock: 10,
      probeStockUnit: 'µM',
      probeFinal: 0.25,
      dntpStock: 10,
      dntpStockUnit: 'mM',
      dntpFinal: 0.2,
      mgcl2Stock: 50,
      mgcl2StockUnit: 'mM',
      mgcl2Final: 3,
      polymeraseAndBufferVolume: 0.5,
    });
    expect(result.values.totalReactions).toBe(5);
    expect(result.values.rows.some((r) => r.component.includes('Water'))).toBe(true);
  });

  it('warns when water would be negative', () => {
    const result = calculatePcrMasterMix({
      mode: 'endpoint',
      reactionVolume: 20,
      reactionVolumeUnit: 'µL',
      numberReactions: 1,
      overageType: 'extra',
      overageValue: 0,
      includeTemplate: false,
      templateVolume: 0,
      masterMixType: 'two-x',
      twoXMasterMixVolume: 25,
      primerStock: 10,
      primerStockUnit: 'µM',
      primerFinal: 0.2,
      dntpStock: 10,
      dntpStockUnit: 'mM',
      dntpFinal: 0.2,
      mgcl2Stock: 50,
      mgcl2StockUnit: 'mM',
      mgcl2Final: 3,
      polymeraseAndBufferVolume: 0.5,
    });

    expect(result.warnings.some((message) => message.code === 'water-negative')).toBe(true);
    const critical = result.warnings.filter((message) => message.severity === 'critical');
    expect(critical.length).toBeGreaterThan(0);
  });

  it('detects suspicious small mL volume', () => {
    const result = calculatePcrMasterMix({
      mode: 'endpoint',
      reactionVolume: 0.02,
      reactionVolumeUnit: 'mL',
      numberReactions: 1,
      overageType: 'percent',
      overageValue: 10,
      includeTemplate: false,
      templateVolume: 0,
      masterMixType: 'two-x',
      twoXMasterMixVolume: 10,
      primerStock: 10,
      primerStockUnit: 'µM',
      primerFinal: 0.2,
      dntpStock: 10,
      dntpStockUnit: 'mM',
      dntpFinal: 0.2,
      mgcl2Stock: 50,
      mgcl2StockUnit: 'mM',
      mgcl2Final: 3,
      polymeraseAndBufferVolume: 0.5,
    });
    expect(result.warnings.some((message) => message.code === 'volume-ambiguity')).toBe(true);
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
    expect(num(result.values.solventVolume)).toBeCloseTo(53.75);
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
    expect(result.values.copiesPerMl).toBeCloseTo(9.126e12, 0);
  });

  it('accepts molar input directly', () => {
    const result = calculateCopyNumber({ type: 'RNA', length: 100, concentration: 2, concentrationUnit: 'µM' });
    expect(result.values.copiesPerUl).toBeCloseTo(1.2044281512e12, 0);
    expect(result.values.copiesPerMl).toBeCloseTo(1.2044281512e15, 0);
  });

  it('suggests dilution when target is provided', () => {
    const result = calculateCopyNumber({ type: 'ssDNA', length: 500, concentration: 20, concentrationUnit: 'ng/µL', targetCopies: 1e10 });
    expect(result.values.copyDilutionFactor).toBeGreaterThan(1);
    expect(result.values.dilutionPlan.length).toBeGreaterThan(0);
  });
});

describe('ligation setup calculator', () => {
  it('computes insert amount from vector amount', () => {
    const result = calculateLigation({
      vectorLength: 3000,
      insertLength: 1000,
      vectorAmountNg: 50,
      desiredRatio: 3,
      vectorConcentration: 25,
      vectorVolume: 2,
    });
    expect(result.values.requiredInsertNg).toBeCloseTo(50);
    expect(result.values.requiredInsertVolume).toContain('µL');
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
      trypanBlueRatio: 1,
      sampleVolume: 500,
      sampleVolumeUnit: 'µL',
    });
    expect(result.values.viablePerMl).toBeCloseTo(1000000, 0);
    expect(result.values.totalPerMl).toBeCloseTo(1200000, 0);
  });

  it('warns when counts are not integers', () => {
    const result = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [10.5, 5],
      totalCounts: [12, 10],
      dilution: 2,
      trypanBlueRatio: 1,
    });
    expect(result.warnings.some((warning) => warning.code === 'count-format')).toBe(true);
  });

  it('reports total viable cells when sample volume is provided', () => {
    const result = calculateHemocytometer({
      mode: 'tube',
      liveCounts: [50, 50],
      totalCounts: [55, 55],
      dilution: 10,
      trypanBlueRatio: 1,
      sampleVolume: 1000,
      sampleVolumeUnit: 'µL',
    });
    expect(result.values.totalViable).toBeGreaterThan(0);
  });
});
