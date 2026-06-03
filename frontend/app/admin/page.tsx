// app/admin/page.tsx
// Guardá en: app/admin/page.tsx
// Instalá recharts si no lo tenés: npm install recharts

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
  edad: string;
  consumiria_alternativa: string;
  consumiria_dip: string;
  color_nuggets: number;
  apariencia_general: number;
  aspecto_dip: number;
  aroma_agradable: number;
  textura_nuggets: number;
  consistencia_interna: number;
  cremosidad_dip: number;
  sabor_nuggets: number;
  combinacion_dip: number;
  intensidad_sabor: number;
  gusto_general: number;
  consumiria_nuevamente: string;
  recomendaria: string;
  comentario: string;
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

function scoreColor(score: number): { bg: string; text: string } {
  if (score >= 4) return { bg: "#EDF7ED", text: "#2D7A2D" };
  if (score === 3) return { bg: "#FFF9E8", text: "#B07D00" };
  return { bg: "#FEE8E8", text: "#C53030" };
}

// ── Componente principal ───────────────────────────────────────────────
export default function AdminPanel() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

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

  // ── Calcular datos para gráficos ──
  const total = respuestas.length;

  const radarData = [
    { categoria: "Vista",    promedio: avg(respuestas.flatMap((r) => [r.color_nuggets, r.apariencia_general, r.aspecto_dip])) },
    { categoria: "Olfato",   promedio: avg(respuestas.map((r) => r.aroma_agradable)) },
    { categoria: "Textura",  promedio: avg(respuestas.flatMap((r) => [r.textura_nuggets, r.consistencia_interna, r.cremosidad_dip])) },
    { categoria: "Sabor",    promedio: avg(respuestas.flatMap((r) => [r.sabor_nuggets, r.combinacion_dip, r.intensidad_sabor])) },
    { categoria: "General",  promedio: avg(respuestas.map((r) => r.gusto_general)) },
  ];

  const histData = [
    { label: "Malo (1)",      cantidad: respuestas.filter((r) => r.gusto_general === 1).length, color: "#E07070" },
    { label: "Regular (2)",   cantidad: respuestas.filter((r) => r.gusto_general === 2).length, color: "#E0A860" },
    { label: "Bueno (3)",     cantidad: respuestas.filter((r) => r.gusto_general === 3).length, color: "#E7B511" },
    { label: "Muy bueno (4)", cantidad: respuestas.filter((r) => r.gusto_general === 4).length, color: "#A8C878" },
    { label: "Excelente (5)", cantidad: respuestas.filter((r) => r.gusto_general === 5).length, color: "#76955E" },
  ];

  const promedioGeneral = avg(respuestas.map((r) => r.gusto_general));
  const pctCompra       = pct(respuestas.map((r) => r.consumiria_nuevamente), "Sí");
  const pctRecomienda   = pct(respuestas.map((r) => r.recomendaria), "Sí");

  const statCards = [
    { label: "Total respuestas",      value: total.toString(),              icon: "📋", color: "#76955E" },
    { label: "Satisfacción general",  value: `${promedioGeneral.toFixed(1)}/5`, icon: "⭐", color: "#E7B511" },
    { label: "Lo compraría de nuevo", value: `${pctCompra}%`,               icon: "🔄", color: "#5B8EAD" },
    { label: "Lo recomendaría",       value: `${pctRecomienda}%`,            icon: "👍", color: "#9B59B6" },
  ];

  // ── Pantallas de carga / error ──
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
          <p style={{ color: "#E07070", fontWeight: "700", fontSize: "16px" }}>Error al cargar datos</p>
          <p style={{ color: "#aaa", fontSize: "13px", marginTop: "8px" }}>{error}</p>
        </div>
      </main>
    );
  }

  // ── Render principal ──
  return (
    <main style={{ minHeight: "100vh", background: "#F8F6EF", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ color: "#76955E", fontSize: "30px", fontWeight: "800", marginBottom: "6px" }}>
              🥑 Panel de Administración
            </h1>
            <p style={{ color: "#999", fontSize: "14px" }}>Encuesta sensorial · Nuggets de soja con dip de palta</p>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{ background: "transparent", border: "2px solid #C8D4B0", color: "#76955E", padding: "10px 22px", borderRadius: "30px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
          >
            ← Menú principal
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {statCards.map((s) => (
            <div
              key={s.label}
              style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderLeft: `5px solid ${s.color}` }}
            >
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>{s.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#aaa", fontWeight: "700", letterSpacing: "0.8px", marginTop: "8px" }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>

          {/* Gráfico araña */}
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#444", fontSize: "15px", fontWeight: "700", marginBottom: "20px" }}>
              🕸️ Perfil Sensorial Promedio
            </h2>
            {total === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "280px", color: "#ccc", fontSize: "14px" }}>
                Sin datos aún
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#E8E8E8" />
                  <PolarAngleAxis dataKey="categoria" tick={{ fontSize: 13, fill: "#555", fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "#bbb" }} tickCount={6} />
                  <Radar
                    name="Promedio"
                    dataKey="promedio"
                    stroke="#76955E"
                    fill="#76955E"
                    fillOpacity={0.4}
                    strokeWidth={2.5}
                    dot={{ fill: "#76955E", r: 4 }}
                  />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}/5`, "Promedio"]} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Histograma */}
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#444", fontSize: "15px", fontWeight: "700", marginBottom: "20px" }}>
              📊 Distribución de Satisfacción General
            </h2>
            {total === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "280px", color: "#ccc", fontSize: "14px" }}>
                Sin datos aún
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={histData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#666" }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#bbb" }} />
                  <Tooltip formatter={(v) => [v, "Respuestas"]} cursor={{ fill: "#F8F6EF" }} />
                  <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} name="Respuestas">
                    {histData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tabla de respuestas */}
        <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#444", fontSize: "15px", fontWeight: "700", marginBottom: "20px" }}>
            📋 Todas las respuestas ({total})
          </h2>

          {total === 0 ? (
            <p style={{ textAlign: "center", color: "#ccc", padding: "48px 0", fontSize: "15px" }}>
              Aún no hay respuestas registradas.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F8F6EF" }}>
                    {["Fecha", "Sexo", "Edad", "Vista", "Olfato", "Textura", "Sabor", "General", "Compraría", "Recomienda"].map((h) => (
                      <th
                        key={h}
                        style={{ padding: "12px 16px", textAlign: "left", color: "#76955E", fontWeight: "700", fontSize: "11px", letterSpacing: "0.8px", whiteSpace: "nowrap", borderBottom: "2px solid #F0F0F0" }}
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {respuestas.map((r, i) => {
                    const sc = scoreColor(r.gusto_general);
                    return (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", borderBottom: "1px solid #F5F5F5" }}>
                        <td style={{ padding: "12px 16px", color: "#888", whiteSpace: "nowrap" }}>
                          {new Date(r.created_at).toLocaleDateString("es-AR")}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{r.sexo || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{r.edad || "—"}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "#555" }}>
                          {avg([r.color_nuggets, r.apariencia_general, r.aspecto_dip]).toFixed(1)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "#555" }}>
                          {r.aroma_agradable || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "#555" }}>
                          {avg([r.textura_nuggets, r.consistencia_interna, r.cremosidad_dip]).toFixed(1)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "#555" }}>
                          {avg([r.sabor_nuggets, r.combinacion_dip, r.intensidad_sabor]).toFixed(1)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ background: sc.bg, color: sc.text, padding: "4px 12px", borderRadius: "20px", fontWeight: "700", fontSize: "12px" }}>
                            {r.gusto_general}/5
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ color: r.consumiria_nuevamente === "Sí" ? "#76955E" : "#E07070", fontWeight: "700" }}>
                            {r.consumiria_nuevamente || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ color: r.recomendaria === "Sí" ? "#76955E" : "#E07070", fontWeight: "700" }}>
                            {r.recomendaria || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}