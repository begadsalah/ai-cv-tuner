'use client';
import { X, Globe, ArrowRight } from 'lucide-react';

export default function LanguageModal({ currentLang, onSelect, onClose }) {
  const languages = ['English', 'German', 'Spanish', 'French', 'Arabic'];

  return (
     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', borderRadius: '12px', background: 'var(--bg-gradient-start)', border: '1px solid var(--glass-border)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}>
             <Globe size={18} color="var(--primary)" /> Output Language
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
             <X size={20} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            Select the language you want your <strong>Optimized CV output</strong> to be written in by the AI.
          </p>

          {languages.map((l) => (
             <button 
               key={l}
               onClick={() => {
                 onSelect(l);
                 onClose();
               }}
               style={{ 
                 width: '100%', 
                 padding: '12px', 
                 display: 'flex', 
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 background: currentLang === l ? 'rgba(59, 130, 246, 0.2)' : 'var(--panel-bg)',
                 border: `1px solid ${currentLang === l ? 'var(--primary)' : 'var(--glass-border)'}`,
                 color: 'var(--text-primary)',
                 borderRadius: '8px',
                 cursor: 'pointer',
                 transition: 'all 0.2s'
               }}
             >
                <span style={{ fontWeight: currentLang === l ? 600 : 400 }}>{l}</span>
                {currentLang === l && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
}
