"use client";
import { ChangeEvent, ReactNode } from 'react';

interface Props {
  label: string;
  value: number;
  unit: string;
  onValueChange: (v: number) => void;
  onUnitChange: (u: string) => void;
  units: string[];
  preview?: string;
  min?: number;
  step?: string;
  children?: ReactNode;
}

export function UnitInput({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  units,
  preview,
  min,
  step,
  children,
}: Props) {
  const onNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      onValueChange(n);
    }
  };

  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex min-w-0 gap-2">
        <input
          aria-label={label}
          className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3"
          type="number"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={onNumberChange}
        />
        <select
          className="h-11 w-24 flex-none rounded-lg border border-slate-300 px-2"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          aria-label={`${label} unit`}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      {preview ? <div className="text-xs text-slate-500">{preview}</div> : null}
      {children}
    </label>
  );
}
