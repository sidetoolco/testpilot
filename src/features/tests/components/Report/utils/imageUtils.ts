/**
 * Utility functions for handling images in PDF generation
 */

/**
 * Cleans and validates image URLs for react-pdf compatibility
 * @param imageUrl - The original image URL
 * @returns A cleaned URL that should work with react-pdf, or null if invalid
 */
export function cleanImageUrlForPDF(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    
    // Special handling for Supabase storage URLs - they don't have extensions but are valid
    if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/public/')) {
      // Supabase storage URLs are valid even without extensions
      return imageUrl;
    }
    
    // For other URLs, check if it's a valid image extension
    const pathname = url.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    // Check if the pathname contains any valid image extension (not just at the end)
    // This handles cases like Walmart URLs where the extension is in the middle of the filename
    const hasValidExtension = validExtensions.some(ext => pathname.includes(ext));
    
    if (!hasValidExtension) {
      console.warn('Invalid image extension for PDF:', imageUrl);
      return null;
    }
    
    // For Walmart images, we can try to optimize the URL
    if (url.hostname.includes('walmartimages.com')) {
      // Remove query parameters that might cause issues
      return `${url.protocol}//${url.hostname}${url.pathname}`;
    }
    
    // For other URLs, return as-is but validate
    return imageUrl;
  } catch (error) {
    console.warn('Invalid image URL for PDF:', imageUrl, error);
    return null;
  }
}

/**
 * Gets a fallback image URL for PDF when the original fails
 * @returns A placeholder image URL
 */
export function getFallbackImageUrl(): string {
  // Return a simple placeholder or logo
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
}
