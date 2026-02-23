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

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
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

  const pickFallbackModel = async (): Promise<string | null> => {
    try {
      const modelsRes = await fetch(modelListEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!modelsRes.ok) return null;
      const modelsJson = (await modelsRes.json()) as Array<{ id?: string }> | unknown;
      const ids = Array.isArray(modelsJson) ? modelsJson.map((m) => (typeof m?.id === 'string' ? m.id : '')).filter(Boolean) : [];
      if (ids.length === 0) return null;
      const preferred = ['openai/gpt-oss-20b', 'Qwen/Qwen2.5-7B-Instruct', 'meta-llama/Llama-3.1-8B-Instruct', 'gpt2'];
      for (const candidate of preferred) {
        const match = ids.find((id) => id.startsWith(candidate));
        if (match) return match;
      }
      return ids[0] || null;
    } catch {
      return null;
    }
  };

  try {
    let { response, text } = await callChatCompletions(model);
    if ((response.status === 404 || response.status === 400) && /not found|model|unknown/i.test(text)) {
      const fallbackModel = await pickFallbackModel();
      if (fallbackModel && fallbackModel !== model) {
        const retry = await callChatCompletions(fallbackModel);
        response = retry.response;
        text = retry.text;
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json') && !response.ok) {
      return json(
        {
          error: text || 'Non-JSON response from Hugging Face router',
          upstreamStatus: response.status,
        },
        { status: response.status }
      );
    }
    return new Response(text, {
      status: response.status,
      headers: {
        'content-type': contentType || 'application/json; charset=utf-8',
      },
    });
  } catch {
    return json({ error: 'Failed to reach Hugging Face API from server.' }, { status: 502 });
  }
};
