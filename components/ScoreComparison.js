'use client';
import { AlertCircle, FileText, Zap, XCircle, CheckCircle2 } from 'lucide-react';

export default function ScoreComparison({ original, optimized, improvements, changeLog, bridgeReport }) {
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
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Match Score</p>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(original) }}>
            {original}%
          </div>
        </div>
        
        <div style={{ padding: '0 1rem', color: 'var(--text-secondary)' }}>
          &#8594;
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Potential Score</p>
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

      {changeLog && changeLog.length > 0 && (
        <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(16,185,129,0.5) 100%)', padding: '2px', borderRadius: '16px', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
          <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '14px', height: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 10px rgba(59,130,246,0.5)' }}>
              <Zap size={22} color="#60a5fa" fill="#60a5fa" /> AI Rewrite Highlights
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Review the most impactful rewrites the AI performed below. The AI preserved your facts entirely but strictly optimized formatting and keyword density to bypass ATS filters.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {changeLog.map((change, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                  <div style={{ padding: '10px 15px', background: 'linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.2))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <FileText size={14} color="#94a3b8" /> {change.type}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: '1 1 300px', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <XCircle size={14} /> ORIGINAL TEXT
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, textDecoration: 'line-through decoration-red-500/40' }}>
                        {change.original_text}
                      </p>
                    </div>
                    
                    <div style={{ flex: '1 1 300px', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <CheckCircle2 size={14} /> ATS OPTIMIZED
                      </div>
                      <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        {change.optimized_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {bridgeReport && bridgeReport.length > 0 && (
        <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(239,68,68,0.3) 100%)', padding: '2px', borderRadius: '16px', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
          <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '14px', height: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>
              <AlertCircle size={22} color="#f59e0b" /> Strategic Career Bridge Report
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We identified critical skill gaps between your current experience and the Target Job Description. Follow these precise steps to bridge your application potential.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bridgeReport.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1rem', color: '#f87171', fontWeight: 700 }}>
                      GAP: {item.gap}
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: item.impact.toLowerCase() === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: item.impact.toLowerCase() === 'high' ? '#fca5a5' : '#fcd34d', fontWeight: 600 }}>
                      {item.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderLeft: '3px solid #10b981', borderRadius: '4px' }}>
                    <p style={{ color: '#e2e8f0', margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
