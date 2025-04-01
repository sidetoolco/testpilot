import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { styles } from '../utils/styles';

interface VariantCoverProps {
    variantKey: string;
    title: string;
    imageUrl: string;
}

export const VariantCover: React.FC<VariantCoverProps> = ({
    variantKey,
    title,
    imageUrl,
}) => {
    return (
        <Page
            size="A4"
            orientation="portrait"
            style={{
                flexDirection: 'column',
                backgroundColor: '#000000',
                padding: 0,
                height: '100%',
            }}
        >
            <View
                style={{
                    width: '100%',
                    backgroundColor: '#111111',
                    padding: 15,
                    borderBottom: '2px solid #00ffcc',
                }}
            >
                <Text
                    style={{
                        fontSize: 20,
                        color: '#ffffff',
                        textAlign: 'center',
                    }}
                >
                    Variant {variantKey.toUpperCase()}
                </Text>
            </View>

            <View
                style={{
                    width: '100%',
                    padding: '20px 40px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                }}
            >
                <View
                    style={{
                        backgroundColor: '#ffffff',
                        padding: 15,
                        width: 350,
                        height: 350,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 15,
                    }}
                >
                    <Image
                        src={imageUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </View>
                <Text
                    style={{
                        fontSize: 14,
                        color: '#ffffff',
                        textAlign: 'center',
                        paddingHorizontal: 20,
                    }}
                >
                    {title}
                </Text>
            </View>

            <View
                style={{
                    width: '100%',
                    backgroundColor: '#111111',
                    borderTop: '2px solid #00ffcc',
                    padding: '10px 40px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Text style={{ color: '#00ffcc', fontSize: 12, fontWeight: 'bold' }}>
                    testpilotcpg.com
                </Text>
                <Text style={styles.pageNumber} render={({ pageNumber }: { pageNumber: number; }) => `${String(pageNumber).padStart(2, '0')}`} />
            </View>
        </Page>
    );
}; 