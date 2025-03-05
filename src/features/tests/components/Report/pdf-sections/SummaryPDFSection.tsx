import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';

export const SummaryPDFSection: React.FC = () => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.text}>Overview of test results and key findings</Text>
    </View>
); 