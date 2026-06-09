import { NextRequest, NextResponse } from "next/server";
import { RespuestaBuilder } from "backend/src/BUILDER/RespuestaBuilder";
import { RespuestaRepository } from "backend/src/REPOSITORY/RespuestaRepository";

export async function POST(request: NextRequest) {

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
    }

    if (!body.client_uuid) {
        return NextResponse.json({ error: "Falta client_uuid" }, { status: 400 });
    }

    try {
        const respuesta = new RespuestaBuilder(body.client_uuid)
            .setDatosPersonales(body.nombre ?? "Anónimo", body.apellido ?? "Anónimo", body.email ?? "sin@email.com")
            .setDatosEvaluador(body.sexo, body.rango_etario)
            .setVista(body.color_atractivo, body.apariencia_general, body.dip_aspecto)
            .setOlfatoTextura(body.aroma, body.textura_nuggets, body.consistencia_interna, body.cremosidad_dip)
            .setSabor(body.sabor_nuggets, body.combinacion_sabores, body.intensidad_sabor)
            .setAfectivos(body.satisfaccion_general, body.consumiria_nuevamente, body.recomendaria, body.alternativa_carnica, body.reemplazo_aderezo)
            .setComentarios(body.comentarios ?? "")
            .build();

        const repository = new RespuestaRepository();
        await repository.guardar(respuesta);

        return NextResponse.json(
            { mensaje: "Respuesta guardada", promedio: respuesta.calcularPromedioGeneral() },
            { status: 201 }
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 422 });
    }
}