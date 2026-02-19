export function encodeCalculatorState(state: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      params.set(key, JSON.stringify(value));
      return;
    }
    if (typeof value === 'object') {
      params.set(key, JSON.stringify(value));
      return;
    }
    params.set(key, String(value));
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeCalculatorState(search: string): Record<string, unknown> {
  const params = new URLSearchParams(search);
  const output: Record<string, unknown> = {};
  params.forEach((value, key) => {
    try {
      if (value.startsWith('{') || value.startsWith('[')) {
        output[key] = JSON.parse(value);
      } else {
        if (value === 'true') {
          output[key] = true;
          return;
        }
        if (value === 'false') {
          output[key] = false;
          return;
        }
        const num = Number(value);
        output[key] = Number.isNaN(num) ? value : num;
      }
    } catch {
      const num = Number(value);
      output[key] = Number.isNaN(num) ? value : num;
    }
  });
  return output;
}
