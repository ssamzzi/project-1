interface AiVisionRequest {
  token?: string;
  model?: string;
  analysisType?: 'western' | 'colony';
  imageDataUrl?: string;
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

function safeJsonExtract(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Attempt extracting fenced or embedded JSON.
    const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
    if (fenceMatch?.[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim()) as Record<string, unknown>;
      } catch {
        // ignore
      }
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        // ignore
      }
    }
    return { summary: text };
  }
}

export const onRequestPost: PagesFunction = async (context) => {
  let body: AiVisionRequest;
  try {
    body = (await context.request.json()) as AiVisionRequest;
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const envVars = (context.env || {}) as Record<string, unknown>;
  const envToken = String(envVars.HF_API_TOKEN || '').trim();
  const token = (typeof body.token === 'string' ? body.token.trim() : '') || envToken;
  if (!token) {
    return json({ error: 'Missing Hugging Face token. Set HF_API_TOKEN in Cloudflare Pages environment.' }, { status: 400 });
  }

  const analysisType = body.analysisType === 'western' ? 'western' : 'colony';
  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  if (!imageDataUrl.startsWith('data:image/')) {
    return json({ error: 'Invalid imageDataUrl. Expected data:image/...;base64,...' }, { status: 400 });
  }

  const defaultModel = String(envVars.HF_VISION_MODEL || 'Qwen/Qwen2.5-VL-7B-Instruct').trim();
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : defaultModel;

  const prompt =
    analysisType === 'colony'
      ? [
          'You are analyzing a petri-dish colony image.',
          'Estimate colony count and provide concise quality notes.',
          'Return STRICT JSON only with keys: summary, colony_count, confidence, notes.',
          'confidence should be low|medium|high.',
        ].join(' ')
      : [
          'You are analyzing a western blot image.',
          'Estimate lane count and relative band intensity profile from left to right.',
          'Return STRICT JSON only with keys: summary, lane_count, lane_relative_intensities, confidence, notes.',
          'lane_relative_intensities must be an array of numbers normalized around 1.0.',
          'confidence should be low|medium|high.',
        ].join(' ');

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Return only valid JSON. No markdown.' },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 700,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      return json(
        {
          error: text || `HF vision request failed (${response.status})`,
          upstreamStatus: response.status,
          model,
        },
        { status: response.status }
      );
    }

    let content = text;
    try {
      const payload = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
      content = payload?.choices?.[0]?.message?.content || text;
    } catch {
      // keep raw
    }

    const parsed = safeJsonExtract(content);
    return json({ model, analysisType, parsed, raw: content });
  } catch {
    return json({ error: 'Failed to reach Hugging Face vision endpoint.' }, { status: 502 });
  }
};

