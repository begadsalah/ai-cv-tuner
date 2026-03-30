'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DownloadPDFButton({ targetRef, disabled }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!targetRef.current || disabled) return;
    
    setIsExporting(true);
    try {
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(targetRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions maintaining aspect ratio for A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Optimized_CV.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
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
