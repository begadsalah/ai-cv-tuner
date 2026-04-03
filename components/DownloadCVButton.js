'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';

export default function DownloadCVButton({ htmlContent, disabled, defaultFileName = 'Optimized_CV' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = () => {
    if (!htmlContent || disabled) return;

    setIsExporting(true);

    // Open a clean white print window with the CV content
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const printDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Optimized CV</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: white;
      padding: 40px 50px;
      line-height: 1.6;
    }

    h1 {
      font-size: 22pt;
      font-weight: 700;
      color: #0a0a23;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #1a4fad;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 1.5px solid #1a4fad;
      padding-bottom: 3px;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-top: 10px;
      margin-bottom: 3px;
    }

    p {
      font-size: 10.5pt;
      color: #2c2c2c;
      margin-bottom: 5px;
    }

    ul {
      padding-left: 18px;
      margin-bottom: 6px;
    }

    li {
      font-size: 10.5pt;
      color: #2c2c2c;
      margin-bottom: 3px;
    }

    @media print {
      body { padding: 20px 30px; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  ${htmlContent}
  <script>
    // Auto-trigger print dialog once fonts load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 600);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printDoc);
    printWindow.document.close();

    setTimeout(() => setIsExporting(false), 1200);
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
      {isExporting ? 'Opening...' : 'Download PDF'}
    </button>
  );
}
