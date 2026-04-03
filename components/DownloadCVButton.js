'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Converts the AI-generated HTML CV into structured text lines for jsPDF
function parseHtmlToLines(htmlString) {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const lines = [];

  const processNode = (node) => {
    const tag = node.nodeName.toLowerCase();
    const text = node.textContent?.trim() || '';
    if (!text) return;

    switch (tag) {
      case 'h1':
        lines.push({ text, type: 'h1' });
        break;
      case 'h2':
        lines.push({ text, type: 'h2' });
        break;
      case 'h3':
        lines.push({ text, type: 'h3' });
        break;
      case 'p':
        lines.push({ text, type: 'p' });
        break;
      case 'li':
        lines.push({ text: `• ${text}`, type: 'li' });
        break;
      case 'ul':
      case 'ol':
        node.querySelectorAll('li').forEach((li) => {
          const liText = li.textContent?.trim() || '';
          if (liText) lines.push({ text: `• ${liText}`, type: 'li' });
        });
        break;
      case '#text':
        // skip bare text nodes (whitespace)
        break;
      default:
        // For divs, sections, etc — recurse into children
        node.childNodes.forEach((child) => processNode(child));
    }
  };

  doc.body.childNodes.forEach((node) => processNode(node));
  return lines;
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
      const lines = parseHtmlToLines(htmlContent);

      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 50;
      const marginRight = 50;
      const usableWidth = pageWidth - marginLeft - marginRight;
      let y = 50;

      const addNewPageIfNeeded = (neededHeight) => {
        if (y + neededHeight > pageHeight - 40) {
          pdf.addPage();
          y = 50;
        }
      };

      lines.forEach(({ text, type }) => {
        let fontSize, bold, spaceAfter, spaceBefore, lineColor;

        switch (type) {
          case 'h1':
            fontSize = 20; bold = true; spaceBefore = 16; spaceAfter = 8; lineColor = '#1a1a2e';
            break;
          case 'h2':
            fontSize = 13; bold = true; spaceBefore = 12; spaceAfter = 5; lineColor = '#0e4fad';
            break;
          case 'h3':
            fontSize = 11; bold = true; spaceBefore = 8; spaceAfter = 4; lineColor = '#333333';
            break;
          case 'li':
            fontSize = 10; bold = false; spaceBefore = 2; spaceAfter = 2; lineColor = '#222222';
            break;
          default:
            fontSize = 10; bold = false; spaceBefore = 3; spaceAfter = 3; lineColor = '#222222';
        }

        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setTextColor(lineColor);

        // Wrap long lines
        const wrappedLines = pdf.splitTextToSize(text, usableWidth);
        const blockHeight = wrappedLines.length * fontSize * 1.3;

        addNewPageIfNeeded(spaceBefore + blockHeight + spaceAfter);

        y += spaceBefore;

        // Draw a bottom border line for h2 section headers
        if (type === 'h2') {
          pdf.setDrawColor('#0e4fad');
          pdf.setLineWidth(0.5);
          wrappedLines.forEach((line) => {
            pdf.text(line, marginLeft, y);
            y += fontSize * 1.3;
          });
          pdf.line(marginLeft, y, pageWidth - marginRight, y);
          y += 2;
        } else {
          wrappedLines.forEach((line) => {
            pdf.text(line, marginLeft, y);
            y += fontSize * 1.3;
          });
        }

        y += spaceAfter;
      });

      pdf.save(finalFileName);
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
