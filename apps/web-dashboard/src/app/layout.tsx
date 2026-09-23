import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crucible — Agentic Skill Factory & MCP Hub',
  description: 'Enterprise skill capture, automated adversarial evaluation, and MCP protocol integration for consulting teams.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

