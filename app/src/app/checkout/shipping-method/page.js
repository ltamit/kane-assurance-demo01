'use client';
import { useCheckout } from '../../../context/CheckoutContext';
import StepIndicator from '../../../components/StepIndicator';
import { useRouter } from 'next/navigation';

function getDeliveryDate(days) {
  const d = new Date();
  let added = 0;
  while (added < days) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) added++; }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isNextDayAvailable() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return est.getHours() < 14;
}

function getNextDayDelivery() {
  const now = new Date();
  const day = now.getDay();
  if (day === 5) return getDeliveryDate(1);
  return getDeliveryDate(1);
}

export default function ShippingMethodPage() {
  const { shippingAddress, subtotal, shippingMethod, setShippingMethod, mounted } = useCheckout();
  const router = useRouter();

  if (!mounted) return null;
  if (!shippingAddress) { router.push('/checkout/shipping'); return null; }

  const country = shippingAddress.country;
  const methods = [];

  if (subtotal > 75) methods.push({ id: 'free', name: 'Free Standard', window: '5–7 business days', cost: 0, delivery: getDeliveryDate(7) });
  methods.push({ id: 'standard', name: 'Standard', window: '5–7 business days', cost: 5.99, delivery: getDeliveryDate(7) });
  if (['United States', 'Canada', 'United Kingdom'].includes(country)) methods.push({ id: 'express', name: 'Express', window: '2–3 business days', cost: 14.99, delivery: getDeliveryDate(3) });
  if (country === 'United States' && isNextDayAvailable()) methods.push({ id: 'nextday', name: 'Next-Day', window: '1 business day', cost: 24.99, delivery: getNextDayDelivery() });

  const selected = shippingMethod || (methods.length === 1 ? methods[0] : null);

  return (
    <div>
      <StepIndicator current="Method" />
      <h1 className="text-xl font-bold mb-4">Shipping Method</h1>
      <div className="space-y-3 max-w-lg">
        {methods.map(m => (
          <button key={m.id} onClick={() => setShippingMethod(m)}
            className={`w-full text-left border rounded-lg p-4 transition min-h-[44px] ${selected?.id === m.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-gray-500">{m.window} — est. {m.delivery}</p>
              </div>
              <span className="font-bold">{m.cost === 0 ? 'FREE' : `$${m.cost.toFixed(2)}`}</span>
            </div>
          </button>
        ))}
        <button onClick={() => selected && router.push('/checkout/payment')}
          disabled={!selected}
          className={`w-full py-3 rounded font-medium text-white min-h-[44px] ${selected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}>
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
