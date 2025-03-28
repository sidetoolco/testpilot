import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import logoSmall from '../utils/TestPilotSmall.png';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => (
    <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: 16
    }}>
        <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827'
        }}>
            {title}
        </Text>
        <Image
            src={logoSmall}
            style={{
                height: 24,
                width: 'auto'
            }}
        />
    </View>
); 