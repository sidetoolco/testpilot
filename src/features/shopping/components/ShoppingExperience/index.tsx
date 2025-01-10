import React, { useState } from 'react';
import { Star, ShoppingCart, Search, Filter } from 'lucide-react';
import { Product } from '../../../../types';
import ProductDetail from '../ProductDetail';
import ProductQuestionnaire from '../ProductQuestionnaire';

interface ShoppingExperienceProps {
  products?: Product[];
  onProductSelected: (product: Product) => void;
  setShowQuestionnaire: (show: boolean) => void;
}

export default function ShoppingExperience({ 
  products = [], 
  onProductSelected,
  setShowQuestionnaire 
}: ShoppingExperienceProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  const handleAddToCart = (product: Product) => {
    onProductSelected(product);
    setShowQuestionnaire(true);
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return (b.reviews || 0) - (a.reviews || 0);
      }
    });

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900]"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="bg-white px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="relative flex flex-col p-4 hover:outline hover:outline-[#007185] hover:outline-[1px] rounded cursor-pointer"
            >
              {product.bestSeller && (
                <div className="absolute top-2 left-2 z-10 bg-[#CC6B10] text-white text-xs px-2 py-0.5 rounded-sm font-medium">
                  Best Seller
                </div>
              )}
              <div 
                className="relative pt-[100%] mb-3"
                onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h3 
                className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {product.name}
              </h3>
              <div className="flex items-center mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-[14px] w-[14px] ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-[#F8991D] fill-[#F8991D]'
                          : 'text-[#DDD] fill-[#DDD]'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                  {product.reviews?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline gap-[2px] text-[#0F1111]">
                <span className="text-xs align-top mt-[1px]">$</span>
                <span className="text-[17px] font-medium">{Math.floor(product.price)}</span>
                <span className="text-[13px]">
                  {(product.price % 1).toFixed(2).substring(1)}
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => {
            handleAddToCart(selectedProduct);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}