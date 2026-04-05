'use client';
import { useState } from 'react';
import { X, User as UserIcon, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ProfileSettingsModal({ user, onClose }) {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        onClose();
        window.location.reload(); // Hard reload to pick up new JWT metadata globally
      }, 1500);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
             <UserIcon size={20} color="var(--primary)" /> Account Settings
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
             <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Display Name</label>
            <input 
               type="text" 
               value={fullName} 
               onChange={(e) => setFullName(e.target.value)} 
               placeholder="Your name" 
               style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Registered Email (Locked)</label>
            <input 
               type="email" 
               disabled 
               value={user.email} 
               style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b', cursor: 'not-allowed' }} 
            />
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px' }}>Email updates require OAuth synchronization.</p>
          </div>
        </div>

        {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem' }}>{successMsg}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
           <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
             {loading ? <Loader2 size={16} className="spinner-icon" /> : <Save size={16} />} Save Profile
           </button>
        </div>

      </div>
    </div>
  );
}
