
import React, { useState, useMemo } from 'react';
import { Order, BookSummary } from '../types';
import { LogoutIcon, DownloadIcon, UserGroupIcon, ClipboardListIcon } from './icons';
import { exportToCsv, exportBookSummaryToCsv } from '../utils/csvUtils';

interface AdminViewProps {
    orders: Order[];
    onLogout: () => void;
}

type AdminActiveView = 'byStudent' | 'byBook';

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case 'completed':
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>הושלם</span>;
        case 'failed':
            return <span className={`${baseClasses} bg-red-100 text-red-800`}>נכשל</span>;
        case 'pending':
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>ממתין</span>;
        default:
            return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
};

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


export const AdminView: React.FC<AdminViewProps> = ({ orders, onLogout }) => {
    const [activeView, setActiveView] = useState<AdminActiveView>('byStudent');

    const bookSummary = useMemo<BookSummary[]>(() => {
        const summaryMap = new Map<number, BookSummary>();
        
        // Only include orders that have been successfully completed
        const completedOrders = orders.filter(order => order.status === 'completed');

        for (const order of completedOrders) {
            for (const item of order.cart) {
                if (summaryMap.has(item.id)) {
                    const existing = summaryMap.get(item.id)!;
                    existing.quantity += item.quantity;
                    existing.totalRevenue += item.price;
                } else {
                    summaryMap.set(item.id, {
                        id: item.id,
                        title: item.title,
                        author: item.author,
                        quantity: item.quantity,
                        totalRevenue: item.price,
                    });
                }
            }
        }
        return Array.from(summaryMap.values()).sort((a, b) => b.quantity - a.quantity);
    }, [orders]);

    const handleExport = () => {
        if (activeView === 'byBook') {
            exportBookSummaryToCsv('book_summary.csv', bookSummary);
        } else {
            exportToCsv("orders_by_student.csv", orders);
        }
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-4 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">ניהול הזמנות</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExport}
                        disabled={(activeView === 'byStudent' && orders.length === 0) || (activeView === 'byBook' && bookSummary.length === 0)}
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

            {/* View Toggler */}
            <div className="mb-6 flex gap-2 p-1 bg-gray-100 rounded-lg">
                <TabButton
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    label="הזמנות לפי תלמיד"
                    isActive={activeView === 'byStudent'}
                    onClick={() => setActiveView('byStudent')}
                />
                <TabButton
                    icon={<ClipboardListIcon className="h-5 w-5" />}
                    label="סיכום לפי ספר"
                    isActive={activeView === 'byBook'}
                    onClick={() => setActiveView('byBook')}
                />
            </div>
            
            {/* Conditional Content */}
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                {activeView === 'byStudent' ? (
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100">
                            <tr className="text-right">
                                <th className="p-3 font-semibold text-gray-600 w-40">תאריך</th>
                                <th className="p-3 font-semibold text-gray-600 w-48">שם התלמיד</th>
                                <th className="p-3 font-semibold text-gray-600 w-24">סה"כ</th>
                                <th className="p-3 font-semibold text-gray-600 w-28">סטטוס</th>
                                <th className="p-3 font-semibold text-gray-600 w-32">קוד אישור</th>
                                <th className="p-3 font-semibold text-gray-600">ספרים</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.length > 0 ? (
                                orders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="p-3 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                        <td className="p-3 font-bold text-gray-900 truncate" title={order.studentName}>{order.studentName}</td>
                                        <td className="p-3 whitespace-nowrap">{order.total} ₪</td>
                                        <td className="p-3"><StatusBadge status={order.status} /></td>
                                        <td className="p-3 font-mono">{order.providerConfirmationCode || '-'}</td>
                                        <td className="p-3 text-xs text-gray-600">
                                            <div className="truncate" title={order.cart.map(item => item.title).join(', ')}>
                                                {order.cart.map(item => item.title).join(', ')}
                                            </div>
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
                ) : (
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100">
                            <tr className="text-right">
                                <th className="p-3 font-semibold text-gray-600">שם הספר</th>
                                <th className="p-3 font-semibold text-gray-600 w-48">מחבר</th>
                                <th className="p-3 font-semibold text-gray-600 w-40">כמות שהוזמנה</th>
                                <th className="p-3 font-semibold text-gray-600 w-48">סך הכל הכנסות (מהזמנות שהושלמו)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookSummary.length > 0 ? (
                                bookSummary.map(summary => (
                                    <tr key={summary.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-bold text-gray-900">{summary.title}</td>
                                        <td className="p-3 text-gray-700">{summary.author}</td>
                                        <td className="p-3 font-semibold text-blue-600">{summary.quantity}</td>
                                        <td className="p-3 font-semibold">{summary.totalRevenue.toLocaleString()} ₪</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-500">
                                        לא נמצאו הזמנות שהושלמו כדי להציג סיכום.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
