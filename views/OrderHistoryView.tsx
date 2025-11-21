
import React, { useMemo, useState } from 'react';
import { Order, CartItem } from '../types';
import { useAppContext } from '../context/AppContext';
import OrderStatusStepper from '../components/OrderStatusStepper';
import DeliveryReviewModal from '../components/DeliveryReviewModal';
import OrderInvoice from '../components/OrderInvoice';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const OrderItem: React.FC<{ item: CartItem }> = ({ item }) => (
    <div className="flex items-center space-x-4 py-3">
        <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
        <div className="flex-grow">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
        </div>
        <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
    </div>
);

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const { addMultipleToCart, cancelOrder } = useAppContext();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const handleReorder = () => {
        addMultipleToCart(order.items);
    };
    
    const handleDownloadPdf = () => {
        const invoiceElement = document.createElement('div');
        invoiceElement.style.position = 'absolute';
        invoiceElement.style.left = '-9999px';
        invoiceElement.style.width = '800px'; 
        document.body.appendChild(invoiceElement);

        const root = createRoot(invoiceElement);
        root.render(<OrderInvoice order={order} />);
        
        setTimeout(() => {
            html2canvas(invoiceElement).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`invoice-${order.id}.pdf`);

                root.unmount();
                document.body.removeChild(invoiceElement);
            });
        }, 100);
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

            const printRootEl = printWindow.document.getElementById('print-root');
            if (printRootEl) {
                const root = createRoot(printRootEl);
                root.render(<OrderInvoice order={order} />);
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500); // Wait for render
            }
        }
    };

    const handleCancelOrder = () => {
        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            cancelOrder(order.id);
        }
    };

    return (
        <>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                <div>
                    <p className="font-bold text-lg text-primary">Order ID: #{order.id}</p>
                    <p className="text-sm text-gray-500">Date: {order.date.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-primary">Total: ₹{order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                </div>
            </div>
            
            <div className="p-5">
                 <OrderStatusStepper currentStatus={order.status} />
            </div>

            <div className="px-5 pb-3 text-sm text-gray-600">
                <p><strong>Delivery Method:</strong> {order.deliveryMethod}</p>
                {order.deliverySlot && <p><strong>Scheduled For:</strong> {order.deliverySlot}</p>}
                {order.customerNotes && <p><strong>Your Notes:</strong> {order.customerNotes}</p>}
            </div>
            
            {order.deliveryReview && (
                 <div className="px-5 pb-5 border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-sm text-primary mb-2">Your Delivery Review</h4>
                    <div className="flex items-center mb-1">
                        <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < order.deliveryReview!.rating ? 'fill-current' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                    </div>
                    <p className="text-gray-600 text-sm italic">"{order.deliveryReview.comment}"</p>
                    {order.deliveryReview.response && (
                        <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg border-l-4 border-accent">
                            <p className="font-bold text-xs text-primary">Admin Response</p>
                            <p className="text-gray-600 text-sm">{order.deliveryReview.response}</p>
                        </div>
                    )}
                 </div>
            )}

            <div className="p-5 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-primary">Items in this order:</h4>
                     <div className="flex items-center gap-2 flex-wrap justify-end">
                        {order.status === 'Pending' && (
                           <button onClick={handleCancelOrder} className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors">
                                Cancel Order
                           </button>
                        )}
                        {order.status === 'Delivered' && !order.deliveryReview && (
                           <button onClick={() => setIsReviewModalOpen(true)} className="bg-primary text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-accent hover:text-primary transition-colors">
                                Rate Delivery
                           </button>
                        )}
                        <button
                            onClick={handleReorder}
                            className="bg-accent text-primary font-semibold px-4 py-2 rounded-md text-sm hover:bg-opacity-80 transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Buy Again</span>
                        </button>
                         <button 
                            onClick={handleDownloadPdf}
                            className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
                        >
                            Download Bill (PDF)
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                    {order.items.map(item => <OrderItem key={item.id} item={item} />)}
                </div>
            </div>
        </div>
        <DeliveryReviewModal 
            isOpen={isReviewModalOpen} 
            onClose={() => setIsReviewModalOpen(false)}
            orderId={order.id}
        />
        </>
    );
};


const OrderHistoryView: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const { currentUser, setView } = useAppContext();

    const userOrders = useMemo(() => {
        if (!currentUser) return [];
        return orders
            .filter(order => order.user.email.toLowerCase() === currentUser.email.toLowerCase())
            .sort((a, b) => b.date.getTime() - b.date.getTime());
    }, [orders, currentUser]);

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-center mb-4 text-primary">Your Order History</h1>
            <p className="text-center text-gray-600 mb-10">Track the status of your past orders in real-time.</p>
            
            {userOrders.length === 0 ? (
                <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-lg mx-auto">
                    <p className="text-gray-500 text-lg mb-6">You haven't placed any orders yet.</p>
                    <button
                        onClick={() => setView('products')}
                        className="bg-accent text-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-8 max-w-4xl mx-auto">
                    {userOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default OrderHistoryView;
