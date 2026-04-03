import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  // Environment-safe parser using Regex for predictable AI output.
  // Handles <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>.
  const parseHTMLContent = (html) => {
    if (!html) return [];

    // Helper to decode basic entities
    const decodeEntities = (str) => 
      str.replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'")
         .replace(/&nbsp;/g, ' ');

    const components = [];
    // Matches blocks: <h1>...</h1>, <h2>...</h2>, <h3>...</h3>, <p>...</p>, <ul>...</ul>, <ol>...</ol>
    const blockRegex = /<(h1|h2|h3|p|ul|ol)[^>]*>(.*?)<\/\1>/gis;
    let match;

    while ((match = blockRegex.exec(html)) !== null) {
      const tag = match[1].toLowerCase();
      const rawContent = match[2];
      const content = decodeEntities(rawContent.replace(/<[^>]+>/g, '').trim());

      switch (tag) {
        case 'h1':
          components.push(<Text key={match.index} style={styles.h1}>{content}</Text>);
          break;
        case 'h2':
          components.push(<Text key={match.index} style={styles.h2}>{content}</Text>);
          break;
        case 'h3':
          components.push(<Text key={match.index} style={styles.h3}>{content}</Text>);
          break;
        case 'p':
          if (content) components.push(<Text key={match.index} style={styles.p}>{content}</Text>);
          break;
        case 'ul':
        case 'ol':
          // Sub-parse <li> tags
          const liRegex = /<li[^>]*>(.*?)<\/li>/gis;
          let liMatch;
          const listItems = [];
          while ((liMatch = liRegex.exec(rawContent)) !== null) {
            const liContent = decodeEntities(liMatch[1].replace(/<[^>]+>/g, '').trim());
            if (liContent) listItems.push(liContent);
          }
          if (listItems.length > 0) {
            components.push(
              <View key={match.index} style={{ marginBottom: 6 }}>
                {listItems.map((item, idx) => (
                  <BulletPoint key={`${match.index}-${idx}`}>{item}</BulletPoint>
                ))}
              </View>
            );
          }
          break;
        default:
          break;
      }
    }

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
