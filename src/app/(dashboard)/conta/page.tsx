"use client";

import { useUser, useReverification } from "@clerk/nextjs";
import { isClerkRuntimeError, isReverificationCancelledError } from "@clerk/nextjs/errors";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ContaPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const performUpdatePassword = useReverification((newPw: string) => {
    if (!user) throw new Error("Utilizador não disponível.");
    return user.updatePassword({ newPassword: newPw });
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess(false);

      if (newPassword.length < 8) {
        setError("A nova password deve ter pelo menos 8 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("A nova password e a confirmação não coincidem.");
        return;
      }

      if (!user) return;
      setLoading(true);
      try {
        await performUpdatePassword(newPassword);
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      } catch (err: unknown) {
        if (isClerkRuntimeError(err) && isReverificationCancelledError(err)) {
          setError("Verificação cancelada. Tente novamente quando quiser alterar a password.");
          return;
        }
        const rawMsg =
          err && typeof err === "object" && "errors" in err
            ? (err as { errors: Array<{ longMessage?: string }> }).errors[0]
                ?.longMessage
            : "";
        const msg = rawMsg?.toLowerCase().includes("additional verification")
          ? "É necessário verificar a sua identidade para realizar esta ação. Siga os passos no ecrã."
          : rawMsg ?? "Ocorreu um erro ao alterar a password.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [user, newPassword, confirmPassword, performUpdatePassword]
  );

  if (!isLoaded) {
    return (
      <div className="mx-auto w-full max-w-4xl py-8 text-center text-slate-500">
        A carregar…
      </div>
    );
  }

  if (!isSignedIn) {
    router.replace("/sign-in");
    return null;
  }

  if (!user.passwordEnabled) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-medium text-slate-900">Alterar password</h1>
        <p className="mt-2 text-sm text-slate-600">
          A sua conta não tem password definida (por exemplo, entrou com outro
          método). Não é possível alterar a password aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-medium text-slate-900">Alterar password</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <p className="text-sm text-slate-600">
          Ao submeter, será pedida a sua password atual no ecrã de verificação para confirmar a sua identidade.
        </p>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Nova password
          </label>
          <div className="relative mt-1">
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-slate-900 shadow-sm focus:border-laranja focus:outline-none focus:ring-1 focus:ring-laranja"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={showNew ? "Ocultar password" : "Mostrar password"}
            >
              {showNew ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Mínimo de 8 caracteres.</p>
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Confirmar nova password
          </label>
          <div className="relative mt-1">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-slate-900 shadow-sm focus:border-laranja focus:outline-none focus:ring-1 focus:ring-laranja"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={showConfirm ? "Ocultar password" : "Mostrar password"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600" role="status">
            Password alterada com sucesso.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-laranja px-4 py-2 text-sm font-medium text-white hover:bg-laranja/90 focus:outline-none focus:ring-2 focus:ring-laranja focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "A alterar…" : "Alterar password"}
        </button>
      </form>
    </div>
  );
}
