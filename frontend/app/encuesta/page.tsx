"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface OpcionEscala {
  valor: number;
  etiqueta: string;
}

interface PreguntaEscalaProps {
  titulo: string;
  valor: number;
  setValor: (v: number) => void;
  opciones: OpcionEscala[];
}

interface PreguntaSiNoProps {
  titulo: string;
  valor: string;
  setValor: (v: string) => void;
}

interface NavegacionProps {
  anterior?: number;
  siguiente?: number;
  onSiguiente?: () => void;
  esUltimo?: boolean;
}

const ESCALA_ATRACTIVO: OpcionEscala[] = [
  { valor: 5, etiqueta: "Muy atractivo" },
  { valor: 4, etiqueta: "Atractivo" },
  { valor: 3, etiqueta: "Ni me gustó ni disgustó" },
  { valor: 2, etiqueta: "Poco atractivo" },
  { valor: 1, etiqueta: "Nada atractivo" },
];

const ESCALA_CALIDAD: OpcionEscala[] = [
  { valor: 5, etiqueta: "Excelente" },
  { valor: 4, etiqueta: "Muy buena" },
  { valor: 3, etiqueta: "Buena" },
  { valor: 2, etiqueta: "Regular" },
  { valor: 1, etiqueta: "Mala" },
];

const ESCALA_AGRADO: OpcionEscala[] = [
  { valor: 5, etiqueta: "Muy agradable" },
  { valor: 4, etiqueta: "Agradable" },
  { valor: 3, etiqueta: "Regular" },
  { valor: 2, etiqueta: "Malo" },
  { valor: 1, etiqueta: "Muy malo" },
];

const ESCALA_TEXTURA: OpcionEscala[] = [
  { valor: 5, etiqueta: "Muy crocante" },
  { valor: 4, etiqueta: "Crocante" },
  { valor: 3, etiqueta: "Blanda" },
  { valor: 2, etiqueta: "Muy blanda" },
  { valor: 1, etiqueta: "Demasiado blanda" },
];

const ESCALA_GENERAL: OpcionEscala[] = [
  { valor: 5, etiqueta: "Excelente" },
  { valor: 4, etiqueta: "Muy bueno" },
  { valor: 3, etiqueta: "Bueno" },
  { valor: 2, etiqueta: "Regular" },
  { valor: 1, etiqueta: "Malo" },
];

function getOrCreateClientUuid(): string {
  const KEY = "encuesta_client_uuid";
  let uuid = localStorage.getItem(KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(KEY, uuid);
  }
  return uuid;
}

function PreguntaEscala({ titulo, valor, setValor, opciones }: PreguntaEscalaProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p style={{ color: "#333", fontWeight: "600", marginBottom: "14px", fontSize: "15px", lineHeight: "1.4" }}>
        {titulo}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {opciones.map((op) => (
          <button
            key={op.valor}
            onClick={() => setValor(op.valor)}
            style={{
              padding: "10px 18px",
              borderRadius: "30px",
              border: valor === op.valor ? "none" : "2px solid #C8D4B0",
              background: valor === op.valor ? "#76955E" : "white",
              color: valor === op.valor ? "white" : "#555",
              fontWeight: valor === op.valor ? "700" : "500",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {op.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreguntaSiNo({ titulo, valor, setValor }: PreguntaSiNoProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p style={{ color: "#333", fontWeight: "600", marginBottom: "14px", fontSize: "15px", lineHeight: "1.4" }}>
        {titulo}
      </p>
      <div style={{ display: "flex", gap: "14px" }}>
        {["Sí", "No"].map((op) => (
          <button
            key={op}
            onClick={() => setValor(op)}
            style={{
              padding: "12px 36px",
              borderRadius: "30px",
              border: valor === op ? "none" : "2px solid #C8D4B0",
              background: valor === op ? "#76955E" : "white",
              color: valor === op ? "white" : "#555",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}

function Seccion({ titulo }: { titulo: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "30px 0 20px" }}>
      <span style={{
        background: "#76955E",
        color: "white",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        padding: "5px 14px",
        borderRadius: "20px",
      }}>
        {titulo}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
    </div>
  );
}

const PASOS_LABELS = ["DATOS", "VISTA", "OLFATO Y TEXTURA", "SABOR", "PRUEBA AFECTIVA"];

export default function EncuestaPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [sexo, setSexo] = useState("");
  const [edad, setEdad] = useState("");
  const [aviso, setAviso] = useState("");

  const [clientUuid, setClientUuid] = useState("");
  const [enviado, setEnviado] = useState<"idle" | "ok" | "offline" | "error">("idle");
  const [comentario, setComentario] = useState("");
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setClientUuid(getOrCreateClientUuid());

    import("@/lib/syncWorker").then(({ syncPendingVotes }) => {
      syncPendingVotes();

      const handleOnline = () => {
        console.log("[encuesta] Conexión restaurada. Sincronizando cola...");
        syncPendingVotes();
      };
      window.addEventListener("online", handleOnline);
      return () => window.removeEventListener("online", handleOnline);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (enviado === "ok" || enviado === "idle" || !pendingPayload) return;

    const intentarReenvio = async () => {
      if (!navigator.onLine) return;
      try {
        const { error } = await supabase
          .from("respuestas")
          .upsert(pendingPayload, { onConflict: "client_uuid" });

        if (!error) {
          setPendingPayload(null);
          setEnviado("ok");
        }
      } catch {}
    };

    window.addEventListener("online", intentarReenvio);
    return () => window.removeEventListener("online", intentarReenvio);
  }, [enviado, pendingPayload]);

  const [consumiriaAlternativa, setConsumiriaAlternativa] = useState("");
  const [consumiriaDip, setConsumiriaDip] = useState("");

  const [colorNuggets, setColorNuggets] = useState(0);
  const [aparienciaGeneral, setAparienciaGeneral] = useState(0);
  const [aspectoDip, setAspectoDip] = useState(0);

  const [aromaAgradable, setAromaAgradable] = useState(0);

  const [texturaNuggets, setTexturaNuggets] = useState(0);
  const [consistenciaInterna, setConsistenciaInterna] = useState(0);
  const [cremosidadDip, setCremosidadDip] = useState(0);

  const [saborNuggets, setSaborNuggets] = useState(0);
  const [combinacionDip, setCombinacionDip] = useState(0);
  const [intensidadSabor, setIntensidadSabor] = useState(0);

  const [gustoGeneral, setGustoGeneral] = useState(0);
  const [consumiriaNuevamente, setConsumiriaNuevamente] = useState("");
  const [recomendaria, setRecomendaria] = useState("");

  const totalPasos = 5;

  const Navegacion = ({ anterior, siguiente, onSiguiente, esUltimo }: NavegacionProps) => (
    <div
      style={{
        display: "flex",
        justifyContent: anterior !== undefined ? "space-between" : "flex-end",
        marginTop: "40px",
        paddingTop: "20px",
        borderTop: "1px solid #F0F0F0",
      }}
    >
      {anterior !== undefined && (
        <button
          onClick={() => setPaso(anterior)}
          style={{
            background: "transparent",
            border: "2px solid #C8D4B0",
            color: "#76955E",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
            padding: "12px 24px",
            borderRadius: "12px",
          }}
        >
          ← Atrás
        </button>
      )}
      <button
        onClick={() => {
          if (onSiguiente) onSiguiente();
          else if (siguiente !== undefined) setPaso(siguiente);
        }}
        disabled={enviando}
        style={{
          background: enviando ? "#aaa" : "#E7B511",
          color: "white",
          border: "none",
          padding: "14px 40px",
          borderRadius: "14px",
          fontWeight: "bold",
          cursor: enviando ? "not-allowed" : "pointer",
          fontSize: "15px",
          boxShadow: "0 4px 12px rgba(231,181,17,0.35)",
        }}
      >
        {enviando ? "Enviando..." : esUltimo ? "Enviar encuesta ✓" : "Siguiente →"}
      </button>
    </div>
  );

  if (enviado !== "idle") {
    const esExitoso = enviado === "ok";
    const esOffline = enviado === "offline";

    const icono = esExitoso ? "🥑" : "📶";
    const titulo = esExitoso ? "¡Muchas gracias!" : "Encuesta guardada";
    const subtitulo = esExitoso
      ? "Tu opinión es muy importante para nosotros. Las respuestas fueron registradas correctamente."
      : esOffline
        ? "No tenés conexión a internet. Tus respuestas quedaron guardadas en tu dispositivo y se enviarán automáticamente cuando recuperes la conexión."
        : "Hubo un problema al conectar con el servidor. Tus respuestas quedaron guardadas en tu dispositivo y se enviarán automáticamente cuando haya conexión.";
    const colorTitulo = esExitoso ? "#76955E" : "#B07D2B";
    const colorSubtitulo = esExitoso ? "#777" : "#8A6020";

    return (
      <main className="encuesta-main" style={{ minHeight: "100vh", background: "#F8F6EF", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="encuesta-card" style={{ width: "100%", maxWidth: "950px", background: "white", borderRadius: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>{icono}</div>
          <h1 style={{ color: colorTitulo, marginBottom: "14px" }}>{titulo}</h1>
          <p style={{ color: colorSubtitulo, fontSize: "16px", maxWidth: "420px", margin: "0 auto 32px" }}>
            {subtitulo}
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              background: esExitoso ? "#76955E" : "#B07D2B",
              color: "white",
              border: "none",
              padding: "14px 36px",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: esExitoso ? "0 4px 12px rgba(118,149,94,0.3)" : "0 4px 12px rgba(176,125,43,0.3)",
            }}
          >
            ← Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="encuesta-main" style={{ minHeight: "100vh", background: "#F8F6EF", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="encuesta-card" style={{ width: "100%", maxWidth: "950px", background: "white", borderRadius: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>

        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "24px" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              border: "2px solid #C8D4B0",
              color: "#76955E",
              fontWeight: "700",
              fontSize: "13px",
              padding: "9px 20px",
              borderRadius: "30px",
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F7EE"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            ← Menú principal
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {Array.from({ length: totalPasos }, (_, i) => i + 1).map((item) => (
            <div key={item} style={{ flex: 1, height: "8px", borderRadius: "20px", background: item <= paso ? "#E7B511" : "#E0E0E0", transition: "background 0.3s ease" }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: "18px", marginBottom: "36px", fontWeight: "600", fontSize: "12px", flexWrap: "wrap" }}>
          {PASOS_LABELS.map((label, i) => (
            <span key={i} style={{
              color: paso === i + 1 ? "#2E5E2C" : "#BBBBBB",
              borderBottom: paso === i + 1 ? "2px solid #2E5E2C" : "2px solid transparent",
              paddingBottom: "3px",
              transition: "all 0.2s ease",
              letterSpacing: "0.5px",
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* ── PASO 1: DATOS ── */}
        {paso === 1 && (
          <>
            <h1 style={{ color: "#76955E", marginBottom: "8px" }}>Antes de empezar</h1>
            <p style={{ color: "#777", marginBottom: "30px" }}>Nos gustaría conocer un poco sobre ti para analizar mejor los resultados.</p>

            <h3 style={{ marginBottom: "14px", color: "#555", fontSize: "13px", letterSpacing: "1px" }}>SEXO</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "36px" }}>
              {[
                { label: "Femenino" },
                { label: "Masculino" },
                { label: "Prefiero no especificar" },
              ].map(({ label }) => (
                <button key={label} onClick={() => setSexo(label)} style={{
                  padding: "24px 12px",
                  borderRadius: "18px",
                  border: sexo === label ? "3px solid #E7B511" : "2px solid #E0E0E0",
                  background: sexo === label ? "#FFF9E8" : "white",
                  cursor: "pointer",
                  fontSize: label === "Prefiero no especificar" ? "13px" : "17px",
                  fontWeight: "600",
                  color: "#444",
                  transition: "all 0.15s ease",
                  lineHeight: "1.4",
                }}>
                  {label}
                </button>
              ))}
            </div>

            <h3 style={{ marginBottom: "14px", color: "#555", fontSize: "13px", letterSpacing: "1px" }}>RANGO DE EDAD</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
              {["18-25", "26-35", "36-45", "46+"].map((item) => (
                <button key={item} onClick={() => setEdad(item)} style={{
                  padding: "12px 26px",
                  borderRadius: "30px",
                  border: edad === item ? "none" : "2px solid #AFB884",
                  background: edad === item ? "#76955E" : "white",
                  color: edad === item ? "white" : "#76955E",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "14px",
                }}>
                  {item}
                </button>
              ))}
            </div>

            <Seccion titulo="PREGUNTAS GENERALES" />
            <PreguntaSiNo titulo="¿Consumirías estos nuggets de forma alternativa a productos cárnicos?" valor={consumiriaAlternativa} setValor={setConsumiriaAlternativa} />
            <PreguntaSiNo titulo="¿Consumirías este dip de palta como reemplazo a aderezos industriales?" valor={consumiriaDip} setValor={setConsumiriaDip} />
            <Navegacion
              onSiguiente={() => {
                if (sexo === "" || edad === "" || consumiriaAlternativa === "" || consumiriaDip === "") {
                  setAviso("Te faltan algunas respuestas. Completá todas las preguntas antes de continuar.");
                  return;
                }
                setPaso(2);
              }}
            />
          </>
        )}

        {/* ── PASO 2: VISTA ── */}
        {paso === 2 && (
          <>
            <h1 style={{ color: "#76955E", marginBottom: "8px" }}>Vista</h1>
            <p style={{ color: "#777", marginBottom: "10px" }}>Evaluá la apariencia visual del producto.</p>
            <PreguntaEscala titulo="¿El color de los nuggets le resulta atractivo?" valor={colorNuggets} setValor={setColorNuggets} opciones={ESCALA_ATRACTIVO} />
            <PreguntaEscala titulo="¿Cómo considera la apariencia general del producto?" valor={aparienciaGeneral} setValor={setAparienciaGeneral} opciones={ESCALA_CALIDAD} />
            <PreguntaEscala titulo="¿El dip de palta presenta un aspecto agradable?" valor={aspectoDip} setValor={setAspectoDip} opciones={ESCALA_CALIDAD} />
            <Navegacion
              anterior={1}
              onSiguiente={() => {
                if (colorNuggets === 0 || aparienciaGeneral === 0 || aspectoDip === 0) {
                  setAviso("Te faltan algunas preguntas en esta sección.");
                  return;
                }
                setPaso(3);
              }}
            />
          </>
        )}

        {/* ── PASO 3: OLFATO Y TEXTURA ── */}
        {paso === 3 && (
          <>
            <h1 style={{ color: "#76955E", marginBottom: "8px" }}>Olfato y Textura</h1>
            <p style={{ color: "#777", marginBottom: "10px" }}>Evaluá el aroma y la textura del producto.</p>
            <Seccion titulo="OLFATO" />
            <PreguntaEscala titulo="¿El aroma del producto le parece agradable?" valor={aromaAgradable} setValor={setAromaAgradable} opciones={ESCALA_AGRADO} />
            <Seccion titulo="TEXTURA" />
            <PreguntaEscala titulo="¿Cómo considera la textura de los nuggets?" valor={texturaNuggets} setValor={setTexturaNuggets} opciones={ESCALA_TEXTURA} />
            <PreguntaEscala titulo="¿La consistencia interna le resulta adecuada?" valor={consistenciaInterna} setValor={setConsistenciaInterna} opciones={ESCALA_CALIDAD} />
            <PreguntaEscala titulo="¿Cómo percibe la cremosidad del dip?" valor={cremosidadDip} setValor={setCremosidadDip} opciones={ESCALA_CALIDAD} />
            <Navegacion
              anterior={2}
              onSiguiente={() => {
                if (aromaAgradable === 0 || texturaNuggets === 0 || consistenciaInterna === 0 || cremosidadDip === 0) {
                  setAviso("Te faltan algunas preguntas en esta sección.");
                  return;
                }
                setPaso(4);
              }}
            />
          </>
        )}

        {/* ── PASO 4: GUSTO / SABOR ── */}
        {paso === 4 && (
          <>
            <h1 style={{ color: "#76955E", marginBottom: "8px" }}>Gusto y Sabor</h1>
            <p style={{ color: "#777", marginBottom: "10px" }}>Evaluá el sabor del producto.</p>
            <PreguntaEscala titulo="¿Le agradó el sabor de los nuggets?" valor={saborNuggets} setValor={setSaborNuggets} opciones={ESCALA_AGRADO} />
            <PreguntaEscala titulo="¿El sabor del dip combina bien con los nuggets?" valor={combinacionDip} setValor={setCombinacionDip} opciones={ESCALA_AGRADO} />
            <PreguntaEscala titulo="¿Considera adecuada la intensidad del sabor?" valor={intensidadSabor} setValor={setIntensidadSabor} opciones={ESCALA_CALIDAD} />
            <Navegacion
              anterior={3}
              onSiguiente={() => {
                if (saborNuggets === 0 || combinacionDip === 0 || intensidadSabor === 0) {
                  setAviso("Te faltan algunas preguntas en esta sección.");
                  return;
                }
                setPaso(5);
              }}
            />
          </>
        )}

        {/* ── PASO 5: PRUEBA AFECTIVA + COMENTARIOS ── */}
        {paso === 5 && (
          <>
            <h1 style={{ color: "#76955E", marginBottom: "8px" }}>Prueba Afectiva</h1>
            <p style={{ color: "#777", marginBottom: "10px" }}>Contanos tu impresión general del producto.</p>

            <PreguntaEscala
              titulo="Calificá cuánto te gustó el producto en general."
              valor={gustoGeneral}
              setValor={setGustoGeneral}
              opciones={ESCALA_GENERAL}
            />

            <PreguntaSiNo
              titulo="¿Consumirías este producto nuevamente?"
              valor={consumiriaNuevamente}
              setValor={setConsumiriaNuevamente}
            />

            <PreguntaSiNo
              titulo="¿Recomendarías este producto a otra persona?"
              valor={recomendaria}
              setValor={setRecomendaria}
            />

            <Seccion titulo="COMENTARIOS Y SUGERENCIAS" />

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribí aquí cualquier observación o sugerencia..."
              rows={5}
              style={{
                width: "100%",
                borderRadius: "14px",
                border: "2px solid #D8D8D8",
                padding: "16px",
                fontSize: "14px",
                color: "#444",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                lineHeight: "1.6",
              }}
            />

            <Navegacion
              anterior={4}
              esUltimo={true}
              onSiguiente={async () => {
                if (gustoGeneral === 0 || consumiriaNuevamente === "" || recomendaria === "") {
                  setAviso("Te faltan algunas respuestas antes de enviar la encuesta.");
                  return;
                }

                setEnviando(true);

                const payload = {
                  client_uuid: clientUuid,
                  sexo,
                  rango_etario: edad,
                  alternativa_carnica: consumiriaAlternativa === "Sí" ? 1 : 0,
                  reemplazo_aderezo: consumiriaDip === "Sí" ? 1 : 0,
                  color_atractivo: colorNuggets,
                  apariencia_general: aparienciaGeneral,
                  dip_aspecto: aspectoDip,
                  aroma: aromaAgradable,
                  textura_nuggets: texturaNuggets,
                  consistencia_interna: consistenciaInterna,
                  cremosidad_dip: cremosidadDip,
                  sabor_nuggets: saborNuggets,
                  combinacion_sabores: combinacionDip,
                  intensidad_sabor: intensidadSabor,
                  satisfaccion_general: gustoGeneral,
                  consumiria_nuevamente: consumiriaNuevamente === "Sí" ? 1 : 0,
                  recomendaria: recomendaria === "Sí" ? 1 : 0,
                  comentarios: comentario,
                };

                if (navigator.onLine) {
                  const { error } = await supabase
                    .from("respuestas")
                    .upsert(payload, { onConflict: "client_uuid" });

                  if (error) {
                    console.error("SUPABASE ERROR:", error);
                    try {
                      const { encolarVoto } = await import("@/lib/voteQueue");
                      await encolarVoto(payload);
                    } catch {}
                    setPendingPayload(payload);
                    setEnviando(false);
                    setEnviado("error");
                    return;
                  }

                  setPendingPayload(null);
                  setEnviando(false);
                  setEnviado("ok");
                } else {
                  try {
                    const { encolarVoto } = await import("@/lib/voteQueue");
                    await encolarVoto(payload);
                    console.log("[encuesta] Sin internet. Voto guardado en cola offline.");
                  } catch {}
                  setPendingPayload(payload);
                  setEnviando(false);
                  setEnviado("offline");
                }
              }}
            />
          </>
        )}
      </div>

      {aviso && (
        <>
          <div className="aviso-overlay" onClick={() => setAviso("")} />
          <div className="aviso-toast">
            <div className="aviso-icono">🌿</div>
            <div className="aviso-texto">{aviso}</div>
            <button className="aviso-cerrar" onClick={() => setAviso("")}>Entendido</button>
          </div>
        </>
      )}
    </main>
  );
}