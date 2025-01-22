import React, { useState } from 'react';
import { Star, ShoppingCart, Search, Filter } from 'lucide-react';
import { Product } from '../types';
import ProductDetail from '../pages/TestProductDetail';
import ProductQuestionnaire from './ProductQuestionnaire';

interface ShoppingExperienceProps {
  products?: Product[];
  onProductSelected: (product: Product) => void;
  setShowQuestionnaire: (show: boolean) => void;
}

// Generate mock products with real Amazon images
const mockProducts: Product[] = [
  {
    id: 'fs1',
    name: 'Downy Ultra April Fresh Liquid Fabric Softener',
    description: 'Long-lasting fresh scent fabric softener with 24-hour freshness protection',
    bullet_points: [
      'Keeps clothes soft and fresh for weeks',
      'Reduces wrinkles and static cling',
      'Safe for all washing machines',
      'April Fresh scent',
      'Works in all water temperatures'
    ],
    price: 11.99,
    image: 'https://m.media-amazon.com/images/I/41z917f644L.AC_SR250,250_QL65.jpg',
    images: ['https://m.media-amazon.com/images/I/41z917f644L.AC_SR250,250_QL65.jpg'],
    category: 'Fabric Softener',
    brand: 'Downy',
    rating: 4.8,
    reviews: 12453,
    isCompetitor: false,
    bestSeller: true,
    loads: 120,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fs2',
    name: 'Snuggle SuperCare Liquid Fabric Softener',
    description: 'Color-safe fabric softener that protects clothes from fading and wear',
    bullet_points: [
      'Color protection formula',
      'Reduces static cling',
      'Fresh spring scent',
      'Safe for all fabrics',
      'Concentrated formula'
    ],
    price: 10.99,
    image: 'https://m.media-amazon.com/images/I/71x4L7+8zEL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/71x4L7+8zEL.AC_UL320.jpg'],
    category: 'Fabric Softener',
    brand: 'Snuggle',
    rating: 4.6,
    reviews: 8923,
    isCompetitor: true,
    bestSeller: false,
    loads: 95,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ld1',
    name: 'Tide Original Liquid Laundry Detergent',
    description: 'Premium laundry detergent with powerful stain-fighting capabilities',
    bullet_points: [
      'Removes tough stains',
      'Original fresh scent',
      'Works in all temperatures',
      'HE washer compatible',
      'Concentrated formula'
    ],
    price: 15.99,
    image: 'https://m.media-amazon.com/images/I/41Vxbu2SNEL.AC_SR250,250_QL65.jpg',
    images: ['https://m.media-amazon.com/images/I/41Vxbu2SNEL.AC_SR250,250_QL65.jpg'],
    category: 'Laundry Detergent',
    brand: 'Tide',
    rating: 4.7,
    reviews: 15234,
    isCompetitor: true,
    bestSeller: false,
    loads: 64,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'apc1',
    name: 'Mrs. Meyers Clean Day Multi-Surface Cleaner',
    description: 'Plant-derived all-purpose cleaning solution with natural essential oils',
    bullet_points: [
      'Made with essential oils',
      'Plant-derived ingredients',
      'Biodegradable formula',
      'Garden-fresh scent',
      'Safe for all surfaces'
    ],
    price: 8.99,
    image: 'https://m.media-amazon.com/images/I/411yF6W8tbL.AC_SR250,250_QL65.jpg',
    images: ['https://m.media-amazon.com/images/I/411yF6W8tbL.AC_SR250,250_QL65.jpg'],
    category: 'All-Purpose Cleaner',
    brand: 'Mrs. Meyers',
    rating: 4.9,
    reviews: 5672,
    isCompetitor: true,
    bestSeller: false,
    loads: 0,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ds1',
    name: 'Dawn Ultra Dishwashing Liquid',
    description: 'Powerful dish soap that cuts through grease and makes dishes sparkle',
    bullet_points: [
      'Cuts through tough grease',
      'Long-lasting suds',
      'Concentrated formula',
      'Original scent',
      'Biodegradable surfactants'
    ],
    price: 7.99,
    image: 'https://m.media-amazon.com/images/I/61SSAhzy+xL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/61SSAhzy+xL.AC_UL320.jpg'],
    category: 'Dish Soap',
    brand: 'Dawn',
    rating: 4.9,
    reviews: 23412,
    isCompetitor: true,
    bestSeller: false,
    loads: 0,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bc1',
    name: 'Lysol Power Bathroom Cleaner',
    description: 'Professional-strength bathroom cleaner that eliminates soap scum and limescale',
    bullet_points: [
      'Kills 99.9% of bacteria',
      'Removes soap scum',
      'Eliminates limescale',
      'Fresh clean scent',
      'No harsh chemical smell'
    ],
    price: 6.99,
    image: 'https://m.media-amazon.com/images/I/61zfsdWQLxL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/61zfsdWQLxL.AC_UL320.jpg'],
    category: 'Bathroom Cleaner',
    brand: 'Lysol',
    rating: 4.6,
    reviews: 8923,
    isCompetitor: true,
    bestSeller: false,
    loads: 0,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'af1',
    name: 'Febreze Air Freshener Spray',
    description: 'Long-lasting air freshener that eliminates odors and leaves a fresh scent',
    bullet_points: [
      'Eliminates odors',
      'Long-lasting freshness',
      'Safe for fabrics',
      'Multiple fresh scents',
      'No wet residue'
    ],
    price: 5.99,
    image: 'https://m.media-amazon.com/images/I/71FxmK9qiHL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/71FxmK9qiHL.AC_UL320.jpg'],
    category: 'Air Freshener',
    brand: 'Febreze',
    rating: 4.7,
    reviews: 15632,
    isCompetitor: true,
    bestSeller: false,
    loads: 0,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ld2',
    name: 'Persil ProClean Liquid Laundry Detergent',
    description: 'Premium deep clean laundry detergent with pro-lift technology',
    bullet_points: [
      'Pro-lift technology',
      'Deep cleaning formula',
      'Fresh scent',
      'Removes tough stains',
      'Safe for all fabrics'
    ],
    price: 17.99,
    image: 'https://m.media-amazon.com/images/I/71VSaspFGhL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/71VSaspFGhL.AC_UL320.jpg'],
    category: 'Laundry Detergent',
    brand: 'Persil',
    rating: 4.8,
    reviews: 7432,
    isCompetitor: true,
    bestSeller: false,
    loads: 96,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'apc2',
    name: 'Method All-Purpose Natural Surface Cleaner',
    description: 'Plant-based all-purpose cleaner that is tough on dirt but gentle on surfaces',
    bullet_points: [
      'Plant-based formula',
      'Biodegradable',
      'Non-toxic',
      'Multiple scents available',
      'Safe for all surfaces'
    ],
    price: 9.99,
    image: 'https://m.media-amazon.com/images/I/81edBxfG+7L.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/81edBxfG+7L.AC_UL320.jpg'],
    category: 'All-Purpose Cleaner',
    brand: 'Method',
    rating: 4.7,
    reviews: 11234,
    isCompetitor: true,
    bestSeller: false,
    loads: 0,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ds2',
    name: 'Seventh Generation Dish Liquid Soap',
    description: 'Plant-based dish soap that is tough on grease but gentle on hands',
    bullet_points: [
      'Plant-based formula',
      'Free of dyes',
      'Biodegradable',
      'Cuts through grease',
      'Gentle on hands'
    ],
    price: 8.99,
    image: 'https://m.media-amazon.com/images/I/71peBi4LONL.AC_UL320.jpg',
    images: ['https://m.media-amazon.com/images/I/71peBi4LONL.AC_UL320.jpg'],
    category: 'Dish Soap',
    brand: 'Seventh Generation',
    rating: 4.5,
    reviews: 6783,
    isCompetitor: true,
    bestSeller: false,
    loads: 0,
    userId: 'demo',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function ShoppingExperience({
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

  const filteredProducts = mockProducts
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
          return b.rating - a.rating;
        default:
          return b.reviews - a.reviews;
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
                placeholder="Search fabric softeners..."
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
          <p className="text-xs text-[#565959] mt-2">
            {filteredProducts.length} results for "fabric softener"
          </p>
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
                  {[...Array(5)].map((_, i) => {
                    const isFullStar = i < Math.floor(product.rating || 5);
                    const isHalfStar = !isFullStar && i < product.rating;
                    return (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${isFullStar
                          ? 'text-yellow-400 fill-yellow-400'
                          : isHalfStar
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-200 fill-gray-200'
                          }`}
                        style={{
                          clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none'
                        }}
                      />
                    );
                  })}
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
              <div className="mt-1 flex items-center gap-1">
                <img
                  src="https://m.media-amazon.com/images/G/01/prime/marketing/slashPrime/amazon-prime-delivery-lock._CB485968312_.png"
                  alt="Prime"
                  className="h-[18px] object-contain"
                />
                <span className="text-[12px] text-[#007185]">FREE delivery</span>
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