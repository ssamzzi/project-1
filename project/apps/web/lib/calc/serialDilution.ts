import { formatSigFigs, toMolar } from '../units';
import { positiveNumber, ambiguityHint } from '../validate';
import type { ValidationMessage, CalcResult } from '../types';

export type SerialMode = 'tubes' | '96-well';

export interface SerialDilutionInputs {
  mode: SerialMode;
  startConc: number;
  startUnit: 'nM' | 'µM' | 'mM' | 'M';
  dilutionFactor: number;
  steps: number;
  finalVolume: number;
  finalVolumeUnit: 'µL' | 'mL';
  transferVolume?: number;
}

export interface StepRow {
  step: number;
  take: string;
  diluent: string;
  concentration: string;
}

export interface SerialDilutionResult {
  rows: StepRow[];
  plateMap: string[];
  formulas: string[];
  warnings: string[];
}

export function calculateSerialDilution(inputs: SerialDilutionInputs): CalcResult<SerialDilutionResult> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('startConc', inputs.startConc));
  warnings.push(...positiveNumber('dilutionFactor', inputs.dilutionFactor));
  warnings.push(...positiveNumber('steps', inputs.steps));
  warnings.push(...positiveNumber('finalVolume', inputs.finalVolume));
  warnings.push(...ambiguityHint('finalVolume', inputs.finalVolume, inputs.finalVolumeUnit));

  if (inputs.dilutionFactor <= 1) {
    warnings.push({ severity: 'critical', code: 'factor-invalid', message: 'Dilution factor must be > 1.' });
  }
  if (!Number.isInteger(inputs.steps) || inputs.steps < 1) {
    warnings.push({ severity: 'critical', code: 'steps-invalid', message: 'Steps must be integer >= 1.' });
  }

  const start = toMolar(inputs.startConc, inputs.startUnit);
  const fv = inputs.finalVolumeUnit === 'mL' ? inputs.finalVolume * 1000 : inputs.finalVolume;
  const transferDefault = Math.max(1, fv / inputs.dilutionFactor);
  const transfer = Math.max(0.5, inputs.transferVolume ?? transferDefault);

  let conc = start;
  const rows: StepRow[] = [];
  const plateRows: string[] = [];

  for (let i = 1; i <= inputs.steps; i += 1) {
    const diluent = Math.max(0, fv - transfer);
    const rowConc = conc / inputs.dilutionFactor;
    rows.push({
      step: i,
      take: `${formatSigFigs(transfer, 4)} µL`,
      diluent: `${formatSigFigs(diluent, 4)} µL`,
      concentration: `${formatSigFigs(rowConc, 4)} ${inputs.startUnit}`,
    });

    if (inputs.mode === '96-well') {
      const well = `A${i}`;
      const cLabel = `${formatSigFigs(rowConc, 4)} ${inputs.startUnit}`;
      plateRows.push(`${well}: take ${formatSigFigs(transfer, 4)} µL from previous, add diluent ${formatSigFigs(diluent, 4)} µL => ${cLabel}`);
    }
    conc = rowConc;
  }

  const formulas = ['C(next)=C(current)/dilution factor', 'Vdiluent = Vfinal - Vtransfer'];
  const info: string[] = [];
  if (transfer < 1) {
    info.push('Very small transfer volume; use a low-retention pipette and avoid evaporation bias.');
  }

  return {
    values: {
      rows,
      plateMap: plateRows,
      formulas,
      warnings: info,
    },
    warnings,
    assumptions: ['Use fully mixed mix after each transfer step.'],
  };
}
