import { supabase } from '../../../lib/supabase';
import { SearchProductsRequest } from '../types';

export async function invokeSearchFunction(request: SearchProductsRequest) {
  const { data, error } = await supabase.functions.invoke('search-amazon', {
    body: request,
  });

  if (error) {
    throw new Error(`Failed to invoke search function: ${error.message}`);
  }

  return data;
}
