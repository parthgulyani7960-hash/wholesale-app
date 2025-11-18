
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../../types';
import AdminOrderRow from './AdminOrderRow';
import AdminOrderEditModal from './AdminOrderEditModal';
import AdminDeliveryReviewModal from './AdminDeliveryReviewModal';
import AdminOrderDetailModal from './AdminOrderDetailModal';

interface AdminOrdersProps {
    orders: Order[];
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    approveOrderPayment: (orderId: string) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, updateOrderStatus, approveOrderPayment }) => {
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [customerNameFilter, setCustomerNameFilter] = useState('');
    const [orderIdFilter, setOrderIdFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Status filter
            if (statusFilter !== 'All' && order.status !== statusFilter) {
                return false;
            }

            // Customer name filter
            if (customerNameFilter && !order.user.name.toLowerCase().includes(customerNameFilter.toLowerCase())) {
                return false;
            }

            // Order ID filter
            if (orderIdFilter && !String(order.id).includes(orderIdFilter)) {
                return false;
            }

            // Date range filter
            const orderDate = new Date(order.date);
            if (dateFilter.start) {
                const startDate = new Date(dateFilter.start);
                startDate.setHours(0, 0, 0, 0);
                if (orderDate < startDate) {
                    return false;
                }
            }
            if (dateFilter.end) {
                const endDate = new Date(dateFilter.end);
                endDate.setHours(23, 59, 59, 999);
                if (orderDate > endDate) {
                    return false;
                }
            }
            
            return true;
        });
    }, [orders, statusFilter, customerNameFilter, orderIdFilter, dateFilter]);

    const statusOptions: Array<OrderStatus | 'All'> = ['All', 'Pending', 'Approved', 'Packed', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'];
    
    const resetFilters = () => {
        setStatusFilter('All');
        setCustomerNameFilter('');
        setOrderIdFilter('');
        setDateFilter({ start: '', end: '' });
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Manage Orders</h2>
            
            <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <input
                            type="text"
                            id="customerName"
                            value={customerNameFilter}
                            onChange={e => setCustomerNameFilter(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                            placeholder="Search by name..."
                        />
                    </div>
                     <div>
                        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Order ID</label>
                        <input
                            type="text"
                            id="orderId"
                            value={orderIdFilter}
                            onChange={e => setOrderIdFilter(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                            placeholder="Search by ID..."
                        />
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={dateFilter.start}
                            onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                        />
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={dateFilter.end}
                            onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent text-sm bg-white"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={resetFilters} className="text-sm text-accent hover:underline font-semibold">Reset Filters</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Order ID</th>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-left">Customer</th>
                            <th className="py-3 px-4 text-left">Payment</th>
                            <th className="py-3 px-4 text-center">Total</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {filteredOrders.map(order => (
                            <AdminOrderRow 
                                key={order.id} 
                                order={order} 
                                updateOrderStatus={updateOrderStatus} 
                                approveOrderPayment={approveOrderPayment}
                                onEdit={setEditingOrder}
                                onViewReview={setReviewingOrder}
                                onViewDetails={setViewingOrder}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredOrders.length === 0 && (
                <p className="text-center p-8 text-gray-500">
                    {orders.length > 0 ? 'No orders match the current filters.' : 'No orders yet.'}
                </p>
            )}

            <AdminOrderEditModal 
                order={editingOrder} 
                isOpen={!!editingOrder} 
                onClose={() => setEditingOrder(null)} 
            />
            
            <AdminDeliveryReviewModal
                order={reviewingOrder}
                isOpen={!!reviewingOrder}
                onClose={() => setReviewingOrder(null)}
            />

            <AdminOrderDetailModal
                order={viewingOrder}
                isOpen={!!viewingOrder}
                onClose={() => setViewingOrder(null)}
            />
        </div>
    );
};

export default AdminOrders;
