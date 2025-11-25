import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lore Archives - La Tua Libreria Personale",
  description: "Traccia e valuta film, serie TV, anime, libri, manga e fumetti",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
