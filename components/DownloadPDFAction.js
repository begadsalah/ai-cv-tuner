'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';

export default function DownloadPDFAction({ document: PdfDoc, disabled, defaultFileName = 'document' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!PdfDoc || disabled) return;

    const fileNameInput = window.prompt('Enter file name for download:', defaultFileName);
    if (!fileNameInput) return;
    const finalFileName = fileNameInput.endsWith('.pdf') ? fileNameInput : `${fileNameInput}.pdf`;

    setIsExporting(true);
    try {
      // Generate the PDF as a blob
      const blob = await pdf(PdfDoc).toBlob();
      
      // Create a link and trigger a download
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating high-quality PDF:', error);
      alert('Failed to generate high-quality PDF. Check console for details.');
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
