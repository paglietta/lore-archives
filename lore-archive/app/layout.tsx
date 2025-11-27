import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lore Archives",
  description: "Track and grade movies, TV Series, anime, books, manga and comics",
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
