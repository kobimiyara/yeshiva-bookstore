
import React, { useState } from 'react';
import { UserIcon } from './icons/UserIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface WelcomeProps {
  onNameSubmit: (name: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name);
    }
  };

  return (
    <div className="p-8 sm:p-12 text-center bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">שלום וברוכים הבאים!</h2>
      <p className="text-gray-600 mb-8">כדי להתחיל, אנא הזינו את שם התלמיד המלא.</p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמא: ישראל ישראלי"
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          <span>המשך לבחירת ספרים</span>
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};
