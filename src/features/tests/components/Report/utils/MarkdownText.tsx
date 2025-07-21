import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import { PDFOrientation } from '../types';

interface MarkdownTextProps {
  text?: string;
  baseTextStyle?: any;
  orientation?: PDFOrientation;
  small?: boolean;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  text,
  baseTextStyle = {},
  orientation = 'portrait',
  small = false,
}) => {
  if (!text) return null;

  const isLandscape = orientation === 'landscape';

  // Ajustar tamaños de fuente para landscape y small
  const h3FontSize = small ? (isLandscape ? 14 : 16) : isLandscape ? 20 : 24;
  const h2FontSize = small ? (isLandscape ? 12 : 14) : isLandscape ? 16 : 20;
  const bodyFontSize = small ? (isLandscape ? 9 : 10) : isLandscape ? 12 : 14;
  const lineHeight = small ? (isLandscape ? 1.3 : 1.4) : isLandscape ? 1.4 : 1.6;
  const marginBottom = small ? (isLandscape ? 6 : 8) : isLandscape ? 8 : 12;
  const h3MarginBottom = small ? (isLandscape ? 12 : 14) : isLandscape ? 16 : 20;
  const h2MarginBottom = small ? (isLandscape ? 10 : 12) : isLandscape ? 12 : 16;

  const renderMarkdownText = (content: string) => {
    try {
      // Validate content length to prevent memory issues
      const maxContentLength = 50000; // 50KB limit
      const safeContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...'
        : content;
      
      // Split by newlines first to handle paragraphs
      const paragraphs = safeContent.split('\n');
      
      // Limit the number of paragraphs to prevent array length issues
      const maxParagraphs = 500;
      const limitedParagraphs = paragraphs.length > maxParagraphs 
        ? paragraphs.slice(0, maxParagraphs)
        : paragraphs;
      
      return limitedParagraphs
        .map((paragraph, index) => {
          // Skip empty paragraphs
          if (!paragraph.trim()) return null;

          // Check if it's a header (starts with ###)
          if (paragraph.startsWith('###')) {
            return (
              <View
                key={index}
                style={{ marginBottom: h3MarginBottom, marginTop: isLandscape ? 8 : 12 }}
              >
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: h3FontSize,
                      fontWeight: 'bold',
                      color: '#111827',
                      letterSpacing: -0.5,
                      lineHeight: 1.3,
                    },
                    baseTextStyle,
                  ]}
                >
                  {paragraph.replace('###', '').trim()}
                </Text>
                {/* Decorative line under h3 headers */}
                <View
                  style={{
                    width: 60,
                    height: 3,
                    backgroundColor: '#34A270',
                    marginTop: 8,
                  }}
                />
              </View>
            );
          }

          // Check if it's a subheader (starts with ##)
          if (paragraph.startsWith('##')) {
            return (
              <View
                key={index}
                style={{ marginBottom: h2MarginBottom, marginTop: isLandscape ? 6 : 10 }}
              >
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: h2FontSize,
                      fontWeight: 'bold',
                      color: '#1F2937',
                      letterSpacing: -0.3,
                      lineHeight: 1.3,
                    },
                    baseTextStyle,
                  ]}
                >
                  {paragraph.replace('##', '').trim()}
                </Text>
              </View>
            );
          }

          // Process bold text (**text**) with safety limits
          const parts = paragraph.split(/(\*\*.*?\*\*)/g);
          
          // Limit the number of parts to prevent rendering issues
          const maxParts = 100;
          const limitedParts = parts.length > maxParts 
            ? parts.slice(0, maxParts)
            : parts;

          return (
            <Text
              key={index}
              style={[
                styles.text,
                {
                  fontSize: bodyFontSize,
                  color: '#4B5563',
                  marginBottom: marginBottom,
                  lineHeight: lineHeight,
                  letterSpacing: 0.2,
                },
                baseTextStyle,
              ]}
            >
              {limitedParts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  // Bold text
                  return (
                    <Text
                      key={partIndex}
                      style={{
                        fontWeight: 'bold',
                        color: '#111827',
                      }}
                    >
                      {part.slice(2, -2)}
                    </Text>
                  );
                }
                // Regular text
                return part;
              })}
            </Text>
          );
        })
        .filter(Boolean); // Remove null values from empty paragraphs
    } catch (error) {
      console.error('Error rendering markdown text:', error);
      // Return a simple error message
      return [
        <Text
          key="error"
          style={[
            styles.text,
            {
              fontSize: bodyFontSize,
              color: '#DC2626',
              marginBottom: marginBottom,
            },
            baseTextStyle,
          ]}
        >
          Error rendering content. Please check the data format.
        </Text>
      ];
    }
  };

  return (
    <View
      style={{
        marginBottom: isLandscape ? 16 : 24,
        paddingHorizontal: 4,
      }}
    >
      {renderMarkdownText(text)}
    </View>
  );
};
