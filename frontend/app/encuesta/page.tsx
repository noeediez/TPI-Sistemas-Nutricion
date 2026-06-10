import Link from "next/link";

const nuggets = [
  "Soja texturizada",
  "Garbanzos cocidos",
  "Cebolla",
  "Morrón rojo",
  "Ajo",
  "Provenzal",
  "Pimentón ahumado",
  "Sal",
  "Huevos",
  "Pan rallado",
  "Avena",
  "Copos de maíz sin azúcar",
  "Aceite en aerosol",
  "Aceite de oliva",
];

const dip = [
  "Huevos cocidos",
  "Palta",
  "Limón",
  "Perejil",
  "Sal",
  "Aceite de oliva",
];

export default function IngredientesPage() {
  return (
    <main
      className="ingredientes-main"
      style={{
        minHeight: "100vh",
        background: "#F8F6EF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "48px" }}>
        <span
          style={{
            background: "#EFE4C7",
            padding: "8px 16px",
            borderRadius: "20px",
            color: "#2E5E2C",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          100% VEGETAL
        </span>
        <h1
          className="ingredientes-titulo"
          style={{
            color: "#2E5E2C",
            fontWeight: "800",
            marginTop: "16px",
            marginBottom: "8px",
            lineHeight: "1",
          }}
        >
          Ingredientes
        </h1>
        <p className="ingredientes-subtitulo" style={{ color: "#76955E", fontSize: "16px", margin: 0 }}>
          Todos naturales, sin conservantes artificiales.
        </p>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          flex: 1,
        }}
      >
        {/* NUGGETS CARD */}
        <div
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "36px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            border: "1px solid #EAF0E2",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: 0, color: "#2E5E2C", fontSize: "22px", fontWeight: "800" }}>
              Nuggets Vegetarianos 
            </h2>
            <p style={{ margin: 0, color: "#AAA", fontSize: "13px" }}>
              {nuggets.length} ingredientes
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {nuggets.map((nombre) => (
              <div
                key={nombre}
                style={{
                  padding: "14px 18px",
                  background: "#F8FAF5",
                  borderRadius: "14px",
                  border: "1px solid #E8F0DF",
                }}
              >
                <span style={{ color: "#333", fontWeight: "600", fontSize: "15px" }}>
                  {nombre}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DIP CARD */}
        <div
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "36px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            border: "1px solid #EAF0E2",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: 0, color: "#2E5E2C", fontSize: "22px", fontWeight: "800" }}>
              Dip de Palta
            </h2>
            <p style={{ margin: 0, color: "#AAA", fontSize: "13px" }}>
              {dip.length} ingredientes
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {dip.map((nombre) => (
              <div
                key={nombre}
                style={{
                  padding: "14px 18px",
                  background: "#F8FAF5",
                  borderRadius: "14px",
                  border: "1px solid #E8F0DF",
                }}
              >
                <span style={{ color: "#333", fontWeight: "600", fontSize: "15px" }}>
                  {nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "40px",
          paddingTop: "24px",
          borderTop: "1px solid #E8E8E8",
        }}
      >
        <Link href="/">
          <button
            style={{
              background: "transparent",
              border: "2px solid #C8D4B0",
              color: "#76955E",
              fontWeight: "700",
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "30px",
              cursor: "pointer",
            }}
          >
            ← Menú principal
          </button>
        </Link>

        <Link href="/encuesta">
          <button
            style={{
              background: "#76955E",
              color: "white",
              border: "none",
              padding: "14px 36px",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(118,149,94,0.3)",
            }}
          >
            Ir a la encuesta →
          </button>
        </Link>
      </div>
    </main>
  );
}