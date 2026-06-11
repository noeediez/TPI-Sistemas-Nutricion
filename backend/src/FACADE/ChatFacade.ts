import { RespuestaRepository } from "../REPOSITORY/RespuestaRepository";

export class ChatFacade {
    private repository: RespuestaRepository;
    private clienteIA: any;

    constructor(clienteIA: any) {
        this.repository = new RespuestaRepository();
        this.clienteIA = clienteIA;
    }

    public async responder(mensaje: string, historial: {rol: string, texto: string}[] = []): Promise<string> {

        const [total, promedios, distribucionSexo] = await Promise.all([
            this.repository.contarTotal(),
            this.repository.obtenerPromedios(),
            this.repository.distribucionPorSexo(),
        ]);

        const system = `Sos un asistente de análisis sensorial para el proyecto Dip & Crunch.
Tenés acceso a los resultados reales de la encuesta. Respondé en español, 
de forma clara y útil para estudiantes de nutrición.

Datos actuales:
- Total de respuestas: ${total}
- Promedios por atributo: ${JSON.stringify(promedios)}
- Distribución por sexo: ${JSON.stringify(distribucionSexo)}
Si te preguntan algo que no tiene que ver con la encuesta, redirigí la conversación al análisis sensorial.
        `;

        const messages: any[] = [
            ...historial.map(m => ({
                role: m.rol === "usuario" ? "user" : "assistant",
                content: m.texto,
            })),
            { role: "user", content: mensaje }
        ];

        const response = await this.clienteIA.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 2048,
            system,
            messages,
        });

        const bloque = response.content[0];
        if (bloque.type === "text") return bloque.text;
        return "No se pudo generar una respuesta";
    }
}