'use client';
import { useCheckout } from '../../../context/CheckoutContext';
import StepIndicator from '../../../components/StepIndicator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function ReviewPage() {
  const ctx = useCheckout();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  if (!ctx.mounted) return null;
  if (!ctx.paymentMethod) { router.push('/checkout/payment'); return null; }

  const placeOrder = () => {
    if (placing) return;
    setPlacing(true);
    setError('');

    setTimeout(() => {
      const failItem = ctx.cart.find(i => i.product.failAtPlacement);
      if (failItem && Math.random() > 0.5) {
        setError(`${failItem.product.name} is no longer available. Remove it and retry, or return to cart.`);
        setPlacing(false);
        return;
      }
      const orderNum = 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      sessionStorage.setItem('shopeasy_order', JSON.stringify({
        orderNumber: orderNum,
        delivery: ctx.shippingMethod?.delivery,
        total: ctx.orderTotal,
      }));
      router.push('/checkout/confirmation');
    }, 1500);
  };

  return (
    <div>
      <StepIndicator current="Review" />
      <h1 className="text-xl font-bold mb-4">Order Review</h1>
      <div className="max-w-lg space-y-4">
        <Section title="Items" editHref="/cart">
          {ctx.cart.map(i => (
            <div key={i.key} className="flex justify-between text-sm py-1">
              <span>{i.product.name} × {i.qty}</span>
              <span>${(i.product.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
        </Section>

        <Section title="Shipping address" editHref="/checkout/shipping">
          <p className="text-sm">{ctx.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-600">{ctx.shippingAddress?.line1}, {ctx.shippingAddress?.city}, {ctx.shippingAddress?.state} {ctx.shippingAddress?.postal}</p>
          <p className="text-sm text-gray-600">{ctx.shippingAddress?.country}</p>
        </Section>

        <Section title="Shipping method" editHref="/checkout/shipping-method">
          <p className="text-sm">{ctx.shippingMethod?.name} — {ctx.shippingMethod?.cost === 0 ? 'FREE' : `$${ctx.shippingMethod?.cost.toFixed(2)}`}</p>
          <p className="text-sm text-gray-500">Est. delivery: {ctx.shippingMethod?.delivery}</p>
        </Section>

        <Section title="Payment" editHref="/checkout/payment">
          <p className="text-sm">{ctx.paymentMethod?.brand} {ctx.paymentMethod?.last4 ? `ending in ${ctx.paymentMethod.last4}` : ''}</p>
        </Section>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>${ctx.subtotal.toFixed(2)}</span></div>
          {ctx.promoCode && <div className="flex justify-between text-sm text-green-600"><span>Promo ({ctx.promoCode})</span><span>-${ctx.promoDiscount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-sm"><span>Tax</span><span>${ctx.tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{ctx.shippingCost === 0 ? 'FREE' : `$${ctx.shippingCost.toFixed(2)}`}</span></div>
          <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Order Total</span><span>${ctx.orderTotal.toFixed(2)}</span></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
            <p className="text-red-600 text-sm">{error}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { const fi = ctx.cart.find(i => i.product.failAtPlacement); if (fi) ctx.removeFromCart(fi.key); setError(''); }}
                className="text-sm text-blue-600 hover:underline">Remove and retry</button>
              <Link href="/cart" className="text-sm text-blue-600 hover:underline">Return to cart</Link>
            </div>
          </div>
        )}

        <button onClick={placeOrder} disabled={placing}
          className={`w-full py-3 rounded font-medium text-white min-h-[44px] ${placing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
          {placing ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, editHref, children }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium">{title}</h2>
        <Link href={editHref} className="text-blue-600 text-sm hover:underline min-w-[44px] min-h-[44px] flex items-center justify-center">Edit</Link>
      </div>
      {children}
    </div>
  );
}
