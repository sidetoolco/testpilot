import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { Header } from './Header';
import { styles } from '../utils/styles';
import { PDFOrientation } from '../types';
import { getQuestionsByIds, getDefaultQuestions } from '../../TestQuestions/questionConfig';
import { getMetricDescription } from '../../TestQuestions/metricDescriptions';

interface Competitor {
  competitor_product_id?: {
    title: string;
  };
  product?: {
    title: string;
  };
  share_of_buy: number;
  value: number;
  aesthetics: number;
  convenience: number;
  trust: number;
  utility: number;
  appearance?: number;
  confidence?: number;
  brand?: number;
  appetizing?: number;
  target_audience?: number;
  novelty?: number;
  isTestProduct?: boolean;
}

interface CompetitiveInsightsTableSectionProps {
  variantKey: string;
  variantTitle: string;
  competitiveinsights: Competitor[];
  orientation?: PDFOrientation;
  selectedQuestions?: string[];
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

const calculateAverageMetrics = (competitors: Competitor[], selectedQuestions: string[] = []) => {
  if (!competitors.length) return null;

  // Get value with fallback logic for each competitor
  const getValueForQuestion = (competitor: Competitor, questionId: string): number => {
    const fieldMappings: { [key: string]: string[] } = {
      'value': ['value'],
      'appearance': ['appearance', 'aesthetics'],
      'aesthetics': ['aesthetics', 'appearance'],
      'brand': ['brand', 'trust'],
      'confidence': ['confidence', 'utility'],
      'convenience': ['convenience'],
      'utility': ['utility', 'confidence'],
      'appetizing': ['appetizing', 'aesthetics'],
      'target_audience': ['target_audience', 'utility'],
      'novelty': ['novelty', 'utility']
    };

    const possibleFields = fieldMappings[questionId] || [questionId];
    
    for (const fieldName of possibleFields) {
      const raw = competitor[fieldName as keyof Competitor];
      const value = typeof raw === 'number' ? raw : Number(raw);
      if (raw !== undefined && raw !== null && !Number.isNaN(value)) {
        return value;
      }
    }
    
    const fallback = competitor[possibleFields[0] as keyof Competitor];
    return typeof fallback === 'number' ? fallback : Number(fallback) || 0;
  };

  // Calculate sum for each question using fallback logic
  const sums: Record<string, number> = {};
  selectedQuestions.forEach(questionId => {
    sums[questionId] = competitors.reduce((sum, competitor) => {
      return sum + getValueForQuestion(competitor, questionId);
    }, 0);
  });

  // Calculate averages
  const averages: Record<string, number> = {};
  selectedQuestions.forEach(questionId => {
    averages[questionId] = sums[questionId] / competitors.length;
  });

  return averages;
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
  competitiveinsights,
  orientation = 'landscape',
  selectedQuestions = getDefaultQuestions(),
}) => {
  const isLandscape = orientation === 'landscape';

  // Get dynamic headers based on selected questions
  const getDynamicHeaders = () => {
    const questionConfigs = getQuestionsByIds(selectedQuestions);
    
    // Map question IDs to their display names
    const questionDisplayNames: { [key: string]: string } = {
      'value': 'Value',
      'appearance': 'Appearance', 
      'aesthetics': 'Aesthetics',
      'brand': 'Trust',
      'confidence': 'Confidence',
      'convenience': 'Convenience',
      'utility': 'Utility',
      'appetizing': 'Appetizing',
      'target_audience': 'Target Audience',
      'novelty': 'Novelty'
    };

    // Create headers array with Share of Buy first, then selected questions
    const headers = ['Share of Buy'];
    
    questionConfigs.forEach(question => {
      const displayName = questionDisplayNames[question.id] || question.title;
      headers.push(displayName);
    });

    return headers;
  };

  const dynamicHeaders = getDynamicHeaders();

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

  // Filter out invalid competitors and ensure data integrity
  const isFiniteNumber = (n: unknown) => typeof n === 'number' && Number.isFinite(n);
  const validCompetitors = competitiveinsights.filter(competitor => {
    if (!competitor) return false;
    
    // Test products should always be included, even if they don't have all metrics
    if (competitor.isTestProduct) return true;
    
    // For regular competitors, check that they have all required metrics
    return isFiniteNumber(competitor.value) && 
           isFiniteNumber(competitor.aesthetics) && 
           isFiniteNumber(competitor.convenience) && 
           isFiniteNumber(competitor.trust) && 
           isFiniteNumber(competitor.utility);
  });

  if (validCompetitors.length === 0) {
    return (
      <Page size="A4" orientation={orientation} style={{ padding: 30, backgroundColor: '#fff' }}>
        <View style={styles.section}>
          <Header title={`Competitive Insights - Variant ${variantKey.toUpperCase()}`} />
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No valid competitive insights data available for this variant
          </Text>
        </View>
        <Footer />
      </Page>
    );
  }

  const averageMetrics = calculateAverageMetrics(validCompetitors, selectedQuestions);

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title={`Competitive Insights - Variant ${variantKey.toUpperCase()}`} />

        {averageMetrics && Object.keys(averageMetrics).length > 0 && (
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
              {selectedQuestions.map(questionId => {
                const questionConfigs = getQuestionsByIds([questionId]);
                const question = questionConfigs[0];
                if (!question) return null;

                const questionDisplayNames: { [key: string]: string } = {
                  'value': 'Value',
                  'appearance': 'Appearance', 
                  'aesthetics': 'Aesthetics',
                  'brand': 'Trust',
                  'confidence': 'Confidence',
                  'convenience': 'Convenience',
                  'utility': 'Utility',
                  'appetizing': 'Appetizing',
                  'target_audience': 'Target Audience',
                  'novelty': 'Novelty'
                };

                const displayName = questionDisplayNames[questionId] || question.title;
                const value = averageMetrics[questionId] || 0;

                return (
                  <Text key={questionId} style={{ fontSize: isLandscape ? 9 : 11, color: '#374151' }}>
                    {displayName}: {value.toFixed(1)}
                  </Text>
                );
              })}
            </View>
          </View>
        )}

        <View style={tableStyles.container}>
          <Text style={tableStyles.tableTitle}>Your Item vs Competitor</Text>
          <View style={tableStyles.header}>
            <View style={tableStyles.headerCellFirst}>
              <Text style={tableStyles.headerText}>Competitor</Text>
            </View>
            {dynamicHeaders.map((header, index) => (
              <View 
                key={index} 
                style={index === dynamicHeaders.length - 1 ? tableStyles.headerCellLast : tableStyles.headerCell}
              >
                <Text style={tableStyles.headerText}>{header}</Text>
              </View>
            ))}
          </View>
          {validCompetitors.map((competitor, index) => {
            const questionConfigs = getQuestionsByIds(selectedQuestions);
            
            // Map question IDs to their corresponding data fields with fallbacks for legacy data
            const getValueForQuestion = (questionId: string): number => {
              // Define primary field and fallback fields for each question
              const fieldMappings: { [key: string]: string[] } = {
                'value': ['value'],
                'appearance': ['appearance', 'aesthetics'], // appearance falls back to aesthetics
                'aesthetics': ['aesthetics', 'appearance'],
                'brand': ['brand', 'trust'], // brand falls back to trust
                'confidence': ['confidence', 'utility'], // confidence falls back to utility
                'convenience': ['convenience'],
                'utility': ['utility', 'confidence'],
                'appetizing': ['appetizing', 'aesthetics'], // appetizing falls back to aesthetics
                'target_audience': ['target_audience', 'utility'], // target_audience falls back to utility
                'novelty': ['novelty', 'utility'] // novelty falls back to utility
              };

              const possibleFields = fieldMappings[questionId] || [questionId];
              
              // Try each field in order until we find one with a value
              for (const fieldName of possibleFields) {
                const value = competitor[fieldName as keyof Competitor] as number;
                if (value !== undefined && value !== null && value !== 0) {
                  return value;
                }
              }
              
              // If all fields are 0 or undefined, return the first field's value (which might be 0)
              return (competitor[possibleFields[0] as keyof Competitor] as number) || 0;
            };

            return (
              <View
                key={index}
                style={
                  index === validCompetitors.length - 1 ? TABLE_STYLES.lastRow : TABLE_STYLES.row
                }
              >
                <Text style={tableStyles.productCell}>
                  {truncateTitle(
                    competitor.competitor_product_id?.title || competitor.product?.title || 'Unknown Product', 
                    isLandscape ? 45 : 45
                  )}
                </Text>
                <Text style={tableStyles.metricCell}>
                  {competitor.share_of_buy != null && !isNaN(Number(competitor.share_of_buy)) ? 
                    (typeof competitor.share_of_buy === 'string' ? competitor.share_of_buy : Number(competitor.share_of_buy).toFixed(1)) : '0.0'}%
                </Text>
                {questionConfigs.map((question, questionIndex) => {
                  const value = getValueForQuestion(question.id);
                  const isLastColumn = questionIndex === questionConfigs.length - 1;
                  
                  return (
                    <Text 
                      key={question.id}
                      style={{ 
                        ...(isLastColumn ? tableStyles.metricCellLast : tableStyles.metricCell), 
                        ...getColorStyle(value) 
                      }}
                    >
                      {value.toFixed(1)}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        </View>

        {/* Footnotes */}
        <View style={{ marginTop: 16, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 4, color: '#374151' }}>
            Metric Definitions:
          </Text>
          <View style={{ flexDirection: 'column', gap: 2 }}>
            <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
              • Share of Buy: {getMetricDescription('share_of_buy')}
            </Text>
            {selectedQuestions.map(questionId => {
              const questionDisplayNames: { [key: string]: string } = {
                'value': 'Value',
                'appearance': 'Appearance',
                'aesthetics': 'Aesthetics',
                'brand': 'Trust',
                'confidence': 'Confidence',
                'convenience': 'Convenience',
                'utility': 'Utility',
                'appetizing': 'Appetizing',
                'target_audience': 'Target Audience',
                'novelty': 'Novelty'
              };
              const displayName = questionDisplayNames[questionId] || questionId;
              return (
                <Text key={questionId} style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
                  • {displayName}: {getMetricDescription(questionId)}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
      <Footer />
    </Page>
  );
};
