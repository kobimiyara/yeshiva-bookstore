
import React from 'react';
import { ExclamationTriangleIcon, ArrowRightIcon } from './icons';

interface PaymentFailureProps {
  onTryAgain: () => void;
}

export const PaymentFailure: React.FC<PaymentFailureProps> = ({ onTryAgain }) => {
  return (
    <div className="p-8 sm:p-16 text-center bg-white">
        <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">התשלום נכשל או בוטל</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
            נראה שהייתה בעיה באישור התשלום, או שהתהליך בוטל. לא בוצע כל חיוב.
            ניתן לחזור לסל הקניות ולנסות שוב.
        </p>
        <button
            onClick={onTryAgain}
            className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
        >
            <ArrowRightIcon className="h-5 w-5" />
            <span>חזרה לבחירת ספרים</span>
        </button>
    </div>
  );
};