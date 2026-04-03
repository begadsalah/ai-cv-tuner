'use client';
import React, { useState, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download, RefreshCw, Maximize2, Move } from 'lucide-react';
import OptimizedCVDocument from './OptimizedCVDocument';

const PDFEditor = ({ htmlContent, defaultFileName = 'Optimized_CV', onBack }) => {
  const [settings, setSettings] = useState({
    fontSize: 10.5,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 40,
    marginRight: 40,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async () => {
    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      const blob = await pdf(<OptimizedCVDocument htmlContent={htmlContent} settings={settings} />).toBlob();
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
      fontSize: 9.5,
      marginTop: 25,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
    });
  };

  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-glass" style={{ fontSize: '0.9rem' }}>
          ← Back to Preview
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button onClick={handlePresetFit} className="btn btn-glass" style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
             <Maximize2 size={14} style={{ marginRight: '4px' }} /> Fit to Page
           </button>
           <button onClick={handleDownload} disabled={isExporting} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
             <Download size={16} style={{ marginRight: '6px' }} /> {isExporting ? 'Exporting...' : 'Download PDF'}
           </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '600px' }}>
        {/* Controls Panel */}
        <div className="glass-panel" style={{ width: '280px', padding: '1.25rem', overflowY: 'auto' }}>
          <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>Layout Settings</h4>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Font Size: {settings.fontSize}pt
            </label>
            <input 
              type="range" min="8" max="14" step="0.5" 
              value={settings.fontSize} 
              onChange={(e) => setSettings({...settings, fontSize: parseFloat(e.target.value)})}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Top Margin: {settings.marginTop}px
            </label>
            <input 
              type="range" min="20" max="100" step="1" 
              value={settings.marginTop} 
              onChange={(e) => setSettings({...settings, marginTop: parseInt(e.target.value)})}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Bottom Margin: {settings.marginBottom}px
            </label>
            <input 
              type="range" min="20" max="100" step="1" 
              value={settings.marginBottom} 
              onChange={(e) => setSettings({...settings, marginBottom: parseInt(e.target.value)})}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Side Margins (L/R): {settings.marginLeft}px
            </label>
            <input 
              type="range" min="20" max="100" step="1" 
              value={settings.marginLeft} 
              onChange={(e) => setSettings({...settings, marginLeft: parseInt(e.target.value), marginRight: parseInt(e.target.value)})}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
               Adjust sliders to fit content. Smaller font and margins help fit to 1 page.
             </p>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="glass-panel" style={{ flex: 1, padding: '0', overflow: 'hidden', background: '#333' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
            <OptimizedCVDocument htmlContent={htmlContent} settings={settings} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
