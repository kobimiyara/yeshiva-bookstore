import React, { useState } from 'react';
import { Order, CartItem } from '../types';
import { TrashIcon, SpinnerIcon } from './icons';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
    onDeleteOrder: (orderId: string) => Promise<void>;
    onDeleteBook: (orderId: string, bookId: number) => Promise<void>;
    apiError: string | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onDeleteOrder, onDeleteBook, apiError }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingBookId, setDeletingBookId] = useState<number | null>(null);

    // Guard Clause: If the order or its _id is missing, we can't do anything.
    if (!order?._id) {
        return null;
    }
    
    // Create a non-nullable constant for the ID. TypeScript now knows this exists for the rest of the render.
    const orderId = order._id;

    const handleDeleteBook = async (bookId: number) => {
        const bookTitle = order.cart.find(b => b.id === bookId)?.title;
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את הספר "${bookTitle}" מהזמנה זו?`)) {
            setDeletingBookId(bookId);
            try {
                // Use the guaranteed 'orderId' constant.
                await onDeleteBook(orderId.toString(), bookId);
            } catch (error) {
                // Error is handled by parent, this just stops the spinner
            } finally {
                setDeletingBookId(null);
            }
        }
    };
    
    const handleDeleteOrder = async () => {
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את כל ההזמנה של ${order.studentName}? פעולה זו אינה הפיכה.`)) {
            setIsDeleting(true);
            try {
                // Use the guaranteed 'orderId' constant.
                await onDeleteOrder(orderId.toString());
                 // On success, the parent will close the modal
            } catch(error) {
                // On failure, stop spinner to allow retry
                setIsDeleting(false);
            }
        }
    };
    
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleString('he-IL', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 sm:px-6 border-b border-gray-200">
                    <h2 id="modal-title" className="text-xl font-bold text-gray-800">פרטי הזמנה - {order.studentName}</h2>
                    {/* Use the guaranteed 'orderId' constant for display */}
                    <p className="text-sm text-gray-500">מזהה: {orderId.toString()} | תאריך: {formatDate(order.createdAt)}</p>
                </header>
                
                <main className="p-4 sm:p-6 overflow-y-auto flex-1">
                    {apiError && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center font-semibold" role="alert">{apiError}</div>}
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">ספרים בהזמנה ({order.cart.length})</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {order.cart.map((item: CartItem) => (
                                <li key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.author}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-800">{item.price} ₪</span>
                                        <button 
                                          onClick={() => handleDeleteBook(item.id)} 
                                          disabled={deletingBookId === item.id}
                                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-wait p-1 rounded-full hover:bg-red-100 transition-colors"
                                          aria-label={`מחק את ${item.title}`}
                                        >
                                          {deletingBookId === item.id ? <SpinnerIcon className="h-5 w-5 animate-spin"/> : <TrashIcon className="h-5 w-5"/>}
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {order.cart.length === 0 && <li className="text-center py-8 text-gray-500">לא נותרו ספרים בהזמנה.</li>}
                        </ul>
                    </div>
                    <div className="flex justify-end text-xl font-bold text-gray-900 mt-4 pr-3">
                      <span>סה"כ מעודכן:</span>
                      <span className="mr-2">{order.total} ₪</span>
                    </div>
                </main>
                
                <footer className="p-4 sm:px-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
                    <button 
                      onClick={onClose} 
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      סגור
                    </button>
                    <button
                        onClick={handleDeleteOrder}
                        disabled={isDeleting}
                        className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-wait transition-colors"
                    >
                        {isDeleting ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : <TrashIcon className="h-5 w-5" />}
                        <span>מחק הזמנה זו</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};
