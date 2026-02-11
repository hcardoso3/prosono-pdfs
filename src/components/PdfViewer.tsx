"use client";

import { useState, useEffect, useRef } from "react";

// PDF.js 2.x UMD build — loaded via script tag so it never goes through webpack (avoids Object.defineProperty error)
const PDFJS_VERSION = "2.16.105";
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.js`;
const PDFJS_WORKER_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;

type Props = {
  url: string;
  fileName: string;
};

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: { data: ArrayBuffer } | string) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<PDFPage> }> };
      version: string;
    };
  }
}

type PDFPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.25;

export default function PdfViewer({ url, fileName }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading-lib" | "loading-doc" | "ready">("idle");
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<{ numPages: number; getPage: (n: number) => Promise<PDFPage> } | null>(null);

  // Load PDF.js from CDN (no webpack bundle)
  useEffect(() => {
    let cancelled = false;
    setStatus("loading-lib");
    Promise.all([
      loadScript(PDFJS_CDN),
    ])
      .then(() => {
        if (cancelled) return;
        const pdfjsLib = (window as Window).pdfjsLib;
        if (!pdfjsLib) {
          setError("PDF.js não carregou.");
          setStatus("idle");
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
        setStatus("loading-doc");
        return fetch(url, { credentials: "include" });
      })
      .then((res) => {
        if (cancelled) return;
        if (!res || !res.ok) throw new Error("Falha ao obter o PDF");
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        if (cancelled || !arrayBuffer) return;
        const pdfjsLib = (window as Window).pdfjsLib;
        if (!pdfjsLib) return;
        return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      })
      .then((pdfDoc) => {
        if (cancelled || !pdfDoc) return;
        pdfDocRef.current = pdfDoc as unknown as { numPages: number; getPage: (n: number) => Promise<PDFPage> };
        setNumPages(pdfDoc.numPages);
        setPageNumber(1);
        setError(null);
        setStatus("ready");
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message || "Não foi possível carregar o documento.");
          setStatus("idle");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Fullscreen change listener
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  // Render current page to canvas
  useEffect(() => {
    if (status !== "ready" || !pdfDocRef.current || !canvasRef.current) return;
    const pdfDoc = pdfDocRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    pdfDoc.getPage(pageNumber).then((page: PDFPage) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const renderContext = {
        canvasContext: ctx,
        viewport,
      };
      const task = page.render(renderContext);
      if (task?.promise) task.promise.catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [status, pageNumber, scale]);

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  }

  if (status === "idle" || status === "loading-lib" || status === "loading-doc") {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center text-slate-500">
        A carregar…
      </div>
    );
  }

  const zoomOut = () => setScale((s) => Math.max(MIN_ZOOM, s / ZOOM_STEP));
  const zoomIn = () => setScale((s) => Math.min(MAX_ZOOM, s * ZOOM_STEP));
  const zoomPercent = Math.round(scale * 100);

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col select-none bg-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar: zoom + fullscreen + pagination */}
      {numPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= MIN_ZOOM}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
              title="Reduzir zoom"
              aria-label="Reduzir zoom"
            >
              <ZoomOutIcon />
            </button>
            <span className="min-w-[3.5rem] text-center text-sm font-medium text-slate-600" title="Zoom">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= MAX_ZOOM}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
            >
              <ZoomInIcon />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-600">
              Página {pageNumber} de {numPages}
            </span>
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Seguinte
            </button>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
            title={isFullscreen ? "Sair do ecrã inteiro" : "Ecrã inteiro"}
            aria-label={isFullscreen ? "Sair do ecrã inteiro" : "Ecrã inteiro"}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto bg-slate-100">
        <div className="flex justify-center p-4">
          <canvas ref={canvasRef} className="shadow-md" />
        </div>
      </div>
    </div>
  );
}

function ZoomInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M8 11h6" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function FullscreenExitIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
