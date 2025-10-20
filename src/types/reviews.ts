export interface Review {
  stars: number;
  date: string;
  verified_purchase: boolean;
  manufacturer_replied: boolean;
  username: string;
  title: string;
  review: string;
  total_found_helpful?: number;
  images: string[];
}

export interface RatingBreakdown {
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export interface ProductReviewsResponse {
  product_name: string;
  asin: string;
  average_rating: number;
  total_reviews: number;
  rating_breakdown: RatingBreakdown;
  reviews: Review[];
}
