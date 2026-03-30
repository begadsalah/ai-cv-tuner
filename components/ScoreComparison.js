'use client';
import { AlertCircle } from 'lucide-react';

export default function ScoreComparison({ original, optimized, improvements }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={20} color="var(--secondary)" /> ATS Match Analysis
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Before Optimization</p>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(original) }}>
            {original}%
          </div>
        </div>
        
        <div style={{ padding: '0 1rem', color: 'var(--text-secondary)' }}>
          &#8594;
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>After Optimization</p>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(optimized) }}>
            {optimized}%
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Key Improvements Made:</h3>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {improvements && improvements.map((imp, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ color: '#10b981', flexShrink: 0 }}>&#10003;</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
