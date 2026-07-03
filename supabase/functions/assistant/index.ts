// Supabase Edge Function «assistant» — бережный помощник на YandexGPT.
// Ключ YandexGPT хранится как секрет функции (YANDEX_API_KEY), в браузер не попадает.
//
// Разворачивается из дашборда Supabase: Edge Functions → Deploy a new function →
// имя "assistant" → вставить этот код. Секреты: YANDEX_API_KEY, YANDEX_FOLDER_ID.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `Ты — тёплый, бережный помощник в закрытом женском клубе «Женское общество».
Твоя роль — выслушать и мягко поддержать женщину, опираясь на её данные и на материалы клуба.

Принципы (соблюдай строго):
- Говори тепло, по-человечески, без осуждения и без диагнозов. Ты — зеркало и поддержка, а не врач и не терапевт.
- Не давай медицинских, психиатрических и юридических советов. В тяжёлых темах (самоповреждение, насилие, острое состояние) мягко направь к живому специалисту, близким и к экспертам клуба.
- Опирайся на её контекст (фокус-сферы, состояние 0–10, фазу цикла), если это уместно.
- Рекомендуй КОНКРЕТНЫЕ материалы клуба из переданного списка — по названию. Не выдумывай материалы, которых нет в списке.
- Отвечай коротко: 2–5 тёплых предложений. Без длинных списков-инструкций, если тебя об этом не просили.
- Не создавай срочности и зависимости. Уважай её темп и выбор.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const apiKey = Deno.env.get("YANDEX_API_KEY");
    const folderId = Deno.env.get("YANDEX_FOLDER_ID");
    if (!apiKey || !folderId) {
      return json({ error: "Помощник ещё не настроен." }, 200);
    }

    const { messages = [], context = {} } = await req.json();

    const ctxLines: string[] = [];
    if (context.focus?.length) ctxLines.push(`Фокус-сферы: ${context.focus.join(", ")}.`);
    if (context.state != null) ctxLines.push(`Состояние сейчас: ${context.state}/10.`);
    if (context.phase) ctxLines.push(`Фаза цикла: ${context.phase}.`);
    if (context.materials?.length) {
      const list = context.materials
        .map((m: { title: string; topic: string }) => `«${m.title}» (${m.topic})`)
        .join("; ");
      ctxLines.push(`Материалы клуба, которые можно рекомендовать: ${list}.`);
    }
    const systemText = ctxLines.length ? `${SYSTEM}\n\nКонтекст: ${ctxLines.join(" ")}` : SYSTEM;

    const yandexMessages = [
      { role: "system", text: systemText },
      ...messages.map((m: { role: string; text: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        text: m.text,
      })),
    ];

    const resp = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Api-Key ${apiKey}`,
        },
        body: JSON.stringify({
          modelUri: `gpt://${folderId}/yandexgpt/latest`,
          completionOptions: { stream: false, temperature: 0.4, maxTokens: 800 },
          messages: yandexMessages,
        }),
      },
    );

    if (!resp.ok) {
      const t = await resp.text();
      console.error("YandexGPT error:", resp.status, t);
      return json({ error: "Помощник сейчас недоступен. Попробуйте чуть позже." }, 200);
    }

    const data = await resp.json();
    const reply =
      data?.result?.alternatives?.[0]?.message?.text ??
      "Я рядом. Расскажите чуть больше?";
    return json({ reply }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: "Что-то пошло не так." }, 200);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
