import type { CalcResult, ValidationMessage } from '../types';

export interface CellDoublingTimeInputs {
  startDateIso: string;
  endDateIso: string;
  initialCellCount: number;
  finalCellCount: number;
}

export interface CellDoublingTimeValues {
  durationHours: number;
  growthRateK: number;
  doublingTimeHours: number;
  formula: string[];
}

export function calculateCellDoublingTime(inputs: CellDoublingTimeInputs): CalcResult<CellDoublingTimeValues> {
  const warnings: ValidationMessage[] = [];

  const startMs = Date.parse(inputs.startDateIso);
  const endMs = Date.parse(inputs.endDateIso);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    warnings.push({ severity: 'critical', code: 'date-invalid', message: 'Start/end date must be valid date-time values.' });
  }
  if (!Number.isFinite(inputs.initialCellCount) || inputs.initialCellCount <= 0) {
    warnings.push({ severity: 'critical', code: 'initial-invalid', message: 'Initial cell count must be > 0.' });
  }
  if (!Number.isFinite(inputs.finalCellCount) || inputs.finalCellCount <= 0) {
    warnings.push({ severity: 'critical', code: 'final-invalid', message: 'Final cell count must be > 0.' });
  }

  const durationHours = (endMs - startMs) / (1000 * 60 * 60);
  if (!Number.isFinite(durationHours) || durationHours <= 0) {
    warnings.push({ severity: 'critical', code: 'duration-invalid', message: 'End date must be later than start date.' });
  }

  const ratio = inputs.finalCellCount / inputs.initialCellCount;
  const growthRate = durationHours > 0 && ratio > 0 ? Math.log(ratio) / durationHours : 0;
  const doublingTime = growthRate > 0 ? Math.log(2) / growthRate : 0;

  if (ratio <= 1) {
    warnings.push({ severity: 'warn', code: 'no-growth', message: 'Final cell count is not higher than initial count; doubling time is not meaningful.' });
  }

  return {
    values: {
      durationHours: Number(durationHours.toFixed(4)),
      growthRateK: Number(growthRate.toFixed(6)),
      doublingTimeHours: Number(doublingTime.toFixed(4)),
      formula: [
        'duration_hours = (end_date - start_date) x 24',
        'growth_rate(k) = ln(final_cell_count / initial_cell_count) / duration_hours',
        'doubling_time(hours) = ln(2) / growth_rate(k)',
      ],
    },
    warnings,
    assumptions: ['Assumes exponential growth in the selected interval.'],
  };
}
