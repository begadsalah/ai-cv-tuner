'use client';
import React, { useState, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download, Maximize2, Edit3, Settings, ChevronLeft, AlignLeft, Sparkles } from 'lucide-react';
import OptimizedCVDocument from './OptimizedCVDocument';

// Custom Hook to Debounce PDF Engine Rendering and fix flickering
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Plain Text <=> HTML Converters
const htmlToText = (html) => {
  if (!html) return '';
  let txt = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  txt = txt.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  txt = txt.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  txt = txt.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  txt = txt.replace(/<ul[^>]*>/gi, '').replace(/<\/ul>/gi, '\n');
  txt = txt.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  txt = txt.replace(/<[^>]+>/g, ''); // strip remaining tags
  return txt.replace(/\n{3,}/g, '\n\n').trim();
};

const textToHtml = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  lines.forEach(line => {
    let t = line.trim();
    if (!t) return;

    if (t.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${t.replace(/^# /, '')}</h1>`;
    } else if (t.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${t.replace(/^## /, '')}</h2>`;
    } else if (t.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${t.replace(/^### /, '')}</h3>`;
    } else if (t.startsWith('• ') || t.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${t.replace(/^[•\-]\s*/, '')}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${t}</p>`;
    }
  });
  if (inList) html += '</ul>';
  return html;
};

const PDFEditor = ({ htmlContent, defaultFileName = 'Optimized_CV', onBack }) => {
  const [activeTab, setActiveTab] = useState('layout'); 
  const [markdownContent, setMarkdownContent] = useState('');
  
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Debounced payload for the renderer mapping
  const debouncedSettings = useDebounce(settings, 500);
  const debouncedHtmlContent = useDebounce(textToHtml(markdownContent), 800);

  useEffect(() => {
    setIsClient(true);
    setMarkdownContent(htmlToText(htmlContent));
  }, [htmlContent]);

  const handleDownload = async () => {
    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      const generatedBlob = await pdf(
        <OptimizedCVDocument htmlContent={textToHtml(markdownContent)} settings={settings} />
      ).toBlob();
      
      const safeBlob = new Blob([generatedBlob], { type: 'application/pdf' });
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

  const handleSmartCompress = async () => {
    setIsCompressing(true);
    try {
      const response = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: textToHtml(markdownContent) })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      // Load compressed payload back into Markdown
      if (result.compressed_html) {
         setMarkdownContent(htmlToText(result.compressed_html));
      }
    } catch (err) {
      console.error(err);
      alert('Smart Compress Failed. Ensure Gemini token is valid.');
    } finally {
      setIsCompressing(false);
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
                <h4 style={{ marginBottom: '0.5rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlignLeft size={16} /> Plain Text Content Editor
                </h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1rem' }}>
                  Edit naturally. Use <code>#</code> for headings and <code>•</code> for lists.
                </p>
                <textarea 
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  style={{ 
                    flex: 1, width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontFamily: 'inherit', fontSize: '0.9rem',
                    lineHeight: 1.6, resize: 'none', outline: 'none'
                  }}
                />
                <button 
                  onClick={handleSmartCompress} 
                  disabled={isCompressing}
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                    border: '1px solid rgba(147, 51, 234, 0.4)',
                    color: 'white', padding: '10px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    marginTop: '1rem', cursor: 'pointer', fontSize: '0.85rem'
                   }}
                >
                  <Sparkles size={14} color="#d8b4fe" /> {isCompressing ? 'Running Gemini AI...' : 'AI Smart ATS Compress'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#e5e7eb', border: '2px solid rgba(255,255,255,0.1)' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
            {/* The Viewer renders off of DEBOUNCED values, stopping all screen flickering completely */}
            <OptimizedCVDocument htmlContent={debouncedHtmlContent} settings={debouncedSettings} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
