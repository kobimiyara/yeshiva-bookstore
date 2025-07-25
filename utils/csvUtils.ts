
import { Order, BookSummary } from '../types';

/**
 * Escapes a value for CSV format. If the value contains a comma, quote, or newline,
 * it will be wrapped in double quotes, and existing quotes will be doubled.
 * @param value The value to escape.
 * @returns The escaped string.
 */
const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

const triggerDownload = (filename: string, csvContent: string) => {
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM to support Excel
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Converts an array of order objects to a CSV string and triggers a download.
 * @param filename The desired filename for the downloaded file.
 * @param orders The array of Order objects to export.
 */
export const exportToCsv = (filename: string, orders: Order[]): void => {
    if (orders.length === 0) {
        console.warn("No student orders to export.");
        return;
    }

    const headers = [
        "Order ID",
        "Date",
        "Student Name",
        "Total Amount",
        "Status",
        "Confirmation Code",
        "NedarimPlus Transaction ID",
        "Books (Count)",
        "Book List"
    ];

    const rows = orders.map(order => [
        order._id,
        new Date(order.createdAt).toLocaleString('he-IL'),
        order.studentName,
        order.total,
        order.status,
        order.providerConfirmationCode,
        order.providerTransactionId,
        order.cart.length,
        order.cart.map(item => item.title).join('; ') // Use semicolon to avoid comma issues
    ]);

    const csvContent = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n');
    
    triggerDownload(filename, csvContent);
};


/**
 * Converts an array of book summary objects to a CSV string and triggers a download.
 * @param filename The desired filename for the downloaded file.
 * @param summaryData The array of BookSummary objects to export.
 */
export const exportBookSummaryToCsv = (filename: string, summaryData: BookSummary[]): void => {
    if (summaryData.length === 0) {
        console.warn("No book summary data to export.");
        return;
    }

    const headers = [
        "Book Title",
        "Author",
        "Quantity Ordered",
        "Total Revenue (ILS)"
    ];

    const rows = summaryData.map(summary => [
        summary.title,
        summary.author,
        summary.quantity,
        summary.totalRevenue
    ]);

     const csvContent = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n');
    
    triggerDownload(filename, csvContent);
}