import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { Product } from '../types';
import ProductHeader from '../features/products/components/ProductHeader';
import ProductSearch from '../features/products/components/ProductSearch';
import ProductGrid from '../features/products/components/ProductGrid';
import ProductModal from '../features/products/components/ProductModal';
import ComingSoonModal from '../components/ComingSoonModal';
import ConfirmModal from '../components/ui/ConfirmModal';

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
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const filteredProducts = products.filter(
    product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
        <ProductGrid products={filteredProducts} onEdit={setEditProduct} onDelete={handleDelete} />
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        onConfirm={() => productToDelete && handleDelete(productToDelete)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Shopify Integration Coming Soon"
        description="We're currently working on integrating with Shopify to make it easier for you to import and manage your products."
      />
    </div>
  );
}
