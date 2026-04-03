'use client';
import { forwardRef } from 'react';

// Using forwardRef so we can target this DOM node for PDF export
const CVPreview = ({ content }) => {
  if (!content) return null;

  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', overflow: 'auto', maxHeight: '600px' }}>
      <div 
        className="cv-document"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

CVPreview.displayName = 'CVPreview';

export default CVPreview;
