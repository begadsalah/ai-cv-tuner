'use client';
import { useState } from 'react';
import { Zap, X, CheckCircle, Loader2 } from 'lucide-react';

export default function UpgradeModal({ onClose, usageCount = 2, limit = 2 }) {
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        
        {/* Hero gradient strip */}
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #7c3aed)', padding: '2rem', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={16} />
          </button>
          <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Zap size={30} color="white" fill="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>You've used your free optimizations</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0 }}>You've used <strong>{usageCount}/{limit}</strong> free analyses. Upgrade to Pro for unlimited access.</p>
        </div>

        {/* Features */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              'Unlimited CV optimizations',
              'All AI compression tools unlocked',
              'PDF export with full editor',
              'Optimization History vault',
              'Priority AI processing',
            ].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" />
                <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{feat}</span>
              </div>
            ))}
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px', boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)' }}
          >
            {loading ? <Loader2 size={20} className="spinner-icon" /> : <Zap size={20} fill="white" />}
            {loading ? 'Redirecting to Checkout...' : 'Upgrade to Pro'}
          </button>

          <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
            Secure payment via Stripe · Cancel anytime
          </p>
        </div>

      </div>
    </div>
  );
}
