'use client';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Wand2, Loader2, Moon, Globe, History, Settings, LogOut, User as UserIcon } from 'lucide-react';
import ProfileSettingsModal from './ProfileSettingsModal';
import HistoryModal from './HistoryModal';
import LanguageModal from './LanguageModal';
import { useRouter } from 'next/navigation';

export default function GlobalHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('English');
  const [isPro, setIsPro] = useState(false);
  const dropdownRef = useRef(null);
  const supabase = createClient();
  const router = useRouter();

  // On mount, apply theme + check pro status
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    const savedLang = localStorage.getItem('app_lang') || 'English';
    setTheme(savedTheme);
    setLang(savedLang);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Fetch pro status
    fetch('/api/subscription').then(r => r.json()).then(d => setIsPro(d.isPro)).catch(() => {});
  }, []);

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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsMenuOpen(false);
  };

  const handleLanguageSelect = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
    setIsMenuOpen(false);
  };

  const handleRestoreHistory = (data) => {
    window.dispatchEvent(new CustomEvent('restoreCV', { detail: data }));
    if (window.location.pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  return (
    <>
    <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--nav-bg)', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 100 }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)', padding: '6px', borderRadius: '8px', display: 'flex', boxShadow: '0 0 15px rgba(59,130,246,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', letterSpacing: '-0.03em' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>CV</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 300, color: '#94a3b8' }}>Tuner</span>
            <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 700, border: '1px solid rgba(59,130,246,0.2)', transform: 'translateY(-2px)' }}>AI</span>
          </div>
        </div>
      </Link>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {loading ? (
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Loader2 className="spinner-icon" size={16} /> Authenticating...
           </div>
        ) : user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            
            {/* Clickable Profile Badge */}
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isMenuOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '30px', border: `1px solid ${isMenuOpen ? 'var(--primary)' : isPro ? 'rgba(124,58,237,0.5)' : 'var(--glass-border)'}`, cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none', boxShadow: isPro ? '0 0 14px rgba(124,58,237,0.2)' : 'none' }}
            >
               <div style={{ position: 'relative' }}>
                 {user.user_metadata?.avatar_url ? (
                   <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'block' }} />
                 ) : (
                   <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <UserIcon size={16} color="white" />
                   </div>
                 )}
                 {isPro && (
                   <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '50%', border: '2px solid #0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Pro">
                     <span style={{ fontSize: '6px', lineHeight: 1 }}>★</span>
                   </div>
                 )}
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                   {user.user_metadata?.full_name?.split(' ')[0] || 'Pro User'}
                 </span>
                 {isPro && <span style={{ color: '#a78bfa', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1, letterSpacing: '0.05em' }}>PRO</span>}
               </div>
            </div>

            {/* Absolute Dropdown Modal */}
            {isMenuOpen && (
              <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '260px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
                
                {/* User Header Block */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', background: 'var(--panel-bg)' }}>
                  <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{user.user_metadata?.full_name || 'Pro User'}</span>
                  <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
                </div>

                {/* Utility List */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
                  
                  <button onClick={toggleTheme} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Moon size={16} color="var(--text-secondary)" /> <span style={{ fontSize: '0.9rem' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  
                  <button onClick={() => { setIsMenuOpen(false); setShowLangModal(true); }} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Globe size={16} color="var(--text-secondary)" /> <span style={{ fontSize: '0.9rem' }}>Website Language: {lang}</span>
                  </button>

                  <button onClick={() => { setIsMenuOpen(false); setShowHistoryModal(true); }} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <History size={16} color="var(--text-secondary)" /> <span style={{ fontSize: '0.9rem' }}>Optimization History</span>
                  </button>

                  <button onClick={() => { setIsMenuOpen(false); setShowSettingsModal(true); }} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Settings size={16} color="var(--text-secondary)" /> <span style={{ fontSize: '0.9rem' }}>Account Settings</span>
                  </button>

                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }}></div>

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
    {showSettingsModal && <ProfileSettingsModal user={user} onClose={() => setShowSettingsModal(false)} />}
    {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} onRestore={handleRestoreHistory} />}
    {showLangModal && <LanguageModal currentLang={lang} onSelect={handleLanguageSelect} onClose={() => setShowLangModal(false)} />}
    </>
  );
}
