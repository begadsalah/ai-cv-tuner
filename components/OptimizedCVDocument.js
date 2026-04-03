import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Standard fonts work best, but we can style them.
// Arial/Helvetica equivalents like 'Helvetica' are built-in.
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  footer: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#999999',
  },
  section: {
    marginBottom: 10,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1a1a2e',
  },
  h2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0e4fad',
    textTransform: 'uppercase',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0e4fad',
    paddingBottom: 4,
    marginTop: 14,
    marginBottom: 8,
  },
  h3: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#333333',
  },
  p: {
    fontSize: 10.5,
    color: '#333333',
    marginBottom: 5,
    lineHeight: 1.5,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 12,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10.5,
  },
  listText: {
    flex: 1,
    fontSize: 10.5,
    color: '#333333',
    lineHeight: 1.5,
  },
});

const BulletPoint = ({ children }) => (
  <View style={styles.listItem}>
    <Text style={styles.bulletPoint}>•</Text>
    <Text style={styles.listText}>{children}</Text>
  </View>
);

const OptimizedCVDocument = ({ htmlContent }) => {
  // Simple parser to extract data from HTML-like markers.
  // Since Gemini returns structured markers like <h1> and <li>,
  // we can map them to @react-pdf components.
  
  const parseHTML = (html) => {
    if (!html) return [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    
    return nodes.map((node, index) => {
      const tag = node.nodeName.toLowerCase();
      const content = node.textContent?.trim();
      
      if (!content && tag !== 'ul' && tag !== 'ol') return null;
      
      switch (tag) {
        case 'h1':
          return <Text key={index} style={styles.h1}>{content}</Text>;
        case 'h2':
          return <Text key={index} style={styles.h2}>{content}</Text>;
        case 'h3':
          return <Text key={index} style={styles.h3}>{content}</Text>;
        case 'p':
          return <Text key={index} style={styles.p}>{content}</Text>;
        case 'ul':
        case 'ol':
          const items = Array.from(node.querySelectorAll('li'));
          return (
            <View key={index} style={{ marginBottom: 6 }}>
              {items.map((li, liIndex) => (
                <BulletPoint key={liIndex}>{li.textContent?.trim()}</BulletPoint>
              ))}
            </View>
          );
        default:
          return <Text key={index} style={styles.p}>{content}</Text>;
      }
    }).filter(Boolean);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>{parseHTML(htmlContent)}</View>
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default OptimizedCVDocument;
