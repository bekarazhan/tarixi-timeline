/* Cloudflare Pages Function — прокси для ЖИ-чата.
   Ключ лежит в env (GROQ_API_KEY), браузер его не видит.
   Эндпоинт: POST /api/chat  body: { system, messages:[{role,content}] }
   Ответ: SSE-поток (OpenAI/Groq формат) — фронт парсит как есть.
*/
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.GROQ_API_KEY) {
    return new Response("GROQ_API_KEY is not configured", { status: 500 });
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  const { system, messages } = payload || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages[] required", { status: 400 });
  }

  // защита: ограничиваем размеры и историю
  const safeMessages = messages.slice(-12).map((m) => ({
    role: m && m.role === "assistant" ? "assistant" : "user",
    content: String((m && m.content) || "").slice(0, 2000),
  }));
  const body = {
    model: "llama-3.3-70b-versatile",
    stream: true,
    temperature: 0.9,
    max_tokens: 600,
    messages: [
      { role: "system", content: String(system || "").slice(0, 4000) },
      ...safeMessages,
    ],
  };

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + env.GROQ_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const t = await upstream.text().catch(() => "");
    return new Response("upstream error: " + t.slice(0, 200), { status: 502 });
  }

  // стримим SSE-поток Groq напрямую в браузер
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
