import React from 'react';
import { Order } from '../types';
import { initialStoreInfo as storeInfo } from '../constants';

interface OrderInvoiceProps {
    order: Order;
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ order }) => {
    const subtotal = order.items.reduce((sum, item) => sum + ((item.discountPrice ?? item.price) * item.quantity), 0);
    // Assuming a flat 18% GST for this example. In a real app, this would be per-item.
    const gstAmount = order.total * 0.18; 
    const totalBeforeGst = order.total - gstAmount;


    return (
        <div className="bg-white text-gray-800 font-sans p-4">
            <div className="border-b-2 border-gray-800 pb-4 mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{storeInfo.name}</h1>
                    <p className="text-sm">{storeInfo.address}</p>
                    <p className="text-sm">GSTIN: {storeInfo.gstNumber}</p>
                </div>
                <h2 className="text-2xl font-bold uppercase text-gray-600">Invoice</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 className="font-bold mb-1">Bill To:</h3>
                    <p>{order.user.name}</p>
                    <p>{order.user.address}</p>
                    <p>Email: {order.user.email}</p>
                    <p>Phone: {order.user.mobile}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">Invoice #:</span> {order.id.slice(-8)}</p>
                    <p><span className="font-bold">Date:</span> {order.date.toLocaleDateString()}</p>
                    {order.status === 'Delivered' && order.deliveredDate && (
                        <p><span className="font-bold">Delivered:</span> {order.deliveredDate.toLocaleString()}</p>
                    )}
                </div>
            </div>

            <table className="w-full text-left mb-6">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">₹{(item.discountPrice ?? item.price).toFixed(2)}</td>
                            <td className="p-2 text-right">₹{((item.discountPrice ?? item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {order.discountApplied && (
                         <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>- ₹{order.discountApplied.toFixed(2)}</span>
                        </div>
                    )}
                     {order.deliveryFeeApplied && (
                        <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                            <span>₹{order.deliveryFeeApplied.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl border-t-2 border-gray-800 pt-2 mt-2">
                        <span>Grand Total:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div className="border-t mt-8 pt-4 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated invoice and does not require a signature.</p>
            </div>
        </div>
    );
};

export default OrderInvoice;