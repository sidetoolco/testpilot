import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
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
                <Text style={styles.value}>{new Date(testDetails.updatedAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailsCard}>
                <Text style={styles.label}>Participants</Text>
                <Text style={styles.value}>{testDetails.demographics.testerCount}</Text>
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.label}>Search Term</Text>
                <Text style={styles.value}>
                    {testDetails.searchTerm}
                </Text>
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.label}>Age Ranges</Text>
                {testDetails.demographics.ageRanges.map((age: string, index: number) => (
                    <Text key={index} style={styles.pill}>{age}</Text>
                ))}
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.label}>Gender</Text>
                {testDetails.demographics.gender.map((gender: string, index: number) => (
                    <Text key={index} style={styles.pill}>{gender}</Text>
                ))}
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.label}>Locations</Text>
                {testDetails.demographics.locations.map((location: string, index: number) => (
                    <Text key={index} style={styles.pill}>{location}</Text>
                ))}
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.label}>Competitors</Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {testDetails.competitors.map((competitor: string, index: number) => (
                        <Image key={index} src={competitor.image_url} style={{
                            width: 40,
                            height: 40,
                            objectFit: 'contain',
                            borderRadius: 4,
                        }} />
                    ))}
                </View>
            </View>
            <View style={styles.detailsCard}>
                <Text style={styles.label}>Variations</Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {Object.values(testDetails.variations).filter(v => v !== null).map((variation, index) => (
                        <View key={index} style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#F9FAFB',
                            borderRadius: 8,
                            padding: 2,
                            marginBottom: 2,
                            minWidth: '45%',
                        }}>
                            <Image src={variation.image_url} style={{
                                width: 40,
                                height: 40,
                                objectFit: 'contain',
                                borderRadius: 4,
                            }} />
                            <Text style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                color: '#1F2937',
                                flex: 1,
                                marginLeft: 4,
                            }}>
                                {variation.title.length > 20 ? `${variation.title.substring(0, 20)}...` : variation.title}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    </View>
); 