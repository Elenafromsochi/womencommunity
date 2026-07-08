import { supabase } from "./supabase";

// Личные чаты 1:1 между участницей и экспертом. Таблица messages в Supabase.

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

export interface Conversation {
  peerId: string;
  peerName: string;
  lastText: string;
  lastAt: string;
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Список диалогов текущего пользователя (сгруппировано по собеседнику). */
export async function fetchConversations(myId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchConversations:", error.message);
    return [];
  }
  const seen = new Map<string, Conversation>();
  for (const m of (data as Message[]) ?? []) {
    const peerId = m.sender_id === myId ? m.recipient_id : m.sender_id;
    const peerName = m.sender_id === myId ? "" : m.sender_name;
    if (!seen.has(peerId)) {
      seen.set(peerId, {
        peerId,
        peerName: peerName || "Собеседница",
        lastText: m.text,
        lastAt: m.created_at,
      });
    }
  }
  return [...seen.values()];
}

/** Переписка с конкретным собеседником, по времени. */
export async function fetchThread(myId: string, peerId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${myId},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${myId})`,
    )
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchThread:", error.message);
    return [];
  }
  return (data as Message[]) ?? [];
}

export async function sendMessage(
  recipientId: string,
  text: string,
  senderName: string,
): Promise<void> {
  const myId = await currentUserId();
  if (!myId) throw new Error("Нужно войти");
  const { error } = await supabase.from("messages").insert({
    sender_id: myId,
    recipient_id: recipientId,
    sender_name: senderName,
    text,
  });
  if (error) throw new Error(error.message);
}
