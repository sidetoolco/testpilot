import React from 'react';
import { View, Text, Image, Page, Font } from '@react-pdf/renderer';
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

        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: size / 2,
              border: `8px solid ${item.color}`,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
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
      >
      </View>
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
          <Text style={{ fontSize: 8, color: COLORS.lightText, marginTop: 4 }}>
            {item.label}
          </Text>
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
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>
        {value}
      </Text>
    </View>
  </View>
);

export const TestDetailsPDFSection: React.FC<TestDetailsPDFSectionProps> = ({ testDetails }) => {
  console.log('Test Details:', testDetails);
  console.log('Created At:', testDetails.createdAt);
  console.log('Date Object:', new Date(testDetails.createdAt));

  // Calcular el número de variaciones
  const variationCount = Object.values(testDetails.variations).filter(v => v !== null).length;
  
  // Calcular la fracción de sesiones completadas
  const totalPossibleSessions = testDetails.demographics.testerCount * variationCount;
  const completedSessionsFraction = `${testDetails.completed_sessions} / ${totalPossibleSessions}`;

  // Procesar datos de género
  const genderData = testDetails.demographics.gender?.reduce((acc: ChartDataItem[], gender: string) => {
    const existingGender = acc.find(item => item.label === gender);
    if (existingGender) {
      existingGender.value += 1;
    } else {
      acc.push({ value: 1, color: COLORS.primary, label: gender });
    }
    return acc;
  }, []) || [];

  // Procesar datos de edad
  const ageData = testDetails.demographics.ageRanges?.map((range: string, index: number) => ({
    value: 1, // Cada rango cuenta como 1 por ahora
    color: [COLORS.primary, COLORS.secondary, COLORS.accent][index % 3],
    label: range
  })) || [];

  // Procesar datos de ubicación
  const locationData = testDetails.demographics.locations?.reduce((acc: ChartDataItem[], location: string) => {
    const existingLocation = acc.find(item => item.label === location);
    if (existingLocation) {
      existingLocation.value += 1;
    } else {
      acc.push({ value: 1, color: COLORS.primary, label: location });
    }
    return acc;
  }, []) || [];

  return (
    <Page size="A4" orientation="portrait" style={{ padding: 20, backgroundColor: 'white' }}>
      <Header title="Test Design" />
      <View style={{ flex: 1, gap: 20 }}>
        {/* Test Info */}
        <View style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 }}>
            {testDetails.name}
          </Text>
          <Text style={{ fontSize: 10, color: COLORS.lightText }}>
            Created on {new Date(testDetails.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Metrics */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <MetricCard
            icon={<Text style={{ color: 'white', fontSize: 16, fontFamily: 'FontAwesome' }}>{'\uf0c0'}</Text>}
            label="Total Testers"
            value={testDetails.demographics.testerCount}
            color={COLORS.primary}
          />
          <MetricCard
            icon={<Text style={{ color: 'white', fontSize: 16, fontFamily: 'FontAwesome' }}>{'\uf091'}</Text>}
            label="Winning Sessions"
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
              {genderData.length > 0 ? (
                <DonutChart data={genderData} />
              ) : (
                <Text style={{ fontSize: 10, color: COLORS.lightText }}>No gender data available</Text>
              )}
            </View>

            {/* Age Distribution */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.lightText, marginBottom: 16 }}>Age Ranges</Text>
              {ageData.length > 0 ? (
                <BarChart data={ageData} />
              ) : (
                <Text style={{ fontSize: 10, color: COLORS.lightText }}>No age data available</Text>
              )}
            </View>

            {/* Location Distribution */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.lightText, marginBottom: 16 }}>Locations</Text>
              {locationData.length > 0 ? (
                <BarChart data={locationData} />
              ) : (
                <Text style={{ fontSize: 10, color: COLORS.lightText }}>No location data available</Text>
              )}
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
              <Text style={{ fontSize: 10, color: COLORS.lightText, marginBottom: 8 }}>Variations</Text>
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
        <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>testpilot.com</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }: { pageNumber: number }) => `${pageNumber}`}
        />
      </View>
    </Page>
  );
};
