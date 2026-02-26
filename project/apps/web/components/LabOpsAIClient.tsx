"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { HF_MODEL } from "../lib/ai/config";
import { useLocale } from "../lib/context/LocaleContext";
import { TipsPanel } from "./TipsPanel";
import type { CalculatorTip } from "../lib/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as any;

type LabTab = "omniparse" | "vision" | "protocolguard" | "inventory";
type VisionMode = "western" | "colony";
type ProtocolMode = "molarity" | "primer" | "risk";

type TidyRow = { Well: string; Time: number; Value: number; Group?: string };

const WELL_REGEX = /^[A-H](?:0?[1-9]|1[0-2])$/i;

function downloadText(filename: string, data: string) {
  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const content = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  downloadText(filename, content);
}

function parseCsvSimple(text: string): string[][] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((x) => x.trim().length > 0);
  return lines.map((line) => {
    const tab = line.split("\t");
    if (tab.length > 1) return tab.map((x) => x.trim());
    return line.split(",").map((x) => x.trim());
  });
}

function detectHeaderIndex(matrix: string[][]): number {
  const pattern = /(well|time|od|rfu|abs|signal|value)/i;
  let best = 0;
  let score = -1;
  for (let i = 0; i < Math.min(matrix.length, 120); i += 1) {
    const s = (matrix[i].join(" ").match(pattern) || []).length;
    if (s > score) {
      score = s;
      best = i;
    }
  }
  return best;
}

function matrixToTidy(raw: string[][]): TidyRow[] {
  const out: TidyRow[] = [];
  const rowStart = raw.findIndex((r) => /^[A-H]$/i.test(String(r[0] || "")));
  if (rowStart >= 0) {
    for (let i = rowStart; i < raw.length; i += 1) {
      const row = String(raw[i][0] || "").toUpperCase();
      if (!/^[A-H]$/.test(row)) continue;
      for (let c = 1; c <= 12 && c < raw[i].length; c += 1) {
        const v = Number(raw[i][c]);
        if (Number.isFinite(v)) out.push({ Well: `${row}${c}`, Time: 0, Value: v });
      }
    }
    if (out.length) return out;
  }

  const h = detectHeaderIndex(raw);
  const header = raw[h] || [];
  const data = raw.slice(h + 1);
  const cols = header.map((x) => String(x).toLowerCase());
  const wellCol = cols.findIndex((x) => x.includes("well"));
  const timeCol = cols.findIndex((x) => x.includes("time") || x.includes("minute") || x.includes("hour"));
  const valueCol = cols.findIndex((x) => ["value", "od", "rfu", "signal", "abs"].some((k) => x.includes(k)));
  if (wellCol >= 0 && timeCol >= 0 && valueCol >= 0) {
    data.forEach((r) => {
      const well = String(r[wellCol] || "").toUpperCase();
      const t = Number(r[timeCol]);
      const v = Number(r[valueCol]);
      if (WELL_REGEX.test(well) && Number.isFinite(t) && Number.isFinite(v)) out.push({ Well: well, Time: t, Value: v });
    });
    if (out.length) return out;
  }

  const probe = data.slice(0, 12);
  const numericTimeRows = probe.filter((r) => Number.isFinite(Number(r[0]))).length;
  const looksTimeFirst = numericTimeRows >= Math.max(3, Math.ceil(probe.length * 0.6));
  if (looksTimeFirst) {
    const wells = header.slice(1).map((x) => String(x || "").toUpperCase());
    data.forEach((r) => {
      const t = Number(r[0]);
      if (!Number.isFinite(t)) return;
      wells.forEach((w, i) => {
        const v = Number(r[i + 1]);
        if (WELL_REGEX.test(w) && Number.isFinite(v)) out.push({ Well: w, Time: t, Value: v });
      });
    });
  }
  return out;
}

function baselineSubtract(rows: TidyRow[]) {
  const byWell: Record<string, TidyRow[]> = {};
  rows.forEach((r) => {
    byWell[r.Well] = byWell[r.Well] || [];
    byWell[r.Well].push(r);
  });
  return rows.map((r) => {
    const base = Math.min(...byWell[r.Well].map((x) => x.Value));
    return { ...r, Value: r.Value - base };
  });
}

function fitGrowth(rows: TidyRow[]) {
  const byWell: Record<string, TidyRow[]> = {};
  rows.forEach((r) => {
    byWell[r.Well] = byWell[r.Well] || [];
    byWell[r.Well].push(r);
  });
  const out: Array<{ Well: string; growthRate: number; r2: number }> = [];
  Object.entries(byWell).forEach(([well, points]) => {
    const p = points.filter((x) => x.Value > 0).sort((a, b) => a.Time - b.Time);
    if (p.length < 4) return;
    const xs = p.map((x) => x.Time);
    const ys = p.map((x) => Math.log(x.Value));
    const n = xs.length;
    const sx = xs.reduce((a, b) => a + b, 0);
    const sy = ys.reduce((a, b) => a + b, 0);
    const sxx = xs.reduce((a, b) => a + b * b, 0);
    const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
    const den = n * sxx - sx * sx;
    if (den === 0) return;
    const b = (n * sxy - sx * sy) / den;
    const a = (sy - b * sx) / n;
    const yhat = xs.map((x) => a + b * x);
    const ssRes = ys.reduce((acc, y, i) => acc + (y - yhat[i]) ** 2, 0);
    const yMean = sy / n;
    const ssTot = ys.reduce((acc, y) => acc + (y - yMean) ** 2, 0);
    out.push({ Well: well, growthRate: b, r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot });
  });
  return out.sort((a, b) => b.r2 - a.r2);
}

function runRiskCheckLocally(text: string) {
  const t = text.toLowerCase();
  const warnings: string[] = [];
  if (t.includes("sds") && (t.includes("acid") || t.includes("hcl"))) warnings.push("SDS + strong acid may produce decomposition/aerosol risk.");
  if (t.includes("enzyme") && (t.includes("heat") || t.includes("boil")) && (t.includes("before") || t.includes("first"))) {
    warnings.push("Heating before enzyme step can denature targets/enzymes and fail reaction.");
  }
  if (!warnings.length) warnings.push("No high-risk keyword pattern detected. Validate with local SOP.");
  return warnings;
}

function grayscale(img: ImageData): Uint8ClampedArray {
  const g = new Uint8ClampedArray(img.width * img.height);
  for (let i = 0; i < img.data.length; i += 4) {
    g[i / 4] = Math.round(0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2]);
  }
  return g;
}

async function loadImageToCanvas(file: File) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  try {
    const bitmap = await createImageBitmap(file);
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);
  } catch {
    // Fallback path for browsers/files where createImageBitmap fails (commonly SVG).
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image decode failed"));
      el.src = url;
    });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  }
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, ctx, imgData };
}

export function LabOpsAIClient() {
  const { locale } = useLocale();
  const [tab, setTab] = useState<LabTab>("omniparse");

  // OmniParse
  const [omniRows, setOmniRows] = useState<TidyRow[]>([]);
  const [omniNotes, setOmniNotes] = useState<string[]>([]);
  const [fitRows, setFitRows] = useState<Array<{ Well: string; growthRate: number; r2: number }>>([]);

  // Vision
  const [visionMode, setVisionMode] = useState<VisionMode>("western");
  const [laneCount, setLaneCount] = useState(8);
  const [controlLane, setControlLane] = useState(1);
  const [colonyThreshold, setColonyThreshold] = useState(140);
  const [visionPreview, setVisionPreview] = useState("");
  const [visionOverlay, setVisionOverlay] = useState("");
  const [visionRows, setVisionRows] = useState<Array<Record<string, unknown>>>([]);
  const [visionStatus, setVisionStatus] = useState("");

  // Protocol
  const [protocolMode, setProtocolMode] = useState<ProtocolMode>("molarity");
  const [c1, setC1] = useState(10);
  const [c2, setC2] = useState(50);
  const [v2, setV2] = useState(10);
  const [c1u, setC1u] = useState<"M" | "mM" | "uM">("mM");
  const [c2u, setC2u] = useState<"M" | "mM" | "uM">("uM");
  const [v2u, setV2u] = useState<"L" | "mL" | "uL">("mL");
  const [primer, setPrimer] = useState("ATGCGTACGTTAGC");
  const [na, setNa] = useState(50);
  const [mg, setMg] = useState(1.5);
  const [riskText, setRiskText] = useState("");
  const [riskRules, setRiskRules] = useState<string[]>([]);
  const [riskAi, setRiskAi] = useState("");

  // Inventory
  const [barcodeInput, setBarcodeInput] = useState("");
  const [reagentInput, setReagentInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [inventoryRows, setInventoryRows] = useState<Array<{ barcode: string; reagent: string; location: string }>>([]);
  const [freezerRows, setFreezerRows] = useState(8);
  const [freezerCols, setFreezerCols] = useState(12);
  const [freezerMap, setFreezerMap] = useState<string[][]>(() => Array.from({ length: 8 }, () => Array.from({ length: 12 }, () => "")));

  const chartData = useMemo(() => {
    const byWell: Record<string, TidyRow[]> = {};
    omniRows.forEach((r) => {
      byWell[r.Well] = byWell[r.Well] || [];
      byWell[r.Well].push(r);
    });
    return Object.entries(byWell).map(([well, rows]) => ({
      x: rows.map((r) => r.Time),
      y: rows.map((r) => r.Value),
      type: "scatter",
      mode: "lines+markers",
      name: well,
    }));
  }, [omniRows]);

  const molarityResult = useMemo(() => {
    const toM = (v: number, u: string) => (u === "M" ? v : u === "mM" ? v * 1e-3 : v * 1e-6);
    const toL = (v: number, u: string) => (u === "L" ? v : u === "mL" ? v * 1e-3 : v * 1e-6);
    const C1 = toM(c1, c1u);
    const C2 = toM(c2, c2u);
    const V2 = toL(v2, v2u);
    if (C1 <= 0 || C2 <= 0 || V2 <= 0 || C2 >= C1) return null;
    const V1 = (C2 * V2) / C1;
    return { stock_uL: V1 * 1e6, solvent_uL: (V2 - V1) * 1e6 };
  }, [c1, c2, v2, c1u, c2u, v2u]);

  const primerTm = useMemo(() => {
    const seq = primer.replace(/[^ATGCatgc]/g, "").toUpperCase();
    if (seq.length < 8) return null;
    const at = (seq.match(/[AT]/g) || []).length;
    const gc = (seq.match(/[GC]/g) || []).length;
    const wallace = 2 * at + 4 * gc;
    const saltAdj = 16.6 * Math.log10((na + 4 * Math.sqrt(Math.max(mg, 0))) / 1000);
    return wallace + saltAdj;
  }, [primer, na, mg]);

  const handleOmniUpload = async (file: File) => {
    const notes: string[] = [];
    try {
      let rows2d: string[][];
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const xlsx = await import("xlsx");
        const wb = xlsx.read(await file.arrayBuffer(), { type: "array" });
        rows2d = [];
        wb.SheetNames.forEach((sn) => {
          const ws = wb.Sheets[sn];
          const arr = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false }) as string[][];
          arr.forEach((r) => rows2d.push((r || []).map((x) => String(x ?? ""))));
        });
        notes.push("Excel parsed.");
      } else {
        rows2d = parseCsvSimple(await file.text());
        notes.push("CSV parsed.");
      }
      let tidy = matrixToTidy(rows2d);
      if (!tidy.length) notes.push("No tidy rows found.");
      else {
        const pointCountByWell = tidy.reduce<Record<string, number>>((acc, row) => {
          acc[row.Well] = (acc[row.Well] || 0) + 1;
          return acc;
        }, {});
        const hasTimeSeries = Object.values(pointCountByWell).some((n) => n > 1);
        if (hasTimeSeries) {
          tidy = baselineSubtract(tidy);
          notes.push("Baseline subtraction applied.");
        } else {
          notes.push("Single-point plate matrix detected. Baseline subtraction skipped.");
        }
        notes.push(`Parsed ${tidy.length} rows.`);
      }
      setOmniRows(tidy);
      setFitRows(fitGrowth(tidy));
      setOmniNotes(notes);
    } catch (e) {
      setOmniRows([]);
      setFitRows([]);
      setOmniNotes([`Parse failed: ${String(e)}`]);
    }
  };

  const mergeMetadata = async (file: File) => {
    if (!omniRows.length) {
      setOmniNotes((p) => [...p, locale === "ko" ? "먼저 plate 원본 파일을 업로드하세요." : "Upload a raw plate file first, then merge metadata."]);
      return;
    }
    try {
      let rows2d: string[][];
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const xlsx = await import("xlsx");
        const wb = xlsx.read(await file.arrayBuffer(), { type: "array" });
        rows2d = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false }) as string[][];
      } else {
        rows2d = parseCsvSimple(await file.text());
      }
      const h = detectHeaderIndex(rows2d);
      const header = (rows2d[h] || []).map((x) => x.toLowerCase());
      const data = rows2d.slice(h + 1);
      const wIdx = header.findIndex((x) => x.includes("well"));
      const gIdx = header.findIndex((x) => x.includes("group") || x.includes("condition") || x.includes("sample"));
      if (wIdx < 0 || gIdx < 0) {
        setOmniNotes((p) => [...p, "Metadata requires Well + Group columns."]);
        return;
      }
      const map: Record<string, string> = {};
      data.forEach((r) => {
        const well = String(r[wIdx] || "").toUpperCase();
        const grp = String(r[gIdx] || "").trim();
        if (WELL_REGEX.test(well)) map[well] = grp;
      });
      setOmniRows((p) => p.map((r) => ({ ...r, Group: map[r.Well] || r.Group })));
      setOmniNotes((p) => [...p, "Metadata merged by Well."]);
    } catch (e) {
      setOmniNotes((p) => [...p, `Metadata merge failed: ${String(e)}`]);
    }
  };

  const runVision = async (file: File) => {
    try {
      setVisionStatus("");
      const { canvas, ctx, imgData } = await loadImageToCanvas(file);
      setVisionPreview(canvas.toDataURL("image/png"));
      const g = grayscale(imgData);
      const w = imgData.width;
      const h = imgData.height;

      if (visionMode === "western") {
        const col = new Array(w).fill(0).map((_, x) => {
          let s = 0;
          for (let y = 0; y < h; y += 1) s += 255 - g[y * w + x];
          return s;
        });
        const laneW = Math.max(4, Math.floor(w / laneCount));
        const rows: Array<Record<string, unknown>> = [];
        for (let i = 0; i < laneCount; i += 1) {
          const x1 = i * laneW;
          const x2 = i === laneCount - 1 ? w : (i + 1) * laneW;
          const intensity = col.slice(x1, x2).reduce((a, b) => a + b, 0);
          rows.push({ Lane: i + 1, IntegratedIntensity: intensity });
          ctx.strokeStyle = i + 1 === controlLane ? "#22c55e" : "#f59e0b";
          ctx.strokeRect(x1, 0, x2 - x1, h);
          ctx.fillStyle = i + 1 === controlLane ? "#22c55e" : "#f59e0b";
          ctx.fillText(`L${i + 1}`, x1 + 4, 16);
        }
        const ctrl = Number(rows[controlLane - 1]?.IntegratedIntensity || NaN);
        const withRel = rows.map((r) => ({
          ...r,
          RelativeDensity: Number.isFinite(ctrl) && ctrl > 0 ? Number(r.IntegratedIntensity) / ctrl : NaN,
        }));
        setVisionRows(withRel);
        setVisionStatus(locale === "ko" ? `Western 분석 완료: ${withRel.length} lanes` : `Western analysis complete: ${withRel.length} lanes`);
      } else {
        const bin = new Uint8Array(w * h);
        for (let i = 0; i < g.length; i += 1) bin[i] = g[i] > colonyThreshold ? 1 : 0;
        const seen = new Uint8Array(w * h);
        const dirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        const rows: Array<Record<string, unknown>> = [];
        let id = 0;
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            const p = y * w + x;
            if (!bin[p] || seen[p]) continue;
            const q: Array<[number, number]> = [[x, y]];
            seen[p] = 1;
            let area = 0;
            let sx = 0;
            let sy = 0;
            while (q.length) {
              const [cx, cy] = q.pop() as [number, number];
              area += 1;
              sx += cx;
              sy += cy;
              dirs.forEach(([dx, dy]) => {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
                const np = ny * w + nx;
                if (bin[np] && !seen[np]) {
                  seen[np] = 1;
                  q.push([nx, ny]);
                }
              });
            }
            if (area < 18) continue;
            id += 1;
            const cx = Math.round(sx / area);
            const cy = Math.round(sy / area);
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(cx - 1, cy - 1, 3, 3);
            ctx.fillText(String(id), cx + 2, cy + 2);
            rows.push({ ColonyID: id, AreaPx: area, CentroidX: cx, CentroidY: cy });
          }
        }
        setVisionRows(rows);
        setVisionStatus(locale === "ko" ? `Colony 분석 완료: ${rows.length} objects` : `Colony analysis complete: ${rows.length} objects`);
      }
      setVisionOverlay(canvas.toDataURL("image/png"));
    } catch (e) {
      setVisionRows([]);
      setVisionOverlay("");
      setVisionStatus(`${locale === "ko" ? "이미지 분석 실패" : "Image analysis failed"}: ${String(e)}`);
    }
  };

  const runRiskAi = async () => {
    setRiskRules(runRiskCheckLocally(riskText));
    try {
      const response = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: HF_MODEL,
          payload: {
            inputs: `Analyze this protocol risk and return bullet list (issue -> consequence -> safer action): ${riskText}`,
            parameters: { max_new_tokens: 700, temperature: 0.2 },
          },
        }),
      });
      const text = await response.text();
      let parsedText = text;
      try {
        const parsed = JSON.parse(text);
        const content = parsed?.choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim()) {
          parsedText = content;
        }
      } catch {
        // keep raw text fallback
      }
      setRiskAi(parsedText.slice(0, 5000));
    } catch (e) {
      setRiskAi(`AI call failed: ${String(e)}`);
    }
  };

  const tryDecodeBarcode = async (file: File) => {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(bitmap, 0, 0);
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector();
        const codes = await detector.detect(canvas);
        if (codes?.length) setBarcodeInput(String(codes[0].rawValue || ""));
      }
    } catch {
      // ignore
    }
  };

  const resizeMap = (r: number, c: number) => {
    const rr = Math.max(2, r);
    const cc = Math.max(2, c);
    setFreezerRows(rr);
    setFreezerCols(cc);
    setFreezerMap((prev) =>
      Array.from({ length: rr }, (_, i) =>
        Array.from({ length: cc }, (_, j) => {
          return prev[i]?.[j] || "";
        })
      )
    );
  };

  const tabs: Array<{ id: LabTab; label: string }> = [
    { id: "omniparse", label: "OmniParse" },
    { id: "vision", label: "VisionLab" },
    { id: "protocolguard", label: "ProtocolGuard" },
    { id: "inventory", label: "Inventory" },
  ];

  const moduleExplain = {
    omniparse:
      locale === "ko"
        ? "Plate Reader의 비정형 CSV/Excel을 자동 파싱해 Tidy Data(Well/Time/Value)로 변환하고, Baseline 보정과 Growth fitting까지 한 번에 처리합니다."
        : "Automatically parses irregular plate reader CSV/Excel files into tidy data (Well/Time/Value), then runs baseline correction and growth fitting.",
    vision:
      locale === "ko"
        ? "Western blot lane intensity 정량 및 colony counting을 이미지에서 바로 수행하고, control lane 기준 Relative Density를 계산합니다."
        : "Quantifies western blot lane intensity and colony counts directly from images, including control-normalized relative density.",
    protocolguard:
      locale === "ko"
        ? "농도 계산, Primer Tm 예측, 프로토콜 위험 분석을 하나의 패널에서 수행해 실험 설계 실수를 줄입니다."
        : "Combines molarity calculation, primer Tm estimation, and protocol risk analysis to reduce setup errors.",
  };

  const labopsTips = useMemo<CalculatorTip[]>(() => {
    if (locale === "ko") {
      return [
        { id: "lop-ko-omni-1", calculatorId: "labops-omniparse", tab: "protocol", severity: "info", title: "파일 업로드 순서", body: "Raw plate 파일 업로드 후, Well/Group metadata를 추가하면 조건별 해석이 더 정확해집니다." },
        { id: "lop-ko-omni-2", calculatorId: "labops-omniparse", tab: "mistakes", severity: "warn", title: "헤더 행 불일치", body: "'Well', 'Time', 'OD/RFU' 헤더가 없거나 깨져 있으면 파싱 결과가 비어 있을 수 있습니다." },
        { id: "lop-ko-omni-3", calculatorId: "labops-omniparse", tab: "ranges", severity: "info", title: "권장 데이터 포인트", body: "Growth fitting은 Well당 최소 4개 이상의 time point에서 안정적으로 동작합니다." },
        { id: "lop-ko-omni-4", calculatorId: "labops-omniparse", tab: "troubleshooting", severity: "warn", title: "결과가 비어 있을 때", body: "CSV 구분자(콤마/탭)와 Excel 시트 구조를 확인하고, Well 표기(A1~H12)가 맞는지 검증하세요." },
        { id: "lop-ko-vis-1", calculatorId: "labops-vision", tab: "protocol", severity: "info", title: "이미지 입력 조건", body: "Lane/colony 경계가 선명한 원본 이미지(PNG/JPG)를 사용하면 정량 정확도가 높아집니다." },
        { id: "lop-ko-vis-2", calculatorId: "labops-vision", tab: "mistakes", severity: "warn", title: "Control lane 지정 오류", body: "Control lane 번호가 잘못되면 Relative Density 기준이 무너져 해석이 왜곡됩니다." },
        { id: "lop-ko-vis-3", calculatorId: "labops-vision", tab: "ranges", severity: "info", title: "Lane 수 권장", body: "Western 분석은 lane 수를 실제 밴드 열 수와 동일하게 맞추는 것이 중요합니다." },
        { id: "lop-ko-vis-4", calculatorId: "labops-vision", tab: "troubleshooting", severity: "warn", title: "Colony 과소/과대 카운트", body: "Threshold 값을 조정하고, 그림자/배경 노이즈가 적은 이미지를 사용하세요." },
        { id: "lop-ko-pro-1", calculatorId: "labops-protocolguard", tab: "protocol", severity: "info", title: "검증 흐름", body: "먼저 Molarity를 맞춘 뒤 Primer Tm과 Risk Check를 순서대로 점검하면 실수 방지에 유리합니다." },
        { id: "lop-ko-pro-2", calculatorId: "labops-protocolguard", tab: "mistakes", severity: "critical", title: "단위 혼동", body: "M, mM, uM 단위를 혼동하면 stock volume이 10~1000배까지 틀어질 수 있습니다." },
        { id: "lop-ko-pro-3", calculatorId: "labops-protocolguard", tab: "ranges", severity: "info", title: "Primer 길이 권장", body: "Primer Tm 추정은 일반적으로 18~30 nt 구간에서 해석 안정성이 높습니다." },
        { id: "lop-ko-pro-4", calculatorId: "labops-protocolguard", tab: "troubleshooting", severity: "warn", title: "AI 응답 불안정", body: "네트워크 지연 시 규칙 기반 경고를 먼저 확인하고, 입력 문장을 더 구체적으로 작성해 다시 분석하세요." },
      ];
    }
    return [
      { id: "lop-en-omni-1", calculatorId: "labops-omniparse", tab: "protocol", severity: "info", title: "Upload sequence", body: "Upload the raw plate file first, then merge Well/Group metadata for clearer condition-level interpretation." },
      { id: "lop-en-omni-2", calculatorId: "labops-omniparse", tab: "mistakes", severity: "warn", title: "Header mismatch", body: "If 'Well', 'Time', or 'OD/RFU' headers are missing or broken, parsing may return empty results." },
      { id: "lop-en-omni-3", calculatorId: "labops-omniparse", tab: "ranges", severity: "info", title: "Recommended points", body: "Growth fitting is more stable when each well has at least four time points." },
      { id: "lop-en-omni-4", calculatorId: "labops-omniparse", tab: "troubleshooting", severity: "warn", title: "When results are empty", body: "Check CSV delimiter (comma/tab), sheet layout, and Well labels (A1-H12)." },
      { id: "lop-en-vis-1", calculatorId: "labops-vision", tab: "protocol", severity: "info", title: "Input quality", body: "Use clear PNG/JPG images with visible lane/colony boundaries for better quantification." },
      { id: "lop-en-vis-2", calculatorId: "labops-vision", tab: "mistakes", severity: "warn", title: "Wrong control lane", body: "If the control lane index is wrong, relative density normalization becomes unreliable." },
      { id: "lop-en-vis-3", calculatorId: "labops-vision", tab: "ranges", severity: "info", title: "Lane count setting", body: "Match lane count to the actual number of lane columns in the blot image." },
      { id: "lop-en-vis-4", calculatorId: "labops-vision", tab: "troubleshooting", severity: "warn", title: "Colony under/over counting", body: "Tune the threshold and use images with reduced shadow/background noise." },
      { id: "lop-en-pro-1", calculatorId: "labops-protocolguard", tab: "protocol", severity: "info", title: "Validation flow", body: "Set molarity first, then validate primer Tm, then run risk check for final sanity checks." },
      { id: "lop-en-pro-2", calculatorId: "labops-protocolguard", tab: "mistakes", severity: "critical", title: "Unit confusion", body: "Mixing M, mM, and uM can shift stock volume by 10 to 1000-fold." },
      { id: "lop-en-pro-3", calculatorId: "labops-protocolguard", tab: "ranges", severity: "info", title: "Primer length range", body: "Tm estimation is typically more interpretable in the 18-30 nt primer range." },
      { id: "lop-en-pro-4", calculatorId: "labops-protocolguard", tab: "troubleshooting", severity: "warn", title: "Unstable AI response", body: "If network/API latency occurs, rely on rule-based warnings first and retry with more specific input." },
    ];
  }, [locale]);

  const tabTheme: Record<LabTab, { chip: string; buttonActive: string; panel: string; badge: string }> = {
    omniparse: {
      chip: "bg-cyan-100 text-cyan-800",
      buttonActive: "bg-cyan-700 text-white",
      panel: "border-cyan-200 bg-cyan-50/60",
      badge: "AI CORE",
    },
    vision: {
      chip: "bg-amber-100 text-amber-800",
      buttonActive: "bg-amber-600 text-white",
      panel: "border-amber-200 bg-amber-50/60",
      badge: "AI CORE",
    },
    protocolguard: {
      chip: "bg-emerald-100 text-emerald-800",
      buttonActive: "bg-emerald-700 text-white",
      panel: "border-emerald-200 bg-emerald-50/60",
      badge: "AI CORE",
    },
    inventory: {
      chip: "bg-slate-100 text-slate-700",
      buttonActive: "bg-slate-900 text-white",
      panel: "border-slate-200 bg-white",
      badge: "UTILITY",
    },
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Advanced Suite</p>
        <h1 className="mt-2 text-3xl font-semibold">LabOps AI</h1>
        <p className="mt-2 text-sm text-slate-200">
          {locale === "ko"
            ? "AI 중심 모듈(OmniParse, VisionLab, ProtocolGuard)과 실무 유틸리티를 기존 BioLT 툴과 분리된 인터페이스로 제공합니다."
            : "Provides AI core modules (OmniParse, VisionLab, ProtocolGuard) and lab utilities in an interface clearly separated from standard BioLT tools."}
        </p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 lg:col-span-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{locale === "ko" ? "LabOps 모듈" : "LabOps Modules"}</p>
          <div className="space-y-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  tab === t.id ? `${tabTheme[t.id].buttonActive} border-transparent` : "border-slate-200 bg-white text-slate-800"
                }`}
                onClick={() => setTab(t.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{t.label}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tabTheme[t.id].chip}`}>{tabTheme[t.id].badge}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <main className={`space-y-3 rounded-xl border p-4 lg:col-span-4 ${tabTheme[tab].panel}`}>
          {tab === "omniparse" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">OmniParse AI</h2>
                <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${tabTheme.omniparse.chip}`}>AI CORE</span>
              </div>
              <p className="rounded-md border border-cyan-200 bg-white p-3 text-sm text-slate-700">{moduleExplain.omniparse}</p>
              <p className="text-sm text-slate-600">Regex-based flexible CSV/Excel parsing, baseline subtraction, growth fitting, metadata merge.</p>
              <div className="rounded border border-slate-200 bg-white p-3">
                <label className="text-sm font-medium">Upload raw plate file</label>
                <input type="file" accept=".csv,.txt,.xlsx,.xls" className="mt-2 block w-full text-sm" onChange={(e) => e.target.files?.[0] && void handleOmniUpload(e.target.files[0])} />
                <label className="mt-3 block text-sm font-medium">Optional metadata file (Well + Group)</label>
                <input type="file" accept=".csv,.txt,.xlsx,.xls" className="mt-2 block w-full text-sm" onChange={(e) => e.target.files?.[0] && void mergeMetadata(e.target.files[0])} />
              </div>
              {omniNotes.length ? (
                <ul className="list-disc rounded border border-slate-200 bg-slate-50 p-3 pl-5 text-xs">
                  {omniNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : null}
              {omniRows.length ? (
                <>
                  <div className="rounded border border-slate-200 bg-white p-3">
                    <Plot data={chartData} layout={{ title: "Growth Curves", height: 360, margin: { l: 40, r: 20, t: 60, b: 40 } }} config={{ displayModeBar: false, responsive: true }} style={{ width: "100%" }} />
                  </div>
                  <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="mb-2 text-sm font-medium">Growth Fit</p>
                    {fitRows.length === 0 ? (
                      <p className="mb-2 text-xs text-amber-700">
                        {locale === "ko"
                          ? "Growth fit 결과가 없습니다. 각 Well당 4개 이상의 time point가 필요합니다."
                          : "No growth fit result. At least 4 time points per well are required."}
                      </p>
                    ) : null}
                    <div className="max-h-56 overflow-auto text-xs">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border p-1">Well</th>
                            <th className="border p-1">Growth Rate</th>
                            <th className="border p-1">R2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fitRows.map((r) => (
                            <tr key={r.Well}>
                              <td className="border p-1">{r.Well}</td>
                              <td className="border p-1">{r.growthRate.toFixed(5)}</td>
                              <td className="border p-1">{r.r2.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="mb-2 text-sm font-medium">{locale === "ko" ? "파싱 미리보기" : "Parsed Preview"}</p>
                    <div className="max-h-56 overflow-auto text-xs">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border p-1">Well</th>
                            <th className="border p-1">Time</th>
                            <th className="border p-1">Value</th>
                            <th className="border p-1">Group</th>
                          </tr>
                        </thead>
                        <tbody>
                          {omniRows.slice(0, 80).map((r, idx) => (
                            <tr key={`${r.Well}-${r.Time}-${idx}`}>
                              <td className="border p-1">{r.Well}</td>
                              <td className="border p-1">{r.Time}</td>
                              <td className="border p-1">{r.Value.toFixed(6)}</td>
                              <td className="border p-1">{r.Group || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded bg-slate-900 px-3 py-2 text-xs text-white" onClick={() => downloadCsv("omniparse_tidy.csv", omniRows as unknown as Array<Record<string, unknown>>)}>
                      Download CSV
                    </button>
                    <button
                      className="rounded bg-sky-700 px-3 py-2 text-xs text-white"
                      onClick={() =>
                        downloadText(
                          "omniparse_summary.txt",
                          ["LabOps AI Summary Report", "Module: OmniParse AI", `Rows: ${omniRows.length}`, `Wells: ${new Set(omniRows.map((r) => r.Well)).size}`, `Fits: ${fitRows.length}`].join("\n")
                        )
                      }
                    >
                      Download AI Summary Report
                    </button>
                  </div>
                </>
              ) : null}
              <TipsPanel
                calculatorId="labops-omniparse"
                tips={labopsTips}
                context={{
                  values: { rowCount: omniRows.length },
                  computed: { fitCount: fitRows.length },
                }}
              />
            </div>
          ) : null}

          {tab === "vision" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">VisionLab Agent</h2>
                <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${tabTheme.vision.chip}`}>AI CORE</span>
              </div>
              <p className="rounded-md border border-amber-200 bg-white p-3 text-sm text-slate-700">{moduleExplain.vision}</p>
              <div className="rounded border border-slate-200 bg-white p-3">
                <div className="mb-2 flex gap-2 text-sm">
                  <button className={`rounded px-2 py-1 ${visionMode === "western" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setVisionMode("western")}>
                    Western Blot
                  </button>
                  <button className={`rounded px-2 py-1 ${visionMode === "colony" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setVisionMode("colony")}>
                    Colony Counting
                  </button>
                </div>
                {visionMode === "western" ? (
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <label className="text-xs">
                      Lane count
                      <input type="number" min={2} max={24} value={laneCount} onChange={(e) => setLaneCount(Math.max(2, Number(e.target.value) || 8))} className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                    <label className="text-xs">
                      Control lane
                      <input type="number" min={1} max={laneCount} value={controlLane} onChange={(e) => setControlLane(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full rounded border px-2 py-1" />
                    </label>
                  </div>
                ) : (
                  <label className="mb-3 block text-xs">
                    Threshold
                    <input type="range" min={0} max={255} value={colonyThreshold} onChange={(e) => setColonyThreshold(Number(e.target.value))} className="mt-1 w-full" />
                    <span>{colonyThreshold}</span>
                  </label>
                )}
                <input type="file" accept="image/*,.svg,.svgz" className="block w-full text-sm" onChange={(e) => e.target.files?.[0] && void runVision(e.target.files[0])} />
                {visionStatus ? <p className="mt-2 text-xs text-slate-600">{visionStatus}</p> : null}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {visionPreview ? <img src={visionPreview} alt="preview" className="w-full rounded border border-slate-200 bg-white p-2" /> : null}
                {visionOverlay ? <img src={visionOverlay} alt="overlay" className="w-full rounded border border-slate-200 bg-white p-2" /> : null}
              </div>
              {visionRows.length ? (
                <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
                  <div className="max-h-64 overflow-auto text-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          {Object.keys(visionRows[0]).map((k) => (
                            <th key={k} className="border p-1">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visionRows.map((r, idx) => (
                          <tr key={idx}>
                            {Object.values(r).map((v, i) => (
                              <td key={`${idx}-${i}`} className="border p-1">
                                {typeof v === "number" ? v.toFixed(4) : String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded bg-slate-900 px-3 py-2 text-xs text-white" onClick={() => downloadCsv("vision_results.csv", visionRows)}>
                      Download CSV
                    </button>
                    <button className="rounded bg-sky-700 px-3 py-2 text-xs text-white" onClick={() => downloadText("vision_summary.txt", ["LabOps AI Summary Report", "Module: VisionLab", `Rows: ${visionRows.length}`].join("\n"))}>
                      Download AI Summary Report
                    </button>
                  </div>
                </div>
              ) : null}
              <TipsPanel
                calculatorId="labops-vision"
                tips={labopsTips}
                context={{
                  values: { mode: visionMode, laneCount, colonyThreshold },
                  computed: { resultCount: visionRows.length },
                }}
              />
            </div>
          ) : null}

          {tab === "protocolguard" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">ProtocolGuard AI</h2>
                <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${tabTheme.protocolguard.chip}`}>AI CORE</span>
              </div>
              <p className="rounded-md border border-emerald-200 bg-white p-3 text-sm text-slate-700">{moduleExplain.protocolguard}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <button className={`rounded px-2 py-1 ${protocolMode === "molarity" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setProtocolMode("molarity")}>
                  Molarity
                </button>
                <button className={`rounded px-2 py-1 ${protocolMode === "primer" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setProtocolMode("primer")}>
                  Primer Tm
                </button>
                <button className={`rounded px-2 py-1 ${protocolMode === "risk" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setProtocolMode("risk")}>
                  Risk Check
                </button>
              </div>
              {protocolMode === "molarity" ? (
                <div className="grid gap-2 rounded border border-slate-200 bg-white p-3 sm:grid-cols-3">
                  <label className="text-xs">
                    C1
                    <input className="mt-1 w-full rounded border px-2 py-1" type="number" value={c1} onChange={(e) => setC1(Number(e.target.value) || 0)} />
                    <select className="mt-1 w-full rounded border px-2 py-1" value={c1u} onChange={(e) => setC1u(e.target.value as any)}>
                      <option>M</option><option>mM</option><option>uM</option>
                    </select>
                  </label>
                  <label className="text-xs">
                    C2
                    <input className="mt-1 w-full rounded border px-2 py-1" type="number" value={c2} onChange={(e) => setC2(Number(e.target.value) || 0)} />
                    <select className="mt-1 w-full rounded border px-2 py-1" value={c2u} onChange={(e) => setC2u(e.target.value as any)}>
                      <option>M</option><option>mM</option><option>uM</option>
                    </select>
                  </label>
                  <label className="text-xs">
                    V2
                    <input className="mt-1 w-full rounded border px-2 py-1" type="number" value={v2} onChange={(e) => setV2(Number(e.target.value) || 0)} />
                    <select className="mt-1 w-full rounded border px-2 py-1" value={v2u} onChange={(e) => setV2u(e.target.value as any)}>
                      <option>L</option><option>mL</option><option>uL</option>
                    </select>
                  </label>
                  <div className="sm:col-span-3 rounded border border-slate-200 bg-slate-50 p-2 text-sm">
                    {molarityResult ? (
                      <>
                        <p>Required stock volume: <strong>{molarityResult.stock_uL.toFixed(2)} uL</strong></p>
                        <p>Required solvent volume: <strong>{molarityResult.solvent_uL.toFixed(2)} uL</strong></p>
                      </>
                    ) : (
                      <p className="text-rose-700">Invalid condition. Ensure C1 &gt; C2 and positive values.</p>
                    )}
                  </div>
                </div>
              ) : null}
              {protocolMode === "primer" ? (
                <div className="grid gap-2 rounded border border-slate-200 bg-white p-3 sm:grid-cols-3">
                  <label className="text-xs sm:col-span-3">
                    Primer sequence
                    <input className="mt-1 w-full rounded border px-2 py-1" value={primer} onChange={(e) => setPrimer(e.target.value)} />
                  </label>
                  <label className="text-xs">
                    Na+ (mM)
                    <input className="mt-1 w-full rounded border px-2 py-1" type="number" value={na} onChange={(e) => setNa(Number(e.target.value) || 0)} />
                  </label>
                  <label className="text-xs">
                    Mg2+ (mM)
                    <input className="mt-1 w-full rounded border px-2 py-1" type="number" value={mg} onChange={(e) => setMg(Number(e.target.value) || 0)} />
                  </label>
                  <div className="rounded border border-slate-200 bg-slate-50 p-2 text-sm">
                    {primerTm !== null ? <p>Estimated Tm (NN-approx): <strong>{primerTm.toFixed(2)} C</strong></p> : <p className="text-rose-700">Primer too short.</p>}
                  </div>
                </div>
              ) : null}
              {protocolMode === "risk" ? (
                <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
                  <textarea className="min-h-[120px] w-full rounded border border-slate-300 px-2 py-1 text-sm" value={riskText} onChange={(e) => setRiskText(e.target.value)} placeholder="Describe protocol sequence and chemicals..." />
                  <button className="rounded bg-slate-900 px-3 py-2 text-xs text-white" onClick={() => void runRiskAi()}>
                    Analyze Risk
                  </button>
                  {riskRules.length ? (
                    <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs">
                      <p className="font-semibold">Rule-based warnings</p>
                      <ul className="list-disc pl-5">
                        {riskRules.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {riskAi ? (
                    <div className="rounded border border-sky-200 bg-sky-50 p-2 text-xs">
                      <p className="font-semibold">HF AI response</p>
                      <pre className="whitespace-pre-wrap">{riskAi}</pre>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <TipsPanel
                calculatorId="labops-protocolguard"
                tips={labopsTips}
                context={{
                  values: { protocolMode, c1, c2, v2, na, mg },
                  computed: { stock_uL: molarityResult?.stock_uL, tm: primerTm },
                }}
              />
            </div>
          ) : null}

          {tab === "inventory" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Inventory Utilities</h2>
                <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${tabTheme.inventory.chip}`}>UTILITY</span>
              </div>
              <div className="rounded border border-slate-200 bg-white p-3">
                <h3 className="text-sm font-semibold">Barcode Inventory Scanner</h3>
                <input type="file" accept="image/*" className="mt-2 block text-sm" onChange={(e) => e.target.files?.[0] && void tryDecodeBarcode(e.target.files[0])} />
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <input className="rounded border px-2 py-1 text-sm" placeholder="Barcode" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} />
                  <input className="rounded border px-2 py-1 text-sm" placeholder="Reagent" value={reagentInput} onChange={(e) => setReagentInput(e.target.value)} />
                  <input className="rounded border px-2 py-1 text-sm" placeholder="Location" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} />
                </div>
                <button
                  className="mt-2 rounded bg-slate-900 px-3 py-2 text-xs text-white"
                  onClick={() => {
                    if (!barcodeInput.trim()) return;
                    setInventoryRows((p) => [...p, { barcode: barcodeInput.trim(), reagent: reagentInput.trim(), location: locationInput.trim() }]);
                    setBarcodeInput("");
                    setReagentInput("");
                    setLocationInput("");
                  }}
                >
                  Add Record
                </button>
                {inventoryRows.length ? (
                  <div className="mt-2 max-h-52 overflow-auto text-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border p-1">Barcode</th>
                          <th className="border p-1">Reagent</th>
                          <th className="border p-1">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryRows.map((r, i) => (
                          <tr key={`${r.barcode}-${i}`}>
                            <td className="border p-1">{r.barcode}</td>
                            <td className="border p-1">{r.reagent}</td>
                            <td className="border p-1">{r.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
              <div className="rounded border border-slate-200 bg-white p-3">
                <h3 className="text-sm font-semibold">Freezer Map Builder</h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="text-xs">
                    Rows
                    <input type="number" min={2} max={16} value={freezerRows} onChange={(e) => resizeMap(Number(e.target.value) || freezerRows, freezerCols)} className="mt-1 w-full rounded border px-2 py-1" />
                  </label>
                  <label className="text-xs">
                    Cols
                    <input type="number" min={2} max={24} value={freezerCols} onChange={(e) => resizeMap(freezerRows, Number(e.target.value) || freezerCols)} className="mt-1 w-full rounded border px-2 py-1" />
                  </label>
                </div>
                <div className="mt-2 max-w-full overflow-auto rounded border border-slate-200">
                  <table className="border-collapse text-xs">
                    <tbody>
                      {freezerMap.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={`${i}-${j}`} className="border p-1">
                              <input
                                value={cell}
                                onChange={(e) =>
                                  setFreezerMap((prev) => {
                                    const n = prev.map((r) => [...r]);
                                    n[i][j] = e.target.value;
                                    return n;
                                  })
                                }
                                className="w-16 rounded border px-1 py-0.5"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="mt-2 rounded bg-slate-900 px-3 py-2 text-xs text-white"
                  onClick={() =>
                    downloadCsv(
                      "freezer_map.csv",
                      freezerMap.map((r, i) => {
                        const obj: Record<string, unknown> = { Row: i + 1 };
                        r.forEach((v, j) => (obj[`C${j + 1}`] = v));
                        return obj;
                      })
                    )
                  }
                >
                  Download Freezer Map CSV
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
