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
                    <Text key={index} style={[
                        styles.text,
                        { 
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#374151',
                            marginBottom: 16,
                            marginTop: 8
                        },
                        baseTextStyle
                    ]}>
                        {paragraph.replace('###', '').trim()}
                    </Text>
                );
            }

            // Check if it's a subheader (starts with ##)
            if (paragraph.startsWith('##')) {
                return (
                    <Text key={index} style={[
                        styles.text,
                        { 
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#4B5563',
                            marginBottom: 12,
                            marginTop: 6
                        },
                        baseTextStyle
                    ]}>
                        {paragraph.replace('##', '').trim()}
                    </Text>
                );
            }

            // Process bold text (**text**)
            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
            
            return (
                <Text key={index} style={[
                    styles.text,
                    { marginBottom: 8, lineHeight: 1.5 },
                    baseTextStyle
                ]}>
                    {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            // Bold text
                            return (
                                <Text key={partIndex} style={{ fontWeight: 'bold' }}>
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
        <View style={{ marginBottom: 16 }}>
            {renderMarkdownText(text)}
        </View>
    );
}; 