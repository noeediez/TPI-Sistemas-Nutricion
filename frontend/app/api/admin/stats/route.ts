import { NextRequest, NextResponse } from "next/server";
import { DashboardFacade } from "backend/src/FACADE/DashboardFacade";

export async function GET(request: NextRequest) {
    try {
        const facade = new DashboardFacade();
        const datos = await facade.cargarDashboard();
        return NextResponse.json(datos, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Error al cargar dashboard: " + error.message },
            { status: 500 }
        );
    }
}