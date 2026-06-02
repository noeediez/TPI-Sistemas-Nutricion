import Link from "next/link";

export default function IngredientesPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Ingredientes</h1>

      <h2>Nuggets Veggie</h2>
      <ul>
        <li>Espinaca</li>
        <li>Garbanzos</li>
        <li>Avena</li>
        <li>Condimentos naturales</li>
      </ul>

      <h2>Dip de Palta</h2>
      <ul>
        <li>Palta</li>
        <li>Limón</li>
        <li>Sal</li>
        <li>Especias</li>
      </ul>

      <Link href="/preparacion">
        <button>Siguiente</button>
      </Link>
    </main>
  );
}