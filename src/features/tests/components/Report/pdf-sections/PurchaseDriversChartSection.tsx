import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { PDFOrientation } from '../types';

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'] as const;
const COLORS = ['#34A270', '#075532', '#E0D30D'] as const;

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
}

interface PurchaseDriversChartSectionProps {
  variantKey: string;
  variantTitle: string;
  averagesurveys: Survey;
  orientation?: PDFOrientation;
}

const getChartData = (survey: Survey): Dataset[] => {
  if (!survey) {
    return [];
  }

  const data = [
    survey.appearance,
    survey.value,
    survey.confidence,
    survey.brand,
    survey.convenience,
  ];

  return [
    {
      label: '',
      color: COLORS[0],
      data: data,
    },
  ];
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

export const PurchaseDriversChartSection: React.FC<PurchaseDriversChartSectionProps> = ({
  variantKey,
  variantTitle,
  averagesurveys,
  orientation = 'portrait',
}) => {
  const datasets = getChartData(averagesurveys);

  if (!averagesurveys) {
    return null;
  }

  // Ajustar dimensiones para landscape
  const isLandscape = orientation === 'landscape';
  const chartHeight = isLandscape ? 200 : 250; // Reducir altura en landscape
  const containerHeight = isLandscape ? 250 : 300; // Reducir altura del contenedor
  const padding = isLandscape ? '12px 16px 30px 16px' : '16px 16px 40px 16px'; // Reducir padding en landscape

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title={`Purchase Drivers - Variant ${variantKey.toUpperCase()}`} />

        <View style={styles.section}>
          <View
            style={{
              border: '1px solid #E0E0E0',
              borderRadius: 4,
              padding: padding,
              marginTop: isLandscape ? 8 : 16, // Reducir margen superior en landscape
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
                    <View key={label} style={[styles.barGroup, { width: '18%' }]}>
                      {datasets.map((dataset: Dataset, datasetIndex: number) => {
                        const value = dataset.data[labelIndex];
                        const height = `${(value / 5) * 100}%`;
                        return (
                          <View
                            key={datasetIndex}
                            style={[styles.bar, { height, backgroundColor: dataset.color }]}
                          >
                            <Text style={styles.barValue}>{value.toFixed(1)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>

              {/* X Axis Labels */}
              <View
                style={[styles.xAxis, { paddingHorizontal: '2%', bottom: isLandscape ? -15 : -20 }]}
              >
                {LABELS.map(label => (
                  <View key={label} style={{ width: '18%', alignItems: 'center' }}>
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
