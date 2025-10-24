// Simple Node.js script to generate combined PDF report
// Run with: node generateCombinedReport.js

import React from 'react';
import { Document, Page, View, Text, Image, Link, Font } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Supabase setup
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Test IDs
const TEST_IDS = [
  '8f7d9fa5-d15e-46d6-9454-defb8b2e9c89',
  '915a3552-28a8-47dc-8803-07bc7d69b3ac',
  '016c764b-fa90-46d9-9b44-ab63ff50ac72',
  '59a8a275-cc42-4dcd-b0e0-31f287cf228d',
  '3c47356d-f8bd-4884-bb0e-e4514bd61cfd',
];

const COLORS = ['#34A270', '#075532', '#E0D30D', '#FF6B35', '#4ECDC4'];

// Register fonts
Font.register({
  family: 'FontAwesome',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.ttf',
});

// Styles
const styles = {
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
  },
  pageNumber: {
    fontSize: 10,
    color: '#666',
  },
  chartContainer: {
    position: 'relative',
  },
  chartGrid: {
    position: 'relative',
    display: 'flex',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  yAxisLabel: {
    position: 'absolute',
    right: 5,
    fontSize: 8,
    color: '#666',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  barValue: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  xAxis: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  xAxisLabel: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  chartLegend: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  legendItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 9,
    color: '#333',
  },
  barGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
};

// Custom data override
const CUSTOM_SUMMARY_DATA = {
  '8f7d9fa5-d15e-46d6-9454-defb8b2e9c89': { share_of_click: 8.4, share_of_buy: 7.4 },
  '915a3552-28a8-47dc-8803-07bc7d69b3ac': { share_of_click: 11.5, share_of_buy: 11.6 },
  '016c764b-fa90-46d9-9b44-ab63ff50ac72': { share_of_click: 8.9, share_of_buy: 6.9 },
  '59a8a275-cc42-4dcd-b0e0-31f287cf228d': { share_of_click: 5.8, share_of_buy: 5.0 },
  '3c47356d-f8bd-4884-bb0e-e4514bd61cfd': { share_of_click: 12.2, share_of_buy: 9.4 },
};

// Fetch test data
async function fetchTestData(testId) {
  try {
    console.log(`Fetching test ${testId}...`);
    
    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select(`
        id,
        name,
        variations:test_variations(
          product:products(id, title, image_url, price),
          variation_type
        )
      `)
      .eq('id', testId)
      .single();

    if (testError) throw testError;

    const { data: summaryData } = await supabase
      .from('summary')
      .select('*, product:product_id(title)')
      .eq('test_id', testId)
      .order('variant_type')
      .limit(1);

    const { data: purchaseDrivers } = await supabase
      .from('purchase_drivers')
      .select('*')
      .eq('test_id', testId)
      .order('variant_type')
      .limit(1);

    // Add fallback values for missing columns in purchase drivers
    const processedPurchaseDrivers = purchaseDrivers?.[0] ? {
      ...purchaseDrivers[0],
      appearance: purchaseDrivers[0].appearance || purchaseDrivers[0].aesthetics || 0,
      confidence: purchaseDrivers[0].confidence || purchaseDrivers[0].trust || 0,
      brand: purchaseDrivers[0].brand || purchaseDrivers[0].trust || 0,
      target_audience: purchaseDrivers[0].target_audience || purchaseDrivers[0].utility || 0,
    } : null;

    // Fetch competitive insights with fallback columns
    const { data: competitiveInsights } = await supabase
      .from('competitive_insights')
      .select('*, competitor_product_id:competitor_product_id(id, title, image_url, price)')
      .eq('test_id', testId)
      .order('variant_type');

    // Add fallback values for missing columns
    const processedCompetitiveInsights = (competitiveInsights || []).map(comp => ({
      ...comp,
      appearance: comp.appearance || comp.aesthetics || 0,
      confidence: comp.confidence || comp.trust || 0,
      brand: comp.brand || comp.trust || 0,
      target_audience: comp.target_audience || comp.utility || 0,
    }));

    // Fetch AI insights
    const { data: aiInsights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('test_id', testId)
      .single();

    const variant = testData.variations?.find(v => v.variation_type === 'a') || 
                   testData.variations?.find(v => v.variation_type === 'b') ||
                   testData.variations?.find(v => v.variation_type === 'c');

    // Apply custom summary data if available
    const customData = CUSTOM_SUMMARY_DATA[testId];
    const summaryWithCustom = summaryData?.[0] ? {
      ...summaryData[0],
      ...(customData || {})
    } : (customData || {});

    return {
      id: testId,
      name: testData.name,
      product: variant?.product || {},
      summary: summaryWithCustom,
      purchaseDriver: processedPurchaseDrivers || {},
      competitiveInsights: processedCompetitiveInsights || [],
      aiInsights: aiInsights || {},
    };
  } catch (error) {
    console.error(`Error fetching test ${testId}:`, error);
    return null;
  }
}

// Header component
const Header = ({ title }) => (
  <View style={{ marginBottom: 20, borderBottom: '2px solid #34A270', paddingBottom: 10 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>{title}</Text>
  </View>
);

// Footer component
const Footer = () => (
  <View
    style={{
      borderTop: '1px solid #000000',
      paddingTop: 20,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 40,
      left: 40,
      right: 40,
    }}
  >
    <Link
      src="https://TestPilotCPG.com"
      style={{ color: 'black', fontSize: 12, fontWeight: 'bold', textDecoration: 'none' }}
    >
      TestPilotCPG.com
    </Link>
    <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} />
  </View>
);

// Cover Page
const CoverPage = ({ products }) => (
  <Page size="A4" orientation="landscape" style={{ padding: 10, backgroundColor: '#000000' }}>
    <View style={{ marginTop: 80, alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: '#999999', marginBottom: 10 }}>Combined Test</Text>
      <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 40 }}>
        Multi-Product Analysis
      </Text>
    </View>

    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 14, color: '#FFFFFF', textAlign: 'center', marginBottom: 15 }}>
        Products Analyzed
      </Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {products.map((product, index) => (
          <View
            key={index}
            style={{
              border: '1px solid #2A2D31',
              borderRadius: 8,
              padding: 8,
              alignItems: 'center',
              backgroundColor: '#1A1D21',
              width: 140,
            }}
          >
            {product.image_url && (
              <Image
                src={product.image_url}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'contain',
                  marginBottom: 8,
                }}
              />
            )}
            <Text style={{ fontSize: 9, color: '#FFFFFF', textAlign: 'center' }}>
              {product.title}
            </Text>
          </View>
        ))}
      </View>
    </View>

    <Text
      style={{
        fontSize: 10,
        color: '#999999',
        textAlign: 'center',
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
      }}
    >
      Note: TestPilot provides insights based on real shopper behavior in realistic eCommerce
      environments.
    </Text>
  </Page>
);

// Summary Page
const SummaryPage = ({ tests }) => (
  <Page size="A4" orientation="landscape" style={styles.page}>
    <View style={styles.section}>
      <Header title="Combined Results Overview" />
      <View style={{ border: '1px solid #E5E7EB', borderRadius: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          {['Product', 'Share of Clicks', 'Share of Buy', 'Value Score'].map((header, index) => (
            <View
              key={index}
              style={{
                width: index === 0 ? '40%' : '20%',
                borderRight: index < 3 ? '1px solid #E5E7EB' : 'none',
                padding: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#6B7280' }}>{header}</Text>
            </View>
          ))}
        </View>

        {tests.map((test, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              borderBottom: index < tests.length - 1 ? '1px solid #E5E7EB' : 'none',
              backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
            }}
          >
            <View style={{ width: '40%', borderRight: '1px solid #E5E7EB', padding: 8 }}>
              <Text style={{ fontSize: 10 }}>{test.product.title || 'Unknown'}</Text>
            </View>
            <View style={{ width: '20%', borderRight: '1px solid #E5E7EB', padding: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                {test.summary.share_of_click ? `${test.summary.share_of_click}%` : 'N/A'}
              </Text>
            </View>
            <View style={{ width: '20%', borderRight: '1px solid #E5E7EB', padding: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                {test.summary.share_of_buy ? `${test.summary.share_of_buy}%` : 'N/A'}
              </Text>
            </View>
            <View style={{ width: '20%', padding: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                {test.summary.value_score || 'N/A'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Metrics and Questions Section */}
      <View style={{ marginTop: 20, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
        {/* Metrics Definitions */}
        <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 4, color: '#374151' }}>
          Metrics Definitions:
        </Text>
        <View style={{ flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Share of Clicks: The percentage of participants who clicked on this product when viewing the product grid.
          </Text>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Share of Buy: The percentage of participants who selected this product as their final purchase choice.
          </Text>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Value Score: An aggregate score representing how participants rated the overall value proposition.
          </Text>
        </View>

        {/* Questions Asked */}
        <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 4, color: '#374151' }}>
          Questions Asked:
        </Text>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Value: "How would you rate the value of this product?"
          </Text>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Appearance: "How appealing do you find the design and appearance of this product?"
          </Text>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Confidence: "How confident are you that this product will deliver its promised results?"
          </Text>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Brand: "How much do you trust this brand to meet your expectations?"
          </Text>
          <Text style={{ fontSize: 7, color: '#6B7280', marginBottom: 2 }}>
            • Target Audience: "This is a product for people like me?"
          </Text>
        </View>
      </View>
    </View>
    <Footer />
  </Page>
);

// Purchase Drivers Chart
const PurchaseDriversChart = ({ tests }) => {
  const metrics = ['value', 'appearance', 'confidence', 'brand', 'convenience'];
  const metricLabels = ['Value', 'Appearance', 'Confidence', 'Brand', 'Target Audience'];

  const datasets = tests.map((test, index) => ({
    label: `Concept ${index + 1}`,
    color: COLORS[index % COLORS.length],
    data: metrics.map(m => test.purchaseDriver[m] || 0),
  }));

  const groupWidth = `${100 / metricLabels.length}%`;

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.section}>
        <Header title="Purchase Drivers - All Concepts" />

        <View style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px 30px 16px' }}>
          <View style={{ height: 250 }}>
            <View style={styles.chartLegend}>
              {datasets.map((dataset, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: dataset.color }]} />
                  <Text style={styles.legendText}>{dataset.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.chartGrid, { height: 200, position: 'relative' }]}>
              <View style={styles.yAxis}>
                {[5, 4, 3, 2, 1, 0].map(value => (
                  <Text key={value} style={[styles.yAxisLabel, { bottom: `${value * 20}%` }]}>
                    {value}
                  </Text>
                ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  marginLeft: 35,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  height: '100%',
                }}
              >
                {metricLabels.map((label, labelIndex) => (
                  <View
                    key={label}
                    style={{
                      width: groupWidth,
                      height: '100%',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        width: '75%',
                        height: '100%',
                        gap: 2,
                      }}
                    >
                      {datasets.map((dataset, datasetIndex) => {
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
                              },
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

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15,
                marginLeft: 30,
              }}
            >
              {metricLabels.map(label => (
                <View key={label} style={{ width: groupWidth, alignItems: 'center' }}>
                  <Text style={styles.xAxisLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Concept Footnotes */}
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 6, color: '#374151' }}>
            Concept References:
          </Text>
          <View style={{ flexDirection: 'column', gap: 3 }}>
            {tests.map((test, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: COLORS[index % COLORS.length],
                    borderRadius: 2,
                  }}
                />
                <Text style={{ fontSize: 7, color: '#6B7280' }}>
                  <Text style={{ fontWeight: 'bold' }}>Concept {index + 1}:</Text> {test.product.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Footer />
    </Page>
  );
};

// Individual Purchase Drivers Page
const IndividualPurchaseDrivers = ({ test, index }) => {
  const metrics = ['value', 'appearance', 'confidence', 'brand', 'convenience'];
  const metricLabels = ['Value', 'Appearance', 'Confidence', 'Brand', 'Target Audience'];
  const data = metrics.map(m => test.purchaseDriver[m] || 0);

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.section}>
        <Header title={`Purchase Drivers - Concept ${index + 1}`} />
        <Text style={{ fontSize: 10, color: '#666', marginBottom: 15 }}>{test.product.title}</Text>

        <View style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px 30px 16px' }}>
          <View style={{ height: 250 }}>
            <View style={[styles.chartGrid, { height: 200, position: 'relative' }]}>
              <View style={styles.yAxis}>
                {[5, 4, 3, 2, 1, 0].map(value => (
                  <Text key={value} style={[styles.yAxisLabel, { bottom: `${value * 20}%` }]}>
                    {value}
                  </Text>
                ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  marginLeft: 35,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                {data.map((value, idx) => {
                  const barHeight = Math.max(20, (value / 5) * 160);
                  return (
                    <View key={idx} style={{ width: '18%', height: '100%', paddingHorizontal: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: COLORS[index % COLORS.length],
                            width: '100%',
                            minHeight: 20,
                          },
                        ]}
                      >
                        <Text style={styles.barValue}>{value.toFixed(1)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginLeft: 30 }}>
              {metricLabels.map(label => (
                <View key={label} style={{ width: '18%', alignItems: 'center' }}>
                  <Text style={styles.xAxisLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <Footer />
    </Page>
  );
};

// Competitive Insights Text for Individual Product
const CompetitiveInsightsText = ({ test, index }) => {
  const insights = test.aiInsights?.competitive_insights_a || 
                   test.aiInsights?.competitive_insights_b ||
                   test.aiInsights?.competitive_insights_c || '';

  if (!insights) return null;

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.section}>
        <Header title={`Competitive Insights - Concept ${index + 1}`} />
        <Text style={{ fontSize: 10, color: '#666', marginBottom: 15 }}>{test.product.title}</Text>
        <Text style={{ fontSize: 11, lineHeight: 1.6, color: '#333' }}>{insights}</Text>
      </View>
      <Footer />
    </Page>
  );
};

// Competitive Insights Table
const CompetitiveInsightsTable = ({ test, index }) => {
  if (!test.competitiveInsights || test.competitiveInsights.length === 0) return null;

  const metrics = ['value', 'appearance', 'confidence', 'brand', 'convenience'];
  const metricLabels = ['Value', 'Appearance', 'Confidence', 'Brand', 'Target Audience'];

  // Get cell color based on value
  const getCellColor = (value) => {
    if (value === null || value === undefined || value === 0) return { bg: '#FFFBEB', text: '#000' };
    if (value > 0) return { bg: '#D1FAE5', text: '#065F46' };
    if (value < 0) return { bg: '#FEE2E2', text: '#991B1B' };
    return { bg: '#FFFFFF', text: '#000' };
  };

  return (
    <Page size="A4" orientation="landscape" style={{ padding: 30, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' }}>
      <View style={{ marginBottom: 15 }}>
        <Header title={`Competitive Insights - Concept ${index + 1}`} />
        <Text style={{ fontSize: 8, color: '#666', marginBottom: 6 }}>{test.product.title}</Text>
        
        <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 4 }}>
          Average metrics your product vs the competitors
        </Text>
        
        {/* Average metrics row */}
        <View style={{ flexDirection: 'row', marginBottom: 8, gap: 12 }}>
          {metrics.map((metric, idx) => {
            let avgValue = test.purchaseDriver?.[metric];
            
            // Apply fallbacks if value is missing or 0
            if (!avgValue || avgValue === 0) {
              if (metric === 'appearance') avgValue = test.purchaseDriver?.aesthetics;
              if (metric === 'confidence') avgValue = test.purchaseDriver?.trust;
              if (metric === 'brand') avgValue = test.purchaseDriver?.trust;
              if (metric === 'target_audience') avgValue = test.purchaseDriver?.utility;
            }
            
            return (
              <Text key={idx} style={{ fontSize: 6, color: '#666' }}>
                {metricLabels[idx]}: {(avgValue || 0).toFixed(1)}
              </Text>
            );
          })}
        </View>

        <Text style={{ fontSize: 7, marginBottom: 5, textAlign: 'right', color: '#666' }}>
          Your Item vs Competitor
        </Text>

        <View style={{ border: '1px solid #E5E7EB', borderRadius: 4 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#F9FAFB',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <View style={{ width: '20%', borderRight: '1px solid #E5E7EB', padding: 3 }}>
              <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#6B7280' }}>Competitor</Text>
            </View>
            <View style={{ width: '10%', borderRight: '1px solid #E5E7EB', padding: 3, alignItems: 'center' }}>
              <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#6B7280' }}>Share</Text>
            </View>
            {metricLabels.map((label, idx) => (
              <View
                key={idx}
                style={{
                  width: '14%',
                  borderRight: idx < metricLabels.length - 1 ? '1px solid #E5E7EB' : 'none',
                  padding: 3,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#6B7280' }}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Data rows - show more rows with smaller fonts */}
          {test.competitiveInsights.slice(0, 16).map((comp, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                borderBottom: idx < Math.min(test.competitiveInsights.length, 16) - 1 ? '1px solid #E5E7EB' : 'none',
              }}
            >
              <View style={{ width: '20%', borderRight: '1px solid #E5E7EB', padding: 3, backgroundColor: '#FFFFFF' }}>
                <Text style={{ fontSize: 5.5 }}>
                  {comp.competitor_product_id?.title || test.product.title}
                </Text>
              </View>
              <View style={{ width: '10%', borderRight: '1px solid #E5E7EB', padding: 3, alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <Text style={{ fontSize: 5.5, fontWeight: 'bold' }}>
                  {comp.share_of_buy ? `${parseFloat(comp.share_of_buy).toFixed(1)}%` : 'N/A'}
                </Text>
              </View>
              {metrics.map((metric, metricIdx) => {
                const value = comp[metric] || 0;
                const colors = getCellColor(value);
                return (
                  <View
                    key={metricIdx}
                    style={{
                      width: '14%',
                      borderRight: metricIdx < metrics.length - 1 ? '1px solid #E5E7EB' : 'none',
                      padding: 3,
                      alignItems: 'center',
                      backgroundColor: colors.bg,
                    }}
                  >
                    <Text style={{ fontSize: 5.5, fontWeight: 'bold', color: colors.text }}>
                      {value === 0 ? '0.0' : value > 0 ? `${value.toFixed(1)}` : value.toFixed(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Metric Definitions */}
        <View style={{ marginTop: 8, padding: 5, backgroundColor: '#F9FAFB', borderRadius: 3 }}>
          <Text style={{ fontSize: 5.5, fontWeight: 'bold', marginBottom: 2, color: '#374151' }}>
            Metric Definitions:
          </Text>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 0.5 }}>
              • Share of Buy: The percentage of participants who selected this product variant as their final purchase choice.
            </Text>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 0.5 }}>
              • Value: "How would you rate the value of this product?"
            </Text>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 0.5 }}>
              • Appearance: "How appealing do you find the design and appearance of this product?"
            </Text>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 0.5 }}>
              • Confidence: "How confident are you that this product will deliver its promised results?"
            </Text>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 0.5 }}>
              • Brand: "How much do you trust this brand to meet your expectations?"
            </Text>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 0.5 }}>
              • Target Audience: "This is a product for people like me?"
            </Text>
          </View>
        </View>
      </View>
      <Footer />
    </Page>
  );
};

// Recommendations Page
const RecommendationsPage = ({ test, index }) => {
  const recommendations = test.aiInsights?.recommendations || '';

  if (!recommendations) return null;

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.section}>
        <Header title={`Recommendations - Concept ${index + 1}`} />
        <Text style={{ fontSize: 10, color: '#666', marginBottom: 15 }}>{test.product.title}</Text>
        <Text style={{ fontSize: 11, lineHeight: 1.6, color: '#333' }}>{recommendations}</Text>
      </View>
      <Footer />
    </Page>
  );
};

// PDF Document
const CombinedReportPDF = ({ tests }) => (
  <Document>
    <CoverPage products={tests.map(t => t.product)} />
    <SummaryPage tests={tests} />
    <PurchaseDriversChart tests={tests} />
    {tests.map((test, index) => (
      <React.Fragment key={test.id}>
        <IndividualPurchaseDrivers test={test} index={index} />
        <CompetitiveInsightsText test={test} index={index} />
        <CompetitiveInsightsTable test={test} index={index} />
        <RecommendationsPage test={test} index={index} />
      </React.Fragment>
    ))}
  </Document>
);

// Main function
async function generateReport() {
  try {
    console.log('Fetching data for 5 tests...');
    
    const testsData = await Promise.all(
      TEST_IDS.map(id => fetchTestData(id))
    );

    const validTests = testsData.filter(t => t !== null);

    if (validTests.length === 0) {
      console.error('No valid test data found');
      process.exit(1);
    }

    console.log(`Successfully fetched ${validTests.length} tests`);
    console.log('Generating PDF...');

    const blob = await pdf(<CombinedReportPDF tests={validTests} />).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    writeFileSync('multi-test-combined-report.pdf', buffer);

    console.log('\n✅ PDF generated successfully: multi-test-combined-report.pdf');
    console.log(`\nReport includes ${validTests.length} tests:`);
    validTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.name}`);
    });
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

generateReport();

