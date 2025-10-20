import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProductReviewsResponse } from '../types/reviews';

interface UseProductReviewsResult {
  reviews: ProductReviewsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProductReviews(asin: string | undefined): UseProductReviewsResult {
  const [reviews, setReviews] = useState<ProductReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!asin) {
      setError('ASIN is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, find the amazon_products record by ASIN
      const { data: amazonProduct, error: amazonError } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('asin', asin)
        .single();

      if (amazonError || !amazonProduct) {
        throw new Error('Product not found in database');
      }

      // If the product has reviews stored, use them
      if (amazonProduct.reviews && amazonProduct.reviews.length > 0) {
        // Calculate average rating and rating breakdown from stored reviews
        const totalReviews = amazonProduct.reviews.length;
        const totalRating = amazonProduct.reviews.reduce((sum: number, review: any) => sum + review.stars, 0);
        const averageRating = totalRating / totalReviews;

        // Calculate rating breakdown
        const breakdown = {
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0,
        };

        amazonProduct.reviews.forEach((review: any) => {
          if (review.stars === 5) breakdown.five_star++;
          else if (review.stars === 4) breakdown.four_star++;
          else if (review.stars === 3) breakdown.three_star++;
          else if (review.stars === 2) breakdown.two_star++;
          else if (review.stars === 1) breakdown.one_star++;
        });

        // Convert to percentages
        Object.keys(breakdown).forEach(key => {
          breakdown[key as keyof typeof breakdown] = Math.round((breakdown[key as keyof typeof breakdown] / totalReviews) * 100);
        });

        const reviewsResponse: ProductReviewsResponse = {
          product_name: amazonProduct.title,
          asin: amazonProduct.asin,
          average_rating: averageRating,
          total_reviews: totalReviews,
          rating_breakdown: breakdown,
          reviews: amazonProduct.reviews,
        };

        setReviews(reviewsResponse);
      } else {
        // No reviews stored, show empty state
        setReviews(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch reviews';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [asin]);

  return {
    reviews,
    isLoading,
    error,
    refetch: fetchReviews,
  };
}
