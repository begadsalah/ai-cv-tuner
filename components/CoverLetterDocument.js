import React from 'react';
import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  text: {
    fontSize: 11,
    color: '#333333',
    lineHeight: 1.6,
    marginBottom: 10,
  },
});

const CoverLetterDocument = ({ content }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.text}>{content}</Text>
      </Page>
    </Document>
  );
};

export default CoverLetterDocument;
