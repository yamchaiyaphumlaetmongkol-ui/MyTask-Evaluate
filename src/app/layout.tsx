import type { Metadata } from "next";
import { BootstrapScripts } from "@/components/providers/BootstrapScripts";
import "./globals.css";

export const metadata: Metadata = {
  title: "SS-Evaluate",
  description: "SS-Evaluate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className="d-flex flex-column min-vh-100"
        suppressHydrationWarning
      >
        {children}
        <BootstrapScripts />
      </body>
    </html>
  );
}
