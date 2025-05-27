import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ProductRecommendation {
  id: string;
  title: string;
  score: number;
  reasons: string[];
}

serve(async req => {
  try {
    // Get product ID and company ID from request
    const { productId, companyId } = await req.json();

    if (!productId || !companyId) {
      return new Response(JSON.stringify({ error: 'Product ID and company ID are required' }), {
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the source product
    const { data: sourceProduct } = await supabaseClient
      .from('amazon_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!sourceProduct) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    // Get similar products based on price range and rating
    const { data: similarProducts } = await supabaseClient
      .from('amazon_products')
      .select('*')
      .eq('company_id', companyId)
      .neq('id', productId)
      .gte('rating', sourceProduct.rating - 0.5)
      .lte('rating', sourceProduct.rating + 0.5)
      .gte('price', sourceProduct.price * 0.8)
      .lte('price', sourceProduct.price * 1.2)
      .order('reviews_count', { ascending: false })
      .limit(5);

    // Calculate recommendation scores and reasons
    const recommendations: ProductRecommendation[] = similarProducts.map(product => {
      const reasons: string[] = [];
      let score = 0;

      // Price similarity
      const priceDiff = Math.abs(product.price - sourceProduct.price);
      const priceScore = 1 - priceDiff / sourceProduct.price;
      score += priceScore * 0.3;

      if (priceScore > 0.9) {
        reasons.push('Similar price point');
      }

      // Rating comparison
      const ratingDiff = Math.abs(product.rating - sourceProduct.rating);
      const ratingScore = 1 - ratingDiff / 5;
      score += ratingScore * 0.3;

      if (product.rating > sourceProduct.rating) {
        reasons.push('Higher rated');
      }

      // Review count impact
      const reviewScore = Math.min(product.reviews_count / sourceProduct.reviews_count, 1);
      score += reviewScore * 0.4;

      if (product.reviews_count > sourceProduct.reviews_count) {
        reasons.push('More customer reviews');
      }

      return {
        id: product.id,
        title: product.title,
        score: parseFloat(score.toFixed(2)),
        reasons,
      };
    });

    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
