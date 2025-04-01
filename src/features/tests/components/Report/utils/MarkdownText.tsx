import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

interface MarkdownTextProps {
    text?: string;
    baseTextStyle?: any;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ text, baseTextStyle = {} }) => {
    if (!text) return null;

    const renderMarkdownText = (content: string) => {
        // Split by newlines first to handle paragraphs
        return content.split('\n').map((paragraph, index) => {
            // Skip empty paragraphs
            if (!paragraph.trim()) return null;

            // Check if it's a header (starts with ###)
            if (paragraph.startsWith('###')) {
                return (
                    <View key={index} style={{ marginBottom: 20, marginTop: 12 }}>
                        <Text style={[
                            styles.text,
                            { 
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: '#111827',
                                letterSpacing: -0.5,
                                lineHeight: 1.3
                            },
                            baseTextStyle
                        ]}>
                            {paragraph.replace('###', '').trim()}
                        </Text>
                        {/* Decorative line under h3 headers */}
                        <View style={{
                            width: 60,
                            height: 3,
                            backgroundColor: '#34A270',
                            marginTop: 8
                        }} />
                    </View>
                );
            }

            // Check if it's a subheader (starts with ##)
            if (paragraph.startsWith('##')) {
                return (
                    <View key={index} style={{ marginBottom: 16, marginTop: 10 }}>
                        <Text style={[
                            styles.text,
                            { 
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#1F2937',
                                letterSpacing: -0.3,
                                lineHeight: 1.3
                            },
                            baseTextStyle
                        ]}>
                            {paragraph.replace('##', '').trim()}
                        </Text>
                    </View>
                );
            }

            // Process bold text (**text**)
            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
            
            return (
                <Text key={index} style={[
                    styles.text,
                    { 
                        fontSize: 14,
                        color: '#4B5563',
                        marginBottom: 12,
                        lineHeight: 1.6,
                        letterSpacing: 0.2
                    },
                    baseTextStyle
                ]}>
                    {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            // Bold text
                            return (
                                <Text key={partIndex} style={{ 
                                    fontWeight: 'bold',
                                    color: '#111827'
                                }}>
                                    {part.slice(2, -2)}
                                </Text>
                            );
                        }
                        // Regular text
                        return part;
                    })}
                </Text>
            );
        }).filter(Boolean); // Remove null values from empty paragraphs
    };

    return (
        <View style={{ 
            marginBottom: 24,
            paddingHorizontal: 4
        }}>
            {renderMarkdownText(text)}
        </View>
    );
}; 