'use client';
import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { AlertCircle, Download, FileText, Edit3, ArrowRight, SkipForward } from 'lucide-react';
import ScoreComparison from './ScoreComparison';
import CVPreview from './CVPreview';
import CoverLetterTab from './CoverLetterTab';
import DownloadPDFAction from './DownloadPDFAction';
import OptimizedCVDocument from './OptimizedCVDocument';
import CoverLetterDocument from './CoverLetterDocument';
import PDFEditor from './PDFEditor';

// Interactive Step-by-Step Form for Missing ATS Context
function MissingInfoWizard({ missingQuestions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');

  const currentQuestion = missingQuestions[currentIndex];

  const handleNext = (isSkip) => {
    const newAnswers = { ...answers };
    if (!isSkip && currentInput.trim()) {
      newAnswers[currentIndex] = `Regarding "${currentQuestion}": ${currentInput}`;
    }

    if (currentIndex + 1 < missingQuestions.length) {
      setAnswers(newAnswers);
      setCurrentInput('');
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions!
      const finalAnswers = { ...newAnswers };
      const compiledContext = Object.values(finalAnswers).join('\n');
      onComplete(compiledContext); // Pass massive text string back for V2 Generation
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '400px', justifyContent: 'center' }}>
      <h3 style={{ color: '#f59e0b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
        <AlertCircle size={24} /> ATS Action Required
      </h3>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
          Step {currentIndex + 1} of {missingQuestions.length}
        </p>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
          <div style={{ height: '100%', background: '#f59e0b', borderRadius: '3px', width: `${((currentIndex + 1) / missingQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <p style={{ color: 'white', fontSize: '1.15rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {currentQuestion}
      </p>

      <textarea 
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        placeholder="Type your experience here..."
        style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}
      />
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
        <button className="btn btn-glass" onClick={() => handleNext(true)} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px' }}>
          <SkipForward size={18} /> Skip 
        </button>
        <button className="btn btn-primary" onClick={() => handleNext(false)} disabled={!currentInput.trim()} style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none' }}>
          Provide Info <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}


export default function ResultsPanel({ results, isLoading, onProvideMoreInfo, onSetAsBase }) {
  const [activeTab, setActiveTab] = useState('cv'); 
  const [showEditor, setShowEditor] = useState(false);
  
  // Manage wizard visibility explicitly
  const [wizardComplete, setWizardComplete] = useState(false);

  // If there are missing questions and we haven't completed the wizard, show the wizard!
  const hasMissingInfo = results?.missing_info && results.missing_info.length > 0;
  
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

  // WIZARD INTERCEPTOR
  if (hasMissingInfo && !wizardComplete) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ScoreComparison 
          original={results.scores?.match || results.match_score || results.original_score} 
          optimized={results.scores?.potential || results.potential_score || results.optimized_score} 
          improvements={results.improvements} 
          changeLog={results.visual_changes || results.change_log}
          bridgeReport={results.bridge_report}
          onProvideMoreInfo={onProvideMoreInfo}
        />
        <div style={{ marginTop: '1.5rem' }}>
          <MissingInfoWizard 
            missingQuestions={results.missing_info_wizard || results.missing_info}
            onComplete={(compiledContext) => {
              setWizardComplete(true);
              if (compiledContext) {
                 // Trigger V2 generation immediately if user provided context
                 onProvideMoreInfo(compiledContext); 
              }
            }}
          />
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
