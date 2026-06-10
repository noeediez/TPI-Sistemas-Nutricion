import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8F6EF" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "20px 40px"
      }}>
        <Image
          src="/partearriba.png"
          alt="Logo"
          width={60}
          height={60}
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <div>
          <h2 style={{ margin: 0, color: "#2E5E2C", fontSize: "28px", fontWeight: "800" }}>
            Dip & Crunch
          </h2>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">

        <div className="hero-texto">
          <span style={{
            background: "#EFE4C7",
            borderRadius: "20px",
            color: "#2E5E2C",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            🌿 ANÁLISIS SENSORIAL
          </span>

          <h1 className="hero-titulo" style={{ marginTop: "16px" }}>
            Nuggets Vegetarianos
            <br />
            <span className="hero-subtitulo">+ Dip de Palta</span>
          </h1>

          <p style={{ marginTop: "20px", fontSize: "18px", color: "#555", lineHeight: "1.5" }}>
            Un snack saludable, delicioso y 100% vegetal. Participá en nuestra
            evaluación sensorial y ayudanos a perfeccionarlo.
          </p>

          <div className="hero-botones">
            <Link href="/encuesta">
              <button style={{
                background: "#76955E",
                color: "white",
                border: "none",
                padding: "18px 30px",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "18px",
              }}>
                Comenzar Encuesta
              </button>
            </Link>
            <Link href="/ingredientes">
              <button style={{
                background: "transparent",
                border: "2px solid #76955E",
                color: "#76955E",
                padding: "18px 30px",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "18px",
              }}>
                Ver Ingredientes
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-imagen">
          <Image
            src="/PRODUCTO.png"
            alt="Producto"
            width={500}
            height={500}
            priority
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>

      </section>

      {/* CARDS */}
      <div className="cards-grid">
        <div className="card-feature">
          <h3>🌱 100% Vegetal</h3>
          <p style={{ marginTop: "8px", color: "#666" }}>
            Ingredientes de origen vegetal y sostenibles.
          </p>
        </div>
        <div className="card-feature">
          <h3>💚 Saludable</h3>
          <p style={{ marginTop: "8px", color: "#666" }}>
            Sin conservantes artificiales.
          </p>
        </div>
        <div className="card-feature">
          <h3>🥑 Delicioso</h3>
          <p style={{ marginTop: "8px", color: "#666" }}>
            Nuggets veggie con dip cremoso de palta.
          </p>
        </div>
        <div className="card-feature">
          <h3>⭐ Tu opinión importa</h3>
          <p style={{ marginTop: "8px", color: "#666" }}>
            Ayudanos a mejorar el producto.
          </p>
        </div>
      </div>

      {/* ADMIN */}
      <div style={{ marginTop: "40px", marginBottom: "40px", display: "flex", justifyContent: "center" }}>
        <Link href="/admin/login">
          <button style={{
            background: "#EFE4C7",
            color: "#2E5E2C",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "1px",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
          }}>
            Panel de administración
          </button>
        </Link>
      </div>

    </main>
  );
}