export type VolumeUnit = 'nL' | 'uL' | 'µL' | 'mL' | 'L';
export type LengthConcentrationUnit = 'nM' | 'µM' | 'mM' | 'M';
export type MassConcentrationUnit = 'ng/µL' | 'µg/µL' | 'mg/µL' | 'ng/mL' | 'µg/mL' | 'mg/mL' | 'µg/mL' | 'ng/uL';
export type Unit = VolumeUnit | LengthConcentrationUnit | MassConcentrationUnit | 'copies/µL' | 'cells/µL' | 'cells/mL' | 'cells/cm²' | 'cells/well';

export type NumberOrNull = number | null;

const VOLUME_TO_UL: Record<VolumeUnit, number> = {
  nL: 1e-3,
  uL: 1,
  'µL': 1,
  mL: 1000,
  L: 1_000_000,
};

const CONC_TO_MOLAR: Record<LengthConcentrationUnit, number> = {
  nM: 1e-9,
  'µM': 1e-6,
  'mM': 1e-3,
  M: 1,
};

const MASS_TO_G_PER_L: Record<MassConcentrationUnit, number> = {
  'ng/µL': 1e-3,
  'ng/uL': 1e-3,
  'µg/µL': 1,
  'mg/µL': 1_000,
  'ng/mL': 1e-6,
  'µg/mL': 1e-3,
  'mg/mL': 1,
};

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name}: invalid number`);
  }
}

export function toMicroliter(value: number, unit: VolumeUnit): number {
  assertPositive('volume', value);
  if (value < 0) {
    throw new Error('volume: must be non-negative');
  }
  const factor = VOLUME_TO_UL[unit];
  return value * factor;
}

export function fromMicroliter(value: number, unit: VolumeUnit): number {
  const factor = VOLUME_TO_UL[unit];
  return value / factor;
}

export function toMolar(value: number, unit: LengthConcentrationUnit, molecularWeightGPerMol?: number): number {
  assertPositive('concentration', value);
  if (unit in CONC_TO_MOLAR) {
    return value * CONC_TO_MOLAR[unit as LengthConcentrationUnit];
  }
  if (!molecularWeightGPerMol || molecularWeightGPerMol <= 0) {
    throw new Error('MW required for mass-based conversion');
  }
  const gPerL = toGramPerLiter(value, unit as MassConcentrationUnit);
  return gPerL / molecularWeightGPerMol;
}

export function toMassGramPerLiter(value: number, unit: MassConcentrationUnit): number {
  return toGramPerLiter(value, unit);
}

function toGramPerLiter(value: number, unit: MassConcentrationUnit): number {
  assertPositive('concentration', value);
  const factor = MASS_TO_G_PER_L[unit];
  if (factor === undefined) {
    throw new Error(`unsupported concentration unit ${unit}`);
  }
  return value * factor;
}

export function formatSigFigs(value: number, sigFigs: number): number {
  if (!Number.isFinite(value)) return value;
  if (value === 0) return 0;
  const abs = Math.abs(value);
  const decimals = Math.max(0, sigFigs - Math.floor(Math.log10(abs)) - 1);
  const factor = 10 ** Math.min(12, decimals);
  const rounded = Math.round(value * factor) / factor;
  return Number(rounded.toPrecision(Math.min(15, Math.max(3, sigFigs))));
}

export function parseNumber(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`invalid numeric input: ${value}`);
  }
  return n;
}

export const DEFAULT_MASS_UNITS: MassConcentrationUnit[] = ['ng/µL', 'µg/µL', 'mg/µL', 'ng/mL', 'µg/mL', 'mg/mL'];
export const DEFAULT_CONC_UNITS: LengthConcentrationUnit[] = ['nM', 'µM', 'mM', 'M'];
export const DEFAULT_VOL_UNITS: VolumeUnit[] = ['nL', 'µL', 'mL', 'L'];
