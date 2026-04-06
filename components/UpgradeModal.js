'use client';
import { useState, useEffect } from 'react';
import { Zap, X, CheckCircle, Loader2, Star, Shield, Clock, TrendingUp, Users } from 'lucide-react';

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 13 });

  // Psychological urgency timer
  useEffect(() => {
    const stored = localStorage.getItem('upgrade_timer_start');
    if (!stored) localStorage.setItem('upgrade_timer_start', Date.now().toString());

    const start = parseInt(localStorage.getItem('upgrade_timer_start'));
    const sessionLength = 3 * 60 * 60 * 1000; // 3 hours in ms
    
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, sessionLength - elapsed);
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: '480px', borderRadius: '20px', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', zIndex: 1 }}>
          <X size={16} />
        </button>

        {/* Urgency Banner */}
        <div style={{ background: 'linear-gradient(90deg, #dc2626, #b91c1c)', padding: '10px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Clock size={14} color="white" />
          <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>
            Session offer expires in&nbsp;
            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </span>
          </span>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 60%)', padding: '2rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '20px', padding: '4px 12px', marginBottom: '1rem' }}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>LIFETIME ACCESS · ONE-TIME PAYMENT</span>
          </div>

          <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            Your CV is costing you<br/>
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dream job opportunities</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
            You've experienced the power. Don't let a paywall stand between you and your next career move.
          </p>
        </div>

        {/* Social Proof Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {[
            { icon: <Users size={14} color="#60a5fa" />, stat: '2,400+', label: 'CVs Optimized' },
            { icon: <TrendingUp size={14} color="#10b981" />, stat: '+34%', label: 'Avg ATS Score Boost' },
            { icon: <Star size={14} color="#fbbf24" fill="#fbbf24" />, stat: '4.9/5', label: 'User Rating' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                {item.icon}
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{item.stat}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div style={{ padding: '1.5rem 2rem' }}>
          
          {/* Price Anchor */}
          <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'line-through' }}>€120/year</span>
              <div style={{ background: '#dc2626', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>92% OFF</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ color: 'white', fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>€10</span>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>forever</span>
            </div>
            <p style={{ color: '#60a5fa', fontSize: '0.8rem', margin: '4px 0 0', fontWeight: 500 }}>
              Pay once. Use forever. No subscription trap.
            </p>
          </div>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {[
              { text: 'Unlimited AI CV optimizations', hot: true },
              { text: 'ATS score boosting for any job post', hot: false },
              { text: 'Automatic language detection (30+ languages)', hot: false },
              { text: 'Full PDF editor with smart compression', hot: false },
              { text: 'Optimization history vault', hot: false },
              { text: 'All future features — included', hot: true },
            ].map((feat) => (
              <div key={feat.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span style={{ color: feat.hot ? '#e2e8f0' : '#94a3b8', fontSize: '0.88rem', fontWeight: feat.hot ? 500 : 400 }}>
                  {feat.text}
                  {feat.hot && <span style={{ marginLeft: '6px', background: 'rgba(234,179,8,0.15)', color: '#fbbf24', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>POPULAR</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic', margin: '0 0 6px', lineHeight: 1.5 }}>
              "Got shortlisted for 3 interviews within a week of using this. My ATS score went from 41% to 89%."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 700 }}>M</div>
              <span style={{ color: '#64748b', fontSize: '0.76rem' }}>Mia K. · Software Engineer, Berlin</span>
              <div style={{ display: 'flex', gap: '1px', marginLeft: 'auto' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={10} color="#fbbf24" fill="#fbbf24" />)}
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</p>}

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.05rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 30px rgba(37,99,235,0.5)',
              transform: 'translateY(0)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
              opacity: loading ? 0.8 : 1,
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,99,235,0.65)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading
              ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting...</>
              : <><Zap size={20} fill="white" /> Get Lifetime Access — €10</>
            }
          </button>

          {/* Trust signals */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} color="#64748b" />
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Secure Stripe checkout</span>
            </div>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#334155' }}></div>
            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>No recurring charges</span>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#334155' }}></div>
            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Instant access</span>
          </div>

        </div>

      </div>
    </div>
  );
}
