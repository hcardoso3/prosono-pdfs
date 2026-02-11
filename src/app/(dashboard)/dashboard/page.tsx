import Link from "next/link";
import { FileText } from "lucide-react";
import { listPdfs } from "@/lib/r2";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  let pdfs: { key: string; name: string; size: number; lastModified: Date | undefined }[] = [];
  try {
    pdfs = await listPdfs();
  } catch {
    // R2 not configured or error
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold uppercase tracking-wide text-azul">
        Documentos
      </h1>
      {pdfs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-azul/40 bg-slate-50 p-8 text-center text-azul/80">
          Ainda não há documentos disponíveis.
        </p>
      ) : (
        <ul className="space-y-2">
          {pdfs.map((pdf) => (
            <li key={pdf.key}>
              <Link
                href={`/pdf/${encodeURIComponent(pdf.key)}`}
                className="flex items-center gap-3 rounded-lg border border-azul/50 bg-white p-4 transition hover:border-azul hover:bg-slate-50/50"
              >
                <FileText className="h-5 w-5 shrink-0 text-azul" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium uppercase text-azul">
                    {pdf.name}
                  </span>
                  <span className="text-sm text-slate-600">
                    {formatSize(pdf.size)}
                    {pdf.lastModified &&
                      ` ${new Date(pdf.lastModified).toLocaleDateString("pt-PT")}`}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
