import React from 'react';
import { View, Text, Page, Link } from '@react-pdf/renderer';
import { styles } from '../utils/styles';
import { Header } from './Header';
import { PDFOrientation } from '../types';
import { MarkdownText } from '../utils/MarkdownText';

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
  // Add product information
  products?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  };
  amazon_products?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  };
  competitor_id?: string;
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
  shopperCommentsSummary?: string;
  orientation?: PDFOrientation;
}

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
  shopperCommentsSummary,
  orientation = 'portrait',
}) => {
  console.log('ShopperCommentsPDFSection - Received data:', {
    commentsCount: comments.length,
    comparision: comparision ? Object.keys(comparision) : null,
    surveys: surveys ? Object.keys(surveys) : null,
    shopperCommentsSummary: !!shopperCommentsSummary,
    summaryContent: shopperCommentsSummary,
  });

  // Verificar si hay comentarios disponibles o summary
  const hasComments =
    comments.length > 0 ||
    (comparision && Object.values(comparision).some(v => v.length > 0)) ||
    (surveys && Object.values(surveys).some(v => v.length > 0)) ||
    shopperCommentsSummary;

  if (!hasComments) {
    return (
      <Page size="A4" orientation={orientation} style={styles.page}>
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

  // Si no hay summary, mostrar mensaje de no disponible
  if (!shopperCommentsSummary) {
    return (
      <Page size="A4" orientation={orientation} style={styles.page}>
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
                No Analysis Available
              </Text>
              <Text style={{ color: '#7F1D1D', fontSize: 12 }}>
                No comment analysis summary is available for this test.
              </Text>
            </View>
          </View>
        </View>
        <Footer />
      </Page>
    );
  }

  // Dividir el contenido en múltiples páginas si es necesario (tanto portrait como landscape)
  const paragraphs = shopperCommentsSummary.split('\n').filter(p => p.trim());

  // En landscape, aproximadamente 8 párrafos por página; en portrait, 12 párrafos
  const paragraphsPerPage = orientation === 'landscape' ? 8 : 12;
  const pages = [];

  for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
    const pageParagraphs = paragraphs.slice(i, i + paragraphsPerPage);
    pages.push(pageParagraphs.join('\n'));
  }

  // Si no hay páginas, crear una con todo el contenido
  if (pages.length === 0) {
    pages.push(shopperCommentsSummary);
  }

  console.log(`${orientation} pages:`, pages.length);

  return (
    <>
      {pages.map((pageContent, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation={orientation} style={styles.page}>
          <View style={styles.section}>
            <Header title="Comments Analysis" />

            <View
              style={{
                marginBottom: 6,
                paddingHorizontal: 4,
              }}
            >
              {/* Usar MarkdownText para renderizar el contenido de esta página */}
              <MarkdownText text={pageContent} orientation={orientation} small={true} />
            </View>
          </View>
          <Footer />
        </Page>
      ))}
    </>
  );
};
