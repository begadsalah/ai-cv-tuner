'use client';
import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { AlertCircle, Download, FileText, Edit3 } from 'lucide-react';
import ScoreComparison from './ScoreComparison';
import CVPreview from './CVPreview';
import CoverLetterTab from './CoverLetterTab';
import DownloadPDFAction from './DownloadPDFAction';
import OptimizedCVDocument from './OptimizedCVDocument';
import CoverLetterDocument from './CoverLetterDocument';
import PDFEditor from './PDFEditor';


export default function ResultsPanel({ results, isLoading, onProvideMoreInfo, onSetAsBase, isReoptimization }) {
  const [activeTab, setActiveTab] = useState('cv'); 
  const [showEditor, setShowEditor] = useState(false);


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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
      
      <ScoreComparison 
        original={results.scores?.match || results.match_score || results.original_score} 
        optimized={results.scores?.potential || results.potential_score || results.optimized_score} 
        improvements={results.improvements} 
        changeLog={results.visual_changes || results.change_log}
        bridgeReport={results.bridge_report}
        onProvideMoreInfo={onProvideMoreInfo}
        isReoptimization={isReoptimization}
      />

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className={`btn ${activeTab === 'cv' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => { setActiveTab('cv'); setShowEditor(false); }}
            >
              Optimized CV
            </button>
            <button 
              className={`btn ${activeTab === 'coverletter' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => { setActiveTab('coverletter'); setShowEditor(false); }}
            >
              Cover Letter
            </button>
          </div>

          {activeTab === 'cv' && !showEditor && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-glass" onClick={() => onSetAsBase(results.optimized_cv_modular)} style={{ fontSize: '0.85rem' }}>
                Use as Current CV
              </button>
              
              <button 
                className="btn"
                onClick={() => setShowEditor(true)}
                style={{ 
                  background: 'linear-gradient(135deg, var(--secondary) 0%, #3b82f6 100%)', color: 'white', fontWeight: 600,
                  padding: '10px 20px', borderRadius: '10px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                  border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}
              >
                <Edit3 size={18} /> Pro Workspace Editor
              </button>
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
            </div>
          )}
        </div>

        {/* EDITOR MOUNT POINT */}
        {/* CSS explicitly allows vertical overflow properly isolated from other absolute blocks */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {showEditor ? (
             <PDFEditor 
               initialCvData={results.optimized_cv_modular} 
               onBack={() => setShowEditor(false)} 
               defaultFileName={`Optimized_CV_${new Date().toLocaleDateString()}`}
             />
          ) : (
            activeTab === 'cv' ? (
              <div style={{ height: '600px' }}>
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
                  <OptimizedCVDocument cvData={results.optimized_cv_modular} />
                </PDFViewer>
              </div>
            ) : (
              <CoverLetterTab content={results.cover_letter} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
