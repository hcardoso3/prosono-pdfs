import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPdfStream } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const rawKey = (await params).key;
  if (!rawKey) {
    return NextResponse.json({ error: "Key em falta" }, { status: 400 });
  }
  const key = decodeURIComponent(rawKey);
  try {
    const stream = await getPdfStream(key);
    if (!stream) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        // Avoid edge/browser cache so updated PDFs in R2 are served immediately
        "Cache-Control": "private, no-store, must-revalidate",
      },
    });
  } catch (e) {
    console.error("Stream PDF error:", e);
    return NextResponse.json(
      { error: "Erro ao obter documento" },
      { status: 500 }
    );
  }
}
