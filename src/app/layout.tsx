import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
          <aside className="sidebar">
            <h1>Leads API</h1>
            <nav>
              <Link href="/">Overzicht</Link>
              <Link href="/funnel">Leads funnel</Link>
              <Link href="/recruiters">Recruiters</Link>
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
