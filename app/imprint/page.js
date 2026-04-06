import Link from 'next/link';

export default function ImprintPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '760px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
        ← Back to CVTuner
      </Link>

      <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Imprint</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Information according to § 5 TMG (Germany)</p>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        {[
          { label: 'Operator', value: 'Begad Ragab' },
          { label: 'Address', value: 'Mitelstraße 129\n 68169 Mannheim\nGermany' },
          { label: 'Email', value: 'begad.apple@gmail.com' },
          { label: 'VAT ID', value: 'Not applicable (small business, § 19 UStG)' },
        ].map((row) => (
          <div key={row.label} style={{ marginBottom: '1.25rem' }}>
            <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{row.label}</p>
            <p style={{ color: '#e2e8f0', fontSize: '0.92rem', whiteSpace: 'pre-line', margin: 0 }}>{row.value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Dispute Resolution</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.75 }}>
          The European Commission provides a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>https://ec.europa.eu/consumers/odr/</a><br />
          We are not obliged to participate in dispute resolution proceedings before a consumer arbitration board and do not do so voluntarily.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Liability for Content</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.75 }}>
          As a service provider, we are responsible for our own content on these pages in accordance with general legislation pursuant to § 7 Para. 1 TMG. AI-generated CV content is provided for informational purposes only.
        </p>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
        <Link href="/privacy" style={{ color: '#475569', fontSize: '0.82rem' }}>Privacy Policy</Link>
        <Link href="/terms" style={{ color: '#475569', fontSize: '0.82rem' }}>Terms of Service</Link>
      </div>
    </main>
  );
}
