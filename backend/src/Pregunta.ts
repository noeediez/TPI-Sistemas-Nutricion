export class Pregunta { // preguntas de la encuesta

    private id: string;
    private enunciado: string;
    private inicioEscala: string;
    private finEscala: string;

    constructor(id: string, enunciado: string, tipo: string, inicioEscala: string = "", finEscala: string = "") {
        this.id = id;
        this.enunciado = enunciado;
        this.inicioEscala = inicioEscala;
        this.finEscala = finEscala;
    }

    public getId(): string { return this.id; }
    public getEnunciado(): string { return this.enunciado; }
    public getInicioEscala(): string { return this.inicioEscala; }
    public getFinEscala(): string { return this.finEscala; }
}