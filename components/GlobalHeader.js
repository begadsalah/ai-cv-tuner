'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wand2, LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function GlobalHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    fetchUser();

    // Listen to Auth State changes globally
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Wand2 size={24} color="white" />
          </div>
          <span className="text-gradient">CVTuner</span>
        </div>
      </Link>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {loading ? (
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <Loader2 className="spinner-icon" size={16} /> Authenticating...
           </div>
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* User Profile Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
               {user.user_metadata?.avatar_url && (
                 <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
               )}
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{user.user_metadata?.full_name || 'Pro User'}</span>
                 <span style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 600 }}>Active Session</span>
               </div>
            </div>

            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Pro Workspace
            </Link>

            <button 
              onClick={handleSignOut}
              className="btn" 
              style={{ padding: '8px', display: 'flex', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
            
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
             <Link href="/login" className="btn" style={{ padding: '8px 20px', background: 'transparent' }}>Log In</Link>
             <Link href="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
