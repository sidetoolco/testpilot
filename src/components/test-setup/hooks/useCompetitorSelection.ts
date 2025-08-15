import { useState, useEffect, useRef, useCallback } from 'react';
import { AmazonProduct } from '../../../features/amazon/types';
import { toast } from 'sonner';
import { MAX_COMPETITORS } from '../constants';

interface UseCompetitorSelectionProps {
  selectedCompetitors: AmazonProduct[];
  onCompetitorsChange: (competitors: AmazonProduct[]) => void;
  maxCompetitors?: number;
}

export function useCompetitorSelection({
  selectedCompetitors,
  onCompetitorsChange,
  maxCompetitors = MAX_COMPETITORS,
}: UseCompetitorSelectionProps) {
  const [isPopping, setIsPopping] = useState(false);
  const prevCount = useRef(selectedCompetitors.length);

  const handleProductSelect = useCallback((product: AmazonProduct) => {
    if (selectedCompetitors.find(p => p.asin === product.asin)) {
      onCompetitorsChange(selectedCompetitors.filter(p => p.asin !== product.asin));
    } else if (selectedCompetitors.length < maxCompetitors) {
      const newCompetitors = [...selectedCompetitors, product];
      onCompetitorsChange(newCompetitors);
    } else {
      toast.error(`You've reached the maximum of ${maxCompetitors} competitors. Deselect one to choose another.`);
    }
  }, [selectedCompetitors, onCompetitorsChange, maxCompetitors]);

  const handleRemoveCompetitor = useCallback((asin: string) => {
    onCompetitorsChange(selectedCompetitors.filter(p => p.asin !== asin));
  }, [selectedCompetitors, onCompetitorsChange]);

  // Pop animation when item is added
  useEffect(() => {
    if (selectedCompetitors.length > prevCount.current) {
      setIsPopping(true);
      prevCount.current = selectedCompetitors.length;
      const timer = setTimeout(() => setIsPopping(false), 400);
      return () => clearTimeout(timer);
    }
    prevCount.current = selectedCompetitors.length;
  }, [selectedCompetitors.length]);

  const isAllSelected = selectedCompetitors.length === maxCompetitors;

  return {
    handleProductSelect,
    handleRemoveCompetitor,
    isPopping,
    isAllSelected,
    maxCompetitors,
  };
}
