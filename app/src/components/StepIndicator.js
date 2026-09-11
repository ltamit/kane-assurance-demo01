'use client';

const STEPS = ['Shipping', 'Method', 'Payment', 'Review', 'Confirmation'];

export default function StepIndicator({ current }) {
  const idx = STEPS.indexOf(current);
  return (
    <nav className="flex items-center justify-center gap-1 mb-6 text-sm" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <span key={s} className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded ${i === idx ? 'bg-blue-600 text-white font-medium' : i < idx ? 'text-blue-600' : 'text-gray-400'}`}>
            {s}
          </span>
          {i < STEPS.length - 1 && <span className="text-gray-300">→</span>}
        </span>
      ))}
    </nav>
  );
}
