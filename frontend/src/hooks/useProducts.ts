import { useState, useEffect } from 'react';
import { ProductService } from '../services/api';
import { IProduct, ICartItem } from '../types';

/**
 * useProducts Hook (TypeScript)
 * Manages fetching products and their quantities in the cart.
 */
export const useProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductService.getProducts();
        const productData = response.data.data.products;
        if (productData && productData.length > 0) {
          setProducts(productData);
          const initialQuantities: Record<string, number> = {};
          productData.forEach((p: IProduct) => initialQuantities[p.id] = 0);
          setQuantities(initialQuantities);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        // Fall through to static data
      }
      
      // Fallback: static products (works without database)
      const staticProducts: IProduct[] = [
        { id: "lemon", name: "500g Lemon Pickle", price: 100, description: "Tangy and spicy homemade lemon pickle with rock salt.", weight: "500g" },
        { id: "mango", name: "500g Mango Pickle", price: 80, description: "Authentic raw mango pickle with traditional Indian spices.", weight: "500g" },
        { id: "garlic", name: "500g Garlic Pickle", price: 120, description: "Hot and pungent garlic pickle made with cold-pressed mustard oil.", weight: "500g" },
        { id: "mixed-veg", name: "500g Mixed Veg Pickle", price: 150, description: "A medley of seasonal vegetables pickled in aromatic spice blend.", weight: "500g" },
        { id: "chili", name: "250g Green Chili Pickle", price: 60, description: "Fiery green chili pickle for those who love extra heat.", weight: "250g" },
      ];
      setProducts(staticProducts);
      const initialQuantities: Record<string, number> = {};
      staticProducts.forEach(p => initialQuantities[p.id] = 0);
      setQuantities(initialQuantities);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const updateQuantity = (id: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: quantity }));
  };

  const resetQuantities = () => {
    const reset: Record<string, number> = {};
    products.forEach(p => reset[p.id] = 0);
    setQuantities(reset);
  };

  const total = products.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] || 0),
    0
  );

  return { products, quantities, updateQuantity, resetQuantities, total, loading, error };
};
