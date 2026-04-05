'use client';
import { X, Globe } from 'lucide-react';

const LANGUAGES = [
  { label: 'English',  code: 'en' },
  { label: 'German',   code: 'de' },
  { label: 'Spanish',  code: 'es' },
  { label: 'French',   code: 'fr' },
  { label: 'Arabic',   code: 'ar' },
  { label: 'Portuguese', code: 'pt' },
  { label: 'Italian',  code: 'it' },
  { label: 'Chinese',  code: 'zh-CN' },
];

function doGTranslate(langCode) {
  // Google Translate sets a cookie, we trigger via the hidden select element
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  } else {
    // Fallback: use the translate.google.com frame approach
    const iframe = document.querySelector('#\\:1\\.container iframe') ||
                   document.querySelector('iframe.skiptranslate');
    if (iframe) {
      try {
        iframe.contentWindow.document.querySelector(`.goog-te-combo`).value = langCode;
        iframe.contentWindow.document.querySelector(`.goog-te-combo`).dispatchEvent(new Event('change'));
      } catch(e) { console.warn('GT iframe access blocked', e); }
    }
  }
}

export default function LanguageModal({ currentLang, onSelect, onClose }) {
  const handleSelect = (lang) => {
    onSelect(lang.label);
    // Trigger actual page translation
    if (lang.code === 'en') {
      // Restore original — remove translation cookie
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.reload();
    } else {
      document.cookie = `googtrans=/en/${lang.code}`;
      document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
      doGTranslate(lang.code);
      // Small delay then reload to fully apply
      setTimeout(() => window.location.reload(), 300);
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', borderRadius: '12px', background: 'var(--bg-gradient-start)', border: '1px solid var(--glass-border)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}>
            <Globe size={18} color="var(--primary)" /> Website Language
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <div style={{ padding: '1rem 1.5rem 0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Choose the display language for the website interface. Your CV output language is detected automatically from the job post.
          </p>
        </div>

        {/* Language List */}
        <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {LANGUAGES.map((l) => {
            const isActive = currentLang === l.label;
            return (
              <button
                key={l.code}
                onClick={() => handleSelect(l)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--panel-bg)',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--glass-border)'}`,
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span>{l.label}</span>
                {isActive && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', flexShrink: 0 }}></div>}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
