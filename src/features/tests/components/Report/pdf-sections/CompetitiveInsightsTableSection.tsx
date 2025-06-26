import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { Header } from './Header';
import { styles } from '../utils/styles';
import { PDFOrientation } from '../types';

interface Competitor {
  competitor_product_id: {
    title: string;
  };
  share_of_buy: number;
  value: number;
  aesthetics: number;
  convenience: number;
  trust: number;
  utility: number;
}

interface CompetitiveInsightsTableSectionProps {
  variantKey: string;
  variantTitle: string;
  competitiveinsights: Competitor[];
  orientation?: PDFOrientation;
}

// Constants for styling
const TABLE_STYLES = {
  container: {
    marginTop: 16,
    borderRadius: 4,
    border: '1px solid #E0E0E0',
    width: '100%',
  },
  header: {
    flexDirection: 'row' as const,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  headerCellFirst: {
    width: '30%',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-start' as const,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingLeft: 8,
    paddingVertical: 8,
  },
  headerCell: {
    width: '11.6%',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingVertical: 8,
  },
  headerCellLast: {
    width: '11.6%',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center' as const,
  },
  row: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  lastRow: {
    flexDirection: 'row' as const,
    width: '100%',
  },
  productCell: {
    width: '30%',
    fontSize: 11,
    textAlign: 'left' as const,
    padding: '8px',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  metricCell: {
    width: '11.6%',
    fontSize: 11,
    textAlign: 'center' as const,
    padding: '8px 4px',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  metricCellLast: {
    width: '11.6%',
    fontSize: 11,
    textAlign: 'center' as const,
    padding: '8px 4px',
  },
  tableTitle: {
    fontSize: 12,
    color: '#374151',
    padding: '8px 12px',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E0E0E0',
    textAlign: 'right' as const,
    paddingRight: 100,
  },
};

const truncateTitle = (title: string, maxLength: number = 25): string => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};

const getColorStyle = (value: number) => {
  if (value > 0) return { backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 8px' }; // verde para valores positivos
  if (value < 0) return { backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 8px' }; // rojo para valores negativos
  return { backgroundColor: '#FEF9C3', color: '#854D0E', padding: '4px 8px' }; // amarillo para valor cero
};

const calculateAverageMetrics = (competitors: Competitor[]) => {
  if (!competitors.length) return null;

  const sum = competitors.reduce(
    (acc, curr) => ({
      value: acc.value + curr.value,
      aesthetics: acc.aesthetics + curr.aesthetics,
      convenience: acc.convenience + curr.convenience,
      trust: acc.trust + curr.trust,
      utility: acc.utility + curr.utility,
    }),
    { value: 0, aesthetics: 0, convenience: 0, trust: 0, utility: 0 }
  );

  return {
    value: sum.value / competitors.length,
    aesthetics: sum.aesthetics / competitors.length,
    convenience: sum.convenience / competitors.length,
    trust: sum.trust / competitors.length,
    utility: sum.utility / competitors.length,
  };
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

export const CompetitiveInsightsTableSection: React.FC<CompetitiveInsightsTableSectionProps> = ({
  variantKey,
  variantTitle,
  competitiveinsights,
  orientation = 'portrait',
}) => {
  const isLandscape = orientation === 'landscape';

  // Ajustar estilos para landscape
  const tableStyles = {
    ...TABLE_STYLES,
    container: {
      ...TABLE_STYLES.container,
      marginTop: isLandscape ? 8 : 16,
    },
    headerCellFirst: {
      ...TABLE_STYLES.headerCellFirst,
      paddingLeft: isLandscape ? 4 : 8,
      paddingVertical: isLandscape ? 4 : 8,
    },
    headerCell: {
      ...TABLE_STYLES.headerCell,
      paddingVertical: isLandscape ? 4 : 8,
    },
    headerCellLast: {
      ...TABLE_STYLES.headerCellLast,
      paddingVertical: isLandscape ? 4 : 8,
    },
    headerText: {
      ...TABLE_STYLES.headerText,
      fontSize: isLandscape ? 9 : 11,
    },
    productCell: {
      ...TABLE_STYLES.productCell,
      fontSize: isLandscape ? 9 : 11,
      padding: isLandscape ? '4px' : '8px',
    },
    metricCell: {
      ...TABLE_STYLES.metricCell,
      fontSize: isLandscape ? 9 : 11,
      padding: isLandscape ? '4px 2px' : '8px 4px',
    },
    metricCellLast: {
      ...TABLE_STYLES.metricCellLast,
      fontSize: isLandscape ? 9 : 11,
      padding: isLandscape ? '4px 2px' : '8px 4px',
    },
    tableTitle: {
      ...TABLE_STYLES.tableTitle,
      fontSize: isLandscape ? 10 : 12,
      padding: isLandscape ? '4px 8px' : '8px 12px',
      paddingRight: isLandscape ? 60 : 100,
    },
  };

  if (!competitiveinsights || competitiveinsights.length === 0) {
    return (
      <Page size="A4" orientation={orientation} style={{ padding: 30, backgroundColor: '#fff' }}>
        <View style={styles.section}>
          <Header title={`Competitive Insights - Variant ${variantKey.toUpperCase()}`} />
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No competitive insights data available for this variant
          </Text>
        </View>
        <Footer />
      </Page>
    );
  }

  const averageMetrics = calculateAverageMetrics(competitiveinsights);

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title={`Competitive Insights - Variant ${variantKey.toUpperCase()}`} />

        {averageMetrics && (
          <View
            style={{
              marginTop: isLandscape ? 12 : 24,
              marginBottom: isLandscape ? 12 : 20,
              padding: isLandscape ? 12 : 16,
              backgroundColor: '#F8FAFC',
              borderRadius: 4,
              border: '1px solid #E0E0E0',
            }}
          >
            <Text
              style={{
                fontSize: isLandscape ? 12 : 14,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: isLandscape ? 8 : 12,
              }}
            >
              Average metrics your product vs the competitors
            </Text>
            <View
              style={{
                flexDirection: 'row' as const,
                justifyContent: 'space-between' as const,
                flexWrap: 'wrap' as const,
                gap: isLandscape ? 12 : 16,
              }}
            >
              <Text style={{ fontSize: isLandscape ? 9 : 11, color: '#374151' }}>
                Value: {averageMetrics.value.toFixed(1)}
              </Text>
              <Text style={{ fontSize: isLandscape ? 9 : 11, color: '#374151' }}>
                Aesthetics: {averageMetrics.aesthetics.toFixed(1)}
              </Text>
              <Text style={{ fontSize: isLandscape ? 9 : 11, color: '#374151' }}>
                Convenience: {averageMetrics.convenience.toFixed(1)}
              </Text>
              <Text style={{ fontSize: isLandscape ? 9 : 11, color: '#374151' }}>
                Trust: {averageMetrics.trust.toFixed(1)}
              </Text>
              <Text style={{ fontSize: isLandscape ? 9 : 11, color: '#374151' }}>
                Utility: {averageMetrics.utility.toFixed(1)}
              </Text>
            </View>
          </View>
        )}

        <View style={tableStyles.container}>
          <Text style={tableStyles.tableTitle}>Your Item vs Competitor</Text>
          <View style={tableStyles.header}>
            <View style={tableStyles.headerCellFirst}>
              <Text style={tableStyles.headerText}>Competitor</Text>
            </View>
            <View style={tableStyles.headerCell}>
              <Text style={tableStyles.headerText}>Share</Text>
            </View>
            <View style={tableStyles.headerCell}>
              <Text style={tableStyles.headerText}>Value</Text>
            </View>
            <View style={tableStyles.headerCell}>
              <Text style={tableStyles.headerText}>Appearance</Text>
            </View>
            <View style={tableStyles.headerCell}>
              <Text style={tableStyles.headerText}>Convenience</Text>
            </View>
            <View style={tableStyles.headerCell}>
              <Text style={tableStyles.headerText}>Trust</Text>
            </View>
            <View style={tableStyles.headerCellLast}>
              <Text style={tableStyles.headerText}>Confidence</Text>
            </View>
          </View>
          {competitiveinsights.map((competitor, index) => (
            <View
              key={index}
              style={
                index === competitiveinsights.length - 1 ? TABLE_STYLES.lastRow : TABLE_STYLES.row
              }
            >
              <Text style={tableStyles.productCell}>
                {truncateTitle(competitor.competitor_product_id.title, isLandscape ? 20 : 25)}
              </Text>
              <Text style={tableStyles.metricCell}>{Math.round(competitor.share_of_buy)}%</Text>
              <Text style={{ ...tableStyles.metricCell, ...getColorStyle(competitor.value) }}>
                {competitor.value.toFixed(1)}
              </Text>
              <Text style={{ ...tableStyles.metricCell, ...getColorStyle(competitor.aesthetics) }}>
                {competitor.aesthetics.toFixed(1)}
              </Text>
              <Text style={{ ...tableStyles.metricCell, ...getColorStyle(competitor.convenience) }}>
                {competitor.convenience.toFixed(1)}
              </Text>
              <Text style={{ ...tableStyles.metricCell, ...getColorStyle(competitor.trust) }}>
                {competitor.trust.toFixed(1)}
              </Text>
              <Text style={{ ...tableStyles.metricCellLast, ...getColorStyle(competitor.utility) }}>
                {competitor.utility.toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Footer />
    </Page>
  );
};
