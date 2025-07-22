
import React, { useMemo } from 'react';
import { Book, CartItem } from '../types';
import { BOOKS } from '../constants';
import { ShoppingCartIcon, TagIcon, CheckCircleIcon, ArrowRightIcon, SpinnerIcon } from './icons';

interface BookSelectorProps {
  studentName: string;
  cart: CartItem[];
  total: number;
  onAddToCart: (bookId: number) => void;
  onProceed: () => void;
  onBack: () => void;
  isProcessing: boolean;
  error: string | null;
}

// A more accessible BookCard component using a <button> element.
const BookCard: React.FC<{ book: Book; isSelected: boolean; onSelect: (id: number) => void }> = ({ book, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(book.id)}
        aria-pressed={isSelected}
        className={`relative p-4 border rounded-xl text-right transition-all duration-200 h-full flex flex-col justify-between w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-400'
        }`}
    >
        {isSelected && (
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full p-1 pointer-events-none">
                <CheckCircleIcon className="h-5 w-5" />
            </div>
        )}
        <div>
            <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{book.author}</p>
        </div>
        <p className="text-xl font-bold text-blue-600 mt-2">{book.price} ₪</p>
    </button>
);

// Define types for our processed display list
type DisplayItem = Book | {
    isGroup: true;
    groupId: string;
    title: string;
    books: Book[];
};

export const BookSelector: React.FC<BookSelectorProps> = ({ studentName, cart, total, onAddToCart, onProceed, onBack, isProcessing, error }) => {
  const isBookInCart = (bookId: number) => cart.some(item => item.id === bookId);
  
  // Memoize the processed list of books and groups for rendering.
  // This makes the rendering logic much cleaner.
  const displayItems = useMemo((): DisplayItem[] => {
    const items: DisplayItem[] = [];
    const processedGroupIds = new Set<string>();

    BOOKS.forEach(book => {
      if (book.groupId) {
        // If the book is part of a group and we haven't processed this group yet...
        if (!processedGroupIds.has(book.groupId)) {
          processedGroupIds.add(book.groupId);
          const groupBooks = BOOKS.filter(b => b.groupId === book.groupId);
          // Create a dynamic title for the group
          const groupName = groupBooks[0]?.title.split('-')[0].trim() || 'קבוצת ספרים';
          
          items.push({
            isGroup: true,
            groupId: book.groupId,
            title: `${groupName} (יש לבחור מהדורה אחת)`,
            books: groupBooks,
          });
        }
      } else {
        // It's a regular, non-grouped book
        items.push(book);
      }
    });
    return items;
  }, []); // This runs only once since BOOKS is a constant.

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">שלום, {studentName}!</h2>
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1" title="התחל הזמנה חדשה">
           <ArrowRightIcon className="h-4 w-4" />
           <span>החלף שם</span>
        </button>
      </div>
      <p className="text-gray-600 mb-2">בחר את ספרי היסוד המומלצים עבורך. ניתן לבחור את כל הספרים או חלק מהם.</p>

      <div className="mb-6 p-3 bg-blue-50 border-r-4 border-blue-500 rounded-md text-sm">
        <p className="text-blue-800">
            <strong>שימו לב:</strong> משנ"ב, תנ"ך וספרים נוספים שתרצו לקנות ימכרו בא' אלול בישיבה.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Book List */}
        <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayItems.map(item => {
                // Type guard to differentiate between a group and a single book
                if ('isGroup' in item) {
                  return (
                    <div key={`group-${item.groupId}`} className="sm:col-span-2 lg:col-span-3 p-4 border border-gray-300 rounded-xl bg-gray-50/50">
                      <h4 className="font-bold text-gray-700 mb-3">{item.title}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.books.map(groupBook => (
                          <BookCard key={groupBook.id} book={groupBook} isSelected={isBookInCart(groupBook.id)} onSelect={onAddToCart} />
                        ))}
                      </div>
                    </div>
                  );
                }
                
                // Render single, non-grouped book
                return <BookCard key={item.id} book={item} isSelected={isBookInCart(item.id)} onSelect={onAddToCart} />;
              })}
            </div>
        </div>

        {/* Cart Summary */}
        <div className="md:col-span-4">
          <div className="sticky top-8 bg-gray-50 p-6 rounded-2xl shadow-inner">
            <div className="flex items-center gap-3 mb-4">
                <ShoppingCartIcon className="h-7 w-7 text-blue-600"/>
                <h3 className="text-xl font-bold text-gray-800">סיכום הזמנה</h3>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">העגלה שלך ריקה.</p>
            ) : (
              <ul className="space-y-3 mb-4">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between items-center text-gray-700">
                    <span className="flex-1 truncate pr-2">{item.title}</span>
                    <span className="font-semibold whitespace-nowrap">{item.price} ₪</span>
                  </li>
                ))}
              </ul>
            )}
            
            <hr className="my-4 border-gray-200" />
            
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span>סה"כ:</span>
              <span>{total} ₪</span>
            </div>
            
            {error && (
                <div className="mt-4 bg-red-100 border-r-4 border-red-500 text-red-700 p-3 rounded-lg text-sm" role="alert" aria-live="polite">
                  <p className="font-bold">שגיאה</p>
                  <p>{error}</p>
                </div>
            )}

            <button
              onClick={onProceed}
              disabled={cart.length === 0 || isProcessing}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {isProcessing ? (
                <>
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                  <span>מעבד...</span>
                </>
              ) : (
                <>
                  <TagIcon className="h-5 w-5"/>
                  <span>המשך לתשלום</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
