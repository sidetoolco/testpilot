import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';

export const RecommendationsPDFSection: React.FC = () => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <Text style={styles.text}>Based on the analysis of the test results, here are our recommendations:</Text>
    </View>
); 