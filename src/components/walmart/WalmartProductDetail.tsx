import React, { useState } from 'react';
import { ArrowLeft, Star, CheckCircle, Truck, MapPin, Building, Heart } from 'lucide-react';

interface WalmartProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
}

export default function WalmartProductDetail({ 
  product, 
  onBack, 
  onAddToCart 
}: WalmartProductDetailProps) {
  const [mainImage, setMainImage] = useState(
    product.imageUrl || product.image_url || product.image
  );

  const thumbnails = [
    product.imageUrl || product.image_url || product.image,
    'https://placehold.co/100x100/EFEFEF/333?text=View+2',
    'https://placehold.co/100x100/EFEFEF/333?text=View+3',
    'https://placehold.co/100x100/EFEFEF/333?text=Nutrition'
  ];

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0071dc] mb-6"
      >
        <ArrowLeft size={16} /> Back to search results
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Column */}
        <div className="lg:col-span-1 flex flex-col md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 order-2 md:order-1">
            {thumbnails.map((thumb, index) => (
              <div 
                key={index} 
                className="w-16 h-16 border rounded-md p-1 cursor-pointer hover:border-[#0071dc]" 
                onClick={() => setMainImage(thumb)}
              >
                <img 
                  src={thumb} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-contain" 
                />
              </div>
            ))}
          </div>
          <div className="flex-grow order-1 md:order-2">
            <img 
              src={mainImage} 
              alt={product.title || product.name || 'Product'} 
              className="w-full rounded-lg border" 
            />
          </div>
        </div>

        {/* Product Information Column */}
        <div className="lg:col-span-1">
          <span className="text-xs font-bold bg-blue-100 text-[#0071dc] px-2 py-1 rounded-full">
            Popular Choice
          </span>
          <h1 className="text-2xl font-bold mt-2">
            {product.title || product.name || 'Product Name'}
          </h1>
          
          {product.rating && (
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-1">({product.reviews || 0} reviews)</span>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-gray-700">
              {product.description || 'No description available'}
            </p>
          </div>
          
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">About this item</h2>
            {product.details && product.details.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {product.details.map((detail: string, i: number) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No additional details available</p>
            )}
          </div>
        </div>

        {/* Purchase Column */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${product.price ? product.price.toFixed(2) : 'N/A'}
              </span>
              <span className="text-gray-500 text-sm">/each</span>
            </div>
            
            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
              <CheckCircle size={16}/> Free shipping with 30-day trial
            </p>
            
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#0071dc] text-white font-bold py-3 rounded-full mt-4 hover:bg-[#005cb4] transition-colors"
            >
              Add to Cart
            </button>
            
            <div className="mt-4 space-y-3">
              <div className="border rounded-md p-3 flex justify-between items-center">
                <label htmlFor="subscribe" className="flex flex-col">
                  <span className="font-bold">Subscribe</span>
                  <span className="text-sm text-green-600">Save and receive today</span>
                </label>
                <input type="radio" name="purchaseType" id="subscribe" />
              </div>
              <div className="border-2 border-[#0071dc] rounded-md p-3 flex justify-between items-center bg-blue-50">
                <label htmlFor="onetime" className="font-bold">One-time purchase</label>
                <input type="radio" name="purchaseType" id="onetime" defaultChecked />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold mb-2">How you'll receive it:</h3>
              <div className="flex justify-around text-center">
                <div className="p-2 border-b-4 border-[#0071dc]">
                  <Truck size={24} className="mx-auto text-[#0071dc]" />
                  <p className="text-sm font-bold text-[#0071dc]">Shipping</p>
                  <p className="text-xs">Starting tomorrow</p>
                </div>
                <div className="p-2">
                  <MapPin size={24} className="mx-auto" />
                  <p className="text-sm font-bold">Pickup</p>
                  <p className="text-xs">Not available</p>
                </div>
                <div className="p-2">
                  <Building size={24} className="mx-auto" />
                  <p className="text-sm font-bold">Delivery</p>
                  <p className="text-xs">Starting at 7 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
