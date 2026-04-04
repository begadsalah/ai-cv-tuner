import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)' }}>
      {/* Left Branding Side */}
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(8,15,37,0.9) 0%, rgba(15,23,42,1) 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: 'auto' }}>
           <Sparkles size={24} color="var(--primary)" /> PremiumCV SaaS
        </h1>
        <div style={{ color: 'white' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
             Accelerate your career with AI inside our Pro Workspace.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
             Join thousands of professionals securing high-tier interviews using our ATS optimization engine.
          </p>
        </div>
      </div>

      {/* Right Login Side */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>Sign in to access your CV dashboard.</p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Email Address</label>
            <input type="email" placeholder="you@company.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Password</span>
              <a href="#" style={{ color: '#60a5fa', textDecoration: 'none' }}>Forgot?</a>
            </label>
            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <button 
            type="button"
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--secondary) 0%, #3b82f6 100%)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            Sign In Securely <ChevronRight size={16} />
          </button>

          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2rem', textAlign: 'center' }}>
            Don't have an account? <a href="#" style={{ color: 'white', fontWeight: 600 }}>Subscribe to Pro</a>
          </p>
        </form>
      </div>

    </div>
  );
}
