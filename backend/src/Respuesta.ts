export class Respuesta { // respuestas de la encuenta

    private clientUuid: string;
    private nombre: string;
    private apellido: string;
    private email: string;
    private sexo: string;
    private rangoEtario: string;
    private colorAtractivo: number;
    private aparienciaGeneral: number;
    private dipAspecto: number;
    private aroma: number;
    private texturaNuggets: number;
    private consistenciaInterna: number;
    private cremosidadDip: number;
    private saborNuggets: number;
    private combinacionSabores: number;
    private intensidadSabor: number;
    private satisfaccionGeneral: number;
    private consumiriaNuevamente: number;
    private recomendaria: number;
    private alternativaCarnica: number;
    private reemplazoAderezo: number;
    private comentarios: string;

    constructor(
        clientUuid: string,
        nombre: string,
        apellido: string,
        email: string,
        sexo: string,
        rangoEtario: string,
        colorAtractivo: number,
        aparienciaGeneral: number,
        dipAspecto: number,
        aroma: number,
        texturaNuggets: number,
        consistenciaInterna: number,
        cremosidadDip: number,
        saborNuggets: number,
        combinacionSabores: number,
        intensidadSabor: number,
        satisfaccionGeneral: number,
        consumiriaNuevamente: number,
        recomendaria: number,
        alternativaCarnica: number,
        reemplazoAderezo: number,
        comentarios: string
    ) {
        this.clientUuid = clientUuid;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.sexo = sexo;
        this.rangoEtario = rangoEtario;
        this.colorAtractivo = colorAtractivo;
        this.aparienciaGeneral = aparienciaGeneral;
        this.dipAspecto = dipAspecto;
        this.aroma = aroma;
        this.texturaNuggets = texturaNuggets;
        this.consistenciaInterna = consistenciaInterna;
        this.cremosidadDip = cremosidadDip;
        this.saborNuggets = saborNuggets;
        this.combinacionSabores = combinacionSabores;
        this.intensidadSabor = intensidadSabor;
        this.satisfaccionGeneral = satisfaccionGeneral;
        this.consumiriaNuevamente = consumiriaNuevamente;
        this.recomendaria = recomendaria;
        this.alternativaCarnica = alternativaCarnica;
        this.reemplazoAderezo = reemplazoAderezo;
        this.comentarios = comentarios;
    }

    public getClientUuid(): string { return this.clientUuid; }
    public getNombre(): string { return this.nombre; }
    public getApellido(): string { return this.apellido; }
    public getEmail(): string { return this.email; }
    public getSexo(): string { return this.sexo; }
    public getRangoEtario(): string { return this.rangoEtario; }
    public getColorAtractivo(): number { return this.colorAtractivo; }
    public getAparienciaGeneral(): number { return this.aparienciaGeneral; }
    public getDipAspecto(): number { return this.dipAspecto; }
    public getAroma(): number { return this.aroma; }
    public getTexturaNuggets(): number { return this.texturaNuggets; }
    public getConsistenciaInterna(): number { return this.consistenciaInterna; }
    public getCremosidadDip(): number { return this.cremosidadDip; }
    public getSaborNuggets(): number { return this.saborNuggets; }
    public getCombinacionSabores(): number { return this.combinacionSabores; }
    public getIntensidadSabor(): number { return this.intensidadSabor; }
    public getSatisfaccionGeneral(): number { return this.satisfaccionGeneral; }
    public getConsumiria(): number { return this.consumiriaNuevamente; }
    public getRecomendaria(): number { return this.recomendaria; }
    public getAlternativaCarnica(): number { return this.alternativaCarnica; }
    public getReemplazoAderezo(): number { return this.reemplazoAderezo; }
    public getComentarios(): string { return this.comentarios; }

    public calcularPromedioGeneral(): number {
        const valores = [
            this.colorAtractivo, this.aparienciaGeneral, this.dipAspecto,
            this.aroma, this.texturaNuggets, this.consistenciaInterna, this.cremosidadDip,
            this.saborNuggets, this.combinacionSabores, this.intensidadSabor,
            this.satisfaccionGeneral, this.consumiriaNuevamente, this.recomendaria,
            this.alternativaCarnica, this.reemplazoAderezo
        ];
        let suma = 0;
        let i = 0;
        while (i < valores.length) {
            suma = suma + valores[i];
            i = i + 1;
        }
        return Math.round((suma / valores.length) * 10) / 10;
    }

    public toJSON(): object {
        return {
            client_uuid: this.clientUuid,
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            sexo: this.sexo,
            rango_etario: this.rangoEtario,
            color_atractivo: this.colorAtractivo,
            apariencia_general: this.aparienciaGeneral,
            dip_aspecto: this.dipAspecto,
            aroma: this.aroma,
            textura_nuggets: this.texturaNuggets,
            consistencia_interna: this.consistenciaInterna,
            cremosidad_dip: this.cremosidadDip,
            sabor_nuggets: this.saborNuggets,
            combinacion_sabores: this.combinacionSabores,
            intensidad_sabor: this.intensidadSabor,
            satisfaccion_general: this.satisfaccionGeneral,
            consumiria_nuevamente: this.consumiriaNuevamente,
            recomendaria: this.recomendaria,
            alternativa_carnica: this.alternativaCarnica,
            reemplazo_aderezo: this.reemplazoAderezo,
            comentarios: this.comentarios
        };
    }

}