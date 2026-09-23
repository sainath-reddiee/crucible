import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crucible — Skill factory MCP for consulting firms",
  description:
    "One connection. Firm skills in Claude, Cursor, and any MCP client. Capture, refine, suggest.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
