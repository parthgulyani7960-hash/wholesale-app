
import React, { createContext, useContext } from 'react';
import { Order, Product, Review, DeliveryReview, User, PaymentDetailsConfig, StoreInfoConfig, SupportTicket, SupportTicketStatus, SupportMessage, Expense, Coupon, OrderStatus, Notification, CartItem } from '../types';
import type { View } from '../types';

export type { View };

export interface AppContextType {
    // App State
    view: View;
    setView: (view: View) => void;
    notification: string | null;
    error: string | null;
    setError: (message: string | null) => void;
    selectedProductId: number | null;
    sessionPincode: string | null;
    setSessionPincode: (pincode: string | null) => void;
    showNotification: (message: string) => void;
    
    // Data State
    products: Product[];
    productsLoading: boolean;
    orders: Order[];
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    paymentDetails: PaymentDetailsConfig;
    storeInfo: StoreInfoConfig;
    tickets: SupportTicket[];
    serviceablePincodes: string[];
    categories: string[];
    expenses: Expense[];
    coupons: Coupon[];

    // Auth State & Functions
    currentUser: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    signup: (name: string, email: string, password: string) => boolean;

    // Cart State & Functions
    cartItems: CartItem[];
    addToCart: (item: Product, quantity: number) => void;
    addMultipleToCart: (items: CartItem[]) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;

    // Wishlist State & Functions
    wishlistItems: Product[];
    addToWishlist: (item: Product) => void;
    removeFromWishlist: (itemId: number) => void;
    isInWishlist: (itemId: number) => boolean;
    
    // Data Mutation Functions
    viewProduct: (productId: number) => void;
    addOrder: (newOrder: Omit<Order, 'id' | 'date' | 'status'>) => Promise<void>;
    updateOrder: (updatedOrder: Order) => Promise<void>;
    approveOrderPayment: (orderId: string) => Promise<void>;
    cancelOrder: (orderId: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    addProduct: (product: Omit<Product, 'id' | 'reviews' | 'isListed'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: number) => Promise<void>;
    addReview: (productId: number, review: Omit<Review, 'id' | 'date' | 'response' | 'responseDate'>) => Promise<void>;
    addReviewResponse: (productId: number, reviewId: number, response: string) => Promise<void>;
    addDeliveryReview: (orderId: string, review: Omit<DeliveryReview, 'date' | 'response' | 'responseDate'>) => Promise<void>;
    addDeliveryReviewResponse: (orderId: string, response: string) => Promise<void>;
    addInternalOrderNote: (orderId: string, note: string, author: string) => Promise<void>;
    updateUser: (updatedUserData: Partial<User> & { id: number }) => Promise<void>;
    sendUserNotification: (userId: number, message: string, link?: Notification['link']) => Promise<void>;
    updateUserWallet: (userId: number, amount: number, reason: string) => Promise<void>;
    updateUserKhata: (userId: number, hasCredit: boolean, creditLimit?: number, khataDueDate?: Date) => Promise<void>;
    updatePaymentDetails: (details: PaymentDetailsConfig) => Promise<void>;
    updateStoreInfo: (newInfo: StoreInfoConfig) => Promise<void>;
    addTicket: (ticketData: Pick<SupportTicket, 'userId' | 'userName' | 'subject' | 'messages'>) => Promise<void>;
    addTicketMessage: (ticketId: string, message: SupportMessage) => Promise<void>;
    updateTicketStatus: (ticketId: string, status: SupportTicketStatus) => Promise<void>;
    updateServiceablePincodes: (pincodes: string[]) => Promise<void>;
    addCategory: (category: string) => Promise<void>;
    deleteCategory: (category: string) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    updateExpense: (updatedExpense: Expense) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    addCoupon: (couponData: Coupon) => Promise<void>;
    updateCoupon: (updatedCoupon: Coupon) => Promise<void>;
    deleteCoupon: (couponCode: string) => Promise<void>;
    updateNotificationPreferences: (userId: number, preferences: User['notificationPreferences']) => Promise<void>;
    broadcastNotification: (message: string) => Promise<void>;
    subscribeToOutOfStock: (productId: number, currentUser: User | null) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = AppContext.Provider;

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider. This is a critical error in the app structure.');
    }
    return context;
};
