import { describe, it, expect } from "vitest";
import { RespuestaBuilder } from "../src/BUILDER/RespuestaBuilder";
import { Respuesta } from "../src/Respuesta";

function builderCompleto(uuid = "uuid-test"): RespuestaBuilder {
    return new RespuestaBuilder(uuid)
        .setDatosPersonales("Juan", "Perez", "juan@example.com")
        .setDatosEvaluador("Masculino", "18-25")
        .setVista(4, 5, 3)
        .setOlfatoTextura(4, 3, 5, 2)
        .setSabor(4, 5, 3)
        .setAfectivos(4, 5, 4, 3, 4)
        .setComentarios("Muy bueno");
}

describe("RespuestaBuilder – constructor", () => {
    it("se instancia con un clientUuid", () => {
        const builder = new RespuestaBuilder("mi-uuid");
        expect(builder).toBeInstanceOf(RespuestaBuilder);
    });
});

describe("RespuestaBuilder – setDatosPersonales", () => {
    it("asigna nombre, apellido y email válidos", () => {
        const resp = builderCompleto().build();
        expect(resp.getNombre()).toBe("Juan");
        expect(resp.getApellido()).toBe("Perez");
        expect(resp.getEmail()).toBe("juan@example.com");
    });

    it("recorta espacios en nombre y apellido", () => {
        const resp = new RespuestaBuilder("uuid")
            .setDatosPersonales("  Ana  ", "  Lopez  ", "ana@test.com")
            .setDatosEvaluador("Femenino", "26-35")
            .setVista(1, 1, 1)
            .setOlfatoTextura(1, 1, 1, 1)
            .setSabor(1, 1, 1)
            .setAfectivos(1, 1, 1, 1, 1)
            .build();
        expect(resp.getNombre()).toBe("Ana");
        expect(resp.getApellido()).toBe("Lopez");
    });

    it("lanza error si nombre está vacío", () => {
        expect(() =>
            new RespuestaBuilder("uuid").setDatosPersonales("", "Perez", "a@b.com")
        ).toThrow("El nombre no puede estar vacio");
    });

    it("lanza error si apellido está vacío", () => {
        expect(() =>
            new RespuestaBuilder("uuid").setDatosPersonales("Juan", "  ", "a@b.com")
        ).toThrow("El apellido no puede estar vacio");
    });

    it("lanza error si email no tiene @", () => {
        expect(() =>
            new RespuestaBuilder("uuid").setDatosPersonales("Juan", "Perez", "sinArroba.com")
        ).toThrow("El email no tiene un formato valido");
    });

    it("lanza error si email no tiene punto", () => {
        expect(() =>
            new RespuestaBuilder("uuid").setDatosPersonales("Juan", "Perez", "sin@punto")
        ).toThrow("El email no tiene un formato valido");
    });

    it("retorna la misma instancia (fluent API)", () => {
        const builder = new RespuestaBuilder("uuid");
        const retorno = builder.setDatosPersonales("Juan", "Perez", "a@b.com");
        expect(retorno).toBe(builder);
    });
});

describe("RespuestaBuilder – setDatosEvaluador", () => {
    it.each(["Femenino", "Masculino", "Otro"])("acepta sexo válido: %s", (sexo) => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador(sexo, "18-25")
        ).not.toThrow();
    });

    it("lanza error con sexo inválido", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Alien", "18-25")
        ).toThrow("Sexo invalido");
    });

    it.each(["18-25", "26-35", "36-45", "46+"])("acepta rango etario válido: %s", (rango) => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", rango)
        ).not.toThrow();
    });

    it("lanza error con rango etario inválido", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Masculino", "100+")
        ).toThrow("Rango etario invalido");
    });
});

describe("RespuestaBuilder – setVista", () => {
    it("asigna los valores correctamente", () => {
        const resp = builderCompleto().build();
        expect(resp.getColorAtractivo()).toBe(4);
        expect(resp.getAparienciaGeneral()).toBe(5);
        expect(resp.getDipAspecto()).toBe(3);
    });

    it.each([0, 6, -1])("lanza error con puntaje fuera de rango: %i", (val) => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(val, 3, 3)
        ).toThrow("debe estar entre 1 y 5");
    });
});

describe("RespuestaBuilder – setOlfatoTextura", () => {
    it("asigna aroma, textura, consistencia y cremosidad", () => {
        const resp = builderCompleto().build();
        expect(resp.getAroma()).toBe(4);
        expect(resp.getTexturaNuggets()).toBe(3);
        expect(resp.getConsistenciaInterna()).toBe(5);
        expect(resp.getCremosidadDip()).toBe(2);
    });

    it("lanza error si algún puntaje es 0", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(3, 3, 3)
                .setOlfatoTextura(0, 3, 3, 3)
        ).toThrow("debe estar entre 1 y 5");
    });
});

describe("RespuestaBuilder – setSabor", () => {
    it("asigna sabor, combinación e intensidad", () => {
        const resp = builderCompleto().build();
        expect(resp.getSaborNuggets()).toBe(4);
        expect(resp.getCombinacionSabores()).toBe(5);
        expect(resp.getIntensidadSabor()).toBe(3);
    });

    it("lanza error si intensidad supera 5", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(3, 3, 3)
                .setOlfatoTextura(3, 3, 3, 3)
                .setSabor(3, 3, 6)
        ).toThrow("debe estar entre 1 y 5");
    });
});

describe("RespuestaBuilder – setAfectivos", () => {
    it("asigna los 5 campos afectivos", () => {
        const resp = builderCompleto().build();
        expect(resp.getSatisfaccionGeneral()).toBe(4);
        expect(resp.getConsumiria()).toBe(5);
        expect(resp.getRecomendaria()).toBe(4);
        expect(resp.getAlternativaCarnica()).toBe(3);
        expect(resp.getReemplazoAderezo()).toBe(4);
    });
});

describe("RespuestaBuilder – setComentarios", () => {
    it("asigna comentario correctamente", () => {
        const resp = builderCompleto().build();
        expect(resp.getComentarios()).toBe("Muy bueno");
    });

    it("acepta comentario vacío", () => {
        const resp = new RespuestaBuilder("uuid")
            .setDatosPersonales("A", "B", "a@b.com")
            .setDatosEvaluador("Otro", "18-25")
            .setVista(3, 3, 3)
            .setOlfatoTextura(3, 3, 3, 3)
            .setSabor(3, 3, 3)
            .setAfectivos(3, 3, 3, 3, 3)
            .setComentarios("")
            .build();
        expect(resp.getComentarios()).toBe("");
    });
});

describe("RespuestaBuilder – build", () => {
    it("retorna una instancia de Respuesta", () => {
        const resp = builderCompleto().build();
        expect(resp).toBeInstanceOf(Respuesta);
        expect(resp.getClientUuid()).toBe("uuid-test");
    });

    it("lanza error si falta setDatosPersonales", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(3, 3, 3)
                .setOlfatoTextura(3, 3, 3, 3)
                .setSabor(3, 3, 3)
                .setAfectivos(3, 3, 3, 3, 3)
                .build()
        ).toThrow("Falta:");
    });

    it("lanza error si falta setVista", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setOlfatoTextura(3, 3, 3, 3)
                .setSabor(3, 3, 3)
                .setAfectivos(3, 3, 3, 3, 3)
                .build()
        ).toThrow("Falta completar: Vista");
    });

    it("lanza error si falta setOlfatoTextura", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(3, 3, 3)
                .setSabor(3, 3, 3)
                .setAfectivos(3, 3, 3, 3, 3)
                .build()
        ).toThrow("Falta completar: Olfato y Textura");
    });

    it("lanza error si falta setSabor", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(3, 3, 3)
                .setOlfatoTextura(3, 3, 3, 3)
                .setAfectivos(3, 3, 3, 3, 3)
                .build()
        ).toThrow("Falta completar: Sabor");
    });

    it("lanza error si falta setAfectivos", () => {
        expect(() =>
            new RespuestaBuilder("uuid")
                .setDatosPersonales("A", "B", "a@b.com")
                .setDatosEvaluador("Otro", "18-25")
                .setVista(3, 3, 3)
                .setOlfatoTextura(3, 3, 3, 3)
                .setSabor(3, 3, 3)
                .build()
        ).toThrow("Falta completar: General");
    });
});
describe("Respuesta – calcularPromedioGeneral", () => {
    it("calcula el promedio de los 15 atributos correctamente", () => {
        const resp = new RespuestaBuilder("uuid")
            .setDatosPersonales("A", "B", "a@b.com")
            .setDatosEvaluador("Otro", "18-25")
            .setVista(4, 4, 4)
            .setOlfatoTextura(4, 4, 4, 4)
            .setSabor(4, 4, 4)
            .setAfectivos(4, 4, 4, 4, 4)
            .build();
        expect(resp.calcularPromedioGeneral()).toBe(4);
    });

    it("redondea a un decimal", () => {
        const resp = new RespuestaBuilder("uuid")
            .setDatosPersonales("A", "B", "a@b.com")
            .setDatosEvaluador("Otro", "18-25")
            .setVista(5, 5, 5)
            .setOlfatoTextura(5, 5, 5, 5)
            .setSabor(5, 5, 5)
            .setAfectivos(1, 1, 1, 1, 1)
            .build();
        expect(resp.calcularPromedioGeneral()).toBe(3.7);
    });
});

describe("Respuesta – toJSON", () => {
    it("retorna un objeto con todas las claves esperadas", () => {
        const resp = new RespuestaBuilder("uuid-json")
            .setDatosPersonales("Juan", "Perez", "juan@test.com")
            .setDatosEvaluador("Masculino", "26-35")
            .setVista(3, 4, 5)
            .setOlfatoTextura(3, 4, 5, 2)
            .setSabor(3, 4, 5)
            .setAfectivos(3, 4, 5, 2, 3)
            .setComentarios("ok")
            .build();
        const json = resp.toJSON() as any;
        expect(json.client_uuid).toBe("uuid-json");
        expect(json.sexo).toBe("Masculino");
        expect(json.rango_etario).toBe("26-35");
        expect(json.color_atractivo).toBe(3);
        expect(json.comentarios).toBe("ok");
    });
});

describe("Respuesta – getSexo y getRangoEtario", () => {
    it("retorna el sexo asignado", () => {
        const resp = builderCompleto().build();
        expect(resp.getSexo()).toBe("Masculino");
    });
    it("retorna el rango etario asignado", () => {
        const resp = builderCompleto().build();
        expect(resp.getRangoEtario()).toBe("18-25");
    });
});

describe("RespuestaBuilder – setDatosEvaluador – fluent API", () => {
    it("retorna la misma instancia", () => {
        const builder = new RespuestaBuilder("uuid").setDatosPersonales("A", "B", "a@b.com");
        const retorno = builder.setDatosEvaluador("Otro", "18-25");
        expect(retorno).toBe(builder);
    });
});