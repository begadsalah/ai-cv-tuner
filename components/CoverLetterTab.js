'use client';

export default function CoverLetterTab({ content }) {
  if (!content) return null;
  
  return (
    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', color: 'white', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '600px', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>Generated Cover Letter</h3>
      <div style={{ fontSize: '0.95rem' }}>
        {content}
      </div>
    </div>
  );
}
