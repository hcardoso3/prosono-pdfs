import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import { listLocalPdfs, getLocalPdfStream } from "./local-pdfs";

const useLocalPdfs = process.env.USE_LOCAL_PDFS === "true";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!useLocalPdfs && (!accountId || !accessKeyId || !secretAccessKey || !bucketName)) {
  console.warn(
    "R2 env vars missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME). PDF listing/streaming will fail."
  );
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
});

export interface PdfItem {
  key: string;
  name: string;
  size: number;
  lastModified: Date | undefined;
}

export async function listPdfs(): Promise<PdfItem[]> {
  if (useLocalPdfs) return listLocalPdfs();
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: "",
  });
  const response = await r2.send(command);
  const contents = (response.Contents ?? []) as _Object[];
  return contents
    .filter((obj) => obj.Key && (obj.Key.endsWith(".pdf") || obj.Key.toLowerCase().endsWith(".pdf")))
    .map((obj) => ({
      key: obj.Key!,
      name: obj.Key!.split("/").pop() ?? obj.Key!,
      size: obj.Size ?? 0,
      lastModified: obj.LastModified,
    }))
    .sort((a, b) => (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0));
}

export async function getPdfStream(key: string): Promise<ReadableStream<Uint8Array> | null> {
  if (useLocalPdfs) return getLocalPdfStream(key);
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  const response = await r2.send(command);
  if (!response.Body) return null;
  return response.Body as ReadableStream<Uint8Array>;
}
