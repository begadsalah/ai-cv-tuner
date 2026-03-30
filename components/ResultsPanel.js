'use client';
import { useState, useRef } from 'react';
import ScoreComparison from './ScoreComparison';
import CVPreview from './CVPreview';
import CoverLetterTab from './CoverLetterTab';
import DownloadPDFButton from './DownloadPDFButton';

export default function ResultsPanel({ results, isLoading }) {
  const [activeTab, setActiveTab] = useState('cv'); // 'cv' or 'coverletter'
  const cvRef = useRef(null);

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px' }}>
        <div className="spinner" style={{ width: '60px', height: '60px', borderColor: 'var(--secondary)', borderTopColor: 'transparent', marginBottom: '2rem' }}></div>
        <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 600 }}>Optimizing with AI...</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', maxWidth: '300px', textAlign: 'center' }}>
          This can take 15-30 seconds. Gemini is reviewing your skills and rewriting your CV for maximum ATS impact.
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '600px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>Upload your CV and paste a Job Description to see results.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <ScoreComparison 
        original={results.original_score} 
        optimized={results.optimized_score} 
        improvements={results.improvements} 
      />

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className={`btn ${activeTab === 'cv' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setActiveTab('cv')}
            >
              Optimized CV
            </button>
            <button 
              className={`btn ${activeTab === 'coverletter' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setActiveTab('coverletter')}
            >
              Cover Letter
            </button>
          </div>

          {activeTab === 'cv' && (
            <DownloadPDFButton targetRef={cvRef} disabled={false} />
          )}
        </div>

        {activeTab === 'cv' ? (
          <CVPreview ref={cvRef} content={results.optimized_cv} />
        ) : (
          <CoverLetterTab content={results.cover_letter} />
        )}
      </div>
    </div>
  );
}
