import { readdir, stat } from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import path from "path";

export interface PdfItem {
  key: string;
  name: string;
  size: number;
  lastModified: Date | undefined;
}

const LOCAL_PDFS_DIR =
  process.env.LOCAL_PDFS_DIR || path.join(process.cwd(), "local-pdfs");

function getDir(): string {
  return path.isAbsolute(LOCAL_PDFS_DIR)
    ? LOCAL_PDFS_DIR
    : path.join(process.cwd(), LOCAL_PDFS_DIR);
}

export async function listLocalPdfs(): Promise<PdfItem[]> {
  const dir = getDir();
  let entries: { name: string; fullPath: string }[];
  try {
    const names = await readdir(dir);
    entries = names.map((name) => ({ name, fullPath: path.join(dir, name) }));
  } catch (e) {
    return [];
  }
  const items: PdfItem[] = [];
  for (const { name, fullPath } of entries) {
    if (!name.toLowerCase().endsWith(".pdf")) continue;
    try {
      const st = await stat(fullPath);
      if (!st.isFile()) continue;
      items.push({
        key: name,
        name,
        size: st.size,
        lastModified: st.mtime,
      });
    } catch {
      // skip unreadable
    }
  }
  return items.sort(
    (a, b) => (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0)
  );
}

export async function getLocalPdfStream(
  key: string
): Promise<ReadableStream<Uint8Array> | null> {
  const dir = getDir();
  const base = path.basename(key);
  if (base !== key || base.includes("..")) return null;
  const fullPath = path.join(dir, base);
  try {
    const nodeStream = createReadStream(fullPath);
    return Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  } catch {
    return null;
  }
}
