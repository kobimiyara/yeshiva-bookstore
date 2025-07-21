
import React, { useState } from 'react';
import { KeyIcon, SpinnerIcon, ArrowRightIcon } from './icons';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isSubmitting, error, onBack }) => {
  const [password, setPassword] = useState('');
  const errorId = 'password-error';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onLogin(password);
    }
  };

  return (
    <div className="p-8 sm:p-12 text-center bg-white">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">כניסת מנהלים</h2>
         <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
           <ArrowRightIcon className="h-4 w-4" />
           <span>חזרה לאתר</span>
        </button>
      </div>
      <p className="text-gray-600 mb-8">אנא הזן את סיסמת המנהל כדי לצפות בהזמנות.</p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <KeyIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        
        {error && (
            <div id={errorId} className="mt-4 bg-red-100 border-r-4 border-red-500 text-red-800 p-3 rounded-lg text-sm text-right" role="alert" aria-live="polite">
                <p>{error}</p>
            </div>
        )}

        <button
          type="submit"
          disabled={!password || isSubmitting}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon className="h-5 w-5 animate-spin" />
              <span>מאמת...</span>
            </>
          ) : (
            <span>כניסה</span>
          )}
        </button>
      </form>
    </div>
  );
};