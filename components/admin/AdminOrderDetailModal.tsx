import React from 'react';
import { Order } from '../../types';
import Modal from '../Modal';

interface AdminOrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
);

const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    if (!order) return null;

    const subtotal = order.items.reduce((sum, item) => sum + ((item.discountPrice ?? item.price) * item.quantity), 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: #${order.id}`}>
            <div className="space-y-6 text-sm">
                
                {/* Status and Summary */}
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-bold text-lg text-primary">{order.status}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-500">Grand Total</p>
                        <p className="font-bold text-lg text-primary">₹{order.total.toFixed(2)}</p>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="border p-4 rounded-md">
                    <h3 className="font-semibold text-base mb-2 text-primary">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Name" value={order.user.name} />
                        <DetailRow label="Email" value={order.user.email} />
                        <DetailRow label="Mobile" value={order.user.mobile} />
                        <DetailRow label="Shop Name" value={order.user.shopName} />
                        <div className="col-span-2">
                           <DetailRow label="Delivery Address" value={`${order.user.address}, ${order.user.pincode}`} />
                        </div>
                    </div>
                </div>

                {/* Order & Payment Details */}
                 <div className="border p-4 rounded-md">
                    <h3 className="font-semibold text-base mb-2 text-primary">Order & Payment</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Order Date" value={order.date.toLocaleString()} />
                        <DetailRow label="Delivery Method" value={order.deliveryMethod} />
                        {order.deliverySlot && <DetailRow label="Delivery Slot" value={order.deliverySlot} />}
                        <DetailRow label="Payment Method" value={order.paymentMethod} />
                     </div>
                </div>

                {/* Items */}
                 <div className="border p-4 rounded-md">
                    <h3 className="font-semibold text-base mb-2 text-primary">Items Ordered</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center space-x-3 text-sm border-b pb-2 last:border-b-0">
                                <img src={item.imageUrls[0]} alt={item.name} className="w-12 h-12 object-cover rounded"/>
                                <div className="flex-grow">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity} x ₹{(item.discountPrice ?? item.price).toFixed(2)}</p>
                                </div>
                                <p className="font-semibold">₹{((item.discountPrice ?? item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Billing Summary */}
                 <div className="border p-4 rounded-md">
                    <h3 className="font-semibold text-base mb-2 text-primary">Billing Summary</h3>
                    <div className="space-y-1 text-right">
                         <div className="flex justify-between"><span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
                         {order.discountApplied && <div className="flex justify-between text-green-600"><span>Discount Applied:</span> <span>- ₹{order.discountApplied.toFixed(2)}</span></div>}
                         {order.deliveryFeeApplied && <div className="flex justify-between"><span>Delivery Fee:</span> <span>₹{order.deliveryFeeApplied.toFixed(2)}</span></div>}
                         <div className="flex justify-between font-bold text-base border-t pt-1 mt-1"><span>Grand Total:</span> <span>₹{order.total.toFixed(2)}</span></div>
                    </div>
                </div>
                
                {/* Notes */}
                {(order.customerNotes || (order.internalNotes && order.internalNotes.length > 0)) && (
                    <div className="border p-4 rounded-md">
                        <h3 className="font-semibold text-base mb-2 text-primary">Notes</h3>
                        {order.customerNotes && <DetailRow label="Customer Notes" value={<i className="text-gray-600">"{order.customerNotes}"</i>} />}
                        {order.internalNotes && order.internalNotes.length > 0 && (
                            <div>
                               <p className="text-xs text-gray-500 mt-2">Internal Notes</p>
                               <div className="space-y-1 text-xs pl-2 border-l-2 mt-1">
                                {order.internalNotes.map((note, idx) => (
                                    <p key={idx} className="text-gray-800"><b>{note.author}:</b> {note.note}</p>
                                ))}
                               </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AdminOrderDetailModal;
