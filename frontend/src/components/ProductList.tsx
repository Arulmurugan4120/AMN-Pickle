import React from 'react';
import ProductCard from './ProductCard';
import { IProduct } from '../types';

interface ProductListProps {
  products: IProduct[];
  quantities: Record<string, number>;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, quantities, onUpdateQuantity }) => {
  return (
    <section>
      {/* Section Header */}
      <div className="text-center mb-14 animate-fade-up">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-3">
          Curated Collection
        </p>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
          Our Products
        </h2>
        <p className="text-gray-400 max-w-md mx-auto text-sm">
          Each jar is handcrafted with premium ingredients and secured by enterprise-grade payment processing.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto stagger">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductList;
