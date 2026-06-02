import Link from "next/link";

export default function PreparacionPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Preparación</h1>

      <ol>
        <li>Servir los nuggets veggie.</li>
        <li>Acompañar con el dip de palta.</li>
        <li>Degustar el producto.</li>
        <li>Responder la encuesta.</li>
      </ol>

      <Link href="/encuesta">
        <button>Ir a la Encuesta</button>
      </Link>
    </main>
  );
}