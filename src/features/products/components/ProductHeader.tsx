import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductHeaderProps {
  onAddProduct: () => void;
  onConnectShopify: () => void;
}

export default function ProductHeader({ onAddProduct, onConnectShopify }: ProductHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal mb-2">My Products</h1>
        <p className="text-gray-600">Manage and organize your product catalog</p>
      </div>
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConnectShopify}
          className="flex items-center space-x-2 px-6 py-3 bg-[#96BF47] text-white rounded-xl hover:bg-[#85ab3f] transition-colors shadow-sm hover:shadow-md"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Connect Shopify</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddProduct}
          className="flex items-center space-x-2 px-6 py-3 bg-[#0A0A29] text-white rounded-xl hover:bg-[#1a1a3a] transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </motion.button>
      </div>
    </div>
  );
}