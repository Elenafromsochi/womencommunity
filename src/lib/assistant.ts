import { supabase } from "./supabase";

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

/** Спросить помощника (через серверную функцию, YandexGPT). */
export async function askAssistant(
  messages: AssistantMessage[],
  context: AssistantContext,
): Promise<{ reply?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("assistant", {
    body: { messages, context },
  });
  if (error) {
    console.error("assistant invoke error:", error.message);
    return { error: "Помощник пока недоступен. Попробуйте позже." };
  }
  return data as { reply?: string; error?: string };
}
