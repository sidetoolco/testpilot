import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Registra todos los componentes necesarios de Chart.js
Chart.register(...registerables);

const PurchaseDrivers: React.FC = () => {
    const data = {
        labels: ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'],
        datasets: [
            {
                label: 'Variant #1',
                data: [4.8, 4.6, 3.9, 4.5, 4.1],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Variant #2',
                data: [4.4, 4.1, 4.0, 4.2, 4.1],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
            {
                label: 'Variant #3',
                data: [4.6, 4.0, 4.0, 4.5, 4.2],
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
            },
        ],
    };

    return (
        <div>
            <h2>Purchase Drivers</h2>
            <Bar data={data} />
            <p>
                Your bottle aesthetics made a big impact on shoppers driving strong differentiation vs. competition. 
                Utility score was just a bit low but this is to be expected for an experiential item. Here are some verbatims...
            </p>
        </div>
    );
};

export default PurchaseDrivers;
