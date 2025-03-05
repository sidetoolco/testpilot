import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';

export const CompetitiveInsightsPDFSection: React.FC = () => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competitive Insights</Text>
        <Text style={styles.text}>Comparison with competitors and market analysis</Text>
    </View>
); 