import { NextRequest, NextResponse } from "next/server";
import { ChatFacade } from "backend/src/FACADE/ChatFacade";

export async function POST(request: NextRequest) {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
    }

    if (!body.mensaje) {
        return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
    }

    try {
        const facade = new ChatFacade();
        const respuesta = await facade.responder(body.mensaje);
        return NextResponse.json({ respuesta }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Error al consultar IA: " + error.message },
            { status: 500 }
        );
    }
}