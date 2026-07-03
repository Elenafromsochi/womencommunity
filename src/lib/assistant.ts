export interface AssistantMessage {
  role: "user" | "assistant";
  text: string;
}

export interface AssistantContext {
  focus?: string[];
  state?: number | null;
  phase?: string | null;
  materials?: { id: string; title: string; topic: string }[];
}

// Публичный HTTPS-адрес Яндекс Cloud Function «assistant».
// Вид: https://functions.yandexcloud.net/<id функции>.
// Можно переопределить переменной окружения VITE_ASSISTANT_URL при сборке.
const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL ??
  "https://functions.yandexcloud.net/REPLACE_WITH_FUNCTION_ID";

/** Спросить помощника (Яндекс Cloud Function → YandexGPT). */
export async function askAssistant(
  messages: AssistantMessage[],
  context: AssistantContext,
): Promise<{ reply?: string; error?: string }> {
  if (ASSISTANT_URL.includes("REPLACE_WITH_FUNCTION_ID")) {
    return { error: "Помощник ещё настраивается. Совсем скоро он будет рядом." };
  }
  try {
    const resp = await fetch(ASSISTANT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });
    if (!resp.ok) {
      console.error("assistant http error:", resp.status);
      return { error: "Помощник пока недоступен. Попробуйте позже." };
    }
    return (await resp.json()) as { reply?: string; error?: string };
  } catch (e) {
    console.error("assistant fetch error:", e);
    return { error: "Помощник пока недоступен. Попробуйте позже." };
  }
}
