'use client';
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Link as LinkIcon, ArrowRight, SkipForward, Edit, Trash2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Sub-component to render PDF page and overlay highlights
const PDFCanvasPreview = ({ pdf, pageNumber, highlightRect }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let renderTask = null;
    let isMounted = true;

    const render = async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const parentWidth = canvasRef.current.parentElement.clientWidth || 400;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = parentWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;

        if (highlightRect && isMounted) {
           const [x1, y1, x2, y2] = highlightRect;
           // PDF coordinates mapping directly to viewport
           const [rx1, ry1, rx2, ry2] = viewport.convertToViewportRectangle([x1, y1, x2, y2]);
           const startX = Math.min(rx1, rx2);
           const startY = Math.min(ry1, ry2);
           const width = Math.abs(rx2 - rx1);
           const height = Math.abs(ry2 - ry1);

           context.fillStyle = 'rgba(234, 179, 8, 0.5)'; // Yellow overlay
           context.fillRect(startX - 4, startY - 4, width + 8, height + 8);
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Canvas render error:', err);
        }
      }
    };

    render();

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber, highlightRect]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', overflowY: 'auto' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'intrinsic', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
    </div>
  );
};

export default function UploadCV({ onTextExtracted }) {
  const [isHovering, setIsHovering] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Link Wizard States
  const [detectedLinks, setDetectedLinks] = useState([]);
  const [baseExtractedText, setBaseExtractedText] = useState('');
  const [approvedUrls, setApprovedUrls] = useState([]);
  const [activeLinkRef, setActiveLinkRef] = useState(null); // ID or URL of currently clicked link

  // Memory buffer for loaded PDF validation
  const [loadedPdf, setLoadedPdf] = useState(null);

  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    
    setFileName(file.name);
    setIsExtracting(true);

    try {
      const fileReader = new FileReader();

      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setLoadedPdf(pdf); // Store for Live Visualizer

        let fullText = '';
        let extractedLinks = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lastY = -1;
          let pageText = '';
          
          textContent.items.forEach(item => {
             if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) {
                 pageText += '\n';
             }
             pageText += item.str + ' ';
             lastY = item.transform[5];
          });
          
          fullText += pageText + '\n\n';

          const annotations = await page.getAnnotations();
          annotations.forEach(a => {
            if (a.subtype === 'Link' && a.url) {
              if (!extractedLinks.some(l => l.url === a.url)) {
                 let anchorTextContext = '';
                 if (a.rect) {
                   const [x1, y1, x2, y2] = a.rect;
                   const overlappingItems = textContent.items.filter(item => {
                       const itemX = item.transform[4];
                       const itemY = item.transform[5];
                       return (itemX >= x1 - 5 && itemX <= x2 + 5) && (Math.abs(itemY - y1) < 5 || Math.abs(itemY - y2) < 5);
                   });
                   anchorTextContext = overlappingItems.map(i => i.str).join(' ').trim();
                 }
                 
                 // If mapping fails, gracefully just print the URL
                 extractedLinks.push({ 
                    id: Math.random().toString(),
                    url: a.url, 
                    page: i, 
                    rect: a.rect,
                    anchor: anchorTextContext || a.url 
                 });
              }
            }
          });
        }

        fullText = fullText.replace(/\s{3,}/g, '\n').replace(/([a-z])([A-Z])/g, '$1 $2');

        if (fullText.trim().length < 50) {
          setFileName('');
          setIsExtracting(false);
          setLoadedPdf(null);
          alert('Could not extract readable text from this PDF. Please upload raw text PDF instead of images.');
          return;
        }

        if (extractedLinks.length > 0) {
          setBaseExtractedText(fullText);
          setDetectedLinks(extractedLinks);
          setActiveLinkRef(extractedLinks[0].id);
          setIsExtracting(false); 
        } else {
          onTextExtracted(fullText);
          setIsExtracting(false);
          setLoadedPdf(null);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      alert('Failed to extract text from PDF.');
      setIsExtracting(false);
      setFileName('');
    }
  };

  const finalizeValidation = () => {
    let finalPayload = baseExtractedText;
    if (approvedUrls.length > 0) {
      finalPayload += '\n\n=== Embedded URLs ===\n';
      approvedUrls.forEach(urlObj => {
        finalPayload += `${urlObj.url}\n`;
      });
    }
    
    // Cleanup and trigger Gemini
    setDetectedLinks([]);
    setApprovedUrls([]);
    setLoadedPdf(null);
    onTextExtracted(finalPayload);
  };

  const removeLink = (id) => {
     setDetectedLinks(prev => prev.filter(l => l.id !== id));
     const remaining = detectedLinks.filter(l => l.id !== id);
     if (remaining.length === 0) {
       finalizeValidation();
     } else {
       setActiveLinkRef(remaining[0].id);
     }
  };

  const updateLinkUrl = (id, newUrl) => {
     setDetectedLinks(prev => prev.map(l => l.id === id ? { ...l, url: newUrl } : l));
  };

  const includeLink = (id) => {
     const target = detectedLinks.find(l => l.id === id);
     setApprovedUrls(prev => [...prev, target]);
     removeLink(id); 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  // SPLIT-SCREEN VALIDATOR VIEW
  if (detectedLinks.length > 0 && loadedPdf) {
    const activeLinkData = detectedLinks.find(l => l.id === activeLinkRef) || detectedLinks[0];

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.98)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '0', width: '100%', maxWidth: '1400px', height: '90vh', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          {/* Left Side: Action Board */}
          <div className="glass-panel" style={{ flex: '0 0 450px', display: 'flex', flexDirection: 'column', padding: '30px', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px 0 0 12px', border: 'none' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LinkIcon size={24} /> Visual Link Validator
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.5 }}>
              We detected embedded links in your PDF. Review the matched locations and explicitly approve any crucial Portfolio/LinkedIn URLs.
            </p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '10px' }}>
              {detectedLinks.map((link) => {
                 const isActive = link.id === activeLinkRef;
                 return (
                   <div 
                     key={link.id} 
                     onClick={() => setActiveLinkRef(link.id)}
                     style={{ 
                       background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.3)', 
                       border: `1px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                       borderRadius: '10px', 
                       padding: '16px',
                       cursor: 'pointer',
                       transition: 'all 0.2s'
                     }}
                   >
                      <p style={{ color: 'white', fontSize: '1rem', marginBottom: '10px', fontStyle: 'italic' }}>
                        Context <ArrowRight size={14} style={{ display: 'inline', margin: '0 4px' }} /> <span style={{ fontWeight: 600 }}>"{link.anchor}"</span>
                      </p>
                      <input 
                        type="text" 
                        value={link.url}
                        onChange={(e) => updateLinkUrl(link.id, e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#93c5fd', fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={(e) => { e.stopPropagation(); removeLink(link.id); }} style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <Trash2 size={16} /> Remove
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); includeLink(link.id); }} style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                          <CheckCircle size={16} /> Include
                        </button>
                      </div>
                   </div>
                 );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
               <button className="btn" onClick={finalizeValidation} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.1)' }}>
                 Discard Remaining & Continue <ArrowRight size={18} />
               </button>
            </div>
          </div>

          {/* Right Side: Live Canvas Render */}
          <div style={{ flex: '1 1 auto', overflow: 'hidden', padding: 0, background: '#cbd5e1', display: 'flex', flexDirection: 'column' }}>
             <h3 style={{ padding: '15px 25px', margin: 0, fontSize: '1rem', color: '#1e293b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
               <FileText size={18} /> Document Mapping (Page {activeLinkData.page})
             </h3>
             <div style={{ flex: 1, overflow: 'hidden', padding: '20px', display: 'flex', justifyContent: 'center' }}>
               <PDFCanvasPreview 
                 pdf={loadedPdf} 
                 pageNumber={activeLinkData.page} 
                 highlightRect={activeLinkData.rect} 
               />
             </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '2rem',
        border: `2px dashed ${isHovering ? 'var(--secondary)' : 'var(--glass-border)'}`,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        background: isHovering ? 'rgba(14, 165, 233, 0.1)' : 'var(--glass-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFile(e.target.files[0])} 
        accept="application/pdf" 
        style={{ display: 'none' }} 
      />
      
      {isExtracting ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '40px', height: '40px', marginBottom: '1rem' }}></div>
          <p style={{ fontWeight: 500, color: 'white' }}>Extracting text...</p>
        </div>
      ) : fileName ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={48} color="#10b981" />
          <p style={{ fontWeight: 600, color: 'white', marginTop: '1rem' }}>{fileName}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Click or drag to replace</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <UploadCloud size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, color: 'white', fontSize: '1.1rem' }}>Upload your current CV</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>PDF format only</p>
        </div>
      )}
    </div>
  );
}
