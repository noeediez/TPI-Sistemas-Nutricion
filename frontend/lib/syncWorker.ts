import { supabase } from "./supabaseClient";
import { obtenerVotosPendientes, eliminarVotoDeCola } from "./voteQueue";

let sincronizando = false;

export async function syncPendingVotes(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.onLine) return;
  if (sincronizando) return;
  sincronizando = true;

  let pending: Record<string, unknown>[] = [];
  try {
    pending = await obtenerVotosPendientes();
  } catch {
    sincronizando = false;
    return;
  }

  for (const vote of pending) {
    try {
      const { error } = await supabase
        .from("respuestas")
        .upsert(vote, { onConflict: "client_uuid" });
      if (!error) {
        await eliminarVotoDeCola(vote.client_uuid as string);
      }
    } catch {
      // sin internet, lo deja para el próximo intento
    }
  }

  sincronizando = false;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => syncPendingVotes());
}