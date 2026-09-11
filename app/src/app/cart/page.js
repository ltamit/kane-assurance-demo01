'use client';
import { useCheckout } from '../../context/CheckoutContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, subtotal, promoCode, promoDiscount, promoError, applyPromo, canProceed, hasOutOfStock, mounted } = useCheckout();
  const [code, setCode] = useState('');
  const router = useRouter();

  if (!mounted) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Cart</h1>
        {cart.map(item => (
          <div key={item.key} className="flex items-center gap-4 bg-white border rounded-lg p-3 mb-3">
            <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              {item.variant && <p className="text-sm text-gray-500">{Object.entries(item.variant).map(([k,v]) => `${k}: ${v}`).join(', ')}</p>}
              <p className="text-blue-600 font-bold">${item.product.price.toFixed(2)}</p>
              {!item.product.inStock && <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">Out of Stock</span>}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={`qty-${item.key}`} className="sr-only">Quantity for {item.product.name}</label>
              <input id={`qty-${item.key}`} type="number" min={1} max={10} value={item.qty}
                onChange={e => updateQty(item.key, parseInt(e.target.value) || 1)}
                className="w-16 border rounded px-2 py-1 text-center" aria-label={`Quantity for ${item.product.name}`} />
              <p className="font-medium w-20 text-right">${(item.product.price * item.qty).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.key)} className="text-red-500 hover:text-red-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Remove ${item.product.name}`}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full md:w-72">
        <div className="bg-white border rounded-lg p-4 sticky top-20">
          <h2 className="font-bold mb-3">Order Summary</h2>
          <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Tax</span><span className="text-gray-400">TBD</span></div>
          <div className="flex justify-between text-sm mb-3"><span>Shipping</span><span className="text-gray-400">TBD</span></div>

          {promoCode && (
            <div className="flex justify-between text-sm mb-3 text-green-600">
              <span>Promo ({promoCode})</span><span>-${promoDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <label htmlFor="promo-input" className="sr-only">Promo code</label>
            <input id="promo-input" type="text" placeholder="Promo code" value={code} onChange={e => setCode(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm" />
            <button onClick={() => applyPromo(code)} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 min-h-[44px]">Apply</button>
          </div>
          {promoError && <p className="text-red-600 text-sm mb-2">{promoError}</p>}

          <div className="flex justify-between font-bold border-t pt-3">
            <span>Total</span><span>${(subtotal - promoDiscount).toFixed(2)}</span>
          </div>

          {hasOutOfStock && <p className="text-red-600 text-sm mt-2">Remove out-of-stock items to proceed</p>}

          <button onClick={() => canProceed && router.push('/checkout/shipping')}
            disabled={!canProceed}
            className={`w-full mt-4 py-3 rounded font-medium text-white min-h-[44px] transition ${canProceed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
