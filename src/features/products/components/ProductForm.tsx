import React, { useState } from 'react';
import { Product } from '../../../types';
import ImageUpload from './ImageUpload';
import ProductPreviewModal from './ProductPreviewModal';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  initialData?: Product;
}

export default function ProductForm({ onSubmit, onClose, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    bullet_points: initialData?.bullet_points || [],
    price: initialData?.price,
    image_url: initialData?.image_url || '',
    images: initialData?.images || [],
    rating: initialData?.rating || 5,
    reviews_count: initialData?.reviews_count,
    id: initialData?.id || undefined,
  });

  const [errors, setErrors] = useState({
    bulletPoints: false,
    description: false,
  });

  const [displayPrice, setDisplayPrice] = useState(() => {
    if (initialData?.price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(initialData.price);
    }
    return '';
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');

    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return;
    }

    if (parts[1] && parts[1].length > 2) {
      return;
    }

    // Handle empty or invalid input
    let numericValue: number | undefined;
    if (sanitizedValue === '' || sanitizedValue === '.') {
      numericValue = undefined;
    } else {
      const parsed = parseFloat(sanitizedValue);
      numericValue = isNaN(parsed) ? undefined : parsed;
    }

    setFormData({ ...formData, price: numericValue });

    if (sanitizedValue === '') {
      setDisplayPrice('');
    } else if (sanitizedValue) {
      const formattedInteger = new Intl.NumberFormat('en-US').format(parseInt(parts[0] || '0'));
      let newDisplayValue = '$' + formattedInteger;

      if (parts.length > 1) {
        newDisplayValue += '.' + (parts[1] || '');
      }
      setDisplayPrice(newDisplayValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      bulletPoints:
        formData.bullet_points.length < 5 || formData.bullet_points.some(point => !point?.trim()),
      description: formData.description.length < 50,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      if (newErrors.bulletPoints) {
        toast.error('Please fill in all 5 bullet points about your product');
      }
      if (newErrors.description) {
        toast.error('Your description needs to be at least 50 characters long to be effective');
      }
      return;
    }

    if (formData.images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }
    // Convert numeric values
    const numericPrice = formData.price !== undefined ? formData.price : 0;
    const numericReviewCount = formData.reviews_count !== undefined ? formData.reviews_count : 0;

    if (formData.price === undefined || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (formData.reviews_count === undefined || formData.reviews_count < 0) {
      toast.error('Please enter a valid number of reviews');
      return;
    }

    // Split bullet points on submit
    const bulletPointsArray = formData.bullet_points
      .join('\n')
      .split('\n')
      .filter(point => point.trim() !== '');

    const productData = {
      title: formData.title,
      description: formData.description,
      bullet_points: bulletPointsArray,
      price: numericPrice,
      image_url: formData.images[0],
      images: formData.images,
      rating: formData.rating,
      reviews_count: numericReviewCount,
      id: initialData?.id || undefined,
    };

    setLoading(true);

    onSubmit(productData);
  };

  const createPreviewProduct = (): Product => {
    // Split bullet points for preview
    const bulletPointsArray = formData.bullet_points
      .join('\n')
      .split('\n')
      .filter(point => point.trim() !== '');

    return {
      id: initialData?.id || 'preview',
      title: formData.title,
      description: formData.description,
      bullet_points: bulletPointsArray,
      price: formData.price || 0,
      image_url: formData.images[0] || '',
      images: formData.images,
      rating: formData.rating,
      reviews_count: formData.reviews_count || 0,
    };
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  // Check if preview should be enabled
  const isPreviewEnabled = () => {
    const hasRequiredFields = formData.title && formData.description && formData.images.length > 0;
    const hasAtLeastOneBulletPoint = formData.bullet_points.some(point => point?.trim());
    const hasValidPrice = formData.price && formData.price > 0;
    const hasValidReviewCount = formData.reviews_count !== undefined && formData.reviews_count >= 0;
    return hasRequiredFields && hasAtLeastOneBulletPoint && hasValidPrice && hasValidReviewCount;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Product Images <span className="text-red-500">*</span>
            <Info className="h-4 w-4 text-gray-400 cursor-help" data-tooltip-id="image-tooltip" />
            <Tooltip id="image-tooltip">
              Upload up to 5 images. First image becomes the main product image.
            </Tooltip>
          </label>
          <ImageUpload
            images={formData.images}
            onChange={images => setFormData({ ...formData, images })}
            maxImages={5}
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Product Name <span className="text-red-500">*</span>
            <Info className="h-4 w-4 text-gray-400 cursor-help" data-tooltip-id="title-tooltip" />
            <Tooltip id="title-tooltip">
              Clear, descriptive product name customers will see.
            </Tooltip>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            placeholder="e.g., Premium Organic Coffee Beans, 12oz"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Description <span className="text-red-500">*</span>
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="description-tooltip"
            />
            <Tooltip id="description-tooltip">
              At least 50 characters describing your product.
            </Tooltip>
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400`}
            rows={3}
            placeholder="Describe your product's features, benefits, and what makes it special..."
          />
        </div>

        {/* Bullet Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            About the product (Enter 5 key points) <span className="text-red-500">*</span>
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              data-tooltip-id="bullet-points-tooltip"
            />
            <Tooltip id="bullet-points-tooltip">
              5 key features or benefits displayed as bullet points.
            </Tooltip>
          </label>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map(index => (
              <input
                key={`bullet-point-input-${index}`}
                type="text"
                value={formData.bullet_points[index] || ''}
                onChange={e => {
                  const newBulletPoints = [...formData.bullet_points];
                  newBulletPoints[index] = e.target.value;
                  setFormData({ ...formData, bullet_points: newBulletPoints });
                }}
                className={`w-full px-4 py-2 border ${
                  errors.bulletPoints ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400`}
                placeholder={`Key point ${index + 1} (e.g., High-quality materials, Easy to use, etc.)`}
              />
            ))}
          </div>
          {errors.bulletPoints && (
            <p className="mt-1 text-sm text-red-500">Please fill all the bullet points</p>
          )}
        </div>

        {/* Price and Reviews Count */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              Price <span className="text-red-500">*</span>
              <Info className="h-4 w-4 text-gray-400 cursor-help" data-tooltip-id="price-tooltip" />
              <Tooltip id="price-tooltip">Product price in USD with currency formatting.</Tooltip>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={displayPrice}
              onChange={handlePriceChange}
              placeholder="$0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              Number of Reviews <span className="text-red-500">*</span>
              <Info
                className="h-4 w-4 text-gray-400 cursor-help"
                data-tooltip-id="reviews-tooltip"
              />
              <Tooltip id="reviews-tooltip">Total number of customer reviews.</Tooltip>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.reviews_count === undefined ? '' : formData.reviews_count.toString()}
              onChange={e => {
                const value = e.target.value;
                const sanitizedValue = value.replace(/[^0-9]/g, '');

                if (sanitizedValue === '') {
                  setFormData({
                    ...formData,
                    reviews_count: undefined,
                  });
                } else {
                  const numericValue = parseInt(sanitizedValue);
                  if (!isNaN(numericValue)) {
                    setFormData({
                      ...formData,
                      reviews_count: numericValue,
                    });
                  }
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
              placeholder="e.g., 1250"
              required
            />
          </div>
        </div>

        {/* Star Rating and Reviews */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ratingRange"
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
            >
              Star Rating <span className="text-red-500">*</span>
              <Info
                className="h-4 w-4 text-gray-400 cursor-help"
                data-tooltip-id="rating-tooltip"
              />
              <Tooltip id="rating-tooltip">Average star rating (0.0 to 5.0 stars).</Tooltip>
            </label>
            <div className="flex items-center">
              <div className="relative w-full">
                <input
                  type="range"
                  id="ratingRange"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={e => {
                    const newRating = parseFloat(e.target.value);
                    setFormData(prev => ({ ...prev, rating: newRating }));
                  }}
                  style={{
                    background: `linear-gradient(to right, #22c55e ${(formData.rating / 5) * 100}%, #e5e7eb ${(formData.rating / 5) * 100}%)`,
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-green-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                  required
                />
              </div>
              <span className="ml-2 text-sm text-gray-700 min-w-[2.5rem]">
                {formData.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <div className="relative group">
            <button
              type="button"
              onClick={handlePreview}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                isPreviewEnabled()
                  ? 'border-primary-400 text-primary-400 hover:bg-primary-50'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              disabled={loading || !isPreviewEnabled()}
            >
              See Preview
            </button>
            {!isPreviewEnabled() && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Preview is only available when all required fields are filled
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : initialData ? (
              'Update Product'
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </form>

      <ProductPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        product={createPreviewProduct()}
      />
    </>
  );
}
