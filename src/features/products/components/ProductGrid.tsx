import { Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Product } from '../../../types';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deletedProducts, setDeletedProducts] = useState<Set<string>>(new Set());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const handleDropdownToggle = (productId: string | undefined) => {
    if (!productId) return;
    setOpenDropdown(openDropdown === productId ? null : productId);
  };

  const handleOptionClick = (action: 'edit' | 'delete', product: Product) => {
    setOpenDropdown(null);
    
    switch (action) {
      case 'edit':
        onEdit(product);
        break;
      case 'delete':
        if (product.id) {
          // Optimistic update - immediately hide the product
          setDeletedProducts(prev => new Set(prev).add(product.id!));
          // Call the delete function
          onDelete(product.id);
        }
        break;
    }
  };

  // Filter out deleted products for optimistic updates
  const visibleProducts = products.filter(product => !deletedProducts.has(product.id || ''));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6">
      {visibleProducts.map(product => (
        <motion.div
          key={product.id}
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all group flex flex-col relative"
        >

          <div
            className="h-48 mb-4 relative bg-gray-50 rounded-lg p-4 cursor-pointer flex items-center justify-center"
            onClick={() => onEdit(product)}
          >
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2 flex flex-col flex-grow">
            <h3
              className="font-medium text-gray-900 line-clamp-2 min-h-[48px] cursor-pointer hover:text-primary-400"
              onClick={() => onEdit(product)}
            >
              {product.title}
            </h3>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => {
                  const fullStars = Math.round(product.rating || 5);
                  const isFullStar = i < fullStars;
                  const isHalfStar = !isFullStar && i < product.rating;
                  return (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        isFullStar
                          ? 'text-[#dd8433] fill-[#dd8433]'
                          : isHalfStar
                          ? 'text-[#dd8433] fill-current'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                      style={{
                        clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-500">({product.reviews_count})</span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
              
              {/* Three dots menu button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDropdownToggle(product.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* Dropdown menu */}
                {openDropdown === product.id && (
                  <div className="absolute right-0 bottom-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('edit', product);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('delete', product);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}