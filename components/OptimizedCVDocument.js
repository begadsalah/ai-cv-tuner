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
      fontSize: fontSize * 0.85,
      bottom: marginBottom * 0.5,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#999999',
    },
    h1: {
      fontSize: fontSize * 2.2,
      fontWeight: 'bold',
      marginBottom: fontSize * 0.5,
      color: '#1a1a2e',
    },
    h2: {
      fontSize: fontSize * 1.3,
      fontWeight: 'bold',
      color: '#0e4fad',
      textTransform: 'uppercase',
      borderBottomWidth: 1.5,
      borderBottomColor: '#0e4fad',
      paddingBottom: 4,
      marginTop: fontSize * 1.3,
      marginBottom: fontSize * 0.8,
    },
    h3: {
      fontSize: fontSize * 1.1,
      fontWeight: 'bold',
      marginTop: fontSize * 0.8,
      marginBottom: fontSize * 0.4,
      color: '#333333',
    },
    p: {
      fontSize: fontSize,
      color: '#333333',
      marginBottom: fontSize * 0.4,
      lineHeight: 1.5,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: fontSize * 0.4,
      paddingLeft: 12,
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

  // Environment-safe parser using Regex for predictable AI output.
  // Handles <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>.
  const parseHTMLContent = (html) => {
    if (!html) return [];

    const decodeEntities = (str) =>
      str.replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'")
         .replace(/&nbsp;/g, ' ');

    const components = [];
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
