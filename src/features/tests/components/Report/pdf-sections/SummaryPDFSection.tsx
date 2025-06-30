import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { PDFOrientation } from '../types';

interface SummaryPDFSectionProps {
  summaryData: any;
  insights: any;
  orientation?: PDFOrientation;
}

const COLORS = {
  success: {
    bg: '#ebfff7',
    text: '#10B981',
  },
  error: {
    bg: '#fff5f5',
    text: '#EF4444',
  },
  warning: {
    bg: '#fffbeb',
    text: '#D97706',
  },
} as const;

const getColorForValue = (value: string, columnIndex: number, allRows: string[][]) => {
  if (value === 'Yes') return { bg: COLORS.success.bg, text: COLORS.success.text };
  if (value === 'No') return { bg: COLORS.error.bg, text: COLORS.error.text };

  // Skip first column (Variant names)
  if (columnIndex === 0) return { bg: '#FFFFFF', text: '#111827' };

  // Convert percentage strings to numbers
  const numValue = parseFloat(value.replace('%', ''));
  if (isNaN(numValue)) return { bg: '#FFFFFF', text: '#111827' };

  const columnValues = allRows.map(row => parseFloat(row[columnIndex].replace('%', '')));
  const max = Math.max(...columnValues);
  const min = Math.min(...columnValues);

  if (numValue === max) return { bg: COLORS.success.bg, text: COLORS.success.text };
  if (numValue === min) return { bg: COLORS.error.bg, text: COLORS.error.text };
  return { bg: COLORS.warning.bg, text: COLORS.warning.text };
};

const tableHeaders = [
  { label: 'Variant', width: '40%' },
  { label: 'Share of Clicks', width: '15%' },
  { label: 'Share of Buy', width: '15%' },
  { label: 'Value Score', width: '15%' },
  { label: 'Win? (90% Confidence)', width: '15%' },
];

const formatSummaryData = (summaryData: any): string[][] => {
  if (!summaryData?.rows) return [];

  return summaryData.rows.map((row: any) => {
    // Asegurarnos de que los valores sean strings y tengan el formato correcto
    const title = String(row.title || 'Unknown Variant');
    const shareOfClicks = `${row.shareOfClicks}%`;
    const shareOfBuy = `${row.shareOfBuy}%`;
    const valueScore = String(row.valueScore);
    const isWinner = row.isWinner === 'Yes' ? 'Yes' : 'No';

    return [title, shareOfClicks, shareOfBuy, valueScore, isWinner];
  });
};

// Componente de markdown para procesar texto con formato
const SimpleMarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      {text
        .split('\n')
        .map((line, index) => {
          if (!line.trim()) return null;

          // Procesar texto en negrita
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <Text
              key={index}
              style={{ fontSize: 12, color: '#333', marginBottom: 8, lineHeight: 1.5 }}
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

export const SummaryPDFSection: React.FC<SummaryPDFSectionProps> = ({
  summaryData,
  insights,
  orientation = 'portrait',
}) => {
  // Procesar los datos directamente sin estado
  const rows = formatSummaryData(summaryData);
  const isLandscape = orientation === 'landscape';

  const comparisonText = insights?.comparison_between_variants;

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.section}>
        <Header title="Results Overview" />
        {/* PRIMERO: La tabla */}
        {rows.length === 0 ? (
          <View style={{ padding: 20, textAlign: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12 }}>No hay datos disponibles</Text>
          </View>
        ) : (
          <View
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              marginBottom: isLandscape ? 12 : 20,
            }}
          >
            {/* Table Header */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              {tableHeaders.map((header, index) => (
                <View
                  key={index}
                  style={{
                    width: header.width,
                    borderRight: index < tableHeaders.length - 1 ? '1px solid #E5E7EB' : 'none',
                    paddingHorizontal: isLandscape ? 4 : 8,
                    paddingVertical: isLandscape ? 6 : 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: isLandscape ? 8 : 10,
                      fontWeight: 'bold',
                      color: '#6B7280',
                      textAlign: 'center',
                    }}
                  >
                    {header.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Table Rows */}
            {rows.map((row, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  borderBottom: index < rows.length - 1 ? '1px solid #E5E7EB' : 'none',
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                }}
              >
                {row.map((cell, cellIndex) => {
                  const colors = getColorForValue(cell, cellIndex, rows);
                  return (
                    <View
                      key={cellIndex}
                      style={{
                        width: tableHeaders[cellIndex].width,
                        borderRight: cellIndex < row.length - 1 ? '1px solid #E5E7EB' : 'none',
                        paddingHorizontal: isLandscape ? 4 : 8,
                        paddingVertical: isLandscape ? 6 : 10,
                        display: 'flex',
                        alignItems: cellIndex === 0 ? 'flex-start' : 'center',
                        justifyContent: cellIndex === 0 ? 'flex-start' : 'center',
                        backgroundColor: colors.bg,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isLandscape ? 10 : 12,
                          color: colors.text,
                          fontWeight: cellIndex === 0 ? 'normal' : 'bold',
                          textAlign: cellIndex === 0 ? 'left' : 'center',
                        }}
                      >
                        {cell}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* DESPUÉS: El texto de comparación */}
        {comparisonText && <SimpleMarkdownText text={comparisonText} />}

        {!comparisonText && (
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
            No comparison data available
          </Text>
        )}
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
