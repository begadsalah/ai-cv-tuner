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

const OptimizedCVDocument = ({ cvData, settings = {} }) => {
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
      <Text style={styles.bulletPoint}>•</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  );

  const renderModularContent = (cvData) => {
    if (!cvData) return null;
    const components = [];

    // Personal Info (Implicit H1 and subtitle block)
    if (cvData.personal_info) {
      if (cvData.personal_info.name) components.push(<Text key="name" style={styles.h1}>{cvData.personal_info.name}</Text>);
      if (cvData.personal_info.contact_details) components.push(<Text key="contact" style={styles.p}>{cvData.personal_info.contact_details}</Text>);
    }

    // Generic Section Renderer
    const renderSection = (key, dataBlock) => {
      if (!dataBlock || (!dataBlock.content && (!dataBlock.items || dataBlock.items.length === 0))) return;
      
      components.push(<Text key={`h2-${key}`} style={styles.h2}>{dataBlock.section_title}</Text>);

      if (dataBlock.content) {
        components.push(<Text key={`p-${key}`} style={styles.p}>{dataBlock.content}</Text>);
      }

      if (dataBlock.items && Array.isArray(dataBlock.items)) {
        dataBlock.items.forEach((item, index) => {
          if (typeof item === 'string') {
             // Simple array (Skills, Languages)
             components.push(<Text key={`item-${key}-${index}`} style={styles.p}>{item}</Text>);
          } else {
             // Complex block (Experience, Education, Custom Projects)
             if (item.title) components.push(<Text key={`h3-${key}-${index}`} style={styles.h3}>{item.title}</Text>);
             
             let subtext = [];
             if (item.company) subtext.push(item.company);
             if (item.school) subtext.push(item.school);
             if (item.date) subtext.push(item.date);
             if (subtext.length > 0) {
               components.push(<Text key={`sub-${key}-${index}`} style={styles.p}>{subtext.join(' | ')}</Text>);
             }
             if (item.description) {
               components.push(<Text key={`desc-${key}-${index}`} style={styles.p}>{item.description}</Text>);
             }

             if (item.bullets && Array.isArray(item.bullets) && item.bullets.length > 0) {
               components.push(
                 <View key={`list-${key}-${index}`} style={{ marginBottom: sectionSpacing * 0.8 }} wrap={true}>
                   {item.bullets.map((b, idx) => (
                     <BulletPoint key={`li-${key}-${index}-${idx}`}>{b}</BulletPoint>
                   ))}
                 </View>
               );
             }
          }
        });
      }
    };

    renderSection('summary', cvData.summary);
    renderSection('experience', cvData.experience);
    renderSection('education', cvData.education);
    renderSection('skills', cvData.skills);
    renderSection('languages', cvData.languages);
    renderSection('custom_projects', cvData.custom_projects);

    return components;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={true}>
        {renderModularContent(cvData)}
        
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
