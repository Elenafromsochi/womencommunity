// Яндекс Cloud Function «assistant» — бережный помощник на YandexGPT.
//
// Разворачивается в консоли Yandex Cloud:
//   Cloud Functions → Создать функцию → среда выполнения Node.js 18 →
//   вставить этот код в файл index.js, точка входа: index.handler →
//   сделать функцию публичной (публичный вызов) →
//   привязать сервисный аккаунт с ролью ai.languageModels.user →
//   задать переменную окружения YANDEX_FOLDER_ID = b1gq9mjq2s1jkmikmun6.
//
// Ключ в браузер не попадает: функция берёт IAM-токен привязанного
// сервисного аккаунта (context.token) и обращается к YandexGPT от его имени.
// Если сервисный аккаунт не привязан — используется YANDEX_API_KEY из окружения.

const SYSTEM = `Ты — тёплый, бережный помощник в закрытом женском клубе «Женское общество».
Твоя роль — выслушать и мягко поддержать женщину, опираясь на её данные и на материалы клуба.

Принципы (соблюдай строго):
- Говори тепло, по-человечески, без осуждения и без диагнозов. Ты — зеркало и поддержка, а не врач и не терапевт.
- Не давай медицинских, психиатрических и юридических советов. В тяжёлых темах (самоповреждение, насилие, острое состояние) мягко направь к живому специалисту, близким и к экспертам клуба.
- Опирайся на её контекст (фокус-сферы, состояние 0–10, фазу цикла), если это уместно.
- Рекомендуй КОНКРЕТНЫЕ материалы клуба из переданного списка — по названию. Не выдумывай материалы, которых нет в списке.
- Отвечай коротко: 2–5 тёплых предложений. Без длинных списков-инструкций, если тебя об этом не просили.
- Не создавай срочности и зависимости. Уважай её темп и выбор.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async function (event, context) {
  const method = event?.httpMethod || "POST";
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    const folderId = process.env.YANDEX_FOLDER_ID;
    if (!folderId) return reply({ error: "Помощник ещё не настроен." });

    // IAM-токен привязанного сервисного аккаунта (предпочтительно) или API-ключ.
    const iamToken = context?.token?.access_token;
    const apiKey = process.env.YANDEX_API_KEY;
    const auth = iamToken
      ? `Bearer ${iamToken}`
      : apiKey
        ? `Api-Key ${apiKey}`
        : null;
    if (!auth) return reply({ error: "Помощник ещё не настроен." });

    const parsed = parseBody(event);
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    const ctx = parsed.context || {};

    const ctxLines = [];
    if (ctx.focus?.length) ctxLines.push(`Фокус-сферы: ${ctx.focus.join(", ")}.`);
    if (ctx.state != null) ctxLines.push(`Состояние сейчас: ${ctx.state}/10.`);
    if (ctx.phase) ctxLines.push(`Фаза цикла: ${ctx.phase}.`);
    if (ctx.materials?.length) {
      const list = ctx.materials
        .map((m) => `«${m.title}» (${m.topic})`)
        .join("; ");
      ctxLines.push(`Материалы клуба, которые можно рекомендовать: ${list}.`);
    }
    const systemText = ctxLines.length
      ? `${SYSTEM}\n\nКонтекст: ${ctxLines.join(" ")}`
      : SYSTEM;

    const yandexMessages = [
      { role: "system", text: systemText },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        text: String(m.text || ""),
      })),
    ];

    const resp = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: auth },
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
      return reply({ error: "Помощник сейчас недоступен. Попробуйте чуть позже." });
    }

    const data = await resp.json();
    const text =
      data?.result?.alternatives?.[0]?.message?.text ??
      "Я рядом. Расскажите чуть больше?";
    return reply({ reply: text });
  } catch (e) {
    console.error(e);
    return reply({ error: "Что-то пошло не так." });
  }
};

function parseBody(event) {
  if (!event || event.body == null) return {};
  let raw = event.body;
  if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function reply(body) {
  return {
    statusCode: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
