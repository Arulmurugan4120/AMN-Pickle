import React from 'react';
import { IProduct } from '../types';

interface ProductCardProps {
  product: IProduct;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const FALLBACK_EMOJIS = ['🍯', '🥭', '🍋', '🌶️', '🧄', '🧅', '🫙', '🥗'];
const FALLBACK_GRADIENTS = [
  'from-yellow-400/20 via-lime-300/10 to-emerald-400/20',
  'from-orange-400/20 via-amber-300/10 to-yellow-400/20',
  'from-red-400/20 via-orange-300/10 to-yellow-400/20',
  'from-emerald-400/20 via-teal-300/10 to-cyan-400/20',
  'from-rose-400/20 via-pink-300/10 to-purple-400/20',
];

const getDynamicStyles = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const emoji = FALLBACK_EMOJIS[hash % FALLBACK_EMOJIS.length];
  const gradient = FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
  
  // Specific overrides for known products
  if (name.toLowerCase().includes('lemon')) return { emoji: '🍋', gradient: FALLBACK_GRADIENTS[0] };
  if (name.toLowerCase().includes('mango')) return { emoji: '🥭', gradient: FALLBACK_GRADIENTS[1] };
  if (name.toLowerCase().includes('garlic')) return { emoji: '🧄', gradient: FALLBACK_GRADIENTS[2] };
  
  return { emoji, gradient };
};

const ProductCard: React.FC<ProductCardProps> = ({ product, quantity, onUpdateQuantity }) => {
  const { emoji, gradient } = getDynamicStyles(product.name);

  return (
    <div className="group glass rounded-3xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 animate-fade-up">
      {/* Product Visual */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-8xl group-hover:scale-110 transition-transform duration-500 select-none animate-float">
            {emoji}
          </div>
        )}

        {/* Weight Badge */}
        <div className="absolute top-4 right-4 glass-dark px-3 py-1.5 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
            {product.weight}
          </span>
        </div>

        {/* Stock Badge */}
        {product.stock !== undefined && (
          <div className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            product.stock === 0
              ? 'bg-red-500/20 text-red-400'
              : product.stock <= 10
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {product.stock === 0 ? '⊘ Out of Stock' : product.stock <= 10 ? `⚡ Low Stock (${product.stock})` : `✓ In Stock (${product.stock})`}
          </div>
        )}

        {/* Quantity Badge - appears when > 0 */}
        {quantity > 0 && (
          <div className="absolute top-4 left-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-fade-up">
            <span className="text-white text-xs font-black">{quantity}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-7">
        <h3 className="text-xl font-black text-gray-900 mb-1.5 tracking-tight">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-end justify-between">
          {/* Price */}
          <div>
            <p className="text-[9px] uppercase font-bold text-gray-300 tracking-[0.15em] mb-0.5">Price</p>
            <p className="text-3xl font-black tracking-tighter">
              <span className="text-emerald-600">₹</span>
              <span className="text-gray-900">{product.price}</span>
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-0.5 glass rounded-2xl p-1 shadow-inner shadow-black/5">
            <button
              onClick={() => onUpdateQuantity(product.id, Math.max(0, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>

            <span className="w-8 text-center font-black text-gray-900 tabular-nums select-none">
              {quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
