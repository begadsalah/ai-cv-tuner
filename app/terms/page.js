import Link from 'next/link';

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '760px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
        ← Back to CVTuner
      </Link>

      <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Terms of Service</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Last updated: April 2025</p>

      {[
        {
          title: '1. Acceptance of Terms',
          body: 'By creating an account or using CVTuner ("the Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.',
        },
        {
          title: '2. Description of Service',
          body: 'CVTuner is an AI-powered CV optimization tool. It uses Google Gemini AI to rewrite and improve your CV based on a provided job description. The Service is provided on a free tier (limited uses) and a paid lifetime tier.',
        },
        {
          title: '3. User Accounts',
          body: 'You must sign in via Google OAuth to use the Service. You are responsible for maintaining the security of your account. You must not share your account with others.',
        },
        {
          title: '4. Acceptable Use',
          body: 'You agree not to:\n• Use the Service to generate false or misleading CV content.\n• Attempt to circumvent usage limits or access controls.\n• Reverse engineer, scrape, or abuse the API endpoints.\n• Use the Service for any unlawful purpose.',
        },
        {
          title: '5. Payment & Refunds',
          body: 'The Lifetime Pro plan is a one-time payment of €10. Payments are processed securely by Stripe. Due to the immediate digital nature of the product (instant access granted upon payment), we do not offer refunds except where required by law.\n\nIf you experience a technical issue preventing access after payment, contact us at support@cvtuner.app within 14 days.',
        },
        {
          title: '6. AI-Generated Content',
          body: 'CVTuner uses AI to generate content. The output is a starting point — you are responsible for reviewing and verifying all generated text before using it in a job application. We do not guarantee that optimized CVs will result in interviews or job offers.',
        },
        {
          title: '7. Intellectual Property',
          body: 'You retain full ownership of your CV content and any outputs generated from it. CVTuner does not claim any rights over your data.',
        },
        {
          title: '8. Limitation of Liability',
          body: 'To the maximum extent permitted by law, CVTuner is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.',
        },
        {
          title: '9. Changes to Terms',
          body: 'We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.',
        },
        {
          title: '10. Governing Law',
          body: 'These terms are governed by German law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Germany.',
        },
        {
          title: '11. Contact',
          body: 'For any questions regarding these terms: support@cvtuner.app',
        },
      ].map((s) => (
        <div key={s.title} style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{s.body}</p>
        </div>
      ))}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
        <Link href="/privacy" style={{ color: '#475569', fontSize: '0.82rem' }}>Privacy Policy</Link>
        <Link href="/imprint" style={{ color: '#475569', fontSize: '0.82rem' }}>Imprint</Link>
      </div>
    </main>
  );
}
