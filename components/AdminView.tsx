
import React, { useState, useMemo } from 'react';
import { Order, BookSummary, CartItem } from '../types';
import { LogoutIcon, DownloadIcon, UserGroupIcon, ClipboardListIcon, SearchIcon } from './icons';
import { exportToCsv, exportBookSummaryToCsv } from '../utils/csvUtils';

interface AdminViewProps {
    orders: Order[];
    onLogout: () => void;
}

type AdminActiveView = 'byStudent' | 'byBook';
type StatusFilter = 'all' | Order['status'];

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
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const StatCard: React.FC<{ title: string; value: string | number; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className={`p-4 rounded-lg shadow-sm flex-1 ${colorClass}`}>
        <p className="text-sm font-medium text-gray-800 opacity-90">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

export const AdminView: React.FC<AdminViewProps> = ({ orders, onLogout }) => {
    const [activeView, setActiveView] = useState<AdminActiveView>('byStudent');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    
    const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed'), [orders]);

    const dashboardMetrics = useMemo(() => {
        return {
            totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
            completedCount: completedOrders.length,
            pendingCount: orders.filter(o => o.status === 'pending').length,
            failedCount: orders.filter(o => o.status === 'failed').length,
        };
    }, [orders, completedOrders]);

    const bookSummary = useMemo<BookSummary[]>(() => {
        const summaryMap = new Map<number, BookSummary>();
        for (const order of completedOrders) {
            for (const item of order.cart) {
                const existing = summaryMap.get(item.id);
                if (existing) {
                    existing.quantity += item.quantity;
                    existing.totalRevenue += item.price * item.quantity;
                } else {
                    summaryMap.set(item.id, {
                        id: item.id,
                        title: item.title,
                        author: item.author,
                        quantity: item.quantity,
                        totalRevenue: item.price * item.quantity,
                    });
                }
            }
        }
        return Array.from(summaryMap.values()).sort((a, b) => b.quantity - a.quantity);
    }, [completedOrders]);

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => statusFilter === 'all' || order.status === statusFilter)
            .filter(order => order.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [orders, statusFilter, searchTerm]);

    const handleExport = () => {
        if (activeView === 'byBook') {
            exportBookSummaryToCsv('book_summary.csv', bookSummary);
        } else {
            exportToCsv("filtered_orders.csv", filteredOrders);
        }
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('he-IL', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">ניהול הזמנות</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} disabled={orders.length === 0} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                        <DownloadIcon className="h-5 w-5" />
                        <span>ייצוא</span>
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        <LogoutIcon className="h-5 w-5" />
                        <span>יציאה</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="סך הכנסות" value={`${dashboardMetrics.totalRevenue.toLocaleString()} ₪`} colorClass="bg-green-100" />
                <StatCard title="הזמנות שהושלמו" value={dashboardMetrics.completedCount} colorClass="bg-blue-100" />
                <StatCard title="הזמנות ממתינות" value={dashboardMetrics.pendingCount} colorClass="bg-yellow-100" />
                <StatCard title="הזמנות שנכשלו" value={dashboardMetrics.failedCount} colorClass="bg-red-100" />
            </div>

            <div className="mb-4 flex gap-2 p-1.5 bg-gray-200 rounded-lg">
                <TabButton icon={<UserGroupIcon className="h-5 w-5" />} label="לפי תלמיד" isActive={activeView === 'byStudent'} onClick={() => setActiveView('byStudent')} />
                <TabButton icon={<ClipboardListIcon className="h-5 w-5" />} label="לפי ספר" isActive={activeView === 'byBook'} onClick={() => setActiveView('byBook')} />
            </div>
            
            {activeView === 'byStudent' && (
                 <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                         <SearchIcon className="h-5 w-5 text-gray-400" />
                       </div>
                       <input 
                         type="text"
                         placeholder="חיפוש לפי שם תלמיד..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        {(['all', 'completed', 'pending', 'failed'] as StatusFilter[]).map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
                                { {all: 'הכל', completed: 'הושלמו', pending: 'ממתינות', failed: 'נכשלו'}[status] }
                            </button>
                        ))}
                    </div>
                 </div>
            )}
            
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                {activeView === 'byStudent' ? (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100"><tr className="text-right">
                            <th className="p-3 font-semibold text-gray-600">תאריך</th>
                            <th className="p-3 font-semibold text-gray-600">שם התלמיד</th>
                            <th className="p-3 font-semibold text-gray-600">סה"כ</th>
                            <th className="p-3 font-semibold text-gray-600">סטטוס</th>
                            <th className="p-3 font-semibold text-gray-600">ספרים</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="p-3 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                        <td className="p-3 font-bold text-gray-900 truncate" title={order.studentName}>{order.studentName}</td>
                                        <td className="p-3 whitespace-nowrap">{order.total} ₪</td>
                                        <td className="p-3"><StatusBadge status={order.status} /></td>
                                        <td className="p-3 text-xs text-gray-600">
                                            <div className="truncate" title={order.cart.map(item => item.title).join(', ')}>
                                                {order.cart.map(item => item.title).join(', ')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-500">לא נמצאו הזמנות התואמות לחיפוש.</td></tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100"><tr className="text-right">
                            <th className="p-3 font-semibold text-gray-600">שם הספר</th>
                            <th className="p-3 font-semibold text-gray-600">כמות</th>
                            <th className="p-3 font-semibold text-gray-600">הכנסות</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookSummary.length > 0 ? (
                                bookSummary.map(summary => (
                                    <tr key={summary.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-bold text-gray-900">{summary.title} <span className="text-gray-500 font-normal">({summary.author})</span></td>
                                        <td className="p-3 font-semibold text-blue-600">{summary.quantity}</td>
                                        <td className="p-3 font-semibold">{summary.totalRevenue.toLocaleString()} ₪</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="text-center py-12 text-gray-500">לא נמצאו הזמנות שהושלמו כדי להציג סיכום.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};