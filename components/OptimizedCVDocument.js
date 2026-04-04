import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a custom TrueType Font. 
// Using a standard embedded TTF font (like Roboto here) GUARANTEES that the generated PDF 
// assigns the correct Unicode character maps. This completely solves "Problem 3", 
// ensuring that the PDF is fully readable and parsable when re-uploaded.
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

const OptimizedCVDocument = ({ htmlContent, settings = {} }) => {
  // Configurable layout parameters addressing Problem 2
  const {
    fontSize = 10.5,
    marginTop = 35,
    marginBottom = 65,
    marginLeft = 35,
    marginRight = 35,
    lineSpacing = 1.5,
    sectionSpacing = 12,
  } = settings;

  const styles = StyleSheet.create({
    page: {
      paddingTop: marginTop,
      paddingBottom: marginBottom,
      paddingLeft: marginLeft,
      paddingRight: marginRight,
      backgroundColor: '#ffffff',
      fontFamily: 'Roboto', // Critical for correct reading/parsing by external tools
    },
    footer: {
      position: 'absolute',
      fontSize: Math.max(fontSize * 0.8, 8),
      bottom: Math.max(marginBottom * 0.4, 15),
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#999999',
    },
    h1: {
      fontSize: fontSize * 2.2,
      fontWeight: 'bold',
      marginBottom: sectionSpacing * 0.5,
      color: '#1a1a2e',
      lineHeight: lineSpacing,
    },
    h2: {
      fontSize: fontSize * 1.3,
      fontWeight: 'bold',
      color: '#0e4fad',
      textTransform: 'uppercase',
      borderBottomWidth: 1.5,
      borderBottomColor: '#0e4fad',
      paddingBottom: 2,
      marginTop: sectionSpacing * 1.2,
      marginBottom: sectionSpacing * 0.8,
      lineHeight: lineSpacing,
    },
    h3: {
      fontSize: fontSize * 1.1,
      fontWeight: 'bold',
      marginTop: sectionSpacing * 0.8,
      marginBottom: sectionSpacing * 0.4,
      color: '#333333',
      lineHeight: lineSpacing,
    },
    p: {
      fontSize: fontSize,
      color: '#333333',
      marginBottom: sectionSpacing * 0.5,
      lineHeight: lineSpacing,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: sectionSpacing * 0.3,
      paddingLeft: 10,
    },
    bulletPoint: {
      width: 12,
      fontSize: fontSize,
      fontWeight: 'bold',
      color: '#333333',
    },
    listText: {
      flex: 1,
      fontSize: fontSize,
      color: '#333333',
      lineHeight: lineSpacing,
    },
  });

  const BulletPoint = ({ children }) => (
    <View style={styles.listItem} wrap={false}> 
      {/* "wrap={false}" inside an LI ensures we don't awkwardly split a single bullet across two pages */}
      <Text style={styles.bulletPoint}>•</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  );

  /**
   * ROBUST SCANNER (Safe HTML-to-PDF rendering without DOMParser)
   * Captures 100% of text and safely maps them to PDF components.
   */
  const parseHTMLContent = (html) => {
    if (!html) return [];

    const decodeEntities = (str) =>
      str.replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'")
         .replace(/&nbsp;/g, ' ');

    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').trim();
    const parts = cleanHtml.split(/(<[^>]+>)/g);
    
    const components = [];
    let currentTag = 'p';
    let listItems = [];
    let inList = false;

    parts.forEach((part, index) => {
      if (part.startsWith('<')) {
        const tagName = part.replace(/[<>\/]/g, '').split(' ')[0].toLowerCase();
        const isClosing = part.startsWith('</');

        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
          if (!isClosing) {
            currentTag = tagName;
          } else {
            currentTag = 'p';
          }
        } else if (['ul', 'ol'].includes(tagName)) {
          if (!isClosing) {
            inList = true;
            listItems = [];
          } else {
            if (listItems.length > 0) {
              components.push(
                // wrap={true} explicitly lets the list container break across pages if needed
                <View key={`list-${index}`} style={{ marginBottom: sectionSpacing * 0.8 }} wrap={true}>
                  {listItems.map((item, idx) => (
                    <BulletPoint key={`li-${index}-${idx}`}>{item}</BulletPoint>
                  ))}
                </View>
              );
            }
            inList = false;
            listItems = [];
          }
        } else if (tagName === 'li' && !isClosing) {
          currentTag = 'li';
        }
      } else {
        const text = decodeEntities(part.trim());
        if (!text) return;

        if (inList && currentTag === 'li') {
          listItems.push(text);
        } else {
          // Standard text rendering 
          const styleKey = ['h1', 'h2', 'h3'].includes(currentTag) ? currentTag : 'p';
          components.push(
            <Text key={`text-${index}`} style={styles[styleKey]}>
              {text}
            </Text>
          );
        }
      }
    });

    return components;
  };

  return (
    <Document>
      {/* 
        Problem 1 Fix: 
        We pass the parsed array directly as children to `<Page>`. 
        Removing outer <View> wrappers automatically lets @react-pdf/renderer execute 
        its native pagination logic safely across multiple pages.
      */}
      <Page size="A4" style={styles.page} wrap={true}>
        {parseHTMLContent(htmlContent)}
        
        {/* Dynamic Multi-Page Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default OptimizedCVDocument;
