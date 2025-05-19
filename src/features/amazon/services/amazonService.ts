import apiClient from "../../../lib/api";
import { AmazonProduct } from "../types";
import { ApiError } from "../utils/error";

export const amazonService = {
  async searchProducts(searchTerm: string): Promise<AmazonProduct[]> {
    try {
      const { data: products } = await apiClient.get<AmazonProduct[]>(
        "/amazon/products",
        { params: { term: searchTerm } }
      );

      if (!products.length)
        throw new ApiError("No products found", "NO_PRODUCTS");

      return products;
    } catch (error) {
      console.error("Amazon search error:", error);
      return Promise.reject(error);
    }
  },
};
