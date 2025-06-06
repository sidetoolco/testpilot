import { supabase } from './supabase';

type EventType = 'click';

interface EventMetadata {
  test_id?: string;
  variation_type?: string;
  product_id?: string;
}

export const trackEvent = async (type: EventType, metadata: EventMetadata = {}, path: string) => {
  try {
    const { error } = await supabase.from('events').insert({
      type,
      metadata,
      path,
    } as any);

    if (error) {
      console.error('Error tracking event:', error);
    }
  } catch (error) {
    console.error('Error in trackEvent:', error);
  }
};
