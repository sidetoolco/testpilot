import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../../types';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <motion.div
          key={product.id}
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div 
            className="aspect-square mb-4 relative bg-gray-50 rounded-lg p-4 cursor-pointer"
            onClick={() => onEdit(product)}
          >
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2">
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

            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{product.brand}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
