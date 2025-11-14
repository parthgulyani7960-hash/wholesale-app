import React from 'react';

const FAQItem: React.FC<{ question: string, children: React.ReactNode }> = ({ question, children }) => (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
        <h3 className="font-bold text-xl lg:text-2xl text-primary mb-3">{question}</h3>
        <div className="text-gray-700 space-y-4 text-base lg:text-lg leading-relaxed">{children}</div>
    </div>
);

const HelpView: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-center mb-4 text-primary">Help & FAQs</h1>
            <p className="text-center text-gray-600 mb-12">Find answers to common questions below.</p>
            
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <FAQItem question="How does the Manual Payment process work?">
                    <p>It's simple! Follow these steps:</p>
                    <ol className="list-decimal list-inside pl-4 space-y-2">
                        <li>Select "Manual Transfer (UPI/Bank)" at checkout.</li>
                        <li>Place your order. You will see our payment details (UPI ID, Bank Account, QR Code).</li>
                        <li>Complete the payment using your preferred payment app (GPay, PhonePe, etc.).</li>
                        <li>Take a screenshot of the successful payment confirmation.</li>
                        <li>On the checkout success screen or in your Order History, upload the screenshot.</li>
                        <li>That's it! We will verify the payment and update your order status to "Approved".</li>
                    </ol>
                </FAQItem>
                
                <FAQItem question="How do I track my order?">
                     <p>You can track the status of your order in real-time by visiting the "My Orders" section of the app. You'll see a timeline showing whether your order is 'Approved', 'Packed', 'Out for Delivery', or 'Delivered'. You will also receive notifications (if enabled) as your order status changes.</p>
                </FAQItem>

                <FAQItem question="What is the Customer Wallet?">
                    <p>The Customer Wallet is a feature that allows you to store money in your account for quick and easy payments. Any refunds from cancelled orders can be added to your wallet, and you can use the balance to pay for future purchases.</p>
                    <p>The wallet feature is currently available for select customers. If you don't see a wallet balance in your "My Account" section, please contact us through the "Support" page to inquire about enabling it for your account.</p>
                </FAQItem>
                
                <FAQItem question="What are your delivery hours and charges?">
                    <p>We deliver from 9:00 AM to 9:00 PM every day. You can select your preferred time slot during checkout.</p>
                    <p>Delivery is free for all orders above ₹500. A nominal fee of ₹40 is charged for orders below that amount.</p>
                </FAQItem>

                <FAQItem question="What is your return policy?">
                    <p>We have a hassle-free 3-day return policy for most items. If a product is damaged, incorrect, or not up to your standards, please contact us via WhatsApp or phone within 3 days of delivery.</p>
                    <p>Please note that certain items, like perishable goods or custom orders, may not be eligible for returns.</p>
                </FAQItem>

                <FAQItem question="How does the 'Khata' (Store Credit) system work?">
                    <p>The 'Khata' system is an invitation-only credit facility for our long-term, trusted customers. If you are eligible, we will manually activate it for your account from our admin panel.</p>
                    <p>Once activated, you will see a "Pay on Khata" option at checkout. You can check your credit limit, available balance, and payment due date in the "My Account" section of the app.</p>
                </FAQItem>

                 <FAQItem question="How do I reset my password?">
                    <p>Currently, our app does not have an automated password reset feature. If you forget your password, please contact us directly via the phone number or WhatsApp link available on the "Contact" page. We will assist you in securely resetting your account access.</p>
                </FAQItem>
                 
                 <FAQItem question="Is my personal information secure?">
                    <p>Absolutely. We take your privacy and security very seriously. We use industry-standard practices to protect your data. For more detailed information, please read our full <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.</p>
                </FAQItem>
            </div>
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default HelpView;