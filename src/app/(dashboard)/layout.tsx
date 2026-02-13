import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-laranja">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="font-marker-felt text-xl font-normal text-white"
          >
            ProSono PDF&apos;s
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </div>
      </header>
      <main className="mx-auto max-w-4xl flex-1 w-full px-4 py-8">{children}</main>
      <footer className="py-4 text-center text-xs font-light text-slate-400">
        DESENVOLVIDO POR PORTA 18
      </footer>
    </div>
  );
}
