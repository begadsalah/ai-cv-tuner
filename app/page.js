'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Wand2, FileText, TrendingUp, CheckCircle, Zap,
  Shield, Globe, ChevronRight, ArrowRight, Star,
  Upload, Brain, Download, Lock
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

const STEPS = [
  { icon: <Upload size={24} color="#818cf8" />, title: 'Upload Your CV', desc: 'Drag & drop your PDF. We extract all content automatically, including embedded links.' },
  { icon: <Brain size={24} color="#818cf8" />, title: 'Paste the Job Post', desc: 'Copy the full job description. Our AI reads it and maps every requirement to your background.' },
  { icon: <Zap size={24} color="#818cf8" />, title: 'AI Rewrites & Scores', desc: 'Gemini AI rewrites your CV to maximise ATS match score and keyword density for that specific role.' },
  { icon: <Download size={24} color="#818cf8" />, title: 'Export & Apply', desc: 'Download a clean, ATS-ready PDF. A tailored cover letter is generated in the same pass.' },
];

const FEATURES = [
  { icon: <TrendingUp size={20} color="#60a5fa" />, title: 'ATS Score Boost', desc: 'See your match score before and after — typically 30–50 points higher.' },
  { icon: <Globe size={20} color="#60a5fa" />, title: 'Auto Language Detection', desc: 'Job post in German? Your CV comes back in German. No setting needed.' },
  { icon: <FileText size={20} color="#60a5fa" />, title: 'Smart 1-Page Compression', desc: 'AI merges and tightens bullet points so everything fits without losing impact.' },
  { icon: <Shield size={20} color="#60a5fa" />, title: 'Privacy First', desc: 'Your CV data is processed in-memory and never stored on our servers.' },
  { icon: <Wand2 size={20} color="#60a5fa" />, title: 'Cover Letter Included', desc: 'Every optimization generates a tailored, role-specific cover letter automatically.' },
  { icon: <Lock size={20} color="#60a5fa" />, title: 'Secure by Default', desc: 'Google Sign-In authentication. Your account and data stay protected.' },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <GlobalHeader />

      {/* ── HERO ── */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative' }}>
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="animate-fade-in" style={{ maxWidth: '820px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', padding: '6px 14px', borderRadius: '20px', marginBottom: '2rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.03em' }}>
            <Star size={13} fill="#818cf8" /> POWERED BY GOOGLE GEMINI AI
          </div>

          <h1 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            Your CV Should Open{' '}
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Doors</span>
            , Not Get Filtered
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '620px', marginInline: 'auto' }}>
            75% of CVs are rejected by ATS software before a human reads them.
            Paste your CV and a job description — our AI rewrites it to pass every filter.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 30px rgba(37,99,235,0.4)' }}>
              <Zap size={18} fill="white" /> Optimize My CV Free
            </Link>
            <a href="#how-it-works" className="btn" style={{ fontSize: '1.05rem', padding: '14px 28px', borderRadius: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', textDecoration: 'none' }}>
              See how it works <ChevronRight size={16} />
            </a>
          </div>

          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '1.25rem' }}>
            2 free optimizations · No credit card required · Lifetime access for €10
          </p>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 5vw, 5rem)', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)' }}>
        {[
          { val: '75%', label: 'of CVs rejected before human review' },
          { val: '+34 pts', label: 'average ATS score improvement' },
          { val: '< 60s', label: 'from upload to optimized CV' },
          { val: '€10', label: 'lifetime — no subscription ever' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{s.val}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'white', margin: '0 0 1rem' }}>How It Works</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>Four steps. Under a minute from start to a fully optimized, export-ready CV.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
          {STEPS.map((step, i) => (
            <div key={step.title} className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                {step.icon}
              </div>
              <div style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>0{i + 1}</div>
              <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem' }}>{step.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'white', margin: '0 0 1rem' }}>Everything in One Pass</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>No separate tools. No manual editing. One click — everything is handled.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: '14px', padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 600, margin: '0 0 4px', fontSize: '0.92rem' }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'white', margin: '0 0 1rem' }}>Simple, Honest Pricing</h2>
        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Try it free. Upgrade once. Use it for life.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Free */}
          <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left' }}>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>Free</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>€0</div>
            {['2 CV optimizations', 'ATS score analysis', 'Cover letter', 'PDF export'].map((f) => (
              <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                <CheckCircle size={14} color="#475569" />
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{f}</span>
              </div>
            ))}
            <Link href="/dashboard" className="btn" style={{ width: '100%', marginTop: '1.25rem', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', justifyContent: 'center' }}>Get Started</Link>
          </div>

          {/* Pro */}
          <div style={{ padding: '1.75rem', textAlign: 'left', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(99,102,241,0.4)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #2563EB, #7c3aed)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>BEST VALUE</div>
            <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>Lifetime Pro</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>€10</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>one-time</span>
            </div>
            {['Unlimited optimizations', 'Everything in Free', 'AI compression tools', 'Optimization history', 'All future features'].map((f) => (
              <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                <CheckCircle size={14} color="#818cf8" />
                <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{f}</span>
              </div>
            ))}
            <Link href="/dashboard" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', textDecoration: 'none', display: 'flex', justifyContent: 'center', gap: '6px' }}>
              <Zap size={16} fill="white" /> Get Lifetime Access
            </Link>
          </div>
        </div>
        <p style={{ color: '#334155', fontSize: '0.75rem', marginTop: '1rem' }}>No subscription · No renewal · Instant access after payment</p>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ margin: '0 2rem 4rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(99,102,241,0.3)', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>Ready to get past the filter?</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.75rem' }}>Your first 2 optimizations are completely free. No card needed.</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '14px 36px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          Start Optimizing Free <ArrowRight size={18} />
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '6px', borderRadius: '6px' }}>
            <Wand2 size={16} color="white" />
          </div>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>© {new Date().getFullYear()} CVTuner. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/imprint" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>Imprint</Link>
          <a href="mailto:support@cvtuner.app" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>Support</a>
        </div>
      </footer>
    </main>
  );
}
