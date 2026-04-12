'use client';
import { useState } from 'react';
import { AlertCircle, FileText, Zap, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ScoreComparison({ original, optimized, improvements, changeLog, bridgeReport, onProvideMoreInfo, isReoptimization }) {
  const [bridgeInputs, setBridgeInputs] = useState({});
  const [currentBridgeStep, setCurrentBridgeStep] = useState(0);

  const handleBridgeInput = (idx, value) => {
    setBridgeInputs(prev => ({ ...prev, [idx]: value }));
  };

  const handleSubmitBridges = () => {
    const filledBridges = Object.entries(bridgeInputs)
      .filter(([_, val]) => val.trim() !== '')
      .map(([idx, val]) => {
        const item = bridgeReport[idx];
        return `Regarding the gap "${item.gap}": ${val}`;
      });
      
    if (filledBridges.length > 0 && onProvideMoreInfo) {
      onProvideMoreInfo(filledBridges.join('\n\n'));
    }
  };
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
                    <FileText size={14} color="#94a3b8" /> REWRITE LOGIC
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: '1 1 300px', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <XCircle size={14} /> ORIGINAL TEXT
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, textDecoration: 'line-through decoration-red-500/40' }}>
                        {change.original_text || change.original}
                      </p>
                    </div>
                    
                    <div style={{ flex: '1 1 300px', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <CheckCircle2 size={14} /> ATS OPTIMIZED
                      </div>
                      <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        {change.optimized_text || change.optimized}
                      </p>
                    </div>
                  </div>
                  {change.strategy_insight && (
                    <div style={{ padding: '12px 15px', background: 'rgba(59, 130, 246, 0.1)', borderTop: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.85rem', color: '#93c5fd', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertCircle size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>STRATEGY INSIGHT:</strong> {change.strategy_insight}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {bridgeReport && bridgeReport.length > 0 && isReoptimization && (
        <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.2) 100%)', padding: '2px', borderRadius: '16px', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
          <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.5))' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Gaps Successfully Bridged!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
              Your experience has been woven directly into the CV. The AI has re-calibrated your ATS score based on the context you provided. Review your updated CV above.
            </p>
          </div>
        </div>
      )}
      {bridgeReport && bridgeReport.length > 0 && !isReoptimization && (() => {
        const item = bridgeReport[currentBridgeStep];
        const isLast = currentBridgeStep === bridgeReport.length - 1;
        const progress = ((currentBridgeStep + 1) / bridgeReport.length) * 100;
        const isHigh = item.impact?.toLowerCase() === 'high';

        return (
          <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(239,68,68,0.3) 100%)', padding: '2px', borderRadius: '16px', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
            <div style={{ background: '#0f172a', padding: '1.75rem', borderRadius: '14px' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>
                  <AlertCircle size={20} color="#f59e0b" /> ATS Gap Required
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Step {currentBridgeStep + 1} of {bridgeReport.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '1.5rem' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '3px', width: `${progress}%`, transition: 'width 0.4s ease' }} />
              </div>

              {/* Gap Badge Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1rem', color: '#f87171', fontWeight: 700 }}>GAP: {item.gap}</span>
                {item.ui_trigger && (
                  <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 500 }}>
                    EDITOR SECTION: {item.ui_trigger.toUpperCase()}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', background: isHigh ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: isHigh ? '#fca5a5' : '#fcd34d', fontWeight: 600 }}>
                  {item.impact?.toUpperCase()} IMPACT
                </span>
              </div>

              {/* Action Suggestion */}
              <div style={{ padding: '12px 14px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', borderRadius: '6px', marginBottom: '1.25rem' }}>
                <p style={{ color: '#e2e8f0', margin: 0, fontSize: '0.93rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '3px', flexShrink: 0 }} />
                  {item.action}
                </p>
              </div>

              {/* User Input */}
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '8px' }}>
                How have you demonstrated this in your experience?
              </p>
              <textarea
                value={bridgeInputs[currentBridgeStep] || ''}
                onChange={(e) => handleBridgeInput(currentBridgeStep, e.target.value)}
                placeholder={`e.g. "I worked with ${item.gap} for 2 years at my previous company..."`}
                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.93rem', resize: 'vertical', marginBottom: '1.25rem' }}
              />

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCurrentBridgeStep(s => s > 0 ? s - 1 : s)}
                  disabled={currentBridgeStep === 0}
                  style={{ padding: '10px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: currentBridgeStep === 0 ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!isLast) {
                      setCurrentBridgeStep(s => s + 1);
                    }
                  }}
                  style={{ flex: 1, padding: '10px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: isLast ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: isLast ? 0.4 : 1 }}
                  disabled={isLast}
                >
                  Skip →
                </button>
                {!isLast ? (
                  <button
                    onClick={() => setCurrentBridgeStep(s => s + 1)}
                    disabled={!bridgeInputs[currentBridgeStep]?.trim()}
                    style={{ flex: 2, padding: '10px 18px', borderRadius: '8px', background: bridgeInputs[currentBridgeStep]?.trim() ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.04)', border: 'none', color: 'white', fontWeight: 600, cursor: bridgeInputs[currentBridgeStep]?.trim() ? 'pointer' : 'not-allowed', fontSize: '0.9rem', transition: 'all 0.2s' }}
                  >
                    Next Gap →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitBridges}
                    disabled={!Object.values(bridgeInputs).some(v => v?.trim())}
                    style={{ flex: 2, padding: '10px 18px', borderRadius: '8px', background: Object.values(bridgeInputs).some(v => v?.trim()) ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.04)', border: 'none', color: 'white', fontWeight: 600, cursor: Object.values(bridgeInputs).some(v => v?.trim()) ? 'pointer' : 'not-allowed', fontSize: '0.9rem', transition: 'all 0.2s' }}
                  >
                    ✓ Finish & Re-Optimize
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
