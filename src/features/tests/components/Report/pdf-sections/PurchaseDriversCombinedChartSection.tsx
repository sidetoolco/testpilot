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

  // Ensure data mapping is correct by aligning with LABELS array
  // The desired order is: 'Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'
  // The survey object has: 'value', 'appearance', 'confidence', 'brand', 'convenience'
  // Let's assume: Aesthetics -> appearance, Utility -> confidence, Trust -> brand
  return surveys.map((survey, index) => {
    const data = [
      survey.value,
      survey.appearance, // Aesthetics
      survey.confidence,  // Utility
      survey.brand,       // Trust
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

  // Calculate width for each category group
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
                style={[
                  styles.chartGrid,
                  {
                    height: chartHeight,
                    marginTop: isLandscape ? 5 : 10,
                    position: 'relative'
                  }
                ]}
              >
                {/* Y Axis */}
                <View style={styles.yAxis}>
                  {[5, 4, 3, 2, 1, 0].map(value => (
                    <Text key={value} style={[styles.yAxisLabel, { bottom: `${value * 20}%` }]}>
                      {value}
                    </Text>
                  ))}
                </View>

                {/* Bars Container */}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    marginLeft: 35,
                    justifyContent: 'space-between', // This creates space BETWEEN the groups
                    alignItems: 'flex-end',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  {LABELS.map((label, labelIndex) => (
                    // This is the container for a single group (e.g., "Value")
                    // It centers the inner bar container.
                    <View
                      key={label}
                      style={{
                        width: groupWidth,
                        height: '100%',
                        justifyContent: 'flex-end', 
                        alignItems: 'center'      
                      }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        width: '75%', 
                        height: '100%',
                        gap: 2,
                      }}>
                        {datasets.map((dataset: Dataset, datasetIndex: number) => {
                          const value = dataset.data[labelIndex];
                          const barHeight = Math.max(1, (value / 5) * 100);
                          return (
                            <View
                              key={datasetIndex}
                              style={[
                                styles.bar,
                                {
                                  height: `${barHeight}%`,
                                  backgroundColor: dataset.color,
                                  flex: 1, 
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
                style={[
                  styles.xAxis,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    bottom: isLandscape ? -15 : -20,
                    marginLeft: 30,
                    position: 'absolute',
                    left: 0,
                    right: 0,
                  },
                ]}
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
