// Centralized field mappings for metric fallbacks
// Used to handle legacy data where metrics might be stored under different field names
export const METRIC_FIELD_MAPPINGS: { [key: string]: string[] } = {
  'value': ['value'],
  'appearance': ['appearance', 'aesthetics'],
  'aesthetics': ['aesthetics', 'appearance'],
  'brand': ['brand', 'trust'],
  'confidence': ['confidence', 'utility'],
  'convenience': ['convenience'],
  'utility': ['utility', 'confidence'],
  'appetizing': ['appetizing', 'aesthetics'],
  'target_audience': ['target_audience', 'convenience'],
  'novelty': ['novelty', 'utility'],
  'trust': ['trust', 'brand'], // Reverse mapping for completeness
};

/**
 * Get a metric value from an entity with fallback support for legacy field names
 * @param entity - The object containing metric fields (survey, competitor, etc.)
 * @param metricId - The metric ID to retrieve
 * @returns The metric value or null/0 if not found
 */
export function getValueForMetric<T extends Record<string, any>>(
  entity: T,
  metricId: string,
  returnNull: boolean = false
): number {
  const possibleFields = METRIC_FIELD_MAPPINGS[metricId] || [metricId];
  
  // Try each field in order until we find one that exists and is valid
  for (const fieldName of possibleFields) {
    const raw = entity[fieldName];
    const value = typeof raw === 'number' ? raw : Number(raw);
    
    // Check if the value exists and is a valid number (including 0)
    if (raw !== undefined && raw !== null && !Number.isNaN(value)) {
      return value;
    }
  }
  
  // Fallback: try the first field or return 0/null
  if (returnNull) {
    return null as any;
  }
  
  const fallback = entity[possibleFields[0]];
  return typeof fallback === 'number' ? fallback : Number(fallback) || 0;
}

/**
 * Get possible field names for a given metric ID
 * @param metricId - The metric ID
 * @returns Array of possible field names in priority order
 */
export function getPossibleFields(metricId: string): string[] {
  return METRIC_FIELD_MAPPINGS[metricId] || [metricId];
}

