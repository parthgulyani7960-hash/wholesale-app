import { Product, Order, User, PaymentDetailsConfig, StoreInfoConfig, Coupon, SupportTicket, Expense } from './types';

export const initialStoreInfo: StoreInfoConfig = {
    name: "Hind General Store",
    address: "123 Kirana Lane, Nayagaon, NG 45678",
    phone: "1234567890", // Just numbers for tel: link
    whatsapp: "1234567890", // International format without + or spaces
    hours: "Mon - Sat: 9 AM - 8 PM | Sun: 11 AM - 6 PM",
    aboutUs: "Welcome to Hind General Store, your neighborhood stop for daily essentials and quality goods. We are passionate about providing a wide range of products with the convenience of local delivery. From groceries to household items, we curate our collection with care. Our mission is to be more than just a store; we aim to be a cornerstone of the community, offering friendly service and reliable delivery.",
    gstNumber: "22AAAAA0000A1Z5",
    appVersion: "1.5.0",
    googleMapsLink: "https://maps.app.goo.gl/AzE7st2TDUskJLfE7", // Default location, can be updated by admin
    backgroundImageUrl: "",
    shippingScope: 'local',
    deliveryFee: 40,
    nationwideShippingFee: 150,
    freeDeliveryThreshold: 500,
};

export const serviceablePincodes: string[] = ["45678", "45679", "45680"];

export const initialPaymentDetails: PaymentDetailsConfig = {
    upiId: "storename@upi",
    accountHolderName: "Hind General Store",
    accountNumber: "123456789012",
    ifscCode: "BANK0001234",
    qrCodeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVASURBVHhe7dJBDQAgDAAxLGD9N3y4wMkBbjh3HREgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARiAhEBCICEYGIQEQgIhARyF8AASiA2sRmmAAAAABJRU5ErkJggg==", // Placeholder QR code
};

export const initialProducts: Product[] = [
    {
        id: 1,
        name: 'Aashirvaad Atta',
        description: '10kg bag of whole wheat flour, perfect for soft rotis and chapatis.',
        price: 450.00,
        wholesalePrice: 420.00,
        discountPrice: 399.99,
        imageUrls: ['https://picsum.photos/seed/atta/600/600'],
        category: 'Groceries',
        stock: 50,
        isListed: true,
        tags: ['On Sale', 'Best Seller'],
        reviews: [],
        reorderPoint: 10,
        maxOrderQuantity: 5,
    },
    {
        id: 2,
        name: 'Saffola Gold Oil',
        description: '5L can of blended cooking oil, good for heart health.',
        price: 850.00,
        wholesalePrice: 810.00,
        imageUrls: ['https://picsum.photos/seed/oil/600/600'],
        category: 'Groceries',
        stock: 4,
        isListed: true,
        tags: ['Local Favorite', 'On Sale'],
        reviews: [],
        reorderPoint: 5,
        maxOrderQuantity: 2,
    },
    {
        id: 3,
        name: 'Tata Salt',
        description: '1kg packet of iodized salt. Desh ka Namak.',
        price: 25.00,
        wholesalePrice: 22.00,
        imageUrls: ['https://picsum.photos/seed/salt/600/600'],
        category: 'Groceries',
        stock: 150,
        isListed: true,
        reviews: [],
        reorderPoint: 25,
        maxOrderQuantity: 10,
    },
    {
        id: 4,
        name: 'Surf Excel Detergent',
        description: '2kg box of easy wash detergent powder. Removes tough stains.',
        price: 280.00,
        wholesalePrice: 265.00,
        imageUrls: ['https://picsum.photos/seed/surf/600/600'],
        category: 'Household',
        stock: 40,
        isListed: true,
        tags: ['Best Seller', 'On Sale'],
        reviews: [],
        reorderPoint: 15,
    },
    {
        id: 5,
        name: 'Dove Soap',
        description: 'Pack of 3 moisturizing bathing bars. 100g each.',
        price: 150.00,
        wholesalePrice: 135.00,
        imageUrls: ['https://picsum.photos/seed/soap/600/600'],
        category: 'Personal Care',
        stock: 80,
        isListed: true,
        tags: ['Organic', 'On Sale'],
        reviews: [],
    },
    {
        id: 6,
        name: 'Parle-G Biscuits',
        description: 'Large family pack of the classic glucose biscuits.',
        price: 70.00,
        wholesalePrice: 65.00,
        imageUrls: ['https://picsum.photos/seed/biscuit/600/600'],
        category: 'Snacks',
        stock: 0,
        isListed: true,
        reviews: [],
    },
     {
        id: 7,
        name: 'Amul Butter',
        description: '500g pack of delicious pasteurized butter.',
        price: 250.00,
        wholesalePrice: 240.00,
        imageUrls: ['https://picsum.photos/seed/butter/600/600'],
        category: 'Dairy',
        stock: 18,
        isListed: true,
        tags: ['New Arrival'],
        reviews: [],
        reorderPoint: 10,
    },
    {
        id: 8,
        name: 'Basmati Rice',
        description: '5kg bag of premium, long-grain Basmati rice.',
        price: 600.00,
        wholesalePrice: 570.00,
        imageUrls: ['https://picsum.photos/seed/rice/600/600'],
        category: 'Groceries',
        stock: 22,
        isListed: true,
        tags: ['Local Favorite'],
        reviews: [
             { id: 1, userName: 'Ramesh', rating: 5, comment: 'Excellent quality rice!', date: new Date(new Date().getTime() - 86400000 * 2) }
        ],
    },
];

const mockOrderItems = (products: Product[], quantities: number[]): { items: any[], total: number } => {
    const items = products.map((p, i) => ({ ...p, quantity: quantities[i], priceAtTimeOfCart: p.price }));
    const total = items.reduce((sum, item) => sum + item.priceAtTimeOfCart * item.quantity, 0);
    return { items, total };
};


export const initialOrders: Order[] = [
     {
        id: '00001',
        user: { name: 'Alice Johnson', email: 'alice@example.com', mobile: '123-456-7890', shopName: 'The Book Nook', address: '123 Reading Ln, Bookville', pincode: '45678' },
        ...mockOrderItems([initialProducts[7], initialProducts[0]], [1, 2]),
        status: 'Approved',
        date: new Date(new Date().getTime() - 86400000 * 6),
        paymentMethod: 'Manual Transfer',
        deliveryMethod: 'Home Delivery',
        deliverySlot: 'Tomorrow, 9 AM - 12 PM',
        couponApplied: 'WELCOME10',
    },
    {
        id: '00002',
        user: { name: 'Wholesaler One', email: 'wholesaler@example.com', mobile: '555-555-5555', shopName: 'My Shop', address: '789 My Street, My Town', pincode: '45680' },
        ...mockOrderItems([initialProducts[3], initialProducts[0], initialProducts[4]], [10, 5, 20]),
        status: 'Packed',
        date: new Date(new Date().getTime() - 86400000 * 5),
        paymentMethod: 'Pay on Khata',
        deliveryMethod: 'Home Delivery',
        deliverySlot: 'Today, 9 AM - 12 PM',
    },
    {
        id: '00003',
        user: { name: 'Alice Johnson', email: 'alice@example.com', mobile: '123-456-7890', shopName: 'The Book Nook', address: '123 Reading Ln, Bookville', pincode: '45678' },
        ...mockOrderItems([initialProducts[0], initialProducts[2]], [1, 5]),
        status: 'Delivered',
        date: new Date(new Date().getTime() - 86400000 * 3),
        deliveredDate: new Date(new Date().getTime() - 86400000 * 2),
        paymentMethod: 'Manual Transfer',
        deliveryMethod: 'Home Delivery',
        deliverySlot: 'Yesterday, 1 PM - 4 PM',
        deliveryReview: {
            rating: 5,
            comment: 'Delivery was super fast and the driver was very friendly!',
            date: new Date(new Date().getTime() - 86400000 * 2),
            response: 'Thanks, Alice! We appreciate your kind words.',
            responseDate: new Date(new Date().getTime() - 86400000 * 1)
        },
        customerNotes: 'Please ring the bell twice.'
    },
    {
        id: '00004',
        user: { name: 'Bob Smith', email: 'bob@example.com', mobile: '098-765-4321', shopName: 'Smith\'s Stationery', address: '456 Paper St, Writerstown', pincode: '45679' },
        ...mockOrderItems([initialProducts[1]], [2]),
        status: 'Pending',
        date: new Date(new Date().getTime() - 86400000 * 1),
        paymentMethod: 'Manual Transfer',
        paymentScreenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        deliveryMethod: 'In-Store Pickup',
        internalNotes: [
            { note: 'Customer called, confirmed pickup for tomorrow afternoon.', author: 'Store Owner', date: new Date() }
        ]
    },
    {
        id: '00005',
        user: { name: 'Bob Smith', email: 'bob@example.com', mobile: '098-765-4321', shopName: 'Smith\'s Stationery', address: '456 Paper St, Writerstown', pincode: '45679' },
        ...mockOrderItems([initialProducts[6]], [1]),
        status: 'Cancelled',
        date: new Date(new Date().getTime() - 86400000 * 4),
        paymentMethod: 'Manual Transfer',
        deliveryMethod: 'Home Delivery',
    },
];

export const initialUsers: User[] = [
    {
        id: 1,
        name: 'Store Owner',
        email: 'HINDGENERALSTORE', // special login
        password: 'NAYAGAON9',
        role: 'owner',
        walletBalance: 0,
        hasWallet: false,
    },
    {
        id: 2,
        name: 'Wholesaler One',
        email: 'wholesaler@example.com',
        password: 'password123',
        role: 'wholesaler',
        hasCredit: true, // This customer has Khata access
        creditLimit: 50000,
        khataDueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        walletBalance: 0,
        hasWallet: true,
        mobile: '555-555-5555',
        shopName: 'My Big Shop',
        address: '789 Wholesale Market, My Town',
        pincode: '45680',
        notificationPreferences: { orderStatus: true, promotions: true, newProducts: false },
        notifications: [],
    },
    {
        id: 3,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123',
        role: 'retailer',
        walletBalance: 150.75,
        hasWallet: true,
        address: '123 Reading Ln, Bookville',
        pincode: '45678',
        notificationPreferences: { orderStatus: true, promotions: true, newProducts: true },
        notifications: []
    },
    {
        id: 4,
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123',
        role: 'retailer',
        hasCredit: false,
        creditLimit: 0,
        walletBalance: 0,
        hasWallet: false,
        notificationPreferences: { orderStatus: true, promotions: false, newProducts: false },
    },
];

export const initialCoupons: Coupon[] = [
    { code: 'HIND50', type: 'fixed', value: 50, minOrderValue: 250, isActive: true },
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 100, isActive: true },
    { code: 'FREEDEL', type: 'fixed', value: 40, isActive: false },
    { code: 'ALICEONLY', type: 'fixed', value: 100, minOrderValue: 500, isActive: true, userId: 3 },
];

export const initialSupportTickets: SupportTicket[] = [
    {
        id: `ticket_${new Date().getTime() - 900000}`,
        userId: 2,
        userName: 'Wholesaler One',
        subject: 'Question about my Khata balance',
        status: 'In Progress',
        createdAt: new Date(new Date().getTime() - 900000),
        updatedAt: new Date(new Date().getTime() - 800000),
        messages: [
            { author: 'user', text: 'Hi, I see a discrepancy in my Khata balance. Can you please check?', date: new Date(new Date().getTime() - 900000) },
            { author: 'admin', adminName: 'Store Owner', text: 'Hi, we are looking into this for you and will get back shortly.', date: new Date(new Date().getTime() - 800000) },
        ]
    },
    {
        id: `ticket_${new Date().getTime() - 1200000}`,
        userId: 3,
        userName: 'Alice Johnson',
        subject: 'Return request for expired product',
        status: 'Open',
        createdAt: new Date(new Date().getTime() - 1200000),
        updatedAt: new Date(new Date().getTime() - 1200000),
        messages: [
            { author: 'user', text: 'The oil I received is past its expiry date. I would like to request a return or exchange.', date: new Date(new Date().getTime() - 1200000) },
        ]
    }
];

export const initialExpenses: Expense[] = [
    {
        id: `exp_${new Date().getTime() - 86400000 * 5}`,
        date: new Date(new Date().getTime() - 86400000 * 5),
        description: 'Monthly Shop Rent',
        amount: 15000,
        category: 'Rent',
    },
    {
        id: `exp_${new Date().getTime() - 86400000 * 3}`,
        date: new Date(new Date().getTime() - 86400000 * 3),
        description: 'Electricity Bill',
        amount: 2500,
        category: 'Utilities',
    },
    {
        id: `exp_${new Date().getTime() - 86400000 * 2}`,
        date: new Date(new Date().getTime() - 86400000 * 2),
        description: 'Purchase of new stock from supplier',
        amount: 35000,
        category: 'Stock Purchase',
    },
];