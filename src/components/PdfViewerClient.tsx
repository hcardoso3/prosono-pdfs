"use client";

import PdfViewer from "@/components/PdfViewer";

type Props = {
  url: string;
  fileName: string;
};

export default function PdfViewerClient({ url, fileName }: Props) {
  return <PdfViewer url={url} fileName={fileName} />;
}
