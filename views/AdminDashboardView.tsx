

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Order, OrderStatus, User, Product, Expense, Coupon } from '../types';
import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminReviews from '../components/admin/AdminReviews';
import AdminPaymentSettings from '../components/admin/AdminPaymentSettings';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSupportTickets from '../components/admin/AdminSupportTickets';
import AdminExpenses from '../components/admin/AdminExpenses';
import AdminStoreSettings from '../components/admin/AdminStoreSettings';
import AdminCoupons from '../components/admin/AdminCoupons';
import { useAppContext } from '../context/AppContext';

type AdminTab = 'Overview' | 'Orders' | 'Products' | 'Customers' | 'Users' | 'Reviews' | 'Coupons' | 'Support' | 'Reports' | 'Expenses' | 'System Status' | 'Store Settings' | 'Payment Settings';

// Reports Component
const AdminReports: React.FC<{ orders: Order[]; products: Product[]; customers: User[]; expenses: Expense[] }> = ({ orders, products, customers, expenses }) => {
    const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'Delivered'), [orders]);

    const getSalesData = (period: 'day' | 'week' | 'month') => {
        const now = new Date();
        let startDate = new Date();
        if (period === 'day') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'week') {
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
        } else { // month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const periodOrders = deliveredOrders.filter(o => o.date >= startDate);
        const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
        
        const periodExpenses = expenses.filter(e => e.date >= startDate);
        const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        
        return { count: periodOrders.length, revenue: totalRevenue, expenses: totalExpenses, profit: netProfit };
    };

    const monthly = getSalesData('month');

    const topProducts = useMemo(() => {
        const productSales = new Map<number, { name: string; quantity: number; revenue: number }>();
        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                const existing = productSales.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
                existing.quantity += item.quantity;
                existing.revenue += item.priceAtTimeOfCart * item.quantity;
                productSales.set(item.id, existing);
            });
        });
        return Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [deliveredOrders]);

    const topCustomers = useMemo(() => {
        const customerSpending = new Map<string, { name: string; revenue: number }>();
        deliveredOrders.forEach(order => {
            const existing = customerSpending.get(order.user.email) || { name: order.user.name, revenue: 0 };
            existing.revenue += order.total;
            customerSpending.set(order.user.email, existing);
        });
        return Array.from(customerSpending.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [deliveredOrders]);

    const BarChart: React.FC<{ title: string; data: any[] }> = ({ title, data }) => {
        const maxValue = useMemo(() => Math.max(...data.map(item => item.revenue), 0), [data]);
    
        return (
            <div>
                <h3 className="text-xl font-serif font-bold mb-4">{title}</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {data.length > 0 ? data.map(item => (
                        <div key={item.name} className="flex items-center text-sm group">
                            <div className="w-1/3 font-medium text-primary truncate pr-2" title={item.name}>{item.name}</div>
                            <div className="w-2/3 flex items-center gap-2">
                                <div className="flex-grow bg-gray-200 rounded-full h-5 relative overflow-hidden">
                                    <div 
                                        className="bg-primary h-5 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                                        style={{ width: `${maxValue > 0 ? (item.revenue / maxValue) * 100 : 0}%` }}
                                    >
                                         <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            ₹{item.revenue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-gray-600 font-semibold min-w-[70px] text-right">
                                    {item.quantity ? `${item.quantity} sold` : `₹${item.revenue.toFixed(2)}`}
                                </span>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500">No data available yet.</p>}
                </div>
            </div>
        );
    };

    return (
         <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Financial Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg">This Month's Revenue</h3>
                    <p className="text-3xl font-bold text-primary">₹{monthly.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{monthly.count} orders</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg">This Month's Expenses</h3>
                    <p className="text-3xl font-bold text-primary">₹{monthly.expenses.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">from records</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg">This Month's Profit</h3>
                    <p className={`text-3xl font-bold ${monthly.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{monthly.profit.toFixed(2)}
                    </p>
                     <p className="text-sm text-gray-500">Revenue - Expenses</p>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart title="Top Selling Products" data={topProducts} />
                <BarChart title="Top Customers" data={topCustomers} />
            </div>

             <div className="mt-8">
                <h3 className="text-xl font-serif font-bold mb-4">GST Invoice (Sample)</h3>
                <div className="border p-4 rounded-md text-sm">
                    <p>This section would contain functionalities to generate and download GST-compliant invoices for each order. For now, it's a placeholder representing where financial tools would be integrated.</p>
                </div>
            </div>
        </div>
    )
};

// System Status Component
const SystemStatus: React.FC = () => {
    const systems = [
        { name: 'Payment Upload Storage', status: 'Operational' },
        { name: 'Notification Service', status: 'Operational' },
        { name: 'Database Connection', status: 'Operational' },
        { name: 'Geolocation API', status: 'Degraded Performance' },
        { name: 'Automatic Data Backups', status: 'Active' },
        { name: 'Offline Sync Capability', status: 'Inactive' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">System Status</h2>
            <div className="space-y-3">
                {systems.map(system => (
                    <div key={system.name} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <span className="font-medium text-gray-700">{system.name}</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            system.status === 'Operational' || system.status === 'Active' ? 'bg-green-200 text-green-800' : 
                            system.status === 'Inactive' ? 'bg-gray-200 text-gray-800' :
                            'bg-yellow-200 text-yellow-800'
                        }`}>
                            {system.status}
                        </span>
                    </div>
                ))}
            </div>
             <div className="mt-6 text-sm text-gray-600 border-t pt-4">
                <h3 className="font-semibold mb-2">Debug Log (Last 5 Entries)</h3>
                <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-x-auto">
                    <code>
                        [INFO] User 'admin@hindgeneral.com' logged in successfully.<br/>
                        [WARN] Geolocation API timeout for user session 1a2b3c.<br/>
                        [INFO] Order ord_167... status updated to 'Packed'.<br/>
                        [INFO] Product 'Classic Leather Journal' stock updated to 24.<br/>
                        [ERROR] Failed to send push notification for order ord_...
                    </code>
                </pre>
            </div>
        </div>
    );
};

interface AdminDashboardViewProps {
    orders: Order[];
    users: User[];
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    coupons: Coupon[];
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ orders, users, updateOrderStatus, coupons }) => {
    const { products, tickets, expenses, approveOrderPayment, updateUser, currentUser } = useAppContext();
    const audioRef = useRef<HTMLAudioElement>(null);
    const prevPendingOrdersRef = useRef<number>(0);

    const availableTabs = useMemo((): AdminTab[] => {
        const role = currentUser?.role;
        if (role === 'owner') {
            return ['Overview', 'Orders', 'Products', 'Customers', 'Users', 'Reviews', 'Coupons', 'Support', 'Reports', 'Expenses', 'Store Settings', 'Payment Settings', 'System Status'];
        }
        if (role === 'admin') {
            return ['Overview', 'Orders', 'Products', 'Customers', 'Reviews', 'Support'];
        }
        return [];
    }, [currentUser]);

    const [activeTab, setActiveTab] = useState<AdminTab>(availableTabs[0] || 'Orders');
    
    useEffect(() => {
        // Audio alert for new manual payment uploads
        const currentPendingOrders = orders.filter(o => o.status === 'Pending' && o.paymentMethod === 'Manual Transfer' && o.paymentScreenshot).length;
        if (currentPendingOrders > prevPendingOrdersRef.current) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }
        prevPendingOrdersRef.current = currentPendingOrders;
    }, [orders]);
    
    if (!availableTabs.includes(activeTab)) {
        setActiveTab(availableTabs[0] || 'Orders');
    }

    const customerUsers = users.filter(u => u.role === 'retailer' || u.role === 'wholesaler');

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <AdminOverview orders={orders} products={products} users={customerUsers} tickets={tickets} />;
            case 'Orders':
                return <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} approveOrderPayment={approveOrderPayment} />;
            case 'Products':
                return <AdminProducts />;
            case 'Customers':
                return <AdminCustomers customers={customerUsers} allUsers={users} orders={orders} />;
            case 'Users':
                return <AdminUsers allUsers={users} onUserUpdate={updateUser} />;
            case 'Reviews':
                return <AdminReviews products={products} />;
            case 'Coupons':
                return <AdminCoupons />;
            case 'Support':
                return <AdminSupportTickets />;
            case 'Reports':
                return <AdminReports orders={orders} products={products} customers={customerUsers} expenses={expenses} />;
            case 'Expenses':
                return <AdminExpenses />;
            case 'System Status':
                return <SystemStatus />;
            case 'Store Settings':
                return <AdminStoreSettings />;
            case 'Payment Settings':
                return <AdminPaymentSettings />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: AdminTab }> = ({ tabName }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                activeTab === tabName
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {tabName}
        </button>
    );

    if (!currentUser || availableTabs.length === 0) {
        return <div className="text-center p-12">Access Denied.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <audio ref={audioRef} src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OExAAAAAAAAAAAAAAAFlLpAUAAAQAAA4AAAAA//OEwEcAAAG4AAAAAABr//N+9YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEfgAACAABJgAAAAAAAAAAAAAAARoBoQGgoAAYgTAN/7uDF9+Ajdlf/84TEIAAAEAAAG4AAAAAAAAAAAAAAAVGGbQVoAMwAMwwAABo5/7/84TEYAAAAEAAAG4AAAAAAAAAAAAAABQoaZhVjgz00MMMAAAaN//f/ziBKYgAAABAAABpAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAgICAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAP/zhMRmAAAABAAABuAAAAAAAAAAAAAAAUaGAAAAA//OEwE4AAAG4AAAAAABr/+9+9QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEfgAACAABJgAAAAAAAAAAAAAAARoBoQGgoAAYgTAN/7uDF9+Ajdlf/84TEIAAAEAAAG4AAAAAAAAAAAAAAAVGGbQVoAMwAMwwAABo5/7/84TEYAAAAEAAAG4AAAAAAAAAAAAAABQoaZhVjgz00MMMAAAaN//f/ziBKYgAAABAAABpAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAgICAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAP/zhMRmAAAABAAABuAAAAAAAAAAAAAAAUaGAAAAA=" preload="auto" />
            <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome, {currentUser.name}. Your role is: <span className="font-semibold capitalize">{currentUser.role}</span>.</p>

            <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
                {availableTabs.map(tab => <TabButton key={tab} tabName={tab} />)}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboardView;
