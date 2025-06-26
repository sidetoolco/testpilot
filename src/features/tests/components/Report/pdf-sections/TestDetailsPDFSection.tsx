import React from 'react';
import { View, Text, Image, Page, Font, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { TestDetails } from '../utils/types';
import { Header } from './Header';

// Register Font Awesome font
Font.register({
  family: 'FontAwesome',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.ttf',
});

interface TestDetailsPDFSectionProps {
  testDetails: TestDetails;
}

interface ChartDataItem {
  value: number;
  color: string;
  label?: string;
}

interface DonutChartProps {
  data: ChartDataItem[];
  size?: number;
}

interface BarChartProps {
  data: ChartDataItem[];
  height?: number;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const COLORS = {
  primary: '#34A270',
  secondary: '#075532',
  accent: '#E0D30D',
  text: '#374151',
  lightText: '#6B7280',
  background: '#F9FAFB',
  border: '#E5E7EB',
};

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 70 }) => {
  const total = data.reduce((sum: number, item: ChartDataItem) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {data.map((item: ChartDataItem, index: number) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        // Crear el segmento con el color correcto
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: size / 2,
              border: `8px solid ${item.color}`,
              borderTopColor: index === 0 ? item.color : 'transparent',
              borderRightColor: index === 0 ? item.color : 'transparent',
              transform: `rotate(${startAngle}deg)`,
            }}
          />
        );
      })}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          alignItems: 'center',
        }}
      ></View>
    </View>
  );
};

const BarChart: React.FC<BarChartProps> = ({ data, height = 70 }) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
      {data.map((item: ChartDataItem, index: number) => (
        <View key={index} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              width: '100%',
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: item.color,
              borderRadius: 4,
            }}
          />
          <Text style={{ fontSize: 8, color: COLORS.lightText, marginTop: 4 }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, color }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      padding: 12,
      borderRadius: 8,
      gap: 8,
    }}
  >
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </View>
    <View>
      <Text style={{ fontSize: 10, color: COLORS.lightText }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>{value}</Text>
    </View>
  </View>
);

// Componente para gráfica de barras verticales
const VerticalBarChart: React.FC<{ data: ChartDataItem[]; height?: number }> = ({
  data,
  height = 80,
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={{ height, width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: '60%', gap: 4 }}>
        {data.map((item, index) => (
          <View key={index} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '100%',
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
            <Text style={{ fontSize: 7, color: COLORS.lightText, textAlign: 'center' }}>
              {item.label}
            </Text>
            <Text
              style={{ fontSize: 7, color: COLORS.text, fontWeight: 'bold', textAlign: 'center' }}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Componente para gráfica de barras horizontales para género
const GenderBarChart: React.FC<{ data: ChartDataItem[]; height?: number }> = ({
  data,
  height = 50,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={{ height, width: '100%' }}>
      <View style={{ flexDirection: 'row', height: '100%', borderRadius: 4, overflow: 'hidden' }}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <View
              key={index}
              style={{
                width: `${percentage}%`,
                backgroundColor: item.color,
                height: '100%',
              }}
            />
          );
        })}
      </View>
      {/* Leyenda con porcentajes */}
      <View style={{ marginTop: 4, gap: 2 }}>
        {data.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: item.color,
                  borderRadius: 3,
                }}
              />
              <Text style={{ fontSize: 7, color: COLORS.text }}>
                {item.label}: {item.value} ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Función para procesar datos de edad desde responses_comparisons
const processAgeData = (responses: any): ChartDataItem[] => {
  if (!responses?.comparisons) return [];

  const ageCounts: { [key: string]: number } = {};

  // Procesar datos de edad desde responses_comparisons (organizado por variation_type)
  Object.values(responses.comparisons).forEach((variationResponses: any) => {
    if (Array.isArray(variationResponses)) {
      variationResponses.forEach((response: any) => {
        if (response?.tester_id?.shopper_demographic?.age) {
          const age = response.tester_id.shopper_demographic.age;
          // Crear rangos de edad
          let range = '';
          if (age >= 18 && age <= 24) range = '18-24';
          else if (age >= 25 && age <= 29) range = '25-29';
          else if (age >= 30 && age <= 34) range = '30-34';
          else if (age >= 35 && age <= 39) range = '35-39';
          else if (age >= 40 && age <= 44) range = '40-44';
          else if (age >= 45 && age <= 49) range = '45-49';
          else if (age >= 50) range = '50+';

          if (range) {
            ageCounts[range] = (ageCounts[range] || 0) + 1;
          }
        }
      });
    }
  });

  // Convertir a formato de gráfica con colores originales
  const colors = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
  ];
  return Object.entries(ageCounts)
    .sort(([a], [b]) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    })
    .map(([range, count], index) => ({
      label: range,
      value: count,
      color: colors[index % colors.length],
    }));
};

// Función para procesar datos de género desde responses_comparisons
const processGenderData = (responses: any): ChartDataItem[] => {
  if (!responses?.comparisons) return [];

  const genderCounts: { [key: string]: number } = {};

  // Procesar datos de género desde responses_comparisons (organizado por variation_type)
  Object.values(responses.comparisons).forEach((variationResponses: any) => {
    if (Array.isArray(variationResponses)) {
      variationResponses.forEach((response: any) => {
        if (response?.tester_id?.shopper_demographic?.sex) {
          const gender = response.tester_id.shopper_demographic.sex;
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        }
      });
    }
  });

  // Convertir a formato de gráfica con colores del estilo de la app
  const genderColors = [COLORS.primary, COLORS.secondary]; // Verde principal y secundario
  return Object.entries(genderCounts).map(([gender, count], index) => ({
    label: gender.charAt(0).toUpperCase() + gender.slice(1),
    value: count,
    color: genderColors[index % genderColors.length],
  }));
};

export const TestDetailsPDFSection: React.FC<TestDetailsPDFSectionProps> = ({ testDetails }) => {
  console.log('Test Details:', testDetails);
  console.log('Created At:', testDetails.createdAt);
  console.log('Date Object:', new Date(testDetails.createdAt));

  // Calcular el número de variaciones
  const variationCount = Object.values(testDetails.variations).filter(v => v !== null).length;

  // Calcular la fracción de sesiones completadas
  const totalPossibleSessions = testDetails.demographics.testerCount * variationCount;
  const completedSessionsFraction = `${testDetails.completed_sessions} / ${totalPossibleSessions}`;

  // Procesar datos de demografía desde responses_comparisons
  const ageData = processAgeData(testDetails.responses);
  const genderData = processGenderData(testDetails.responses);

  // Fallback a datos originales si no hay datos de responses_comparisons
  const fallbackGenderData =
    testDetails.demographics.gender?.reduce((acc: ChartDataItem[], gender: string) => {
      const existingGender = acc.find(item => item.label === gender);
      if (existingGender) {
        existingGender.value += 1;
      } else {
        acc.push({ value: 1, color: COLORS.primary, label: gender });
      }
      return acc;
    }, []) || [];

  // Fallback para edad si no hay datos detallados
  const fallbackAgeData =
    testDetails.demographics.ageRanges?.map((range: string, index: number) => ({
      value: 1, // Cada rango cuenta como 1 por ahora
      color: [COLORS.primary, COLORS.secondary, COLORS.accent][index % 3],
      label: range,
    })) || [];

  // Usar datos procesados si están disponibles, sino usar fallback
  const finalGenderData = genderData.length > 0 ? genderData : fallbackGenderData;
  const finalAgeData = ageData.length > 0 ? ageData : fallbackAgeData;

  return (
    <Page size="A4" orientation="portrait" style={styles.page}>
      <View style={{ ...styles.section, gap: 5 }}>
        <Header title="Test Design" />
        {/* Test Info */}
        <View style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 }}>
            {testDetails.name}
          </Text>
          <Text style={{ fontSize: 10, color: COLORS.lightText }}>
            Created on{' '}
            {new Date(testDetails.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Metrics */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <MetricCard
            icon={
              <Text style={{ color: 'white', fontSize: 16, fontFamily: 'FontAwesome' }}>
                {'\uf0c0'}
              </Text>
            }
            label="Total Testers"
            value={testDetails.demographics.testerCount}
            color={COLORS.primary}
          />
          <MetricCard
            icon={
              <Text style={{ color: 'white', fontSize: 16, fontFamily: 'FontAwesome' }}>
                {'\uf091'}
              </Text>
            }
            label="Completed Sessions"
            value={completedSessionsFraction}
            color={COLORS.secondary}
          />
        </View>

        {/* Demographics */}
        <View style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 }}>
            Demographics
          </Text>
          <View style={{ flexDirection: 'row', gap: 24 }}>
            {/* Gender Distribution */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.lightText, marginBottom: 8 }}>Gender</Text>
              {finalGenderData.length > 0 ? (
                <View style={{ alignItems: 'center' }}>
                  <GenderBarChart data={finalGenderData} height={50} />
                </View>
              ) : (
                <Text style={{ fontSize: 10, color: COLORS.lightText }}>
                  No gender data available
                </Text>
              )}
            </View>

            {/* Age Distribution - Gráfica de barras verticales */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.lightText, marginBottom: 12 }}>
                Age Distribution
              </Text>
              {finalAgeData.length > 0 ? (
                <View style={{ marginTop: 8 }}>
                  <VerticalBarChart data={finalAgeData} height={60} />
                </View>
              ) : (
                <Text style={{ fontSize: 10, color: COLORS.lightText }}>No age data available</Text>
              )}
            </View>

            {/* Locations - Mantener como texto simple */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.lightText, marginBottom: 8 }}>
                Locations
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.text,
                  backgroundColor: COLORS.background,
                  padding: 8,
                  borderRadius: 4,
                }}
              >
                {testDetails.demographics.locations?.join(', ') || 'No location data available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Test Configuration */}
        <View style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 }}>
            Test Configuration
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 10, color: COLORS.lightText }}>Search Term:</Text>
              <Text style={{ fontSize: 10, color: COLORS.text }}>{testDetails.searchTerm}</Text>
            </View>

            <View>
              <Text style={{ fontSize: 10, color: COLORS.lightText, marginBottom: 8 }}>
                Competitors
              </Text>
              <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                {testDetails.competitors?.map((competitor, index) => (
                  <View
                    key={index}
                    style={{
                      width: 40,
                      height: 40,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={competitor.image_url}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 10, color: COLORS.lightText, marginBottom: 8 }}>
                Variations
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {Object.values(testDetails.variations)
                  .filter(v => v !== null)
                  .map((variation, index) => (
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 8,
                        padding: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        src={variation.image_url}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'contain',
                          marginBottom: 8,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          color: COLORS.text,
                          textAlign: 'center',
                        }}
                      >
                        {variation.title}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </View>
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
  );
};
