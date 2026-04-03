import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const OptimizedCVDocument = ({ htmlContent, settings = {} }) => {
  const {
    fontSize = 10.5,
    marginTop = 35,
    marginBottom = 65,
    marginLeft = 35,
    marginRight = 35,
  } = settings;

  const styles = StyleSheet.create({
    page: {
      paddingTop: marginTop,
      paddingBottom: marginBottom,
      paddingLeft: marginLeft,
      paddingRight: marginRight,
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
    },
    footer: {
      position: 'absolute',
      fontSize: Math.max(fontSize * 0.8, 8),
      bottom: Math.max(marginBottom * 0.4, 20),
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#999999',
    },
    h1: {
      fontSize: fontSize * 2,
      fontWeight: 'bold',
      marginBottom: fontSize * 0.4,
      color: '#1a1a2e',
    },
    h2: {
      fontSize: fontSize * 1.25,
      fontWeight: 'bold',
      color: '#0e4fad',
      textTransform: 'uppercase',
      borderBottomWidth: 1.5,
      borderBottomColor: '#0e4fad',
      paddingBottom: 2,
      marginTop: fontSize * 1.2,
      marginBottom: fontSize * 0.6,
    },
    h3: {
      fontSize: fontSize * 1.05,
      fontWeight: 'bold',
      marginTop: fontSize * 0.6,
      marginBottom: fontSize * 0.3,
      color: '#333333',
    },
    p: {
      fontSize: fontSize,
      color: '#333333',
      marginBottom: fontSize * 0.3,
      lineHeight: 1.5,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: fontSize * 0.3,
      paddingLeft: 10,
    },
    bulletPoint: {
      width: 10,
      fontSize: fontSize,
    },
    listText: {
      flex: 1,
      fontSize: fontSize,
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

  /**
   * ROBUST SCANNER:
   * Instead of just looking for tags, this splits the HTML by any tag,
   * keeping track of the current active tag type. Any text between tags
   * is captured and rendered based on the last active tag or as <p> by default.
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

    // Normalize: remove comments and extra whitespace
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').trim();
    
    // Split by any HTML tag
    const parts = cleanHtml.split(/(<[^>]+>)/g);
    const components = [];
    let currentTag = 'p';
    let listItems = [];
    let inList = false;

    parts.forEach((part, index) => {
      if (part.startsWith('<')) {
        // It's a tag
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
            // End of list, render all collected items
            if (listItems.length > 0) {
              components.push(
                <View key={`list-${index}`} style={{ marginBottom: 6 }}>
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
        // It's text content
        const text = decodeEntities(part.trim());
        if (!text) return;

        if (inList && currentTag === 'li') {
          listItems.push(text);
        } else {
          // Normal block text
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
      <Page size="A4" style={styles.page}>
        <View>{parseHTMLContent(htmlContent)}</View>
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
