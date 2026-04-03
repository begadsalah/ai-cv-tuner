'use client';
import { useState } from 'react';
import { AlertCircle, Download, FileText, Edit3 } from 'lucide-react';
import ScoreComparison from './ScoreComparison';
import CVPreview from './CVPreview';
import CoverLetterTab from './CoverLetterTab';
import DownloadPDFAction from './DownloadPDFAction';
import OptimizedCVDocument from './OptimizedCVDocument';
import CoverLetterDocument from './CoverLetterDocument';
import PDFEditor from './PDFEditor';

export default function ResultsPanel({ results, isLoading, onProvideMoreInfo, onSetAsBase }) {
  const [activeTab, setActiveTab] = useState('cv'); // 'cv' or 'coverletter'
  const [showEditor, setShowEditor] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

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
              onClick={() => {
                setActiveTab('cv');
                setShowEditor(false);
              }}
            >
              Optimized CV
            </button>
            <button 
              className={`btn ${activeTab === 'coverletter' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => {
                setActiveTab('coverletter');
                setShowEditor(false);
              }}
            >
              Cover Letter
            </button>
          </div>

          {activeTab === 'cv' && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                className="btn btn-glass"
                onClick={() => onSetAsBase(results.optimized_cv)}
                style={{ fontSize: '0.85rem' }}
              >
                Use as Current CV
              </button>
              
              <button 
                className="btn"
                onClick={() => setShowEditor(true)}
                style={{ 
                  background: 'linear-gradient(135deg, var(--secondary) 0%, #3b82f6 100%)', 
                  color: 'white',
                  fontWeight: 600,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={18} /> Edit & Customize PDF
              </button>

              <DownloadPDFAction 
                document={<OptimizedCVDocument htmlContent={results.optimized_cv} />} 
                disabled={false} 
                defaultFileName="Optimized_CV" 
              />
            </div>
          )}

          {activeTab === 'coverletter' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-glass"
                onClick={() => {
                  const filename = window.prompt("Enter file name for download:", "Cover_Letter");
                  if (!filename) return;
                  const finalName = filename.endsWith('.txt') ? filename : `${filename}.txt`;
                  const element = document.createElement("a");
                  const file = new Blob([results.cover_letter], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = finalName;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Download Text
              </button>
              <DownloadPDFAction 
                document={<CoverLetterDocument content={results.cover_letter} />} 
                disabled={false} 
                defaultFileName="Cover_Letter" 
              />
            </div>
          )}
        </div>

        {showEditor ? (
           <PDFEditor 
             htmlContent={results.optimized_cv} 
             onBack={() => setShowEditor(false)} 
             defaultFileName={`Optimized_CV_${new Date().toLocaleDateString()}`}
           />
        ) : (
          activeTab === 'cv' ? (
            <CVPreview content={results.optimized_cv} />
          ) : (
            <CoverLetterTab content={results.cover_letter} />
          )
        )}
      </div>

      {results.missing_info && results.missing_info.length > 0 && (
         <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid #f59e0b' }}>
           <h3 style={{ color: '#f59e0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertCircle size={20} /> Missing ATS Context
           </h3>
           <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
             The Job Description specifically asks for things that seem to be missing from your CV. 
             Provide answers below and generate Version 2 for a stronger match!
           </p>
           <ul style={{ color: 'white', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
             {results.missing_info.map((q, idx) => (
               <li key={idx}><strong>{q}</strong></li>
             ))}
           </ul>
           <textarea 
             value={additionalInfo}
             onChange={(e) => setAdditionalInfo(e.target.value)}
             placeholder="Type your answers here (e.g. 'I used Python for 4 years at Company X...')"
             style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', marginBottom: '1rem' }}
           />
           <button 
             className="btn btn-primary" 
             onClick={() => {
                onProvideMoreInfo(additionalInfo);
                setAdditionalInfo(''); // clear
             }}
             disabled={!additionalInfo.trim()}
           >
             Provide Info & Generate V2
           </button>
         </div>
      )}
    </div>
  );
}
