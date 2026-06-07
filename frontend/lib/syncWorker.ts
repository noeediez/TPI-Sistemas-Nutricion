// Sincroniza los votos offline guardados en IndexedDB con Supabase
// Se llama automáticamente cuando el dispositivo vuelve a tener internet

import { supabase } from "./supabaseClient";
import { getPendingVotes, removeFromQueue } from "./voteQueue";

/**
 * Intenta enviar todos los votos pendientes a Supabase.
 * Si no hay internet, no hace nada.
 * Usa upsert con client_uuid como clave de conflicto para evitar duplicados.
 */
export async function syncPendingVotes(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.onLine) return;

  let pending: Record<string, unknown>[] = [];
  try {
    pending = await getPendingVotes();
  } catch {
    // IndexedDB no disponible (ej: SSR), salimos silenciosamente
    return;
  }

  for (const vote of pending) {
    const { error } = await supabase
      .from("respuestas")
      .upsert(vote, { onConflict: "client_uuid" });

    if (!error) {
      await removeFromQueue(vote.client_uuid as string);
      console.log("[syncWorker] Voto sincronizado:", vote.client_uuid);
    } else {
      console.error("[syncWorker] Error al sincronizar voto:", error.message);
    }
  }
}
