export type Locale = 'en' | 'ko';

export type Severity = 'info' | 'warn' | 'critical';

export type TipTab = 'protocol' | 'mistakes' | 'ranges' | 'troubleshooting';

export interface CalculatorTip {
  id: string;
  calculatorId: string;
  tab: TipTab;
  title: string;
  body: string;
  severity: Severity;
  triggers?: TipTrigger[];
  references?: { label: string; url: string }[];
}

export interface TipTrigger {
  field: string;
  op: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'exists';
  value?: number | string | boolean;
}

export interface ValidationMessage {
  severity: Severity;
  code: string;
  message: string;
}

export interface CalcResult<TData> {
  values: TData;
  warnings: ValidationMessage[];
  assumptions: string[];
}
