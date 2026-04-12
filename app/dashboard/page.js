'use client';
import { useState, useEffect } from 'react';
import { Play, AlertCircle, Zap, Shield, Sparkles } from 'lucide-react';
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
  const [subLoading, setSubLoading] = useState(true);

  // Fetch subscription status on mount
  useEffect(() => {
    const checkSub = async () => {
      try {
        const res = await fetch('/api/subscription');
        const data = await res.json();
        setIsPro(data.isPro);
        setUsageCount(data.usageCount ?? 0);
      } catch (e) { console.error(e); }
      finally { setSubLoading(false); }
    };
    checkSub();
    // Also handle post-checkout redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      setIsPro(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    // Auto-trigger for screenshot
    if (window.location.search.includes('mock=true')) {
      setCvText('mock');
      setJobDescription('DEMO');
      setTimeout(() => handleOptimize('DEMO'), 1000);
    }
  }, []);

  const [isReoptimization, setIsReoptimization] = useState(false);

  const handleOptimize = async (contextOverride = '') => {
    if (!cvText) { setError('Please upload and extract a CV first.'); return; }
    if (!jobDescription) { setError('Please provide a job description.'); return; }

    setIsLoading(true);
    setError(null);
    // Track if this is a re-optimization pass (context provided)
    const hasContext = typeof contextOverride === 'string' && contextOverride.trim().length > 0;
    setIsReoptimization(hasContext);

    if (jobDescription.trim() === 'DEMO') {
      setTimeout(() => {
        setResults({
          scores: {
            match: 45,
            potential: 92
          },
          improvements: [
            "Weaved ATS keywords into professional summary",
            "Transformed weak verbs into powerful action statements",
            "Restructured formatting to pass parsing schemas"
          ],
          visual_changes: [
            {
              original: "i am a software engineer looking for a job to show my skills in coding.",
              optimized: "Results-driven Software Engineer with proven expertise in building scalable web applications. Adept at full-stack development seeking to drive technical excellence.",
              strategy_insight: "Replaced generic objective with an Executive Summary that maps core competencies directly to the ATS required fields."
            },
            {
              original: "did some marketing campaigns and made more sales which was good.",
              optimized: "Spearheaded digital marketing campaigns, driving a 15% increase in sales conversions over 6 months.",
              strategy_insight: "Applied active voice and quantified impact metrics to pass the automated 'Impact Assessment' filters."
            }
          ],
          missing_info_wizard: [],
          bridge_report: [
            { gap: "Adobe Analytics", action: "Translate Google Analytics 4 experience mapping equivalent concepts (eVars, Props).", impact: "High", ui_trigger: "Experience" },
            { gap: "GDPR Compliance", action: "Add explicit statement detailing data privacy governance in past projects.", impact: "High", ui_trigger: "Summary" }
          ],
          cover_letter: "Dear Hiring Manager,\n\nI am writing to express my interest...",
          optimized_cv_modular: {
            personal_info: { name: "Mock User", email: "mock@test.com" }
          }
        });
        setIsLoading(false);
      }, 500);
      return;
    }

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

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server Error (${response.status}): The AI took too long to respond due to rate limits or experienced an error.`);
      }

      // Paywall trigger
      if (response.status === 402 || data.error === 'LIMIT_REACHED') {
        setShowUpgradeModal(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      // If this was a re-optimization, forcibly suppress any new wizard questions
      // Claude may still return them despite prompt instructions — we kill them here at the code level
      if (isReoptimization || (typeof contextOverride === 'string' && contextOverride.trim().length > 0)) {
        data.missing_info_wizard = [];
        data.missing_info = [];
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
          match_score: data.scores?.match || data.match_score || data.original_score,
          potential_score: data.scores?.potential || data.potential_score || data.optimized_score
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

        {/* Subscription Status Bar */}
        {!subLoading && (
          <>
            {isPro ? (
              /* === PRO BANNER === */
              <div style={{ marginBottom: '1.5rem', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.15) 50%, rgba(16,185,129,0.1) 100%)', border: '1px solid rgba(124,58,237,0.3)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 40px rgba(124,58,237,0.1)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7c3aed, #2563EB)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,0.5)', flexShrink: 0 }}>
                    <Sparkles size={18} color="white" fill="white" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Pro Access</span>
                      <span style={{ background: 'linear-gradient(135deg, #7c3aed, #2563EB)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.05em' }}>LIFETIME</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Unlimited optimizations · All features unlocked · No restrictions</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {[
                    { label: 'Optimizations', value: '∞' },
                    { label: 'PDF Editor', value: '✓' },
                    { label: 'AI Compression', value: '✓' },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{stat.value}</p>
                      <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* === FREE TIER BADGE === */
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div
                  onClick={() => setShowUpgradeModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: remainingUses <= 0 ? 'rgba(239,68,68,0.12)' : remainingUses === 1 ? 'rgba(234,179,8,0.1)' : 'rgba(0,0,0,0.35)', border: `1px solid ${remainingUses <= 0 ? 'rgba(239,68,68,0.5)' : remainingUses === 1 ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', padding: '7px 16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: remainingUses <= 1 ? '0 0 16px rgba(234,179,8,0.15)' : 'none' }}
                >
                  <Shield size={13} color={remainingUses <= 0 ? '#ef4444' : remainingUses === 1 ? '#fbbf24' : '#64748b'} />
                  <span style={{ fontSize: '0.82rem', color: remainingUses <= 0 ? '#ef4444' : remainingUses === 1 ? '#fbbf24' : '#94a3b8', fontWeight: remainingUses <= 1 ? 600 : 400 }}>
                    {remainingUses <= 0 ? '⚡ Upgrade to unlock unlimited — €10 lifetime' : remainingUses === 1 ? '⚠️ Last free optimization · Unlock unlimited for €10' : `${remainingUses} free optimizations remaining`}
                  </span>
                  {remainingUses > 0 && <Zap size={11} color="#f59e0b" fill="#f59e0b" />}
                </div>
              </div>
            )}
          </>
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
