'use client';

import { forwardRef } from 'react';

const CoverLetterTab = forwardRef(({ content }, ref) => {
  if (!content) return null;
  
  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', overflow: 'auto', maxHeight: '600px' }}>
      <div 
        ref={ref}
        style={{ background: 'white', color: 'black', padding: '40px', fontFamily: 'Arial, sans-serif', fontSize: '11pt', lineHeight: 1.6, whiteSpace: 'pre-wrap', minHeight: '800px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
      >
        {content}
      </div>
    </div>
  );
});

CoverLetterTab.displayName = 'CoverLetterTab';

export default CoverLetterTab;
