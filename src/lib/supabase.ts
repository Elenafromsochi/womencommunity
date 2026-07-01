import { createClient } from "@supabase/supabase-js";

// Подключение к Supabase (база + аккаунты).
// anon-ключ публичный по своей природе — он предназначен для клиента.
// Значения можно переопределить переменными окружения VITE_SUPABASE_*.
const url =
  import.meta.env.VITE_SUPABASE_URL ?? "https://tuguydepanycasgtyvhc.supabase.co";
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Z3V5ZGVwYW55Y2FzZ3R5dmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzA3OTQsImV4cCI6MjA5ODQ0Njc5NH0.0pISEC07tnJ4XrGichRsIM_dS0Ij8PUXXHhDSjnFB8Q";

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
