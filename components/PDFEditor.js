'use client';
import React, { useState, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download, RefreshCw, Maximize2, Edit3, Settings, ChevronLeft } from 'lucide-react';
import OptimizedCVDocument from './OptimizedCVDocument';

const PDFEditor = ({ htmlContent, defaultFileName = 'Optimized_CV', onBack }) => {
  const [activeTab, setActiveTab] = useState('layout'); // 'layout' or 'content'
  const [editedContent, setEditedContent] = useState(htmlContent);
  const [settings, setSettings] = useState({
    fontSize: 10,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 40,
    marginRight: 40,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEditedContent(htmlContent);
  }, [htmlContent]);

  const handleDownload = async () => {
    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      const blob = await pdf(<OptimizedCVDocument htmlContent={editedContent} settings={settings} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePresetFit = () => {
    setSettings({
      fontSize: 9,
      marginTop: 25,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
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
            <Settings size={14} /> Layout
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: activeTab === 'content' ? 'var(--secondary)' : 'transparent',
              color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
            }}
          >
            <Edit3 size={14} /> Edit text
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
                <h4 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>PDF Settings</h4>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>Font Size: {settings.fontSize}pt</label>
                  <input type="range" min="8" max="14" step="0.5" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: parseFloat(e.target.value)})} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>Top Margin: {settings.marginTop}</label>
                  <input type="range" min="10" max="100" step="1" value={settings.marginTop} onChange={(e) => setSettings({...settings, marginTop: parseInt(e.target.value)})} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>Bottom Margin: {settings.marginBottom}</label>
                  <input type="range" min="10" max="100" step="1" value={settings.marginBottom} onChange={(e) => setSettings({...settings, marginBottom: parseInt(e.target.value)})} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>Side Margins: {settings.marginLeft}</label>
                  <input type="range" min="10" max="100" step="1" value={settings.marginLeft} onChange={(e) => setSettings({...settings, marginLeft: parseInt(e.target.value), marginRight: parseInt(e.target.value)})} style={{ width: '100%' }} />
                </div>
                <button onClick={handlePresetFit} className="btn btn-glass" style={{ width: '100%', fontSize: '0.8rem' }}>
                  <Maximize2 size={12} style={{ marginRight: '6px' }} /> Optimize for 1 page
                </button>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Content Editor</h4>
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
          <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
             <p style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center' }}>
               Tip: use &lt;br&gt; for line breaks.
             </p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#333', border: '2px solid rgba(255,255,255,0.1)' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
            <OptimizedCVDocument htmlContent={editedContent} settings={settings} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
