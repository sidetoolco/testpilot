import React, { useEffect } from 'react';

const AdalineComponent = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.adaline.ai/v1/deployments/cad39852-747f-4418-8395-dd574ab71acd/89f1ad2a-c6c2-4887-b3c0-65796d8f19f8', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_ADALINE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Your component JSX here */}
    </div>
  );
};

export default AdalineComponent;