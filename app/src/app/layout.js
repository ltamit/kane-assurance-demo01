'use client';
import './globals.css';
import { CheckoutProvider, useCheckout } from '../context/CheckoutContext';
import Link from 'next/link';

function Header() {
  const { cart, isRegistered, setIsRegistered, mounted } = useCheckout();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link href="/" className="text-xl font-bold text-blue-600">ShopEasy</Link>
      <div className="flex items-center gap-4">
        {mounted && (
          <label className="flex items-center gap-2 text-sm cursor-pointer" aria-label="Toggle user type">
            <span className="text-gray-500">Guest</span>
            <input type="checkbox" checked={isRegistered} onChange={e => setIsRegistered(e.target.checked)}
              className="sr-only peer" />
            <div className="relative w-10 h-5 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition-colors">
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isRegistered ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-gray-500">Registered</span>
          </label>
        )}
        <Link href="/cart" className="relative p-2" aria-label={`Cart with ${count} items`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {mounted && count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <CheckoutProvider>
          <Header />
          <main className="max-w-4xl mx-auto p-4">{children}</main>
        </CheckoutProvider>
      </body>
    </html>
  );
}
