'use client';
import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Link as LinkIcon, ArrowRight, SkipForward } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// We must set the worker source. Pointing to unpkg or cdnjs matches the version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function UploadCV({ onTextExtracted }) {
  const [isHovering, setIsHovering] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Link Wizard States
  const [detectedLinks, setDetectedLinks] = useState([]);
  const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
  const [baseExtractedText, setBaseExtractedText] = useState('');
  const [approvedUrls, setApprovedUrls] = useState([]);

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
        let fullText = '';
        let extractedLinks = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lastY = -1;
          let pageText = '';
          
          textContent.items.forEach(item => {
             // If Y coordinate drops significantly, it's a new line
             if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) {
                 pageText += '\n';
             }
             pageText += item.str + ' ';
             lastY = item.transform[5];
          });
          
          fullText += pageText + '\n\n';

          // Extract link annotations
          const annotations = await page.getAnnotations();
          annotations.forEach(a => {
            if (a.subtype === 'Link' && a.url) {
              if (!extractedLinks.some(l => l.url === a.url)) {
                 let anchorTextContext = '';
                 if (a.rect) {
                   const [x1, y1, x2, y2] = a.rect;
                   // Heuristic overlap mapping
                   const overlappingItems = textContent.items.filter(item => {
                       const itemX = item.transform[4];
                       const itemY = item.transform[5];
                       return (itemX >= x1 - 50 && itemX <= x2 + 50) && (Math.abs(itemY - y1) < 20 || Math.abs(itemY - y2) < 20);
                   });
                   anchorTextContext = overlappingItems.map(i => i.str).join(' ').trim();
                 }
                extractedLinks.push({ url: a.url, page: i, anchor: anchorTextContext || '[Hidden Document Mapping]' });
              }
            }
          });
        }

        // Sanitization: Normalize spaces and fix condensed "skill arrays"
        fullText = fullText.replace(/\s{3,}/g, '\n').replace(/([a-z])([A-Z])/g, '$1 $2');

        if (fullText.trim().length < 50) {
          setFileName('');
          setIsExtracting(false);
          alert('Could not extract readable text from this PDF. Please upload raw text PDF instead of images.');
          return;
        }

        if (extractedLinks.length > 0) {
          setBaseExtractedText(fullText);
          setDetectedLinks(extractedLinks);
          setIsExtracting(false); 
          // Link Wizard takes over!
        } else {
          // No links found, just finish extraction
          onTextExtracted(fullText);
          setIsExtracting(false);
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

  const finalizeTextExtraction = (approved) => {
    let finalPayload = baseExtractedText;
    if (approved.length > 0) {
      finalPayload += '\n\n=== Embedded URLs ===\n';
      approved.forEach(url => {
        finalPayload += `${url}\n`;
      });
    }
    // Cleanup states and push forward
    setDetectedLinks([]);
    setCurrentLinkIndex(0);
    setApprovedUrls([]);
    onTextExtracted(finalPayload);
  };

  const handleLinkDecision = (isInclude) => {
    const activeLink = detectedLinks[currentLinkIndex];
    const newApproved = [...approvedUrls];
    
    if (isInclude) {
      newApproved.push(activeLink.url);
    }
    
    setApprovedUrls(newApproved);

    if (currentLinkIndex + 1 < detectedLinks.length) {
      setCurrentLinkIndex(currentLinkIndex + 1);
    } else {
      finalizeTextExtraction(newApproved);
    }
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

  // If we are iterating through detected links, show the Wizard!
  if (detectedLinks.length > 0) {
    const currentLink = detectedLinks[currentLinkIndex];
    return (
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
        <h3 style={{ color: '#60a5fa', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LinkIcon size={20} /> Hidden Link Detected
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
          We found a link attached to the text: <span style={{ color: 'white', fontWeight: 600, fontStyle: 'italic', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>"{currentLink.anchor || 'Unknown Text'}"</span>. Do you want to include or edit this URL?
        </p>

        <input
          type="text"
          value={currentLink.url}
          onChange={(e) => {
             const newLinks = [...detectedLinks];
             newLinks[currentLinkIndex].url = e.target.value;
             setDetectedLinks(newLinks);
          }}
          style={{ 
             width: '100%', background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px', 
             border: '1px solid #60a5fa', marginBottom: '1.5rem', color: 'white', 
             fontFamily: 'monospace', fontSize: '0.9rem' 
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
          <button className="btn btn-glass" onClick={() => handleLinkDecision(false)} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <SkipForward size={16} /> Skip 
          </button>
          <button className="btn btn-primary" onClick={() => handleLinkDecision(true)} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
            Include URL <ArrowRight size={16} />
          </button>
        </div>
        
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>
           Link {currentLinkIndex + 1} of {detectedLinks.length}
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
