'use client';
import { useState, useEffect } from 'react';
import { Play, AlertCircle, Zap, Shield } from 'lucide-react';
import UploadCV from '@/components/UploadCV';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResultsPanel from '@/components/ResultsPanel';
import GlobalHeader from '@/components/GlobalHeader';
import UpgradeModal from '@/components/UpgradeModal';

const FREE_TIER_LIMIT = 2;

export default function Dashboard() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  // Handle post-checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      setIsPro(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const handleOptimize = async (contextOverride = '') => {
    if (!cvText) { setError('Please upload and extract a CV first.'); return; }
    if (!jobDescription) { setError('Please provide a job description.'); return; }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobDescription,
          additionalContext: typeof contextOverride === 'string' && contextOverride ? contextOverride : additionalContext
        })
      });

      const data = await response.json();

      // Paywall trigger
      if (response.status === 402 || data.error === 'LIMIT_REACHED') {
        setShowUpgradeModal(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setResults(data);

      // Track usage from response
      if (data.isPro !== undefined) setIsPro(data.isPro);
      if (data.remaining !== null && data.remaining !== undefined) {
        setUsageCount(FREE_TIER_LIMIT - data.remaining);
      }

      // Save to History Cache
      try {
        const currentHistory = JSON.parse(localStorage.getItem('cv_history') || '[]');
        currentHistory.push({
          timestamp: Date.now(),
          data,
          original_score: data.original_score,
          optimized_score: data.optimized_score
        });
        if (currentHistory.length > 10) currentHistory.shift();
        localStorage.setItem('cv_history', JSON.stringify(currentHistory));
      } catch (e) { console.error('Failed to save history', e); }

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleRestore = (e) => setResults(e.detail);
    window.addEventListener('restoreCV', handleRestore);
    return () => window.removeEventListener('restoreCV', handleRestore);
  }, []);

  const remainingUses = FREE_TIER_LIMIT - usageCount;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <GlobalHeader />
      
      <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem', flex: 1 }}>

        {/* Usage Badge */}
        {!isPro && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <div
              onClick={() => setShowUpgradeModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: remainingUses <= 0
                  ? 'rgba(239,68,68,0.12)'
                  : remainingUses === 1
                  ? 'rgba(234,179,8,0.1)'
                  : 'rgba(0,0,0,0.35)',
                border: `1px solid ${remainingUses <= 0 ? 'rgba(239,68,68,0.5)' : remainingUses === 1 ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '20px',
                padding: '7px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: remainingUses <= 1 ? '0 0 16px rgba(234,179,8,0.15)' : 'none',
              }}
            >
              <Shield size={13} color={remainingUses <= 0 ? '#ef4444' : remainingUses === 1 ? '#fbbf24' : '#64748b'} />
              <span style={{ fontSize: '0.82rem', color: remainingUses <= 0 ? '#ef4444' : remainingUses === 1 ? '#fbbf24' : '#94a3b8', fontWeight: remainingUses <= 1 ? 600 : 400 }}>
                {remainingUses <= 0
                  ? '⚡ Upgrade to unlock unlimited — €10 lifetime'
                  : remainingUses === 1
                  ? `⚠️ Last free optimization · Unlock unlimited for €10`
                  : `${remainingUses} free optimizations remaining`}
              </span>
              {remainingUses > 0 && <Zap size={11} color="#f59e0b" fill="#f59e0b" />}
            </div>
          </div>
        )}

        {isPro && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '6px 14px' }}>
              <Zap size={14} color="#10b981" fill="#10b981" />
              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>Pro · Unlimited Access</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle color="#ef4444" size={20} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', flex: 1, flexDirection: 'row' }}>

          {/* Left Side: Inputs */}
          <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
            <UploadCV onTextExtracted={(text) => { setCvText(text); setResults(null); setAdditionalContext(''); }} />
            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
            
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => handleOptimize()}
              disabled={isLoading || !cvText || !jobDescription}
            >
              {isLoading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : <Play size={20} />}
              {isLoading ? 'Processing...' : 'Analyze & Optimize'}
            </button>
          </div>

          {/* Right Side: Output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ResultsPanel
              results={results}
              isLoading={isLoading}
              onProvideMoreInfo={(info) => { setAdditionalContext(info); handleOptimize(info); }}
              onSetAsBase={(text) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                setCvText(tempDiv.innerText || tempDiv.textContent || '');
                setResults(null);
              }}
            />
          </div>
        </div>

      </div>

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          usageCount={usageCount}
          limit={FREE_TIER_LIMIT}
        />
      )}

    </main>
  );
}
