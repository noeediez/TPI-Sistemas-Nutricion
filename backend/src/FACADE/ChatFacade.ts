import { RespuestaRepository } from "../REPOSITORY/RespuestaRepository";

export class ChatFacade {
    private repository: RespuestaRepository;
    private clienteIA: any;

    constructor(clienteIA: any) {
        this.repository = new RespuestaRepository();
        this.clienteIA = clienteIA;
    }

    public async responder(mensaje: string): Promise<string> {

        const [total, promedios, distribucionSexo] = await Promise.all([
            this.repository.contarTotal(),
            this.repository.obtenerPromedios(),
            this.repository.distribucionPorSexo(),
        ]);

        const prompt = `Sos un asistente de análisis sensorial para el proyecto Dip & Crunch.
Tenés acceso a los resultados reales de la encuesta. Respondé en español, 
de forma clara y útil para estudiantes de nutrición.

Datos actuales:
- Total de respuestas: ${total}
- Promedios por atributo: ${JSON.stringify(promedios)}
- Distribución por sexo: ${JSON.stringify(distribucionSexo)}
        `;

        const response = await this.clienteIA.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }]
        });

        const bloque = response.content[0];
        if (bloque.type === "text") return bloque.text;
        return "No se pudo generar una respuesta";
    }
}