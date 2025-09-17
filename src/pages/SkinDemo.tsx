import React, { useState } from 'react';
import WalmartSkin from '../components/skins/WalmartSkin';
import { Product } from '../types/products';

// Sample product data from Amazon scraper
const sampleProducts: Product[] = [
  {
    id: 1,
    name: 'Wireless Bluetooth Earbuds',
    price: 29.99,
    originalPrice: 49.99,
    size: 'Black',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Earbuds',
    rating: 4.3,
    reviews: 1247,
    availability: 'In Stock',
    shipping: 'Free shipping',
    brand: 'TechBrand',
    category: 'Electronics',
    isPrime: true,
  },
  {
    id: 2,
    name: 'Organic Cotton T-Shirt',
    price: 19.99,
    size: 'Medium',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=T-Shirt',
    rating: 4.7,
    reviews: 892,
    availability: 'In Stock',
    shipping: 'Free shipping',
    brand: 'EcoWear',
    category: 'Clothing',
  },
  {
    id: 3,
    name: 'Stainless Steel Water Bottle',
    price: 24.99,
    originalPrice: 34.99,
    size: '32oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Water+Bottle',
    rating: 4.5,
    reviews: 2156,
    availability: 'In Stock',
    shipping: 'Free shipping',
    brand: 'HydroLife',
    category: 'Home & Garden',
    isPrime: true,
  },
  {
    id: 4,
    name: 'Smartphone Case',
    price: 12.99,
    size: 'iPhone 13',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Phone+Case',
    rating: 4.2,
    reviews: 567,
    availability: 'In Stock',
    shipping: 'Free shipping',
    brand: 'CasePro',
    category: 'Electronics',
  },
  {
    id: 5,
    name: 'Yoga Mat',
    price: 39.99,
    size: '6ft x 2ft',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Yoga+Mat',
    rating: 4.6,
    reviews: 1234,
    availability: 'In Stock',
    shipping: 'Free shipping',
    brand: 'FitLife',
    category: 'Sports',
    isPrime: true,
  },
  {
    id: 6,
    name: 'Coffee Maker',
    price: 89.99,
    originalPrice: 129.99,
    size: '12-cup',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Coffee+Maker',
    rating: 4.4,
    reviews: 3456,
    availability: 'In Stock',
    shipping: 'Free shipping',
    brand: 'BrewMaster',
    category: 'Home & Garden',
  },
];

export default function SkinDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter products based on search query
  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    // Handle product click - could open product detail page
  };

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product);
    // Handle add to cart functionality
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };



  return (
    <div className="min-h-screen bg-gray-100">
      {/* Skin Toggle Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Walmart Skin Demo</h1>
            <p className="text-gray-600">Walmart skin using Amazon scraper data</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isLoading ? 'Stop Loading' : 'Show Loading'}
            </button>
          </div>
        </div>
          
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Demo Controls:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• This is a Walmart skin that uses data from your Amazon scraper</p>
                <p>• Search functionality works in the skin</p>
                <p>• Product clicks and cart additions are logged to console</p>
                <p>• Loading state can be toggled for testing</p>
              </div>
            </div>
        </div>
      </div>

      {/* Render the Walmart skin */}
      <WalmartSkin
        products={filteredProducts}
        isLoading={isLoading}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
    </div>
  );
}
