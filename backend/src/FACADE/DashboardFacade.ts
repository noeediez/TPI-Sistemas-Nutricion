import { RespuestaRepository } from "../REPOSITORY/RespuestaRepository";

export type DatosDashboard = {
    totalRespuestas: number;
    promedioGeneral: number;
    mejorAtributo: string;
    peorAtributo: string;
    datosRadar: { atributo: string; puntaje: number }[];
    distribucionSexo: { sexo: string; cantidad: number; porcentaje: number }[];
    distribucionEdad: { rango: string; cantidad: number; porcentaje: number }[];
};

export class DashboardFacade {

    private repository: RespuestaRepository;

    constructor() {
        this.repository = new RespuestaRepository();
    }

    // carga todo lo que necesita el dashboard en una sola llamada
    public async cargarDashboard(): Promise<DatosDashboard> {

        const [total, promedios, distribucionSexo, distribucionEdad] = await Promise.all([
            this.repository.contarTotal(),
            this.repository.obtenerPromedios(),
            this.repository.distribucionPorSexo(),
            this.repository.distribucionPorEdad()
        ]);

        // arma los datos para el grafico de araña
        const etiquetas: Record<string, string> = {
            color_atractivo: "Color",
            apariencia_general: "Apariencia",
            dip_aspecto: "Asp. Dip",
            aroma: "Aroma",
            textura_nuggets: "Textura",
            consistencia_interna: "Consistencia",
            cremosidad_dip: "Cremosidad",
            sabor_nuggets: "Sabor",
            combinacion_sabores: "Combinación",
            intensidad_sabor: "Intensidad"
        };

        const datosRadar: { atributo: string; puntaje: number }[] = [];
        const campos = Object.keys(etiquetas);
        let i = 0;
        while (i < campos.length) {
            const campo = campos[i] as keyof typeof promedios;
            datosRadar.push({ atributo: etiquetas[campo], puntaje: promedios[campo] });
            i = i + 1;
        }

        // calcula el promedio general
        let sumaRadar = 0;
        let j = 0;
        while (j < datosRadar.length) {
            sumaRadar = sumaRadar + datosRadar[j].puntaje;
            j = j + 1;
        }
        const promedioGeneral = datosRadar.length > 0
            ? Math.round((sumaRadar / datosRadar.length) * 10) / 10
            : 0;

        // encuentra el mejor y peor atributo
        let mejorAtributo = "";
        let peorAtributo = "";
        let maxPuntaje = -1;
        let minPuntaje = 99;

        let k = 0;
        while (k < datosRadar.length) {
            if (datosRadar[k].puntaje > maxPuntaje) {
                maxPuntaje = datosRadar[k].puntaje;
                mejorAtributo = datosRadar[k].atributo;
            }
            if (datosRadar[k].puntaje < minPuntaje) {
                minPuntaje = datosRadar[k].puntaje;
                peorAtributo = datosRadar[k].atributo;
            }
            k = k + 1;
        }

        // agrega porcentaje a cada distribucion
        const sexoConPorcentaje = distribucionSexo.map(item => ({
            sexo: item.sexo,
            cantidad: item.cantidad,
            porcentaje: total > 0 ? Math.round((item.cantidad / total) * 100) : 0
        }));

        const edadConPorcentaje = distribucionEdad.map(item => ({
            rango: item.rango,
            cantidad: item.cantidad,
            porcentaje: total > 0 ? Math.round((item.cantidad / total) * 100) : 0
        }));

        return {
            totalRespuestas: total,
            promedioGeneral: promedioGeneral,
            mejorAtributo: mejorAtributo,
            peorAtributo: peorAtributo,
            datosRadar: datosRadar,
            distribucionSexo: sexoConPorcentaje,
            distribucionEdad: edadConPorcentaje
        };
    }
}