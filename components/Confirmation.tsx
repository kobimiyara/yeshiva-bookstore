
import React from 'react';
import { CheckCircleIcon } from './icons';

interface ConfirmationProps {
  onNewOrder: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ onNewOrder }) => {
  return (
    <div className="p-8 sm:p-16 text-center bg-white">
        <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">ההזמנה הושלמה בהצלחה!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
            תודה רבה! קיבלנו את פרטי ההזמנה והתשלום. הספרים יחכו לתלמיד בישיבה בתחילת השנה.
            ניצור קשר רק במידת הצורך.
        </p>
        <button
            onClick={onNewOrder}
            className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
            ביצוע הזמנה חדשה
        </button>
    </div>
  );
};