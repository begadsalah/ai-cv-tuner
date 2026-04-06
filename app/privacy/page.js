import Link from 'next/link';
import { Wand2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '760px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
        ← Back to CVTuner
      </Link>

      <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Last updated: April 2025</p>

      {[
        {
          title: '1. Who We Are',
          body: 'CVTuner is operated as an individual project. For contact details, see the Imprint page. When you use CVTuner, we act as the data controller for the personal data you provide.',
        },
        {
          title: '2. Data We Collect',
          body: 'We collect the minimum data required to provide the service:\n• Authentication data (name, email, profile picture) provided by Google Sign-In via Supabase Auth.\n• Subscription status (free / active) stored in our database to enforce access tiers.\n• Usage count (number of optimizations run) to enforce the free tier limit.\n\nWe do NOT store your CV text, job descriptions, or any generated output on our servers. All AI processing is performed in-memory per request and discarded immediately after.',
        },
        {
          title: '3. How We Use Your Data',
          body: 'Your data is used solely to:\n• Authenticate you and maintain your session.\n• Determine your subscription status and usage count.\n• Process your payment securely through Stripe (we never see or store card details).',
        },
        {
          title: '4. Third-Party Services',
          body: 'We use the following third-party processors:\n• Supabase — authentication and database (EU region).\n• Google Gemini API — AI text generation (data sent per-request, not retained).\n• Stripe — payment processing. Stripe\'s privacy policy applies to payment data.\n• Vercel — hosting and edge functions.',
        },
        {
          title: '5. Cookies',
          body: 'We use session cookies set by Supabase for authentication. We do not use tracking cookies or advertising cookies. Google Translate may set a language preference cookie if you use the language switcher.',
        },
        {
          title: '6. Your Rights (GDPR)',
          body: 'As an EU resident you have the right to:\n• Access the personal data we hold about you.\n• Request correction or deletion of your data.\n• Withdraw consent at any time.\n• Lodge a complaint with your national data protection authority.\n\nTo exercise any of these rights, email us at support@cvtuner.app.',
        },
        {
          title: '7. Data Retention',
          body: 'Your account data is retained for as long as your account exists. You may request deletion at any time by emailing us. Upon deletion, your authentication record and subscription row are permanently removed.',
        },
        {
          title: '8. Contact',
          body: 'For any privacy-related questions, contact: support@cvtuner.app',
        },
      ].map((s) => (
        <div key={s.title} style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{s.body}</p>
        </div>
      ))}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
        <Link href="/terms" style={{ color: '#475569', fontSize: '0.82rem' }}>Terms of Service</Link>
        <Link href="/imprint" style={{ color: '#475569', fontSize: '0.82rem' }}>Imprint</Link>
      </div>
    </main>
  );
}
