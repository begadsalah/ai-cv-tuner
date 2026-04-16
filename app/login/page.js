'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [initChecking, setInitChecking] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Listen for auth state — fires immediately when OAuth callback completes
  useEffect(() => {
    // Redirect if already logged in on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setInitChecking(false);
      }
    });

    // Also listen for the OAuth callback completing (catches single-click flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard');
      }
    });

    // BFCache ghost screen fix
    const handlePageShow = (event) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (e) {
      console.error(e.message);
      setIsAuthenticating(false);
      alert('OAuth initialization failed. Make sure your Supabase Provider is correctly setup.');
    }
  };

  if (initChecking) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--background)' }}>
         <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)' }}>
      {/* Left Branding Side */}
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(8,15,37,0.9) 0%, rgba(15,23,42,1) 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: 'auto' }}>
           <Sparkles size={24} color="var(--primary)" /> AI CV Optimizer
        </h1>
        <div style={{ color: 'white' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
             Land interviews faster with an ATS-perfect resume.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '450px', lineHeight: 1.6, marginBottom: '2rem' }}>
             Join thousands of professionals securing high-tier interviews. Upload your current CV and let our AI automatically reformat, tighten, and optimize it.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={18} color="#10b981" /> 1-Click ATS Formatting & Styling</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={18} color="#10b981" /> Smart 1-Page Content Shrinking</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={18} color="#10b981" /> Professional Visual Link Checking</li>
          </ul>
        </div>
      </div>

      {/* Right Login Side */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Access Workspace</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>Sign in directly through your Google account below.</p>
          
          <button 
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, white 0%, #f1f5f9 100%)', border: '1px solid transparent', color: '#0f172a', borderRadius: '8px', cursor: isAuthenticating ? 'wait' : 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            {isAuthenticating ? (
               <div className="spinner" style={{ width: '18px', height: '18px', borderColor: '#0f172a', borderTopColor: 'transparent', borderWidth: '2px' }}></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.5 10.74 22.38 10H12V14.26H17.92C17.65 15.65 16.8 16.84 15.6 17.65V20.35H19.16C21.24 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.96 23 17.44 22 19.16 20.35L15.6 17.65C14.64 18.3 13.4 18.66 12 18.66C9.3 18.66 7.02 16.84 6.18 14.38H2.52V17.22C4.26 20.68 7.84 23 12 23Z" fill="#34A853"/>
                <path d="M6.18 14.38C5.96 13.72 5.84 13.02 5.84 12.3C5.84 11.58 5.96 10.88 6.18 10.22V7.38H2.52C1.8 8.84 1.4 10.5 1.4 12.3C1.4 14.1 1.8 15.76 2.52 17.22L6.18 14.38Z" fill="#FBBC05"/>
                <path d="M12 5.94C13.62 5.94 15.06 6.5 16.2 7.58L19.24 4.54C17.42 2.84 14.96 1.8 12 1.8C7.84 1.8 4.26 4.12 2.52 7.38L6.18 10.22C7.02 7.76 9.3 5.94 12 5.94Z" fill="#EA4335"/>
              </svg>
            )}
            {isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}
          </button>

          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2rem', textAlign: 'center' }}>
            By signing in, you agree to our Terms of Service.
          </p>
        </div>
      </div>

    </div>
  );
}
