import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Leads API — Uphill",
  description: "Recruitment leads dashboard voor Uphill",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <div className="layout">
          <div className="bg-blob-top" />
          <div className="bg-blob-bottom" />
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
