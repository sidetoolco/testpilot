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
        gap: 40,
        padding: 40,
        backgroundColor: '#000000',
      }}
    >
      <Image src={logo} style={{ width: 200, alignSelf: 'center', marginTop: 40 }} />
      <View
        style={{
          marginTop: 'auto',
          marginBottom: 'auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '20px 0',
          borderTop: '1px solid #00A67E',
          borderBottom: '1px solid #00A67E',
        }}
      >
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
          marginBottom: 40,
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
