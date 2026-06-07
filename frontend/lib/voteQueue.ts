// Cola offline usando IndexedDB.
// Guarda votos cuando no hay internet y los envía cuando vuelve la conexión.

const DB_NAME = "encuesta_db";
const STORE_NAME = "vote_queue";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      // Crea el store la primera vez. client_uuid es la clave.
      req.result.createObjectStore(STORE_NAME, { keyPath: "client_uuid" });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Guarda (o sobreescribe) un voto en la cola local. */
export async function saveToQueue(vote: Record<string, unknown>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(vote);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Devuelve todos los votos pendientes de enviar. */
export async function getPendingVotes(): Promise<Record<string, unknown>[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Elimina un voto de la cola (después de enviarlo con éxito). */
export async function removeFromQueue(clientUuid: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(clientUuid);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
