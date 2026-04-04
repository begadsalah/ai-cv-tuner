'use client';
import React, { useState, useEffect, useRef } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download, Maximize2, Edit3, Settings, ChevronLeft, AlignLeft, Sparkles, Bold, Italic, List, ListOrdered, Type, Layout } from 'lucide-react';
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

// Plain Text <=> HTML Converters with Pro Formatting Support
const htmlToText = (html) => {
  if (!html) return '';
  let txt = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  txt = txt.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  txt = txt.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  txt = txt.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  txt = txt.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  txt = txt.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  txt = txt.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  txt = txt.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  txt = txt.replace(/<ul[^>]*>/gi, '').replace(/<\/ul>/gi, '\n');
  txt = txt.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  txt = txt.replace(/<br\s*\/?>/gi, '\n');
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
    if (!t && inList) { html += '</ul>'; inList = false; return; }
    if (!t) return;

    // Convert Pro Formatting
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.*?)\*/g, '<em>$1</em>');

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
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'layout', 'ats'
  const [markdownContent, setMarkdownContent] = useState('');
  const textAreaRef = useRef(null);
  
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

  // Debounced payload for the renderer mapping ensures absolutely zero blinking
  const debouncedSettings = useDebounce(settings, 500);
  const debouncedHtmlContent = useDebounce(textToHtml(markdownContent), 800);

  useEffect(() => {
    setIsClient(true);
    setMarkdownContent(htmlToText(htmlContent));
  }, [htmlContent]);

  const insertFormatting = (prefix, suffix = '') => {
    if (!textAreaRef.current) return;
    const { selectionStart, selectionEnd, value } = textAreaRef.current;
    
    // If no text selected, just insert the formatting symbols
    const selectedText = value.substring(selectionStart, selectionEnd);
    const newText = value.substring(0, selectionStart) + prefix + selectedText + suffix + value.substring(selectionEnd);
    
    setMarkdownContent(newText);
    
    // Reset focus and cursor position
    setTimeout(() => {
      textAreaRef.current.focus();
      textAreaRef.current.setSelectionRange(
        selectionStart + prefix.length, 
        selectionStart + prefix.length + selectedText.length
      );
    }, 0);
  };

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
      
      if (result.compressed_html) {
         setMarkdownContent(htmlToText(result.compressed_html));
      }
    } catch (err) {
      console.error(err);
      alert('Smart Compress Failed.');
    } finally {
      setIsCompressing(false);
    }
  };

  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', color: 'white' }}>
      
      {/* SaaS High-End Top Toolbar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={onBack} className="btn btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
            <ChevronLeft size={16} /> Back to Hub
          </button>
          
          {/* Main Context Switching */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setActiveTab('editor')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'editor' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.4) 100%)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', fontWeight: activeTab === 'editor' ? 600 : 400 }}>
              <Edit3 size={14} /> Content Editor
            </button>
            <button onClick={() => setActiveTab('layout')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'layout' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.4) 100%)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', fontWeight: activeTab === 'layout' ? 600 : 400 }}>
              <Layout size={14} /> Typography & Spacing
            </button>
            <button onClick={() => setActiveTab('ats')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'ats' ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.4) 0%, rgba(126, 34, 206, 0.4) 100%)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', fontWeight: activeTab === 'ats' ? 600 : 400 }}>
              <Sparkles size={14} /> ATS Pro Tools
            </button>
          </div>
        </div>

        <button onClick={handleDownload} disabled={isExporting} className="btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}>
           <Download size={16} /> {isExporting ? 'Exporting...' : 'Save & Download PDF'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '650px', overflow: 'hidden' }}>
        
        {/* Left Professional Settings / Editor Panel */}
        <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
          
          {/* EDITOR TAB */}
          <div style={{ display: activeTab === 'editor' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            {/* Formatting Toolbar */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.1)' }}>
               <button onClick={() => insertFormatting('**', '**')} title="Bold" style={{ background: 'transparent', border: 'none', color: 'white', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}><Bold size={16} /></button>
               <button onClick={() => insertFormatting('*', '*')} title="Italic" style={{ background: 'transparent', border: 'none', color: 'white', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}><Italic size={16} /></button>
               <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
               <button onClick={() => insertFormatting('## ')} title="Heading" style={{ background: 'transparent', border: 'none', color: 'white', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}><Type size={16} /></button>
               <button onClick={() => insertFormatting('• ')} title="Bullet List" style={{ background: 'transparent', border: 'none', color: 'white', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}><List size={16} /></button>
            </div>
            
            {/* Editor Area */}
            <textarea 
              ref={textAreaRef}
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="Start typing your resume..."
              style={{ 
                flex: 1, width: '100%', background: 'transparent', border: 'none',
                padding: '20px', color: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.95rem',
                lineHeight: 1.6, resize: 'none', outline: 'none'
              }}
            />
          </div>

          {/* LAYOUT TAB */}
          <div style={{ display: activeTab === 'layout' ? 'block' : 'none', padding: '20px', overflowY: 'auto', height: '100%' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ marginBottom: '16px', opacity: 0.9, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Maximize2 size={14} /> Quick Page Scaling
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => setSettings({...settings, fontSize: 8.5, marginTop: 20, marginBottom: 30, marginLeft: 25, marginRight: 25, lineSpacing: 1.2, sectionSpacing: 8})} className="btn" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
                  Force 1-Page
                </button>
                <button onClick={() => setSettings({...settings, fontSize: 11, marginTop: 40, marginBottom: 50, marginLeft: 45, marginRight: 45, lineSpacing: 1.6, sectionSpacing: 16})} className="btn" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
                  Standard Spacer
                </button>
              </div>
            </div>

            <h4 style={{ marginBottom: '1.25rem', opacity: 0.8, fontSize: '0.85rem' }}>Global Typography</h4>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                <span>Font Size</span> <span>{settings.fontSize.toFixed(1)}pt</span>
              </label>
              <input type="range" min="7" max="14" step="0.5" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: 'var(--secondary)' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                <span>Line Spacing</span> <span>{settings.lineSpacing.toFixed(1)}x</span>
              </label>
              <input type="range" min="1" max="2.5" step="0.1" value={settings.lineSpacing} onChange={(e) => setSettings({...settings, lineSpacing: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: 'var(--secondary)' }} />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                <span>Section Spacing</span> <span>{settings.sectionSpacing}px</span>
              </label>
              <input type="range" min="0" max="30" step="1" value={settings.sectionSpacing} onChange={(e) => setSettings({...settings, sectionSpacing: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--secondary)' }} />
            </div>

            <h4 style={{ marginBottom: '1.25rem', opacity: 0.8, fontSize: '0.85rem' }}>Physical Margins</h4>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                <span>Vertical Margins</span> <span>{settings.marginTop}px</span>
              </label>
              <input type="range" min="10" max="100" step="1" value={settings.marginTop} onChange={(e) => setSettings({...settings, marginTop: parseInt(e.target.value), marginBottom: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--secondary)' }} />
            </div>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                <span>Side Margins</span> <span>{settings.marginLeft}px</span>
              </label>
              <input type="range" min="10" max="100" step="1" value={settings.marginLeft} onChange={(e) => setSettings({...settings, marginLeft: parseInt(e.target.value), marginRight: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--secondary)' }} />
            </div>
          </div>

          {/* ATS PRO TOOLS TAB */}
          <div style={{ display: activeTab === 'ats' ? 'block' : 'none', padding: '20px', overflowY: 'auto', height: '100%' }}>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.2)', marginBottom: '20px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', marginBottom: '12px' }}>
                <Sparkles size={18} /> Deep Optimization
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#e5e7eb', marginBottom: '16px', lineHeight: 1.5 }}>
                Run the document through our Pro Engine. This merges fragmented bullets implicitly, removes weak verbs, and enforces inline lists to save vertical space while boosting ATS read-rates.
              </p>
              <button 
                onClick={handleSmartCompress} 
                disabled={isCompressing}
                style={{ 
                  width: '100%', background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                  color: 'white', padding: '12px', borderRadius: '8px', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: isCompressing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                 }}
              >
                {isCompressing ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Sparkles size={16} />} 
                {isCompressing ? ' Optimizing Engine...' : 'Run ATS Engine Compression'}
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Pro Tip: Inline Formatting</h4>
               <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '8px' }}>
                 To save space, format skills laterally rather than vertically.
               </p>
               <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', color: '#93c5fd' }}>
                 **Skills:** React, Python, Postgres
               </pre>
            </div>

          </div>
        </div>

        {/* Live Preview Pane */}
        {/* We use React PDFViewer connected to exclusively Debounced states */}
        <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#e5e7eb', border: '2px solid rgba(255,255,255,0.1)' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none', transition: 'opacity 0.3s' }} showToolbar={false}>
            <OptimizedCVDocument htmlContent={debouncedHtmlContent} settings={debouncedSettings} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
