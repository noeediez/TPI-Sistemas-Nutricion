import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/SINGLETON/SupabaseClient", () => ({
    supabase: { from: vi.fn() }
}));

import { RespuestaRepository } from "../src/REPOSITORY/RespuestaRepository";
import { RespuestaBuilder } from "../src/BUILDER/RespuestaBuilder";
import { supabase } from "../src/SINGLETON/SupabaseClient";

const mockFrom = vi.mocked(supabase.from);

function crearRespuesta() {
    return new RespuestaBuilder("uuid-123")
        .setDatosPersonales("Juan", "Perez", "juan@test.com")
        .setDatosEvaluador("Masculino", "18-25")
        .setVista(4, 5, 3)
        .setOlfatoTextura(4, 3, 5, 2)
        .setSabor(4, 5, 3)
        .setAfectivos(4, 5, 4, 3, 4)
        .setComentarios("ok")
        .build();
}

function mockChain(finalResult: object) {
    const chain: any = {};
    ["upsert","select","order","not","neq","eq"].forEach(m => { chain[m] = vi.fn(() => chain); });
    chain.then = (resolve: (value: object) => object) => Promise.resolve(finalResult).then(resolve);
    mockFrom.mockReturnValue(chain);
    return chain;
}

beforeEach(() => { vi.clearAllMocks(); });

describe("RespuestaRepository – guardar", () => {
    it("llama a supabase.from('respuestas')", async () => {
        mockChain({ error: null });
        await new RespuestaRepository().guardar(crearRespuesta());
        expect(mockFrom).toHaveBeenCalledWith("respuestas");
    });
    it("resuelve sin error", async () => {
        mockChain({ error: null });
        await expect(new RespuestaRepository().guardar(crearRespuesta())).resolves.toBeUndefined();
    });
    it("lanza error cuando Supabase falla", async () => {
        mockChain({ error: { message: "duplicate key" } });
        await expect(new RespuestaRepository().guardar(crearRespuesta())).rejects.toThrow("Error al guardar respuesta: duplicate key");
    });
});

describe("RespuestaRepository – listarTodas", () => {
    it("retorna el array de datos", async () => {
        const datos = [{ nombre: "Juan" }];
        mockChain({ data: datos, error: null });
        expect(await new RespuestaRepository().listarTodas()).toEqual(datos);
    });
    it("lanza error si Supabase falla", async () => {
        mockChain({ error: { message: "connection error" } });
        await expect(new RespuestaRepository().listarTodas()).rejects.toThrow("Error al listar respuestas: connection error");
    });
});

describe("RespuestaRepository – obtenerPromedios", () => {
    it("retorna ceros cuando no hay datos", async () => {
        mockChain({ data: [], error: null });
        const promedios = await new RespuestaRepository().obtenerPromedios();
        Object.values(promedios).forEach(v => expect(v).toBe(0));
    });
    it("lanza error si Supabase falla", async () => {
        mockChain({ error: { message: "db error" } });
        await expect(new RespuestaRepository().obtenerPromedios()).rejects.toThrow("Error al obtener promedios: db error");
    });
});

describe("RespuestaRepository – contarTotal", () => {
    it("retorna el count", async () => {
        mockChain({ count: 42, error: null });
        expect(await new RespuestaRepository().contarTotal()).toBe(42);
    });
    it("retorna 0 cuando count es null", async () => {
        mockChain({ count: null, error: null });
        expect(await new RespuestaRepository().contarTotal()).toBe(0);
    });
    it("lanza error si Supabase falla", async () => {
        mockChain({ error: { message: "timeout" } });
        await expect(new RespuestaRepository().contarTotal()).rejects.toThrow("Error al contar: timeout");
    });
});

describe("RespuestaRepository – distribucionPorSexo", () => {
    it("agrupa y cuenta correctamente", async () => {
        mockChain({ data: [{ sexo: "Femenino" },{ sexo: "Masculino" },{ sexo: "Femenino" }], error: null });
        const dist = await new RespuestaRepository().distribucionPorSexo();
        expect(dist.find(d => d.sexo === "Femenino")?.cantidad).toBe(2);
    });
    it("lanza error si Supabase falla", async () => {
        mockChain({ error: { message: "error sexo" } });
        await expect(new RespuestaRepository().distribucionPorSexo()).rejects.toThrow("Error en distribucion por sexo: error sexo");
    });
});

describe("RespuestaRepository – distribucionPorEdad", () => {
    it("devuelve los 4 rangos en orden", async () => {
        mockChain({ data: [{ rango_etario: "46+" },{ rango_etario: "18-25" }], error: null });
        const dist = await new RespuestaRepository().distribucionPorEdad();
        expect(dist.map(d => d.rango)).toEqual(["18-25","26-35","36-45","46+"]);
    });
    it("lanza error si Supabase falla", async () => {
        mockChain({ error: { message: "error edad" } });
        await expect(new RespuestaRepository().distribucionPorEdad()).rejects.toThrow("Error en distribucion por edad: error edad");
    });
});
describe("RespuestaRepository – listarComentarios", () => {
    it("retorna el array de comentarios", async () => {
        const datos = [{ comentarios: "Muy bueno", nombre: "Juan", apellido: "Perez", sexo: "Masculino", rango_etario: "18-25", created_at: "2024-01-01" }];
        mockChain({ data: datos, error: null });
        expect(await new RespuestaRepository().listarComentarios()).toEqual(datos);
    });
    it("lanza error si Supabase falla", async () => {
        mockChain({ error: { message: "error comentarios" } });
        await expect(new RespuestaRepository().listarComentarios()).rejects.toThrow("Error al listar comentarios: error comentarios");
    });
});