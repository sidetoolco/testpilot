import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Validation schemas
const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().min(0),
  rating: z.number().min(0).max(5).optional(),
  reviews_count: z.number().min(0).optional(),
  image_url: z.string().url(),
  product_url: z.string().url().optional()
});

const requestSchema = z.object({
  searchTerm: z.string().min(1).max(200),
  companyId: z.string().uuid()
});

serve(async (req) => {
  try {
    // Parse and validate request
    const { searchTerm, companyId } = requestSchema.parse(await req.json());
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for cached results first
    const { data: cachedProducts } = await supabaseClient
      .from('amazon_products')
      .select('*')
      .eq('company_id', companyId)
      .ilike('search_term', searchTerm)
      .order('reviews_count', { ascending: false })
      .limit(20);

    if (cachedProducts?.length) {
      return new Response(
        JSON.stringify({ products: cachedProducts }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If no cache, fetch from Scraper API
    const SCRAPER_API_KEY = Deno.env.get('SCRAPER_API_KEY');
    const SCRAPER_API_URL = 'https://api.scraperapi.com/structured/amazon/search';

    const params = new URLSearchParams({
      api_key: SCRAPER_API_KEY ?? '',
      search_term: searchTerm,
      country: 'US',
      max_page: '2'
    });

    const response = await fetch(`${SCRAPER_API_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Scraper API failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate and transform products
    const products = data.results
      .slice(0, 20)
      .map(product => ({
        title: product.title,
        price: parseFloat(product.price) || 0,
        rating: parseFloat(product.rating) || 0,
        reviews_count: parseInt(product.reviews_count) || 0,
        image_url: product.image,
        product_url: product.url,
        search_term: searchTerm,
        company_id: companyId
      }))
      .filter(product => {
        try {
          productSchema.parse(product);
          return true;
        } catch (error) {
          console.error('Invalid product:', error);
          return false;
        }
      });

    if (!products.length) {
      throw new Error('No valid products found');
    }

    // Cache the results
    await supabaseClient
      .from('amazon_products')
      .upsert(products, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    return new Response(
      JSON.stringify({ products }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search function error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});