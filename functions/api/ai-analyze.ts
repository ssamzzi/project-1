interface AiAnalyzeRequest {
  token?: string;
  model?: string;
  payload?: unknown;
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

  const endpoint = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(model)}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body.payload ?? {}),
    });
    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
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
