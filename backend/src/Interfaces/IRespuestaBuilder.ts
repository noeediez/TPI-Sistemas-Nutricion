import {Respuesta} from "../Respuesta";

export interface IRespuestaBuilder {
    setDatosEvaluador(sexo: string, rangoEtario: string): IRespuestaBuilder;
    setVista(color: number, apariencia: number, dipAspecto: number): IRespuestaBuilder;
    setOlfatoTextura(aroma: number, textura: number, consistencia: number, cremosidad: number): IRespuestaBuilder;
    setSabor(saborNuggets: number, combinacion: number, intensidad: number): IRespuestaBuilder;
    setAfectivos(satisfaccion: number, consumiria: number, recomendaria: number, alternativa: number, reemplazo: number): IRespuestaBuilder;
    setComentarios(comentarios: string): IRespuestaBuilder;
    build(): Respuesta;
}