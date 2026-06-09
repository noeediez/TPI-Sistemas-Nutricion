import { describe, it, expect } from "vitest";
import { PreguntaFactory } from "../src/FACTORY/PreguntaFactory";
import { Pregunta } from "../src/Pregunta";     

describe("PreguntaFactory - crearPreguntasVista", () => {
    it("retorna exactamente 3 preguntas", () => {
        expect(PreguntaFactory.crearPreguntasVista()).toHaveLength(3);
    });
    it("los ids son los esperados", () => {
        const ids = PreguntaFactory.crearPreguntasVista().map(p => p.getId());
        expect(ids).toEqual(["color_atractivo", "apariencia_general", "dip_aspecto"]);
    });
});

describe("PreguntaFactory - crearPreguntasOlfatoTextura", () => {
    it("retorna exactamente 4 preguntas", () => {
        expect(PreguntaFactory.crearPreguntasOlfatoTextura()).toHaveLength(4);
    });
    it("los ids son los esperados", () => {
        const ids = PreguntaFactory.crearPreguntasOlfatoTextura().map(p => p.getId());
        expect(ids).toEqual(["aroma", "textura_nuggets", "consistencia_interna", "cremosidad_dip"]);
    });
});

describe("PreguntaFactory - crearPreguntasSabor", () => {
    it("retorna exactamente 3 preguntas", () => {
        expect(PreguntaFactory.crearPreguntasSabor()).toHaveLength(3);
    });
    it("los ids son los esperados", () => {
        const ids = PreguntaFactory.crearPreguntasSabor().map(p => p.getId());
        expect(ids).toEqual(["sabor_nuggets", "combinacion_sabores", "intensidad_sabor"]);
    });
});

describe("PreguntaFactory - crearPreguntasGenerales", () => {
    it("retorna exactamente 5 preguntas", () => {
        expect(PreguntaFactory.crearPreguntasGenerales()).toHaveLength(5);
    });
    it("los ids son los esperados", () => {
        const ids = PreguntaFactory.crearPreguntasGenerales().map(p => p.getId());
        expect(ids).toEqual([
            "satisfaccion_general", "consumiria_nuevamente", "recomendaria",
            "alternativa_carnica", "reemplazo_aderezo"
        ]);
    });
});

describe("PreguntaFactory - banco completo", () => {
    it("la suma total es 15", () => {
        const total =
            PreguntaFactory.crearPreguntasVista().length +
            PreguntaFactory.crearPreguntasOlfatoTextura().length +
            PreguntaFactory.crearPreguntasSabor().length +
            PreguntaFactory.crearPreguntasGenerales().length;
        expect(total).toBe(15);
    });
    it("no hay ids duplicados", () => {
        const ids = [...PreguntaFactory.crearPreguntasVista(),...PreguntaFactory.crearPreguntasOlfatoTextura(),...PreguntaFactory.crearPreguntasSabor(),...PreguntaFactory.crearPreguntasGenerales()].map(p => p.getId());
        expect(new Set(ids).size).toBe(ids.length);
    });
});
