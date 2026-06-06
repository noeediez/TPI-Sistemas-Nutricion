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
    .map((e) => parseInt("18-46"))
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
  const pctCompra =
  total === 0
    ? 0
    : Math.round(
        (respuestas.filter((r) => r.consumiria_nuevamente === 1).length /
          total) *
          100
      );

const pctRec =
  total === 0
    ? 0
    : Math.round(
        (respuestas.filter((r) => r.recomendaria === 1).length /
          total) *
          100
      );
  const calMedia = avg(respuestas.map((r) => r.satisfaccion_general));
  const edadMedia = avgAge(respuestas.map((r) => r.rango_etario));
  const ultima = respuestas.length ? timeSince(respuestas[0].created_at) : "—";

  const porEdad: Record<string, number> = {};
  const porSexo: Record<string, number> = {};
  respuestas.forEach((r) => {
    porEdad[r.rango_etario] = (porEdad[r.rango_etario] || 0) + 1;
    porSexo[r.sexo] = (porSexo[r.sexo] || 0) + 1;
  });

 const edadGroups = [
  {
    label: "18-25 años",
    count: respuestas.filter((r) => r.rango_etario === "18-25").length,
  },
  {
    label: "26-35 años",
    count: respuestas.filter((r) => r.rango_etario === "26-35").length,
  },
  {
    label: "36-50 años",
    count: respuestas.filter((r) => r.rango_etario === "36-50").length,
  },
  {
    label: "51+ años",
    count: respuestas.filter((r) => r.rango_etario === "51+").length,
  },
];
  const sexoColors: Record<string, string> = { Femenino: "#9B59B6", Masculino: "#5B8EAD", Otro: "#76955E" };

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Panel de Resumen</div>
        <div style={S.pageSub}>Vista general de las encuestas de análisis sensorial</div>
      </div>

      <div style={S.metricGrid}>
        <MetricCard icon="" value={String(total)}             label="Total de encuestas"  color="#76955E" />
        <MetricCard icon="" value={edadMedia}                 label="Edad promedio"        color="#E7B511" />
        <MetricCard icon="" value={ultima}                    label="Última respuesta"     color="#5B8EAD" />
        <MetricCard icon="" value={`${calMedia.toFixed(1)}/5`} label="Calificación media"  color="#E07070" />
      </div>

      <div className="two-col" style={S.twoCol}>
        <div style={S.card}>
          <div style={S.cardTitle}>📊 Distribución por Edad</div>
          {edadGroups.map((g) => (
            <HorizBar key={g.label} label={g.label} count={g.count} total={total} color="#76955E" />
          ))}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>👥 Distribución por Sexo</div>
          {Object.entries(porSexo).map(([sexo, count]) => (
            <HorizBar key={sexo} label={sexo} count={count} total={total} color={sexoColors[sexo] || "#76955E"} />
          ))}
          <div style={{ marginTop: "20px" }}>
            <div style={{ ...S.cardTitle, marginBottom: "10px" }}>🔄 Intención de consumo</div>
            <HorizBar label="Consumiría"    count={Math.round(total * pctCompra / 100)} total={total} color="#76955E" />
            <HorizBar label="Recomendaría" count={Math.round(total * pctRec / 100)}    total={total} color="#97C459" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página Descriptivos ────────────────────────────────────────────────
function PageDescriptivos({ respuestas }: { respuestas: Respuesta[] }) {
  const gustoData = [
    { label: "No me gustó nada (1)", cantidad: respuestas.filter((r) => r.satisfaccion_general === 1).length, color: "#E07070" },
    { label: "No me gustó (2)",      cantidad: respuestas.filter((r) => r.satisfaccion_general === 2).length, color: "#E0A860" },
    { label: "Neutro (3)",           cantidad: respuestas.filter((r) => r.satisfaccion_general === 3).length, color: "#E7C511" },
    { label: "Me gustó (4)",         cantidad: respuestas.filter((r) => r.satisfaccion_general === 4).length, color: "#A8C878" },
    { label: "Me gustó mucho (5)",   cantidad: respuestas.filter((r) => r.satisfaccion_general === 5).length, color: "#76955E" },
  ];

   const intentData = [
  { label: "Definitivamente no", cantidad: respuestas.filter(r => r.consumiria_nuevamente === 1).length, color: "#E07070" },
  { label: "Probablemente no",   cantidad: respuestas.filter(r => r.consumiria_nuevamente === 2).length, color: "#E0A860" },
  { label: "No sé",              cantidad: respuestas.filter(r => r.consumiria_nuevamente === 3).length, color: "#E7C511" },
  { label: "Probablemente sí",   cantidad: respuestas.filter(r => r.consumiria_nuevamente === 4).length, color: "#A8C878" },
  { label: "Definitivamente sí", cantidad: respuestas.filter(r => r.consumiria_nuevamente === 5).length, color: "#76955E" },
];

  const total = respuestas.length;
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={intentData} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#bbb" }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#888" }} width={115} />
              <Tooltip formatter={(v) => [v, "Respuestas"]} cursor={{ fill: "#F8F6EF" }} />
              <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                {intentData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
    { categoria: "Aroma", promedio: avg(respuestas.map((r) => r.aroma)) },
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

      {/* Chips de atributos */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: "10px",
      }}>
        {radarData.map((d) => (
          <div key={d.categoria} style={{
            background: "white",
            border: "1px solid #EEE",
            borderRadius: "12px",
            padding: "14px",
            textAlign: "center",
          }}>
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
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "30px",
            border: "1px solid #DDD",
            fontSize: "13px",
            outline: "none",
            background: "white",
          }}
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
              <div key={r.id} style={{
                background: "white",
                border: "1px solid #EEE",
                borderRadius: "14px",
                padding: "16px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: av.bg, color: av.text,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "700", flexShrink: 0,
                  }}>
                    {initials(r.sexo)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    <strong style={{ color: "#555" }}>{r.sexo || "—"}</strong>
                    {r.rango_etario ? ` · ${r.rango_etario} años` : ""}
                  </div>
                  <span style={{
                    marginLeft: "4px",
                    background: "#F8F6EF",
                    color: scoreColor(r.satisfaccion_general),
                    fontSize: "11px", fontWeight: "700",
                    padding: "2px 10px", borderRadius: "20px",
                  }}>
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

// ── Página Notas ───────────────────────────────────────────────────────
function PageNotas() {
  const [notas, setNotas] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("admin_notas");
    if (saved) setNotas(saved);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNotas(e.target.value);
    localStorage.setItem("admin_notas", e.target.value);
  }

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Mis Notas</div>
        <div style={S.pageSub}>Espacio personal de anotaciones (guardado automáticamente)</div>
      </div>
      <div style={S.card}>
        <textarea
          value={notas}
          onChange={handleChange}
          placeholder="Escribí tus observaciones sobre los resultados de la encuesta sensorial..."
          style={{
            width: "100%",
            minHeight: "360px",
            border: "none",
            background: "transparent",
            color: "#444",
            fontSize: "14px",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.8,
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────
export default function AdminPanel() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState<PageId>("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const navItems: { id: PageId; label: string; emoji: string }[] = [
    { id: "resumen",      label: "Resumen",               emoji: "" },
    { id: "descriptivos", label: "Resultados Descriptivos", emoji: "" },
    { id: "afectivos",    label: "Resultados Afectivos",   emoji: "" },
    { id: "comentarios",  label: "Comentarios",            emoji: "" },
    { id: "notas",        label: "Mis Notas",              emoji: "" },
  ];

  return (
    <div className="admin-app" style={S.app}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.35)", zIndex: 90,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={sidebarOpen ? "admin-sidebar admin-sidebar--open" : "admin-sidebar"}
        style={S.sidebar}
      >
        <div style={S.brand}>
          <div style={S.brandName}>🥑 Dip & Crunch</div>
          <div style={S.brandSub}>Panel de Control</div>
        </div>

        {navItems.map((n) => (
          <div
            key={n.id}
            style={S.navItem(page === n.id)}
            onClick={() => { setPage(n.id); setSidebarOpen(false); }}
          >
            <span>{n.emoji}</span>
            <span>{n.label}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "16px 18px 0", borderTop: "1px solid #EEE" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: "none",
              fontSize: "12px", color: "#bbb", cursor: "pointer", padding: "8px 0",
            }}
          >
            ← Menú principal
          </button>
        </div>
      </div>

      {/* Main */}
      <main style={S.main}>
        {/* Hamburger bar — solo visible en mobile via CSS */}
        <div className="admin-mobile-bar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", gap: "5px", padding: "4px",
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "#555" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#555" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#555" }} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "14px", color: "#333" }}>
            {navItems.find(n => n.id === page)?.label ?? "Panel"}
          </span>
          <span style={S.adminBadge}>Admin</span>
        </div>

        <div style={S.topBar}>
          <span style={S.adminBadge}>Administradora</span>
        </div>

        {page === "resumen"      && <PageResumen      respuestas={respuestas} />}
        {page === "descriptivos" && <PageDescriptivos respuestas={respuestas} />}
        {page === "afectivos"    && <PageAfectivos    respuestas={respuestas} />}
        {page === "comentarios"  && <PageComentarios  respuestas={respuestas} />}
        {page === "notas"        && <PageNotas />}
      </main>
    </div>
  ); /////////////prueba a a a 
}