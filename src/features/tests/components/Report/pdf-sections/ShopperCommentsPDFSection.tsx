import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';

interface Comment {
  likes_most?: string;
  improve_suggestions?: string;
  choose_reason?: string;
  tester_id?: {
    shopper_demographic?: {
      age: null | number;
      sex: null | string;
      country_residence: null | string;
    };
  };
}

interface ShopperCommentsPDFSectionProps {
  comments?: any[];
  comparision?: {
    a: Comment[];
    b: Comment[];
    c: Comment[];
  };
  surveys?: {
    a: Comment[];
    b: Comment[];
    c: Comment[];
  };
}

// Componente para mostrar secciones de análisis con el mismo estilo que MarkdownText
const AnalysisSection: React.FC<{ title: string; content: string[] }> = ({ title, content }) => (
  <View style={{ marginBottom: 6 }}>
    {/* Título de sección del mismo tamaño que el texto pero bold */}
    <View style={{ marginBottom: 3, marginTop: 1 }}>
      <Text
        style={[
          styles.text,
          {
            fontSize: 9,
            fontWeight: 'bold',
            color: '#1F2937',
            letterSpacing: 0.05,
            lineHeight: 1.2,
          },
        ]}
      >
        {title}
      </Text>
    </View>

    {/* Contenido con el mismo estilo que MarkdownText */}
    {content.map((paragraph, index) => {
      if (!paragraph.trim()) return null;

      return (
        <Text
          key={index}
          style={[
            styles.text,
            {
              fontSize: 9,
              color: '#4B5563',
              marginBottom: 3,
              lineHeight: 1.2,
              letterSpacing: 0.05,
            },
          ]}
        >
          {paragraph}
        </Text>
      );
    })}
  </View>
);

const Footer: React.FC = () => (
  <View
    style={{
      borderTop: '1px solid #000000',
      paddingTop: 20,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Link
      src="https://TestPilotCPG.com"
      style={{ color: 'black', fontSize: 12, fontWeight: 'bold', textDecoration: 'none' }}
    >
      TestPilotCPG.com
    </Link>
    <Text
      style={styles.pageNumber}
      render={({ pageNumber }: { pageNumber: number }) => `${pageNumber}`}
    />
  </View>
);

export const ShopperCommentsPDFSection: React.FC<ShopperCommentsPDFSectionProps> = ({
  comments = [],
  comparision,
  surveys,
}) => {
  console.log('ShopperCommentsPDFSection - Received data:', {
    commentsCount: comments.length,
    comparision: comparision ? Object.keys(comparision) : null,
    surveys: surveys ? Object.keys(surveys) : null,
  });

  // Verificar si hay comentarios disponibles
  const hasComments =
    comments.length > 0 ||
    (comparision && Object.values(comparision).some(v => v.length > 0)) ||
    (surveys && Object.values(surveys).some(v => v.length > 0));

  if (!hasComments) {
    return (
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.section}>
          <Header title="Comments Analysis" />
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: '#FEE2E2',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#DC2626', fontSize: 16 }}>!</Text>
            </View>
            <View>
              <Text style={{ color: '#991B1B', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                No Comments Available
              </Text>
              <Text style={{ color: '#7F1D1D', fontSize: 12 }}>
                No shopper comments were collected for this test.
              </Text>
            </View>
          </View>
        </View>
        <Footer />
      </Page>
    );
  }

  return (
    <Page size="A4" orientation="portrait" style={styles.page}>
      <View style={styles.section}>
        <Header title="Comments Analysis" />

        <View
          style={{
            marginBottom: 6,
            paddingHorizontal: 4,
          }}
        >
          {/* Información de muestra con estilo consistente */}
          <Text
            style={[
              styles.text,
              {
                fontSize: 8,
                color: '#6B7280',
                marginBottom: 3,
                lineHeight: 1.2,
                letterSpacing: 0.05,
                fontStyle: 'italic',
              },
            ]}
          >
            n = 14 current buyers | n = 46 competitive shoppers
          </Text>
          <Text
            style={[
              styles.text,
              {
                fontSize: 7,
                color: '#6B7280',
                marginBottom: 6,
                lineHeight: 1.2,
                letterSpacing: 0.05,
                fontStyle: 'italic',
              },
            ]}
          >
            Themes not mutually exclusive; multiple themes coded per response
          </Text>

          <AnalysisSection
            title="What's Winning (Brand Chooser Satisfaction Drivers)"
            content={[
              'Among current buyers (n=14)',
              '',
              'Premium ingredients (Arabica, natural flavors) – 9 of 14',
              'Customers highlight "100% Arabica coffee", "natural cacao", and "cold brew" as standout features driving product satisfaction.',
              '',
              'Cocktail-specific quality & ease – 7 of 14',
              'Appreciation for bar-quality results with minimal effort; ideal for hosting.',
              '',
              'Elegant design and premium positioning – 6 of 14',
              'Product perceived as "luxurious", "crafted", and gift-appropriate.',
              '',
              'Defined serving size (10 cocktails) – 4 of 14',
              'Clear value and portioning appreciated for planning and convenience.',
            ]}
          />

          <AnalysisSection
            title="Improvement Opportunities (Brand Chooser Pain Points)"
            content={[
              'Among current buyers (n=14)',
              '',
              'Design and packaging upgrades – 5 of 14',
              'Font, bottle, and logo described as "ugly", "hard to read", or lacking appeal.',
              '',
              'Lower price or better value – 4 of 14',
              'Some feel the price is high for the quantity or visual impression.',
              '',
              'Flavor innovation – 3 of 14',
              'Desire for more variants like espresso, vanilla, or mocktail-friendly options.',
              '',
              'More reviews and proof of quality – 2 of 14',
              'Lack of social proof makes some hesitant even post-purchase.',
            ]}
          />

          <AnalysisSection
            title="Competitive Purchase Barriers (Why We Lose to Competition)"
            content={[
              'Among competitive shoppers (n=46)',
              '',
              '% of shoppers mentioning each theme',
              '',
              'Price too high / poor value – 59%',
              'A dominant theme: "cheaper", "too expensive", "price to quantity ratio".',
              '',
              'Unappealing packaging/design – 35%',
              'Comments point to "better bottle", "fun design", "ugly logo", and "hard-to-read font".',
              '',
              'Lack of reviews or credibility – 24%',
              'Shoppers hesitate due to limited social proof and unclear quality signals.',
              '',
              'Desire for more flavors/customization – 20%',
              'Suggestions include more flavor profiles, mocktail options, or gift sets.',
              '',
              'Perceived inferiority vs. competitor – 15%',
              'Some express stronger trust in competitor (Item B), citing familiarity or taste.',
            ]}
          />
        </View>
      </View>
      <Footer />
    </Page>
  );
};
