import type { CalcResult, ValidationMessage } from '../types';

export interface CloningHelperInputs {
  dnaLengthBp: number;
  targetProteinKDa: number;
}

export interface CloningHelperValues {
  aminoAcidCountFromDna: number;
  proteinMwKDaFromDna: number;
  estimatedDnaBpFromProtein: number;
  formula: string[];
}

export function calculateCloningHelper(inputs: CloningHelperInputs): CalcResult<CloningHelperValues> {
  const warnings: ValidationMessage[] = [];

  if (!Number.isFinite(inputs.dnaLengthBp) || inputs.dnaLengthBp < 0) {
    warnings.push({ severity: 'critical', code: 'dna-invalid', message: 'DNA length must be >= 0.' });
  }
  if (!Number.isFinite(inputs.targetProteinKDa) || inputs.targetProteinKDa < 0) {
    warnings.push({ severity: 'critical', code: 'protein-invalid', message: 'Target protein kDa must be >= 0.' });
  }

  const aa = inputs.dnaLengthBp > 0 ? inputs.dnaLengthBp / 3 : 0;
  const protein = aa > 0 ? (aa * 110) / 1000 : 0;
  const dna = inputs.targetProteinKDa > 0 ? ((inputs.targetProteinKDa * 1000) / 110) * 3 : 0;

  return {
    values: {
      aminoAcidCountFromDna: Number(aa.toFixed(4)),
      proteinMwKDaFromDna: Number(protein.toFixed(4)),
      estimatedDnaBpFromProtein: Number(dna.toFixed(4)),
      formula: [
        'amino_acid_count = DNA_length_bp / 3',
        'protein_MW_kDa = (amino_acid_count x 110) / 1000',
        'estimated_DNA_bp = (target_protein_kDa x 1000 / 110) x 3',
      ],
    },
    warnings,
    assumptions: ['Uses average amino-acid mass 110 Da and ignores tags/PTMs.'],
  };
}
