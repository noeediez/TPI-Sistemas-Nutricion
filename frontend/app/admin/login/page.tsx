"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    if (usuario === "admin" && contrasena === "admin123") {
      sessionStorage.setItem("admin_autenticado", "true");
      router.push("/admin");
    } else {
      setError("Usuario o contraseña incorrectos.");
      setCargando(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#D4C4A0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "36px 32px 32px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Volver */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "#555",
            fontSize: "14px",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          ‹ Volver
        </a>

        {/* Ícono hoja */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#F0EDE6",
              fontSize: "28px",
            }}
          >
            🌿
          </div>
        </div>

        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              margin: "0 0 6px",
              color: "#4A7C3F",
              fontSize: "22px",
              fontWeight: "800",
            }}
          >
            Dip &amp; Crunch
          </h1>
          <p style={{ margin: 0, color: "#999", fontSize: "13px" }}>
            Acceso para Administradores
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin}>
          {/* Campo usuario */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                color: "#333",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Usuario
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
              </span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresá tu usuario"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #E5E0D8",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#FAFAF8",
                  color: "#333",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#76955E")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")}
              />
            </div>
          </div>

          {/* Campo contraseña */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                color: "#333",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
              </span>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresá tu contraseña"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #E5E0D8",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#FAFAF8",
                  color: "#333",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#76955E")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#FFF0F0",
                border: "1px solid #FFCCCC",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                color: "#C53030",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              padding: "14px",
              background: cargando ? "#C8A84B" : "#C8A020",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: cargando ? "not-allowed" : "pointer",
              letterSpacing: "0.3px",
            }}
          >
            {cargando ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        {/* Credenciales de prueba */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#bbb",
            fontSize: "12px",
            lineHeight: "1.6",
          }}
        >
          Credenciales de prueba:
          <br />
          <code style={{ color: "#999" }}>admin / admin123</code>
        </p>
      </div>
    </main>
  );
}
