interface AiAnalyzeRequest {
  token?: string;
  model?: string;
  payload?: {
    inputs?: string;
    parameters?: {
      max_new_tokens?: number;
      temperature?: number;
    };
  };
}

interface RouterModelItem {
  id?: string;
}
interface RouterModelsResponse {
  data?: RouterModelItem[];
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

function toSafeHeader(value: string, max = 220) {
  return encodeURIComponent(value.slice(0, max));
}

export const onRequestPost: PagesFunction = async (context) => {
  let body: AiAnalyzeRequest;
  try {
    body = (await context.request.json()) as AiAnalyzeRequest;
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const model = typeof body.model === 'string' ? body.model.trim() : '';
  if (!token) return json({ error: 'Missing Hugging Face token' }, { status: 400 });
  if (!model) return json({ error: 'Missing model id' }, { status: 400 });

  const endpoint = 'https://router.huggingface.co/v1/chat/completions';
  const modelListEndpoint = 'https://router.huggingface.co/v1/models';

  const prompt = typeof body.payload?.inputs === 'string' ? body.payload.inputs : '';
  const temperature = typeof body.payload?.parameters?.temperature === 'number' ? body.payload.parameters.temperature : 0.2;
  const maxTokens = typeof body.payload?.parameters?.max_new_tokens === 'number' ? body.payload.parameters.max_new_tokens : 420;

  const callChatCompletions = async (targetModel: string) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });
    const text = await response.text();
    return { response, text };
  };

  const listModels = async (): Promise<string[]> => {
    try {
      const modelsRes = await fetch(modelListEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!modelsRes.ok) return [];
      const modelsJson = (await modelsRes.json()) as RouterModelItem[] | RouterModelsResponse | unknown;
      const asArray = Array.isArray(modelsJson)
        ? modelsJson
        : modelsJson && typeof modelsJson === 'object' && Array.isArray((modelsJson as RouterModelsResponse).data)
          ? (modelsJson as RouterModelsResponse).data || []
          : [];
      return asArray.map((m) => (typeof m?.id === 'string' ? m.id : '')).filter(Boolean);
    } catch {
      return [];
    }
  };

  const pickModel = (ids: string[], requested: string): string | null => {
    if (!ids.length) return null;
    const exact = ids.find((id) => id === requested);
    if (exact) return exact;
    const prefix = ids.find((id) => id.startsWith(requested));
    if (prefix) return prefix;
    return null;
  };

  try {
    const modelIds = await listModels();
    const chosenModel = pickModel(modelIds, model);
    if (!chosenModel) {
      return json(
        {
          error: `Requested model is not callable: ${model}`,
          availableModelsSample: modelIds.slice(0, 12),
        },
        { status: 400 }
      );
    }
    let { response, text } = await callChatCompletions(chosenModel);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json') && !response.ok) {
      return json(
        {
          error: text || 'Non-JSON response from Hugging Face router',
          upstreamStatus: response.status,
          model: chosenModel,
        },
        { status: response.status }
      );
    }
    return new Response(text, {
      status: response.status,
      headers: {
        'content-type': contentType || 'application/json; charset=utf-8',
        'x-biolt-ai-model': chosenModel,
        'x-biolt-upstream-status': String(response.status),
        'x-biolt-ai-preview': toSafeHeader(text),
      },
    });
  } catch {
    return json({ error: 'Failed to reach Hugging Face API from server.' }, { status: 502 });
  }
};
