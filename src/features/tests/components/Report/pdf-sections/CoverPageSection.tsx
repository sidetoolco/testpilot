import React from 'react';
import { Page, Text, Image, View, Font } from '@react-pdf/renderer';
import { TestDetails } from '../utils/types';
import logo from '../utils/testpilot-logo.png';

// Register Font Awesome font
Font.register({
  family: 'FontAwesome',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.ttf',
});

interface CoverPageSectionProps {
  testDetails: TestDetails;
  variantsArray: ({ image_url: string; title: string } | null)[];
}

const GradientLine: React.FC = () => {
  // Función para interpolar entre dos colores
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const startColor = '#00A6FF';
  const endColor = '#00A67E';
  const layers = 12; // Más capas para mayor suavidad

  return (
    <View style={{ 
      height: 4,
      width: '100%',
      marginBottom: 40,
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {Array.from({ length: layers }).map((_, index) => {
        const progress = index / (layers - 1);
        const color = interpolateColor(startColor, endColor, progress);
        const leftPosition = `${(progress * 100)}%`;
        const width = `${100 - (progress * 100) + (100 / layers)}%`;
        
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: leftPosition,
              top: 0,
              width: width,
              height: '100%',
              backgroundColor: color
            }}
          />
        );
      })}
    </View>
  );
};

export const CoverPageSection: React.FC<CoverPageSectionProps> = ({
  testDetails,
  variantsArray,
}) => {
  const validVariants = variantsArray.filter(
    (v): v is { image_url: string; title: string } => v !== null
  );

  return (
    <Page
      size="A4"
      orientation="portrait"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10,
        backgroundColor: '#000000',
      }}
    >
      <Image src={logo} style={{ width: 200, alignSelf: 'center', marginTop: 40 }} />
      <View
        style={{
          marginTop: 30,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '40px 0',
          borderBottom: '4px solid #00A67E',
        }}
      >
        <GradientLine />
        <View>
          <Text style={{ fontSize: 24, color: '#999999', textAlign: 'center', marginBottom: 10 }}>
            {testDetails.name.split(' ')[0]}
          </Text>
          <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}>
            {testDetails.name.split(' ').slice(1).join(' ')}
          </Text>
        </View>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 20,
          marginTop: 20,
          marginBottom: 'auto',
        }}
      >
        <View
          style={{
            backgroundColor: '#1A1D21',
            padding: 15,
            borderRadius: 8,
            flex: 1,
            maxWidth: 170,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: '#000000',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #2A2D31',
              }}
            >
              <Text
                style={{
                  fontFamily: 'FontAwesome',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                {'\uf03a'}
              </Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'left' }}>
                Tested Variants
              </Text>
              <Text
                style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'left' }}
              >
                {validVariants.length}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            backgroundColor: '#1A1D21',
            padding: 15,
            borderRadius: 8,
            flex: 1,
            maxWidth: 170,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: '#000000',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #2A2D31',
              }}
            >
              <Text
                style={{
                  fontFamily: 'FontAwesome',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                {'\uf0c0'}
              </Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'left' }}>Competitors</Text>
              <Text
                style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'left' }}
              >
                {testDetails.competitors.length}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            backgroundColor: '#1A1D21',
            padding: 15,
            borderRadius: 8,
            flex: 1,
            maxWidth: 170,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: '#000000',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #2A2D31',
              }}
            >
              <Text
                style={{
                  fontFamily: 'FontAwesome',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                {'\uf073'}
              </Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'left' }}>Date</Text>
              <Text
                style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'left' }}
              >
                {new Date(testDetails.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: '#999999',
          textAlign: 'center',
          position: 'absolute',
          bottom: 20,
          left: 40,
          right: 40,
        }}
      >
        Note: TestPilot provides insights based on real shopper behavior in realistic eCommerce
        environments, helping you to make faster and more informed decisions. Actual market results
        may vary due to factors like competition, economic shifts, and retail dynamics. While our
        testing reduces risk, TestPilot makes no guarantees of real-world success. Final decisions
        rest with you.
      </Text>
    </Page>
  );
};
