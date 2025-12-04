
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import Modal from './Modal';
import OrderInvoice from './OrderInvoice';
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
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isApprovingPayment, setIsApprovingPayment] = useState(false);

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

    const handleStatusChange = (newStatus: OrderStatus) => {
        if (newStatus === order.status) return;
        setIsUpdatingStatus(true);
        try {
            updateOrderStatus(order.id, newStatus);
        } finally {
            setTimeout(() => setIsUpdatingStatus(false), 300);
        }
    };

    const handleApprovePayment = () => {
        setIsApprovingPayment(true);
        try {
            approveOrderPayment(order.id);
        } finally {
            setTimeout(() => setIsApprovingPayment(false), 300);
        }
    };

    const handleDownloadPdf = async () => {
        if (isGeneratingPdf) return;
        setIsGeneratingPdf(true);
        
        const invoiceElement = document.createElement('div');
        invoiceElement.style.position = 'absolute';
        invoiceElement.style.left = '-9999px';
        invoiceElement.style.width = '800px';
        invoiceElement.style.backgroundColor = '#ffffff';
        document.body.appendChild(invoiceElement);

        let root: ReturnType<typeof createRoot> | null = null;

        try {
            root = createRoot(invoiceElement);
            root.render(<OrderInvoice order={order} />);

            await new Promise(resolve => setTimeout(resolve, 600));

            const canvas = await html2canvas(invoiceElement, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
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
            setIsGeneratingPdf(false);
            setTimeout(() => {
                if (root) {
                    try {
                        root.unmount();
                    } catch (e) {}
                }
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
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
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
                }, 500);
            }
        }
    };

    const isTerminalStatus = order.status === 'Delivered' || order.status === 'Rejected' || order.status === 'Cancelled';

    return (
        <>
            <tr onClick={() => onViewDetails(order)} className="border-b border-gray-200 hover:bg-gray-100 text-sm cursor-pointer transition-colors duration-150">
                <td className="py-3 px-4 text-left font-mono text-sm">#{order.id}</td>
                <td className="py-3 px-4 text-left">{order.date.toLocaleString()}</td>
                <td className="py-3 px-4 text-left">
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                    <div className="text-xs text-accent font-semibold mt-1">
                        {order.deliveryMethod}
                        {order.deliverySlot ? `: ${order.deliverySlot}` : ''}
                    </div>
                </td>
                <td className="py-3 px-4 text-left">
                    <div>{order.paymentMethod}</div>
                    {order.paymentMethod === 'Manual Transfer' && order.paymentScreenshot && (
                        <button type="button" onClick={(e) => handleActionClick(e, () => setIsScreenshotModalOpen(true))} className="text-xs text-accent hover:underline font-medium">(View Receipt)</button>
                    )}
                    {order.paymentApproved && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Approved</span>
                        </div>
                    )}
                </td>
                <td className="py-3 px-4 text-center font-semibold">₹{order.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold transition-all duration-200 ${statusColor[order.status]} ${isUpdatingStatus ? 'opacity-50 animate-pulse' : ''}`}>
                        {isUpdatingStatus ? 'Updating...' : order.status}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {order.status === 'Pending' && !order.paymentApproved && (order.paymentMethod === 'Manual Transfer' || order.paymentMethod === 'Pay on Khata') && (
                            <button 
                                type="button" 
                                onClick={(e) => handleActionClick(e, handleApprovePayment)} 
                                disabled={isApprovingPayment}
                                className="bg-green-500 text-white font-semibold px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isApprovingPayment ? (
                                    <span className="flex items-center gap-1">
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Approving...
                                    </span>
                                ) : 'Approve Pay'}
                            </button>
                        )}
                        
                        <button 
                            type="button" 
                            onClick={(e) => handleActionClick(e, () => onViewDetails(order))} 
                            className="bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors duration-150"
                            title="View Details"
                        >
                            Details
                        </button>

                        {order.status === 'Pending' && (
                            <button 
                                type="button" 
                                onClick={(e) => handleActionClick(e, () => onEdit(order))} 
                                className="bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded text-xs hover:bg-amber-200 transition-colors duration-150"
                                title="Edit Order"
                            >
                                Edit
                            </button>
                        )}
                        
                        {order.deliveryReview && (
                            <button 
                                type="button" 
                                onClick={(e) => handleActionClick(e, () => onViewReview(order))} 
                                className="bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded text-xs hover:bg-purple-200 transition-colors duration-150"
                                title="View Delivery Review"
                            >
                                Review
                            </button>
                        )}

                        <select
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                            className={`p-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-150 ${isUpdatingStatus ? 'opacity-50 cursor-wait' : ''} ${isTerminalStatus ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            disabled={isTerminalStatus || isUpdatingStatus}
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        <button 
                            type="button" 
                            onClick={(e) => handleActionClick(e, handleDownloadPdf)} 
                            disabled={isGeneratingPdf}
                            className={`p-1 rounded transition-colors duration-150 ${isGeneratingPdf ? 'text-gray-400 cursor-wait' : 'text-gray-500 hover:text-primary hover:bg-gray-100'}`}
                            title={isGeneratingPdf ? "Generating PDF..." : "Download Invoice (PDF)"}
                        >
                            {isGeneratingPdf ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={(e) => handleActionClick(e, handlePrintInvoice)} 
                            className="text-gray-500 hover:text-primary hover:bg-gray-100 p-1 rounded transition-colors duration-150" 
                            title="Print Invoice"
                        >
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
