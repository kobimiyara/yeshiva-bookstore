import React from 'react';

interface FooterProps {
    onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const currentYear = new Date().getFullYear();
  const footerText = `ישיבת שבי חברון © ${currentYear}`;

  return (
    <footer className="mt-8 px-4">
      <div className="flex justify-start">
        <p 
          className="text-sm text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={onAdminClick}
          title="כניסת מנהלים"
        >
          {footerText}
        </p>
      </div>
    </footer>
  );
};
