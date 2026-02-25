import { useState, useEffect, useRef, useCallback } from 'react';
import { AmazonProduct } from '../../../features/amazon/types';
import { WalmartProduct } from '../../../features/walmart/services/walmartService';
import { TikTokProduct } from '../../../features/tiktok/types';
import { toast } from 'sonner';
import { MAX_COMPETITORS } from '../constants';

interface UseCompetitorSelectionProps {
  selectedCompetitors: (AmazonProduct | WalmartProduct | TikTokProduct)[];
  onCompetitorsChange: (
    competitors: (AmazonProduct | WalmartProduct | TikTokProduct)[]
  ) => void;
  maxCompetitors?: number;
}

export function useCompetitorSelection({
  selectedCompetitors,
  onCompetitorsChange,
  maxCompetitors = MAX_COMPETITORS,
}: UseCompetitorSelectionProps) {
  const [isPopping, setIsPopping] = useState(false);
  const prevCount = useRef(selectedCompetitors.length);

  const handleProductSelect = useCallback((product: AmazonProduct | WalmartProduct | TikTokProduct) => {
    
    const existingProduct = selectedCompetitors.find(p => {
      if ('asin' in p && 'asin' in product) {
        return p.asin === product.asin;
      } else if ('walmart_id' in p && 'walmart_id' in product) {
        return p.walmart_id === product.walmart_id;
        } else if ('tiktok_id' in p && 'tiktok_id' in product) {
          return p.tiktok_id === product.tiktok_id;
      }
      return false;
    });

    if (existingProduct) {
      const newCompetitors = selectedCompetitors.filter(p => {
        if ('asin' in p && 'asin' in product) {
          return p.asin !== product.asin;
        } else if ('walmart_id' in p && 'walmart_id' in product) {
          return p.walmart_id !== product.walmart_id;
        } else if ('tiktok_id' in p && 'tiktok_id' in product) {
          return p.tiktok_id !== product.tiktok_id;
        }
        return true;
      });
      onCompetitorsChange(newCompetitors);
    } else if (selectedCompetitors.length < maxCompetitors) {
      const newCompetitors = [...selectedCompetitors, product];
      onCompetitorsChange(newCompetitors);
    } else {
      toast.error(`You've reached the maximum of ${maxCompetitors} competitors. Deselect one to choose another.`);
    }
  }, [selectedCompetitors, onCompetitorsChange, maxCompetitors]);

  const handleRemoveCompetitor = useCallback((productId: string) => {
    const newCompetitors = selectedCompetitors.filter(p => {
      if ('asin' in p) {
        return p.asin !== productId;
      } else if ('walmart_id' in p) {
        return p.walmart_id !== productId;
      } else if ('tiktok_id' in p) {
        return p.tiktok_id !== productId;
      }
      return false;
    });
    onCompetitorsChange(newCompetitors);
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
