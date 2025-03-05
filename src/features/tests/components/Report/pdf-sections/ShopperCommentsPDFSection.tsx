import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../utils/styles';

export const ShopperCommentsPDFSection: React.FC = () => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shopper Comments</Text>
        <Text style={styles.text}>Feedback and comments from shoppers</Text>
    </View>
); 