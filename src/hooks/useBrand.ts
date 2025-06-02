import { useState, useEffect } from 'react';
import { Brand } from '../types/brand';

export const useBrand = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        
        // Transform the coordinates to match our type
        const transformedBrands: Brand[] = data.map((brand: any) => ({
          ...brand,
          branches: brand.branches.map((branch: any) => ({
            ...branch,
            service_zone: {
              ...branch.service_zone,
              coordinates: {
                ...branch.service_zone.coordinates,
                coordinates: branch.service_zone.coordinates.coordinates.map((coord: [number, number]) => ({
                  lat: coord[0],
                  lon: coord[1]
                }))
              }
            }
          }))
        }));
        
        setBrands(transformedBrands);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error };
}; 