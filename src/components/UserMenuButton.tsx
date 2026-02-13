"use client";

import { useClerk } from "@clerk/nextjs";

export default function UserMenuButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => void signOut({ redirectUrl: "/sign-in" })}
      className="text-white hover:underline focus:outline-none focus:underline"
    >
      Terminar sessão
    </button>
  );
}
