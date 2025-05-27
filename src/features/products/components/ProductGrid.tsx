import { Edit2, Trash2, Star } from 'lucide-react';
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
          <div className="aspect-square mb-4 relative bg-gray-50 rounded-lg p-4">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(product)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(product.id || '')}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </motion.button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[48px]">{product.title}</h3>

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
