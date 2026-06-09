import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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
        const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const facade = new ChatFacade(cliente);
        const respuesta = await facade.responder(body.mensaje);
        return NextResponse.json({ respuesta }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Error al consultar IA: " + error.message },
            { status: 500 }
        );
    }
}