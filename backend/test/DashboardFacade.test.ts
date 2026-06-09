import { describe, it, expect, vi, beforeEach } from "vitest";

const mockContarTotal          = vi.fn();
const mockObtenerPromedios     = vi.fn();
const mockDistribucionPorSexo  = vi.fn();
const mockDistribucionPorEdad  = vi.fn();

vi.mock("../src/REPOSITORY/RespuestaRepository", () => {
    return {
        RespuestaRepository: vi.fn(function(this: any) {
            this.contarTotal         = mockContarTotal;
            this.obtenerPromedios    = mockObtenerPromedios;
            this.distribucionPorSexo = mockDistribucionPorSexo;
            this.distribucionPorEdad = mockDistribucionPorEdad;
        })
    };
});
import { DashboardFacade } from "../src/FACADE/DashboardFacade";

const promediosBase = {
    color_atractivo: 4.0, apariencia_general: 3.5, dip_aspecto: 4.2,
    aroma: 3.8, textura_nuggets: 4.5, consistencia_interna: 3.0,
    cremosidad_dip: 4.1, sabor_nuggets: 5.0, combinacion_sabores: 2.0,
    intensidad_sabor: 3.7,
    satisfaccion_general: 4.0, consumiria_nuevamente: 4.0, recomendaria: 4.0,
    alternativa_carnica: 3.0, reemplazo_aderezo: 3.0
};

function configurarMocks(overrides: Partial<{
    total: number;
    promedios: object;
    sexo: { sexo: string; cantidad: number }[];
    edad: { rango: string; cantidad: number }[];
}> = {}) {
    mockContarTotal.mockResolvedValue(overrides.total ?? 10);
    mockObtenerPromedios.mockResolvedValue(overrides.promedios ?? promediosBase);
    mockDistribucionPorSexo.mockResolvedValue(overrides.sexo ?? [
        { sexo: "Femenino", cantidad: 6 },
        { sexo: "Masculino", cantidad: 4 }
    ]);
    mockDistribucionPorEdad.mockResolvedValue(overrides.edad ?? [
        { rango: "18-25", cantidad: 5 },
        { rango: "26-35", cantidad: 3 },
        { rango: "36-45", cantidad: 2 },
        { rango: "46+",   cantidad: 0 }
    ]);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("DashboardFacade - cargarDashboard - estructura", () => {
    it("retorna un objeto con todas las claves esperadas", async () => {
        configurarMocks();
        const facade = new DashboardFacade();
        const datos = await facade.cargarDashboard();
        expect(datos).toHaveProperty("totalRespuestas");
        expect(datos).toHaveProperty("promedioGeneral");
        expect(datos).toHaveProperty("mejorAtributo");
        expect(datos).toHaveProperty("peorAtributo");
        expect(datos).toHaveProperty("datosRadar");
        expect(datos).toHaveProperty("distribucionSexo");
        expect(datos).toHaveProperty("distribucionEdad");
    });
});