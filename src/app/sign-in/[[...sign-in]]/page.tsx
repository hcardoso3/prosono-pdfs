import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <SignIn
        signUpUrl={undefined}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
            footer: "hidden",
            footerAction: "hidden",
            footerActionLink: "hidden",
          },
        }}
      />
    </main>
  );
}
