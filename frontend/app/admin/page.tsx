"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ── Tipos ──────────────────────────────────────────────────────────────
interface Respuesta {
  id: string;
  created_at: string;
  sexo: string;
  rango_etario: string;
  color_atractivo: number;
  apariencia_general: number;
  dip_aspecto: number;
  aroma: number;
  textura_nuggets: number;
  consistencia_interna: number;
  cremosidad_dip: number;
  sabor_nuggets: number;
  combinacion_sabores: number;
  intensidad_sabor: number;
  satisfaccion_general: number;
  consumiria_nuevamente: number;
  recomendaria: number;
  alternativa_carnica: number;
  reemplazo_aderezo: number;
  comentarios: string;
}

type PageId = "resumen" | "descriptivos" | "afectivos" | "comentarios" | "notas";

// ── Tipos del chat ─────────────────────────────────────────────────────
interface Mensaje {
  rol: "usuario" | "ia";
  texto: string;
  hora: string;
}

interface Conversacion {
  id: string;
  titulo: string;
  fecha: string;
  mensajes: Mensaje[];
}

// ── Helpers ────────────────────────────────────────────────────────────
function avg(nums: number[]): number {
  const valid = nums.filter((n) => n > 0);
  if (!valid.length) return 0;
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
}

function pct(values: string[], target: string): number {
  if (!values.length) return 0;
  return Math.round((values.filter((v) => v === target).length / values.length) * 100);
}

function avgAge(edades: string[]): string {
  const nums = edades
    .map((e) => { const m = e.match(/\d+/); return m ? parseInt(m[0]) : NaN; })
    .filter((n) => !isNaN(n));
  if (!nums.length) return "—";
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) + " años";
}

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

// ── Render markdown básico ─────────────────────────────────────────────
function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function renderMd(texto: string): React.ReactNode {
  const lines = texto.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <div key={i} style={{ fontWeight: "800", fontSize: "15px", color: "#2E5E2C", marginTop: "10px", marginBottom: "4px" }}>
          {line.slice(3)}
        </div>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <div key={i} style={{ fontWeight: "800", fontSize: "16px", color: "#2E5E2C", marginTop: "10px", marginBottom: "4px" }}>
          {line.slice(2)}
        </div>
      );
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} style={{ paddingLeft: "14px", marginBottom: "3px" }}>
          • {renderBold(line.slice(2))}
        </div>
      );
    }
    if (line.trim() === "") {
      return <div key={i} style={{ height: "8px" }} />;
    }
    return <div key={i}>{renderBold(line)}</div>;
  });
}

// ── Estilos base ───────────────────────────────────────────────────────
const S = {
  app: {
    display: "flex" as const,
    minHeight: "100vh",
    background: "#F8F6EF",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  sidebar: {
    width: "210px",
    flexShrink: 0 as const,
    background: "white",
    borderRight: "1px solid #EEE",
    display: "flex" as const,
    flexDirection: "column" as const,
    padding: "24px 0",
    position: "sticky" as const,
    top: 0,
    height: "100vh",
  },
  brand: {
    padding: "0 18px 20px",
    borderBottom: "1px solid #EEE",
    marginBottom: "12px",
  },
  brandName: { fontSize: "15px", fontWeight: "700", color: "#333" },
  brandSub: { fontSize: "11px", color: "#aaa", marginTop: "2px" },
  navItem: (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 18px",
    fontSize: "13px",
    color: active ? "#3B6D11" : "#888",
    fontWeight: active ? "700" : "400",
    background: active ? "#EAF3DE" : "transparent",
    borderLeft: active ? "3px solid #639922" : "3px solid transparent",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  main: {
    flex: 1,
    padding: "32px 32px 60px",
    minWidth: 0,
    overflowX: "hidden" as const,
  },
  topBar: {
    display: "flex" as const,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
  },
  adminBadge: {
    background: "#EAF3DE",
    color: "#3B6D11",
    fontSize: "11px",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "700",
  },
  pageHeader: { marginBottom: "24px" },
  pageTitle: { fontSize: "22px", fontWeight: "800", color: "#333" },
  pageSub: { fontSize: "13px", color: "#aaa", marginTop: "4px" },
  metricGrid: {
    display: "grid" as const,
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #EEE",
    padding: "20px 22px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#888",
    marginBottom: "16px",
    display: "flex" as const,
    alignItems: "center",
    gap: "6px",
  },
  twoCol: {
    display: "grid" as const,
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginBottom: "18px",
  },
};

// ── Componente MetricCard ──────────────────────────────────────────────
function MetricCard({
  icon, value, label, color,
}: { icon: string; value: string; label: string; color: string }) {
  return (
    <div style={{ ...S.card, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: "26px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "24px", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#bbb", fontWeight: "700", letterSpacing: "0.8px", marginTop: "8px" }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

// ── Componente HorizBar ────────────────────────────────────────────────
function HorizBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const w = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
      <div style={{ fontSize: "12px", color: "#888", width: "120px", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: "#F5F5F0", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.6s" }} />
      </div>
      <div style={{ fontSize: "12px", color: "#888", width: "50px", textAlign: "right" }}>
        {count} ({w}%)
      </div>
    </div>
  );
}

// ── Página Resumen ─────────────────────────────────────────────────────
function PageResumen({ respuestas }: { respuestas: Respuesta[] }) {
  const total = respuestas.length;

  const siConsumiria   = respuestas.filter(r => r.consumiria_nuevamente === 1).length;
  const noConsumiria   = respuestas.filter(r => r.consumiria_nuevamente === 0).length;
  const siRecomendaria = respuestas.filter(r => r.recomendaria === 1).length;
  const noRecomendaria = respuestas.filter(r => r.recomendaria === 0).length;
  const siAlternativa  = respuestas.filter(r => r.alternativa_carnica === 1).length;
  const noAlternativa  = respuestas.filter(r => r.alternativa_carnica === 0).length;
  const siReemplazo    = respuestas.filter(r => r.reemplazo_aderezo === 1).length;
  const noReemplazo    = respuestas.filter(r => r.reemplazo_aderezo === 0).length;

  const calMedia  = avg(respuestas.map(r => r.satisfaccion_general));
  const edadMedia = avgAge(respuestas.map(r => r.rango_etario));
  const ultima    = respuestas.length ? timeSince(respuestas[0].created_at) : "—";

  const porSexo: Record<string, number> = {};
  respuestas.forEach(r => { porSexo[r.sexo] = (porSexo[r.sexo] || 0) + 1; });

  const edadGroups = [
    { label: "18-25 años", count: respuestas.filter(r => r.rango_etario === "18-25").length },
    { label: "26-35 años", count: respuestas.filter(r => r.rango_etario === "26-35").length },
    { label: "36-45 años", count: respuestas.filter(r => r.rango_etario === "36-45").length },
    { label: "46+ años",   count: respuestas.filter(r => r.rango_etario === "46+").length },
  ];
  const sexoColors: Record<string, string> = { Femenino: "#9B59B6", Masculino: "#5B8EAD", Otro: "#76955E" };

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Panel de Resumen</div>
        <div style={S.pageSub}>Vista general de las encuestas de análisis sensorial</div>
      </div>

      <div style={S.metricGrid}>
        <MetricCard icon="" value={String(total)}               label="Total de encuestas" color="#76955E" />
        <MetricCard icon="" value={edadMedia}                   label="Edad promedio"       color="#E7B511" />
        <MetricCard icon="" value={ultima}                      label="Última respuesta"    color="#5B8EAD" />
        <MetricCard icon="" value={`${calMedia.toFixed(1)}/5`} label="Calificación media"  color="#E07070" />
      </div>

      <div className="admin-resumen-grid" style={S.twoCol}>
        <div style={S.card}>
          <div style={S.cardTitle}>📊 Distribución por Edad</div>
          {edadGroups.map(g => (
            <HorizBar key={g.label} label={g.label} count={g.count} total={total} color="#76955E" />
          ))}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>👥 Distribución por Sexo</div>
          {Object.entries(porSexo).map(([sexo, count]) => (
            <HorizBar key={sexo} label={sexo} count={count} total={total} color={sexoColors[sexo] || "#76955E"} />
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>🌱 Preferencias de Consumo</div>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "10px" }}>
            ¿Consumirías estos nuggets como alternativa a productos cárnicos?
          </div>
          <HorizBar label="Sí" count={siAlternativa} total={total} color="#76955E" />
          <HorizBar label="No" count={noAlternativa} total={total} color="#E07070" />
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "10px" }}>
            ¿Usarías este dip como reemplazo a aderezos industriales?
          </div>
          <HorizBar label="Sí" count={siReemplazo}  total={total} color="#76955E" />
          <HorizBar label="No" count={noReemplazo}  total={total} color="#E07070" />
        </div>
      </div>
    </div>
  );
}

// ── Página Descriptivos ────────────────────────────────────────────────
function PageDescriptivos({ respuestas }: { respuestas: Respuesta[] }) {
  const gustoData = [
    { label: "Malo (1)",       cantidad: respuestas.filter(r => r.satisfaccion_general === 1).length, color: "#E07070" },
    { label: "Regular (2)",   cantidad: respuestas.filter(r => r.satisfaccion_general === 2).length, color: "#E0A860" },
    { label: "Bueno (3)",     cantidad: respuestas.filter(r => r.satisfaccion_general === 3).length, color: "#E7C511" },
    { label: "Muy bueno (4)", cantidad: respuestas.filter(r => r.satisfaccion_general === 4).length, color: "#A8C878" },
    { label: "Excelente (5)", cantidad: respuestas.filter(r => r.satisfaccion_general === 5).length, color: "#76955E" },
  ];

  const intentData = [
    { label: "Consumiría nuevamente",    cantidad: respuestas.filter(r => r.consumiria_nuevamente === 1).length, color: "#76955E" },
    { label: "No consumiría nuevamente", cantidad: respuestas.filter(r => r.consumiria_nuevamente === 0).length, color: "#E07070" },
    { label: "Recomendaría",             cantidad: respuestas.filter(r => r.recomendaria === 1).length,          color: "#97C459" },
    { label: "No recomendaría",          cantidad: respuestas.filter(r => r.recomendaria === 0).length,          color: "#E0A860" },
  ];

  const total    = respuestas.length;
  const positivo = respuestas.filter((r) => r.satisfaccion_general >= 4).length;
  const neutro   = respuestas.filter((r) => r.satisfaccion_general === 3).length;
  const negativo = respuestas.filter((r) => r.satisfaccion_general <= 2).length;

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Resultados Descriptivos</div>
        <div style={S.pageSub}>Distribución de respuestas por atributo sensorial</div>
      </div>

      <div style={{ ...S.card, marginBottom: "18px" }}>
        <div style={S.cardTitle}> Gusto general por el producto</div>
        {total === 0 ? (
          <p style={{ textAlign: "center", color: "#ccc", padding: "48px 0" }}>Sin datos aún</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={gustoData} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#888" }} angle={-25} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#bbb" }} />
                <Tooltip formatter={(v) => [v, "Respuestas"]} cursor={{ fill: "#F8F6EF" }} />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                  {gustoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#76955E" }}>
                {total ? Math.round((positivo / total) * 100) : 0}% Positivo
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#B07D00" }}>
                {total ? Math.round((neutro / total) * 100) : 0}% Neutro
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#C53030" }}>
                {total ? Math.round((negativo / total) * 100) : 0}% Negativo
              </span>
            </div>
          </>
        )}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>🛒 Intención de Consumo</div>
        {total === 0 ? (
          <p style={{ textAlign: "center", color: "#ccc", padding: "48px 0" }}>Sin datos aún</p>
        ) : (
          intentData.map((d) => (
            <HorizBar key={d.label} label={d.label} count={d.cantidad} total={total} color={d.color} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Página Afectivos ───────────────────────────────────────────────────
function PageAfectivos({ respuestas }: { respuestas: Respuesta[] }) {
  const total = respuestas.length;

  const radarData = [
    { categoria: "Color",        promedio: avg(respuestas.map((r) => r.color_atractivo)) },
    { categoria: "Apariencia",   promedio: avg(respuestas.map((r) => r.apariencia_general)) },
    { categoria: "Aspecto dip",  promedio: avg(respuestas.map((r) => r.dip_aspecto)) },
    { categoria: "Aroma",        promedio: avg(respuestas.map((r) => r.aroma)) },
    { categoria: "Textura",      promedio: avg(respuestas.map((r) => r.textura_nuggets)) },
    { categoria: "Consistencia", promedio: avg(respuestas.map((r) => r.consistencia_interna)) },
    { categoria: "Cremosidad",   promedio: avg(respuestas.map((r) => r.cremosidad_dip)) },
    { categoria: "Sabor",        promedio: avg(respuestas.map((r) => r.sabor_nuggets)) },
    { categoria: "Combinación",  promedio: avg(respuestas.map((r) => r.combinacion_sabores)) },
    { categoria: "Intensidad",   promedio: avg(respuestas.map((r) => r.intensidad_sabor)) },
  ];

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Resultados Afectivos</div>
        <div style={S.pageSub}>Gráfico de Araña — Atributos Sensoriales (escala 1–5)</div>
      </div>

      <div style={{ ...S.card, marginBottom: "18px" }}>
        <div style={S.cardTitle}>🕸️ Perfil sensorial promedio</div>
        {total === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "#ccc" }}>
            Sin datos aún
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} margin={{ top: 15, right: 30, bottom: 15, left: 30 }}>
              <PolarGrid stroke="#E8E8E8" />
              <PolarAngleAxis dataKey="categoria" tick={{ fontSize: 12, fill: "#666", fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "#bbb" }} tickCount={6} />
              <Radar
                name="Promedio"
                dataKey="promedio"
                stroke="#76955E"
                fill="#76955E"
                fillOpacity={0.35}
                strokeWidth={2.5}
                dot={{ fill: "#76955E", r: 4 }}
              />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}/5`, "Promedio"]} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
        {radarData.map((d) => (
          <div key={d.categoria} style={{ background: "white", border: "1px solid #EEE", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#76955E" }}>
              {d.promedio.toFixed(1)}
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{d.categoria}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Página Comentarios ─────────────────────────────────────────────────
function PageComentarios({ respuestas }: { respuestas: Respuesta[] }) {
  const [search, setSearch] = useState("");

  const withComment = respuestas.filter((r) => r.comentarios && r.comentarios.trim() !== "");
  const filtered = withComment.filter((r) =>
    r.comentarios.toLowerCase().includes(search.toLowerCase()) ||
    r.sexo?.toLowerCase().includes(search.toLowerCase())
  );

  function initials(sexo: string) {
    if (sexo === "Femenino") return "F";
    if (sexo === "Masculino") return "M";
    return "O";
  }
  function avatarColor(sexo: string) {
    if (sexo === "Masculino") return { bg: "#D6EAF8", text: "#1A5276" };
    if (sexo === "Otro")      return { bg: "#EDE7F6", text: "#4527A0" };
    return { bg: "#D5F5E3", text: "#1E8449" };
  }
  function scoreColor(g: number): string {
    if (g >= 4) return "#76955E";
    if (g === 3) return "#B07D00";
    return "#C53030";
  }

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Comentarios de Evaluadores</div>
        <div style={S.pageSub}>Feedback cualitativo de los participantes</div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Buscar comentarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px 14px", borderRadius: "30px", border: "1px solid #DDD", fontSize: "13px", outline: "none", background: "white" }}
        />
        <div style={{ fontSize: "13px", color: "#aaa", display: "flex", alignItems: "center" }}>
          {filtered.length} comentarios
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#ccc", padding: "48px 0" }}>
          {withComment.length === 0 ? "Aún no hay comentarios." : "Sin resultados para esa búsqueda."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((r) => {
            const av = avatarColor(r.sexo);
            return (
              <div key={r.id} style={{ background: "white", border: "1px solid #EEE", borderRadius: "14px", padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: av.bg, color: av.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                    {initials(r.sexo)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    <strong style={{ color: "#555" }}>{r.sexo || "—"}</strong>
                    {r.rango_etario ? ` · ${r.rango_etario} años` : ""}
                  </div>
                  <span style={{ marginLeft: "4px", background: "#F8F6EF", color: scoreColor(r.satisfaccion_general), fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "20px" }}>
                    {r.satisfaccion_general}/5 ★
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "#bbb" }}>
                    {new Date(r.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.7 }}>
                  {r.comentarios}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Página Notas → CHAT IA ─────────────────────────────────────────────
function PageNotas({ totalRespuestas, promedioGeneral }: { totalRespuestas: number; promedioGeneral: number }) {
  const [mensajes, setMensajes]       = useState<Mensaje[]>([]);
  const [historial, setHistorial]     = useState<Conversacion[]>([]);
  const [convActiva, setConvActiva]   = useState<string | null>(null);
  const [input, setInput]             = useState("");
  const [escribiendo, setEscribiendo] = useState(false);

  const [modalMailAbierto, setModalMailAbierto] = useState(false);
  const [contactos, setContactos] = useState<{id?: string, nombre: string, email: string}[]>([]);

  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [enviandoMail, setEnviandoMail] = useState(false);
  const ahora = () =>
    new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    supabase.from("chat_contactos").select("*").order("created_at").then(({ data }) => {
      if (data) setContactos(data);
    });
    supabase.from("chat_historial").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setHistorial(data as Conversacion[]);
    });
  }, []);

  async function guardarHistorial(conv: Conversacion, esNueva: boolean) {
    if (esNueva) {
      const { data } = await supabase.from("chat_historial")
        .insert({ id: conv.id, titulo: conv.titulo, fecha: conv.fecha, mensajes: conv.mensajes })
        .select().single();
      if (data) setHistorial(prev => [data as Conversacion, ...prev]);
    } else {
      await supabase.from("chat_historial").update({ mensajes: conv.mensajes }).eq("id", conv.id);
      setHistorial(prev => prev.map(c => c.id === conv.id ? conv : c));
    }
  }

  function scrollAbajo() {
    setTimeout(() => {
      const el = document.getElementById("chat-fin");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  async function enviar() {
    if (!input.trim() || escribiendo) return;
    const texto = input.trim();
    setInput("");
    const msgUser: Mensaje = { rol: "usuario", texto, hora: ahora() };
    const nuevosMensajes = [...mensajes, msgUser];
    setMensajes(nuevosMensajes);
    setEscribiendo(true);
    scrollAbajo();

    try {
      const res  = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mensaje: texto,
          historial: mensajes.map(m => ({ rol: m.rol, texto: m.texto }))
        }),
      });
      const data = await res.json();
      const msgIA: Mensaje = {
        rol: "ia",
        texto: data.respuesta || data.message || "Sin respuesta.",
        hora: ahora(),
      };
      const conIA = [...nuevosMensajes, msgIA];
      setMensajes(conIA);

      if (convActiva) {
          const convActualizada = { ...historial.find(c => c.id === convActiva)!, mensajes: conIA };
          guardarHistorial(convActualizada, false);      } else {
        const id   = Date.now().toString();
        const conv: Conversacion = {
          id,
          titulo: texto.slice(0, 40),
          fecha: new Date().toLocaleDateString("es-AR"),
          mensajes: conIA,
        };
        setConvActiva(id);
        guardarHistorial(conv, true);
      }
    } catch {
      const msgErr: Mensaje = {
        rol: "ia",
        texto: "Error al conectar con el asistente. Intentá de nuevo.",
        hora: ahora(),
      };
      setMensajes(prev => [...prev, msgErr]);
    } finally {
      setEscribiendo(false);
      scrollAbajo();
    }
  }

  function nuevaConversacion() {
    setMensajes([]);
    setConvActiva(null);
    setInput("");
  }

  function cargarConversacion(conv: Conversacion) {
    setMensajes(conv.mensajes);
    setConvActiva(conv.id);
  }

  function descargarInforme() {
    const fecha = new Date().toLocaleDateString("es-AR");
    const html = `
      <html>
      <head>
        <title>Informe Dip & Crunch</title>
        <style>
          body { font-family: Inter, system-ui, sans-serif; padding: 48px; color: #333; max-width: 720px; margin: 0 auto; }
          h1 { color: #2E5E2C; font-size: 22px; margin-bottom: 4px; }
          .fecha { color: #aaa; font-size: 13px; margin-bottom: 24px; }
          .stats { background: #EAF3DE; padding: 16px 20px; border-radius: 10px; margin-bottom: 28px; font-size: 13px; }
          .stats strong { color: #2E5E2C; }
          h2 { color: #76955E; font-size: 15px; margin: 0 0 16px; }
          .msg { margin-bottom: 14px; }
          .burbuja { display: inline-block; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; max-width: 80%; }
          .usuario .burbuja { background: #DCCDA8; }
          .ia .burbuja { background: #f5f5f5; border: 1px solid #eee; }
          .meta { font-size: 10px; color: #aaa; margin-top: 3px; }
          .usuario { text-align: right; }
        </style>
      </head>
      <body>
        <h1>🥑 Dip & Crunch — Informe de Análisis Sensorial</h1>
        <div class="fecha">Generado el ${fecha}</div>
        <div class="stats">
          <strong>Datos de la encuesta</strong><br/>
          Total de respuestas: <strong>${totalRespuestas}</strong> &nbsp;·&nbsp;
          Calificación promedio: <strong>${promedioGeneral.toFixed(1)}/5</strong>
        </div>
        <h2>Conversación</h2>
        ${mensajes.map(m => `
          <div class="msg ${m.rol}">
            <div class="burbuja">${m.texto.replace(/\n/g, "<br/>")}</div>
            <div class="meta">${m.rol === "usuario" ? "Vos" : "Asistente IA"} · ${m.hora}</div>
          </div>
        `).join("")}
      </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  }

  async function agregarContacto() {
    if (!nuevoNombre.trim() || !nuevoEmail.trim()) return;
    const { data } = await supabase.from("chat_contactos")
      .insert({ nombre: nuevoNombre.trim(), email: nuevoEmail.trim() })
      .select().single();
    if (data) setContactos(prev => [...prev, data]);
    setNuevoNombre("");
    setNuevoEmail("");
  }

  function toggleSeleccionado(email: string) {
    setSeleccionados(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  }

  async function enviarMail() {
    if (!seleccionados.length) return;
    setEnviandoMail(true);
    const html = `
      <div style="font-family:sans-serif;padding:32px;max-width:600px;margin:0 auto">
        <h1 style="color:#2E5E2C">Dip & Crunch — Informe</h1>
        <p style="color:#aaa;font-size:13px">Generado el ${new Date().toLocaleDateString("es-AR")}</p>
        <div style="background:#EAF3DE;padding:14px;border-radius:8px;margin:16px 0;font-size:13px">
          Total respuestas: <strong>${totalRespuestas}</strong> · 
          Promedio: <strong>${promedioGeneral.toFixed(1)}/5</strong>
        </div>
        <h2 style="color:#76955E;font-size:15px">Conversación</h2>
        ${mensajes.map(m => `
          <div style="margin-bottom:12px;text-align:${m.rol === "usuario" ? "right" : "left"}">
            <div style="display:inline-block;padding:10px 14px;border-radius:10px;background:${m.rol === "usuario" ? "#DCCDA8" : "#f5f5f5"};font-size:13px;max-width:80%">
              ${m.texto.replace(/\n/g, "<br/>")}
            </div>
            <div style="font-size:10px;color:#aaa;margin-top:3px">${m.hora}</div>
          </div>
        `).join("")}
      </div>
    `;
    try {
      await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarios: seleccionados, asunto: "Informe Dip & Crunch", html }),
      });
      setModalMailAbierto(false);
      setSeleccionados([]);
      alert("Mail enviado correctamente");
    } catch {
      alert("Error al enviar el mail");
    } finally {
      setEnviandoMail(false);
    }
  }

  const hayRespuestaIA = mensajes.some(m => m.rol === "ia");
  const sugerencias = [
    "¿Cuál es el atributo mejor puntuado?",
    "Resumen general del producto",
    "¿Qué aspectos mejorarías?",
    "Generá conclusiones para el TP",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: "520px" }}>

      {/* Keyframes para los puntos y chips */}
      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
        .chat-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #AFB884; display: inline-block; margin: 0 2px;
        }
        .chat-dot:nth-child(1) { animation: chatBounce 1.2s infinite 0s; }
        .chat-dot:nth-child(2) { animation: chatBounce 1.2s infinite 0.2s; }
        .chat-dot:nth-child(3) { animation: chatBounce 1.2s infinite 0.4s; }
        .chat-chip:hover { border-color: #76955E !important; color: #76955E !important; }
        .chat-hist-item:hover { background: #F8F6EF !important; }
        .chat-send:hover:not(:disabled) { background: #E7B511 !important; transform: scale(1.05); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={S.pageTitle}>Asistente IA</div>
          <div style={S.pageSub}>Consultá los resultados con inteligencia artificial</div>
        </div>
        <button
          onClick={nuevaConversacion}
          style={{ background: "transparent", border: "1px solid #C8D4B0", color: "#76955E", borderRadius: "30px", fontSize: "13px", padding: "8px 18px", cursor: "pointer", fontWeight: "600", flexShrink: 0 }}
        >
          + Nuevo chat
        </button>
      </div>

      {/* Contenedor principal */}
      <div style={{ display: "flex", flex: 1, background: "white", borderRadius: "16px", border: "1px solid #EEE", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", minHeight: 0 }}>

        {/* Panel izquierdo — historial */}
        <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid #EEE", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "1px", textTransform: "uppercase", padding: "12px 16px", borderBottom: "1px solid #F5F5F5", flexShrink: 0 }}>
            Conversaciones
          </div>
          {historial.length === 0 ? (
            <div style={{ textAlign: "center", color: "#ccc", fontSize: "12px", padding: "28px 16px" }}>
              Sin conversaciones
            </div>
          ) : (
            historial.map(conv => (
              <div
                key={conv.id}
                className="chat-hist-item"
                onClick={() => cargarConversacion(conv)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  background: convActiva === conv.id ? "#F0F5E8" : "transparent",
                  borderLeft: convActiva === conv.id ? "3px solid #76955E" : "3px solid transparent",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: "12px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: convActiva === conv.id ? "600" : "400" }}>
                  {conv.titulo}
                </div>
                <div style={{ fontSize: "10px", color: "#aaa", marginTop: "3px" }}>{conv.fecha}</div>
              </div>
            ))
          )}
        </div>

        {/* Panel derecho — área de chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F6EF", minWidth: 0 }}>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {mensajes.length === 0 ? (
              /* Bienvenida */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🥑</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#2E5E2C", marginBottom: "8px" }}>
                  ¿En qué puedo ayudarte?
                </div>
                <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px" }}>
                  Consultá sobre los resultados de la encuesta sensorial
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "480px" }}>
                  {sugerencias.map(s => (
                    <button
                      key={s}
                      className="chat-chip"
                      onClick={() => { setInput(s); }}
                      style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: "20px", padding: "8px 14px", fontSize: "12px", color: "#555", cursor: "pointer", transition: "all 0.15s" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {mensajes.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.rol === "usuario" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      background: m.rol === "usuario" ? "#DCCDA8" : "white",
                      color: "#333",
                      borderRadius: m.rol === "usuario" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      border: m.rol === "ia" ? "1px solid #EEE" : "none",
                      padding: "12px 16px",
                      fontSize: "14px",
                      maxWidth: m.rol === "usuario" ? "70%" : "80%",
                      lineHeight: 1.6,
                    }}>
                      {m.rol === "ia" ? renderMd(m.texto) : m.texto}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px", textAlign: m.rol === "usuario" ? "right" : "left" }}>
                      {m.hora}
                    </div>
                  </div>
                ))}

                {/* Indicador escribiendo */}
                {escribiendo && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ background: "white", border: "1px solid #EEE", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", display: "flex", alignItems: "center" }}>
                      <span className="chat-dot" />
                      <span className="chat-dot" />
                      <span className="chat-dot" />
                    </div>
                  </div>
                )}

                <div id="chat-fin" />
              </>
            )}
          </div>

          {/* Botones de acción */}
          {hayRespuestaIA && (
            <div style={{ padding: "0 20px 8px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={descargarInforme}
                style={{ background: "transparent", border: "1px solid #76955E", color: "#76955E", borderRadius: "20px", fontSize: "12px", padding: "6px 14px", cursor: "pointer" }}
              >
                📄 Descargar informe
              </button>
              <button
                onClick={() => { setModalMailAbierto(true); }}
                style={{ background: "#76955E", border: "none", color: "white", borderRadius: "20px", fontSize: "12px", padding: "6px 14px", cursor: "pointer" }}
              >
                📧 Enviar por mail
              </button>
            </div>
          )}

          {/* Input */}
          <div style={{ background: "white", borderTop: "1px solid #EEE", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-end", flexShrink: 0 }}>
            <textarea
              value={input}
              rows={1}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              onFocus={e   => { (e.target as HTMLTextAreaElement).style.borderColor = "#76955E"; }}
              onBlur={e    => { (e.target as HTMLTextAreaElement).style.borderColor = "#DDD"; }}
              placeholder="Preguntá sobre los resultados..."
              style={{ flex: 1, border: "1px solid #DDD", borderRadius: "12px", padding: "10px 14px", fontSize: "14px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: "96px", overflowY: "auto" }}
            />
            <button
              className="chat-send"
              onClick={enviar}
              disabled={!input.trim() || escribiendo}
              style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", background: !input.trim() || escribiendo ? "#E0E0E0" : "#E2C15D", color: "white", fontSize: "18px", cursor: !input.trim() || escribiendo ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      {modalMailAbierto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "420px", maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#333", marginBottom: "4px" }}>📧 Enviar informe</div>
            <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "20px" }}>Seleccioná los destinatarios</div>
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
              {contactos.length === 0 && (
                <div style={{ color: "#ccc", fontSize: "12px", textAlign: "center", padding: "12px" }}>No hay contactos guardados</div>
              )}
              {contactos.map(c => (
                <div key={c.email} onClick={() => toggleSeleccionado(c.email)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${seleccionados.includes(c.email) ? "#76955E" : "#EEE"}`, background: seleccionados.includes(c.email) ? "#F0F5E8" : "white", cursor: "pointer" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${seleccionados.includes(c.email) ? "#76955E" : "#DDD"}`, background: seleccionados.includes(c.email) ? "#76955E" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {seleccionados.includes(c.email) && <span style={{ color: "white", fontSize: "11px" }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{c.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>{c.email}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #EEE", paddingTop: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: "700", marginBottom: "8px" }}>AGREGAR CONTACTO</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Nombre" style={{ flex: 1, border: "1px solid #DDD", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", outline: "none" }} />
                <input value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} placeholder="Email" style={{ flex: 2, border: "1px solid #DDD", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", outline: "none" }} />
              </div>
              <button onClick={agregarContacto} style={{ background: "transparent", border: "1px solid #C8D4B0", color: "#76955E", borderRadius: "20px", fontSize: "12px", padding: "6px 14px", cursor: "pointer" }}>
                + Agregar
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => { setModalMailAbierto(false); setSeleccionados([]); }}
                style={{ background: "transparent", border: "1px solid #DDD", color: "#888", borderRadius: "20px", fontSize: "13px", padding: "8px 18px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={enviarMail} disabled={!seleccionados.length || enviandoMail}
                style={{ background: seleccionados.length && !enviandoMail ? "#76955E" : "#DDD", color: "white", border: "none", borderRadius: "20px", fontSize: "13px", padding: "8px 18px", cursor: seleccionados.length && !enviandoMail ? "pointer" : "not-allowed" }}>
                {enviandoMail ? "Enviando..." : `Enviar a ${seleccionados.length} contacto${seleccionados.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────
export default function AdminPanel() {
  const router = useRouter();
  const [respuestas, setRespuestas]   = useState<Respuesta[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState<PageId>("resumen");
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [nuevaRespuesta, setNuevaRespuesta] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("respuestas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setRespuestas(data ?? []);
      setLoading(false);
    })();

    const channel = supabase
      .channel("respuestas-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "respuestas" },
        (payload) => {
          setRespuestas((prev) => [payload.new as Respuesta, ...prev]);
          setNuevaRespuesta(true);
          setTimeout(() => setNuevaRespuesta(false), 3000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F8F6EF", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "18px" }}>🥑</div>
          <p style={{ color: "#76955E", fontWeight: "700", fontSize: "16px" }}>Cargando respuestas...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: "100vh", background: "#F8F6EF", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center" }}>
          <p style={{ color: "#E07070", fontWeight: "700" }}>Error al cargar datos</p>
          <p style={{ color: "#aaa", fontSize: "13px", marginTop: "8px" }}>{error}</p>
        </div>
      </main>
    );
  }

  // Datos para el chat IA
  const calMedia = avg(respuestas.map(r => r.satisfaccion_general));

  const navItems: { id: PageId; label: string; emoji: string }[] = [
    { id: "resumen",      label: "Resumen",                 emoji: "" },
    { id: "descriptivos", label: "Resultados Descriptivos", emoji: "" },
    { id: "afectivos",    label: "Resultados Afectivos",    emoji: "" },
    { id: "comentarios",  label: "Comentarios",             emoji: "" },
    { id: "notas",        label: "Asistente IA",            emoji: "" },
  ];

  return (
    <div className="admin-layout">
      {sidebarAbierto && (
        <div className="admin-overlay" onClick={() => { setSidebarAbierto(false); }}/>
      )}

      {nuevaRespuesta && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#76955E", color: "white", padding: "10px 18px", borderRadius: "20px", fontWeight: "700", fontSize: "13px", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          🟢 Nueva respuesta recibida
        </div>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarAbierto ? "abierto" : ""}`}>
        <div style={S.brand}>
          <div style={S.brandName}>🥑 Dip & Crunch</div>
          <div style={S.brandSub}>Panel de Control</div>
        </div>

        {navItems.map((n) => (
          <div key={n.id} style={S.navItem(page === n.id)} onClick={() => { setPage(n.id); }}>
            <span>{n.emoji}</span>
            <span>{n.label}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "16px 18px 0", borderTop: "1px solid #EEE" }}>
          <button
            onClick={() => { router.push("/"); }}
            style={{ background: "none", border: "none", color: "#bbb", fontSize: "12px", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Menú principal
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="admin-main-content">
        <button className="admin-hamburger" onClick={() => { setSidebarAbierto(true); }}>
          ☰ Menú
        </button>
        <div style={S.topBar}>
          <span style={S.adminBadge}>Administradora</span>
        </div>

        {page === "resumen"      && <PageResumen      respuestas={respuestas} />}
        {page === "descriptivos" && <PageDescriptivos respuestas={respuestas} />}
        {page === "afectivos"    && <PageAfectivos    respuestas={respuestas} />}
        {page === "comentarios"  && <PageComentarios  respuestas={respuestas} />}
        {page === "notas"        && <PageNotas totalRespuestas={respuestas.length} promedioGeneral={calMedia} />}
      </main>
    </div>
  );
}