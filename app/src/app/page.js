'use client';
import products from '../data/products.json';
import { useCheckout } from '../context/CheckoutContext';
import { useState } from 'react';

export default function HomePage() {
  const { addToCart } = useCheckout();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const firstVariantKey = product.variants ? Object.keys(product.variants)[0] : null;
  const [selectedVariant, setSelectedVariant] = useState(
    firstVariantKey ? { [firstVariantKey]: product.variants[firstVariantKey][0] } : null
  );

  return (
    <div className="bg-white rounded-lg border p-3 flex flex-col">
      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded mb-2" loading="lazy" />
      <h2 className="font-medium text-sm">{product.name}</h2>
      <p className="text-blue-600 font-bold mt-1">${product.price.toFixed(2)}</p>

      {product.variants && Object.entries(product.variants).map(([key, options]) => (
        <select key={key} value={selectedVariant?.[key] || options[0]}
          onChange={e => setSelectedVariant(prev => ({ ...prev, [key]: e.target.value }))}
          className="mt-2 text-sm border rounded px-2 py-1"
          aria-label={`Select ${key}`}>
          {options.map(o => <option key={o} value={o}>{key}: {o}</option>)}
        </select>
      ))}

      {!product.inStock ? (
        <span className="mt-2 bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded text-center">Out of Stock</span>
      ) : (
        <button onClick={() => onAdd(product, selectedVariant)}
          className="mt-2 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition min-h-[44px]">
          Add to Cart
        </button>
      )}
    </div>
  );
}
