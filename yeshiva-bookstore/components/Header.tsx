
import React from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
            <BookOpenIcon className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">חנות הספרים של הישיבה</h1>
        </div>
        <p className="text-lg text-gray-600">טופס הזמנת ספרי יסוד לתלמידי שיעור א'</p>
    </header>
  );
};
