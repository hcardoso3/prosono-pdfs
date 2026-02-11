import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listPdfs } from "@/lib/r2";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const pdfs = await listPdfs();
    return NextResponse.json(pdfs);
  } catch (e) {
    console.error("List PDFs error:", e);
    return NextResponse.json(
      { error: "Erro ao listar documentos" },
      { status: 500 }
    );
  }
}
