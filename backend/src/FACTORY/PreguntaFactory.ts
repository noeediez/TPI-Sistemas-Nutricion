import { Pregunta } from "../Pregunta";

export class PreguntaFactory {

    public static crearSliderNugget(id: string, enunciado: string, inicioEscala: string, finEscala: string): Pregunta {
        return new Pregunta(id, enunciado, inicioEscala, finEscala);
    }

    public static crearSliderPalta(id: string, enunciado: string, inicioEscala: string, finEscala: string): Pregunta {
        return new Pregunta(id, enunciado, inicioEscala, finEscala);
    }

    public static crearSliderEstrella(id: string, enunciado: string, inicioEscala: string, finEscala: string): Pregunta {
        return new Pregunta(id, enunciado, inicioEscala, finEscala);
    }

    public static crearTexto(id: string, enunciado: string): Pregunta {
        return new Pregunta(id, enunciado, "", "");
    }

    public static crearPreguntasVista(): Pregunta[] {
        const preguntas: Pregunta[] = [];
        preguntas.push(PreguntaFactory.crearSliderNugget("color_atractivo", "¿El color de los nuggets te resulta atractivo?", "Nada atractivo", "Muy atractivo"));
        preguntas.push(PreguntaFactory.crearSliderNugget("apariencia_general", "¿Cómo considerás la apariencia general del producto?", "Mala", "Excelente"));
        preguntas.push(PreguntaFactory.crearSliderPalta("dip_aspecto", "¿El dip de palta presenta un aspecto agradable?", "Desagradable", "Muy agradable"));
        return preguntas;
    }

    public static crearPreguntasOlfatoTextura(): Pregunta[] {
        const preguntas: Pregunta[] = [];
        preguntas.push(PreguntaFactory.crearSliderNugget("aroma", "¿El aroma del producto te parece agradable?", "Desagradable", "Muy agradable"));
        preguntas.push(PreguntaFactory.crearSliderNugget("textura_nuggets", "¿Cómo considerás la textura de los nuggets?", "Muy blando", "Muy crocante"));
        preguntas.push(PreguntaFactory.crearSliderNugget("consistencia_interna", "¿La consistencia interna te resulta adecuada?", "Inadecuada", "Muy adecuada"));
        preguntas.push(PreguntaFactory.crearSliderPalta("cremosidad_dip", "¿Cómo preferís la cremosidad del dip?", "Muy líquido", "Muy cremoso"));
        return preguntas;
    }

    public static crearPreguntasSabor(): Pregunta[] {
        const preguntas: Pregunta[] = [];
        preguntas.push(PreguntaFactory.crearSliderNugget("sabor_nuggets", "¿Te agradó el sabor de los nuggets?", "No me agradó", "Me encantó"));
        preguntas.push(PreguntaFactory.crearSliderPalta("combinacion_sabores", "¿El sabor del dip combina bien con los nuggets?", "Para nada", "Perfectamente"));
        preguntas.push(PreguntaFactory.crearSliderNugget("intensidad_sabor", "¿Considerás adecuada la intensidad del sabor?", "Muy suave", "Muy intenso"));
        return preguntas;
    }

    public static crearPreguntasGenerales(): Pregunta[] {
        const preguntas: Pregunta[] = [];
        preguntas.push(PreguntaFactory.crearSliderEstrella("satisfaccion_general", "¿Cuánto te gustó el producto en general?", "No me gustó", "Me encantó"));
        preguntas.push(PreguntaFactory.crearSliderEstrella("consumiria_nuevamente", "¿Consumirías este producto nuevamente?", "Definitivamente no", "Definitivamente sí"));
        preguntas.push(PreguntaFactory.crearSliderEstrella("recomendaria", "¿Recomendarías este producto a otra persona?", "No", "Con certeza"));
        preguntas.push(PreguntaFactory.crearSliderNugget("alternativa_carnica", "¿Consumirías estos nuggets como alternativa a productos cárnicos?", "Nunca", "Siempre"));
        preguntas.push(PreguntaFactory.crearSliderPalta("reemplazo_aderezo", "¿Usarías este dip como reemplazo a aderezos industriales?", "Nunca", "Siempre"));
        return preguntas;
    }
}