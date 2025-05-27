import React, { useState } from 'react';
import { Product } from '../../../types';
import ImageUpload from './ImageUpload';
import { toast } from 'sonner';

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
    brand: initialData?.brand || '',
    image_url: initialData?.image_url || '',
    images: initialData?.images || [],
    isCompetitor: initialData?.isCompetitor || false,
    loads: initialData?.loads || undefined,
    product_url: initialData?.product_url || '',
    rating: initialData?.rating || 5,
    reviews_count: initialData?.reviews_count,
    id: initialData?.id || undefined,
  });

  const [errors, setErrors] = useState({
    bulletPoints: false,
    description: false,
  });

  const [loading, setLoading] = useState(false);

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
    const numericPrice = parseFloat((formData.price || 0).toString());
    const numericReviewCount = parseInt((formData.reviews_count || 0).toString());

    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(numericReviewCount) || numericReviewCount < 0) {
      alert('Please enter a valid number of reviews');
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
      brand: formData.brand,
      image_url: formData.images[0],
      images: formData.images,
      isCompetitor: formData.isCompetitor,
      loads: formData.loads ? formData.loads : undefined,
      product_url: formData.product_url,
      rating: formData.rating,
      reviews_count: numericReviewCount,
      id: initialData?.id || undefined,
    };

    setLoading(true);

    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
        <ImageUpload
          images={formData.images}
          onChange={images => setFormData({ ...formData, images })}
          maxImages={4}
        />
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400`}
          rows={3}
        />
      </div>

      {/* Bullet Points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About the product ( Enter 5 key points)
        </label>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map(index => (
            <input
              key={index}
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
              placeholder={`Key point ${index + 1}`}
            />
          ))}
        </div>
        {errors.bulletPoints && (
          <p className="mt-1 text-sm text-red-500">Please fill all the bullet points</p>
        )}
      </div>

      {/* Price and Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.price === undefined ? '' : formData.price}
            onChange={e => {
              const inputValue = e.target.value;
              // Allow empty string or valid numbers
              if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                setFormData({ ...formData, price: inputValue === '' ? 0 : parseFloat(inputValue) });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Reviews</label>
          <input
            type="number"
            value={formData.reviews_count === undefined ? '' : formData.reviews_count}
            onChange={e => {
              const value = e.target.value;
              setFormData({
                ...formData,
                reviews_count: value === '' ? 0 : parseInt(value),
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            required
          />
        </div>
      </div>

      {/* Star Rating and Reviews */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ratingRange" className="block text-sm font-medium text-gray-700 mb-1">
            Star Rating
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
  );
}
