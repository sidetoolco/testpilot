import { Star, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../../../types';
import { toast } from 'sonner';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<void>;
  onDuplicate?: (product: Product) => void;
}

const STAR_ARRAY = Array.from({ length: 5 }, (_, i) => i);

export default function ProductGrid({ products, onEdit, onDelete, onDuplicate }: ProductGridProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deletedProducts, setDeletedProducts] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    // Use a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const handleDropdownToggle = useCallback((productId: string | undefined) => {
    if (!productId) return;
    setOpenDropdown(prev => (prev === productId ? null : productId));
  }, []);

  const handleOptionClick = useCallback(
    (action: 'edit' | 'delete' | 'duplicate', product: Product) => {
      setOpenDropdown(null);

      switch (action) {
        case 'edit':
          onEdit(product);
          break;
        case 'duplicate':
          onDuplicate?.(product);
          break;
        case 'delete':
          setProductToDelete(product);
          setShowDeleteConfirm(true);
          break;
      }
    },
    [onEdit, onDuplicate]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete?.id) return;

    try {
      // Optimistic update - immediately hide the product
      setDeletedProducts(prev => new Set(prev).add(productToDelete.id!));

      // Call the delete function
      await onDelete(productToDelete.id);

      // If successful, keep the product hidden and close modal
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      // If deletion fails, remove from deletedProducts to show it again
      setDeletedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productToDelete.id!);
        return newSet;
      });

      console.error('Failed to delete product:', error);

      // Show user-friendly error message based on the error type
      let errorMessage = 'Failed to delete product. Please try again.';

      if (error?.message) {
        if (
          error.message.includes('foreign key constraint') ||
          error.message.includes('test_times')
        ) {
          errorMessage =
            'Cannot delete this product because it is currently being used in active test sessions. Please wait for all tests to complete or contact support.';
        } else if (error.message.includes('test_variations')) {
          errorMessage =
            'Cannot delete this product because it is currently being used in active tests. Please remove it from all tests first.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);

      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  }, [productToDelete, onDelete]);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  }, []);

  // Memoize filtered products to avoid unnecessary re-renders
  const visibleProducts = useMemo(
    () => products.filter(product => !deletedProducts.has(product.id || '')),
    [products, deletedProducts]
  );

  // Memoize star rendering function
  const renderStars = useCallback((rating: number) => {
    const fullStars = Math.round(rating || 5);

    return STAR_ARRAY.map(i => {
      const isFullStar = i < fullStars;
      const isHalfStar = !isFullStar && i < rating;

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
    });
  }, []);

  return (
    <>
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
                className=" text-gray-900 text-sm line-clamp-2 min-h-[55px] cursor-pointer hover:text-primary-400"
                onClick={() => onEdit(product)}
              >
                {product.title}
              </h3>

              <div className="flex items-center space-x-2">
                <div className="flex items-center">{renderStars(product.rating)}</div>
                <span className="text-sm text-gray-500">({product.reviews_count})</span>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>

                {/* Three dots menu button */}
                <div className="relative">
                  <button
                    onClick={e => {
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
                        onClick={e => {
                          e.stopPropagation();
                          handleOptionClick('edit', product);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOptionClick('duplicate', product);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={e => {
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{productToDelete.title}"? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
