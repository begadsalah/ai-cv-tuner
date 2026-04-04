'use client';
import React, { useState, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download, Maximize2, Edit3, Settings, ChevronLeft, AlignLeft } from 'lucide-react';
import OptimizedCVDocument from './OptimizedCVDocument';

const PDFEditor = ({ htmlContent, defaultFileName = 'Optimized_CV', onBack }) => {
  const [activeTab, setActiveTab] = useState('layout'); // 'layout' or 'content'
  const [editedContent, setEditedContent] = useState(htmlContent);
  
  // Expose advanced layout settings targeting Problem 2
  const [settings, setSettings] = useState({
    fontSize: 10.5,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 40,
    marginRight: 40,
    lineSpacing: 1.4,
    sectionSpacing: 12,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEditedContent(htmlContent);
  }, [htmlContent]);

  // Handle Safe Blob Implementation (Problem 5: Standard compliance)
  const handleDownload = async () => {
    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      // 1. Generate Blob natively from @react-pdf
      const generatedBlob = await pdf(
        <OptimizedCVDocument htmlContent={editedContent} settings={settings} />
      ).toBlob();
      
      // 2. Explicitly cast as application/pdf to guarantee OS file handler compliance
      const safeBlob = new Blob([generatedBlob], { type: 'application/pdf' });
      
      // 3. Create anchor, trigger download, execute safe memory cleanup
      const url = URL.createObjectURL(safeBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFitOnePage = () => {
    setSettings({
      fontSize: 8.5,
      marginTop: 20,
      marginBottom: 30,
      marginLeft: 25,
      marginRight: 25,
      lineSpacing: 1.2,
      sectionSpacing: 8,
    });
  };

  const handleStandardTwoPage = () => {
    setSettings({
      fontSize: 11,
      marginTop: 40,
      marginBottom: 50,
      marginLeft: 45,
      marginRight: 45,
      lineSpacing: 1.6,
      sectionSpacing: 16,
    });
  };

  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', color: 'white' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronLeft size={18} /> Back
        </button>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('layout')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: activeTab === 'layout' ? 'var(--secondary)' : 'transparent',
              color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
            }}
          >
            <Settings size={14} /> Layout Editor
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: activeTab === 'content' ? 'var(--secondary)' : 'transparent',
              color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
            }}
          >
            <Edit3 size={14} /> Content Text
          </button>
        </div>

        <button onClick={handleDownload} disabled={isExporting} className="btn btn-primary" style={{ background: 'var(--secondary)', border: 'none' }}>
           {isExporting ? 'Exporting...' : 'Save & Download'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '650px' }}>
        {/* Editor Sidebar */}
        <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {activeTab === 'layout' ? (
              <>
                <h4 style={{ marginBottom: '1.5rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlignLeft size={16} /> Advanced Typography
                </h4>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    Font Size: {settings.fontSize.toFixed(1)}pt
                  </label>
                  <input type="range" min="7" max="14" step="0.5" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: parseFloat(e.target.value)})} style={{ width: '100%' }} />
                </div>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    Line Spacing: {settings.lineSpacing.toFixed(1)}x
                  </label>
                  <input type="range" min="1" max="2.5" step="0.1" value={settings.lineSpacing} onChange={(e) => setSettings({...settings, lineSpacing: parseFloat(e.target.value)})} style={{ width: '100%' }} />
                </div>
                
                <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    Section Spacing: {settings.sectionSpacing}px
                  </label>
                  <input type="range" min="0" max="30" step="1" value={settings.sectionSpacing} onChange={(e) => setSettings({...settings, sectionSpacing: parseInt(e.target.value)})} style={{ width: '100%' }} />
                </div>

                <h4 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Page Margins</h4>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    Top / Bottom: {settings.marginTop}px
                  </label>
                  <input type="range" min="10" max="100" step="1" value={settings.marginTop} onChange={(e) => setSettings({...settings, marginTop: parseInt(e.target.value), marginBottom: parseInt(e.target.value)})} style={{ width: '100%' }} />
                </div>
                
                <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    Left / Right: {settings.marginLeft}px
                  </label>
                  <input type="range" min="10" max="100" step="1" value={settings.marginLeft} onChange={(e) => setSettings({...settings, marginLeft: parseInt(e.target.value), marginRight: parseInt(e.target.value)})} style={{ width: '100%' }} />
                </div>

                <h4 style={{ marginBottom: '1rem', opacity: 0.8 }}>Scaling Strategy</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={handleFitOnePage} className="btn btn-glass" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Maximize2 size={12} style={{ marginRight: '6px' }} /> Fit everything on 1 Page
                  </button>
                  <button onClick={handleStandardTwoPage} className="btn btn-glass" style={{ fontSize: '0.8rem' }}>
                    Allow 2 Pages (Spacious Default)
                  </button>
                </div>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Raw Content Editor</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1rem' }}>Edit the raw text below. Changes will reflect instantly.</p>
                <textarea 
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  style={{ 
                    flex: 1, width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                    borderRadius: '8px', padding: '10px', color: 'white', fontFamily: 'monospace', fontSize: '0.85rem',
                    resize: 'none', outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Pane */}
        {/* Problem 1 / Pagination: We use React PDFViewer natively. It strictly parses the document nodes and dynamically creates pages on overflow. */}
        <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#e5e7eb', border: '2px solid rgba(255,255,255,0.1)' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
            <OptimizedCVDocument htmlContent={editedContent} settings={settings} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
