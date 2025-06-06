import { AmazonProduct } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: AmazonProduct[];
  selectedProducts: AmazonProduct[];
  onProductSelect: (product: AmazonProduct) => void;
  renderTooltip?: (product: AmazonProduct) => React.ReactNode;
}

export function ProductGrid({ products, selectedProducts, onProductSelect, renderTooltip }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCard
          key={`product-card-${i}`}
          product={product}
          isSelected={selectedProducts.some(p => p.asin === product.asin)}
          onSelect={onProductSelect}
          renderTooltip={renderTooltip}
        />
      ))}
    </div>
  );
}
