import { Respuesta } from "../Respuesta";
import { IRespuestaBuilder } from "../Interfaces/IRespuestaBuilder";

export class RespuestaBuilder implements IRespuestaBuilder {

    private clientUuid: string;
    private sexo: string | null;
    private rangoEtario: string | null;
    private colorAtractivo: number | null;
    private aparienciaGeneral: number | null;
    private dipAspecto: number | null;
    private aroma: number | null;
    private texturaNuggets: number | null;
    private consistenciaInterna: number | null;
    private cremosidadDip: number | null;
    private saborNuggets: number | null;
    private combinacionSabores: number | null;
    private intensidadSabor: number | null;
    private satisfaccionGeneral: number | null;
    private consumiriaNuevamente: number | null;
    private recomendaria: number | null;
    private alternativaCarnica: number | null;
    private reemplazoAderezo: number | null;
    private comentarios: string;

    constructor(clientUuid: string) {
        this.clientUuid = clientUuid;
        this.sexo = null;
        this.rangoEtario = null;
        this.colorAtractivo = null;
        this.aparienciaGeneral = null;
        this.dipAspecto = null;
        this.aroma = null;
        this.texturaNuggets = null;
        this.consistenciaInterna = null;
        this.cremosidadDip = null;
        this.saborNuggets = null;
        this.combinacionSabores = null;
        this.intensidadSabor = null;
        this.satisfaccionGeneral = null;
        this.consumiriaNuevamente = null;
        this.recomendaria = null;
        this.alternativaCarnica = null;
        this.reemplazoAderezo = null;
        this.comentarios = "";
    }

    private validarPuntaje(valor: number, campo: string): number {
        if (valor < 1 || valor > 5) {
            throw new Error("El puntaje de " + campo + " debe estar entre 1 y 5, se recibio: " + valor);
        }
        return valor;
    }

    private validarEmail(email: string): string {
        if (!email.includes("@") || !email.includes(".")) {
            throw new Error("El email no tiene un formato valido: " + email);
        }
        return email;
    }

    public setDatosPersonales(nombre: string, apellido: string, email: string): RespuestaBuilder {
        if (nombre.trim() === "") {
            throw new Error("El nombre no puede estar vacio");
        }
        if (apellido.trim() === "") {
            throw new Error("El apellido no puede estar vacio");
        }
        return this;
    }

    public setDatosEvaluador(sexo: string, rangoEtario: string): RespuestaBuilder {
        const sexosValidos = ["Femenino", "Masculino", "Otro"];
        let esSexoValido = false;
        let i = 0;
        while (i < sexosValidos.length) {
            if (sexosValidos[i] === sexo) {
                esSexoValido = true;
            }
            i = i + 1;
        }
        if (!esSexoValido) {
            throw new Error("Sexo invalido: " + sexo);
        }

        const rangosValidos = ["18-25", "26-35", "36-45", "46+"];
        let esRangoValido = false;
        let j = 0;
        while (j < rangosValidos.length) {
            if (rangosValidos[j] === rangoEtario) {
                esRangoValido = true;
            }
            j = j + 1;
        }
        if (!esRangoValido) {
            throw new Error("Rango etario invalido: " + rangoEtario);
        }

        this.sexo = sexo;
        this.rangoEtario = rangoEtario;
        return this;
    }

    public setVista(color: number, apariencia: number, dipAspecto: number): RespuestaBuilder {
        this.colorAtractivo = this.validarPuntaje(color, "color");
        this.aparienciaGeneral = this.validarPuntaje(apariencia, "apariencia");
        this.dipAspecto = this.validarPuntaje(dipAspecto, "aspecto del dip");
        return this;
    }

    public setOlfatoTextura(aroma: number, textura: number, consistencia: number, cremosidad: number): RespuestaBuilder {
        this.aroma = this.validarPuntaje(aroma, "aroma");
        this.texturaNuggets = this.validarPuntaje(textura, "textura");
        this.consistenciaInterna = this.validarPuntaje(consistencia, "consistencia");
        this.cremosidadDip = this.validarPuntaje(cremosidad, "cremosidad");
        return this;
    }

    public setSabor(saborNuggets: number, combinacion: number, intensidad: number): RespuestaBuilder {
        this.saborNuggets = this.validarPuntaje(saborNuggets, "sabor nuggets");
        this.combinacionSabores = this.validarPuntaje(combinacion, "combinacion");
        this.intensidadSabor = this.validarPuntaje(intensidad, "intensidad");
        return this;
    }

    public setAfectivos(satisfaccion: number, consumiria: number, recomendaria: number, alternativa: number, reemplazo: number): RespuestaBuilder {
        this.satisfaccionGeneral = this.validarPuntaje(satisfaccion, "satisfaccion general");
        this.consumiriaNuevamente = this.validarPuntaje(consumiria, "consumiria nuevamente");
        this.recomendaria = this.validarPuntaje(recomendaria, "recomendaria");
        this.alternativaCarnica = this.validarPuntaje(alternativa, "alternativa carnica");
        this.reemplazoAderezo = this.validarPuntaje(reemplazo, "reemplazo aderezo");
        return this;
    }

    public setComentarios(comentarios: string): RespuestaBuilder {
        this.comentarios = comentarios;
        return this;
    }

    public build(): Respuesta {
        if (this.sexo === null)                 throw new Error("Falta: sexo");
        if (this.rangoEtario === null)          throw new Error("Falta: rango etario");
        if (this.colorAtractivo === null)       throw new Error("Falta completar: Vista");
        if (this.aparienciaGeneral === null)    throw new Error("Falta completar: Vista");
        if (this.dipAspecto === null)           throw new Error("Falta completar: Vista");
        if (this.aroma === null)                throw new Error("Falta completar: Olfato y Textura");
        if (this.texturaNuggets === null)       throw new Error("Falta completar: Olfato y Textura");
        if (this.consistenciaInterna === null)  throw new Error("Falta completar: Olfato y Textura");
        if (this.cremosidadDip === null)        throw new Error("Falta completar: Olfato y Textura");
        if (this.saborNuggets === null)         throw new Error("Falta completar: Sabor");
        if (this.combinacionSabores === null)   throw new Error("Falta completar: Sabor");
        if (this.intensidadSabor === null)      throw new Error("Falta completar: Sabor");
        if (this.satisfaccionGeneral === null)  throw new Error("Falta completar: General");
        if (this.consumiriaNuevamente === null) throw new Error("Falta completar: General");
        if (this.recomendaria === null)         throw new Error("Falta completar: General");
        if (this.alternativaCarnica === null)   throw new Error("Falta completar: General");
        if (this.reemplazoAderezo === null)     throw new Error("Falta completar: General");

        return new Respuesta(
            this.clientUuid,
            this.sexo,
            this.rangoEtario,
            this.colorAtractivo,
            this.aparienciaGeneral,
            this.dipAspecto,
            this.aroma,
            this.texturaNuggets,
            this.consistenciaInterna,
            this.cremosidadDip,
            this.saborNuggets,
            this.combinacionSabores,
            this.intensidadSabor,
            this.satisfaccionGeneral,
            this.consumiriaNuevamente,
            this.recomendaria,
            this.alternativaCarnica,
            this.reemplazoAderezo,
            this.comentarios
        );
    }
}