import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { Product } from '../types';
import ProductHeader from '../features/products/components/ProductHeader';
import ProductSearch from '../features/products/components/ProductSearch';
import ProductGrid from '../features/products/components/ProductGrid';
import ProductModal from '../features/products/components/ProductModal';
import ComingSoonModal from '../components/ComingSoonModal';
import ModalLayout from '../layouts/ModalLayout';
import { toast } from 'sonner';

export default function AllProducts() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct } =
    useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (
    productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editProduct) {
        await updateProduct(editProduct.id!, productData);
      } else {
        await addProduct(productData);
      }
      setShowAddProduct(false);
      setEditProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setShowAddProduct(false);
      setEditProduct(null);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      throw err;
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const duplicatedProduct: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        title: `${product.title} (Copy)`,
        description: product.description,
        bullet_points: product.bullet_points,
        price: product.price,
        image_url: product.image_url,
        images: product.images,
        brand: product.brand,
        rating: product.rating,
        reviews_count: product.reviews_count,
        isCompetitor: product.isCompetitor,
        loads: product.loads,
        product_url: product.product_url,
      };

      await addProduct(duplicatedProduct);
      toast.success('Product duplicated successfully');
    } catch (err) {
      console.error('Failed to duplicate product:', err);
      toast.error('Failed to duplicate product. Please try again.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFF8F8] p-8 w-full">
      <ProductHeader
        onAddProduct={() => setShowAddProduct(true)}
        onConnectShopify={() => setShowComingSoon(true)}
      />

      <ProductSearch value={searchTerm} onChange={setSearchTerm} />

      {loading ? (
        <div className="-mx-8 text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <ProductGrid
          products={filteredProducts}
          onEdit={setEditProduct}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}

      <ProductModal
        isOpen={showAddProduct || !!editProduct}
        onClose={() => {
          setShowAddProduct(false);
          setEditProduct(null);
        }}
        onSubmit={handleSubmit}
        initialData={editProduct || undefined}
        onDelete={
          editProduct
            ? () => {
                setProductToDelete(editProduct.id!);
                setShowDeleteConfirm(true);
              }
            : undefined
        }
      />

      <ModalLayout
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        title="Delete Product"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setProductToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => productToDelete && handleDelete(productToDelete)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalLayout>

      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Shopify Integration Coming Soon"
        description="We're currently working on integrating with Shopify to make it easier for you to import and manage your products."
      />
    </div>
  );
}
