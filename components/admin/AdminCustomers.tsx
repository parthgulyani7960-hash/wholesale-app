
import React, { useMemo, useState } from 'react';
import { User, Order } from '../../types';
import AdminKhataModal from './AdminKhataModal';
import AdminWalletModal from './AdminWalletModal';

interface AdminCustomersProps {
    customers: User[];
    allUsers: User[]; // including admins, etc, to find the user to update
    orders: Order[];
}

type SortKey = 'totalSpent' | 'orderCount' | 'lastOrderDate';

const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers, allUsers, orders }) => {
    const [sortKey, setSortKey] = useState<SortKey>('totalSpent');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [managingKhataFor, setManagingKhataFor] = useState<User | null>(null);
    const [managingWalletFor, setManagingWalletFor] = useState<User | null>(null);

    const customerData = useMemo(() => {
        return customers
            .filter(c => c.role === 'retailer' || c.role === 'wholesaler')
            .map(customer => {
                const customerOrders = orders.filter(o => o.user.email === customer.email && o.status === 'Delivered');
                const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                const orderCount = customerOrders.length;
                const lastOrderDate = customerOrders.length > 0 ? new Date(Math.max(...customerOrders.map(o => o.date.getTime()))) : null;

                let segment, segmentColor;
                if (customer.role === 'wholesaler') {
                    segment = 'Wholesaler'; segmentColor = 'bg-purple-200 text-purple-800';
                } else if (orderCount > 2 || totalSpent > 1500) {
                    segment = 'VIP'; segmentColor = 'bg-yellow-200 text-yellow-800';
                } else if (orderCount >= 1) {
                    segment = 'Regular'; segmentColor = 'bg-green-200 text-green-800';
                } else {
                    segment = 'New'; segmentColor = 'bg-blue-200 text-blue-800';
                }

                const fullUserObject = allUsers.find(u => u.id === customer.id);

                return { ...customer, fullUserObject, totalSpent, orderCount, lastOrderDate, segment, segmentColor };
            });
    }, [customers, orders, allUsers]);

    const sortedAndFilteredCustomers = useMemo(() => {
        const sorted = [...customerData].sort((a, b) => {
            let compareA, compareB;
            if (sortKey === 'lastOrderDate') {
                compareA = a.lastOrderDate?.getTime() || 0;
                compareB = b.lastOrderDate?.getTime() || 0;
            } else {
                compareA = a[sortKey];
                compareB = b[sortKey];
            }
            return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
        });

        if (!searchTerm) {
            return sorted;
        }

        return sorted.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customerData, sortKey, sortOrder, searchTerm]);
    
    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };
    
    const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode, className?: string}> = ({ sortKey: key, children, className }) => (
        <th className={`py-3 px-4 cursor-pointer ${className}`} onClick={() => handleSort(key)}>
            <div className="flex items-center justify-center">
                {children}
                {sortKey === key && <span className="ml-2">{sortOrder === 'desc' ? '↓' : '↑'}</span>}
            </div>
        </th>
    );


    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Customer List</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-center">Wallet Balance</th>
                            <th className="py-3 px-4 text-center">Segment</th>
                            <SortableHeader sortKey="totalSpent" className="text-center">Total Spent</SortableHeader>
                            <SortableHeader sortKey="orderCount" className="text-center">Orders</SortableHeader>
                            <SortableHeader sortKey="lastOrderDate" className="text-center">Last Order</SortableHeader>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {sortedAndFilteredCustomers.map(customer => (
                            <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4 text-left">{customer.name}</td>
                                <td className="py-3 px-4 text-left">{customer.email}</td>
                                <td className="py-3 px-4 text-center font-semibold">₹{(customer.walletBalance || 0).toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${customer.segmentColor}`}>
                                        {customer.segment}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">₹{customer.totalSpent.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">{customer.orderCount}</td>
                                <td className="py-3 px-4 text-center">{customer.lastOrderDate ? customer.lastOrderDate.toLocaleDateString() : 'N/A'}</td>
                                <td className="py-3 px-4 text-center">
                                     <div className="flex justify-center items-center gap-2">
                                        <button 
                                            onClick={() => setManagingWalletFor(customer.fullUserObject || null)}
                                            className="text-accent hover:underline text-xs font-semibold"
                                        >
                                            Wallet
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button 
                                            onClick={() => setManagingKhataFor(customer.fullUserObject || null)}
                                            className="text-accent hover:underline text-xs font-semibold"
                                        >
                                            Khata
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {sortedAndFilteredCustomers.length === 0 && (
                <p className="text-center p-8 text-gray-500">
                    {searchTerm ? 'No customers match your search.' : 'No customers have registered yet.'}
                </p>
            )}
            <AdminKhataModal 
                user={managingKhataFor}
                isOpen={!!managingKhataFor}
                onClose={() => setManagingKhataFor(null)}
            />
             <AdminWalletModal 
                user={managingWalletFor}
                isOpen={!!managingWalletFor}
                onClose={() => setManagingWalletFor(null)}
            />
        </div>
    );
};

export default AdminCustomers;
