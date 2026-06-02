import { Respuesta } from "../Respuesta";

export interface IRespuestaRepository {
    guardar(respuesta: Respuesta): Promise<void>;
    listarTodas(): Promise<any[]>;
    obtenerPromedios(): Promise<PromediosAtributos>;
    listarComentarios(): Promise<ComentarioConDatos[]>;
}

export type PromediosAtributos = {
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
};

export type ComentarioConDatos = {
    comentarios: string;
    nombre: string;
    apellido: string;
    sexo: string;
    rango_etario: string;
    created_at: string;
};