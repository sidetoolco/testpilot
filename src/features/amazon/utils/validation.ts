import { z } from 'zod';

// Product validation schema
const productSchema = z.object({
  title: z.string().min(1),
  price: z
    .number()
    .positive()
    .or(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/)
        .transform(Number)
    ),
  image_url: z.string().url(),
  rating: z.number().min(0).max(5).optional(),
  reviews_count: z.number().min(0).optional(),
  product_url: z.string().url().optional(),
  id: z.string().optional(),
});

export function validateProduct(product: unknown): boolean {
  try {
    productSchema.parse(product);
    return true;
  } catch (error) {
    console.warn('Invalid product:', { product, error });
    return false;
  }
}

// Request validation
export const searchRequestSchema = z.object({
  searchTerm: z.string().min(1).max(200),
  companyId: z.string().uuid(),
});
