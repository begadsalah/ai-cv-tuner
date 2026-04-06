'use client';
import { useState } from 'react';
import { Zap, X, CheckCircle, Loader2, Shield, Sparkles, FileText, History } from 'lucide-react';

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: '460px', borderRadius: '20px', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', position: 'relative' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', zIndex: 1 }}>
          <X size={15} />
        </button>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(160deg, #1a1040 0%, #0f172a 100%)', padding: '2.5rem 2rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #2563EB, #7c3aed)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
            <Zap size={26} color="white" fill="white" />
          </div>

          <h2 style={{ color: 'white', fontSize: '1.55rem', fontWeight: 800, margin: '0 0 0.75rem', lineHeight: 1.25 }}>
            You've used your free analyses
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.93rem', margin: 0, lineHeight: 1.65, maxWidth: '340px', marginInline: 'auto' }}>
            Unlock the full power of AI-driven CV optimization — one payment, yours forever.
          </p>
        </div>

        <div style={{ padding: '1.75rem 2rem 2rem' }}>

          {/* Price Block */}
          <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifetime Access</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ color: 'white', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>€10</span>
                <span style={{ color: '#64748b', fontSize: '0.88rem' }}>one-time</span>
              </div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
              <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>No subscription</p>
              <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>No renewals</p>
            </div>
          </div>

          {/* What you unlock */}
          <p style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.85rem' }}>What you unlock</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.75rem' }}>
            {[
              { icon: <Zap size={15} color="#818cf8" />, title: 'Unlimited CV Optimizations', desc: 'Run as many analyses as you need, for any job post.' },
              { icon: <Sparkles size={15} color="#818cf8" />, title: 'AI Semantic Compression', desc: 'Smart 1-page fitting without losing key information.' },
              { icon: <FileText size={15} color="#818cf8" />, title: 'Full PDF Editor', desc: 'Edit every section of your optimized CV directly.' },
              { icon: <History size={15} color="#818cf8" />, title: 'Optimization History', desc: 'Revisit and restore any past CV optimization.' },
            ].map((feat) => (
              <div key={feat.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  {feat.icon}
                </div>
                <div>
                  <p style={{ color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 2px' }}>{feat.title}</p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</p>}

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
              transition: 'all 0.2s',
              opacity: loading ? 0.75 : 1,
            }}
            onMouseOver={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 10px 36px rgba(37,99,235,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting to checkout...</>
              : <><Zap size={18} fill="white" /> Get Lifetime Access — €10</>
            }
          </button>

          {/* Trust */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '0.9rem' }}>
            <Shield size={12} color="#475569" />
            <span style={{ color: '#475569', fontSize: '0.75rem' }}>Secure payment via Stripe · Instant activation · No hidden fees</span>
          </div>

        </div>
      </div>
    </div>
  );
}
