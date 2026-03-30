'use client';
import { Briefcase } from 'lucide-react';

export default function JobDescriptionInput({ value, onChange }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <Briefcase size={20} color="var(--secondary)" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>Target Job Description</h2>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Paste the full details of the job you are applying for. The AI will cross-reference this to score and optimize your CV.
      </p>

      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste job description here..."
        style={{
          flex: 1,
          minHeight: '250px',
          resize: 'vertical',
          fontSize: '0.95rem',
          lineHeight: 1.5
        }}
      />
    </div>
  );
}
