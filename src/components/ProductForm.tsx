import React, { useState } from 'react';
import { Product } from '../types';
import ImageUpload from '../features/products/components/ImageUpload';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  initialData?: Product;
}

export default function ProductForm({ onSubmit, onClose, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    brand: initialData?.brand || '',
    images: initialData?.images || [],
    isCompetitor: initialData?.isCompetitor || false,
    bestSeller: initialData?.bestSeller || false,
    loads: initialData?.loads || '',
    amazonUrl: initialData?.amazonUrl || '',
    starRating: initialData?.starRating || 5,
    reviewCount: initialData?.reviewCount?.toString() || '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    // Convert numeric values
    const numericPrice = parseFloat(formData.price.toString());
    const numericReviewCount = parseInt(formData.reviewCount.toString());
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(numericReviewCount) || numericReviewCount < 0) {
      alert('Please enter a valid number of reviews');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: numericPrice,
      brand: formData.brand,
      image: formData.images[0],
      images: formData.images,
      isCompetitor: formData.isCompetitor,
      bestSeller: formData.bestSeller,
      loads: parseInt(formData.loads.toString()) || null,
      amazonUrl: formData.amazonUrl || null,
      starRating: parseInt(formData.starRating.toString()),
      reviewCount: numericReviewCount
    };

    onSubmit(productData);
  };

  // Rest of the component remains the same...
}