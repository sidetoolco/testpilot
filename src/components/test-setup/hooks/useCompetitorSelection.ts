import { useState, useEffect, useRef, useCallback } from 'react';
import { AmazonProduct } from '../../../features/amazon/types';
import { toast } from 'sonner';

const MAX_COMPETITORS = 11;

interface UseCompetitorSelectionProps {
  selectedCompetitors: AmazonProduct[];
  onCompetitorsChange: (competitors: AmazonProduct[]) => void;
}

export function useCompetitorSelection({
  selectedCompetitors,
  onCompetitorsChange,
}: UseCompetitorSelectionProps) {
  const [isPopping, setIsPopping] = useState(false);
  const prevCount = useRef(selectedCompetitors.length);

  const handleProductSelect = useCallback((product: AmazonProduct) => {
    if (selectedCompetitors.find(p => p.asin === product.asin)) {
      onCompetitorsChange(selectedCompetitors.filter(p => p.asin !== product.asin));
    } else if (selectedCompetitors.length < MAX_COMPETITORS) {
      const newCompetitors = [...selectedCompetitors, product];
      onCompetitorsChange(newCompetitors);
    } else {
      toast.error(`Please select exactly ${MAX_COMPETITORS} competitors`);
    }
  }, [selectedCompetitors, onCompetitorsChange]);

  const handleRemoveCompetitor = useCallback((asin: string) => {
    onCompetitorsChange(selectedCompetitors.filter(p => p.asin !== asin));
  }, [selectedCompetitors, onCompetitorsChange]);

  // Pop animation when item is added
  useEffect(() => {
    if (selectedCompetitors.length > prevCount.current) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 400);
      return () => clearTimeout(timer);
    }
    prevCount.current = selectedCompetitors.length;
  }, [selectedCompetitors.length]);

  const isAllSelected = selectedCompetitors.length === MAX_COMPETITORS;

  return {
    handleProductSelect,
    handleRemoveCompetitor,
    isPopping,
    isAllSelected,
    MAX_COMPETITORS,
  };
}
