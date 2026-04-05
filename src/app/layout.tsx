import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cultivate — Shaq Hardy",
  description: "Cultivate. Grow with intention. Bible teaching and community with Shaq Hardy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
