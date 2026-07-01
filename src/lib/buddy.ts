import { supabase } from "./supabase";
import type { SphereId } from "./types";

// Межпользовательский поиск бадди. В отличие от user_state (JSONB на одного),
// эти таблицы читаются всеми вошедшими — чтобы находить друг друга.

export interface BuddyRequest {
  id: string;
  user_id: string;
  name: string;
  city: string | null;
  sphere: SphereId;
  note: string | null;
  created_at: string;
}

export interface BuddyInvite {
  id: string;
  from_user: string;
  to_user: string;
  sphere: SphereId;
  from_name: string;
  from_city: string | null;
  from_note: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

/** Опубликовать/обновить свой запрос «ищу бадди по сфере». */
export async function upsertBuddyRequest(req: {
  userId: string;
  name: string;
  city: string | null;
  sphere: SphereId;
  note: string | null;
}): Promise<void> {
  const { error } = await supabase.from("buddy_requests").upsert(
    {
      user_id: req.userId,
      name: req.name,
      city: req.city,
      sphere: req.sphere,
      note: req.note,
    },
    { onConflict: "user_id,sphere" },
  );
  if (error) console.error("upsertBuddyRequest:", error.message);
}

export async function removeBuddyRequest(userId: string, sphere: SphereId): Promise<void> {
  const { error } = await supabase
    .from("buddy_requests")
    .delete()
    .eq("user_id", userId)
    .eq("sphere", sphere);
  if (error) console.error("removeBuddyRequest:", error.message);
}

export async function fetchMyRequests(userId: string): Promise<BuddyRequest[]> {
  const { data, error } = await supabase
    .from("buddy_requests")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    console.error("fetchMyRequests:", error.message);
    return [];
  }
  return (data as BuddyRequest[]) ?? [];
}

/** Подходящие бадди: чужие запросы в тех же сферах. */
export async function fetchMatches(
  spheres: SphereId[],
  userId: string,
): Promise<BuddyRequest[]> {
  if (spheres.length === 0) return [];
  const { data, error } = await supabase
    .from("buddy_requests")
    .select("*")
    .in("sphere", spheres)
    .neq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchMatches:", error.message);
    return [];
  }
  return (data as BuddyRequest[]) ?? [];
}

/** Позвать в бадди. */
export async function sendInvite(invite: {
  fromUser: string;
  toUser: string;
  sphere: SphereId;
  fromName: string;
  fromCity: string | null;
  fromNote: string | null;
}): Promise<{ error?: string }> {
  const { error } = await supabase.from("buddy_invites").upsert(
    {
      from_user: invite.fromUser,
      to_user: invite.toUser,
      sphere: invite.sphere,
      from_name: invite.fromName,
      from_city: invite.fromCity,
      from_note: invite.fromNote,
      status: "pending",
    },
    { onConflict: "from_user,to_user,sphere" },
  );
  return error ? { error: error.message } : {};
}

export async function fetchIncomingInvites(userId: string): Promise<BuddyInvite[]> {
  const { data, error } = await supabase
    .from("buddy_invites")
    .select("*")
    .eq("to_user", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchIncomingInvites:", error.message);
    return [];
  }
  return (data as BuddyInvite[]) ?? [];
}

export async function respondInvite(
  id: string,
  status: "accepted" | "declined",
): Promise<void> {
  const { error } = await supabase
    .from("buddy_invites")
    .update({ status })
    .eq("id", id);
  if (error) console.error("respondInvite:", error.message);
}

/** Принятые пары, где я — с любой стороны. */
export async function fetchMyBuddies(userId: string): Promise<BuddyInvite[]> {
  const { data, error } = await supabase
    .from("buddy_invites")
    .select("*")
    .eq("status", "accepted")
    .or(`from_user.eq.${userId},to_user.eq.${userId}`);
  if (error) {
    console.error("fetchMyBuddies:", error.message);
    return [];
  }
  return (data as BuddyInvite[]) ?? [];
}
