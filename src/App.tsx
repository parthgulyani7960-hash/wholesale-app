import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { AppProvider, View, useAppContext } from './context/AppContext';
import { useStore } from './store/useStore'; // Import Zustand store
import HomeView from './views/HomeView';
import ProductsView from './views/ProductsView';
import AdminDashboardView from './views/AdminDashboardView';
import ProductDetailView from './views/ProductDetailView';
import WishlistView from './views/WishlistView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import OrderHistoryView from './views/OrderHistoryView';
import MyAccountView from './views/MyAccountView';
import ContactView from './views/ContactView';
import HelpView from './views/HelpView';
import SettingsView from './views/SettingsView';
import NotificationsView from './views/NotificationsView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsOfServiceView from './views/TermsOfServiceView';
import SupportView from './views/SupportView';
import { initialProducts, initialOrders, initialPaymentDetails, serviceablePincodes as initialServiceablePincodes, initialStoreInfo, initialSupportTickets, initialExpenses, initialCoupons } from './constants';
import { Product, Order, OrderStatus, Review, User, DeliveryReview, PaymentDetailsConfig, Notification, StoreInfoConfig, SupportTicket, SupportMessage, SupportTicketStatus, Expense, Coupon, CartItem } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import TutorialOverlay from './components/TutorialOverlay';
import FloatingContactButtons from './components/FloatingContactButtons';
import LocationModal from './components/PincodeValidatorModal';
import NotificationPermissionModal from './components/NotificationPermissionModal';

const App: React.FC = () => {
    // --- ZUSTAND STORE HOOKS ---
    // We destructure these to pass them into the Context Provider for backward compatibility
    const { 
        cartItems, addToCart, addMultipleToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount,
        wishlistItems, addToWishlist, removeFromWishlist, isInWishlist,
        currentUser, users, login, logout, signup, updateUser: updateStoreUser,
        notification, showNotification 
    } = useStore();

    // --- APP LOCAL STATE ---
    const [view, setView] = useState<View>('home');
    const [error, setError] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [sessionPincode, setSessionPincode] = useState<string | null>(null);
    
    // --- DATA STATE (Managed locally for now, could be moved to store later) ---
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(true);
    const [orders, setOrders] = useState<Order[]>([]);
    // users state is now managed by Zustand, but we might need a local setter for specific admin overrides if not handled by store
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsConfig>(initialPaymentDetails);
    const [storeInfo, setStoreInfo] = useState<StoreInfoConfig>(initialStoreInfo);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [currentServiceablePincodes, setServiceablePincodes] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

    // --- INITIAL DATA LOAD ---
    useEffect(() => {
        const loadInitialData = async () => {
            setProductsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setProducts(initialProducts);
            setOrders(initialOrders.sort((a, b) => b.date.getTime() - a.date.getTime()));
            setPaymentDetails(initialPaymentDetails);
            setStoreInfo(initialStoreInfo);
            setTickets(initialSupportTickets);
            setServiceablePincodes(initialServiceablePincodes);
            setExpenses(initialExpenses.sort((a, b) => b.date.getTime() - a.date.getTime()));
            setCategories(Array.from(new Set(initialProducts.map(p => p.category))));
            setProductsLoading(false);
        };
        loadInitialData();
    }, []);

    // --- COMPUTED VALUES FROM STORE ---
    const cartTotal = getCartTotal();
    const itemCount = getItemCount();

    // --- BRIDGE FUNCTIONS FOR CONTEXT COMPATIBILITY ---
    // These functions wrap the Zustand actions or local state updates
    
    const setUsers = (newUsers: User[] | ((prev: User[]) => User[])) => {
        // This is a bit of a hack to maintain compatibility with the Context interface
        // ideally, we should fully migrate 'users' management to the store.
        // For now, we warn or handle simpler cases.
        console.warn("Direct setUsers called. Ideally use store actions.");
    };

    const updateUser = useCallback(async (updatedUserData: Partial<User> & { id: number }) => {
        await updateStoreUser(updatedUserData);
    }, [updateStoreUser]);

    const sendUserNotification = useCallback(async (userId: number, message: string, link?: Notification['link']) => {
        // This logic involves finding a user and updating their notifications. 
        // Since 'users' is in the store, we need to update it via the store.
        // We will perform a partial update on the user.
        const targetUser = users.find(u => u.id === userId);
        if (targetUser) {
            const newNotif: Notification = { id: `notif_${Date.now()}_${userId}`, message, date: new Date(), read: false, link };
            const updatedNotifications = [newNotif, ...(targetUser.notifications || [])];
            await updateStoreUser({ id: userId, notifications: updatedNotifications });
        }
    }, [users, updateStoreUser]);
    
    useEffect(() => {
        const handleBackInStock = (event: Event) => {
            const { product } = (event as CustomEvent).detail;
            users.filter(u => u.outOfStockSubscriptions?.includes(product.id)).forEach(user => {
                sendUserNotification(user.id, `Good news! "${product.name}" is back in stock.`, { view: 'productDetail', params: { productId: product.id } });
                updateUser({ id: user.id, outOfStockSubscriptions: user.outOfStockSubscriptions?.filter(id => id !== product.id) });
            });
        };
        document.addEventListener('productBackInStock', handleBackInStock);
        return () => document.removeEventListener('productBackInStock', handleBackInStock);
    }, [users, updateUser, sendUserNotification]);
    
    const updateUserWallet = useCallback(async (userId: number, amount: number, reason: string) => {
        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate) {
            const newBalance = (userToUpdate.walletBalance || 0) + amount;
            await updateUser({ id: userId, walletBalance: newBalance });
            // Since updateUser in store is async, we can chain this
            await sendUserNotification(userId, `Your wallet has been updated by ₹${amount.toFixed(2)}. Reason: ${reason}. New balance: ₹${newBalance.toFixed(2)}`);
            showNotification(`User wallet updated.`);
        }
    }, [users, updateUser, sendUserNotification, showNotification]);

    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
        const originalOrder = orders.find(o => o.id === orderId);
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                const updatedOrder = { ...order, status };
                if (status === 'Delivered') updatedOrder.deliveredDate = new Date();
                return updatedOrder;
            }
            return order;
        }));

        if (originalOrder) {
            const user = users.find(u => u.email === originalOrder.user.email);
            if (user && user.notificationPreferences?.orderStatus) sendUserNotification(user.id, `Your order #${orderId} has been updated to: ${status}.`);
        }
        
        if (originalOrder && status === 'Cancelled' && originalOrder.paymentApproved && originalOrder.paymentMethod !== 'Cash on Delivery' && originalOrder.status !== 'Delivered') {
             const user = users.find(u => u.email === originalOrder.user.email);
             if (user) {
                 await updateUserWallet(user.id, originalOrder.total, `Refund for cancelled order #${originalOrder.id}`);
                 showNotification(`Order #${orderId} cancelled. Amount of ₹${originalOrder.total.toFixed(2)} refunded to user's wallet.`);
                 return;
             }
        }
        showNotification(`Order #${orderId} status updated to ${status}.`);
    }, [orders, users, sendUserNotification, updateUserWallet, showNotification]);
    
    // ... Data Mutation Functions ...
    const addOrder = useCallback(async (newOrderData: Omit<Order, 'id' | 'date' | 'status'>) => {
        setOrders(prev => {
            const maxId = prev.reduce((max, order) => Math.max(max, parseInt(order.id, 10) || 0), 0);
            const newOrder: Order = { ...newOrderData, id: (maxId + 1).toString().padStart(5, '0'), date: new Date(), status: 'Pending', paymentApproved: newOrderData.paymentMethod === 'Cash on Delivery' || newOrderData.paymentMethod === 'Pay from Wallet' };
            return [newOrder, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime());
        });
        showNotification('Order placed successfully!');
    }, [showNotification]);
    
    const updateOrder = useCallback(async (updatedOrder: Order) => { setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)); showNotification(`Order #${updatedOrder.id} updated.`); }, [showNotification]);
    const approveOrderPayment = useCallback(async (orderId: string) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentApproved: true, status: 'Approved' } : o)); showNotification(`Payment for Order #${orderId} approved.`); }, [showNotification]);
    const cancelOrder = useCallback(async (orderId: string) => { setOrders(prev => prev.map(o => o.id === orderId && o.status === 'Pending' ? { ...o, status: 'Cancelled' } : o)); showNotification(`Order #${orderId} cancelled.`); }, [showNotification]);
    const viewProduct = useCallback((productId: number) => { setSelectedProductId(productId); setView('productDetail'); }, []);
    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'reviews' | 'isListed'>) => { setProducts(prev => [...prev, { ...productData, id: Math.max(...prev.map(p => p.id), 0) + 1, reviews: [], isListed: true }]); showNotification('Product added!'); }, [showNotification]);
    const updateProduct = useCallback(async (updatedProduct: Product) => {
        const oldProduct = products.find(p => p.id === updatedProduct.id);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        if (oldProduct && oldProduct.stock === 0 && updatedProduct.stock > 0) document.dispatchEvent(new CustomEvent('productBackInStock', { detail: { product: updatedProduct } }));
        showNotification('Product updated!');
    }, [showNotification, products]);
    const deleteProduct = useCallback(async (productId: number) => {
        if (orders.some(o => o.items.some(i => i.id === productId))) { setError("This product is part of an existing order and cannot be deleted."); return; }
        setProducts(prev => prev.filter(p => p.id !== productId)); showNotification('Product deleted.');
    }, [showNotification, orders, setError]);
    const addReview = useCallback(async (productId: number, reviewData: Omit<Review, 'id'|'date'|'response'|'responseDate'>) => { setProducts(prev => prev.map(p => p.id === productId ? { ...p, reviews: [{ ...reviewData, id: (p.reviews[0]?.id || 0) + 1, date: new Date() }, ...p.reviews] } : p)); showNotification('Review submitted!'); }, [showNotification]);
    const addReviewResponse = useCallback(async (productId: number, reviewId: number, response: string) => { setProducts(prev => prev.map(p => p.id === productId ? { ...p, reviews: p.reviews.map(r => r.id === reviewId ? { ...r, response, responseDate: new Date() } : r) } : p)); showNotification('Response posted.'); }, [showNotification]);
    const addDeliveryReview = useCallback(async (orderId: string, reviewData: Omit<DeliveryReview, 'date' | 'response' | 'responseDate'>) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryReview: { ...reviewData, date: new Date() } } : o)); showNotification('Delivery review posted!'); }, [showNotification]);
    const addDeliveryReviewResponse = useCallback(async (orderId: string, response: string) => { setOrders(prev => prev.map(o => o.id === orderId && o.deliveryReview ? { ...o, deliveryReview: { ...o.deliveryReview, response, responseDate: new Date() } } : o)); showNotification('Delivery review response posted.'); }, [showNotification]);
    const addInternalOrderNote = useCallback(async (orderId: string, note: string, author: string) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, internalNotes: [...(o.internalNotes || []), { note, author, date: new Date() }] } : o)); showNotification('Internal note added.'); }, [showNotification]);
    const updateUserKhata = useCallback(async (userId: number, hasCredit: boolean, creditLimit?: number, khataDueDate?: Date) => { const user = users.find(u => u.id === userId); if (user) { await updateUser({ id: userId, hasCredit, creditLimit, khataDueDate }); showNotification(`${user.name}'s Khata status updated.`); } }, [users, updateUser, showNotification]);
    const updatePaymentDetails = useCallback(async (details: PaymentDetailsConfig) => { setPaymentDetails(details); showNotification('Payment details updated!'); }, [showNotification]);
    const updateStoreInfo = useCallback(async (newInfo: StoreInfoConfig) => { setStoreInfo(newInfo); showNotification('Store information updated!'); }, [showNotification]);
    const addTicket = useCallback(async (ticketData: Pick<SupportTicket, 'userId' | 'userName' | 'subject' | 'messages'>) => { setTickets(prev => [{ ...ticketData, id: `ticket_${Date.now()}`, status: 'Open', createdAt: new Date(), updatedAt: new Date() }, ...prev]); showNotification('Support ticket created.'); }, [showNotification]);
    const addTicketMessage = useCallback(async (ticketId: string, message: SupportMessage) => { setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, message], updatedAt: new Date(), status: message.author === 'admin' ? t.status : 'In Progress' } : t)); showNotification('Message sent.'); }, [showNotification]);
    const updateTicketStatus = useCallback(async (ticketId: string, status: SupportTicketStatus) => { setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date() } : t)); showNotification('Ticket status updated.'); }, [showNotification]);
    const updateServiceablePincodes = useCallback(async (pincodes: string[]) => { setServiceablePincodes(pincodes); showNotification('Serviceable pincodes updated!'); }, [showNotification]);
    const addCategory = useCallback(async (category: string) => { if (category.trim()) setCategories(prev => prev.includes(category.trim()) ? prev : [...prev, category.trim()]); showNotification(`Category "${category}" added.`); }, [showNotification]);
    const deleteCategory = useCallback(async (cat: string) => { if (products.some(p => p.category === cat)) { showNotification(`Cannot delete "${cat}" as it is in use.`); return; } setCategories(prev => prev.filter(c => c !== cat)); showNotification(`Category "${cat}" deleted.`); }, [products, showNotification]);
    const addExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => { setExpenses(prev => [{ ...expenseData, id: `exp_${Date.now()}` }, ...prev].sort((a,b)=>b.date.getTime()-a.date.getTime())); showNotification('Expense recorded.'); }, [showNotification]);
    const updateExpense = useCallback(async (updated: Expense) => { setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e)); showNotification('Expense updated.'); }, [showNotification]);
    const deleteExpense = useCallback(async (id: string) => { setExpenses(prev => prev.filter(e => e.id !== id)); showNotification('Expense deleted.'); }, [showNotification]);
    const addCoupon = useCallback(async (data: Coupon) => { setCoupons(prev => [...prev, data]); showNotification(`Coupon "${data.code}" added.`); }, [showNotification]);
    const updateCoupon = useCallback(async (updated: Coupon) => { setCoupons(prev => prev.map(c => c.code === updated.code ? updated : c)); showNotification(`Coupon "${updated.code}" updated.`); }, [showNotification]);
    const deleteCoupon = useCallback(async (code: string) => { setCoupons(prev => prev.filter(c => c.code !== code)); showNotification(`Coupon "${code}" deleted.`); }, [showNotification]);
    const updateNotificationPreferences = useCallback(async (userId: number, preferences: User['notificationPreferences']) => { await updateUser({ id: userId, notificationPreferences: preferences }); showNotification('Notification preferences updated.'); }, [updateUser, showNotification]);
    const broadcastNotification = useCallback(async (message: string) => { 
        // Direct manipulation of users in store is not ideal but supported via this action for now
        // We really should add a bulk update action to the store if we want to be pure.
        // For now, let's iterate and update via updateUser loop or custom store action.
        // To keep it simple and working:
        const targets = users.filter(user => user.role === 'retailer' || user.role === 'wholesaler');
        targets.forEach(async (user) => {
             const newNotif: Notification = { id: `notif_${Date.now()}_${user.id}`, message, date: new Date(), read: false };
             const updatedNotifications = [newNotif, ...(user.notifications || [])];
             await updateStoreUser({ id: user.id, notifications: updatedNotifications });
        });
        showNotification('Broadcast sent.'); 
    }, [showNotification, users, updateStoreUser]);
    
    const subscribeToOutOfStock = useCallback(async (productId: number, user: User | null) => {
        if (!user) { showNotification('Please log in to subscribe.'); return; }
        if (user.outOfStockSubscriptions?.includes(productId)) { showNotification('You are already subscribed.'); return; }
        await updateUser({ id: user.id, outOfStockSubscriptions: [...(user.outOfStockSubscriptions || []), productId] });
        showNotification('Success! We will notify you when this item is back in stock.');
    }, [updateUser, showNotification]);

    const appContextValue = {
        // App State
        view, setView, notification, error, setError, selectedProductId, sessionPincode, setSessionPincode,
        // Data
        products, productsLoading, orders, users, paymentDetails, storeInfo, tickets, serviceablePincodes: currentServiceablePincodes, categories, expenses, coupons,
        // Auth
        currentUser, login, logout, signup,
        // Cart
        cartItems, addToCart, addMultipleToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount,
        // Wishlist
        wishlistItems, addToWishlist, removeFromWishlist, isInWishlist,
        // Functions
        showNotification, viewProduct, addOrder, updateOrder, approveOrderPayment, cancelOrder, addProduct, updateProduct, deleteProduct, addReview, addReviewResponse, addDeliveryReview, addDeliveryReviewResponse, addInternalOrderNote, updateUser, sendUserNotification, updateUserWallet, updateUserKhata, updatePaymentDetails, updateStoreInfo, addTicket, addTicketMessage, updateTicketStatus, updateServiceablePincodes, addCategory, deleteCategory, addExpense, updateExpense, deleteExpense, addCoupon, updateCoupon, deleteCoupon, updateNotificationPreferences, broadcastNotification, subscribeToOutOfStock, updateOrderStatus, setUsers: setUsers as any // Hack for types
    };

    return (
        <AppProvider value={appContextValue}>
            <AppContent />
        </AppProvider>
    );
};


// This component now just handles UI logic, receiving all state from context.
const AppContent: React.FC = () => {
    const { view, setView, products, productsLoading, tickets, storeInfo, setSessionPincode, error, setError, users, updateOrderStatus, orders, coupons, selectedProductId, notification, showNotification, currentUser } = useAppContext();
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedHindStore');
        if (!hasVisited) setShowTutorial(true);
    }, []);

    const handleTutorialFinish = () => {
        localStorage.setItem('hasVisitedHindStore', 'true');
        setShowTutorial(false);
    };

    useEffect(() => {
        const storedPincode = sessionStorage.getItem('sessionPincode');
        if (currentUser?.pincode) {
            setSessionPincode(currentUser.pincode);
            sessionStorage.setItem('sessionPincode', currentUser.pincode);
        } else if (storedPincode) {
            setSessionPincode(storedPincode);
        }
    }, [currentUser, setSessionPincode]);

    useEffect(() => {
        if (currentUser && typeof Notification !== 'undefined') {
            const hasBeenAsked = localStorage.getItem('notificationPermissionAsked');
            if (!hasBeenAsked && Notification.permission === 'default') {
                const timer = setTimeout(() => setShowNotificationModal(true), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentUser]);
    
    // EFFECT FOR HANDLING PROTECTED ROUTES
    useEffect(() => {
        const protectedViews: View[] = ['wishlist', 'orderHistory', 'myAccount', 'support'];
        const adminViews: View[] = ['admin'];

        if (protectedViews.includes(view) && !currentUser) {
            showNotification('Please log in to access this page.');
            setView('login');
        } else if (adminViews.includes(view) && currentUser && !(currentUser.role === 'admin' || currentUser.role === 'owner')) {
            showNotification('You do not have permission to access this page.');
            setView('home'); // Redirect non-admins from admin page
        }
    }, [view, currentUser, setView, showNotification]);

    // EFFECT FOR HANDLING PRODUCT DETAIL VIEW
    useEffect(() => {
        if (view === 'productDetail' && selectedProductId !== null) {
            const productExists = products.some(p => p.id === selectedProductId);
            if (!productExists && !productsLoading) {
                showNotification('Product not found. Returning to product list.');
                setView('products');
            }
        }
    }, [view, selectedProductId, products, productsLoading, setView, showNotification]);


    const handlePermissionRequest = async (allow: boolean) => {
        localStorage.setItem('notificationPermissionAsked', 'true');
        setShowNotificationModal(false);
        if (allow) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    showNotification('Great! You will now receive notifications.');
                    new Notification('Hind General Store', { body: 'You have successfully enabled notifications!', icon: '/favicon.ico' });
                } else {
                    showNotification('Notifications were not enabled. You can change this in your browser settings later.');
                }
            } catch (err) {
                console.error("Error requesting notification permission:", err);
                showNotification("Could not request notification permission.");
            }
        }
    };

    const renderView = () => {
        // Conditional rendering is now pure, side effects are handled in useEffect
        const isAuthRequired = ['wishlist', 'orderHistory', 'myAccount', 'support'].includes(view);
        const isAdminRequired = view === 'admin';

        if ((isAuthRequired && !currentUser) || (isAdminRequired && !(currentUser?.role === 'admin' || currentUser?.role === 'owner'))) {
            return null; // Render nothing while the useEffect handles the redirect
        }

        switch (view) {
            case 'products': return <ProductsView products={products} loading={productsLoading} />;
            case 'admin': return <AdminDashboardView orders={orders} users={users} updateOrderStatus={updateOrderStatus} coupons={coupons} />;
            case 'productDetail': {
                const product = products.find(p => p.id === selectedProductId);
                if (product) return <ProductDetailView product={product} allProducts={products} orders={orders} />;
                // If product not found yet, render nothing, useEffect will redirect
                return null;
            }
            case 'wishlist': return <WishlistView />;
            case 'orderHistory': return <OrderHistoryView orders={orders} />;
            case 'login': return <LoginView />;
            case 'signup': return <SignupView />;
            case 'myAccount': return <MyAccountView userOrders={orders.filter(o => o.user.email === currentUser?.email)} />;
            case 'contact': return <ContactView />;
            case 'help': return <HelpView />;
            case 'settings': return <SettingsView />;
            case 'notifications': return <NotificationsView />;
            case 'privacy': return <PrivacyPolicyView />;
            case 'terms': return <TermsOfServiceView />;
            case 'support': return <SupportView tickets={tickets.filter(t => t.userId === currentUser?.id)} />;
            case 'home': default: return <HomeView products={products} />;
        }
    };

    return (
        <div 
            className={`relative min-h-screen ${!storeInfo.backgroundImageUrl ? 'bg-light' : ''}`}
            style={storeInfo.backgroundImageUrl ? { backgroundImage: `url('${storeInfo.backgroundImageUrl}')`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' } : {}}
        >
            <Header onCartClick={() => setIsCartOpen(true)} onLocationClick={() => setIsLocationModalOpen(true)} />
            <main className="pt-20 pb-16"><div className="transition-opacity duration-500 ease-in-out">{renderView()}</div></main>
            <Footer />
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} orders={orders} />
            <FloatingContactButtons />
            {showTutorial && <TutorialOverlay onFinish={handleTutorialFinish} />}
            <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
            {notification && (
                <div className="fixed bottom-5 right-5 bg-primary text-white py-2 px-5 rounded-lg shadow-lg animate-fade-in-out z-50"><p>{notification}</p></div>
            )}
            {error && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white py-3 px-6 rounded-lg shadow-2xl z-[101] flex items-center gap-4 animate-fade-in-down">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="text-white/80 hover:text-white font-bold text-xl leading-none">&times;</button>
                </div>
            )}
             <NotificationPermissionModal isOpen={showNotificationModal} onClose={handlePermissionRequest} />
              <style>{`
                @keyframes fadeInDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
                .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
                @keyframes fade-in-out { 0%, 100% { opacity: 0; transform: translateY(10px); } 10%, 90% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-out { animation: fade-in-out 3s ease-in-out forwards; }
            `}</style>
        </div>
    );
};

export default App;