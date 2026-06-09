"use client";
import { useEffect } from "react";

export function SyncInit() {
  useEffect(() => {
    import("@/lib/syncWorker")
      .then(({ syncPendingVotes }) => {
        syncPendingVotes();
      })
      .catch(() => {});
  }, []);

  return null;
}