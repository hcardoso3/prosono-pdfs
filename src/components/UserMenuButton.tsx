"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function UserMenuButton() {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open, close]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-white hover:underline focus:outline-none focus:underline inline-flex items-center gap-1"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Conta
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[180px] rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
          role="menu"
        >
          <Link
            href="/conta"
            onClick={close}
            className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            Alterar password
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: "/sign-in" })}
            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            Terminar sessão
          </button>
        </div>
      )}
    </div>
  );
}
