
import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import Modal from '../Modal';
import OrderInvoice from '../OrderInvoice';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminOrderRowProps {
    order: Order;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    onEdit: (order: Order) => void;
    onViewReview: (order: Order) => void;
    onViewDetails: (order: Order) => void;
    approveOrderPayment: (orderId: string) => void;
}

const AdminOrderRow: React.FC<AdminOrderRowProps> = ({ order, updateOrderStatus, approveOrderPayment, onEdit, onViewReview, onViewDetails }) => {
    const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

    const statusOptions: OrderStatus[] = ['Pending', 'Approved', 'Packed', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'];

    const statusColor = {
        Pending: 'bg-yellow-200 text-yellow-800',
        Approved: 'bg-blue-200 text-blue-800',
        Packed: 'bg-indigo-200 text-indigo-800',
        'Out for Delivery': 'bg-purple-200 text-purple-800',
        Delivered: 'bg-green-200 text-green-800',
        Rejected: 'bg-red-200 text-red-800',
        Cancelled: 'bg-gray-300 text-gray-800',
    };

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const handleDownloadPdf = async () => {
        const invoiceElement = document.createElement('div');
        invoiceElement.style.position = 'absolute';
        invoiceElement.style.left = '-9999px';
        invoiceElement.style.width = '800px'; 
        document.body.appendChild(invoiceElement);

        const root = createRoot(invoiceElement);
        root.render(<OrderInvoice order={order} />);

        // Allow time for render
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${order.id}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Could not generate PDF. Please try again.");
        } finally {
            // Ensure cleanup happens even if PDF generation fails
            setTimeout(() => {
                root.unmount();
                if (document.body.contains(invoiceElement)) {
                    document.body.removeChild(invoiceElement);
                }
            }, 100);
        }
    };

    const handlePrintInvoice = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Invoice</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // For styling
            printWindow.document.write('</head><body class="p-8">');
            printWindow.document.write('<div id="print-root"></div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            const printRoot = printWindow.document.getElementById('print-root');
            if (printRoot) {
                const root = createRoot(printRoot);
                root.render(<OrderInvoice order={order} />);
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500); // Wait for render
            }
        }
    };

    return (
        <>
            <tr onClick={() => onViewDetails(order)} className="border-b border-gray-200 hover:bg-gray-50 text-sm cursor-pointer">
                <td className="py-3 px-4 text-left font-mono text-sm">#{order.id}</td>
                <td className="py-3 px-4 text-left">{order.date.toLocaleString()}</td>
                <td className="py-3 px-4 text-left">
                    <div>{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                    <div className="text-xs text-accent font-semibold mt-1">
                        {order.deliveryMethod}
                        {order.deliverySlot ? `: ${order.deliverySlot}` : ''}
                    </div>
                </td>
                <td className="py-3 px-4 text-left">
                    <div>{order.paymentMethod}</div>
                    {order.paymentMethod === 'Manual Transfer' && order.paymentScreenshot && (
                        <button type="button" onClick={(e) => handleActionClick(e, () => setIsScreenshotModalOpen(true))} className="text-xs text-accent hover:underline ml-1">(View)</button>
                    )}
                    {order.paymentApproved && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Payment Approved</span>
                        </div>
                    )}
                </td>
                <td className="py-3 px-4 text-center">₹{order.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                     <span className={`py-1 px-3 rounded-full text-xs font-semibold ${statusColor[order.status]}`}>
                        {order.status}
                    </span>
                </td>
                <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        {order.status === 'Pending' && !order.paymentApproved && (order.paymentMethod === 'Manual Transfer' || order.paymentMethod === 'Pay on Khata') && (
                            <button type="button" onClick={(e) => handleActionClick(e, () => approveOrderPayment(order.id))} className="bg-green-100 text-green-700 font-semibold px-2 py-1 rounded text-xs hover:bg-green-200">
                                Approve Payment
                            </button>
                        )}
                        {order.deliveryReview && (
                             <button type="button" onClick={(e) => handleActionClick(e, () => onViewReview(order))} className="text-blue-500 hover:text-blue-700 p-1" title="View Delivery Review">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.083A6.973 6.973 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 14.584A6.983 6.983 0 0010 16c3.866 0 7-2.686 7-6s-3.134-6-7-6-7 2.686-7 6c0 1.31.378 2.523 1.025 3.584L4.416 14.584z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <select
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="p-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                            disabled={order.status === 'Delivered' || order.status === 'Rejected' || order.status === 'Cancelled'}
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        {order.status === 'Pending' && (
                             <button type="button" onClick={(e) => handleActionClick(e, () => onEdit(order))} className="text-accent hover:underline text-xs font-semibold">
                                Edit
                            </button>
                        )}
                         <button type="button" onClick={(e) => handleActionClick(e, handleDownloadPdf)} className="text-gray-500 hover:text-gray-700 p-1" title="Download Bill (PDF)">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                         <button type="button" onClick={(e) => handleActionClick(e, handlePrintInvoice)} className="text-gray-500 hover:text-gray-700 p-1" title="Print Invoice">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </td>
            </tr>
            {isScreenshotModalOpen && order.paymentScreenshot && (
                <Modal
                    isOpen={isScreenshotModalOpen}
                    onClose={() => setIsScreenshotModalOpen(false)}
                    title="Payment Screenshot"
                >
                    <img
                        src={order.paymentScreenshot}
                        alt="Screenshot"
                        className="max-w-full rounded shadow"
                    />
                </Modal>
            )}
        </>
    );
};

export default AdminOrderRow;
