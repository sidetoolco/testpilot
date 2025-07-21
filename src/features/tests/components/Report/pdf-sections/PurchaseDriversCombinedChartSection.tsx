import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { PDFOrientation } from '../types';

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'] as const;
const COLORS = ['#34A270', '#075532', '#E0D30D', '#FF6B35', '#4ECDC4'] as const;

interface Survey {
  id: number;
  created_at: string;
  appearance: number;
  confidence: number;
  convenience: number;
  brand: number;
  value: number;
  test_id: string;
  variant_type: string;
  count: number;
  product_id: string;
  product: {
    title: string;
  };
}

interface Dataset {
  label: string;
  color: string;
  data: number[];
  variantKey: string;
}

interface PurchaseDriversCombinedChartSectionProps {
  averagesurveys: Survey[];
  orientation?: PDFOrientation;
}

const getChartData = (surveys: Survey[]): Dataset[] => {
  if (!surveys || surveys.length === 0) {
    return [];
  }

  return surveys.map((survey, index) => {
    const data = [
      survey.value,       
      survey.appearance,   
      survey.confidence,   
      survey.brand,        
      survey.convenience,  
    ];

    return {
      label: `Variant ${survey.variant_type.toUpperCase()}`,
      color: COLORS[index % COLORS.length],
      data: data,
      variantKey: survey.variant_type,
    };
  });
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

export const PurchaseDriversCombinedChartSection: React.FC<PurchaseDriversCombinedChartSectionProps> = ({
  averagesurveys,
  orientation = 'landscape',
}) => {
  const datasets = getChartData(averagesurveys);

  if (!averagesurveys || averagesurveys.length === 0) {
    return (
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.section}>
          <Header title="Purchase Drivers - All Variants" />
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No purchase drivers data available
          </Text>
        </View>
        <Footer />
      </Page>
    );
  }

  // Adjust dimensions for landscape
  const isLandscape = orientation === 'landscape';
  const chartHeight = isLandscape ? 200 : 250;
  const containerHeight = isLandscape ? 250 : 300;
  const padding = isLandscape ? '12px 16px 30px 16px' : '16px 16px 40px 16px';

  // Calculate bar width based on number of variants
  const barWidth = `${100 / datasets.length}%`;
  const groupWidth = `${100 / LABELS.length}%`;

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title="Purchase Drivers - All Variants" />

        <View style={styles.section}>
          <View
            style={{
              border: '1px solid #E0E0E0',
              borderRadius: 4,
              padding: padding,
              marginTop: isLandscape ? 8 : 16,
            }}
          >
            <View style={[styles.chartContainer, { height: containerHeight }]}>
              {/* Legend */}
              <View style={[styles.chartLegend, { marginBottom: isLandscape ? 10 : 15 }]}>
                {datasets.map((dataset: Dataset, i: number) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: dataset.color }]} />
                    <Text style={styles.legendText}>{dataset.label}</Text>
                  </View>
                ))}
              </View>

              {/* Chart */}
              <View
                style={[styles.chartGrid, { height: chartHeight, marginTop: isLandscape ? 5 : 10 }]}
              >
                {/* Y Axis */}
                <View style={styles.yAxis}>
                  {[5, 4, 3, 2, 1, 0].map(value => (
                    <Text key={value} style={[styles.yAxisLabel, { bottom: `${value * 20}%` }]}>
                      {value}
                    </Text>
                  ))}
                </View>

                {/* Bars */}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    marginLeft: 35,
                    justifyContent: 'space-between',
                  }}
                >
                  {LABELS.map((label, labelIndex) => (
                    <View key={label} style={[styles.barGroup, { width: groupWidth }]}>
                      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                        {datasets.map((dataset: Dataset, datasetIndex: number) => {
                          const value = dataset.data[labelIndex];
                          const height = `${(value / 5) * 100}%`;
                          return (
                            <View
                              key={datasetIndex}
                              style={[
                                styles.bar, 
                                { 
                                  height, 
                                  backgroundColor: dataset.color,
                                  width: barWidth,
                                  marginHorizontal: '1px'
                                }
                              ]}
                            >
                              <Text style={styles.barValue}>{value.toFixed(1)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* X Axis Labels */}
              <View
                style={[styles.xAxis, { paddingHorizontal: '2%', bottom: isLandscape ? -15 : -20 }]}
              >
                {LABELS.map(label => (
                  <View key={label} style={{ width: groupWidth, alignItems: 'center' }}>
                    <Text style={styles.xAxisLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
      <Footer />
    </Page>
  );
}; 