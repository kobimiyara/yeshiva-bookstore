import React from 'react';

interface FooterProps {
    onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="text-center mt-8">
      <p 
        className="text-sm text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={onAdminClick}
        title="כניסת מנהלים"
      >
        ישיבת שבי חברון &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
};