import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Faltam as configurações públicas do Supabase no .env.local.");
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);

export async function makeStudentEmail(nickname: string): Promise<string> {
  const normalized = nickname.trim().normalize("NFKC").toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const hashHex = Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `student-${hashHex.slice(0, 32)}@students.gamemath.invalid`;
}