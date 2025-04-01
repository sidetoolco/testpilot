import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { MarkdownText } from '../utils/MarkdownText';

interface RecommendationsPDFSectionProps {
    insights: string;
}

export const RecommendationsPDFSection: React.FC<RecommendationsPDFSectionProps> = ({ insights }) => {
    if (!insights) return null;
    return (
        <Page size="A4" orientation="portrait" style={styles.page}>
            <View style={styles.section}>
                <Header title="Recommendations" />
                <MarkdownText text={insights} />
            </View>
            <View style={{ borderTop: '1px solid #000000', paddingTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
                    testpilot.com
                </Text>
                <Text style={styles.pageNumber} render={({ pageNumber }: { pageNumber: number; }) => `${pageNumber}`} />
            </View>
        </Page>
    );
}; 