import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PdfViewerClient from "@/components/PdfViewerClient";

export default async function PdfViewerPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const fileName = key ? decodeURIComponent(key).split("/").pop() ?? "documento.pdf" : "documento.pdf";
  const streamUrl = `/api/pdfs/${encodeURIComponent(key)}`;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-2 flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <span className="text-slate-400">/</span>
        <span className="truncate text-sm text-slate-600" title={fileName}>
          {fileName}
        </span>
      </div>
      <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <PdfViewerClient url={streamUrl} fileName={fileName} />
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Visualização apenas. O download não está disponível.
      </p>
    </div>
  );
}
