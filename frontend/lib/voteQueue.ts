const DB_NAME    = "dipcrunch_queue";
const DB_VERSION = 1;
const STORE_NAME = "votos_pendientes";

function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "client_uuid" });
      }
    };
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror  = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

/** Guarda (o sobreescribe) un voto en la cola local. */
export async function saveToQueue(vote: Record<string, unknown>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(voto);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

// alias para compatibilidad
export const encolarVoto = saveToQueue;

export async function obtenerVotosPendientes(): Promise<Record<string, unknown>[]> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror   = () => reject(request.error);
  });
}

export async function eliminarVotoDeCola(clientUuid: string): Promise<void> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(clientUuid);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}