import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';

interface CompetitiveInsightsTextSectionProps {
  insights: string;
  orientation?: 'portrait' | 'landscape';
}

// Componente de markdown para procesar texto con formato
const InsightMarkdownText: React.FC<{ text: string; orientation?: 'portrait' | 'landscape' }> = ({
  text,
  orientation = 'portrait',
}) => {
  if (!text) return null;

  const isLandscape = orientation === 'landscape';
  const fontSize = isLandscape ? 11 : 12; // Reducir ligeramente el tamaño de fuente en landscape
  const lineHeight = isLandscape ? 1.4 : 1.5; // Ajustar line-height para landscape

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

          // Procesar texto en negrita y bullets
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
  orientation = 'portrait',
}) => {
  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title="Competitive Insights" />
        <InsightMarkdownText text={insights} orientation={orientation} />
      </View>
      <Footer />
    </Page>
  );
};
