'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Wand2, Loader2, Moon, Globe, History, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function GlobalHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 100 }}>
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
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            
            {/* Clickable Profile Badge */}
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isMenuOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '30px', border: `1px solid ${isMenuOpen ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' }}
            >
               {user.user_metadata?.avatar_url ? (
                 <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
               ) : (
                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <UserIcon size={16} color="white" />
                 </div>
               )}
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                   {user.user_metadata?.full_name?.split(' ')[0] || 'Pro User'}
                 </span>
               </div>
            </div>

            {/* Absolute Dropdown Modal */}
            {isMenuOpen && (
              <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '260px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
                
                {/* User Header Block */}
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ display: 'block', color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{user.user_metadata?.full_name || 'Pro User'}</span>
                  <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
                </div>

                {/* Utility List */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
                  
                  <button onClick={() => alert('Theme module staged for future update.')} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Moon size={16} color="#94a3b8" /> <span style={{ fontSize: '0.9rem' }}>Dark Mode</span>
                  </button>
                  
                  <button onClick={() => alert('Localization staged for future update.')} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Globe size={16} color="#94a3b8" /> <span style={{ fontSize: '0.9rem' }}>Language: English</span>
                  </button>

                  <button onClick={() => alert('CV History API staged for future update.')} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <History size={16} color="#94a3b8" /> <span style={{ fontSize: '0.9rem' }}>Optimization History</span>
                  </button>

                  <button onClick={() => alert('Profile Management staged for future update.')} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Settings size={16} color="#94a3b8" /> <span style={{ fontSize: '0.9rem' }}>Account Settings</span>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }}></div>

                  <button onClick={handleSignOut} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={16} /> <span style={{ fontSize: '0.9rem' }}>Sign Out</span>
                  </button>

                </div>
              </div>
            )}
            
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
