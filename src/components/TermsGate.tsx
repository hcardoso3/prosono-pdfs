"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "prosono_terms_accepted";
const COOKIE_MAX_AGE_DAYS = 365;

function getAcceptedFromCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? match[1] === "1" : false;
}

function setAcceptedCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
}

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAccepted(getAcceptedFromCookie());
  }, []);

  const handleAccept = () => {
    if (!checked) return;
    setAcceptedCookie();
    setAccepted(true);
  };

  if (accepted === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-laranja border-t-transparent" />
      </div>
    );
  }

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
          <div className="border-b border-slate-200 bg-laranja px-6 py-4">
            <h2 className="font-marker-felt text-xl text-white">ProSono</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <h3 className="mb-3 font-semibold uppercase tracking-wide text-azul">
              Condições de acesso ao Manual e Guias de utilização
            </h3>
            <p className="mb-3 text-sm text-slate-700">
              Estes documentos estão protegidos por direitos de autor. A sua consulta é exclusiva para participante na formação ProSono e permitida apenas nesta plataforma.
            </p>
            <p className="mb-3 text-sm text-slate-700">
              Não é permitido copiar, reproduzir, partilhar, modificar, guardar ou descarregar (fazer download) do conteúdo, total ou parcialmente, sem autorização prévia e por escrito dos autores.
            </p>
            <p className="mb-3 text-sm text-slate-700">
              Ao continuar, confirma que:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-slate-700">
              <li>Leu e compreendeu estas condições;</li>
              <li>Aceita respeitar os direitos de autor;</li>
              <li>Não irá copiar, reproduzir ou descarregar o manual sem autorização.</li>
            </ul>
            <p className="mb-4 text-sm font-medium text-slate-800">
              O acesso ao documento depende da aceitação destes termos.
            </p>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-azul/40 bg-slate-50/50 p-3 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-azul text-laranja focus:ring-2 focus:ring-laranja focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-slate-800">
                Declaro que li e aceito as condições de acesso.
              </span>
            </label>
          </div>
          <div className="border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={handleAccept}
              disabled={!checked}
              className="w-full rounded-lg bg-laranja px-4 py-3 font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-laranja/90 focus:outline-none focus:ring-2 focus:ring-laranja focus:ring-offset-2"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
