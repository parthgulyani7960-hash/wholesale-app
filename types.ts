import { ReactNode } from "react";

export interface Review {
    id: number;
    userName: string;
    rating: number; // 1-5
    comment: string;
    date: Date;
    response?: string;
    responseDate?: Date;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number; // Retailer price
    wholesalePrice: number; // Wholesaler price
    discountPrice?: number;
    discountPercentage?: number;
    imageUrls: string[];
    category: string;
    stock: number;
    reviews: Review[];
    tags?: ('New Arrival' | 'Best Seller' | 'On Sale' | 'Organic' | 'Local Favorite')[];
    isListed: boolean;
    reorderPoint?: number;
    maxOrderQuantity?: number;
}

export interface CartItem extends Product {
    quantity: number;
    priceAtTimeOfCart: number;
}

export type UserRole = 'retailer' | 'admin' | 'owner' | 'wholesaler';

export interface Notification {
    id: string;
    message: string;
    date: Date;
    read: boolean;
    link?: {
        view: View;
        params?: any;
    };
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string; // In a real app, this would be a hash
    role: UserRole;
    hasCredit?: boolean; // For Khata system
    creditLimit?: number;
    khataDueDate?: Date;
    walletBalance?: number;
    hasWallet?: boolean;
    mobile?: string;
    shopName?: string;
    address?: string;
    pincode?: string;
    notifications?: Notification[];
    notificationPreferences?: {
        orderStatus: boolean;
        promotions: boolean;
        newProducts: boolean;
    };
    outOfStockSubscriptions?: number[]; // Array of product IDs
}

export interface UserDetails {
    name: string;
    email: string;
    mobile: string;
    shopName: string;
    address: string;
    pincode: string;
}

export type View = 'home' | 'products' | 'admin' | 'productDetail' | 'wishlist' | 'login' | 'signup' | 'orderHistory' | 'myAccount' | 'contact' | 'help' | 'settings' | 'notifications' | 'privacy' | 'terms' | 'support';
export type OrderStatus = 'Pending' | 'Approved' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Rejected' | 'Cancelled';
export type PaymentMethod = 'Manual Transfer' | 'Cash on Delivery' | 'Pay on Khata' | 'Pay from Wallet';
export type DeliveryMethod = 'Home Delivery' | 'In-Store Pickup';

export interface DeliveryReview {
    rating: number;
    comment: string;
    date: Date;
    response?: string;
    responseDate?: Date;
}

export interface Order {
    id: string;
    user: UserDetails;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    date: Date;
    deliveredDate?: Date;
    paymentMethod: PaymentMethod;
    paymentScreenshot?: string; // Base64 encoded string
    deliveryMethod: DeliveryMethod;
    deliverySlot?: string; // e.g., "Tomorrow, 9 AM - 12 PM"
    deliveryReview?: DeliveryReview;
    internalNotes?: { note: string; author: string; date: Date }[];
    discountApplied?: number;
    couponApplied?: string;
    customerNotes?: string;
    deliveryFeeApplied?: number;
    paymentApproved?: boolean;
}

export interface PaymentDetailsConfig {
    upiId: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    qrCodeImage: string; // Base64 encoded string
}

export interface StoreInfoConfig {
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    hours: string;
    aboutUs: string;
    gstNumber: string;
    appVersion: string;
    googleMapsLink: string;
    backgroundImageUrl?: string;
    shippingScope: 'local' | 'nationwide';
    deliveryFee: number; // Local delivery fee
    nationwideShippingFee: number;
    freeDeliveryThreshold: number;
}

export type SupportTicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface SupportMessage {
    author: 'user' | 'admin';
    adminName?: string;
    text: string;
    date: Date;
}

export interface SupportTicket {
    id: string;
    userId: number;
    userName: string;
    subject: string;
    status: SupportTicketStatus;
    createdAt: Date;
    updatedAt: Date;
    messages: SupportMessage[];
}

export interface Coupon {
    code: string;
    type: 'fixed' | 'percentage';
    value: number; // The discount value
    minOrderValue?: number;
    isActive: boolean;
    userId?: number; // If present, coupon is specific to this user
}

export type ExpenseCategory = 'Stock Purchase' | 'Rent' | 'Utilities' | 'Salaries' | 'Marketing' | 'Miscellaneous';

export interface Expense {
    id: string;
    date: Date;
    description: string;
    amount: number;
    category: ExpenseCategory;
}