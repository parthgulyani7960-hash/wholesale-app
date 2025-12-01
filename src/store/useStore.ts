import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Product, CartItem, Notification, UserRole } from '../types';
import { initialUsers } from '../constants';

interface StoreState {
    // --- Auth State ---
    users: User[];
    currentUser: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    signup: (name: string, email: string, password: string) => boolean;
    updateUser: (updatedUserData: Partial<User> & { id: number }) => Promise<void>;
    
    // --- Cart State ---
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    addMultipleToCart: (items: CartItem[]) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    
    // --- Wishlist State ---
    wishlistItems: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (itemId: number) => void;
    isInWishlist: (itemId: number) => boolean;

    // --- Notification/UI State ---
    notification: string | null;
    showNotification: (message: string) => void;
    
    // --- Helpers (Getters) ---
    getCartTotal: () => number;
    getItemCount: () => number;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            // --- Initial Data ---
            users: initialUsers,
            currentUser: null,
            cartItems: [],
            wishlistItems: [],
            notification: null,

            // --- Notifications ---
            showNotification: (message: string) => {
                set({ notification: message });
                setTimeout(() => set({ notification: null }), 3000);
            },

            // --- Auth Logic ---
            login: (email: string, password: string) => {
                const { users } = get();
                const user = users.find(u => 
                    (u.email.toLowerCase() === email.toLowerCase() || 
                    (u.role === 'owner' && u.email === 'HINDGENERALSTORE' && email === 'HINDGENERALSTORE')) && 
                    u.password === password
                );

                if (user) {
                    set({ currentUser: user });
                    get().showNotification(`Welcome back, ${user.name}!`);
                    return true;
                }
                get().showNotification('Invalid email or password.');
                return false;
            },

            logout: () => {
                set({ currentUser: null });
                sessionStorage.removeItem('sessionPincode');
                get().showNotification('You have been logged out.');
            },

            signup: (name: string, email: string, password: string) => {
                const { users } = get();
                const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (existingUser) {
                    get().showNotification(`An account with the email '${email}' already exists.`);
                    return false;
                }
                
                const newUser: User = { 
                    id: Math.max(...users.map(u => u.id), 0) + 1, 
                    name, 
                    email, 
                    password, 
                    role: 'retailer', 
                    notificationPreferences: { orderStatus: true, promotions: true, newProducts: true }, 
                    notifications: [] 
                };
                
                set({ 
                    users: [...users, newUser],
                    currentUser: newUser 
                });
                get().showNotification(`Welcome, ${name}! Your account has been created.`);
                return true;
            },

            updateUser: async (updatedUserData: Partial<User> & { id: number }) => {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 400));
                
                set((state) => {
                    const updatedUsers = state.users.map(user => 
                        user.id === updatedUserData.id ? { ...user, ...updatedUserData } : user
                    );
                    
                    // Also update currentUser if it's the one being modified
                    const updatedCurrentUser = state.currentUser && state.currentUser.id === updatedUserData.id 
                        ? { ...state.currentUser, ...updatedUserData } 
                        : state.currentUser;

                    return { users: updatedUsers, currentUser: updatedCurrentUser };
                });
            },

            // --- Cart Logic ---
            addToCart: (product: Product, quantity: number) => {
                if (quantity <= 0) return;
                
                const { cartItems, currentUser } = get();
                const maxAllowed = product.maxOrderQuantity || Infinity;
                
                // Determine price based on user role
                const priceAtTimeOfCart = currentUser?.role === 'wholesaler' 
                    ? product.wholesalePrice 
                    : (product.discountPrice ?? product.price);

                const existingItem = cartItems.find(item => item.id === product.id);

                if (existingItem) {
                    const newQuantity = Math.min(existingItem.quantity + quantity, product.stock, maxAllowed);
                    const quantityAdded = newQuantity - existingItem.quantity;
                    
                    if (quantityAdded > 0) get().showNotification(`${quantityAdded} x ${product.name} added to cart.`);
                    else if (product.stock <= existingItem.quantity) get().showNotification(`No more stock available for ${product.name}.`);
                    else get().showNotification(`Cannot add more. Quantity limit of ${maxAllowed} reached for ${product.name}.`);
                    
                    set({
                        cartItems: cartItems.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item)
                    });
                } else {
                    const newQuantity = Math.min(quantity, product.stock, maxAllowed);
                    get().showNotification(`${newQuantity} x ${product.name} added to cart!`);
                    
                    set({
                        cartItems: [...cartItems, { ...product, quantity: newQuantity, priceAtTimeOfCart }]
                    });
                }
            },

            addMultipleToCart: (itemsToAdd: CartItem[]) => {
                const { cartItems, currentUser } = get();
                const newItems = [...cartItems];
                
                itemsToAdd.forEach(itemToAdd => {
                    const priceAtTimeOfCart = currentUser?.role === 'wholesaler' 
                        ? itemToAdd.wholesalePrice 
                        : (itemToAdd.discountPrice ?? itemToAdd.price);
                        
                    const existingItemIndex = newItems.findIndex(item => item.id === itemToAdd.id);
                    
                    if (existingItemIndex > -1) {
                        newItems[existingItemIndex].quantity += itemToAdd.quantity;
                    } else {
                        newItems.push({ ...itemToAdd, priceAtTimeOfCart });
                    }
                });
                
                set({ cartItems: newItems });
                get().showNotification('Items from your past order have been added to the cart!');
            },

            removeFromCart: (itemId: number) => {
                set((state) => ({
                    cartItems: state.cartItems.filter(item => item.id !== itemId)
                }));
                get().showNotification(`Item removed from cart.`);
            },

            updateQuantity: (itemId: number, quantity: number) => {
                if (quantity <= 0) {
                    get().removeFromCart(itemId);
                    return;
                }

                set((state) => ({
                    cartItems: state.cartItems.map(item => {
                        if (item.id === itemId) {
                            const maxAllowed = item.maxOrderQuantity || Infinity;
                            const newQuantity = Math.min(quantity, item.stock, maxAllowed);
                            
                            if (quantity > newQuantity) {
                                get().showNotification(`Quantity limit (${maxAllowed}) or stock limit reached.`);
                            }
                            return { ...item, quantity: newQuantity };
                        }
                        return item;
                    })
                }));
            },

            clearCart: () => set({ cartItems: [] }),

            getCartTotal: () => {
                const { cartItems } = get();
                return cartItems.reduce((total, item) => total + item.priceAtTimeOfCart * item.quantity, 0);
            },

            getItemCount: () => {
                const { cartItems } = get();
                return cartItems.reduce((count, item) => count + item.quantity, 0);
            },

            // --- Wishlist Logic ---
            addToWishlist: (product: Product) => {
                const { wishlistItems } = get();
                if (wishlistItems.find(item => item.id === product.id)) return;
                
                set({ wishlistItems: [...wishlistItems, product] });
                get().showNotification(`${product.name} added to wishlist!`);
            },

            removeFromWishlist: (itemId: number) => {
                const { wishlistItems } = get();
                const itemToRemove = wishlistItems.find(item => item.id === itemId);
                
                set({ wishlistItems: wishlistItems.filter(item => item.id !== itemId) });
                if (itemToRemove) get().showNotification(`${itemToRemove.name} removed from wishlist.`);
            },

            isInWishlist: (itemId: number) => {
                const { wishlistItems } = get();
                return wishlistItems.some(item => item.id === itemId);
            }
        }),
        {
            name: 'hind-store-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({ 
                // Only persist these fields
                cartItems: state.cartItems, 
                wishlistItems: state.wishlistItems, 
                users: state.users,
                currentUser: state.currentUser
            }),
        }
    )
);