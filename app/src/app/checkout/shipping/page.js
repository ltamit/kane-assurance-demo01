'use client';
import { useCheckout } from '../../../context/CheckoutContext';
import StepIndicator from '../../../components/StepIndicator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'];
const POSTAL_PATTERNS = {
  'United States': /^\d{5}$/,
  'Canada': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
  'United Kingdom': /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  'Germany': /^\d{5}$/,
  'France': /^\d{5}$/,
  'Australia': /^\d{4}$/,
};

const SAVED_ADDRESSES = [
  { fullName: 'John Doe', line1: '123 Main St', city: 'New York', state: 'NY', postal: '10001', country: 'United States' },
  { fullName: 'John Doe', line1: '456 Oak Ave', city: 'Toronto', state: 'ON', postal: 'M5V 2T6', country: 'Canada' },
];

export default function ShippingPage() {
  const { isRegistered, setShippingAddress, mounted } = useCheckout();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', line1: '', line2: '', city: '', state: '', postal: '', country: 'United States', phone: '' });
  const [errors, setErrors] = useState({});

  if (!mounted) return null;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.line1.trim()) e.line1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State/Province is required';
    if (!form.postal.trim()) e.postal = 'Postal code is required';
    else if (!POSTAL_PATTERNS[form.country]?.test(form.postal.trim())) e.postal = 'Invalid postal code for ' + form.country;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (validate()) {
      setShippingAddress(form);
      router.push('/checkout/shipping-method');
    }
  };

  const useSaved = (addr) => {
    setForm({ ...addr, line2: '', phone: '' });
    setShippingAddress({ ...addr, line2: '', phone: '' });
    router.push('/checkout/shipping-method');
  };

  return (
    <div>
      <StepIndicator current="Shipping" />
      <h1 className="text-xl font-bold mb-4">Shipping Address</h1>

      {isRegistered && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Saved addresses</h2>
          <div className="grid gap-2">
            {SAVED_ADDRESSES.map((a, i) => (
              <button key={i} onClick={() => useSaved(a)}
                className="text-left border rounded-lg p-3 hover:border-blue-500 transition min-h-[44px]">
                <p className="font-medium">{a.fullName}</p>
                <p className="text-sm text-gray-500">{a.line1}, {a.city}, {a.state} {a.postal}, {a.country}</p>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-2 mb-4">Or add a new address below</p>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 space-y-4 max-w-lg">
        {[
          { id: 'fullName', label: 'Full name', required: true },
          { id: 'line1', label: 'Street address', required: true },
          { id: 'line2', label: 'Street address line 2', required: false },
          { id: 'city', label: 'City', required: true },
          { id: 'state', label: 'State / Province', required: true },
          { id: 'postal', label: 'Postal code', required: true },
          { id: 'phone', label: 'Phone number', required: false },
        ].map(f => (
          <div key={f.id}>
            <label htmlFor={f.id} className="block text-sm font-medium mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            <input id={f.id} type="text" value={form[f.id]}
              onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
              className={`w-full border rounded px-3 py-2 ${errors[f.id] ? 'border-red-500' : ''}`} />
            {errors[f.id] && <p className="text-red-600 text-sm mt-1">{errors[f.id]}</p>}
          </div>
        ))}

        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">Country <span className="text-red-500">*</span></label>
          <select id="country" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
            className="w-full border rounded px-3 py-2">
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 min-h-[44px]">
          Continue to Shipping Method
        </button>
      </div>
    </div>
  );
}
