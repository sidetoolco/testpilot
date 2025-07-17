import React from 'react';
import { Page, View, Text, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { MarkdownText } from '../utils/MarkdownText';
import { PDFOrientation } from '../types';

interface RecommendationsPDFSectionProps {
  insights: string;
  orientation?: PDFOrientation;
}

export const RecommendationsPDFSection: React.FC<RecommendationsPDFSectionProps> = ({
  insights,
  orientation = 'landscape',
}) => {
  if (!insights) return null;
  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title="Recommendations" />
        <MarkdownText text={insights} orientation={orientation} />
      </View>
      <View
        style={{
          borderTop: '1px solid #000000',
          paddingTop: 20,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          src="https://TestPilotCPG.com"
          style={{ color: 'black', fontSize: 12, fontWeight: 'bold', textDecoration: 'none' }}
        >
          TestPilotCPG.com
        </Link>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }: { pageNumber: number }) => `${pageNumber}`}
        />
      </View>
    </Page>
  );
};
