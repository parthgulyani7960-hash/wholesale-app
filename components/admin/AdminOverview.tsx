
import React, { useMemo } from 'react';
import { Order, Product, User, SupportTicket } from '../../types';

interface AdminOverviewProps {
    orders: Order[];
    products: Product[];
    users: User[];
    tickets: SupportTicket[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement, className?: string, action?: React.ReactNode }> = ({ title, value, icon, className = '', action }) => (
    <div className={`bg-gray-50 p-6 rounded-lg flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-4">
            <div className="bg-accent/20 text-accent p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-primary">{value}</p>
            </div>
        </div>
        {action}
    </div>
);

const SalesChart: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const salesData = useMemo(() => {
        const data: { label: string; revenue: number }[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dailyRevenue = orders
                .filter(o => {
                    const orderDate = new Date(o.date);
                    return o.status === 'Delivered' && orderDate >= date && orderDate < nextDate;
                })
                .reduce((sum, o) => sum + o.total, 0);
            
            data.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dailyRevenue,
            });
        }
        return data;
    }, [orders]);

    const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1); // Avoid division by zero

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-serif font-bold mb-4 text-primary">Last 7 Days Sales</h3>
            <div className="flex justify-between items-end h-48 space-x-2">
                {salesData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                        <div className="text-xs text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{Math.round(data.revenue)}
                        </div>
                        <div
                            className="w-full bg-primary/20 rounded-t-md hover:bg-primary/40 transition-colors"
                            style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                        ></div>
                        <div className="text-xs font-semibold text-gray-600 mt-1">{data.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminOverview: React.FC<AdminOverviewProps> = ({ orders, products, users, tickets }) => {
    const totalRevenue = useMemo(() => 
        orders.filter(o => o.status === 'Delivered').reduce((sum, order) => sum + order.total, 0)
    , [orders]);

    const pendingOrders = useMemo(() => 
        orders.filter(o => o.status === 'Pending').length
    , [orders]);
    
    const openTickets = useMemo(() => 
        tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length
    , [tickets]);

    const lowStockProducts = useMemo(() => 
        products.filter(p => p.stock > 0 && p.stock <= 5)
    , [products]);

    const handleShareLowStock = () => {
        if (lowStockProducts.length === 0) return;
        const items = lowStockProducts.map(p => `- ${p.name} (Stock: ${p.stock})`).join('\n');
        const message = `*Low Stock Alert*\n\nThe following items need reordering:\n\n${items}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Store Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toFixed(2)}`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h.01M4.887 14.12l.002-.002.002-.002a3.492 3.492 0 014.243 4.242l.002.002.002.002a3.492 3.492 0 01-4.243-4.242zm14.226-8.242l-.002.002-.002.002a3.492 3.492 0 01-4.243 4.242l-.002-.002-.002-.002a3.492 3.492 0 014.243-4.242zM12 12h.01M4.887 5.878l.002.002.002.002a3.492 3.492 0 014.243-4.242l.002-.002.002-.002a3.492 3.492 0 01-4.243 4.242zm14.226 8.242l-.002-.002-.002-.002a3.492 3.492 0 01-4.243-4.242l-.002.002-.002.002a3.492 3.492 0 014.243 4.242z" /></svg>}
                />
                 <StatCard
                    title="Pending Orders"
                    value={pendingOrders}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                />
                 <StatCard
                    title="Open Tickets"
                    value={openTickets}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" /></svg>}
                    className={openTickets > 0 ? 'bg-orange-50 border border-orange-200' : ''}
                />
                 <StatCard
                    title="Low Stock Items"
                    value={lowStockProducts.length}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    className={lowStockProducts.length > 0 ? 'bg-red-50 border border-red-200' : ''}
                    action={
                        lowStockProducts.length > 0 && (
                            <button onClick={handleShareLowStock} title="Share List via WhatsApp" className="text-green-600 hover:bg-green-100 p-2 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
                            </button>
                        )
                    }
                />
            </div>
            <SalesChart orders={orders} />
        </div>
    );
};

export default AdminOverview;
