import React, { useState } from 'react';
import { Product } from '../../../types';
import ImageUpload from './ImageUpload';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  initialData?: Product;
}

export default function ProductForm({ onSubmit, onClose, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    brand: initialData?.brand || '',
    image_url: initialData?.image_url || '',
    images: initialData?.images || [],
    isCompetitor: initialData?.isCompetitor || false,
    loads: initialData?.loads || undefined,
    product_url: initialData?.product_url || '',
    rating: initialData?.rating || 5,
    reviews_count: initialData?.reviews_count || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    // Convert numeric values
    const numericPrice = parseFloat(formData.price.toString());
    const numericReviewCount = parseInt(formData.reviews_count.toString());

    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(numericReviewCount) || numericReviewCount < 0) {
      alert('Please enter a valid number of reviews');
      return;
    }

    const productData = {
      title: formData.title,
      description: formData.description,
      price: numericPrice,
      brand: formData.brand,
      image_url: formData.images[0],
      images: formData.images,
      isCompetitor: formData.isCompetitor,
      loads: formData.loads ? formData.loads : undefined,
      product_url: formData.product_url,
      rating: formData.rating,
      reviews_count: numericReviewCount
    };
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Images
        </label>
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
          maxImages={4}
        />
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          rows={3}
        />
      </div>

      {/* Price and Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            required
          />
        </div>
      </div>

      {/* Star Rating and Reviews */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Star Rating
          </label>
          <input
            type="number"
            step="0.1" // Permite incrementos de 0.1 para calificaciones decimales
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Reviews
          </label>
          <input
            type="number"
            min="0"
            value={formData.reviews_count}
            onChange={(e) => setFormData({ ...formData, reviews_count: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            required
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500"
        >
          {initialData ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}