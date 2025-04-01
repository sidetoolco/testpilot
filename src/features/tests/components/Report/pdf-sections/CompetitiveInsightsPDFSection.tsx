import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';

export const CompetitiveInsightsPDFSection: React.FC = () => (
    <Page key={`competitive`} size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.section}>
            <Header title={`Competitive Analysis`} />
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Competitive Insights</Text>
                <Text style={styles.text}>Comparison with competitors and market analysis</Text>
            </View>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} />
    </Page>
); 