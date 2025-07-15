import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { Header } from './Header';
import { MarkdownText } from '../utils/MarkdownText';
import { styles } from '../utils/styles';

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

interface CompetitiveInsightsPDFSectionProps {
  competitiveinsights: Competitor[];
  insights?: string;
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
  averageMetricsContainer: {
    marginTop: 24,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    border: '1px solid #E0E0E0',
  },
  averageMetricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  averageMetricsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  averageMetricItem: {
    fontSize: 11,
    color: '#374151',
  },
  pageHeader: {
    marginBottom: 24,
    padding: '0 30px',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  footer: {
    borderTop: '1px solid #E0E0E0',
    paddingTop: 20,
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 24,
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

// Deduplicate competitors by product ID and sum their share_of_buy values
const deduplicateCompetitors = (competitors: Competitor[]): Competitor[] => {
  const uniqueMap = new Map<string, Competitor>();
  
  competitors.forEach(competitor => {
    const productId = competitor.competitor_product_id.title; // Using title as unique identifier
    
    if (uniqueMap.has(productId)) {
      // If duplicate found, sum the share_of_buy values
      const existing = uniqueMap.get(productId)!;
      existing.share_of_buy += competitor.share_of_buy;
    } else {
      uniqueMap.set(productId, { ...competitor });
    }
  });
  
  return Array.from(uniqueMap.values());
};

// Normalize share_of_buy values so total equals 100%
const normalizeShareOfBuy = (competitors: Competitor[]): Competitor[] => {
  if (!competitors.length) return competitors;
  
  // First, deduplicate competitors
  const deduplicatedCompetitors = deduplicateCompetitors(competitors);
  
  // Filter out any competitors with invalid share_of_buy values
  const validCompetitors = deduplicatedCompetitors.filter(competitor => 
    typeof competitor.share_of_buy === 'number' && 
    !isNaN(competitor.share_of_buy) && 
    competitor.share_of_buy > 0
  );
  
  if (validCompetitors.length === 0) return competitors;
  
  const totalShare = validCompetitors.reduce((sum, competitor) => sum + competitor.share_of_buy, 0);
  
  // If total is 0 or very small, return original data
  if (totalShare <= 0) return competitors;
  
  // If total is already 100% or very close, return as is
  if (Math.abs(totalShare - 100) < 0.01) return deduplicatedCompetitors;
  
  // Normalize each competitor's share
  return deduplicatedCompetitors.map(competitor => {
    if (typeof competitor.share_of_buy === 'number' && !isNaN(competitor.share_of_buy) && competitor.share_of_buy > 0) {
      return {
        ...competitor,
        share_of_buy: (competitor.share_of_buy / totalShare) * 100
      };
    }
    return competitor;
  });
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

export const CompetitiveInsightsPDFSection: React.FC<CompetitiveInsightsPDFSectionProps> = ({
  competitiveinsights,
  insights,
}) => {
  if (!competitiveinsights) {
    return (
      <Page size="A4" orientation="portrait" style={{ padding: 30, backgroundColor: '#fff' }}>
        <View style={styles.section}>
          <Header title="Competitive Insights" />
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No competitive insights data available
          </Text>
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
  }

  const normalizedCompetitors = normalizeShareOfBuy(competitiveinsights);
  const averageMetrics = calculateAverageMetrics(normalizedCompetitors);

  return (
    <>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.section}>
          <View style={TABLE_STYLES.pageHeader}>
            <Header title="Competitive Insights" />
            <MarkdownText text={insights || ''} />
          </View>
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
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.section}>
          <Header title="Competitive Insights" />
          {averageMetrics && (
            <View style={TABLE_STYLES.averageMetricsContainer}>
              <Text style={TABLE_STYLES.averageMetricsTitle}>
                Average metrics your product vs the competitors
              </Text>
              <View style={TABLE_STYLES.averageMetricsRow}>
                <Text style={TABLE_STYLES.averageMetricItem}>
                  Value: {averageMetrics.value.toFixed(1)}
                </Text>
                <Text style={TABLE_STYLES.averageMetricItem}>
                  Aesthetics: {averageMetrics.aesthetics.toFixed(1)}
                </Text>
                <Text style={TABLE_STYLES.averageMetricItem}>
                  Convenience: {averageMetrics.convenience.toFixed(1)}
                </Text>
                <Text style={TABLE_STYLES.averageMetricItem}>
                  Trust: {averageMetrics.trust.toFixed(1)}
                </Text>
                <Text style={TABLE_STYLES.averageMetricItem}>
                  Utility: {averageMetrics.utility.toFixed(1)}
                </Text>
              </View>
            </View>
          )}
          <View style={TABLE_STYLES.container}>
            <Text style={TABLE_STYLES.tableTitle}>Your Item vs Competitor</Text>
            <View style={TABLE_STYLES.header}>
              <View style={TABLE_STYLES.headerCellFirst}>
                <Text style={TABLE_STYLES.headerText}>Competitor</Text>
              </View>
              <View style={TABLE_STYLES.headerCell}>
                <Text style={TABLE_STYLES.headerText}>Share</Text>
              </View>
              <View style={TABLE_STYLES.headerCell}>
                <Text style={TABLE_STYLES.headerText}>Value</Text>
              </View>
              <View style={TABLE_STYLES.headerCell}>
                <Text style={TABLE_STYLES.headerText}>Appearance</Text>
              </View>
              <View style={TABLE_STYLES.headerCell}>
                <Text style={TABLE_STYLES.headerText}>Convenience</Text>
              </View>
              <View style={TABLE_STYLES.headerCell}>
                <Text style={TABLE_STYLES.headerText}>Trust</Text>
              </View>
              <View style={TABLE_STYLES.headerCellLast}>
                <Text style={TABLE_STYLES.headerText}>Confidence</Text>
              </View>
            </View>
            {normalizedCompetitors.map((competitor, index) => (
              <View
                key={index}
                style={
                  index === normalizedCompetitors.length - 1 ? TABLE_STYLES.lastRow : TABLE_STYLES.row
                }
              >
                <Text style={TABLE_STYLES.productCell}>
                  {truncateTitle(competitor.competitor_product_id.title)}
                </Text>
                <Text style={TABLE_STYLES.metricCell}>
                  {typeof competitor.share_of_buy === 'number' && !isNaN(competitor.share_of_buy) 
                    ? competitor.share_of_buy.toFixed(2) 
                    : '0.00'}%
                </Text>
                <Text style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.value) }}>
                  {competitor.value.toFixed(1)}
                </Text>
                <Text
                  style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.aesthetics) }}
                >
                  {competitor.aesthetics.toFixed(1)}
                </Text>
                <Text
                  style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.convenience) }}
                >
                  {competitor.convenience.toFixed(1)}
                </Text>
                <Text style={{ ...TABLE_STYLES.metricCell, ...getColorStyle(competitor.trust) }}>
                  {competitor.trust.toFixed(1)}
                </Text>
                <Text
                  style={{ ...TABLE_STYLES.metricCellLast, ...getColorStyle(competitor.utility) }}
                >
                  {competitor.utility.toFixed(1)}
                </Text>
              </View>
            ))}
          </View>
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
    </>
  );
};
