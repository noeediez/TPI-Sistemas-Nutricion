import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } 
  catch { return NextResponse.json({ error: "JSON invalido" }, { status: 400 }); }

  const { destinatarios, asunto, html } = body;
  if (!destinatarios?.length) {
    return NextResponse.json({ error: "Falta destinatario" }, { status: 400 });
  }

  try {
    await Promise.all(
      destinatarios.map((mail: string) =>
        resend.emails.send({
          from: "onboarding@resend.dev",
          to: mail,
          subject: asunto || "Informe Dip & Crunch",
          html,
        })
      )
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}