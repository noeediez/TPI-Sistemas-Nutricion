import { supabase } from "../SINGLETON/SupabaseClient";
import { Respuesta } from "../Respuesta";
import { IRespuestaRepository, PromediosAtributos, ComentarioConDatos } from "../Interfaces/IRespuestaRepository";

export class RespuestaRepository implements IRespuestaRepository {

    public async guardar(respuesta: Respuesta): Promise<void> {
        const resultado = await supabase
            .from("respuestas")
            .upsert(respuesta.toJSON(), { onConflict: "client_uuid" })

        if (resultado.error) {
            throw new Error("Error al guardar respuesta: " + resultado.error.message);
        }
    }

    public async listarTodas(): Promise<any[]> {
        const resultado = await supabase
            .from("respuestas")
            .select("*")
            .order("created_at", { ascending: false });

        if (resultado.error) {
            throw new Error("Error al listar respuestas: " + resultado.error.message);
        }

        return resultado.data;
    }

    public async obtenerPromedios(): Promise<PromediosAtributos> {
        const resultado = await supabase
            .from("respuestas")
            .select(
                "color_atractivo, apariencia_general, dip_aspecto, aroma, " +
                "textura_nuggets, consistencia_interna, cremosidad_dip, " +
                "sabor_nuggets, combinacion_sabores, intensidad_sabor, " +
                "satisfaccion_general, consumiria_nuevamente, recomendaria, " +
                "alternativa_carnica, reemplazo_aderezo"
            );

        if (resultado.error) {
            throw new Error("Error al obtener promedios: " + resultado.error.message);
        }

        const datos = resultado.data;

        if (datos.length === 0) {
            return {
                color_atractivo: 0, apariencia_general: 0, dip_aspecto: 0,
                aroma: 0, textura_nuggets: 0, consistencia_interna: 0,
                cremosidad_dip: 0, sabor_nuggets: 0, combinacion_sabores: 0,
                intensidad_sabor: 0, satisfaccion_general: 0,
                consumiria_nuevamente: 0, recomendaria: 0,
                alternativa_carnica: 0, reemplazo_aderezo: 0
            };
        }

        const campos: (keyof PromediosAtributos)[] = [
            "color_atractivo", "apariencia_general", "dip_aspecto",
            "aroma", "textura_nuggets", "consistencia_interna", "cremosidad_dip",
            "sabor_nuggets", "combinacion_sabores", "intensidad_sabor",
            "satisfaccion_general", "consumiria_nuevamente", "recomendaria",
            "alternativa_carnica", "reemplazo_aderezo"
        ];

        const promedios: Partial<PromediosAtributos> = {};

        let i = 0;
        while (i < campos.length) {
            const campo = campos[i];
            let suma = 0;
            let j = 0;
            while (j < datos.length) {
                suma = suma + Number((datos[j] as any)[campo]);
                j = j + 1;
            }
            promedios[campo] = Math.round((suma / datos.length) * 10) / 10;
            i = i + 1;
        }

        return promedios as PromediosAtributos;
    }

    public async listarComentarios(): Promise<ComentarioConDatos[]> {
        const resultado = await supabase
            .from("respuestas")
            .select("comentarios, sexo, rango_etario, created_at")
            .not("comentarios", "is", null)
            .neq("comentarios", "")
            .order("created_at", { ascending: false });

        if (resultado.error) {
            throw new Error("Error al listar comentarios: " + resultado.error.message);
        }

        let comentarios: ComentarioConDatos[] = [];
        let i = 0;
        while (i < resultado.data.length) {
            comentarios.push(resultado.data[i] as ComentarioConDatos);
            i = i + 1;
        }

        return comentarios;
    }

    public async contarTotal(): Promise<number> {
        const resultado = await supabase
            .from("respuestas")
            .select("id", { count: "exact", head: true });

        if (resultado.error) {
            throw new Error("Error al contar: " + resultado.error.message);
        }

        return resultado.count ?? 0;
    }

    public async distribucionPorSexo(): Promise<{ sexo: string; cantidad: number }[]> {
        const resultado = await supabase
            .from("respuestas")
            .select("sexo");

        if (resultado.error) {
            throw new Error("Error en distribucion por sexo: " + resultado.error.message);
        }

        const conteo: Record<string, number> = {};
        let i = 0;
        while (i < resultado.data.length) {
            const sexo = resultado.data[i].sexo;
            if (conteo[sexo] === undefined) {
                conteo[sexo] = 0;
            }
            conteo[sexo] = conteo[sexo] + 1;
            i = i + 1;
        }

        const distribucion: { sexo: string; cantidad: number }[] = [];
        const claves = Object.keys(conteo);
        let j = 0;
        while (j < claves.length) {
            distribucion.push({ sexo: claves[j], cantidad: conteo[claves[j]] });
            j = j + 1;
        }

        return distribucion;
    }

    public async distribucionPorEdad(): Promise<{ rango: string; cantidad: number }[]> {
        const resultado = await supabase
            .from("respuestas")
            .select("rango_etario");

        if (resultado.error) {
            throw new Error("Error en distribucion por edad: " + resultado.error.message);
        }

        const conteo: Record<string, number> = {};
        let i = 0;
        while (i < resultado.data.length) {
            const rango = resultado.data[i].rango_etario;
            if (conteo[rango] === undefined) {
                conteo[rango] = 0;
            }
            conteo[rango] = conteo[rango] + 1;
            i = i + 1;
        }

        const rangosOrden = ["18-25", "26-35", "36-45", "46+"];
        const distribucion: { rango: string; cantidad: number }[] = [];
        let j = 0;
        while (j < rangosOrden.length) {
            distribucion.push({ rango: rangosOrden[j], cantidad: conteo[rangosOrden[j]] ?? 0 });
            j = j + 1;
        }

        return distribucion;
    }
}