import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';

interface CompetitiveInsightsTextSectionProps {
  insights: string;
}

// Componente de markdown para procesar texto con formato
const InsightMarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <View style={{ marginBottom: 20, marginTop: 20 }}>
      {text.split('\n').map((line, index) => {
        if (!line.trim()) return null;
        
        // Procesar texto en negrita y bullets
        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        return (
          <Text key={index} style={{ 
            fontSize: 12, 
            color: '#333', 
            marginBottom: 8, 
            lineHeight: 1.5,
            paddingLeft: line.startsWith('•') ? 12 : 0
          }}>
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
      }).filter(Boolean)}
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
}) => {
  return (
    <Page size="A4" orientation="portrait" style={styles.page}>
      <View style={styles.section}>
        <Header title="Competitive Insights" />
        <InsightMarkdownText text={insights} />
      </View>
      <Footer />
    </Page>
  );
}; 