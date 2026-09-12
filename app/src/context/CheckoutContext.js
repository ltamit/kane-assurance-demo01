'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import products from '../data/products.json';

const CheckoutContext = createContext(null);

const PROMO_CODES = {
  'SAVE10': { type: 'percent', value: 10 },
  'FLAT5': { type: 'fixed', value: 5 },
  'EXPIRED2024': null,
};

export function CheckoutProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [shippingMethod, setShippingMethod] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [promoCode, setPromoCode] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [failedPayments, setFailedPayments] = useState(0);
  const [paymentLockUntil, setPaymentLockUntil] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Deterministic fixture seeding for test automation: a URL like
      // /cart?seed=p9:1 (or /checkout/shipping?seed=p10:1,p6:2) sets the
      // cart to EXACTLY those items/quantities, overriding localStorage.
      // Format: seed=productId:qty,productId2:qty2 (qty optional, default 1)
      const params = new URLSearchParams(window.location.search);
      const seed = params.get('seed');

      if (seed) {
        const seededCart = seed.split(',').map(pair => {
          const [idPart, qtyPart] = pair.split(':');
          const id = (idPart || '').trim();
          const product = products.find(p => p.id === id);
          if (!product) return null;
          const qty = Math.max(1, Math.min(10, parseInt(qtyPart, 10) || 1));
          return { key: product.id, product, variant: null, qty };
        }).filter(Boolean);

        if (seededCart.length > 0) {
          setCart(seededCart);
          localStorage.setItem('shopeasy_cart', JSON.stringify(seededCart));
        }
      } else {
        const saved = localStorage.getItem('shopeasy_cart');
        if (saved) setCart(JSON.parse(saved));
      }

      const reg = localStorage.getItem('shopeasy_registered');
      if (reg) setIsRegistered(reg === 'true');
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('shopeasy_cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('shopeasy_registered', String(isRegistered));
    }
  }, [isRegistered, mounted]);

  const addToCart = (product, variant = null) => {
    setCart(prev => {
      const key = product.id + (variant ? `-${Object.values(variant).join('-')}` : '');
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: Math.min(i.qty + 1, 10) } : i);
      }
      return [...prev, { key, product, variant, qty: 1 }];
    });
  };

  const updateQty = (key, qty) => {
    const q = Math.max(1, Math.min(10, qty));
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty: q } : i));
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const applyPromo = (code) => {
    const upper = code.toUpperCase().trim();
    const promo = PROMO_CODES[upper];
    if (promo === undefined) {
      setPromoError('This promo code is not valid');
      setPromoCode(null);
      setPromoDiscount(0);
      return false;
    }
    if (promo === null) {
      setPromoError('This promo code is not valid');
      setPromoCode(null);
      setPromoDiscount(0);
      return false;
    }
    setPromoError('');
    setPromoCode(upper);
    if (promo.type === 'percent') {
      setPromoDiscount(subtotal * promo.value / 100);
    } else {
      setPromoDiscount(Math.min(promo.value, subtotal));
    }
    return true;
  };

  const shippingCost = shippingMethod?.cost ?? 0;
  const tax = shippingAddress ? (subtotal - promoDiscount) * 0.0825 : 0;
  const orderTotal = Math.max(0, subtotal - promoDiscount) + tax + shippingCost;
  const hasOutOfStock = cart.some(i => !i.product.inStock);
  const canProceed = cart.length > 0 && !hasOutOfStock;

  return (
    <CheckoutContext.Provider value={{
      cart, addToCart, updateQty, removeFromCart,
      isRegistered, setIsRegistered,
      shippingAddress, setShippingAddress,
      shippingMethod, setShippingMethod,
      paymentMethod, setPaymentMethod,
      promoCode, promoDiscount, promoError, applyPromo,
      failedPayments, setFailedPayments,
      paymentLockUntil, setPaymentLockUntil,
      subtotal, tax, shippingCost, orderTotal,
      hasOutOfStock, canProceed, mounted,
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);
