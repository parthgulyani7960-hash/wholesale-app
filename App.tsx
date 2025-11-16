import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppProvider, View, useAppContext } from './context/AppContext';
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
import { initialProducts, initialOrders, initialPaymentDetails, serviceablePincodes as initialServiceablePincodes, initialStoreInfo, initialSupportTickets, initialExpenses, initialCoupons, initialUsers } from './constants';
import { Product, Order, User, PaymentDetailsConfig, StoreInfoConfig, SupportTicket, Expense, Coupon, CartItem, OrderStatus, Review, DeliveryReview, Notification } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import TutorialOverlay from './components/TutorialOverlay';
import FloatingContactButtons from './components/FloatingContactButtons';
import LocationModal from './components/PincodeValidatorModal';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import ErrorBoundary from './components/ErrorBoundary';

const getInitialCart = (): CartItem[] => {
    try {
        const item = window.localStorage.getItem('hindStoreCart');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error('Error reading from localStorage', error);
        return [];
    }
};

const App: React.FC = () => {
    // --- UNIFIED STATE MANAGEMENT ---
    // App State
    const [view, setView] = useState<View>('home');
    const [notification, setNotification] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [sessionPincode, setSessionPincode] = useState<string | null>(null);
    
    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsConfig>(initialPaymentDetails);
    const [storeInfo, setStoreInfo] = useState<StoreInfoConfig>(initialStoreInfo);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [currentServiceablePincodes, setServiceablePincodes] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

    // Auth State
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Cart State
    const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart);

    // Wishlist State
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    
    // --- GENERIC FUNCTIONS & EFFECTS ---
    const showNotification = useCallback((message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    }, []);
    
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
            setUsers(initialUsers);
            setProductsLoading(false);
        };
        loadInitialData();
    }, []);

    // --- AUTH LOGIC (MOVED FROM AUTHCONTEXT) ---
    useEffect(() => {
        try {
            const userIdStr = localStorage.getItem('hindStoreUserId');
            if (userIdStr) {
                const userId = parseInt(userIdStr, 10);
                const userFromStorage = users.find(u => u.id === userId);
                if (userFromStorage) {
                    setCurrentUser(userFromStorage);
                } else {
                     localStorage.removeItem('hindStoreUserId');
                }
            }
        } catch (err) {
            console.error("Error loading user from storage:", err);
            localStorage.removeItem('hindStoreUserId');
        }
    }, [users]); // Depends on users being loaded

    const login = useCallback((email: string, password: string): boolean => {
        const user = users.find(u => (u.email.toLowerCase() === email.toLowerCase() || (u.role === 'owner' && u.email === 'HINDGENERALSTORE' && email === 'HINDGENERALSTORE')) && u.password === password);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('hindStoreUserId', user.id.toString());
            showNotification(`Welcome back, ${user.name}!`);
            return true;
        }
        showNotification('Invalid email or password.');
        return false;
    }, [users, showNotification]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem('hindStoreUserId');
        sessionStorage.removeItem('sessionPincode');
        setSessionPincode(null);
        showNotification('You have been logged out.');
    }, [showNotification]);

    const signup = useCallback((name: string, email: string, password: string): boolean => {
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            showNotification(`An account with the email '${email}' already exists.`);
            return false;
        }
        const newUser: User = { id: Math.max(...users.map(u => u.id), 0) + 1, name, email, password, role: 'retailer', notificationPreferences: { orderStatus: true, promotions: true, newProducts: true } as any };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        localStorage.setItem('hindStoreUserId', newUser.id.toString());
        showNotification(`Welcome, ${name}! Your account has been created.`);
        return true;
    }, [users, setUsers, showNotification]);
    
    // --- CART LOGIC (MOVED FROM CARTCONTEXT) ---
    useEffect(() => {
        try {
            window.localStorage.setItem('hindStoreCart', JSON.stringify(cartItems));
        } catch (err) {
            console.error('Error writing to localStorage', err);
        }
    }, [cartItems]);

    const addToCart = useCallback((product: Product, quantity: number) => {
        if (quantity <= 0) return;
        const maxAllowed = product.maxOrderQuantity || Infinity;
        const priceAtTimeOfCart = currentUser?.role === 'wholesaler' ? (product as any).wholesalePrice : (product.discountPrice ?? product.price);
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                const newQuantity = Math.min(existingItem.quantity + quantity, product.stock, maxAllowed);
                const quantityAdded = newQuantity - existingItem.quantity;
                if (quantityAdded > 0) showNotification(`${quantityAdded} x ${product.name} added to cart.`);
                else if (product.stock <= existingItem.quantity) showNotification(`No more stock available for ${product.name}.`);
                else showNotification(`Cannot add more. Quantity limit of ${maxAllowed} reached for ${product.name}.`);
                return prevItems.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item);
            }
            const newQuantity = Math.min(quantity, product.stock, maxAllowed);
            showNotification(`${newQuantity} x ${product.name} added to cart!`);
            return [...prevItems, { ...product, quantity: newQuantity, priceAtTimeOfCart } as CartItem];
        });
    }, [showNotification, currentUser]);

    const addMultipleToCart = useCallback((itemsToAdd: CartItem[]) => {
        setCartItems(prevItems => {
            const newItems = [...prevItems];
            itemsToAdd.forEach(itemToAdd => {
                 const priceAtTimeOfCart = currentUser?.role === 'wholesaler' ? (itemToAdd as any).wholesalePrice : (itemToAdd.discountPrice ?? itemToAdd.price);
                const existingItemIndex = newItems.findIndex(item => item.id === itemToAdd.id);
                if (existingItemIndex > -1) newItems[existingItemIndex].quantity += itemToAdd.quantity;
                else newItems.push({ ...itemToAdd, priceAtTimeOfCart } as CartItem);
            });
            return newItems;
        });
        showNotification('Items from your past order have been added to the cart!');
    }, [currentUser, showNotification]);

    const removeFromCart = useCallback((itemId: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        showNotification(`Item removed from cart.`);
    }, [showNotification]);

    const updateQuantity = useCallback((itemId: number, quantity: number) => {
        if (quantity <= 0) removeFromCart(itemId);
        else {
            setCartItems(prevItems => prevItems.map(item => {
                if (item.id === itemId) {
                    const maxAllowed = item.maxOrderQuantity || Infinity;
                    const newQuantity = Math.min(quantity, item.stock, maxAllowed);
                    if (quantity > newQuantity) showNotification(`Quantity limit (${maxAllowed}) or stock limit reached.`);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }));
        }
    }, [removeFromCart, showNotification]);

    const clearCart = useCallback(() => setCartItems([]), []);
    const cartTotal = useMemo(() => cartItems.reduce((total, item) => total + (item.priceAtTimeOfCart ?? 0) * item.quantity, 0), [cartItems]);
    const itemCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);

    // --- WISHLIST LOGIC (MOVED FROM WISHLISTCONTEXT) ---
    const isInWishlist = useCallback((itemId: number) => wishlistItems.some(item => item.id === itemId), [wishlistItems]);
    const addToWishlist = useCallback((product: Product) => {
        setWishlistItems(prevItems => {
            if (prevItems.find(item => item.id === product.id)) return prevItems;
            return [...prevItems, product];
        });
        showNotification(`${product.name} added to wishlist!`);
    }, [showNotification]);
    const removeFromWishlist = useCallback((itemId: number) => {
        const itemToRemove = wishlistItems.find(item => item.id === itemId);
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
        if (itemToRemove) showNotification(`${itemToRemove.name} removed from wishlist.`);
    }, [showNotification, wishlistItems]);

    // --- DATA MUTATION FUNCTIONS (from original App component) ---
    const updateUser = useCallback(async (updatedUserData: Partial<User> & { id: number }) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        setUsers(prevUsers => prevUsers.map(user => user.id === updatedUserData.id ? { ...user, ...updatedUserData } : user));
    }, []);

    const sendUserNotification = useCallback(async (userId: number, message: string, link?: Notification['link']) => {
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id === userId) {
                const newNotif: Notification = { id: `notif_${Date.now()}_${user.id}`, message, date: new Date(), read: false, link };
                return { ...user, notifications: [newNotif, ...(user.notifications || [])] };
            }
            return user;
        }));
    }, []);
    
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
    
    // ... other functions preserved (addOrder, updateOrder, approveOrderPayment, cancelOrder, addProduct, updateProduct, deleteProduct, etc.)
    const addOrder = useCallback(async (newOrderData: any) => {
        setOrders(prev => {
            const maxId = prev.reduce((max, order) => Math.max(max, parseInt(order.id, 10) || 0), 0);
            const newOrder: Order = { ...newOrderData, id: (maxId + 1).toString().padStart(5, '0'), date: new Date(), status: 'Pending', paymentApproved: newOrderData.paymentMethod === 'Cash on Delivery' ? false : !!newOrderData.paymentApproved };
            return [newOrder, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime());
        });
        showNotification('Order placed successfully!');
    }, [showNotification]);
    const updateOrder = useCallback(async (updatedOrder: Order) => { setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)); showNotification(`Order #${updatedOrder.id} updated.`); }, [showNotification]);
    const approveOrderPayment = useCallback(async (orderId: string) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentApproved: true, status: 'Approved' } : o)); showNotification('Payment approved.'); }, [showNotification]);
    const cancelOrder = useCallback(async (orderId: string) => { setOrders(prev => prev.map(o => o.id === orderId && o.status === 'Pending' ? { ...o, status: 'Cancelled' } : o)); showNotification('Order cancelled.'); }, [showNotification]);
    const viewProduct = useCallback((productId: number) => { setSelectedProductId(productId); setView('productDetail'); }, []);
    const addProduct = useCallback(async (productData: any) => { setProducts(prev => [...prev, { ...productData, id: Math.max(...prev.map(p => p.id), 0) + 1 }]); showNotification('Product added.'); }, [showNotification]);
    const updateProduct = useCallback(async (updatedProduct: Product) => {
        const oldProduct = products.find(p => p.id === updatedProduct.id);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        if (oldProduct && oldProduct.stock === 0 && updatedProduct.stock > 0) document.dispatchEvent(new CustomEvent('productBackInStock', { detail: { product: updatedProduct } }));
        showNotification('Product updated!');
    }, [showNotification, products]);
    const deleteProduct = useCallback(async (productId: number) => {
        if (orders.some(o => o.items.some((i: any) => i.id === productId))) { setError("This product is part of an existing order and cannot be deleted."); return; }
        setProducts(prev => prev.filter(p => p.id !== productId)); showNotification('Product deleted.');
    }, [showNotification, orders, setError]);

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
        showNotification, viewProduct, addOrder, updateOrder, approveOrderPayment, cancelOrder, addProduct, updateProduct, deleteProduct, updateUser, sendUserNotification, updateUserWallet, updateOrderStatus,
    };

    return (
        <AppProvider value={appContextValue}>
            <ErrorBoundary>
                <AppContent />
            </ErrorBoundary>
        </AppProvider>
    );
};

// This component now just handles UI logic, receiving all state from context.
const AppContent: React.FC = () => {
    // FIX: include all context values used in this component so they are defined
    const {
        view, setView, products, productsLoading, tickets, storeInfo, setSessionPincode, error, setError,
        users, updateOrderStatus, orders, coupons, selectedProductId, notification, showNotification, currentUser,
    } = useAppContext();

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
        if ((currentUser as any)?.pincode) {
            setSessionPincode((currentUser as any).pincode);
            sessionStorage.setItem('sessionPincode', (currentUser as any).pincode);
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
    
    const handlePermissionRequest = async (allow: boolean) => {
        localStorage.setItem('notificationPermissionAsked', 'true');
        setShowNotificationModal(false);
        if (allow) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    showNotification('Great! You will now receive notifications.');
                    // eslint-disable-next-line no-new
                    new Notification('Hind General Store', { body: 'You have successfully enabled notifications!', icon: '/favicon.ico' } as any);
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
        switch (view) {
            case 'products': return <ProductsView products={products} loading={productsLoading} />;
            case 'admin':
                 if (currentUser?.role === 'admin' || currentUser?.role === 'owner') return <AdminDashboardView orders={orders} users={users} updateOrderStatus={updateOrderStatus} coupons={coupons} />;
                showNotification('You must be an admin to access this page.'); setView('login'); return <LoginView />;
            case 'productDetail': {
                const product = products.find(p => p.id === selectedProductId);
                if (product) return <ProductDetailView product={product} allProducts={products} orders={orders} />;
                setView('products'); return <ProductsView products={products} loading={productsLoading} />;
            }
            case 'wishlist':
                if (currentUser) return <WishlistView />;
                showNotification('Please log in to see your wishlist.'); setView('login'); return <LoginView />;
            case 'orderHistory':
                if (currentUser) return <OrderHistoryView orders={orders} />;
                showNotification('Please log in to see your order history.'); setView('login'); return <LoginView />;
            case 'login': return <LoginView />;
            case 'signup': return <SignupView />;
            case 'myAccount':
                if (currentUser) return <MyAccountView userOrders={orders.filter(o => o.user.email === currentUser.email)} />;
                showNotification('Please log in to see your account.'); setView('login'); return <LoginView />;
            case 'contact': return <ContactView />;
            case 'help': return <HelpView />;
            case 'settings': return <SettingsView />;
            case 'notifications': return <NotificationsView />;
            case 'privacy': return <PrivacyPolicyView />;
            case 'terms': return <TermsOfServiceView />;
            case 'support':
                if (currentUser) return <SupportView tickets={tickets.filter(t => t.userId === currentUser.id)} />;
                 showNotification('Please log in to access support.'); setView('login'); return <LoginView />;
            case 'home': default: return <HomeView products={products} />;
        }
    };

    return (
        <div 
            className={`relative min-h-screen ${!storeInfo.backgroundImageUrl ? 'bg-light' : ''}`}
            style={storeInfo.backgroundImageUrl ? { backgroundImage: `url('${storeInfo.backgroundImageUrl}')`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' } : undefined}
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
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
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