import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { TestDetails } from '../utils/types';

interface TestDetailsPDFSectionProps {
    testDetails: TestDetails;
}

export const TestDetailsPDFSection: React.FC<TestDetailsPDFSectionProps> = ({ testDetails }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Details</Text>
        <View style={styles.detailsGrid}>
            <View style={styles.detailsCard}>
                <Text style={styles.label}>Test Name</Text>
                <Text style={styles.value}>{testDetails.name}</Text>
            </View>
            <View style={styles.detailsCard}>
                <Text style={styles.label}>Test Date</Text>
                <Text style={styles.value}>{testDetails.updatedAt}</Text>
            </View>
            <View style={styles.detailsCard}>
                <Text style={styles.label}>Participants</Text>
                <Text style={styles.value}>{testDetails.demographics.testerCount}</Text>
            </View>
        </View>
    </View>
); 