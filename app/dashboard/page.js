'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, AlertCircle } from 'lucide-react';
import UploadCV from '@/components/UploadCV';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResultsPanel from '@/components/ResultsPanel';

export default function Dashboard() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');

  const handleOptimize = async (contextOverride = '') => {
    if (!cvText) {
      setError('Please upload and extract a CV first.');
      return;
    }
    if (!jobDescription) {
      setError('Please provide a job description.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription, additionalContext: typeof contextOverride === 'string' && contextOverride ? contextOverride : additionalContext })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      const data = await response.json();
      setResults(data);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
        <Link href="/" className="btn btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 style={{ marginLeft: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Optimizer Dashboard</h1>
      </header>
      
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle color="#ef4444" size={20} />
            {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flex: 1, flexDirection: 'row' }}>
        
        {/* Left Side: Inputs */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
          <UploadCV onTextExtracted={(text) => {
             setCvText(text);
             setResults(null);
             setAdditionalContext('');
          }} />
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => handleOptimize()}
            disabled={isLoading || !cvText || !jobDescription}
          >
            {isLoading ? (
               <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
            ) : (
                <Play size={20} />
            )}
            {isLoading ? 'Processing...' : 'Analyze & Optimize'}
          </button>
        </div>
        
        {/* Right Side: Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ResultsPanel 
            results={results} 
            isLoading={isLoading} 
            onProvideMoreInfo={(info) => {
              setAdditionalContext(info);
              handleOptimize(info);
            }} 
            onSetAsBase={(text) => {
               // Extract text from HTML to set as new base
               const tempDiv = document.createElement('div');
               tempDiv.innerHTML = text;
               const plainText = tempDiv.innerText || tempDiv.textContent || '';
               setCvText(plainText);
               setResults(null); // Reset results to show the input view again
            }}
          />
        </div>
      </div>
      
    </main>
  );
}
