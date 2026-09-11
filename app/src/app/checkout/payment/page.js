'use client';
import { useCheckout } from '../../../context/CheckoutContext';
import StepIndicator from '../../../components/StepIndicator';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

function luhn(num) {
  const digits = num.replace(/\D/g, '').split('').reverse().map(Number);
  const sum = digits.reduce((s, d, i) => { if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; } return s + d; }, 0);
  return sum % 10 === 0 && digits.length >= 13;
}

function cardBrand(num) {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return '';
}

const SAVED_CARDS = [
  { brand: 'Visa', last4: '4242', expiry: '12/27' },
  { brand: 'Amex', last4: '1001', expiry: '06/28' },
];

export default function PaymentPage() {
  const { isRegistered, shippingMethod, setPaymentMethod, failedPayments, setFailedPayments, paymentLockUntil, setPaymentLockUntil, mounted } = useCheckout();
  const router = useRouter();
  const [form, setForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [errors, setErrors] = useState({});
  const [payError, setPayError] = useState('');
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    if (!paymentLockUntil) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((paymentLockUntil - Date.now()) / 1000));
      setLockCountdown(remaining);
      if (remaining <= 0) setPaymentLockUntil(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paymentLockUntil, setPaymentLockUntil]);

  if (!mounted) return null;
  if (!shippingMethod) { router.push('/checkout/shipping-method'); return null; }

  const isLocked = paymentLockUntil && Date.now() < paymentLockUntil;
  const brand = cardBrand(form.number);
  const isAmex = brand === 'Amex';

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Cardholder name is required';
    const num = form.number.replace(/\D/g, '');
    if (!num) e.number = 'Card number is required';
    else if (!luhn(form.number)) e.number = 'Invalid card number';
    else if (!brand) e.number = 'We accept Visa, Mastercard, and Amex';
    const [mm, yy] = (form.expiry || '').split('/');
    if (!mm || !yy) e.expiry = 'Expiry is required (MM/YY)';
    else {
      const expDate = new Date(2000 + parseInt(yy), parseInt(mm));
      if (expDate <= new Date()) e.expiry = 'Card is expired';
    }
    const cvvLen = isAmex ? 4 : 3;
    if (!form.cvv) e.cvv = 'CVV is required';
    else if (form.cvv.replace(/\D/g, '').length !== cvvLen) e.cvv = `CVV must be ${cvvLen} digits`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (isLocked) return;
    setPayError('');
    if (!validate()) return;

    if (form.number.replace(/\D/g, '').endsWith('0000')) {
      const attempts = failedPayments + 1;
      setFailedPayments(attempts);
      if (attempts >= 3) {
        setPaymentLockUntil(Date.now() + 15 * 60 * 1000);
        setPayError('Too many failed attempts. Please contact support or try again in 15 minutes.');
      } else {
        setPayError('Payment could not be processed. Please check your details or try another method.');
      }
      return;
    }

    setFailedPayments(0);
    const last4 = form.number.replace(/\D/g, '').slice(-4);
    setPaymentMethod({ type: 'card', brand, last4 });
    router.push('/checkout/review');
  };

  const usePayPal = () => {
    setPaymentMethod({ type: 'PayPal', brand: 'PayPal', last4: '' });
    router.push('/checkout/review');
  };

  const useSavedCard = (card) => {
    setPaymentMethod({ type: 'card', brand: card.brand, last4: card.last4 });
    router.push('/checkout/review');
  };

  return (
    <div>
      <StepIndicator current="Payment" />
      <h1 className="text-xl font-bold mb-4">Payment</h1>

      {isRegistered && (
        <div className="mb-6 max-w-lg">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Saved payment methods</h2>
          {SAVED_CARDS.map((c, i) => (
            <button key={i} onClick={() => useSavedCard(c)}
              className="w-full text-left border rounded-lg p-3 mb-2 hover:border-blue-500 transition min-h-[44px]">
              <span className="font-medium">{c.brand} ending in {c.last4}</span>
              <span className="text-sm text-gray-500 ml-2">Exp {c.expiry}</span>
            </button>
          ))}
          <p className="text-sm text-gray-400 mt-1 mb-4">Or enter a new card below</p>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 max-w-lg space-y-4">
        <div>
          <label htmlFor="card-name" className="block text-sm font-medium mb-1">Cardholder name <span className="text-red-500">*</span></label>
          <input id="card-name" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`} />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="card-number" className="block text-sm font-medium mb-1">
            Card number <span className="text-red-500">*</span>
            {brand && <span className="ml-2 text-blue-600 text-xs font-medium">{brand}</span>}
          </label>
          <input id="card-number" type="text" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
            placeholder="4111 1111 1111 1111" maxLength={19}
            className={`w-full border rounded px-3 py-2 ${errors.number ? 'border-red-500' : ''}`} />
          {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="card-expiry" className="block text-sm font-medium mb-1">Expiry <span className="text-red-500">*</span></label>
            <input id="card-expiry" type="text" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
              placeholder="MM/YY" maxLength={5}
              className={`w-full border rounded px-3 py-2 ${errors.expiry ? 'border-red-500' : ''}`} />
            {errors.expiry && <p className="text-red-600 text-sm mt-1">{errors.expiry}</p>}
          </div>
          <div className="flex-1">
            <label htmlFor="card-cvv" className="block text-sm font-medium mb-1">CVV <span className="text-red-500">*</span></label>
            <input id="card-cvv" type="text" value={form.cvv} onChange={e => setForm(p => ({ ...p, cvv: e.target.value }))}
              placeholder={isAmex ? '1234' : '123'} maxLength={isAmex ? 4 : 3}
              className={`w-full border rounded px-3 py-2 ${errors.cvv ? 'border-red-500' : ''}`} />
            {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
          </div>
        </div>

        {payError && <p className="text-red-600 text-sm bg-red-50 p-3 rounded" role="alert">{payError}</p>}

        {isLocked ? (
          <div className="text-center py-3">
            <p className="text-red-600 font-medium">Payment locked</p>
            <p className="text-sm text-gray-500">Try again in {Math.floor(lockCountdown / 60)}:{String(lockCountdown % 60).padStart(2, '0')}</p>
            <p className="text-sm text-gray-500 mt-1">Contact support: help@shopeasy.example</p>
          </div>
        ) : (
          <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 min-h-[44px]">
            Continue to Review
          </button>
        )}

        <div className="border-t pt-4">
          <button onClick={usePayPal} className="w-full border-2 border-yellow-400 bg-yellow-50 py-3 rounded font-medium hover:bg-yellow-100 min-h-[44px]">
            Pay with PayPal
          </button>
        </div>
      </div>
    </div>
  );
}
