import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { PDFOrientation } from '../types';

interface CompetitiveInsightsTextSectionProps {
  insights: string;
  allVariantInsights?: {
    [key: string]: string;
  };
  orientation?: PDFOrientation;
}

// Componente de markdown para procesar texto con formato
const InsightMarkdownText: React.FC<{ text: string; orientation?: PDFOrientation }> = ({
  text,
  orientation = 'portrait',
}) => {
  if (!text) return null;

  const isLandscape = orientation === 'landscape';
  const fontSize = isLandscape ? 11 : 12;
  const lineHeight = isLandscape ? 1.4 : 1.5;

  return (
    <View
      style={{
        marginBottom: isLandscape ? 15 : 20,
        marginTop: isLandscape ? 15 : 20,
      }}
    >
      {text
        .split('\n')
        .map((line, index) => {
          if (!line.trim()) return null;

          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <Text
              key={index}
              style={{
                fontSize: fontSize,
                color: '#333',
                marginBottom: isLandscape ? 6 : 8,
                lineHeight: lineHeight,
                paddingLeft: line.startsWith('•') ? 12 : 0,
              }}
            >
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <Text key={partIndex} style={{ fontWeight: 'bold' }}>
                      {part.slice(2, -2)}
                    </Text>
                  );
                }
                return part;
              })}
            </Text>
          );
        })
        .filter(Boolean)}
    </View>
  );
};

const Footer: React.FC = () => (
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
);

export const CompetitiveInsightsTextSection: React.FC<CompetitiveInsightsTextSectionProps> = ({
  insights,
  allVariantInsights,
  orientation = 'landscape',
}) => {
  const isLandscape = orientation === 'landscape';
  const hasVariantInsights = allVariantInsights && Object.keys(allVariantInsights).length > 0;

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title="Competitive Insights" />
        
        {hasVariantInsights && Object.entries(allVariantInsights).map(([variantKey, variantInsight]) => {
          if (!variantInsight || !variantInsight.trim()) return null;
          
          return (
            <View key={variantKey} style={{ marginBottom: isLandscape ? 20 : 25 }}>
              <Text
                style={{
                  fontSize: isLandscape ? 12 : 14,
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: isLandscape ? 8 : 10,
                }}
              >
                Variant {variantKey.toUpperCase()} Competitive Analysis
              </Text>
              <InsightMarkdownText text={variantInsight} orientation={orientation} />
            </View>
          );
        })}

        {!hasVariantInsights && (
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No competitive insights available
          </Text>
        )}
      </View>
      <Footer />
    </Page>
  );
};
