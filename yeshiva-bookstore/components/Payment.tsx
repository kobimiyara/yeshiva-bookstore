import React, { useState } from 'react';
import { CartItem } from '../types';
import { BANK_DETAILS } from '../constants';
import { BanknotesIcon } from './icons/BanknotesIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TagIcon } from './icons/TagIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';


interface PaymentProps {
  studentName: string;
  cart: CartItem[];
  total: number;
  onConfirm: (paymentDetails: { referenceNumber: string; receipt: File }) => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const Payment: React.FC<PaymentProps> = ({ studentName, cart, total, onConfirm, onBack, isSubmitting, submitError }) => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceipt(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceNumber.trim() && receipt && !isSubmitting) {
      onConfirm({ referenceNumber, receipt });
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">שלב התשלום ואישור</h2>
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ArrowRightIcon className="h-4 w-4" />
          <span>חזור לבחירת ספרים</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side: Instructions and Form */}
        <div className="order-2 lg:order-1">
          <div className="bg-blue-50 border-r-4 border-blue-500 text-blue-800 p-4 rounded-l-lg mb-6">
            <h3 className="font-bold">שלב 1: ביצוע העברה בנקאית</h3>
            <p className="text-sm">נא להעביר את הסכום המדויק של <strong>{total} ₪</strong> לחשבון הבנק הבא:</p>
            <ul className="mt-2 list-disc list-inside text-sm space-y-1">
              <li><strong>שם המוטב:</strong> {BANK_DETAILS.accountName}</li>
              <li><strong>בנק:</strong> {BANK_DETAILS.bankName}</li>
              <li><strong>סניף:</strong> {BANK_DETAILS.branchNumber}</li>
              <li><strong>חשבון:</strong> {BANK_DETAILS.accountNumber}</li>
            </ul>
             <p className="text-sm mt-2"><strong>חשוב:</strong> אנא שמרו את אישור ההעברה, תצטרכו להעלות אותו בשלב הבא.</p>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 text-green-800 p-4 rounded-l-lg">
             <h3 className="font-bold">שלב 2: אישור ההזמנה</h3>
             <p className="text-sm">לאחר ביצוע ההעברה, מלאו את הפרטים הבאים כדי שנשייך את התשלום להזמנה שלכם.</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <fieldset disabled={isSubmitting}>
                <div>
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                    מספר אסמכתא
                  </label>
                  <input
                    type="text"
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="העתיקו את מספר האסמכתא מהבנק"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="receipt-upload" className="block text-sm font-medium text-gray-700">
                    העלאת אישור העברה
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                          <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                              <span>העלה קובץ</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" required />
                          </label>
                          <p className="pr-1">או גרור ושחרר</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF</p>
                      </div>
                  </div>
                  {fileName && <p className="mt-2 text-sm text-green-600">קובץ שנבחר: {fileName}</p>}
                </div>
              </fieldset>
              
              {submitError && (
                <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg text-sm" role="alert">
                  <p className="font-bold">שגיאה</p>
                  <p>{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!referenceNumber.trim() || !receipt || isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isSubmitting ? (
                    <>
                        <SpinnerIcon className="h-5 w-5 animate-spin" />
                        <span>שולח הזמנה...</span>
                    </>
                ) : (
                    <>
                        <TagIcon className="h-5 w-5" />
                        <span>אישור וסיום הזמנה</span>
                    </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="order-1 lg:order-2 bg-gray-50 p-6 rounded-2xl shadow-inner h-fit sticky top-8">
            <div className="flex items-center gap-3 mb-4">
                <BanknotesIcon className="h-7 w-7 text-blue-600"/>
                <h3 className="text-xl font-bold text-gray-800">סיכום לתשלום</h3>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">שם התלמיד:</span>
                <span className="font-semibold">{studentName}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-gray-600">מספר ספרים:</span>
                <span className="font-semibold">{cart.length}</span>
              </div>
            </div>
             <hr className="my-3 border-gray-200" />
             <h4 className="font-semibold mb-2 text-gray-700">ספרים שנבחרו:</h4>
            <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between items-center text-gray-700 text-sm">
                    <span>{item.title}</span>
                    <span className="font-semibold shrink-0">{item.price} ₪</span>
                  </li>
                ))}
            </ul>
            <hr className="my-4 border-gray-200" />
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span>לתשלום:</span>
              <span>{total} ₪</span>
            </div>
        </div>
      </div>
    </div>
  );
};
