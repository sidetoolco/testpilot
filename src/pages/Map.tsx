import React from 'react';
import { useBrand } from '../hooks/useBrand';
import { Branch } from '../types/brand';

export const Map: React.FC = () => {
  const { brands, loading, error } = useBrand();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleBranchSelect = (branch: Branch) => {
    // Handle branch selection
    console.log('Selected branch:', branch);
  };

  return (
    <div>
      {brands.map(brand => (
        <div key={brand.id}>
          <h2>{brand.name}</h2>
          {brand.branches.map(branch => (
            <div 
              key={branch.id}
              onClick={() => handleBranchSelect(branch)}
              style={{ cursor: 'pointer' }}
            >
              {branch.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}; 