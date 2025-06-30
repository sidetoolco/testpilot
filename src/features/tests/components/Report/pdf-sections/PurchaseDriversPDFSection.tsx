import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';

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

interface PurchaseDriversPDFSectionProps {
  insights?: string;
  averagesurveys: Survey;
}

// Función para extraer el texto específico de una variante
const extractVariantInsights = (fullText: string, variantType: string): string => {
  if (!fullText || !variantType) return '';

  // Convertir el tipo de variante a formato de búsqueda (a -> A, b -> B, etc.)
  const variantLabel = `Variant ${variantType.toUpperCase()}`;

  // Buscar el inicio de la sección de la variante
  const variantIndex = fullText.indexOf(variantLabel);
  if (variantIndex === -1) return '';

  // Buscar el final de la sección (siguiente "Variant" o final del texto)
  const nextVariantIndex = fullText.indexOf('Variant ', variantIndex + variantLabel.length);
  const endIndex = nextVariantIndex === -1 ? fullText.length : nextVariantIndex;

  // Extraer solo la sección de esta variante
  const variantSection = fullText.substring(variantIndex, endIndex).trim();

  return variantSection;
};

// Componente de markdown simplificado para insights
const InsightMarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <View style={{ marginBottom: 10, marginTop: 40 }}>
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
                fontSize: 11,
                color: '#333',
                marginBottom: 6,
                lineHeight: 1.4,
                paddingLeft: line.startsWith('•') ? 8 : 0,
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

const InsufficientDataMessage: React.FC<{ variantCount?: number }> = ({ variantCount }) => (
  <View
    style={{
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      padding: 16,
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    }}
  >
    <View
      style={{
        width: 24,
        height: 24,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#DC2626', fontSize: 16 }}>!</Text>
    </View>
    <View>
      <Text style={{ color: '#991B1B', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
        Insufficient Data
      </Text>
      <Text style={{ color: '#7F1D1D', fontSize: 12 }}>
        {variantCount && variantCount > 0
          ? `No shoppers selected any of the ${variantCount} variants.`
          : 'No data available for this test.'}
      </Text>
    </View>
  </View>
);

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

export const PurchaseDriversPDFSection: React.FC<PurchaseDriversPDFSectionProps> = ({
  insights,
  averagesurveys,
}) => {
  const datasets = getChartData(averagesurveys);

  // Extraer insights específicos para esta variante
  const variantInsights =
    insights && averagesurveys?.variant_type
      ? extractVariantInsights(insights, averagesurveys.variant_type)
      : '';

  if (!averagesurveys) {
    return (
      <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
        <Header title="Purchase Drivers" />
        <View style={styles.section}>
          <InsufficientDataMessage />
        </View>
        <Footer />
      </Page>
    );
  }

  return (
    <Page key="drivers" size="A4" orientation="portrait" style={styles.page}>
      <View style={styles.section}>
        <Header title="Purchase Drivers" />

        <View style={styles.section}>
          {/* PRIMERO: La gráfica */}
          <View
            style={{
              border: '1px solid #E0E0E0',
              borderRadius: 4,
              padding: '16px 16px 40px 16px',
              marginTop: 16,
            }}
          >
            <View style={styles.chartContainer}>
              {/* Legend */}
              <View style={styles.chartLegend}>
                {datasets.map((dataset: Dataset, i: number) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: dataset.color }]} />
                    <Text style={styles.legendText}>{dataset.label}</Text>
                  </View>
                ))}
              </View>

              {/* Chart */}
              <View style={styles.chartGrid}>
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
              <View style={[styles.xAxis, { paddingHorizontal: '2%' }]}>
                {LABELS.map(label => (
                  <View key={label} style={{ width: '18%', alignItems: 'center' }}>
                    <Text style={styles.xAxisLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* DESPUÉS: Los insights específicos de la variante */}
          {variantInsights && <InsightMarkdownText text={variantInsights} />}
        </View>
      </View>
      <Footer />
    </Page>
  );
};
