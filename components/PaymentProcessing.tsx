
import React, { useEffect, useRef, useState } from 'react';
import { Order } from '../types';
import { ArrowRightIcon, SpinnerIcon } from './icons';

interface PaymentProcessingProps {
  orderId: string;
  iframeUrl: string;
  onResult: (status: Order['status']) => void;
  onBack: () => void;
}

const POLLING_INTERVAL_MS = 3000; // Poll every 3 seconds
const POLLING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({ orderId, iframeUrl, onResult, onBack }) => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/get-order-status?orderId=${orderId}`);
        if (!response.ok) {
          // Don't stop polling for server errors, just log them
          console.error(`Polling failed with status: ${response.status}`);
          return;
        }

        const data: { status: Order['status'] } = await response.json();
        
        if (data.status !== 'pending') {
          onResult(data.status);
          // Cleanup is handled in the return function
        }
      } catch (error) {
        console.error('Error polling for order status:', error);
      }
    };

    // Start polling immediately and then on an interval
    pollStatus();
    intervalRef.current = window.setInterval(pollStatus, POLLING_INTERVAL_MS);

    // Set a timeout to stop polling after a certain duration
    timeoutRef.current = window.setTimeout(() => {
        setIsTimedOut(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, POLLING_TIMEOUT_MS);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [orderId, onResult]);

  return (
    <div className="p-1 sm:p-2 bg-gray-200">
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">תשלום מאובטח</h2>
          <p className="text-gray-600 mt-1">אנא מלאו את פרטי האשראי בטופס המאובטח.</p>
        </div>
        <button 
          onClick={onBack} 
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
          title="חזור לבחירת הספרים"
        >
          <ArrowRightIcon className="h-4 w-4" />
          <span>חזור לעגלה</span>
        </button>
      </div>
      
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-center gap-3 text-sm">
        {isTimedOut ? (
             <p className="text-yellow-700">לא התקבל אישור על התשלום. ניתן לבדוק עם שירות הלקוחות או לנסות שוב.</p>
        ) : (
            <>
                <SpinnerIcon className="h-5 w-5 animate-spin text-blue-600" />
                <p className="text-gray-700">ממתינים לאישור סופי של התשלום... זה עשוי לקחת מספר רגעים.</p>
            </>
        )}
      </div>

      <iframe
        src={iframeUrl}
        title="Secure Payment Frame"
        className="w-full h-[600px] border-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        aria-label="טופס תשלום מאובטח"
      >
        טוען טופס תשלום...
      </iframe>
    </div>
  );
};