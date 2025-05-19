export interface AmazonProduct {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  product_url: string;
  search_term: string;
  company_id: string;
  asin: string;
}

export interface SearchProductsResponse {
  products: AmazonProduct[];
}

export interface SearchProductsRequest {
  searchTerm: string;
  companyId: string;
}