'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';

// Parses the AI-generated HTML CV into a pdfmake content array
function htmlToPdfMakeContent(htmlString) {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const content = [];

  const processNode = (node) => {
    const tag = node.nodeName.toLowerCase();
    const text = node.textContent?.trim() || '';

    if (!text) return null;

    switch (tag) {
      case 'h1':
        return { text, fontSize: 20, bold: true, margin: [0, 12, 0, 6], color: '#1a1a2e' };
      case 'h2':
        return { text, fontSize: 14, bold: true, margin: [0, 10, 0, 4], color: '#0e4fad', decoration: 'underline' };
      case 'h3':
        return { text, fontSize: 12, bold: true, margin: [0, 8, 0, 3], color: '#333333' };
      case 'p':
        return { text, fontSize: 10, margin: [0, 2, 0, 4], color: '#222222', lineHeight: 1.4 };
      case 'ul': {
        const items = [];
        node.querySelectorAll('li').forEach((li) => {
          items.push({ text: li.textContent?.trim() || '', fontSize: 10, color: '#222222' });
        });
        return items.length > 0 ? { ul: items, margin: [0, 2, 0, 6] } : null;
      }
      case 'li':
        return null; // handled by ul
      default: {
        // For divs, spans, sections — recurse into children
        const children = [];
        node.childNodes.forEach((child) => {
          const result = processNode(child);
          if (result) Array.isArray(result) ? children.push(...result) : children.push(result);
        });
        return children.length > 0 ? children : null;
      }
    }
  };

  doc.body.childNodes.forEach((node) => {
    const result = processNode(node);
    if (result) {
      Array.isArray(result) ? content.push(...result) : content.push(result);
    }
  });

  return content;
}

export default function DownloadCVButton({ htmlContent, disabled, defaultFileName = 'Optimized_CV' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!htmlContent || disabled) return;

    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      // Dynamically import pdfmake to avoid SSR issues
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      // pdfmake stores fonts in pdfFonts.vfs (not pdfFonts.pdfMake.vfs)
      pdfMake.vfs = pdfFonts.vfs;

      const content = htmlToPdfMakeContent(htmlContent);

      const docDefinition = {
        content: content.length > 0 ? content : [{ text: 'No content available.' }],
        pageMargins: [50, 50, 50, 50],
        pageSize: 'A4',
        defaultStyle: {
          font: 'Roboto',
          fontSize: 10,
          color: '#222222',
        },
        styles: {
          header: { fontSize: 20, bold: true },
        },
      };

      pdfMake.createPdf(docDefinition).download(finalFileName);
    } catch (error) {
      console.error('Error generating text-based PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isExporting}
      className={`btn btn-primary ${isExporting ? 'opacity-50' : ''}`}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      {isExporting ? (
        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
      ) : (
        <Download size={18} />
      )}
      {isExporting ? 'Generating PDF...' : 'Download PDF'}
    </button>
  );
}
