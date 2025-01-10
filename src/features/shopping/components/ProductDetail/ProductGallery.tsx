import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="sticky top-20">
      <div className="relative aspect-square bg-[#F8F8F8] mb-4 rounded-lg">
        <img
          src={images[selectedImage]}
          alt="Product"
          className="w-full h-full object-contain p-4"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-none w-20 aspect-square border-2 rounded-lg ${
              selectedImage === index ? 'border-[#E77600]' : 'border-gray-200'
            } hover:border-[#E77600] transition-colors`}
          >
            <img 
              src={image} 
              alt="" 
              className="w-full h-full object-contain p-2" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}