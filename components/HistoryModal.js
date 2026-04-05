'use client';
import { useState, useEffect } from 'react';
import { X, History as HistoryIcon, ArrowRight } from 'lucide-react';

export default function HistoryModal({ onClose, onRestore }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const rawData = localStorage.getItem('cv_history');
    if (rawData) {
      try {
        setHistory(JSON.parse(rawData).reverse()); // newest first
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to delete all optimization history?')) {
      localStorage.removeItem('cv_history');
      setHistory([]);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', background: 'var(--bg-gradient-start)', border: '1px solid var(--glass-border)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
             <HistoryIcon size={20} color="var(--primary)" /> Local Optimization History
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
             <X size={20} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No local optimization records found yet. Try running an optimization!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((record, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                       {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'Recent Optimization'}
                     </p>
                     <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                       <span>Score Shift: <strong>{record.original_score}%</strong> <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong style={{ color: '#10b981' }}>{record.optimized_score}%</strong></span>
                     </div>
                   </div>
                   <button 
                     className="btn btn-primary" 
                     style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                     onClick={() => {
                        onRestore(record.data);
                        onClose();
                     }}
                   >
                     Reload Output
                   </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={clearHistory} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer' }}>
               Clear All History
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
