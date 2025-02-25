import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Registra todos los componentes necesarios de Chart.js
Chart.register(...registerables);

// Hypothetical function to get product name from product_id
const getProductName = (productId: string): string => {
    // Truncate productId to 25 characters
    const truncatedProductId = productId.substring(0, 40);
    // This function should return the product name based on the truncated productId
    return `Product Name: ${truncatedProductId}...`;
};

const PurchaseDrivers: React.FC<{ surveys: any[] }> = ({ surveys }) => {
    if (!surveys || surveys.length === 0) return <p>Your product was not chosen for this test</p>;


    const groupedSurveys = surveys.reduce<Record<string, any[]>>((acc, survey: any) => {
        if (!acc[survey.product_id]) {
            acc[survey.product_id] = [];
        }
        acc[survey.product_id].push(survey);
        return acc;
    }, {});

    const datasets = Object.entries(groupedSurveys).map(([productId, surveys]) => {
        const totalSurveys = surveys.length;
        const averageRatings = surveys.reduce((acc, survey) => {
            acc.value_rating += survey.value_rating;
            acc.appearance_rating += survey.appearance_rating;
            acc.confidence_rating += survey.confidence_rating;
            acc.trust_rating += survey.trust_rating;
            acc.convenience_rating += survey.convenience_rating;
            return acc;
        }, {
            value_rating: 0,
            appearance_rating: 0,
            confidence_rating: 0,
            trust_rating: 0,
            convenience_rating: 0
        });

        return {
            label: getProductName(surveys[0].products.title),
            data: [
                averageRatings.value_rating / totalSurveys,
                averageRatings.appearance_rating / totalSurveys,
                averageRatings.confidence_rating / totalSurveys,
                averageRatings.trust_rating / totalSurveys,
                averageRatings.convenience_rating / totalSurveys
            ],
            backgroundColor: `rgba(${34 + Math.random() * 100}, 139, 34, 0.6)`,  // Random shades of green
            borderRadius: 5,
        };
    });

    const data = {
        labels: ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'],
        datasets: datasets,
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div>
            <h2>Purchase Drivers</h2>
            <Bar data={data} options={options} />
            <p>
                Your bottle aesthetics made a big impact on shoppers driving strong differentiation vs. competition.
                Utility score was just a bit low but this is to be expected for an experiential item. Here are some verbatims...
            </p>
        </div>
    );
};

export default PurchaseDrivers;
