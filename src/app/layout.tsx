import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptPT } from "@clerk/localizations";
import localFont from "next/font/local";
import "@fontsource/google-sans";
import "./globals.css";

const markerFelt = localFont({
  src: "../../fonts/Marker_Felt.ttf",
  variable: "--font-marker-felt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prosono PDFs",
  description: "Acesso seguro a documentos PDF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptPT}>
      <html lang="pt-PT" className={markerFelt.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
