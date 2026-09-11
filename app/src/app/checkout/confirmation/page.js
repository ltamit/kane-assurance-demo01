'use client';
import StepIndicator from '../../../components/StepIndicator';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ConfirmationPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('shopeasy_order');
      if (data) setOrder(JSON.parse(data));
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No order found.</p>
        <Link href="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current="Confirmation" />
      <div className="text-center py-8 max-w-md mx-auto">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
        <p className="text-gray-600 mb-6">Thank you for your order!</p>

        <div className="bg-white border rounded-lg p-6 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Order number</span>
            <span className="font-mono font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated delivery</span>
            <span>{order.delivery}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total charged</span>
            <span className="font-bold">${order.total?.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">Confirmation email sent to your registered email address.</p>

        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => window.print()}
            className="border rounded px-4 py-2 text-sm hover:bg-gray-50 min-h-[44px]">
            Print Receipt
          </button>
          <Link href="/"
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 min-h-[44px] flex items-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
