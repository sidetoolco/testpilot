import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { PDFOrientation } from '../types';

interface VariantAIInsightsSectionProps {
  variantKey: string;
  variantTitle: string;
  insights: {
    purchase_drivers?: string;
    competitive_insights?: string;
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
  const fontSize = isLandscape ? 10 : 11;
  const lineHeight = isLandscape ? 1.3 : 1.4;

  return (
    <View
      style={{
        marginBottom: isLandscape ? 10 : 15,
        marginTop: isLandscape ? 10 : 15,
      }}
    >
      {text
        .split('\n')
        .map((line, index) => {
          if (!line.trim()) return null;

          // Procesar texto en negrita y bullets
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <Text
              key={index}
              style={{
                fontSize: fontSize,
                color: '#333',
                marginBottom: isLandscape ? 4 : 6,
                lineHeight: lineHeight,
                paddingLeft: line.startsWith('•') ? 10 : 0,
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

export const VariantAIInsightsSection: React.FC<VariantAIInsightsSectionProps> = ({
  variantKey,
  variantTitle,
  insights,
  orientation = 'landscape',
}) => {
  const isLandscape = orientation === 'landscape';
  const hasPurchaseDrivers = insights?.purchase_drivers && insights.purchase_drivers.trim();
  const hasCompetitiveInsights = insights?.competitive_insights && insights.competitive_insights.trim();

  if (!hasPurchaseDrivers && !hasCompetitiveInsights) {
    return (
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.section}>
          <Header title={`AI Insights - Variant ${variantKey.toUpperCase()}`} />
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No AI insights available for this variant
          </Text>
        </View>
        <Footer />
      </Page>
    );
  }

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title={`AI Insights - Variant ${variantKey.toUpperCase()}`} />

        {hasPurchaseDrivers && insights.purchase_drivers && (
          <View style={{ marginBottom: isLandscape ? 15 : 20 }}>
            <Text
              style={{
                fontSize: isLandscape ? 12 : 14,
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: isLandscape ? 8 : 10,
              }}
            >
              Purchase Drivers Analysis
            </Text>
            <InsightMarkdownText text={insights.purchase_drivers} orientation={orientation} />
          </View>
        )}

        {hasCompetitiveInsights && insights.competitive_insights && (
          <View style={{ marginBottom: isLandscape ? 15 : 20 }}>
            <Text
              style={{
                fontSize: isLandscape ? 12 : 14,
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: isLandscape ? 8 : 10,
              }}
            >
              Competitive Analysis
            </Text>
            <InsightMarkdownText text={insights.competitive_insights} orientation={orientation} />
          </View>
        )}
      </View>
      <Footer />
    </Page>
  );
}; 