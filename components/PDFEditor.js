'use client';
import React, { useState, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download, Edit3, Settings, ChevronLeft, Layout, Sparkles, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import OptimizedCVDocument from './OptimizedCVDocument';

// Custom Hook to Debounce PDF Engine Rendering and fix flickering
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearInterval(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PDFEditor = ({ initialCvData, defaultFileName = 'Optimized_CV', onBack }) => {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'layout', 'ats'
  const [activeAccordion, setActiveAccordion] = useState('personal_info');
  const [cvData, setCvData] = useState(initialCvData || {});
  
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

  // Debounce settings and cvData for renderer
  const debouncedSettings = useDebounce(settings, 500);
  const debouncedCvData = useDebounce(cvData, 800);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async () => {
    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      const generatedBlob = await pdf(
        <OptimizedCVDocument cvData={cvData} settings={settings} />
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

  const updateSection = (section, key, value) => {
    setCvData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updatePersonalInfo = (key, value) => {
    setCvData(prev => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        [key]: value
      }
    }));
  };

  const updateArrayItem = (section, index, key, value) => {
    setCvData(prev => {
      const newItems = [...(prev[section]?.items || [])];
      newItems[index] = { ...newItems[index], [key]: value };
      return {
        ...prev,
        [section]: {
          ...prev[section],
          items: newItems
        }
      };
    });
  };

  const addArrayItem = (section) => {
    setCvData(prev => {
      const newItems = [...(prev[section]?.items || []), {}];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          items: newItems
        }
      };
    });
  };

  const removeArrayItem = (section, index) => {
    setCvData(prev => {
      const newItems = prev[section].items.filter((_, i) => i !== index);
      return { ...prev, [section]: { ...prev[section], items: newItems } };
    });
  };

  const updateBullets = (section, itemIndex, textValue) => {
     // Convert multiline string area back to array of bullets
     const arr = textValue.split('\n').filter(s => s.trim() !== '');
     updateArrayItem(section, itemIndex, 'bullets', arr);
  };

  const updateSimpleArray = (section, textValue) => {
     const arr = textValue.split('\n').filter(s => s.trim() !== '');
     updateSection(section, 'items', arr);
  };

  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', color: 'white' }}>
      
      {/* SaaS High-End Top Toolbar */}
      <div className="glass-panel" style={{ flexShrink: 0, padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={onBack} className="btn btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
            <ChevronLeft size={16} /> Back to Hub
          </button>
          
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setActiveTab('editor')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'editor' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.4) 100%)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', fontWeight: activeTab === 'editor' ? 600 : 400 }}>
              <Edit3 size={14} /> Modular Content Editor
            </button>
            <button onClick={() => setActiveTab('layout')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'layout' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.4) 100%)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', fontWeight: activeTab === 'layout' ? 600 : 400 }}>
              <Layout size={14} /> Typography
            </button>
          </div>
        </div>

        <button onClick={handleDownload} disabled={isExporting} className="btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}>
           <Download size={16} /> {isExporting ? 'Exporting...' : 'Save & Download PDF'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '650px', flexWrap: 'wrap', overflowY: 'auto' }}>
        
        {/* Left Professional Settings / Editor Panel */}
        <div className="glass-panel" style={{ flex: '1 1 350px', maxWidth: '100%', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', padding: 0 }}>
          
          {/* EDITOR TAB - MODULAR */}
          <div style={{ display: activeTab === 'editor' ? 'flex' : 'none', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '20px' }}>
            
            {/* Personal Info Accordion */}
            <div style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'personal_info' ? null : 'personal_info')}
                style={{ width: '100%', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeAccordion === 'personal_info' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Personal Info</h3>
                {activeAccordion === 'personal_info' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {activeAccordion === 'personal_info' && (
                <div style={{ padding: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" placeholder="Name" value={cvData?.personal_info?.name || ''} onChange={(e) => updatePersonalInfo('name', e.target.value)} className="modular-input" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px' }} />
                    <input type="email" placeholder="Email" value={cvData?.personal_info?.email || ''} onChange={(e) => updatePersonalInfo('email', e.target.value)} className="modular-input" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px' }} />
                    <input type="tel" placeholder="Phone" value={cvData?.personal_info?.phone || ''} onChange={(e) => updatePersonalInfo('phone', e.target.value)} className="modular-input" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px' }} />
                    <input type="text" placeholder="Location" value={cvData?.personal_info?.location || ''} onChange={(e) => updatePersonalInfo('location', e.target.value)} className="modular-input" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px' }} />
                    <input type="url" placeholder="LinkedIn / Portfolio" value={cvData?.personal_info?.linkedin || ''} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} className="modular-input" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Summary Accordion */}
            <div style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'summary' ? null : 'summary')}
                style={{ width: '100%', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeAccordion === 'summary' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Summary</h3>
                {activeAccordion === 'summary' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {activeAccordion === 'summary' && (
                <div style={{ padding: '15px' }}>
                  <input type="text" placeholder="Section Title" value={cvData?.summary?.section_title || 'Summary'} onChange={(e) => updateSection('summary', 'section_title', e.target.value)} className="modular-input" style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: '#93c5fd', padding: '5px', borderRadius: '4px', marginBottom: '10px' }} />
                  <textarea value={cvData?.summary?.content || ''} onChange={(e) => updateSection('summary', 'content', e.target.value)} className="modular-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px', minHeight: '100px' }} />
                </div>
              )}
            </div>

            {['experience', 'education', 'custom_projects'].map((section) => (
              <div key={section} style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                 <button 
                   onClick={() => setActiveAccordion(activeAccordion === section ? null : section)}
                   style={{ width: '100%', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeAccordion === section ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <h3 style={{ fontSize: '1.1rem', margin: 0, textTransform: 'capitalize' }}>{section.replace('_', ' ')}</h3>
                     <span onClick={(e) => { e.stopPropagation(); addArrayItem(section); }} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}><Plus size={14} /> Add</span>
                   </div>
                   {activeAccordion === section ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
                 
                 {activeAccordion === section && (
                   <div style={{ padding: '15px' }}>
                     <input type="text" placeholder="Section Title" value={cvData?.[section]?.section_title || section} onChange={(e) => updateSection(section, 'section_title', e.target.value)} className="modular-input" style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: '#93c5fd', padding: '5px', borderRadius: '4px', marginBottom: '1rem' }} />

                     {cvData?.[section]?.items?.map((item, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
                           <button onClick={() => removeArrayItem(section, idx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                           <input type="text" placeholder="Title/Degree" value={item.title || item.degree || ''} onChange={(e) => updateArrayItem(section, idx, section === 'education' ? 'degree' : 'title', e.target.value)} className="modular-input" style={{ width: 'calc(100% - 30px)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '8px' }} />
                           
                           <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                             <input type="text" placeholder="Company/School" value={item.company || item.school || ''} onChange={(e) => updateArrayItem(section, idx, section === 'education' ? 'school' : 'company', e.target.value)} className="modular-input" style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '4px' }} />
                             <input type="text" placeholder="Date" value={item.date || ''} onChange={(e) => updateArrayItem(section, idx, 'date', e.target.value)} className="modular-input" style={{ width: '120px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '4px' }} />
                           </div>

                           <textarea placeholder="Description (Optional)" value={item.description || ''} onChange={(e) => updateArrayItem(section, idx, 'description', e.target.value)} className="modular-input" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '4px', minHeight: '60px', marginBottom: '8px' }} />
                           
                           <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Bullets (one per line)</div>
                           <textarea value={(item.bullets || []).join('\n')} onChange={(e) => updateBullets(section, idx, e.target.value)} className="modular-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '8px', borderRadius: '4px', minHeight: '100px' }} />
                        </div>
                     ))}
                   </div>
                 )}
              </div>
            ))}

            {['skills', 'languages'].map(section => (
              <div key={section} style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                 <button 
                   onClick={() => setActiveAccordion(activeAccordion === section ? null : section)}
                   style={{ width: '100%', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeAccordion === section ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <h3 style={{ fontSize: '1.1rem', margin: 0, textTransform: 'capitalize' }}>{section}</h3>
                     <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateSection(section, 'view_mode', 'inline')} style={{ padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', border: 'none', background: (cvData?.[section]?.view_mode === 'inline' || !cvData?.[section]?.view_mode) ? 'rgba(59, 130, 246, 0.6)' : 'transparent', color: 'white' }}>Inline</button>
                        <button onClick={() => updateSection(section, 'view_mode', 'list')} style={{ padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', border: 'none', background: cvData?.[section]?.view_mode === 'list' ? 'rgba(59, 130, 246, 0.6)' : 'transparent', color: 'white' }}>List</button>
                     </div>
                   </div>
                   {activeAccordion === section ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
                 
                 {activeAccordion === section && (
                   <div style={{ padding: '15px' }}>
                     <input type="text" placeholder="Section Title" value={cvData?.[section]?.section_title || section} onChange={(e) => updateSection(section, 'section_title', e.target.value)} className="modular-input" style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: '#93c5fd', padding: '5px', borderRadius: '4px', marginBottom: '10px' }} />
                     <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Items ({cvData?.[section]?.view_mode === 'list' ? 'one bullet per line' : 'one inline block per line'})</div>
                     <textarea value={(cvData?.[section]?.items || []).join('\n')} onChange={(e) => updateSimpleArray(section, e.target.value)} className="modular-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px', minHeight: '100px' }} />
                   </div>
                 )}
              </div>
            ))}
          </div>

          {/* LAYOUT TAB */}
          <div style={{ display: activeTab === 'layout' ? 'block' : 'none', padding: '20px', overflowY: 'auto', height: '100%' }}>
            
            <div style={{ marginBottom: '2rem', padding: '15px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#22d3ee' }}>
                <Sparkles size={18} /> AI-Powered 1-Page Force
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '15px', lineHeight: 1.4 }}>
                If your CV is spilling over one page, the AI will perform a semantic rewriting compression, aggressively merging fragment bullets and optimizing your CSS scale down to 1-Page max.
              </p>
              <button 
                onClick={async () => {
                  alert('Initiating Semantic Compression! The AI is currently rewriting your copy. This will take ~10 seconds.');
                  setIsCompressing(true);
                  try {
                    const res = await fetch('/api/compress', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ cvData })
                    });
                    const payload = await res.json();
                    if (payload.compressed_cv_modular) {
                      setCvData(payload.compressed_cv_modular);
                      setSettings(prev => ({ ...prev, lineSpacing: 1.1, sectionSpacing: 8 }));
                    } else {
                      alert('Compression API completely failed.');
                    }
                  } catch (e) {
                     alert(e.message);
                  } finally {
                    setIsCompressing(false);
                  }
                }}
                disabled={isCompressing}
                style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#0e7490', border: '1px solid #22d3ee', color: 'white', borderRadius: '6px', fontWeight: 600, cursor: isCompressing ? 'wait' : 'pointer' }}
              >
                {isCompressing ? 'Compressing Layout...' : 'Optimize for 1-Page (AI-Driven)'}
              </button>
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
        </div>

        {/* Live Preview Pane */}
        <div className="glass-panel" style={{ flex: '2 1 400px', padding: 0, overflow: 'hidden', background: '#e5e7eb', border: '2px solid rgba(255,255,255,0.1)', minHeight: '500px' }}>
          <PDFViewer style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none', transition: 'opacity 0.3s' }} showToolbar={false}>
            <OptimizedCVDocument cvData={debouncedCvData} settings={debouncedSettings} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
