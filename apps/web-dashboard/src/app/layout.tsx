export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <strong style={{ fontSize: '1.2rem' }}>⚙️ Crucible</strong>
          <span style={{ marginLeft: '1rem', color: '#64748b' }}>Where engineer work becomes institutional knowledge</span>
        </nav>
        {children}
      </body>
    </html>
  );
}
