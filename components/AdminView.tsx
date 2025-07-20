import React from 'react';
import { Order } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface AdminViewProps {
    orders: Order[];
    onExport: () => void;
    onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ orders, onExport, onLogout }) => {
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="p-4 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">ניהול הזמנות</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={onExport}
                        disabled={orders.length === 0}
                        className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        <span>ייצוא ל-CSV</span>
                    </button>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                    >
                         <LogoutIcon className="h-5 w-5" />
                        <span>יציאה</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-full bg-white text-sm">
                    <thead className="bg-gray-100">
                        <tr className="text-right">
                            <th className="py-3 px-4 font-semibold text-gray-600">תאריך</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">שם התלמיד</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">סה"כ</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">אסמכתא</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">אישור תשלום</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">ספרים</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                    <td className="py-3 px-4 font-medium text-gray-800">{order.studentName}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{order.total} ₪</td>
                                    <td className="py-3 px-4 font-mono">{order.paymentReference}</td>
                                    <td className="py-3 px-4">
                                        <a 
                                            href={order.receipt.data} 
                                            download={`קבלה-${order.studentName.replace(/\s+/g, '_')}-${order.receipt.name}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            צפייה/הורדה
                                        </a>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-gray-600">
                                        {order.cart.map(item => item.title).join(', ')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    לא נמצאו הזמנות.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};