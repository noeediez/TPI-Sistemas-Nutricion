import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F6EF",
        padding: "40px",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Image
          src="/partearriba.png"
          alt="Logo"
          width={60}
          height={60}
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <div>
          <h2 style={{ margin: 0, color: "#2E5E2C", fontSize: "32px", fontWeight: "800" }}>
            Dip & Crunch
          </h2>
          <p style={{ margin: 0, color: "#76955E", fontSize: "14px" }}></p>
        </div>
      </div>

      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: "80px",
        }}
      >
        <div
          style={{
            maxWidth: "650px",
            paddingRight: "40px",
            marginTop: "-150px",
          }}
        >
          <span
            style={{
              background: "#EFE4C7",
              padding: "10px 18px",
              borderRadius: "20px",
              color: "#2E5E2C",
            }}
          >
            🌿 ANÁLISIS SENSORIAL
          </span>
          <h1
            style={{
              fontSize: "90px",
              color: "#2E5E2C",
              marginTop: "10px",
              marginBottom: "5px",
              lineHeight: "0.95",
            }}
          >
            Nuggets Veggie
            <br />
            <span style={{ color: "#76955E" }}>+ Dip de Palta</span>
          </h1>

          <p style={{ marginTop: "20px", fontSize: "20px", color: "#555" }}>
            Un snack saludable, delicioso y 100% vegetal. Participá en nuestra
            evaluación sensorial y ayudanos a perfeccionarlo.
          </p>

          <div style={{ marginTop: "40px", display: "flex", gap: "20px" }}>
            <Link href="/encuesta">
              <button
                style={{
                  background: "#76955E",
                  color: "white",
                  border: "none",
                  padding: "18px 30px",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                Comenzar Encuesta
              </button>
            </Link>

            <Link href="/ingredientes">
              <button
                style={{
                  background: "transparent",
                  border: "2px solid #76955E",
                  color: "#76955E",
                  padding: "18px 30px",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                Ver Ingredientes
              </button>
            </Link>
          </div>
        </div>

        <div style={{ flex: 1.4, display: "flex", justifyContent: "flex-end" }}>
          <Image
            src="/PRODUCTO.png"
            alt="Producto"
            width={990}
            height={990}
            priority
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </section>

      <section
        style={{
          marginTop: "80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "25px",
        }}
      >
        <div style={{ background: "white", padding: "25px", borderRadius: "20px", textAlign: "center" }}>
          <h3>🌱 100% Vegetal</h3>
          <p>Ingredientes de origen vegetal y sostenibles.</p>
        </div>
        <div style={{ background: "white", padding: "25px", borderRadius: "20px", textAlign: "center" }}>
          <h3>💚 Saludable</h3>
          <p>Sin conservantes artificiales.</p>
        </div>
        <div style={{ background: "white", padding: "25px", borderRadius: "20px", textAlign: "center" }}>
          <h3>🥑 Delicioso</h3>
          <p>Nuggets veggie con dip cremoso de palta.</p>
        </div>
        <div style={{ background: "white", padding: "25px", borderRadius: "20px", textAlign: "center" }}>
          <h3>⭐ Tu opinión importa</h3>
          <p>Ayudanos a mejorar el producto.</p>
        </div>
      </section>

      {/* BOTÓN PANEL ADMINISTRACIÓN */}
      <div style={{ marginTop: "60px", display: "flex", justifyContent: "center" }}>
        <Link href="/admin/login">
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "#AAAAAA",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
              padding: "8px",
            }}
          >
            Panel de administración
          </button>
        </Link>
      </div>
    </main>
  );
}