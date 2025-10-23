export const METRIC_DESCRIPTIONS: { [key: string]: string } = {
  'product': 'The product being evaluated, either the test product or a competitor.',
  'share_of_buy': 'The percentage of participants who selected this product variant as their final purchase choice.',
  'share_of_clicks': 'The percentage of participants who clicked on this product variant when viewing the product grid.',
  'value': 'Question asked: "How would you rate the value of this product?" - Measures how well the price matches the perceived quality and benefits.',
  'appearance': 'Question asked: "How appealing do you find the design and appearance of this product?" - Evaluates the visual appeal and attractiveness.',
  'aesthetics': 'Question asked: "How appealing do you find the design and appearance of this product?" - Evaluates the visual appeal and attractiveness.',
  'brand': 'Question asked: "How much do you trust this brand to meet your expectations?" - Assesses consumer trust and confidence in the brand.',
  'trust': 'Question asked: "How much do you trust this brand to meet your expectations?" - Assesses consumer trust and confidence in the brand.',
  'confidence': 'Question asked: "How confident are you that this product will deliver its promised results?" - Measures consumer confidence in product efficacy.',
  'utility': 'Question asked: "How confident are you that this product will deliver its promised results?" - Measures consumer confidence in product efficacy.',
  'convenience': 'Question asked: "How convenient does this product seem to use?" - Evaluates how easy and practical the product is to use.',
  'appetizing': 'Question asked: "This product looks / sounds appetizing?" - Measures how appealing and desirable the product looks or sounds to consume.',
  'target_audience': 'Question asked: "This is a product for people like me?" - Assesses how well the product resonates with the intended consumer demographic.',
  'novelty': 'Question asked: "This product is new and different?" - Evaluates how new, different, and innovative the product appears.',
  'value_score': 'An aggregate score representing how participants rated the overall value proposition of this variant.',
  'is_winner': 'Indicates whether this variant is statistically significantly better than others at a 90% confidence level.'
};

export const getMetricDescription = (metricId: string): string => {
  return METRIC_DESCRIPTIONS[metricId] || 'No description available for this metric.';
};

